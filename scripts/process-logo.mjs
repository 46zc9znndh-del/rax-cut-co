import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const src =
  "C:/Users/tjunk/.cursor/projects/c-Users-tjunk-Downloads-rax-cut-co/assets/c__Users_tjunk_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_unnamed-054af351-8624-4c94-bb44-21f1b291c386.png";
const outDir = "C:/Users/tjunk/Downloads/rax-cut-co/public/brand";
const appDir = "C:/Users/tjunk/Downloads/rax-cut-co/src/app";

fs.mkdirSync(outDir, { recursive: true });

const { width, height } = await sharp(src).metadata();
console.log("source", width, height);

await sharp(src).jpeg({ quality: 90 }).toFile(path.join(outDir, "source.jpg"));

const emblemBox = {
  left: Math.round(width * 0.12),
  top: Math.round(height * 0.02),
  width: Math.round(width * 0.76),
  height: Math.round(height * 0.62),
};

const wordmarkBox = {
  left: Math.round(width * 0.06),
  top: Math.round(height * 0.66),
  width: Math.round(width * 0.88),
  height: Math.round(height * 0.28),
};

async function knockout(input, { white = false, threshold = 198 } = {}) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    if (brightness > threshold) {
      data[i + 3] = 0;
    } else {
      const alpha = Math.min(255, Math.round((threshold - brightness) * 3.2));
      data[i + 3] = alpha;
      if (white) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

async function saveMark(box, name, { white = false, size = 900 } = {}) {
  const cropped = await sharp(src).extract(box).png().toBuffer();
  const keyed = await knockout(cropped, { white });
  const trimmed = await keyed.trim({ threshold: 8 }).png().toBuffer();
  const dest = path.join(outDir, name);
  await sharp(trimmed)
    .resize(size, size, { fit: "inside", withoutEnlargement: false })
    .png()
    .toFile(dest);
  const meta = await sharp(dest).metadata();
  console.log(name, `${meta.width}x${meta.height}`);
}

await saveMark(emblemBox, "emblem.png", { white: false, size: 900 });
await saveMark(emblemBox, "emblem-white.png", { white: true, size: 900 });

const wordCrop = await sharp(src).extract(wordmarkBox).png().toBuffer();
const wordKeyed = await knockout(wordCrop, { white: false, threshold: 205 });
await wordKeyed
  .trim({ threshold: 8 })
  .resize(1200, 400, { fit: "inside" })
  .png()
  .toFile(path.join(outDir, "wordmark.png"));

const wordWhite = await knockout(wordCrop, { white: true, threshold: 205 });
await wordWhite
  .trim({ threshold: 8 })
  .resize(1200, 400, { fit: "inside" })
  .png()
  .toFile(path.join(outDir, "wordmark-white.png"));

await sharp(path.join(outDir, "emblem.png"))
  .resize(64, 64)
  .png()
  .toFile(path.join(appDir, "icon.png"));
await sharp(path.join(outDir, "emblem.png"))
  .resize(180, 180)
  .png()
  .toFile(path.join(appDir, "apple-icon.png"));

console.log("brand assets ready");
