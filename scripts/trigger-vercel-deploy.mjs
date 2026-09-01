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
const commitSha = process.argv[2]?.trim() ?? "2661ccc9210d414009b3c96f0f020676d11e4be3";

const deployResponse = await fetch(`https://api.vercel.com/v13/deployments?${teamQuery}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "rax-cut-co",
    project: projectId,
    target: "production",
    gitSource: {
      type: "github",
      repoId: 1351994732,
      ref: "master",
      sha: commitSha,
    },
  }),
});

const body = await deployResponse.json();
if (!deployResponse.ok) {
  console.error("Deploy failed:", JSON.stringify(body));
  process.exit(1);
}

console.log("Production deploy triggered");
console.log(`URL: https://${body.url}`);
console.log(`State: ${body.readyState ?? body.status}`);
console.log(`Commit: ${commitSha.slice(0, 7)}`);
