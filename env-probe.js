const fs = require("fs");
const path = require("path");

const root = "C:/projects/open travel";
const envFile = path.join(root, ".env");
const env = fs.readFileSync(envFile, "utf8");
const hasDb = /DATABASE_URL\s*=\s*\S+/.test(env);
const hasKey = /INTERNAL_API_KEY\s*=\s*\S+/.test(env);
console.log("DATABASE_URL present:", hasDb);
console.log("INTERNAL_API_KEY present:", hasKey);

for (const name of ["express", "mongodb", "next", "react", "lucide-react"]) {
  const p = path.join(root, name === "next" || name === "react" || name === "lucide-react"
    ? "node_modules" : "server/node_modules", name);
  // next/react live at repo root node_modules; server deps at server/node_modules
  console.log(name, fs.existsSync(path.join(root, "node_modules", name)),
    fs.existsSync(path.join(root, "server", "node_modules", name)));
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
console.log("next version:", pkg.devDependencies?.next ?? pkg.dependencies?.next);
