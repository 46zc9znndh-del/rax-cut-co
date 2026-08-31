import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.resolve(".env.local");
const CMS_PATH = path.resolve("data/cms.json");
const BASE_URL = process.argv[2] ?? "https://raxcuttingco.com";

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return;
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const cms = JSON.parse(fs.readFileSync(CMS_PATH, "utf8"));
cms.updatedAt = new Date().toISOString();

const login = await fetch(`${BASE_URL}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
});

if (!login.ok) {
  console.error("Admin login failed:", login.status);
  process.exit(1);
}

const cookie = login.headers.get("set-cookie")?.split(";")[0];
if (!cookie) {
  console.error("Missing session cookie");
  process.exit(1);
}

const save = await fetch(`${BASE_URL}/api/admin/cms`, {
  method: "PUT",
  headers: { "Content-Type": "application/json", cookie },
  body: JSON.stringify(cms),
});

if (!save.ok) {
  const body = await save.json().catch(() => ({}));
  console.error("CMS save failed:", body.error || save.status);
  process.exit(1);
}

console.log("Production CMS synced from data/cms.json");
