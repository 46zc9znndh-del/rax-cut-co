import { createClient } from "@supabase/supabase-js";
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

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  (process.env.SUPABASE_PROJECT_REF
    ? `https://${process.env.SUPABASE_PROJECT_REF.trim()}.supabase.co`
    : "");
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

if (!url || !secretKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_PROJECT_REF) and SUPABASE_SECRET_KEY.");
  console.error("Then run supabase/schema.sql in the SQL Editor first.");
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const cmsPath = path.resolve("data/cms.json");
const cms = JSON.parse(fs.readFileSync(cmsPath, "utf8"));

const { error: cmsError } = await supabase.from("cms_documents").upsert({
  id: "main",
  payload: cms,
  updated_at: cms.updatedAt ?? new Date().toISOString(),
});

if (cmsError) {
  console.error("CMS bootstrap failed:", cmsError.message);
  console.error("Did you run supabase/schema.sql?");
  process.exit(1);
}

const { error: ordersError } = await supabase
  .from("app_state")
  .select("key")
  .eq("key", "orders")
  .maybeSingle();

if (ordersError) {
  console.error("Orders state check failed:", ordersError.message);
  process.exit(1);
}

console.log("Supabase bootstrap OK");
console.log(`Project: ${url}`);
console.log("Seeded CMS from data/cms.json");
