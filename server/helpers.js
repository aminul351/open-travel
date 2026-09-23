// Server-side validation + shared helpers for the Express API.

const SERVICE_TYPES = new Set(["HOTEL", "TRANSPORTATION", "PACKAGE"]);
const CURRENCIES = new Set(["USD", "EUR", "GBP"]);

function slugify(value) {
  return (
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "service"
  ).slice(0, 64);
}

// Validates service input (create + update). Returns { error } or { data }.
function validateServiceInput(body) {
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const type = String(body.type ?? "").trim();
  const location = String(body.location ?? "").trim();
  const currency = String(body.currency ?? "USD").trim().toUpperCase();
  const price = Number(String(body.price ?? "").trim());
  const imageUrl = String(body.imageUrl ?? "").trim();
  const featured = body.featured === true || body.featured === "on";

  if (!title) return { error: "Title is required." };
  if (title.length > 200)
    return { error: "Title must be 200 characters or fewer." };
  if (!SERVICE_TYPES.has(type))
    return { error: "Please choose a valid service type." };
  if (!description) return { error: "Description is required." };
  if (description.length > 5000)
    return { error: "Description must be 5000 characters or fewer." };
  if (!location) return { error: "Location is required." };
  if (!Number.isFinite(price) || price < 0)
    return {
      error: "Price must be a valid number greater than or equal to zero.",
    };
  if (price > 1_000_000) return { error: "Price looks too high." };
  if (!CURRENCIES.has(currency))
    return { error: "Currency must be USD, EUR, or GBP." };
  if (imageUrl && !/^https?:\/\/.+/.test(imageUrl))
    return { error: "Image URL must start with http:// or https://." };

  const details = { location };

  const parseIntField = (name) => {
    const raw = String(body[name] ?? "").trim();
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  };

  if (type === "HOTEL") {
    const address = String(body.address ?? "").trim();
    const checkIn = String(body.checkIn ?? "").trim();
    const checkOut = String(body.checkOut ?? "").trim();
    const roomsAvailable = parseIntField("roomsAvailable");
    if (address) details.address = address;
    if (checkIn) details.checkIn = checkIn;
    if (checkOut) details.checkOut = checkOut;
    if (roomsAvailable !== null) {
      if (roomsAvailable < 0 || roomsAvailable > 1_000_000)
        return { error: "Rooms available must be a valid number." };
      details.roomsAvailable = roomsAvailable;
    }
  }

  if (type === "TRANSPORTATION") {
    const vehicleType = String(body.vehicleType ?? "").trim();
    const from = String(body.from ?? "").trim();
    const to = String(body.to ?? "").trim();
    const capacity = parseIntField("capacity");
    if (vehicleType) details.vehicleType = vehicleType;
    if (from) details.from = from;
    if (to) details.to = to;
    if (capacity !== null) {
      if (capacity < 1 || capacity > 500)
        return { error: "Capacity must be a valid number of seats." };
      details.capacity = capacity;
    }
  }

  if (type === "PACKAGE") {
    const durationDays = parseIntField("durationDays");
    const durationNights = parseIntField("durationNights");
    const groupSizeMax = parseIntField("groupSizeMax");
    if (durationDays !== null) {
      if (durationDays < 1 || durationDays > 365)
        return { error: "Duration (days) must be a valid number." };
      details.durationDays = durationDays;
    }
    if (durationNights !== null) {
      if (durationNights < 0 || durationNights > 365)
        return { error: "Duration (nights) must be a valid number." };
      details.durationNights = durationNights;
    }
    if (groupSizeMax !== null) {
      if (groupSizeMax < 1 || groupSizeMax > 1000)
        return { error: "Max group size must be a valid number." };
      details.groupSizeMax = groupSizeMax;
    }
  }

  return {
    data: {
      title,
      description,
      type,
      price,
      currency,
      location,
      imageUrl: imageUrl || null,
      featured,
      details,
    },
  };
}

function assertInternal(req, res, next) {
  const key = process.env.INTERNAL_API_KEY;
  const provided = req.get("x-internal-key");
  if (!key || provided !== key) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function requireUser(req, res, next) {
  const userId = req.get("x-user-id");
  const role = req.get("x-user-role");
  if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
    return res.status(401).json({ error: "Unauthenticated" });
  }
  req.userId = userId;
  req.userRole = String(role ?? "").toUpperCase();
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.userRole !== role) {
      return res.status(403).json({ error: `This action requires the ${role} role.` });
    }
    next();
  };
}

module.exports = {
  slugify,
  validateServiceInput,
  assertInternal,
  requireUser,
  requireRole,
};