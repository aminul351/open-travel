const { Router } = require("express");
const { getDb, OID, serialize } = require("../db");

const router = Router();

// GET /api/admin/dashboard — platform stats + recent signups + pending reviews.
router.get("/dashboard", async (req, res) => {
  const db = getDb();

  const [userCount, agencyCount, tourCount, bookingCount, paidBookings] =
    await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("users").countDocuments({ role: "AGENCY" }),
      db.collection("tours").countDocuments(),
      db.collection("bookings").countDocuments(),
      db
        .collection("bookings")
        .find({ paymentStatus: "PAID", status: { $ne: "CANCELLED" } })
        .project({ totalPrice: 1 })
        .toArray(),
    ]);

  const recentUsers = await db
    .collection("users")
    .find({})
    .sort({ createdAt: -1 })
    .limit(8)
    .toArray();

  const pendingReviews = await db
    .collection("reviews")
    .find({ status: "PENDING" })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  if (pendingReviews.length > 0) {
    const packageIds = [...new Set(pendingReviews.map((r) => OID(r.packageId)).filter(Boolean))];
    const tours = packageIds.length
      ? await db
          .collection("tours")
          .find({ _id: { $in: packageIds } }, { projection: { title: 1 } })
          .toArray()
      : [];
    const tourMap = new Map(tours.map((t) => [t._id.toHexString(), t]));
    for (const review of pendingReviews) {
      review.tourPackage = tourMap.get(String(review.packageId)) ?? null;
      delete review.packageId;
    }
  }

  const revenue = paidBookings.reduce(
    (sum, booking) => sum + Number(booking.totalPrice),
    0
  );

  res.json({
    userCount,
    agencyCount,
    tourCount,
    bookingCount,
    recentUsers: serialize(recentUsers),
    pendingReviews: serialize(pendingReviews),
    revenue,
  });
});

// GET /api/admin/agencies — every agency with its owner, newest first.
router.get("/agencies", async (req, res) => {
  const db = getDb();
  const agencies = await db
    .collection("agencies")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const userIds = [...new Set(agencies.map((a) => OID(a.userId)).filter(Boolean))];
  const users = userIds.length
    ? await db
        .collection("users")
        .find(
          { _id: { $in: userIds } },
          { projection: { name: 1, email: 1 } }
        )
        .toArray()
    : [];
  const userMap = new Map(users.map((u) => [u._id.toHexString(), u]));
  const withOwners = agencies.map((agency) => ({
    ...agency,
    owner: userMap.get(String(agency.userId)) ?? null,
  }));

  res.json({ agencies: serialize(withOwners) });
});

async function updateApproval(agencyId, patch) {
  const updated = await getDb()
    .collection("agencies")
    .findOneAndUpdate(
      { _id: OID(agencyId) },
      { $set: patch },
      { returnDocument: "after" }
    );
  return updated?.value ?? updated;
}

// POST /api/admin/agencies/:id/approve — allow the agency to publish services.
router.post("/agencies/:id/approve", async (req, res) => {
  const agency = await updateApproval(req.params.id, {
    approvalStatus: "APPROVED",
    rejectedReason: null,
    updatedAt: new Date(),
  });
  if (!agency) return res.status(404).json({ error: "Agency not found." });
  res.json({ ok: true, agency: serialize(agency) });
});

// POST /api/admin/agencies/:id/reject — block publishing until re-approved.
router.post("/agencies/:id/reject", async (req, res) => {
  const reason = String(req.body?.reason ?? "").trim().slice(0, 500) || null;
  const agency = await updateApproval(req.params.id, {
    approvalStatus: "REJECTED",
    rejectedReason: reason,
    updatedAt: new Date(),
  });
  if (!agency) return res.status(404).json({ error: "Agency not found." });
  res.json({ ok: true, agency: serialize(agency) });
});

module.exports = router;