export const SITE_DOMAIN = "raxcuttingco.com";
export const SITE_URL = `https://${SITE_DOMAIN}`;
export const SITE_NAME = "RAX Cut Co.";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    const url = configured.startsWith("http")
      ? configured
      : `https://${configured}`;
    return url.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return SITE_URL;
}

export function getSiteOrigin(request?: Request) {
  if (request) {
    const origin = request.headers.get("origin");
    if (origin) return origin.replace(/\/$/, "");
  }

  return getSiteUrl();
}
