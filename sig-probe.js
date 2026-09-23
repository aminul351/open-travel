const fs = require("fs");
const p = "C:/projects/open travel/server/chat.js";
const src = fs.readFileSync(p, "utf8");
const sigs = [];
const lines = src.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/\basync\s+function\s+(\w+)\s*\(([^)]*)\)/);
  if (m) sigs.push(`${i + 1}: ${m[0]}`);
}
console.log(sigs.join("\n"));
