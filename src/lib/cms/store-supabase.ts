import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withSiteDefaults } from "@/lib/cms/defaults";
import type { CmsData } from "@/lib/cms/types";

const CMS_ROW_ID = "main";

export async function getCmsFromSupabase(): Promise<CmsData> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cms_documents")
    .select("payload")
    .eq("id", CMS_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data?.payload) {
    throw new Error("CMS row missing in Supabase. Run npm run bootstrap-supabase.");
  }

  const parsed = data.payload as CmsData;
  return {
    ...parsed,
    site: withSiteDefaults(parsed.site),
  };
}

export async function saveCmsToSupabase(data: CmsData): Promise<CmsData> {
  const supabase = createSupabaseServerClient();
  const next: CmsData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase.from("cms_documents").upsert({
    id: CMS_ROW_ID,
    payload: next,
    updated_at: next.updatedAt,
  });

  if (error) throw error;
  return next;
}

export async function uploadImageToSupabase(file: File) {
  const supabase = createSupabaseServerClient();
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : ".jpg";
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .toLowerCase()
    .slice(0, 48);
  const filename = `${safeName || "upload"}-${Date.now()}${ext}`;
  const path = `uploads/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("site-images").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("site-images").getPublicUrl(path);

  return publicUrl;
}

export async function listSupabaseImages(): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  const urls = new Set<string>();

  async function walk(prefix: string) {
    const { data, error } = await supabase.storage.from("site-images").list(prefix, {
      limit: 1000,
    });
    if (error || !data) return;

    for (const entry of data) {
      if (!entry.name || entry.name === ".emptyFolderPlaceholder") continue;
      const nextPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        await walk(nextPath);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("site-images").getPublicUrl(nextPath);
      urls.add(publicUrl);
    }
  }

  await walk("");
  return [...urls].sort();
}
