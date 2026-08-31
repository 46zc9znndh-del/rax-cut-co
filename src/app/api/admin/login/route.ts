import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/cms/auth";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`admin-login:${ip}`, { limit: 5, windowMs: 15 * 60_000 });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password ?? "";

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_COOKIE,
      createSessionToken(),
      sessionCookieOptions()
    );
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
