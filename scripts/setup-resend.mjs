import fs from "node:fs";
import path from "node:path";
import { Resend } from "resend";

const ROOT = path.resolve(".");
const ENV_PATH = path.join(ROOT, ".env.local");
const DOMAIN = "raxcuttingco.com";
const SEGMENT_NAME = "RAX Crew";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

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

  if (!found) next.push(`${key}=${value}`);

  fs.writeFileSync(
    ENV_PATH,
    `${next.filter((line, i, arr) => !(i === arr.length - 1 && line === "")).join("\n")}\n`,
    "utf8"
  );
}

loadEnvFile(ENV_PATH);

const apiKey = process.env.RESEND_API_KEY ?? process.argv[2];
const adminEmail = process.env.RESEND_ADMIN_EMAIL ?? process.argv[3];

if (!apiKey) {
  console.error("Usage: RESEND_API_KEY=re_xxx RESEND_ADMIN_EMAIL=you@email.com npm run setup-resend");
  console.error("   or: npm run setup-resend -- re_xxx you@email.com");
  process.exit(1);
}

if (!adminEmail) {
  console.error("Missing RESEND_ADMIN_EMAIL (your inbox for new order alerts).");
  process.exit(1);
}

const resend = new Resend(apiKey);

console.log("Setting up Resend for", DOMAIN);

const domains = await resend.domains.list();
let domain = domains.data?.data?.find((entry) => entry.name === DOMAIN);

if (!domain) {
  const created = await resend.domains.create({ name: DOMAIN, region: "us-east-1" });
  if (created.error) {
    console.error("Domain create failed:", created.error.message);
    process.exit(1);
  }
  domain = created.data;
  console.log("Created domain:", DOMAIN);
} else {
  console.log("Domain already exists:", DOMAIN);
}

const segments = await resend.segments.list();
let segment = segments.data?.data?.find((entry) => entry.name === SEGMENT_NAME);

if (!segment) {
  const created = await resend.segments.create({ name: SEGMENT_NAME });
  if (created.error) {
    console.error("Segment create failed:", created.error.message);
    process.exit(1);
  }
  segment = created.data;
  console.log("Created segment:", SEGMENT_NAME);
} else {
  console.log("Segment already exists:", SEGMENT_NAME);
}

upsertEnv("RESEND_API_KEY", apiKey);
upsertEnv("RESEND_FROM_EMAIL", `RAX Cut Co. <orders@${DOMAIN}>`);
upsertEnv("RESEND_ADMIN_EMAIL", adminEmail);
upsertEnv("RESEND_REPLY_TO_EMAIL", `hello@${DOMAIN}`);
upsertEnv("RESEND_SEGMENT_ID", segment?.id ?? "");

const dnsPath = path.join(ROOT, "data", "resend-dns.json");
fs.mkdirSync(path.dirname(dnsPath), { recursive: true });

const domainDetails = await resend.domains.get(domain?.id ?? "");
if (domainDetails.data) {
  fs.writeFileSync(dnsPath, `${JSON.stringify(domainDetails.data, null, 2)}\n`, "utf8");
  console.log("");
  console.log("Saved DNS records to data/resend-dns.json");
  console.log("Add these records in Porkbun for email sending:");
  for (const record of domainDetails.data.records ?? []) {
    console.log(`- ${record.type} ${record.name}.${DOMAIN} -> ${record.value}`);
  }
}

console.log("");
console.log("Saved to .env.local:");
console.log("- RESEND_API_KEY");
console.log("- RESEND_FROM_EMAIL=orders@" + DOMAIN);
console.log("- RESEND_ADMIN_EMAIL=" + adminEmail);
console.log("- RESEND_REPLY_TO_EMAIL=hello@" + DOMAIN);
console.log("- RESEND_SEGMENT_ID=" + (segment?.id ?? ""));
console.log("");
console.log("Until DNS verifies, test sends may fail from orders@" + DOMAIN + ".");
console.log("Temporarily set RESEND_FROM_EMAIL=RAX Cut Co. <onboarding@resend.dev> for testing.");
