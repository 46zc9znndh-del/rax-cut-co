import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { invalidatePublicImages } from "@/lib/cms/store";
import { uploadImageToSupabase } from "@/lib/cms/store-supabase";
import { isSupabaseEnabled } from "@/lib/supabase/config";

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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (isSupabaseEnabled()) {
      const url = await uploadImageToSupabase(file);
      invalidatePublicImages();
      return NextResponse.json({ url });
    }

    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const safeName = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9-_]+/gi, "-")
      .toLowerCase()
      .slice(0, 48);

    const filename = `${safeName || "upload"}-${Date.now()}${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "images", "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    invalidatePublicImages();
    return NextResponse.json({ url: `/images/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload failed. Configure Supabase for production uploads.",
      },
      { status: 500 }
    );
  }
}
