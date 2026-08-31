import "server-only";

export type VercelSyncConfig = {
  token?: string;
  projectId?: string;
  teamId?: string;
  configured: boolean;
};

export function getVercelSyncConfig(): VercelSyncConfig {
  const token = process.env.VERCEL_ACCESS_TOKEN?.trim();
  const projectId =
    process.env.VERCEL_PROJECT_ID?.trim() || process.env.VERCEL_PROJECT_NAME?.trim();
  const teamId = process.env.VERCEL_TEAM_ID?.trim();

  return {
    token,
    projectId,
    teamId,
    configured: Boolean(token && projectId),
  };
}

function teamQuery(teamId?: string) {
  return teamId ? `teamId=${encodeURIComponent(teamId)}&` : "";
}

async function resolveProjectId(config: VercelSyncConfig) {
  if (!config.token || !config.projectId) {
    throw new Error("Vercel sync is not configured.");
  }

  if (config.projectId.startsWith("prj_")) {
    return config.projectId;
  }

  const query = teamQuery(config.teamId);
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${encodeURIComponent(config.projectId)}?${query}`,
    { headers: { Authorization: `Bearer ${config.token}` } }
  );

  if (!response.ok) {
    throw new Error("Unable to resolve Vercel project ID.");
  }

  const project = (await response.json()) as { id?: string };
  if (!project.id) {
    throw new Error("Vercel project ID missing from API response.");
  }

  return project.id;
}

async function listProjectEnv(config: VercelSyncConfig) {
  const projectId = await resolveProjectId(config);
  const teamQuery = config.teamId ? `teamId=${encodeURIComponent(config.teamId)}&` : "";
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/env?${teamQuery}`,
    { headers: { Authorization: `Bearer ${config.token}` } }
  );

  if (!response.ok) {
    throw new Error("Unable to list Vercel environment variables.");
  }

  const body = (await response.json()) as { envs?: Array<{ id: string; key: string }> };
  return { projectId, envs: body.envs ?? [] };
}

async function removeEnvEntries(
  config: VercelSyncConfig,
  projectId: string,
  envIds: string[]
) {
  const teamQuery = config.teamId ? `teamId=${encodeURIComponent(config.teamId)}&` : "";
  for (const envId of envIds) {
    await fetch(
      `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/env/${envId}?${teamQuery}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${config.token}` },
      }
    );
  }
}

export async function upsertVercelEnvVar({
  key,
  value,
  targets = ["production", "preview"],
}: {
  key: string;
  value: string;
  targets?: Array<"production" | "preview" | "development">;
}) {
  const config = getVercelSyncConfig();
  if (!config.configured || !config.projectId || !config.token) {
    throw new Error(
      "Vercel sync is not configured. Add VERCEL_ACCESS_TOKEN and VERCEL_PROJECT_ID to Vercel env vars."
    );
  }

  const projectId = await resolveProjectId(config);
  const { envs } = await listProjectEnv(config);
  const duplicates = envs.filter((entry) => entry.key === key).map((entry) => entry.id);
  if (duplicates.length > 0) {
    await removeEnvEntries(config, projectId, duplicates);
  }

  const query = new URLSearchParams({ upsert: "true" });
  if (config.teamId) query.set("teamId", config.teamId);

  const response = await fetch(
    `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env?${query}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value,
        type: "encrypted",
        target: targets,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Vercel env update failed for ${key}: ${body}`);
  }

  return response.json();
}

export async function triggerProductionRedeploy() {
  const config = getVercelSyncConfig();
  if (!config.configured || !config.projectId || !config.token) {
    throw new Error("Vercel sync is not configured.");
  }

  const projectId = await resolveProjectId(config);
  const deploymentsQuery = new URLSearchParams({
    projectId,
    limit: "1",
    target: "production",
  });
  if (config.teamId) deploymentsQuery.set("teamId", config.teamId);

  const listResponse = await fetch(
    `https://api.vercel.com/v6/deployments?${deploymentsQuery}`,
    {
      headers: { Authorization: `Bearer ${config.token}` },
    }
  );

  if (!listResponse.ok) {
    throw new Error("Unable to fetch latest Vercel deployment.");
  }

  const list = (await listResponse.json()) as {
    deployments?: Array<{ uid: string }>;
  };
  const deploymentId = list.deployments?.[0]?.uid;
  if (!deploymentId) {
    throw new Error("No production deployment found to redeploy.");
  }

  const redeployQuery = config.teamId ? `?teamId=${encodeURIComponent(config.teamId)}` : "";
  const response = await fetch(`https://api.vercel.com/v13/deployments${redeployQuery}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: config.projectId,
      deploymentId,
      target: "production",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Vercel redeploy failed: ${body}`);
  }

  return response.json();
}

export async function syncSettingsToVercel(
  values: Record<string, string>,
  redeploy = true
) {
  for (const [key, value] of Object.entries(values)) {
    await upsertVercelEnvVar({ key, value });
  }

  if (redeploy) {
    await triggerProductionRedeploy();
  }
}

export function maskEmail(email: string | undefined) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const visible = user.slice(0, 1);
  return `${visible}***@${domain}`;
}
