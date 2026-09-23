const { spawnSync } = require("child_process");
const fs = require("fs");
const path = "C:/projects/open travel/server/index.js";

console.log("--- node --check ---");
const r = spawnSync("node", ["--check", path], { encoding: "utf8" });
console.log("status:" + r.status);
console.log(String(r.stdout));
console.log(String(r.stderr));

console.log("--- chat references in index.js ---");
const text = fs.readFileSync(path, "utf8");
for (const [label, pat] of [
  ["chatRoutes require", /require\(["']\.\/routes\/chat["']\)/],
  ["chat mount", /app\.use\(["']\/api\/chat["']/],
  ["agency mount", /agencyRoutes/],
  ["customer mount", /customerRoutes/],
  ["admin mount", /adminRoutes/],
]) {
  console.log(label + ": " + (pat.test(text) ? "present" : "MISSING"));
}
