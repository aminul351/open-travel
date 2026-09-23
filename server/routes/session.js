const { Router } = require("express");
const { getDb, OID, serialize } = require("../db");

const router = Router();

function slugify(text) {
  return (
    String(text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "agency"
  );
}

async function ensureProfile(db, user) {
  const now = new Date();
  if (user.role === "CUSTOMER") {
    await db.collection("customer_profiles").updateOne(
      { userId: user._id.toHexString() },
      { $setOnInsert: { userId: user._id.toHexString(), createdAt: now, updatedAt: now } },
      { upsert: true }
    );
  } else if (user.role === "AGENCY") {
    const name = user.agencyName || user.name || (user.email ?? "").split("@")[0];
    await db.collection("agencies").updateOne(
      { userId: user._id.toHexString() },
      {
        $setOnInsert: {
          userId: user._id.toHexString(),
          name,
          slug: `${slugify(name)}-${Date.now().toString(36)}`,
          description: null,
          city: null,
          country: null,
          verified: false,
          ratingAvg: 0,
          ratingCount: 0,
          approvalStatus: "PENDING",
          rejectedReason: null,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true }
    );
  }
}

// POST /api/users/upsert — find or create the user (and role profile) by email.
// Called by the login flow after Firebase verifies the ID token.
router.post("/users/upsert", async (req, res) => {
  const db = getDb();
  const email = String(req.body.email ?? "").toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "Email is required." });

  const now = new Date();
  const users = db.collection("users");

  let user = await users.findOne({ email });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const role = req.body.role === "AGENCY" ? "AGENCY" : "CUSTOMER";
    const name = String(req.body.name ?? "").trim() || email.split("@")[0];
    const result = await users.insertOne({
      name,
      email,
      image: req.body.image ?? null,
      emailVerified: req.body.emailVerified ? new Date(req.body.emailVerified) : null,
      role,
      agencyName: String(req.body.agencyName ?? "").trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
    user = await users.findOne({ _id: result.insertedId });
    // New users need their role profile straight away (customer_profiles /
    // agencies), otherwise their dashboard 404s on first login.
    await ensureProfile(db, user);
  } else {
    await ensureProfile(db, user);
  }

  res.json({
    user: serialize({
      id: user._id.toHexString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    }),
    isNewUser,
  });
});

// POST /api/users/ensure-profile — make sure the role profile exists for a
// returning user (login on an account that registered under a different role).
router.post("/users/ensure-profile", async (req, res) => {
  const db = getDb();
  const { userId, role } = req.body;
  if (!userId || !role) return res.status(400).json({ error: "userId and role are required." });
  const user = await db.collection("users").findOne({ _id: OID(userId) });
  if (!user) return res.status(404).json({ error: "User not found." });
  user.role = role;
  await ensureProfile(db, user);
  res.json({ ok: true });
});

module.exports = router;