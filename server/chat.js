// Shared conversation + message helpers for the marketplace chat. Plain Mongo
// collections (no ORM), ids stringified with ".toHexString()" — consistent
// with db.js. This module only touches Mongo + serialize; route handlers do
// the role checks and the res.* responses.

const { serialize, OID } = require("./db");

// Collection names used consistently by the route handlers.
const CONVERSATIONS = "conversations";
const MESSAGES = "messages";

// Upsert the conversation that ties a customer + agency + service into one
// thread. Keyed by (customerId, agencyId, serviceId). Returns the raw doc
// (with _id) — the caller serializes the response shape.
async function ensureConversation(db, { customerId, agencyId, serviceId, bookingId }) {
  const now = new Date();
  const doc = {
    customerId,           // customer_profile hex id
    agencyId,             // agency hex id
    serviceId,            // service hex id
    bookingId: bookingId ?? null,
    customerUnread: 0,
    agencyUnread: 0,
    lastPreview: null,
    createdAt: now,
    updatedAt: now,
  };

  const found = await db.collection(CONVERSATIONS).findOneAndUpdate(
    { customerId, agencyId, serviceId },
    { $setOnInsert: doc },
    { upsert: true, returnDocument: "after" }
  );
  return found?.value ?? found;
}

// Append a message, bump the recipient's unread counter)Skip the sender's side.
async function addMessage(db, conversation, senderRole, text) {
  const now = new Date();
  const message = {
    conversationId: conversation._id.toHexString(),
    senderRole, // "CUSTOMER" or "AGENCY"
    text,
    createdAt: now,
    readAt: null,
  };
  const result = await db.collection(MESSAGES).insertOne(message);
  message._id = result.insertedId;

  await db.collection(CONVERSATIONS).updateOne(
    { _id: conversation._id },
    {
      $set: { lastPreview: text, updatedAt: now },
      $inc: senderRole === "AGENCY" ? { customerUnread: 1 } : { agencyUnread: 1 },
    }
  );

  return message;
}

// Mark all messages from the other side read for a reader role and clear that
// role's unread counter on the conversation.
async function markConversationRead(db, conversation, readerRole) {
  const other = readerRole === "AGENCY" ? "CUSTOMER" : "AGENCY";
  await db.collection(MESSAGES).updateMany(
    { conversationId: conversation._id.toHexString(), senderRole: other, readAt: null },
    { $set: { readAt: new Date() } }
  );
  await db.collection(CONVERSATIONS).updateOne(
    { _id: conversation._id },
    { $set: readerRole === "AGENCY" ? { agencyUnread: 0 } : { customerUnread: 0 } }
  );
}

// Full conversation + its messages, serialized, with the other party's name
// and service details resolved.
async function loadConversation(db, conversation, readerRole, messages) {
  const isAgency = readerRole === "AGENCY";
  const otherId = isAgency ? conversation.customerId : conversation.agencyId;
  let otherName = isAgency ? "Customer" : "Agency";

  if (isAgency) {
    const cust = await db.collection("customer_profiles").findOne({ _id: OID(otherId) });
    if (cust?.userId) {
      const user = await db
        .collection("users")
        .findOne({ _id: OID(cust.userId) }, { projection: { name: 1, email: 1 } });
      otherName = user?.name || user?.email || "Customer";
    }
  } else {
    const agency = await db
      .collection("agencies")
      .findOne({ _id: OID(otherId) }, { projection: { name: 1 } });
    if (agency?.name) otherName = agency.name;
  }

  let service = null;
  if (conversation.serviceId) {
    const s = await db.collection("services").findOne(
      { _id: OID(conversation.serviceId) },
      { projection: { title: 1, slug: 1, price: 1, currency: 1, imageUrl: 1, type: 1 } }
    );
    if (s) service = serialize(s);
  }

  return {
    ...serialize(conversation),
    otherName,
    service,
    unread: isAgency ? (conversation.agencyUnread || 0) : (conversation.customerUnread || 0),
    messages: messages ? serialize(messages) : undefined,
  };
}

// Lightweight conversation list for a role (no messages payload), each with the
// other party's name and service info.
async function listConversationsFor(db, baseField, profileHex) {
  const conversations = await db
    .collection(CONVERSATIONS)
    .find({ [baseField]: profileHex })
    .sort({ updatedAt: -1 })
    .toArray();

  if (conversations.length === 0) return [];

  const isAgency = baseField === "agencyId";
  const otherIds = [
    ...new Set(
      conversations
        .map((c) => (isAgency ? c.customerId : c.agencyId))
        .map((id) => OID(id))
        .filter(Boolean)
    ),
  ];
  const serviceIds = [
    ...new Set(
      conversations
        .map((c) => c.serviceId)
        .map((id) => OID(id))
        .filter(Boolean)
    ),
  ];

  const otherNameMap = new Map();
  if (isAgency && otherIds.length > 0) {
    const custs = await db
      .collection("customer_profiles")
      .find({ _id: { $in: otherIds } })
      .toArray();
    const userIds = [...new Set(custs.map((c) => OID(c.userId)).filter(Boolean))];
    const users = userIds.length
      ? await db
          .collection("users")
          .find({ _id: { $in: userIds } }, { projection: { name: 1 } })
          .toArray()
      : [];
    const userMap = new Map(users.map((u) => [u._id.toHexString(), u.name]));
    for (const cust of custs) {
      const name = cust.userId ? userMap.get(cust.userId) : null;
      if (name) otherNameMap.set(cust._id.toHexString(), name);
    }
  } else if (!isAgency && otherIds.length > 0) {
    const ags = await db
      .collection("agencies")
      .find({ _id: { $in: otherIds } }, { projection: { name: 1 } })
      .toArray();
    for (const ag of ags) {
      if (ag.name) otherNameMap.set(ag._id.toHexString(), ag.name);
    }
  }

  const serviceMap = new Map();
  if (serviceIds.length > 0) {
    const srvs = await db
      .collection("services")
      .find(
        { _id: { $in: serviceIds } },
        { projection: { title: 1, slug: 1, price: 1, currency: 1, imageUrl: 1, type: 1 } }
      )
      .toArray();
    for (const s of srvs) {
      serviceMap.set(s._id.toHexString(), serialize(s));
    }
  }

  return conversations.map((conversation) => {
    const otherId = String(isAgency ? conversation.customerId : conversation.agencyId);
    const otherName = otherNameMap.get(otherId) || (isAgency ? "Customer" : "Agency");
    const service = conversation.serviceId ? serviceMap.get(String(conversation.serviceId)) ?? null : null;
    const out = serialize(conversation);
    out.otherName = otherName;
    out.service = service;
    out.unread = isAgency ? (conversation.agencyUnread || 0) : (conversation.customerUnread || 0);
    return out;
  });
}

module.exports = {
  ensureConversation,
  addMessage,
  markConversationRead,
  loadConversation,
  listConversationsFor,
};
