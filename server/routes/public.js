const { Router } = require("express");
const { getDb, OID, serialize } = require("../db");

const router = Router();

async function attachCategory(db, tour) {
  if (!tour.categoryId) return;
  const category = await db
    .collection("categories")
    .findOne({ _id: OID(tour.categoryId) });
  tour.category = category ?? null;
}

async function buildLocationQuery(db, queryString) {
  const q = String(queryString ?? "").trim();
  if (!q) return null;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const matchingAgencies = await db
    .collection("agencies")
    .find({
      $or: [
        { name: { $regex: regex } },
        { city: { $regex: regex } },
        { country: { $regex: regex } },
      ],
    })
    .project({ _id: 1 })
    .toArray();
  const matchingAgencyIds = matchingAgencies.map((a) => a._id.toHexString());

  return {
    $or: [
      { "details.location": { $regex: regex } },
      { "details.destination": { $regex: regex } },
      { "details.country": { $regex: regex } },
      { "details.city": { $regex: regex } },
      { "details.address": { $regex: regex } },
      { "details.from": { $regex: regex } },
      { "details.to": { $regex: regex } },
      { location: { $regex: regex } },
      { title: { $regex: regex } },
      { description: { $regex: regex } },
      ...(matchingAgencyIds.length > 0 ? [{ agencyId: { $in: matchingAgencyIds } }] : []),
    ],
  };
}

// GET /api/home — dynamic agency offers/services + top categories for the landing page.
router.get("/home", async (req, res) => {
  const db = getDb();
  const filter = { status: "PUBLISHED" };
  const locationFilter = await buildLocationQuery(
    db,
    req.query.location ?? req.query.search ?? req.query.q
  );
  if (locationFilter) {
    filter.$and = [...(filter.$and || []), locationFilter];
  }

  const services = await db
    .collection("services")
    .find(filter)
    .sort({ featured: -1, createdAt: -1 })
    .limit(locationFilter ? 24 : 6)
    .toArray();

  const agencyIds = [...new Set(services.map((s) => s.agencyId).filter(Boolean))];
  const agencies = agencyIds.length
    ? await db
        .collection("agencies")
        .find(
          { _id: { $in: agencyIds.map((id) => OID(id)) } },
          { projection: { name: 1, slug: 1, verified: 1 } }
        )
        .toArray()
    : [];
  const byId = new Map(agencies.map((a) => [a._id.toHexString(), a]));
  for (const service of services) {
    service.agency = byId.get(String(service.agencyId)) ?? null;
  }

  const categories = await db
    .collection("categories")
    .find()
    .sort({ name: 1 })
    .limit(4)
    .toArray();

  res.json({
    services: serialize(services),
    featuredTours: serialize(services),
    categories: serialize(categories),
  });
});

// GET /api/tours — all published tours + categories for the browse page.
router.get("/tours", async (req, res) => {
  const db = getDb();
  const tours = await db
    .collection("tours")
    .find({ status: "PUBLISHED" })
    .sort({ createdAt: -1 })
    .toArray();
  await Promise.all(tours.map((tour) => attachCategory(db, tour)));
  const categories = await db.collection("categories").find().sort({ name: 1 }).toArray();
  res.json({ tours: serialize(tours), categories: serialize(categories) });
});

// GET /api/tours/:slug — tour detail with category + agency + agency user name.
router.get("/tours/:slug", async (req, res) => {
  const db = getDb();
  const tour = await db
    .collection("tours")
    .findOne({ slug: String(req.params.slug) });
  if (!tour || tour.status !== "PUBLISHED") {
    return res.status(404).json({ error: "Tour not found." });
  }
  await attachCategory(db, tour);
  const agency = await db
    .collection("agencies")
    .findOne({ _id: OID(tour.agencyId) });
  if (agency) {
    const user = await db
      .collection("users")
      .findOne({ _id: OID(agency.userId) }, { projection: { name: 1 } });
    agency.user = user ?? null;
    tour.agency = agency;
  }
  res.json(serialize(tour));
});

// GET /api/services — all published services from every agency (marketplace).
router.get("/services", async (req, res) => {
  const db = getDb();
  const filter = { status: "PUBLISHED" };
  const type = String(req.query.type ?? "").trim();
  if (["HOTEL", "TRANSPORTATION", "PACKAGE"].includes(type)) {
    filter.type = type;
  }

  const locationFilter = await buildLocationQuery(
    db,
    req.query.location ?? req.query.search ?? req.query.q
  );
  if (locationFilter) {
    filter.$and = [...(filter.$and || []), locationFilter];
  }

  const services = await db
    .collection("services")
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const agencyIds = [...new Set(services.map((s) => s.agencyId))];
  const agencies = agencyIds.length
    ? await db
        .collection("agencies")
        .find(
          { _id: { $in: agencyIds.map((id) => OID(id)) } },
          { projection: { name: 1, slug: 1, verified: 1 } }
        )
        .toArray()
    : [];
  const byId = new Map(agencies.map((a) => [a._id.toHexString(), a]));
  for (const service of services) {
    service.agency = byId.get(service.agencyId) ?? null;
  }

  res.json({
    services: serialize(services),
    agencies: serialize(agencies),
  });
});

// GET /api/services/:slug — single published service with its agency.
router.get("/services/:slug", async (req, res) => {
  const db = getDb();
  const service = await db
    .collection("services")
    .findOne({ slug: String(req.params.slug) });
  if (!service || service.status !== "PUBLISHED") {
    return res.status(404).json({ error: "Service not found." });
  }
  const agency = await db
    .collection("agencies")
    .findOne({ _id: OID(service.agencyId) });
  service.agency = agency ?? null;
  res.json(serialize(service));
});

module.exports = router;