import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/email/send";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`newsletter:${ip}`, { limit: 8, windowMs: 60 * 60_000 });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !emailPattern.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const result = await subscribeToNewsletter(email);
    return NextResponse.json({
      ok: true,
      email: result.email,
      welcomeSent: result.welcomeSent,
    });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Unable to subscribe right now.";
    const message = raw.includes("only send testing emails")
      ? "You're on the list. Welcome emails start after domain verification."
      : raw;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
