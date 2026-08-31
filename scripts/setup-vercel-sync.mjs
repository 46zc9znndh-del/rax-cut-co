import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const ROOT = path.resolve(".");
const ENV_PATH = path.join(ROOT, ".env.local");
const PROJECT_NAME = process.argv[2]?.trim() || "rax-cut-co";
const TEAM_SLUG = process.argv[3]?.trim() || "nauti16";

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
  fs.writeFileSync(ENV_PATH, `${next.join("\n").replace(/\n*$/, "\n")}`, "utf8");
}

function readCliToken() {
  const candidates = [
    path.join(os.homedir(), ".local", "share", "com.vercel.cli", "auth.json"),
    path.join(
      process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
      "xdg.data",
      "com.vercel.cli",
      "auth.json"
    ),
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const auth = JSON.parse(fs.readFileSync(candidate, "utf8"));
    const token = auth.token || auth.credentials?.[0]?.token;
    if (token) return token;
  }

  return process.env.VERCEL_ACCESS_TOKEN?.trim();
}

loadEnvFile(ENV_PATH);

const token = readCliToken();
if (!token) {
  console.error("No Vercel token found. Run `npx vercel login` or set VERCEL_ACCESS_TOKEN.");
  process.exit(1);
}

const teamsResponse = await fetch("https://api.vercel.com/v2/teams", {
  headers: { Authorization: `Bearer ${token}` },
});

if (!teamsResponse.ok) {
  console.error("Unable to list Vercel teams.");
  process.exit(1);
}

const teams = (await teamsResponse.json())?.teams ?? [];
const team = teams.find((entry) => entry.slug === TEAM_SLUG || entry.name === TEAM_SLUG);
const teamId = team?.id;

const projectQuery = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
const projectResponse = await fetch(
  `https://api.vercel.com/v9/projects/${encodeURIComponent(PROJECT_NAME)}${projectQuery}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

if (!projectResponse.ok) {
  console.error(`Unable to find Vercel project "${PROJECT_NAME}".`);
  process.exit(1);
}

const project = await projectResponse.json();
const projectId = project.id ?? PROJECT_NAME;

async function upsertVercelEnv(key, value) {
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
        target: ["production", "preview"],
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${key}: ${body}`);
  }
}

console.log(`Configuring Vercel sync for ${PROJECT_NAME}${teamId ? ` (${TEAM_SLUG})` : ""}`);

await upsertVercelEnv("VERCEL_ACCESS_TOKEN", token);
await upsertVercelEnv("VERCEL_PROJECT_ID", projectId);
if (teamId) {
  await upsertVercelEnv("VERCEL_TEAM_ID", teamId);
}

upsertEnv("VERCEL_ACCESS_TOKEN", token);
upsertEnv("VERCEL_PROJECT_ID", projectId);
if (teamId) upsertEnv("VERCEL_TEAM_ID", teamId);

console.log("");
console.log("Saved locally and on Vercel:");
console.log("- VERCEL_ACCESS_TOKEN");
console.log("- VERCEL_PROJECT_ID=" + projectId);
if (teamId) console.log("- VERCEL_TEAM_ID=" + teamId);
console.log("");
console.log("Redeploy production once, then use Admin → Settings to change password and email.");
