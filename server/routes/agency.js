const { Router } = require("express");
const { getDb, OID, serialize } = require("../db");
const { slugify, validateServiceInput } = require("../helpers");

const router = Router();

// Requires the signed-in agency profile (resolved from x-user-id, never from
// the client body). Every route below uses this, so a customer cannot craft an
// agencyId and touch another agency's data.
async function requireAgency(req, res) {
  const db = getDb();
  const agency = await db
    .collection("agencies")
    .findOne({ userId: req.userId });
  return agency;
}

async function uniqueSlug(db, base) {
  const exists = await db.collection("services").findOne({ slug: base });
  if (!exists) return base;
  for (let n = 2; n < 10000; n++) {
    const candidate = `${base}-${n}`;
    const found = await db.collection("services").findOne({ slug: candidate });
    if (!found) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function ownedService(db, agency, serviceId) {
  const _id = OID(serviceId);
  if (!_id) return null;
  return db.collection("services").findOne({ _id, agencyId: agency._id.toHexString() });
}

async function ownedBooking(db, agency, bookingId) {
  const _id = OID(bookingId);
  if (!_id) return null;
  return db.collection("bookings").findOne({ _id, agencyId: agency._id.toHexString() });
}

function error(res, status, message) {
  return res.status(status).json({ error: message });
}

// GET /api/agency/profile
router.get("/profile", async (req, res) => {
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");
  res.json({ agency: serialize(agency) });
});

// GET /api/agency/dashboard — agency + services + bookings (+ nested names).
router.get("/dashboard", async (req, res) => {
  const db = getDb();
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");

  const agencyId = agency._id.toHexString();
  const services = await db
    .collection("services")
    .find({ agencyId })
    .sort({ createdAt: -1 })
    .toArray();

  const bookings = await db
    .collection("bookings")
    .find({ agencyId })
    .sort({ createdAt: -1 })
    .toArray();

  for (const booking of bookings) {
    const service = await db.collection("services").findOne(
      { _id: OID(booking.serviceId) },
      { projection: { title: 1, slug: 1 } }
    );
    booking.service = service ?? null;
    const customer = await db
      .collection("customer_profiles")
      .findOne({ _id: OID(booking.customerId) });
    if (customer) {
      const user = await db
        .collection("users")
        .findOne({ _id: OID(customer.userId) }, { projection: { name: 1, email: 1 } });
      customer.user = user ?? null;
    }
    booking.customer = customer ?? null;
  }

  res.json({
    agency: serialize(agency),
    services: serialize(services),
    bookings: serialize(bookings),
  });
});

// GET /api/agency/services?type=HOTEL
router.get("/services", async (req, res) => {
  const db = getDb();
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");

  const filter = { agencyId: agency._id.toHexString() };
  const type = String(req.query.type ?? "").trim();
  if (["HOTEL", "TRANSPORTATION", "PACKAGE"].includes(type)) {
    filter.type = type;
  }

  const services = await db
    .collection("services")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ agency: serialize(agency), services: serialize(services) });
});

// GET /api/agency/services/:id — single service with ownership check.
router.get("/services/:id", async (req, res) => {
  const db = getDb();
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");

  const service = await ownedService(db, agency, req.params.id);
  if (!service) return error(res, 404, "Service not found.");

  res.json({ service: serialize(service) });
});

// POST /api/agency/services — always created as a draft.
router.post("/services", async (req, res) => {
  const db = getDb();
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");

  const { data, err } = validateServiceInput(req.body ?? {});
  if (err) return error(res, 400, err);

  const slug = await uniqueSlug(db, slugify(data.title));
  const now = new Date();
  const doc = {
    agencyId: agency._id.toHexString(),
    categoryId: null,
    type: data.type,
    title: data.title,
    slug,
    description: data.description,
    price: data.price,
    currency: data.currency,
    status: req.body?.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    featured: data.featured,
    imageUrl: data.imageUrl,
    details: data.details,
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection("services").insertOne(doc);
  doc._id = result.insertedId;

  res.status(201).json({ service: serialize(doc) });
});

// PUT /api/agency/services/:id — ownership-checked update (status untouched).
router.put("/services/:id", async (req, res) => {
  const db = getDb();
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");

  const service = await ownedService(db, agency, req.params.id);
  if (!service) return error(res, 404, "Service not found.");

  const { data, err } = validateServiceInput(req.body ?? {});
  if (err) return error(res, 400, err);

  const updated = await db.collection("services").findOneAndUpdate(
    { _id: service._id, agencyId: agency._id.toHexString() },
    {
      $set: {
        type: data.type,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency,
        featured: data.featured,
        imageUrl: data.imageUrl,
        details: data.details,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  res.json({ service: serialize(updated?.value ?? updated) });
});

// DELETE /api/agency/services/:id — blocked if the service has bookings.
router.delete("/services/:id", async (req, res) => {
  const db = getDb();
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");

  const service = await ownedService(db, agency, req.params.id);
  if (!service) return error(res, 404, "Service not found.");

  const bookings = await db
    .collection("bookings")
    .countDocuments({ serviceId: service._id.toHexString() });
  if (bookings > 0) {
    return error(res, 409, "This service has bookings and can't be deleted.");
  }

  await db
    .collection("conversations")
    .updateMany(
      { serviceId: service._id.toHexString() },
      { $set: { serviceId: null } }
    );
  await db.collection("services").deleteOne({ _id: service._id });

  res.json({ ok: true });
});

// POST /api/agency/bookings/:id/accept — confirm a pending booking.
router.post("/bookings/:id/accept", async (req, res) => {
  const db = getDb();
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");

  const booking = await ownedBooking(db, agency, req.params.id);
  if (!booking) return error(res, 404, "Booking not found.");
  if (booking.status !== "PENDING") {
    return error(
      res,
      409,
      booking.status === "CONFIRMED"
        ? "This booking is already confirmed."
        : "Only pending bookings can be confirmed."
    );
  }

  const updated = await db.collection("bookings").findOneAndUpdate(
    { _id: booking._id, agencyId: agency._id.toHexString() },
    { $set: { status: "CONFIRMED", updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  res.json({ booking: serialize(updated?.value ?? updated) });
});

// POST /api/agency/bookings/:id/decline — reject a pending booking.
router.post("/bookings/:id/decline", async (req, res) => {
  const db = getDb();
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");

  const booking = await ownedBooking(db, agency, req.params.id);
  if (!booking) return error(res, 404, "Booking not found.");
  if (booking.status !== "PENDING") {
    return error(
      res,
      409,
      booking.status === "DECLINED"
        ? "This booking is already declined."
        : "Only pending bookings can be declined."
    );
  }

  const updated = await db.collection("bookings").findOneAndUpdate(
    { _id: booking._id, agencyId: agency._id.toHexString() },
    { $set: { status: "DECLINED", updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  res.json({ booking: serialize(updated?.value ?? updated) });
});

// POST /api/agency/services/:id/publish — only for APPROVED agencies.
router.post("/services/:id/publish", async (req, res) => {
  const db = getDb();
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");

  if (agency.approvalStatus !== "APPROVED") {
    return error(res, 403, "Your agency must be approved before you can publish services.");
  }

  const service = await ownedService(db, agency, req.params.id);
  if (!service) return error(res, 404, "Service not found.");

  const updated = await db.collection("services").findOneAndUpdate(
    { _id: service._id, agencyId: agency._id.toHexString() },
    { $set: { status: "PUBLISHED", updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  res.json({ service: serialize(updated?.value ?? updated) });
});

// POST /api/agency/services/:id/unpublish — returns to draft.
router.post("/services/:id/unpublish", async (req, res) => {
  const db = getDb();
  const agency = await requireAgency(req, res);
  if (!agency) return error(res, 404, "Agency profile not found. Complete agency registration first.");

  const service = await ownedService(db, agency, req.params.id);
  if (!service) return error(res, 404, "Service not found.");

  const updated = await db.collection("services").findOneAndUpdate(
    { _id: service._id, agencyId: agency._id.toHexString() },
    { $set: { status: "DRAFT", updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  res.json({ service: serialize(updated?.value ?? updated) });
});

module.exports = router;