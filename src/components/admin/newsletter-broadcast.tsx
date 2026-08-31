"use client";

import { useState } from "react";
import { AdminPanel, FieldLabel } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterBroadcastPanel() {
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("");
  const [intro, setIntro] = useState("");
  const [closing, setClosing] = useState("");
  const [ctaText, setCtaText] = useState("Shop Boards");
  const [ctaHref, setCtaHref] = useState("/shop");
  const [previewText, setPreviewText] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSend() {
    setSending(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/newsletter/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        headline,
        intro,
        closing,
        ctaText,
        ctaHref,
        previewText,
      }),
    });

    const body = (await response.json()) as { error?: string; broadcastId?: string | null };
    setSending(false);

    if (!response.ok) {
      setError(body.error || "Broadcast failed.");
      return;
    }

    setMessage(
      body.broadcastId
        ? `Broadcast sent to your newsletter list (ID: ${body.broadcastId}).`
        : "Broadcast sent to your newsletter list."
    );
  }

  return (
    <AdminPanel title="Send Newsletter Email">
      <p className="mb-4 text-sm text-white/60">
        Sends a branded email to everyone on your Resend newsletter segment. Signups still get the
        welcome email automatically — use this for drops, restocks, and announcements.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel>Subject</FieldLabel>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Preview Text (optional)</FieldLabel>
          <Input
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Headline</FieldLabel>
          <Input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Message</FieldLabel>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Closing Line</FieldLabel>
          <Input
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Button Text</FieldLabel>
          <Input
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Button Link</FieldLabel>
          <Input
            value={ctaHref}
            onChange={(e) => setCtaHref(e.target.value)}
            className="border-white/20 bg-black text-white"
          />
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-emerald-400">{message}</p> : null}
      <Button type="button" className="mt-4" disabled={sending} onClick={() => void handleSend()}>
        {sending ? "Sending..." : "Send to Newsletter List"}
      </Button>
    </AdminPanel>
  );
}
