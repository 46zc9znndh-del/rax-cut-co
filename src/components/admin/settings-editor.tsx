"use client";

import { useEffect, useState } from "react";
import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DnsRecord = {
  type: string;
  name: string;
  value: string;
  status?: string;
  priority?: number;
};

type SettingsResponse = {
  vercelSync: {
    configured: boolean;
    projectId: string | null;
    teamId: string | null;
  };
  resend: {
    configured?: boolean;
    domain?: string;
    status?: string;
    records?: DnsRecord[];
    error?: string;
  };
  email: {
    adminEmail: string;
    replyToEmail: string;
    useDevFrom: boolean;
    fromEmail: string | null;
  };
};

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendAdminEmail, setResendAdminEmail] = useState("");
  const [resendReplyToEmail, setResendReplyToEmail] = useState("");
  const [resendUseDevFrom, setResendUseDevFrom] = useState(true);

  async function loadSettings() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/settings");
    setLoading(false);
    if (!response.ok) {
      setError("Unable to load settings.");
      return;
    }
    const data = (await response.json()) as SettingsResponse;
    setSettings(data);
    setResendUseDevFrom(data.email.useDevFrom);
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  async function saveChanges(options?: { verifyResend?: boolean }) {
    setSaving(true);
    setMessage("");
    setError("");

    if (newPassword && newPassword !== confirmPassword) {
      setSaving(false);
      setError("New passwords do not match.");
      return;
    }

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword: newPassword || undefined,
        resendAdminEmail: resendAdminEmail || undefined,
        resendReplyToEmail: resendReplyToEmail || undefined,
        resendUseDevFrom,
        verifyResend: options?.verifyResend ?? false,
      }),
    });

    setSaving(false);
    const body = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setError(body.error || "Unable to save settings.");
      return;
    }

    setMessage(body.message || "Settings saved.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setResendAdminEmail("");
    setResendReplyToEmail("");
    await loadSettings();
  }

  const resendStatus = settings?.resend.status ?? "unknown";
  const resendVerified = resendStatus === "verified";

  return (
    <AdminShell title="Settings">
      {loading ? (
        <p className="text-sm text-white/50">Loading settings…</p>
      ) : (
        <div className="space-y-6">
          {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <AdminPanel title="Vercel Sync">
            <p className="text-sm text-white/60">
              Password and email changes sync to Vercel environment variables and trigger a
              production redeploy automatically.
            </p>
            <p className="mt-3 text-sm">
              Status:{" "}
              <span className={settings?.vercelSync.configured ? "text-emerald-300" : "text-amber-300"}>
                {settings?.vercelSync.configured ? "Connected" : "Not configured"}
              </span>
            </p>
            {!settings?.vercelSync.configured ? (
              <p className="mt-2 text-xs text-white/50">
                Ask your developer to run <code className="text-white/70">npm run setup-vercel-sync</code>{" "}
                once, then redeploy.
              </p>
            ) : null}
          </AdminPanel>

          <AdminPanel title="Change Admin Password">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs tracking-[0.16em] text-white/50 uppercase">
                  Current password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="border-white/20 bg-black text-white"
                />
              </div>
              <div />
              <div>
                <label className="mb-2 block text-xs tracking-[0.16em] text-white/50 uppercase">
                  New password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="border-white/20 bg-black text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs tracking-[0.16em] text-white/50 uppercase">
                  Confirm new password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="border-white/20 bg-black text-white"
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-white/50">Minimum 12 characters.</p>
          </AdminPanel>

          <AdminPanel title="Email (Resend)">
            <div className="space-y-4">
              <div className="rounded-md border border-white/10 p-4 text-sm text-white/70">
                <p>
                  Domain status:{" "}
                  <span className={resendVerified ? "text-emerald-300" : "text-amber-300"}>
                    {resendStatus}
                  </span>
                </p>
                <p className="mt-2 text-xs text-white/50">
                  Current alert inbox: {settings?.email.adminEmail || "not set"} · Reply-to:{" "}
                  {settings?.email.replyToEmail || "not set"}
                </p>
                <p className="mt-2 text-xs text-white/50">
                  Customer sender:{" "}
                  {settings?.email.useDevFrom
                    ? "onboarding@resend.dev (until domain verifies)"
                    : settings?.email.fromEmail || "orders@raxcuttingco.com"}
                </p>
              </div>

              {settings?.resend.records?.length ? (
                <div className="overflow-x-auto rounded-md border border-white/10">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-white/10 text-white/50">
                      <tr>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Host</th>
                        <th className="px-3 py-2">Value</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.resend.records.map((record) => (
                        <tr key={`${record.type}-${record.name}-${record.value}`} className="border-b border-white/5">
                          <td className="px-3 py-2">{record.type}</td>
                          <td className="px-3 py-2 font-mono">{record.name}</td>
                          <td className="max-w-md truncate px-3 py-2 font-mono">{record.value}</td>
                          <td className="px-3 py-2">{record.status ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs tracking-[0.16em] text-white/50 uppercase">
                    Order alert email
                  </label>
                  <Input
                    type="email"
                    value={resendAdminEmail}
                    onChange={(event) => setResendAdminEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="border-white/20 bg-black text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs tracking-[0.16em] text-white/50 uppercase">
                    Reply-to email
                  </label>
                  <Input
                    type="email"
                    value={resendReplyToEmail}
                    onChange={(event) => setResendReplyToEmail(event.target.value)}
                    placeholder="hello@raxcuttingco.com"
                    className="border-white/20 bg-black text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={resendUseDevFrom}
                  onChange={(event) => setResendUseDevFrom(event.target.checked)}
                  disabled={!resendVerified}
                />
                Use Resend dev sender until domain DNS is verified
              </label>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving || !currentPassword}
                  onClick={() => saveChanges({ verifyResend: true })}
                >
                  Check DNS / Verify Domain
                </Button>
                <Button
                  type="button"
                  disabled={saving || !currentPassword}
                  onClick={() => saveChanges()}
                >
                  {saving ? "Saving…" : "Save & Sync to Vercel"}
                </Button>
              </div>
            </div>
          </AdminPanel>
        </div>
      )}
    </AdminShell>
  );
}
