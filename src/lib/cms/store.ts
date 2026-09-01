import fs from "node:fs";
import path from "node:path";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";
import "server-only";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { withSiteDefaults } from "./defaults";
import {
  getCmsFromSupabase,
  listSupabaseImages,
  saveCmsToSupabase,
} from "./store-supabase";
import type { CmsData } from "./types";

const CMS_PATH = path.join(process.cwd(), "data", "cms.json");
const CMS_CACHE_SECONDS = 300;

let fileCache: CmsData | null = null;
let fileCacheMtime = 0;

function readFile(): CmsData {
  const stat = fs.statSync(CMS_PATH);
  if (fileCache && stat.mtimeMs === fileCacheMtime) {
    return fileCache;
  }

  const raw = fs.readFileSync(CMS_PATH, "utf8");
  const parsed = JSON.parse(raw) as CmsData;
  fileCache = {
    ...parsed,
    site: withSiteDefaults(parsed.site),
  };
  fileCacheMtime = stat.mtimeMs;
  return fileCache;
}

function writeFile(data: CmsData): CmsData {
  const next: CmsData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(CMS_PATH), { recursive: true });
  fs.writeFileSync(CMS_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  fileCache = next;
  fileCacheMtime = fs.statSync(CMS_PATH).mtimeMs;
  return next;
}

async function loadCmsData(): Promise<CmsData> {
  if (isSupabaseEnabled()) {
    try {
      return await getCmsFromSupabase();
    } catch (error) {
      console.warn("Supabase CMS read failed, using cms.json fallback:", error);
    }
  }

  return readFile();
}

const getCachedCmsData = unstable_cache(loadCmsData, ["rax-cms-document"], {
  revalidate: CMS_CACHE_SECONDS,
  tags: ["cms"],
});

export const getCmsData = cache(getCachedCmsData);

export async function getFreshCmsData(): Promise<CmsData> {
  return loadCmsData();
}

function revalidateStorefront() {
  revalidateTag("cms", "max");
  revalidateTag("cms-images", "max");
  revalidatePath("/", "layout");
}

export async function saveCmsData(data: CmsData): Promise<CmsData> {
  let saved: CmsData;

  if (isSupabaseEnabled()) {
    saved = await saveCmsToSupabase(data);
    fileCache = saved;
  } else {
    saved = writeFile(data);
  }

  revalidateStorefront();
  return saved;
}

function listLocalImages(): string[] {
  const imagesDir = path.join(process.cwd(), "public", "images");
  if (!fs.existsSync(imagesDir)) return [];

  const files: string[] = [];
  const walk = (dir: string, prefix: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), rel);
      } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(entry.name)) {
        files.push(`/images/${rel.replace(/\\/g, "/")}`);
      }
    }
  };

  walk(imagesDir, "");
  return files.sort();
}

async function loadPublicImages(): Promise<string[]> {
  const local = listLocalImages();

  if (!isSupabaseEnabled()) {
    return local;
  }

  try {
    const remote = await listSupabaseImages();
    return [...new Set([...local, ...remote])].sort();
  } catch (error) {
    console.warn("Supabase image list failed:", error);
    return local;
  }
}

const getCachedPublicImages = unstable_cache(loadPublicImages, ["rax-public-images"], {
  revalidate: CMS_CACHE_SECONDS,
  tags: ["cms-images"],
});

export async function listPublicImages(): Promise<string[]> {
  return getCachedPublicImages();
}

export function invalidatePublicImages() {
  revalidateTag("cms-images", "max");
}

export function getCmsBackendLabel() {
  return isSupabaseEnabled() ? "supabase" : "file";
}
