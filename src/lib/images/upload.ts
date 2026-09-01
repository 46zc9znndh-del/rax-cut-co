import "server-only";

import path from "node:path";
import sharp from "sharp";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
  ".avif",
  ".tif",
  ".tiff",
]);

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export function isImageUpload(file: File) {
  if (file.type.startsWith("image/")) return true;
  const ext = path.extname(file.name).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

export function buildUploadFilename(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  const safeName = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .toLowerCase()
    .slice(0, 48);

  return `${safeName || "upload"}-${Date.now()}${ext || ".jpg"}`;
}

export async function normalizeUploadedImage(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large. Please use a photo under 20 MB.");
  }

  try {
    const output = await sharp(buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    return {
      buffer: output,
      contentType: "image/jpeg",
      extension: ".jpg",
    };
  } catch {
    throw new Error(
      "Could not process this image. Try a JPG or PNG from your camera roll, or email it to yourself and save as JPEG first."
    );
  }
}
