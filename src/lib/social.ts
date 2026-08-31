export function isSocialLinkConfigured(url: string | undefined) {
  if (!url?.trim()) return false;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/$/, "");

    if (host === "instagram.com" && !path) return false;
    if (host === "facebook.com" && !path) return false;
    if (host === "youtube.com" && !path) return false;

    return true;
  } catch {
    return false;
  }
}
