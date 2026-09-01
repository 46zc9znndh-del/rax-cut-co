import fs from "node:fs";
import path from "node:path";

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

const results = [];
const testIp = `127.0.0.1-test-${Date.now()}`;

function testHeaders(extra = {}) {
  return { "x-forwarded-for": testIp, ...extra };
}

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function adminFetch(route, init = {}, cookie) {
  const headers = { ...(init.headers ?? {}), cookie };
  return fetch(`${BASE_URL.replace(/\/$/, "")}${route}`, { ...init, headers });
}

async function login() {
  const password = process.env.ADMIN_PASSWORD ?? "rax-admin";
  const response = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: testHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    fail("Admin login", `status ${response.status}`);
    return null;
  }

  pass("Admin login");
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) {
    fail("Admin session cookie", "missing");
    return null;
  }

  pass("Admin session cookie");
  return cookie;
}

function clone(value) {
  return structuredClone(value);
}

async function stressCms(cookie) {
  const initial = await adminFetch("/api/admin/cms", {}, cookie);
  if (!initial.ok) {
    fail("Load CMS", `status ${initial.status}`);
    return;
  }

  const { cms: original } = await initial.json();
  pass("Load CMS");

  const unauthorized = await fetch(`${BASE_URL}/api/admin/cms`, { method: "PUT", body: "{}" });
  if (unauthorized.status === 401) {
    pass("CMS PUT unauthorized", "401 as expected");
  } else {
    fail("CMS PUT unauthorized", `status ${unauthorized.status}`);
  }

  const badPayload = await adminFetch(
    "/api/admin/cms",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: 1 }),
    },
    cookie
  );
  if (badPayload.status === 400) {
    pass("CMS PUT invalid payload", "400 as expected");
  } else {
    fail("CMS PUT invalid payload", `status ${badPayload.status}`);
  }

  const draft = clone(original);
  const stamp = `stress-${Date.now()}`;
  draft.site.portfolio.page.headline = stamp;
  draft.site.footer.tagline = `${stamp} footer`;
  draft.site.storeSettings.freeShippingThreshold = 151;
  draft.site.nav.links[0].label = `${stamp} Shop`;
  draft.products[0].images = ["/images/board-maple.jpg", "/images/board-counter.jpg"];
  draft.products[0].tagline = `${stamp} maple`;
  draft.products[0].inventory = 499;

  const save = await adminFetch(
    "/api/admin/cms",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    },
    cookie
  );

  if (!save.ok) {
    const body = await save.json().catch(() => ({}));
    fail("CMS PUT stress save", body.error || `status ${save.status}`);
    return;
  }

  pass("CMS PUT stress save");

  const reload = await adminFetch("/api/admin/cms", {}, cookie);
  const { cms: saved } = await reload.json();

  const checks = [
    ["portfolio headline", saved.site.portfolio.page.headline, stamp],
    ["footer tagline", saved.site.footer.tagline, `${stamp} footer`],
    ["shipping threshold", saved.site.storeSettings.freeShippingThreshold, 151],
    ["nav label", saved.site.nav.links[0].label, `${stamp} Shop`],
    ["maple image", saved.products[0].images[0], "/images/board-maple.jpg"],
    ["maple tagline", saved.products[0].tagline, `${stamp} maple`],
    ["maple inventory", saved.products[0].inventory, 499],
  ];

  for (const [label, actual, expected] of checks) {
    if (actual === expected) pass("CMS round-trip", label);
    else fail("CMS round-trip", `${label} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }

  const publicCms = await fetch(`${BASE_URL}/api/cms`);
  if (publicCms.ok) {
    const live = await publicCms.json();
    if (live.site.portfolio.page.headline === stamp) {
      pass("Public CMS reflects save", "portfolio headline");
    } else {
      fail("Public CMS reflects save", live.site.portfolio.page.headline);
    }
  } else {
    fail("Public CMS fetch", `status ${publicCms.status}`);
  }

  const restorePayload = clone(original);
  restorePayload.site.portfolio.page.headline = "Boards in Action";
  restorePayload.products[0].images = ["/images/board-maple.jpg", "/images/board-drawer.jpg"];

  const restore = await adminFetch(
    "/api/admin/cms",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restorePayload),
    },
    cookie
  );

  if (!restore.ok) {
    fail("CMS restore", `status ${restore.status}`);
    return;
  }

  pass("CMS restore final content");

  const verify = await adminFetch("/api/admin/cms", {}, cookie);
  const { cms: final } = await verify.json();
  if (
    final.site.portfolio.page.headline === "Boards in Action" &&
    final.products[0].images[0] === "/images/board-maple.jpg"
  ) {
    pass("CMS final state", "portfolio + product images");
  } else {
    fail("CMS final state", "unexpected values after restore");
  }
}

async function stressAdminApis(cookie) {
  const routes = [
    ["/api/admin/dashboard", "dashboard"],
    ["/api/admin/orders", "orders"],
  ];

  for (const [route, label] of routes) {
    const response = await adminFetch(route, {}, cookie);
    if (response.ok) pass(`Admin ${label} API`);
    else fail(`Admin ${label} API`, `status ${response.status}`);
  }

  const badLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: testHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ password: `wrong-password-${Date.now()}` }),
  });
  if (badLogin.status === 401) pass("Admin bad login", "401 as expected");
  else fail("Admin bad login", `status ${badLogin.status}`);

  const logout = await adminFetch("/api/admin/logout", { method: "POST" }, cookie);
  if (logout.ok) pass("Admin logout");
  else fail("Admin logout", `status ${logout.status}`);

  const blocked = await fetch(`${BASE_URL}/api/admin/cms`);
  if (blocked.status === 401) pass("CMS blocked after logout", "401 as expected");
  else fail("CMS blocked after logout", `status ${blocked.status}`);
}

async function checkProductImages() {
  const response = await fetch(`${BASE_URL}/api/cms`);
  if (!response.ok) {
    fail("Product image audit", `status ${response.status}`);
    return;
  }

  const cms = await response.json();
  const portfolioImages = new Set(cms.site.portfolio.items.map((item) => item.image));
  const productImages = cms.products.flatMap((product) => product.images);
  const overlap = productImages.filter((image) => portfolioImages.has(image));

  if (overlap.length === 0) {
    pass("Product image audit", "no portfolio gallery overlap");
  } else {
    fail("Product image audit", `overlap: ${overlap.join(", ")}`);
  }

  if (cms.site.portfolio.page.headline !== "Portfolio") {
    pass("Portfolio headline", cms.site.portfolio.page.headline);
  } else {
    fail("Portfolio headline", 'still generic "Portfolio"');
  }
}

console.log(`\nRAX Cut Co. admin stress test — ${BASE_URL}\n`);

const cookie = await login();
if (cookie) {
  await stressCms(cookie);
  await stressAdminApis(cookie);
}

await checkProductImages();

const passed = results.filter((item) => item.ok).length;
const failed = results.filter((item) => item.ok === false).length;

console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
