import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { sendNewsletterBroadcast } from "@/lib/email/send";
import { rateLimit } from "@/lib/security/rate-limit";

type BroadcastBody = {
  subject?: string;
  headline?: string;
  intro?: string;
  closing?: string;
  ctaText?: string;
  ctaHref?: string;
  previewText?: string;
};

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = rateLimit(`newsletter-broadcast:${ip}`, { limit: 3, windowMs: 60 * 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many broadcast attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as BroadcastBody;
    const subject = body.subject?.trim();
    const headline = body.headline?.trim();
    const intro = body.intro?.trim();
    const closing = body.closing?.trim();
    const ctaText = body.ctaText?.trim();
    const ctaHref = body.ctaHref?.trim() || "/shop";

    if (!subject || !headline || !intro || !closing || !ctaText) {
      return NextResponse.json({ error: "All broadcast fields are required." }, { status: 400 });
    }

    const result = await sendNewsletterBroadcast({
      subject,
      headline,
      intro,
      closing,
      ctaText,
      ctaHref,
      previewText: body.previewText?.trim(),
    });

    return NextResponse.json({ ok: true, broadcastId: result.id });
  } catch (error) {
    console.error("Newsletter broadcast error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to send newsletter broadcast.",
      },
      { status: 500 }
    );
  }
}
