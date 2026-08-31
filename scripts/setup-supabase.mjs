import fs from "node:fs";
import path from "node:path";

const schemaPath = path.resolve("supabase/schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");
const envPath = path.resolve(".env.local");
const projectUrl = process.argv[2]?.trim();

function upsertEnv(key, value) {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `${key}=${value}\n`, "utf8");
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split("\n");
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

  fs.writeFileSync(envPath, `${next.join("\n").replace(/\n*$/, "\n")}`, "utf8");
}

console.log("RAX Cut Co. — Supabase setup\n");

if (projectUrl) {
  upsertEnv("NEXT_PUBLIC_SUPABASE_URL", projectUrl);
  const ref = projectUrl.replace(/^https:\/\//, "").replace(/\.supabase\.co\/?$/, "");
  console.log(`Saved project URL to .env.local:\n  ${projectUrl}\n`);
  console.log(`SQL Editor (paste supabase/schema.sql and Run):\n  https://supabase.com/dashboard/project/${ref}/sql/new\n`);
  console.log("Next: npm run verify-supabase\n");
} else {
  console.log("Optional: pass your project URL to save it locally:");
  console.log("  npm run setup-supabase -- https://YOUR_REF.supabase.co\n");
}

console.log("1. In Supabase Dashboard → SQL Editor, run:");
console.log(`   ${schemaPath}\n`);
console.log("2. Ensure .env.local has:");
console.log("   NEXT_PUBLIC_SUPABASE_URL");
console.log("   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
console.log("   SUPABASE_SECRET_KEY\n");
console.log("3. Add the same three vars to Vercel → Settings → Environment Variables\n");
console.log("4. Run: npm run verify-supabase\n");
console.log("--- SQL preview ---\n");
console.log(schema);
