// Byte-scan every source file for characters that cannot legitimately appear
// in code (CJK reflow debris, RTL marks, zero-width chars, etc.). Prints
// file:line:col:U+hex:visible for each offender. Sorts per file.
"use strict";
const fs = require("fs");
const path = require("path");

const roots = ["server", "src"];

// Files we never put exotic punctuation in: .js, .ts, .tsx, .mjs, .cjs, .json,
// .css, .html — excludes README/.env/.gitignore/*.md (docs can have any text).
const extensions = new Set([".js", ".ts", ".tsx", ".mjs", ".cjs", ".json", ".css"]);

// Characters that should never appear in source given our signing rule:
//  - Control chars (incl. zero-width / word-joiners / RTL marks / BOM)
//  - Non-ASCII "symbol/letter" glyphs that aren't safe ASCII identifiers
//  - We only ALLOW the standard ASCII printable range + \n \t in code files.
function offender(ch) {
  const code = ch.codePointAt(0);
  if (code === 0xfeff) return "BOM";
  if (code < 0x20 || code === 0x7f) return "CTRL";
  if (code >= 0x80) return "NON-ASCII";
  return null;
}

const results = [];
for (const root of roots) {
  const dir = path.join(__dirname, root);
  if (!fs.existsSync(dir)) continue;
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (extensions.has(path.extname(entry.name))) {
        const buf = fs.readFileSync(full);
        const text = buf.toString("utf8");
        for (let i = 0; i < text.length; i++) {
          const why = offender(text[i]);
          if (why) {
            // Compute line/col
            let line = 1, col = 1;
            for (let j = 0; j < i; j++) {
              if (text[j] === "\n") { line++; col = 1; } else col++;
            }
            const hex = text.codePointAt(i).toString(16).toUpperCase();
            const visible = text[i].replace(/[\x00-\x1f\x7f]/g, ".");
            results.push(
              `${path.relative(__dirname, full)}:${line}:${col}  U+${hex}  ${why}  [${visible}]`
            );
          }
        }
      }
    }
  })(dir);
}

if (results.length === 0) {
  console.log("CLEAN — no exotic characters in any source file.");
} else {
  console.log(`FOUND ${results.length} offender(s):`);
  for (const r of results.slice(0, 100)) console.log("  " + r);
  if (results.length > 100) console.log(`  …and ${results.length - 100} more`);
}
