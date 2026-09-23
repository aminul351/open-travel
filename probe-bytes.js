const fs = require("fs");
const p = "C:/projects/open travel/server/index.js";
const buf = fs.readFileSync(p);
const text = buf.toString("utf8");
const lines = text.split(/\r?\n/);
console.log("LINES=" + lines.length);
for (let i = 0; i < lines.length && i < 60; i++) {
  console.log(String(i + 1) + ": " + lines[i]);
}
