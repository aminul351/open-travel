const express = require("express");
const { connect } = require("./db");
const { assertInternal } = require("./helpers");

const publicRoutes = require("./routes/public");
const sessionRoutes = require("./routes/session");
const agencyRoutes = require("./routes/agency");
const customerRoutes = require("./routes/customer");
const adminRoutes = require("./routes/admin");
const chatRoutes = require("./routes/chat");

async function start() {
  await connect();
  console.log("[server] connected to MongoDB");

  const app = express();
  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api", assertInternal);

  app.use("/api", publicRoutes);
  app.use("/api", sessionRoutes);

  const { requireUser, requireRole } = require("./helpers");
  app.use("/api/agency", requireUser, requireRole("AGENCY"), agencyRoutes);
  app.use("/api/customer", requireUser, requireRole("CUSTOMER"), customerRoutes);
  app.use("/api/admin", requireUser, requireRole("ADMIN"), adminRoutes);
  app.use("/api/chat", requireUser, chatRoutes);

  const port = Number(process.env.PORT) || 4000;
  const host = process.env.HOST || "0.0.0.0";
  app.listen(port, host, () => {
    console.log(`[server] API listening on http://${host}:${port}`);
  });

  return app;
}

if (require.main === module) {
  start().catch((err) => {
    console.error("[server] failed to start:", err);
    process.exit(1);
  });
}

module.exports = { start };
