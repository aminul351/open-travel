// Byte-token probe: what does index.js reference, what does helpers.js export?
const fs = require("fs");
const root = "C:/projects/open travel";

function tokens(file) {
  const src = fs.readFileSync(file, "utf8");
  // Rough but safe extractor: identifiers only, keep unique in order.
  const m = src.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) ?? [];
  return [...new Set(m)];
}

const idx = tokens(root + "/server/index.js");
const helpers = tokens(root + "/server/helpers.js");

const usedInIndex = idx.filter((t) =>
  ["assertInternal", "requireUser", "requireRole", "requireRole"].includes(t)
);

console.log("USED_IN_INDEX:", usedInIndex.join(" "));
console.log("HELPERS_EXPORTS:", helpers.join(" ").length > 0 ? "see below" : "none");

// Print lines of helpers.js that mention module.exports area and their raw bytes.
const src = fs.readFileSync(root + "/server/helpers.js", "utf8");
const report = [];
for (const [i, line] of src.split(/\r?\n/).entries()) {
  if (/\bmodule\.exports\b|\bassertInternal\b/.test(line)) {
    report.push(`${i + 1}: ${line}`);
  }
}
console.log("HELPERS_HIGHLIGHTS:");
for (const r of report) console.log("  " + r);
