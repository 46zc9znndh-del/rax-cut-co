import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const ENV_PATH = path.join(ROOT, ".env.local");
const PRODUCTION_SITE_URL = "https://raxcuttingco.com";

function upsertEnv(key, value) {
  const lines = fs.existsSync(ENV_PATH)
    ? fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)
    : [];

  let found = false;
  const next = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    next.push(`${key}=${value}`);
  }

  fs.writeFileSync(ENV_PATH, `${next.filter((line, i, arr) => !(i === arr.length - 1 && line === "")).join("\n")}\n`, "utf8");
}

upsertEnv("NEXT_PUBLIC_SITE_URL", PRODUCTION_SITE_URL);
console.log("Updated NEXT_PUBLIC_SITE_URL to", PRODUCTION_SITE_URL);
