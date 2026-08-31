export const ADMIN_COOKIE = "rax_admin_session";
const SESSION_DAYS = 7;

export function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production.");
  }

  return process.env.ADMIN_PASSWORD?.trim() || "rax-admin";
}

export function sessionPayload(expiry: number) {
  return `admin:${expiry}`;
}

export function sessionExpiryMs() {
  return Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
}

export function parseSessionToken(token: string | undefined | null) {
  if (!token) return null;

  const [expiryStr, signature] = token.split(".");
  const expiry = Number(expiryStr);
  if (!expiry || Number.isNaN(expiry) || Date.now() > expiry) {
    return null;
  }

  if (!signature) return null;

  return { expiry, signature, payload: sessionPayload(expiry) };
}

export { SESSION_DAYS };
