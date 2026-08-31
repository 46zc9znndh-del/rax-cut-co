import { NextResponse } from "next/server";
import { isAdminAuthenticated, verifyAdminPassword } from "@/lib/cms/auth";
import { getResendDomainStatus, verifyResendDomain } from "@/lib/resend/domain";
import {
  getVercelSyncConfig,
  maskEmail,
  syncSettingsToVercel,
} from "@/lib/vercel/env-sync";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vercel = getVercelSyncConfig();
  const resend = await getResendDomainStatus().catch((error) => ({
    configured: false,
    domain: "raxcuttingco.com",
    status: "error" as const,
    records: [],
    error: error instanceof Error ? error.message : String(error),
  }));

  return NextResponse.json({
    vercelSync: {
      configured: vercel.configured,
      projectId: vercel.projectId ?? null,
      teamId: vercel.teamId ?? null,
    },
    resend,
    email: {
      adminEmail: maskEmail(process.env.RESEND_ADMIN_EMAIL),
      replyToEmail: maskEmail(process.env.RESEND_REPLY_TO_EMAIL),
      useDevFrom: process.env.RESEND_USE_DEV_FROM === "true",
      fromEmail: process.env.RESEND_FROM_EMAIL ?? null,
    },
  });
}

type SettingsBody = {
  currentPassword?: string;
  newPassword?: string;
  resendAdminEmail?: string;
  resendReplyToEmail?: string;
  resendUseDevFrom?: boolean;
  verifyResend?: boolean;
};

export async function PUT(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as SettingsBody;
    const currentPassword = body.currentPassword?.trim() ?? "";

    if (!verifyAdminPassword(currentPassword)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const vercel = getVercelSyncConfig();
    const envUpdates: Record<string, string> = {};
    const messages: string[] = [];

    if (body.verifyResend) {
      const status = await verifyResendDomain();
      messages.push(`Resend domain status: ${status.status}`);
      if (status.status === "verified" && body.resendUseDevFrom !== true) {
        envUpdates.RESEND_USE_DEV_FROM = "false";
        messages.push("Domain verified — switching to orders@raxcuttingco.com sender.");
      }
    }

    if (body.newPassword?.trim()) {
      if (body.newPassword.trim().length < 12) {
        return NextResponse.json(
          { error: "New password must be at least 12 characters." },
          { status: 400 }
        );
      }
      envUpdates.ADMIN_PASSWORD = body.newPassword.trim();
      messages.push("Admin password updated.");
    }

    if (body.resendAdminEmail?.trim()) {
      envUpdates.RESEND_ADMIN_EMAIL = body.resendAdminEmail.trim();
      messages.push("Order alert email updated.");
    }

    if (body.resendReplyToEmail?.trim()) {
      envUpdates.RESEND_REPLY_TO_EMAIL = body.resendReplyToEmail.trim();
      messages.push("Reply-to email updated.");
    }

    if (typeof body.resendUseDevFrom === "boolean") {
      envUpdates.RESEND_USE_DEV_FROM = body.resendUseDevFrom ? "true" : "false";
      messages.push(
        body.resendUseDevFrom
          ? "Customer emails will send from onboarding@resend.dev."
          : "Customer emails will send from orders@raxcuttingco.com."
      );
    }

    if (Object.keys(envUpdates).length === 0 && !body.verifyResend) {
      return NextResponse.json({ error: "No changes to save." }, { status: 400 });
    }

    if (Object.keys(envUpdates).length > 0) {
      if (!vercel.configured) {
        return NextResponse.json(
          {
            error:
              "Vercel sync is not configured. Add VERCEL_ACCESS_TOKEN and VERCEL_PROJECT_ID to this project, then redeploy once.",
          },
          { status: 503 }
        );
      }

      await syncSettingsToVercel(envUpdates, true);
      messages.push("Synced to Vercel and triggered a production redeploy.");
    }

    const resend = await getResendDomainStatus().catch(() => null);

    return NextResponse.json({
      ok: true,
      message: messages.join(" "),
      resendStatus: resend?.status ?? null,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save settings.",
      },
      { status: 500 }
    );
  }
}
