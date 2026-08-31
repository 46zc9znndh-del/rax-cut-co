import fs from "node:fs";
import path from "node:path";
import Stripe from "stripe";

const ROOT = path.resolve(".");
const ENV_PATH = path.join(ROOT, ".env.local");
const PRODUCTION_SITE_URL = "https://raxcuttingco.com";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
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

  if (!found) {
    next.push(`${key}=${value}`);
  }

  fs.writeFileSync(ENV_PATH, `${next.filter((line, i, arr) => !(i === arr.length - 1 && line === "")).join("\n")}\n`, "utf8");
}

loadEnvFile(ENV_PATH);

const secretKey = process.env.STRIPE_SECRET_KEY;
const siteUrlArg = process.argv[2];
const siteUrl = siteUrlArg ?? PRODUCTION_SITE_URL;
const webhookUrl = `${siteUrl.replace(/\/$/, "")}/api/webhooks/stripe`;

if (!secretKey) {
  console.error("Missing STRIPE_SECRET_KEY in .env.local");
  process.exit(1);
}

const stripe = new Stripe(secretKey);
const events = ["checkout.session.completed"];

const existing = await stripe.webhookEndpoints.list({ limit: 100 });
const stale = existing.data.filter(
  (endpoint) =>
    endpoint.url.includes("/api/webhooks/stripe") &&
    (endpoint.url.includes("vercel.app") || endpoint.url !== webhookUrl)
);

for (const endpoint of stale) {
  console.log("Removing old webhook endpoint:", endpoint.url);
  await stripe.webhookEndpoints.del(endpoint.id);
}

const current = existing.data.find((endpoint) => endpoint.url === webhookUrl);
if (current) {
  console.log("Webhook already configured:", webhookUrl);
  console.log("Endpoint ID:", current.id);
  process.exit(0);
}

const created = await stripe.webhookEndpoints.create({
  url: webhookUrl,
  enabled_events: events,
  description: "RAX Cut Co. — raxcuttingco.com order notifications",
});

if (!created.secret) {
  console.error("Webhook created but no signing secret returned.");
  process.exit(1);
}

upsertEnv("STRIPE_WEBHOOK_SECRET", created.secret);

console.log("Stripe webhook configured");
console.log("URL:", webhookUrl);
console.log("Events:", events.join(", "));
console.log("Endpoint ID:", created.id);
console.log("Saved STRIPE_WEBHOOK_SECRET to .env.local");
