const { spawnSync } = require("child_process");
const fs = require("fs");
const path = "C:/projects/open travel/server/index.js";

console.log("--- node --check ---");
const r = spawnSync("node", ["--check", path], { encoding: "utf8" });
console.log("status:" + r.status);
const err = String(r.stderr || "");
const out = String(r.stdout || "");
if (err.trim()) console.log("stderr:" + err.slice(0, 2000));
if (out.trim()) console.log("stdout:" + out.slice(0, 2000));

console.log("--- first 40 lines on disk (byte-exact) ---");
const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);
for (let i = 0; i < lines.length && i < 45; i++) {
  console.log(i + 1 + ": " + lines[i]);
}

console.log("--- require lines ---");
for (const m of ["require(\"./routes/chat\")", "require(\"./routes/agency\")", "require(\"./routes/customer\")"]) {
  console.log(m + " : " + (lines.some((l) => l.includes(m)) ? "present" : "MISSING"));
}
