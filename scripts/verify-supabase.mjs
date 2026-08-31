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
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  (process.env.SUPABASE_PROJECT_REF
    ? `https://${process.env.SUPABASE_PROJECT_REF.trim()}.supabase.co`
    : undefined);
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

console.log("RAX Cut Co. — Supabase verify\n");

if (!url) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  console.error("Copy it from Supabase → Project Settings → API → Project URL");
  process.exit(1);
}

if (!secretKey) {
  console.error("Missing SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.from("app_state").select("key, value").eq("key", "orders");

if (error) {
  if (error.message.includes("Could not find the table")) {
    console.error("Connected to Supabase, but tables are missing.");
    console.error("Run supabase/schema.sql in the Supabase SQL Editor, then retry.");
    process.exit(1);
  }

  console.error("Supabase connection failed:", error.message);
  console.error("Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY match the same project.");
  process.exit(1);
}

console.log("Supabase connection OK");
console.log(`Project URL: ${url}`);
console.log(`Publishable key set: ${publishableKey ? "yes" : "no"}`);
console.log(`Orders counter: ${JSON.stringify(data?.[0]?.value ?? null)}`);
