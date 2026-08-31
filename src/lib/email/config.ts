import "server-only";

import { getSiteUrl, SITE_DOMAIN } from "@/lib/site";

const DEV_FROM = "RAX Cut Co. <onboarding@resend.dev>";

export function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? `RAX Cut Co. <orders@${SITE_DOMAIN}>`;
  const adminEmail = process.env.RESEND_ADMIN_EMAIL;
  const segmentId = process.env.RESEND_SEGMENT_ID ?? process.env.RESEND_AUDIENCE_ID;

  return {
    apiKey,
    from,
    devFrom: DEV_FROM,
    adminEmail,
    segmentId,
    siteUrl: getSiteUrl(),
    enabled: Boolean(apiKey),
  };
}

export function getReplyToEmail() {
  return process.env.RESEND_REPLY_TO_EMAIL ?? `hello@${SITE_DOMAIN}`;
}

export function getEffectiveFromAddress() {
  const { from, devFrom, enabled } = getEmailConfig();
  if (!enabled) return from;
  if (process.env.RESEND_USE_DEV_FROM === "true") return devFrom;
  return from;
}

export function isUsingDevSender() {
  return process.env.RESEND_USE_DEV_FROM === "true";
}

export function canEmailRecipient(recipient: string | string[]) {
  if (!isUsingDevSender()) return true;

  const allowed = process.env.RESEND_ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowed) return false;

  const recipients = Array.isArray(recipient) ? recipient : [recipient];
  return recipients.every((entry) => entry.trim().toLowerCase() === allowed);
}
