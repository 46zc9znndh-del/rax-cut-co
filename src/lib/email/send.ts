import "server-only";

import type { Order } from "@/lib/orders/types";
import { getResendClient } from "./client";
import { getEmailConfig, getEffectiveFromAddress, getReplyToEmail, canEmailRecipient } from "./config";
import {
  newsletterWelcomeEmail,
  orderAdminEmail,
  orderConfirmationEmail,
  shippingEmail,
} from "./templates";
import { markOrderEmailSent } from "@/lib/orders/store";
import { getCmsData } from "@/lib/cms/store";

function getEmailSettings() {
  return getCmsData().then((cms) => cms.site.emailSettings);
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const { enabled } = getEmailConfig();
  const from = getEffectiveFromAddress();
  if (!enabled) {
    console.warn("Resend not configured — skipping email:", subject);
    return { skipped: true as const };
  }

  const replyTo = getReplyToEmail();
  const resend = getResendClient();
  const recipients = Array.isArray(to) ? to : [to];

  if (!canEmailRecipient(recipients)) {
    console.warn(
      "Skipping email while RESEND_USE_DEV_FROM is enabled:",
      recipients.join(", ")
    );
    return { skipped: true as const, reason: "dev_sender" as const };
  }

  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { skipped: false as const, id: result.data?.id };
}

export async function sendOrderConfirmationEmail(order: Order) {
  if (order.confirmationEmailSentAt) return;

  const { siteUrl } = getEmailConfig();
  const template = orderConfirmationEmail(order, siteUrl, await getEmailSettings());

  await sendEmail({
    to: order.customerEmail,
    subject: template.subject,
    html: template.html,
  });

  await markOrderEmailSent(order.id, { confirmationEmailSentAt: new Date().toISOString() });
}

export async function sendOrderAdminEmail(order: Order) {
  if (order.adminEmailSentAt) return;

  const { adminEmail, siteUrl } = getEmailConfig();
  if (!adminEmail) {
    console.warn("RESEND_ADMIN_EMAIL not set — skipping admin order alert");
    return;
  }

  const template = orderAdminEmail(order, siteUrl, await getEmailSettings());

  await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
  });

  await markOrderEmailSent(order.id, { adminEmailSentAt: new Date().toISOString() });
}

export async function sendShippingNotificationEmail(order: Order) {
  if (order.shippedEmailSentAt) return;
  if (order.status !== "shipped") return;

  const { siteUrl } = getEmailConfig();
  const template = shippingEmail(order, siteUrl, await getEmailSettings());

  await sendEmail({
    to: order.customerEmail,
    subject: template.subject,
    html: template.html,
  });

  await markOrderEmailSent(order.id, { shippedEmailSentAt: new Date().toISOString() });
}

export async function sendOrderEmails(order: Order) {
  const results = await Promise.allSettled([
    sendOrderConfirmationEmail(order),
    sendOrderAdminEmail(order),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Order email failed:", result.reason);
    }
  }
}

export async function subscribeToNewsletter(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Invalid email address");
  }

  const { segmentId, siteUrl, enabled } = getEmailConfig();

  if (enabled && segmentId) {
    const resend = getResendClient();
    const contact = await resend.contacts.create({
      email: normalized,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    });

    if (contact.error && !contact.error.message.toLowerCase().includes("already")) {
      throw new Error(contact.error.message);
    }
  }

  const template = newsletterWelcomeEmail(normalized, siteUrl, await getEmailSettings());

  let welcomeSent = false;
  if (enabled) {
    const welcome = await sendEmail({
      to: normalized,
      subject: template.subject,
      html: template.html,
    });
    welcomeSent = !welcome.skipped;
  } else {
    console.warn("Resend not configured — newsletter signup logged only:", normalized);
  }

  return { email: normalized, welcomeSent };
}
