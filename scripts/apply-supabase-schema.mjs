import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const schemaPath = path.resolve("supabase/schema.sql");
const dbUrl = process.env.SUPABASE_DB_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL (or DATABASE_URL) in .env.local.");
  console.error("Copy the URI from Supabase → Project Settings → Database → Connection string (URI).");
  console.error("Then run: npm run apply-supabase-schema");
  process.exit(1);
}

console.log("Applying supabase/schema.sql via direct database connection...\n");

const result = spawnSync(
  "npx",
  ["supabase", "db", "query", "-f", schemaPath, "--db-url", dbUrl, "--yes"],
  { stdio: "inherit", shell: true, env: process.env }
);

process.exit(result.status ?? 1);
