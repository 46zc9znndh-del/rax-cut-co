import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildUploadFilename } from "@/lib/images/upload";
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

export async function uploadImageToSupabase(
  buffer: Buffer,
  originalName: string,
  contentType = "image/jpeg"
) {
  const supabase = createSupabaseServerClient();
  const filename = buildUploadFilename(originalName).replace(/\.[^.]+$/, ".jpg");
  const storagePath = `uploads/${filename}`;

  const { error } = await supabase.storage.from("site-images").upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("site-images").getPublicUrl(storagePath);

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

    const nested: Promise<void>[] = [];

    for (const entry of data) {
      if (!entry.name || entry.name === ".emptyFolderPlaceholder") continue;
      const nextPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        nested.push(walk(nextPath));
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("site-images").getPublicUrl(nextPath);
      urls.add(publicUrl);
    }

    await Promise.all(nested);
  }

  await walk("");
  return [...urls].sort();
}
