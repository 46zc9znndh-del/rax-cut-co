import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { invalidatePublicImages } from "@/lib/cms/store";
import { uploadImageToSupabase } from "@/lib/cms/store-supabase";
import { buildUploadFilename, isImageUpload, normalizeUploadedImage } from "@/lib/images/upload";
import { isSupabaseEnabled } from "@/lib/supabase/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isImageUpload(file)) {
      return NextResponse.json(
        {
          error:
            "Please choose a photo (JPG, PNG, WEBP, HEIC, or GIF). iPhone photos are supported.",
        },
        { status: 400 }
      );
    }

    const normalized = await normalizeUploadedImage(file);

    if (isSupabaseEnabled()) {
      const url = await uploadImageToSupabase(
        normalized.buffer,
        file.name,
        normalized.contentType
      );
      invalidatePublicImages();
      return NextResponse.json({ url });
    }

    const filename = buildUploadFilename(file.name).replace(/\.[^.]+$/, normalized.extension);
    const uploadsDir = path.join(process.cwd(), "public", "images", "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, filename), normalized.buffer);

    invalidatePublicImages();
    return NextResponse.json({ url: `/images/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload failed. Try a JPG or PNG under 20 MB.",
      },
      { status: 500 }
    );
  }
}
