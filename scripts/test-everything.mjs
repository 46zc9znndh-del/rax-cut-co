import fs from "node:fs";
import path from "node:path";
import { Resend } from "resend";

const ROOT = path.resolve(".");
const ENV_PATH = path.join(ROOT, ".env.local");
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

const routes = [
  "/",
  "/shop",
  "/shop/rax-original-drip-board-bamboo",
  "/shop/rax-original-drip-board-maple",
  "/portfolio",
  "/our-story",
  "/care",
  "/guarantee",
  "/checkout",
  "/legal/privacy",
  "/legal/terms",
  "/admin",
  "/api/cms",
  "/api/newsletter/subscribe",
  "/api/webhooks/stripe",
];

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function checkRoute(route) {
  const url = `${BASE_URL.replace(/\/$/, "")}${route}`;
  try {
    const method = route.startsWith("/api/newsletter") ? "POST" : "GET";
    const init =
      method === "POST"
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "invalid" }),
          }
        : { method: "GET", redirect: "follow" };

    const response = await fetch(url, init);
    const expected =
      route === "/api/newsletter/subscribe"
        ? response.status === 400
        : route === "/api/webhooks/stripe"
          ? response.status === 400 || response.status === 405
          : response.status >= 200 && response.status < 400;

    if (expected) {
      pass(`HTTP ${route}`, String(response.status));
    } else {
      fail(`HTTP ${route}`, `status ${response.status}`);
    }
  } catch (error) {
    fail(`HTTP ${route}`, error instanceof Error ? error.message : String(error));
  }
}

async function checkCms() {
  const response = await fetch(`${BASE_URL}/api/cms`);
  if (!response.ok) {
    fail("CMS payload", `status ${response.status}`);
    return;
  }

  const cms = await response.json();
  const required = [
    "site.nav.links",
    "site.footer.tagline",
    "site.reviews.items",
    "site.storeSettings.freeShippingThreshold",
    "products",
  ];

  for (const key of required) {
    const value = key.split(".").reduce((acc, part) => acc?.[part], cms);
    const isEmptyArray = Array.isArray(value) && value.length === 0;
    if (value === undefined || (isEmptyArray && key !== "site.reviews.items")) {
      fail("CMS field", key);
    } else {
      pass("CMS field", key);
    }
  }

  if (Array.isArray(cms.products) && cms.products.length >= 2) {
    pass("Products in CMS", `${cms.products.length} products`);
  } else {
    fail("Products in CMS", "expected at least 2");
  }
}

async function checkCheckoutApi() {
  const response = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: [] }),
  });
  if (response.status === 400) {
    pass("Checkout API empty cart", "400 as expected");
  } else {
    fail("Checkout API empty cart", `status ${response.status}`);
  }

  const badQty = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ id: "rax-original-drip-bamboo", quantity: 9999 }] }),
  });
  if (badQty.status === 400) {
    pass("Checkout API inventory guard", "400 as expected");
  } else {
    fail("Checkout API inventory guard", `status ${badQty.status}`);
  }
}

async function checkAdmin() {
  const password = process.env.ADMIN_PASSWORD ?? "rax-admin";
  const login = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!login.ok) {
    fail("Admin login", `status ${login.status}`);
    return;
  }

  pass("Admin login", "authenticated");
  const cookie = login.headers.get("set-cookie");
  if (!cookie) {
    fail("Admin session cookie", "missing");
    return;
  }

  const cms = await fetch(`${BASE_URL}/api/admin/cms`, {
    headers: { cookie: cookie.split(";")[0] },
  });
  if (cms.ok) {
    pass("Admin CMS API", "loaded");
  } else {
    fail("Admin CMS API", `status ${cms.status}`);
  }

  const dashboard = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { cookie: cookie.split(";")[0] },
  });
  if (dashboard.ok) {
    const body = await dashboard.json();
    pass("Admin dashboard API", `${body.stats?.totalOrders ?? 0} orders`);
  } else {
    fail("Admin dashboard API", `status ${dashboard.status}`);
  }

  const orders = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { cookie: cookie.split(";")[0] },
  });
  if (orders.ok) {
    const body = await orders.json();
    pass("Admin orders API", `${Array.isArray(body.orders) ? body.orders.length : 0} orders`);
  } else {
    fail("Admin orders API", `status ${orders.status}`);
  }

  const emailTest = await fetch(`${BASE_URL}/api/admin/email/test`, {
    method: "POST",
    headers: { cookie: cookie.split(";")[0] },
  });
  if (emailTest.ok) {
    pass("Resend test email", "sent");
  } else {
    const body = await emailTest.json().catch(() => ({}));
    fail("Resend test email", body.error || `status ${emailTest.status}`);
  }
}

async function checkResendDomain() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    fail("Resend domain", "RESEND_API_KEY missing locally");
    return;
  }

  const resend = new Resend(apiKey);
  const domains = await resend.domains.list();
  const domain = domains.data?.data?.find((entry) => entry.name === "raxcuttingco.com");
  if (!domain) {
    fail("Resend domain", "raxcuttingco.com not found");
    return;
  }

  pass("Resend domain status", domain.status ?? "unknown");
  if (domain.status === "verified") {
    pass("Resend DNS", "domain verified — set RESEND_USE_DEV_FROM=false");
  } else if (process.env.RESEND_USE_DEV_FROM === "true") {
    pass(
      "Resend DNS",
      `pending (${domain.status}) — customer emails use onboarding@resend.dev until verified`
    );
  } else {
    fail("Resend DNS", `status ${domain.status} — add DNS records or set RESEND_USE_DEV_FROM=true`);
  }
}

async function checkSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!publishableKey) {
    fail("Supabase publishable key", "missing in .env.local");
  } else {
    pass("Supabase publishable key", "set");
  }

  if (!secretKey) {
    fail("Supabase secret key", "missing in .env.local");
  } else {
    pass("Supabase secret key", "set");
  }

  if (!url) {
    fail("Supabase project URL", "set NEXT_PUBLIC_SUPABASE_URL in .env.local and Vercel");
    return;
  }

  pass("Supabase project URL", url.replace(/^https:\/\//, ""));

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from("app_state").select("key").eq("key", "orders").maybeSingle();

    if (error) {
      if (error.message.includes("Could not find the table")) {
        fail("Supabase schema", "run supabase/schema.sql in SQL Editor");
      } else {
        fail("Supabase connection", error.message);
      }
      return;
    }

    pass("Supabase orders backend", "connected");
  } catch (error) {
    fail("Supabase connection", error instanceof Error ? error.message : String(error));
  }
}

async function checkLaunchReadiness() {
  const support = await fetch(`${BASE_URL.replace(/\/$/, "")}/account`);
  if (!support.ok) {
    fail("Support page", `status ${support.status}`);
    return;
  }

  const html = await support.text();
  if (html.includes("Demo account flow")) {
    fail("Support page", "demo copy still visible");
  } else {
    pass("Support page", "customer-ready");
  }

  const weakLogin = await fetch(`${BASE_URL.replace(/\/$/, "")}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "rax-admin" }),
  });

  if (weakLogin.status === 401) {
    pass("Production admin password", "default password rejected");
  } else if (weakLogin.ok) {
    fail("Production admin password", "still accepts rax-admin");
  } else {
    pass("Production admin password", `status ${weakLogin.status}`);
  }
}

async function checkLocalCmsFile() {
  const cmsPath = path.join(ROOT, "data", "cms.json");
  if (!fs.existsSync(cmsPath)) {
    fail("Local cms.json", "missing");
    return;
  }

  const cms = JSON.parse(fs.readFileSync(cmsPath, "utf8"));
  const keys = ["nav", "footer", "reviews", "storeSettings"];
  for (const key of keys) {
    if (cms.site?.[key]) pass("Local CMS section", key);
    else fail("Local CMS section", key);
  }
}

console.log(`\nRAX Cut Co. test suite — ${BASE_URL}\n`);

for (const route of routes) {
  await checkRoute(route);
}

await checkCms();
await checkCheckoutApi();
await checkAdmin();
await checkResendDomain();
await checkSupabase();
await checkLaunchReadiness();
await checkLocalCmsFile();

const passed = results.filter((item) => item.ok).length;
const failed = results.filter((item) => !item.ok).length;

console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
