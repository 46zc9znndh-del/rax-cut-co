import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  if (!line || line.trim().startsWith("#")) continue;
  const index = line.indexOf("=");
  if (index === -1) continue;
  env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
}

const token = env.VERCEL_ACCESS_TOKEN;
const projectId = env.VERCEL_PROJECT_ID;
const teamId = env.VERCEL_TEAM_ID;
const teamQuery = teamId ? `teamId=${encodeURIComponent(teamId)}&` : "";

const expectedSha = process.argv[2]?.trim();

for (let attempt = 0; attempt < 30; attempt += 1) {
  const response = await fetch(
    `https://api.vercel.com/v6/deployments?${teamQuery}projectId=${projectId}&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const deployment = (await response.json()).deployments?.[0];

  if (!deployment) {
    console.log("No deployment found");
    process.exit(1);
  }

  const sha = deployment.meta?.githubCommitSha?.slice(0, 7) ?? "";
  console.log(
    `${new Date().toISOString()} ${deployment.state} ${deployment.readyState} ${deployment.url} ${sha}`
  );

  const shaMatches = !expectedSha || deployment.meta?.githubCommitSha?.startsWith(expectedSha);
  if (
    shaMatches &&
    deployment.readyState === "READY" &&
    deployment.state !== "BUILDING" &&
    deployment.state !== "QUEUED"
  ) {
    process.exit(0);
  }

  if (
    deployment.readyState === "READY" ||
    deployment.state === "ERROR" ||
    deployment.state === "CANCELED"
  ) {
    process.exit(deployment.readyState === "READY" ? 0 : 1);
  }

  await new Promise((resolve) => setTimeout(resolve, 10_000));
}

process.exit(1);
