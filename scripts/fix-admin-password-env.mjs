import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.resolve(".env.local");
const PASSWORD = process.argv[2]?.trim();

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

const token = process.env.VERCEL_ACCESS_TOKEN?.trim();
const projectId = process.env.VERCEL_PROJECT_ID?.trim();
const teamId = process.env.VERCEL_TEAM_ID?.trim();

if (!token || !projectId || !PASSWORD) {
  console.error("Usage: node scripts/fix-admin-password-env.mjs <password>");
  console.error("Requires VERCEL_ACCESS_TOKEN and VERCEL_PROJECT_ID in .env.local");
  process.exit(1);
}

const teamQuery = teamId ? `teamId=${encodeURIComponent(teamId)}&` : "";

const listResponse = await fetch(
  `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/env?${teamQuery}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

if (!listResponse.ok) {
  console.error("Unable to list env vars:", await listResponse.text());
  process.exit(1);
}

const envs = (await listResponse.json()).envs ?? [];

const adminVars = envs.filter((entry) => entry.key === "ADMIN_PASSWORD");
console.log(`Found ${adminVars.length} ADMIN_PASSWORD entries`);

for (const entry of adminVars) {
  const deleteResponse = await fetch(
    `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/env/${entry.id}?${teamQuery}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );
  if (!deleteResponse.ok) {
    console.error("Delete failed:", entry.id, await deleteResponse.text());
    process.exit(1);
  }
}

const query = new URLSearchParams({ upsert: "true" });
if (teamId) query.set("teamId", teamId);

const createResponse = await fetch(
  `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env?${query}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: "ADMIN_PASSWORD",
      value: PASSWORD,
      type: "encrypted",
      target: ["production", "preview"],
    }),
  }
);

if (!createResponse.ok) {
  console.error("Create failed:", await createResponse.text());
  process.exit(1);
}

console.log("ADMIN_PASSWORD reset to a single production + preview entry");
