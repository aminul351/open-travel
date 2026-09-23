const { Router } = require("express");
const { getDb, OID, serialize } = require("../db");

const router = Router();

// Resolve (and if needed, auto-create) the customer profile for a signed-in
// customer, keyed by x-user-id — never by client input.
async function getOrCreateCustomer(db, userId) {
  const customer = await db
    .collection("customer_profiles")
    .findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
  return customer?.value ?? customer;
}

// GET /api/customer/dashboard — customer + bookings (with service + agency).
router.get("/dashboard", async (req, res) => {
  const db = getDb();
  // Auto-create a missing profile so a logged-in customer never 404s (e.g.
  // legacy users or registrations that predate profile creation).
  const found = await getOrCreateCustomer(db, req.userId);

  const customerId = found._id.toHexString();
  const bookings = await db
    .collection("bookings")
    .find({ customerId })
    .sort({ createdAt: -1 })
    .toArray();

  for (const booking of bookings) {
    const service = await db
      .collection("services")
      .findOne({ _id: OID(booking.serviceId) });
    if (service) {
      const agency = await db
        .collection("agencies")
        .findOne({ _id: OID(service.agencyId) }, { projection: { name: 1 } });
      service.agency = agency ?? null;
    }
    booking.service = service ?? null;
  }

  res.json({
    customer: serialize(found),
    bookings: serialize(bookings),
  });
});

// POST /api/customer/bookings — book a PUBLISHED service.
router.post("/bookings", async (req, res) => {
  const db = getDb();

  const serviceId = String(req.body.serviceId ?? "").trim();
  const rawDate = String(req.body.travelDate ?? "").trim();
  const numTravelers = Number(req.body.numTravelers ?? "1");
  const specialRequests =
    String(req.body.specialRequests ?? "").trim() || null;

  if (!/^[0-9a-fA-F]{24}$/.test(serviceId)) {
    return res.status(400).json({ error: "Please choose a valid service." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return res.status(400).json({ error: "Please pick a valid travel date." });
  }
  const travelDate = new Date(`${rawDate}T00:00:00.000Z`);
  if (Number.isNaN(travelDate.getTime())) {
    return res.status(400).json({ error: "Please pick a valid travel date." });
  }
  if (!Number.isInteger(numTravelers) || numTravelers < 1 || numTravelers > 100) {
    return res
      .status(400)
      .json({ error: "Traveler count must be between 1 and 100." });
  }

  const service = await db.collection("services").findOne({ _id: OID(serviceId) });
  if (!service || service.status !== "PUBLISHED") {
    return res
      .status(400)
      .json({ error: "This service is not available for booking." });
  }

  const customer = await getOrCreateCustomer(db, req.userId);
  const totalPrice = service.price * numTravelers;
  const now = new Date();

  let booking;
  for (let attempt = 0; attempt < 3; attempt++) {
    const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
    const doc = {
      bookingNumber,
      serviceId: service._id.toHexString(),
      agencyId: service.agencyId,
      customerId: customer._id.toHexString(),
      status: "PENDING",
      paymentStatus: "UNPAID",
      totalPrice,
      currency: service.currency,
      travelDate,
      numTravelers,
      specialRequests,
      createdAt: now,
      updatedAt: now,
    };
    try {
      const result = await db.collection("bookings").insertOne(doc);
      doc._id = result.insertedId;
      booking = doc;
      break;
    } catch (err) {
      // Retry only on the unique bookingNumber index collision.
      if (err && err.code === 11000 && attempt < 2) continue;
      throw err;
    }
  }

  res.status(201).json({ booking: serialize(booking) });
});

// POST /api/customer/bookings/:id/cancel — cancel an unpaid pending booking.
router.post("/bookings/:id/cancel", async (req, res) => {
  const db = getDb();

  const id = String(req.params.id ?? "").trim();
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(404).json({ error: "Booking not found." });
  }

  // Ownership is resolved from the signed-in user, never from the body.
  const customer = await getOrCreateCustomer(db, req.userId);
  const booking = await db.collection("bookings").findOne({
    _id: OID(id),
    customerId: customer._id.toHexString(),
  });
  if (!booking) {
    return res.status(404).json({ error: "Booking not found." });
  }
  if (booking.status !== "PENDING" || booking.paymentStatus !== "UNPAID") {
    return res.status(409).json({
      error:
        booking.status === "CANCELLED"
          ? "This booking is already cancelled."
          : "Only unpaid pending bookings can be cancelled.",
    });
  }

  const updated = await db.collection("bookings").findOneAndUpdate(
    { _id: booking._id, customerId: customer._id.toHexString() },
    { $set: { status: "CANCELLED", updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  res.json({ booking: serialize(updated?.value ?? updated) });
});

module.exports = router;