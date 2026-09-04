"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSignup({
  headline,
  description,
  successMessage,
}: {
  headline: string;
  description: string;
  successMessage: string;
}) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinedMessage, setJoinedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    const body = (await response.json()) as { welcomeSent?: boolean; error?: string };

    if (!response.ok) {
      setError(body.error || "Unable to subscribe right now.");
      return;
    }

    setJoinedMessage(
      body.welcomeSent === false ? "You're on the list." : successMessage
    );
    setJoined(true);
  }

  return (
    <>
      <h3 className="font-display text-sm tracking-[0.2em] uppercase">{headline}</h3>
      <p className="mt-3 text-sm text-rax-muted">{description}</p>
      {joined ? (
        <p className="mt-4 font-display tracking-[0.12em] text-rax-wood uppercase">
          {joinedMessage || successMessage}
        </p>
      ) : (
        <form className="mt-4 space-y-2" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Joining..." : "Join"}
            </Button>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </form>
      )}
    </>
  );
}
