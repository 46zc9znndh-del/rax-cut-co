import type { Order } from "@/lib/orders/types";
import type { EmailSettings } from "@/lib/cms/types";
import { DEFAULT_EMAIL_SETTINGS } from "@/lib/cms/defaults";
import { formatCurrency } from "@/lib/utils";

const brand = {
  ember: "#f15a22",
  emberDark: "#c94512",
  ink: "#111111",
  charcoal: "#2a2a2a",
  cream: "#f3f1ec",
  sand: "#ece7df",
  muted: "#6b6b6b",
  white: "#ffffff",
};

const brandKicker = "American Hardwood · Integrated Drip Tray";
const brandTagline = "Crafted for the Cut.";

type TemplateVars = Record<string, string>;

function interpolate(template: string, vars: TemplateVars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

function greeting(name?: string | null) {
  const first = name?.trim().split(/\s+/)[0];
  return first ? `Hey ${first},` : "Hey,";
}

function layout(settings: EmailSettings, headline: string, body: string, siteUrl: string) {
  const email = settings ?? DEFAULT_EMAIL_SETTINGS;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${headline}</title>
  </head>
  <body style="margin:0;padding:0;background:${brand.cream};font-family:Georgia,'Times New Roman',serif;color:${brand.ink};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${email.brandName} — ${brandTagline}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.cream};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:${brand.white};border:1px solid ${brand.sand};overflow:hidden;">
            <tr>
              <td style="height:5px;background:linear-gradient(90deg, ${brand.emberDark} 0%, ${brand.ember} 55%, ${brand.emberDark} 100%);font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="background:${brand.ink};padding:28px 32px 24px;">
                <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.34em;text-transform:uppercase;color:${brand.ember};">
                  ${brandKicker}
                </p>
                <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.32em;text-transform:uppercase;color:rgba(255,255,255,0.72);">
                  ${email.brandName}
                </p>
                <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:30px;line-height:1.05;letter-spacing:0.12em;text-transform:uppercase;color:${brand.white};">
                  ${headline}
                </h1>
                <p style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-style:italic;color:rgba(255,255,255,0.55);">
                  ${brandTagline}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${brand.ink};">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;background:#faf8f4;border-top:1px solid ${brand.sand};">
                <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${brand.muted};">
                  <strong style="color:${brand.ink};">${email.brandName}</strong> · ${email.locationLine}
                </p>
                <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${brand.muted};">
                  ${email.footerTagline}
                </p>
                <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${brand.muted};">
                  Lifetime guarantee · Built in Washington, USA
                </p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:${brand.muted};">
                  <a href="${siteUrl}" style="color:${brand.ember};text-decoration:none;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${siteUrl.replace(/^https?:\/\//, "")}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function cta(href: string, label: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px;">
    <tr>
      <td style="border-radius:2px;background:${brand.ember};">
        <a href="${href}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;color:${brand.white};">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function renderItems(order: Order) {
  return order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid ${brand.sand};vertical-align:top;">
          <strong style="font-size:14px;">${item.name}${item.wood ? ` — ${item.wood}` : ""}</strong><br />
          <span style="color:${brand.muted};font-size:13px;">Qty ${item.quantity}</span>
        </td>
        <td align="right" style="padding:14px 0;border-bottom:1px solid ${brand.sand};white-space:nowrap;vertical-align:top;font-size:14px;">
          ${formatCurrency(item.lineTotal)}
        </td>
      </tr>`
    )
    .join("");
}

function renderTotals(order: Order) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;font-size:14px;">
      <tr>
        <td style="padding:8px 0;color:${brand.muted};">Subtotal</td>
        <td align="right">${formatCurrency(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:${brand.muted};">Shipping</td>
        <td align="right">${order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;font-size:12px;border-top:2px solid ${brand.ink};">Total</td>
        <td align="right" style="padding:12px 0 0;font-weight:700;font-size:16px;border-top:2px solid ${brand.ink};">${formatCurrency(order.total)}</td>
      </tr>
    </table>`;
}

function renderAddress(order: Order) {
  if (!order.shippingAddress) return "";

  const { line1, line2, city, state, postalCode, country } = order.shippingAddress;
  return `
    <div style="margin-top:24px;padding:18px;background:#faf8f4;border:1px solid ${brand.sand};">
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${brand.muted};">Shipping To</p>
      <p style="margin:0;line-height:1.65;font-size:14px;">
        ${order.customerName ? `<strong>${order.customerName}</strong><br />` : ""}
        ${line1}${line2 ? `<br />${line2}` : ""}<br />
        ${city}${state ? `, ${state}` : ""} ${postalCode}<br />
        ${country}
      </p>
    </div>`;
}

function orderBlock(order: Order) {
  return `
    <p style="margin:0 0 16px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${brand.muted};">
      Order ${order.orderNumber}
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${renderItems(order)}
    </table>
    ${renderTotals(order)}
    ${renderAddress(order)}`;
}

export function orderConfirmationEmail(
  order: Order,
  siteUrl: string,
  settings: EmailSettings = DEFAULT_EMAIL_SETTINGS
) {
  const copy = settings.orderConfirmation;
  const vars = {
    greeting: greeting(order.customerName),
    orderNumber: order.orderNumber,
    total: formatCurrency(order.total),
  };

  const body = `
    <p style="margin:0 0 20px;">${interpolate(copy.intro, vars)}</p>
    ${orderBlock(order)}
    <p style="margin:24px 0 0;color:${brand.muted};">${settings.supportMessage}</p>
    <p style="margin:16px 0 0;color:${brand.muted};">${copy.closing}</p>
    ${cta(`${siteUrl}/shop`, copy.ctaText)}`;

  return {
    subject: interpolate(copy.subject, vars),
    html: layout(settings, copy.headline, body, siteUrl),
  };
}

export function orderAdminEmail(
  order: Order,
  siteUrl: string,
  settings: EmailSettings = DEFAULT_EMAIL_SETTINGS
) {
  const vars = {
    orderNumber: order.orderNumber,
    total: formatCurrency(order.total),
  };

  const body = `
    <p style="margin:0 0 20px;">New paid order on ${settings.brandName}.</p>
    <p style="margin:0 0 16px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${brand.muted};">
      ${order.orderNumber} · ${formatCurrency(order.total)}
    </p>
    <p style="margin:0 0 20px;line-height:1.65;">
      <strong>${order.customerName ?? "Customer"}</strong><br />
      ${order.customerEmail}
      ${order.customerPhone ? `<br />${order.customerPhone}` : ""}
    </p>
    ${orderBlock(order)}
    ${cta(`${siteUrl}/admin/orders`, "Open Admin Orders")}`;

  return {
    subject: interpolate("New order {{orderNumber}} — {{total}}", vars),
    html: layout(settings, "New Order", body, siteUrl),
  };
}

export function shippingEmail(
  order: Order,
  siteUrl: string,
  settings: EmailSettings = DEFAULT_EMAIL_SETTINGS
) {
  const copy = settings.orderShipped;
  const vars = {
    greeting: greeting(order.customerName),
    orderNumber: order.orderNumber,
  };

  const trackingBlock = order.trackingNumber
    ? `<p style="margin:0 0 20px;padding:18px;background:#faf8f4;border:1px solid ${brand.sand};line-height:1.65;">
        <span style="display:block;margin-bottom:6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${brand.muted};">Tracking</span>
        <strong>${order.trackingNumber}</strong>
      </p>`
    : `<p style="margin:0 0 20px;color:${brand.muted};">${copy.trackingFallback}</p>`;

  const body = `
    <p style="margin:0 0 20px;">${interpolate(copy.intro, vars)}</p>
    <p style="margin:0 0 16px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${brand.muted};">
      Order ${order.orderNumber}
    </p>
    ${trackingBlock}
    ${renderAddress(order)}
    <p style="margin:24px 0 0;color:${brand.muted};">${copy.closing}</p>
    ${cta(`${siteUrl}/shop`, copy.ctaText)}`;

  return {
    subject: interpolate(copy.subject, vars),
    html: layout(settings, copy.headline, body, siteUrl),
  };
}

export function newsletterWelcomeEmail(
  email: string,
  siteUrl: string,
  settings: EmailSettings = DEFAULT_EMAIL_SETTINGS
) {
  const copy = settings.newsletterWelcome;

  const body = `
    <p style="margin:0 0 20px;">${copy.intro}</p>
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${brand.muted};">
      ${email}
    </p>
    <p style="margin:20px 0 0;color:${brand.muted};">${copy.closing}</p>
    ${cta(`${siteUrl}/shop`, copy.ctaText)}`;

  return {
    subject: copy.subject,
    html: layout(settings, copy.headline, body, siteUrl),
  };
}

export function newsletterBroadcastEmail(
  {
    subject,
    headline,
    intro,
    closing,
    ctaText,
    ctaHref,
  }: {
    subject: string;
    headline: string;
    intro: string;
    closing: string;
    ctaText: string;
    ctaHref: string;
  },
  siteUrl: string,
  settings: EmailSettings = DEFAULT_EMAIL_SETTINGS
) {
  const href = ctaHref.startsWith("http") ? ctaHref : `${siteUrl}${ctaHref.startsWith("/") ? ctaHref : `/${ctaHref}`}`;

  const body = `
    <p style="margin:0 0 20px;">${intro}</p>
    <p style="margin:20px 0 0;color:${brand.muted};">${closing}</p>
    ${cta(href, ctaText)}`;

  return {
    subject,
    html: layout(settings, headline, body, siteUrl),
  };
}

export function testEmail(siteUrl: string, settings: EmailSettings = DEFAULT_EMAIL_SETTINGS) {
  const sampleOrder: Order = {
    id: "email-preview",
    orderNumber: "RAX-1001",
    stripeSessionId: "preview",
    status: "paid",
    customerEmail: "customer@example.com",
    customerName: "RAX Customer",
    items: [
      {
        productId: "rax-original-drip-maple",
        slug: "rax-original-drip-board-maple",
        name: "RAX Original Drip Board",
        wood: "Maple",
        quantity: 1,
        unitPrice: 180,
        lineTotal: 180,
      },
    ],
    subtotal: 180,
    shipping: 0,
    total: 180,
    currency: "USD",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const body = `
    <p style="margin:0 0 20px;">Your ${settings.brandName} email system is connected. Below is a preview of how order emails look to customers.</p>
    ${orderBlock(sampleOrder)}
    <p style="margin:24px 0 0;color:${brand.muted};">${settings.supportMessage}</p>
    ${cta(`${siteUrl}/admin/site`, "Edit Email Copy")}`;

  return {
    subject: `${settings.brandName} — branded email test`,
    html: layout(settings, "Email Connected", body, siteUrl),
  };
}
