"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/site", label: "Site Editor" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!response.ok) {
      setError("Invalid password.");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-4">
      <div>
        <label
          htmlFor="password"
          className="mb-2 block font-display text-xs tracking-[0.18em] text-white/70 uppercase"
        >
          Admin Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter admin password"
          className="border-white/20 bg-black text-white"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-center text-sm text-white/50">
        <Link href="/" className="hover:text-rax-ember">
          Back to storefront
        </Link>
      </p>
    </form>
  );
}

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="font-display text-xs tracking-[0.24em] text-rax-ember uppercase">
              RAX Cut Co.
            </p>
            <h1 className="mt-1 font-display text-2xl tracking-[0.08em] uppercase">
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {ADMIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-xs tracking-[0.16em] text-white/70 uppercase hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              className="font-display text-xs tracking-[0.16em] text-white/70 uppercase hover:text-white"
            >
              View Site
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export function useAdminCms() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cms, setCms] = useState<import("@/lib/cms/types").CmsData | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);

  function addToLibrary(url: string) {
    setImages((current) => (current.includes(url) ? current : [url, ...current]));
    setProductImages((current) => (current.includes(url) ? current : [url, ...current]));
  }
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await fetch("/api/admin/cms");
      if (!active) return;

      if (response.status === 401) {
        setError("Unauthorized");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError("Unable to load CMS data.");
        setLoading(false);
        return;
      }

      const data = (await response.json()) as {
        cms: import("@/lib/cms/types").CmsData;
        images: string[];
        productImages?: string[];
      };

      setCms(data.cms);
      setImages(data.images);
      setProductImages(data.productImages ?? data.images);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function save(next: import("@/lib/cms/types").CmsData) {
    setSaving(true);
    setError("");

    const response = await fetch("/api/admin/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error || "Save failed.");
      return false;
    }

    const data = (await response.json()) as {
      cms: import("@/lib/cms/types").CmsData;
    };
    setCms(data.cms);
    setSavedAt(new Date().toLocaleTimeString());
    return true;
  }

  return { loading, error, cms, setCms, images, productImages, addToLibrary, saving, savedAt, save };
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block font-display text-[11px] tracking-[0.16em] text-white/60 uppercase">
      {children}
    </label>
  );
}

export function AdminPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-5">
      <h2 className="font-display text-lg tracking-[0.08em] uppercase">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function PhotoPickerModal({
  open,
  images,
  selected,
  uploading,
  uploadError,
  onClose,
  onSelect,
  onUploadClick,
}: {
  open: boolean;
  images: string[];
  selected: string;
  uploading: boolean;
  uploadError: string;
  onClose: () => void;
  onSelect: (url: string) => void;
  onUploadClick: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-display text-xs tracking-[0.16em] text-white uppercase">
            Choose Photo
          </h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={uploading}
              onClick={onUploadClick}
            >
              {uploading ? "..." : "Upload"}
            </Button>
            <Button type="button" variant="dark" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {uploadError ? <p className="mb-2 text-xs text-red-400">{uploadError}</p> : null}

        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6">
          {images.map((image) => (
            <button
              key={image}
              type="button"
              onClick={() => {
                onSelect(image);
                onClose();
              }}
              className={cn(
                "relative aspect-square overflow-hidden rounded border transition-colors",
                selected === image
                  ? "border-rax-ember ring-1 ring-rax-ember"
                  : "border-white/10 hover:border-white/40"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminPhotoField({
  value,
  images,
  onChange,
  onDelete,
  canDelete = false,
  onUploaded,
  isMain = false,
  compact = true,
}: {
  value: string;
  images: string[];
  onChange: (value: string) => void;
  onDelete?: () => void;
  canDelete?: boolean;
  onUploaded?: (url: string) => void;
  isMain?: boolean;
  compact?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const library = images.includes(value) ? images : [value, ...images];

  async function uploadFile(file: File) {
    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const body = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !body.url) {
        throw new Error(body.error || "Upload failed");
      }

      onUploaded?.(body.url);
      onChange(body.url);
      setPickerOpen(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2", !compact && "flex-col items-stretch")}>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={cn(
            "relative shrink-0 overflow-hidden rounded border bg-black transition-colors hover:border-rax-ember",
            compact ? "h-14 w-14" : "h-32 w-full",
            isMain ? "border-rax-ember ring-1 ring-rax-ember" : "border-white/20"
          )}
          title="Change photo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          {isMain ? (
            <span className="absolute bottom-0 left-0 right-0 bg-rax-ember/90 py-0.5 text-center font-display text-[8px] tracking-wider text-white uppercase">
              Main
            </span>
          ) : null}
        </button>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <Button type="button" variant="default" size="sm" onClick={() => setPickerOpen(true)}>
            Change
          </Button>
          <Button type="button" variant="dark" size="sm" disabled={uploading} onClick={openFilePicker}>
            {uploading ? "..." : "Upload"}
          </Button>
          {canDelete && onDelete ? (
            <Button
              type="button"
              variant="dark"
              size="sm"
              className="border-red-500/60 px-3 text-red-400 hover:bg-red-950"
              onClick={onDelete}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadFile(file);
          event.target.value = "";
        }}
      />

      {uploadError ? <p className="mt-1 text-xs text-red-400">{uploadError}</p> : null}

      <PhotoPickerModal
        open={pickerOpen}
        images={library}
        selected={value}
        uploading={uploading}
        uploadError={uploadError}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
        onUploadClick={openFilePicker}
      />
    </>
  );
}

/** @deprecated Use AdminPhotoField */
export function ImagePicker({
  value,
  images,
  onChange,
  onDelete,
  canDelete,
  onUploaded,
  isMain,
}: {
  value: string;
  images: string[];
  onChange: (value: string) => void;
  onDelete?: () => void;
  canDelete?: boolean;
  onUploaded?: (url: string) => void;
  isMain?: boolean;
  showPathInput?: boolean;
}) {
  return (
    <AdminPhotoField
      value={value}
      images={images}
      onChange={onChange}
      onDelete={onDelete}
      canDelete={canDelete}
      onUploaded={onUploaded}
      isMain={isMain}
    />
  );
}

export function SaveBar({
  saving,
  savedAt,
  error,
  onSave,
}: {
  saving: boolean;
  savedAt: string | null;
  error: string;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/90 px-4 py-3 backdrop-blur">
      <div className="text-sm text-white/70">
        {error ? <span className="text-red-400">{error}</span> : null}
        {!error && savedAt ? <span>Saved at {savedAt}</span> : null}
        {!error && !savedAt ? <span>Unsaved changes</span> : null}
      </div>
      <Button onClick={onSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
