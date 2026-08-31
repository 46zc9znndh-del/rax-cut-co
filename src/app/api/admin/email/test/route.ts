import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { getCmsData } from "@/lib/cms/store";
import { getEffectiveFromAddress, getEmailConfig, getReplyToEmail } from "@/lib/email/config";
import { getResendClient } from "@/lib/email/client";
import { testEmail } from "@/lib/email/templates";

export async function POST() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enabled, adminEmail, siteUrl } = getEmailConfig();
  if (!enabled || !adminEmail) {
    return NextResponse.json(
      { error: "Resend is not configured. Set RESEND_API_KEY and RESEND_ADMIN_EMAIL." },
      { status: 400 }
    );
  }

  try {
    const settings = (await getCmsData()).site.emailSettings;
    const template = testEmail(siteUrl, settings);
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: getEffectiveFromAddress(),
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      ...(getReplyToEmail() ? { replyTo: getReplyToEmail() } : {}),
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: result.data?.id });
  } catch (error) {
    console.error("Resend test failed:", error);
    return NextResponse.json({ error: "Resend test failed" }, { status: 500 });
  }
}
