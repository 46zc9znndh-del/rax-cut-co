import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const srcDir = "C:/Users/tjunk/Downloads";
const outDir = "C:/Users/tjunk/Downloads/rax-cut-co/public/images";

fs.mkdirSync(outDir, { recursive: true });

const jpeg = { quality: 80, mozjpeg: true };

async function save(pipeline, dest) {
  await pipeline.jpeg(jpeg).toFile(dest);
  const { width, height, size } = await sharp(dest).metadata();
  console.log(path.basename(dest), `${width}x${height}`, `${Math.round((size || 0) / 1024)}kb`);
}

const files = {
  stove: "IMG_0325.jpeg",
  counter: "IMG_0326.jpeg",
  drawer: "IMG_0327.jpeg",
  logo: "IMG_0328.jpeg",
  stoveWide: "IMG_0329.jpeg",
  mill: "IMG_1199.png",
};

for (const [key, file] of Object.entries(files)) {
  const meta = await sharp(path.join(srcDir, file)).metadata();
  console.log("SRC", key, file, `${meta.width}x${meta.height}`);
}

// Hero: mill board, wide cinematic crop focusing on the branded slab
await save(
  sharp(path.join(srcDir, files.mill)).resize(2400, 1200, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "hero.jpg")
);

// Logo close-up square for branding / hover
await save(
  sharp(path.join(srcDir, files.logo)).resize(1600, 1600, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "logo-close.jpg")
);

// Wide logo crop for feature split
await save(
  sharp(path.join(srcDir, files.logo)).resize(1800, 1400, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "brand.jpg")
);

// Product 4:5 crops
await save(
  sharp(path.join(srcDir, files.stoveWide)).resize(1400, 1750, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "board-stove.jpg")
);

await save(
  sharp(path.join(srcDir, files.stove)).resize(1400, 1750, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "board-groove.jpg")
);

await save(
  sharp(path.join(srcDir, files.counter)).resize(1400, 1750, {
    fit: "cover",
    position: "north",
  }),
  path.join(outDir, "board-counter.jpg")
);

await save(
  sharp(path.join(srcDir, files.mill)).resize(1400, 1750, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "board-mill.jpg")
);

// Drawer feature landscape
await save(
  sharp(path.join(srcDir, files.drawer)).resize(1800, 1400, {
    fit: "cover",
    position: "west",
  }),
  path.join(outDir, "feature-drawer.jpg")
);

await save(
  sharp(path.join(srcDir, files.drawer)).resize(1400, 1750, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "board-drawer.jpg")
);

// Lifestyle / UGC-style 1:1 thumbs
await save(
  sharp(path.join(srcDir, files.stoveWide)).resize(900, 900, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "ugc-1.jpg")
);
await save(
  sharp(path.join(srcDir, files.counter)).resize(900, 900, {
    fit: "cover",
    position: "north",
  }),
  path.join(outDir, "ugc-2.jpg")
);
await save(
  sharp(path.join(srcDir, files.logo)).resize(900, 900, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "ugc-3.jpg")
);
await save(
  sharp(path.join(srcDir, files.mill)).resize(900, 900, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "ugc-4.jpg")
);
await save(
  sharp(path.join(srcDir, files.drawer)).resize(900, 900, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "ugc-5.jpg")
);
await save(
  sharp(path.join(srcDir, files.stove)).resize(900, 900, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "ugc-6.jpg")
);

console.log("done");
