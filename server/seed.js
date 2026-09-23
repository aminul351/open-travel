// Seeds the Express + MongoDB backend demo data. Uses the native mongodb
// driver directly — no ORM, no query language.

const { connect } = require("./db");

const COLLECTIONS = [
  "users",
  "customer_profiles",
  "agencies",
  "categories",
  "tours",
  "services",
  "bookings",
  "payments",
  "reviews",
];

async function main() {
  const db = await connect();

  for (const name of COLLECTIONS) {
    await db.collection(name).drop().catch(() => {});
    await db.createCollection(name);
  }
  console.log("[seed] collections reset.");

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("agencies").createIndex({ userId: 1 }, { unique: true });
  await db.collection("agencies").createIndex({ slug: 1 }, { unique: true });
  await db.collection("customer_profiles").createIndex({ userId: 1 }, { unique: true });
  await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
  await db.collection("tours").createIndex({ slug: 1 }, { unique: true });
  await db.collection("services").createIndex({ slug: 1 }, { unique: true });
  await db.collection("bookings").createIndex({ bookingNumber: 1 }, { unique: true });

  const now = new Date();
  const ts = (iso) => new Date(iso);

  // ------------------------------------------------------------------ users
  const users = await db.collection("users").insertMany([
    { name: "Site Admin", email: "admin@opentravel.com", role: "ADMIN", createdAt: now, updatedAt: now },
    {
      name: "Agency Owner",
      email: "agency@opentravel.com",
      role: "AGENCY",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Jane Traveler",
      email: "customer@opentravel.com",
      role: "CUSTOMER",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Coastal Vacations",
      email: "agency2@opentravel.com",
      role: "AGENCY",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Marco Polo",
      email: "customer2@opentravel.com",
      role: "CUSTOMER",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const ids = users.insertedIds;
  const adminId = ids[0];
  const agencyId = ids[1];
  const customerId = ids[2];
  const agency2Id = ids[3];
  const customer2Id = ids[4];

  const asHex = (oid) => oid.toHexString();

  await db.collection("agencies").insertMany([
    {
      userId: asHex(agencyId),
      name: "Summit Expeditions",
      slug: "summit-expeditions",
      description:
        "Premier adventure travel operator focusing on trekking and mountain expeditions.",
      city: "Kathmandu",
      country: "Nepal",
      website: "https://summitexpeditions.example",
      verified: true,
      ratingAvg: 0,
      ratingCount: 0,
      approvalStatus: "APPROVED",
      rejectedReason: null,
      submittedAt: ts("2026-09-01T00:00:00.000Z"),
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: asHex(agency2Id),
      name: "Coastal Vacations",
      slug: "coastal-vacations",
      description:
        "Boutique beach and island holiday specialists with hand-picked resorts.",
      city: "Phuket",
      country: "Thailand",
      website: "https://coastalvacations.example",
      verified: true,
      ratingAvg: 0,
      ratingCount: 0,
      approvalStatus: "APPROVED",
      rejectedReason: null,
      submittedAt: ts("2026-09-01T00:00:00.000Z"),
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.collection("customer_profiles").insertMany([
    {
      userId: asHex(customerId),
      phone: "+1-555-0100",
      nationality: "USA",
      preferences: { budgetRange: "mid", interests: ["trekking", "culture"] },
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: asHex(customer2Id),
      phone: "+1-555-0199",
      nationality: "Italy",
      preferences: { budgetRange: "low", interests: ["beach", "food"] },
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("[seed] users, agencies, customer profiles ready.");

  // ------------------------------------------------------------- categories
  const categoryDocs = [
    { name: "Adventure", slug: "adventure", description: "Trekking, climbing, and adrenaline.", icon: "🏔️" },
    { name: "Beach", slug: "beach", description: "Coastal getaways and island resorts.", icon: "🏖️" },
    { name: "Cultural", slug: "cultural", description: "History, heritage, and traditions.", icon: "🏛️" },
    { name: "Wildlife", slug: "wildlife", description: "Safaris and nature experiences.", icon: "🦁" },
    { name: "Luxury", slug: "luxury", description: "Premium stays and private tours.", icon: "✨" },
  ];
  const categoriesRes = await db.collection("categories").insertMany(categoryDocs);
  const categoryIds = {};
  Object.keys(categoriesRes.insertedIds).forEach((i, idx) => {
    categoryIds[categoryDocs[idx].slug] = asHex(categoriesRes.insertedIds[i]);
  });
  console.log(`[seed] categories ready (${categoryDocs.length}).`);

  // ------------------------------------------------------------------ tours
  const agencyDocs = await db.collection("agencies").find().toArray();
  const agencyByUserId = Object.fromEntries(
    agencyDocs.map((a) => [a.userId, a])
  );
  const summit = agencyByUserId[asHex(agencyId)];
  const coastal = agencyByUserId[asHex(agency2Id)];

  const tours = [
    {
      agencyId: asHex(summit._id),
      categoryId: categoryIds["adventure"],
      title: "Everest Base Camp Trek",
      slug: "everest-base-camp-trek",
      description:
        "A 16-day guided trek through the Khumbu Valley to the foot of the world's highest peak.",
      destination: "Everest Region",
      country: "Nepal",
      durationDays: 16,
      durationNights: 15,
      groupSizeMin: 4,
      groupSizeMax: 14,
      price: 2400,
      currency: "USD",
      featured: true,
      status: "PUBLISHED",
      highlights: ["Sagarmatha National Park", "Tengboche Monastery", "Views of Ama Dablam"],
      inclusions: ["Airport transfers", "Teahouse accommodation", "Licensed guides", "Permits"],
      exclusions: ["International flights", "Travel insurance", "Personal gear"],
      itinerary: [
        { day: 1, title: "Arrival in Kathmandu", description: "Welcome dinner and briefing." },
        { day: 2, title: "Fly to Lukla", description: "Scenic flight and first trek day to Phakding." },
      ],
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      agencyId: asHex(summit._id),
      categoryId: categoryIds["wildlife"],
      title: "Chitwan Safari Adventure",
      slug: "chitwan-safari-adventure",
      description:
        "A 3-day jungle safari with elephant safaris, canoe rides, and wildlife spotting in Chitwan National Park.",
      destination: "Chitwan",
      country: "Nepal",
      durationDays: 3,
      durationNights: 2,
      groupSizeMin: 2,
      groupSizeMax: 12,
      price: 450,
      currency: "USD",
      featured: false,
      status: "PUBLISHED",
      highlights: ["Jungle jeep safari", "Canoe trip on Rapti river", "Tharu culture show"],
      inclusions: ["Park fees", "Jungle activities", "Meals", "Resort stay"],
      exclusions: ["Personal expenses"],
      itinerary: [{ day: 1, title: "Boat safari", description: "Sunrise canoe ride and bird watching." }],
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      agencyId: asHex(coastal._id),
      categoryId: categoryIds["beach"],
      title: "Phi Phi Islands Escape",
      slug: "phi-phi-islands-escape",
      description:
        "Snorkeling, limestone cliffs, and crystal-clear lagoons on a 4-day island-hopping escape.",
      destination: "Phi Phi Islands",
      country: "Thailand",
      durationDays: 4,
      durationNights: 3,
      groupSizeMin: 2,
      groupSizeMax: 16,
      price: 780,
      currency: "USD",
      featured: true,
      status: "PUBLISHED",
      highlights: ["Maya Bay", "Longtail boat island hopping", "Snorkeling at Bamboo Island"],
      inclusions: ["Speedboat transfers", "3 nights resort", "Daily breakfast", "Snorkeling gear"],
      exclusions: ["Lunch", "National park entrance fee"],
      itinerary: [{ day: 1, title: "Arrival", description: "Check in and sunset at Long Beach." }],
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const toursRes = await db.collection("tours").insertMany(tours);
  const tourIds = {};
  Object.keys(toursRes.insertedIds).forEach((i) => {
    tourIds[tours[i].slug] = asHex(toursRes.insertedIds[i]);
  });

  // ---------------------------------------------------------------- services
  const services = tours.map((t) => ({
    agencyId: t.agencyId,
    categoryId: t.categoryId,
    type: "PACKAGE",
    title: t.title,
    slug: t.slug,
    description: t.description,
    price: t.price,
    currency: t.currency,
    status: "PUBLISHED",
    featured: t.featured,
    imageUrl: null,
    details: {
      destination: t.destination,
      country: t.country,
      durationDays: t.durationDays,
      durationNights: t.durationNights,
      groupSizeMin: t.groupSizeMin,
      groupSizeMax: t.groupSizeMax,
      highlights: t.highlights,
      inclusions: t.inclusions,
      exclusions: t.exclusions,
      itinerary: t.itinerary,
    },
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: now,
    updatedAt: now,
  }));
  const servicesRes = await db.collection("services").insertMany(services);
  const serviceIds = {};
  Object.keys(servicesRes.insertedIds).forEach((i) => {
    serviceIds[services[i].slug] = asHex(servicesRes.insertedIds[i]);
  });

  console.log(`[seed] tours & services ready (${tours.length}).`);

  // --------------------------------------------------------------- bookings
  const customerByUserId = Object.fromEntries(
    (await db.collection("customer_profiles").find().toArray()).map((c) => [
      c.userId,
      c,
    ])
  );

  const booking1 = {
    bookingNumber: "BK-0001",
    serviceId: serviceIds["everest-base-camp-trek"],
    agencyId: asHex(summit._id),
    customerId: asHex(customerByUserId[asHex(customerId)]._id),
    status: "CONFIRMED",
    paymentStatus: "PAID",
    totalPrice: 4800,
    currency: "USD",
    travelDate: ts("2026-10-12T00:00:00.000Z"),
    numTravelers: 2,
    specialRequests: "Vegetarian meals preferred.",
    createdAt: now,
    updatedAt: now,
  };
  const booking2 = {
    bookingNumber: "BK-0002",
    serviceId: serviceIds["phi-phi-islands-escape"],
    agencyId: asHex(coastal._id),
    customerId: asHex(customerByUserId[asHex(customer2Id)]._id),
    status: "PENDING",
    paymentStatus: "UNPAID",
    totalPrice: 780,
    currency: "USD",
    travelDate: ts("2026-11-05T00:00:00.000Z"),
    numTravelers: 1,
    createdAt: now,
    updatedAt: now,
  };

  const [b1, b2] = await db.collection("bookings").insertMany([booking1, booking2]).then((r) => [
    { ...booking1, _id: r.insertedIds[0] },
    { ...booking2, _id: r.insertedIds[1] },
  ]);

  await db.collection("payments").insertOne({
    bookingId: asHex(b1._id),
    amount: 4800,
    currency: "USD",
    method: "ONLINE",
    status: "SUCCEEDED",
    reference: "PAY-0001",
    provider: "stripe",
    paidAt: now,
    createdAt: now,
  });

  // ----------------------------------------------------------------- reviews
  await db.collection("reviews").insertOne({
    packageId: tourIds["everest-base-camp-trek"],
    customerId: (await db.collection("customer_profiles").findOne({ userId: asHex(customerId) }))._id.toHexString(),
    bookingId: asHex(b1._id),
    rating: 5,
    title: "Life-changing trek",
    comment: "The guides were phenomenal and the scenery unreal. Highly recommend!",
    status: "PUBLISHED",
    createdAt: now,
  });

  console.log("[seed] Done.");
  await db.client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});