// Marketplace chat REST routes (both roles). Ownership and role are derived
// strictly from req.userId + req.userRole set by the requireUser middleware.
const { Router } = require("express");
const { getDb, OID, serialize } = require("../db");
const {
  ensureConversation,
  addMessage,
  markConversationRead,
  loadConversation,
  listConversationsFor,
} = require("../chat");

const router = Router();

function bad(res, status, message) {
  return res.status(status).json({ error: message });
}

// Profile collection + ownership field for a role. Collection names match db.js
// usage elsewhere in the server (agencies / customer_profiles).
function roleMeta(role) {
  return role === "AGENCY"
    ? { collection: "agencies", ownField: "agencyId", otherField: "customerId" }
    : { collection: "customer_profiles", ownField: "customerId", otherField: "agencyId" };
}

async function profileFor(db, userId, role) {
  if (role === "CUSTOMER") {
    const customer = await db.collection("customer_profiles").findOneAndUpdate(
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
  return db.collection("agencies").findOne({ userId });
}

// GET /api/chat/conversations — the signed-in role's thread list, newest first.
router.get("/conversations", async (req, res) => {
  const db = getDb();
  const profile = await profileFor(db, req.userId, req.userRole);
  if (!profile) {
    return bad(res, 404, "Profile not found. Complete registration first.");
  }
  const { ownField } = roleMeta(req.userRole);
  const conversations = await listConversationsFor(db, ownField, profile._id.toHexString());
  res.json({ conversations });
});

// GET /api/chat/conversations/:id — one thread + messages; marks it read for
// the signed-in role. The participant check is inside loadConversation via
// readerRole + own profile ownership verified here first.
router.get("/conversations/:id", async (req, res) => {
  const db = getDb();
  const profile = await profileFor(db, req.userId, req.userRole);
  if (!profile) {
    return bad(res, 404, "Profile not found. Complete registration first.");
  }

  let conversation;
  try {
    conversation = await db
      .collection("conversations")
      .findOne({ _id: OID(String(req.params.id ?? "")) });
  } catch {
    return bad(res, 404, "Conversation not found.");
  }
  if (!conversation) {
    return bad(res, 404, "Conversation not found.");
  }

  const { ownField } = roleMeta(req.userRole);
  const convOwn = String(conversation[ownField] ?? "");
  if (convOwn !== profile._id.toHexString()) {
    return bad(res, 403, "You don't have access to this conversation.");
  }

  const messages = await db
    .collection("messages")
    .find({ conversationId: conversation._id.toHexString() })
    .sort({ createdAt: 1 })
    .toArray();

  await markConversationRead(db, conversation, req.userRole);

  const loaded = await loadConversation(
    db,
    conversation,
    req.userRole,
    messages
  );
  res.json({ conversation: loaded });
});

// POST /api/chat/conversations — open a thread with an agency about a service.
// Body: { serviceId, text? }. Only customers start threads; the agency profile
// is resolved from the service — never from client input.
router.post("/conversations", async (req, res) => {
  const db = getDb();
  const profile = await profileFor(db, req.userId, req.userRole);
  if (!profile) {
    return bad(res, 404, "Profile not found. Complete registration first.");
  }

  const serviceId = String(req.body.serviceId ?? "").trim();
  const text = String(req.body.text ?? "").trim();
  if (!/^[0-9a-fA-F]{24}$/.test(serviceId)) {
    return bad(res, 400, "Please choose a valid service.");
  }

  const service = await db.collection("services").findOne({ _id: OID(serviceId) });
  if (!service) {
    return bad(res, 404, "Service not found.");
  }
  const agencyId = typeof service.agencyId === "object" && service.agencyId?.toHexString
    ? service.agencyId.toHexString()
    : String(service.agencyId ?? "");
  const customerId = profile._id.toHexString();

  const conversation = await ensureConversation(db, {
    customerId,
    agencyId,
    serviceId: service._id.toHexString(),
    bookingId: null,
  });

  if (text) {
    await addMessage(db, conversation, req.userRole, text);
  }

  const loaded = await loadConversation(db, conversation, req.userRole, []);
  res.status(201).json({ conversation: loaded });
});

// POST /api/chat/conversations/:id/messages — append to a thread you belong to.
router.post("/conversations/:id/messages", async (req, res) => {
  const db = getDb();
  const profile = await profileFor(db, req.userId, req.userRole);
  if (!profile) {
    return bad(res, 404, "Profile not found. Complete registration first.");
  }

  const text = String(req.body.text ?? "").trim();
  if (!text) {
    return bad(res, 400, "Message is required.");
  }

  const conversation = await db
    .collection("conversations")
    .findOne({ _id: OID(String(req.params.id ?? "")) });
  if (!conversation) {
    return bad(res, 404, "Conversation not found.");
  }

  const { ownField } = roleMeta(req.userRole);
  const convOwn = String(conversation[ownField] ?? "");
  if (convOwn !== profile._id.toHexString()) {
    return bad(res, 403, "You don't have access to this conversation.");
  }

  const message = await addMessage(db, conversation, req.userRole, text);
  res.status(201).json({ message: serialize(message) });
});

module.exports = router;
