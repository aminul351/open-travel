const fs = require("fs");
const path = require("path");

const root = "C:/projects/open travel/server";
const routeFile = path.join(root, "routes", "chat.js");

console.log("routes/chat.js exists on disk:", fs.existsSync(routeFile));
if (fs.existsSync(routeFile)) {
  const lines = fs.readFileSync(routeFile, "utf8").split(/\r?\n/);
  console.log("line count:", lines.length);
  for (const needle of ["router.get", "router.post", "module.exports"]) {
    const n = lines.filter((l) => l.includes(needle)).length;
    console.log(needle + " occurrences:", n);
  }
}

// Also: do public/customer/agency/admin route files exist so the app really boots?
for (const name of ["public", "session", "agency", "customer", "admin", "chat"]) {
  const p = path.join(root, "routes", name + ".js");
  console.log(name + ":", fs.existsSync(p));
}
