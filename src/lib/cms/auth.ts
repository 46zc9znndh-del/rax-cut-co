import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  SESSION_DAYS,
  getSessionSecret,
  parseSessionToken,
  sessionExpiryMs,
  sessionPayload,
} from "@/lib/cms/session";

export { ADMIN_COOKIE };

export function createSessionToken() {
  const expiry = sessionExpiryMs();
  const payload = sessionPayload(expiry);
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  return `${expiry}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null) {
  const parsed = parseSessionToken(token);
  if (!parsed) return false;

  const expected = crypto
    .createHmac("sha256", getSessionSecret())
    .update(parsed.payload)
    .digest("hex");

  if (parsed.signature.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(parsed.signature),
    Buffer.from(expected)
  );
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export function verifyAdminPassword(password: string) {
  const submitted = password.trim();
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (process.env.NODE_ENV === "production" && !configured) {
    return false;
  }
  if (!configured) {
    return submitted === "rax-admin";
  }
  return submitted === configured;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}
