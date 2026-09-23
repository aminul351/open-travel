require("dotenv").config({
  path: require("node:path").join(__dirname, "..", ".env"),
});

const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

const uri = process.env.DATABASE_URL;
if (!uri) {
  throw new Error("DATABASE_URL is not set. Add it to .env");
}

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let database = null;

async function connect() {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  database = client.db();
  return database;
}

function getDb() {
  if (!database) throw new Error("Database not connected. Call connect() first.");
  return database;
}

// Type-safe ObjectId helper.
function OID(value) {
  if (value instanceof ObjectId) return value;
  if (typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value)) {
    return new ObjectId(value);
  }
  return null;
}

function withId(doc) {
  if (!doc) return null;
  const out = { ...doc };
  if (out._id) {
    out.id = out._id.toHexString();
  }
  delete out._id;
  return out;
}

// Recursively convert _id/ObjectId references into plain "id" strings so the
// front-end gets the same shapes it used to get from the ORM.
function serialize(value) {
  if (value instanceof ObjectId) return value.toHexString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object" && value.constructor === Object) {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = serialize(value[key]);
    }
    if (out._id) {
      out.id = out._id;
      delete out._id;
    }
    return out;
  }
  return value;
}

module.exports = { connect, getDb, OID, withId, serialize, ObjectId };