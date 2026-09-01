import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.resolve(".env.local");

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const env = {};
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return env;
}

const SKIP = new Set(["VERCEL_ACCESS_TOKEN"]);

const SYNC_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_ADMIN_EMAIL",
  "RESEND_REPLY_TO_EMAIL",
  "RESEND_SEGMENT_ID",
  "RESEND_USE_DEV_FROM",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
];

const env = loadEnv();
const token = env.VERCEL_ACCESS_TOKEN;
const projectId = env.VERCEL_PROJECT_ID;
const teamId = env.VERCEL_TEAM_ID;

if (!token || !projectId) {
  console.error("Missing VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID in .env.local");
  process.exit(1);
}

const teamQuery = teamId ? `teamId=${encodeURIComponent(teamId)}&` : "";

async function listEnv() {
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/env?${teamQuery}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()).envs ?? [];
}

async function upsert(key, value) {
  const envs = await listEnv();
  for (const entry of envs.filter((item) => item.key === key)) {
    await fetch(
      `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/env/${entry.id}?${teamQuery}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
  }

  const query = new URLSearchParams({ upsert: "true" });
  if (teamId) query.set("teamId", teamId);

  const response = await fetch(
    `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env?${query}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value,
        type: "encrypted",
        target: ["production", "preview", "development"],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`${key}: ${await response.text()}`);
  }
}

console.log("Syncing .env.local → Vercel (production + preview + development)\n");

let synced = 0;
let skipped = 0;

for (const key of SYNC_KEYS) {
  if (SKIP.has(key)) continue;
  const value = env[key]?.trim();
  if (!value) {
    console.log(`⊘ skip ${key} (not in .env.local)`);
    skipped += 1;
    continue;
  }
  await upsert(key, value);
  console.log(`✓ ${key}`);
  synced += 1;
}

console.log(`\nDone: ${synced} synced, ${skipped} skipped`);
