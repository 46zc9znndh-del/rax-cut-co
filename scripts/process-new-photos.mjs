import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const srcDir = path.resolve("_incoming-photos");
const outDir = path.resolve("public/images");
const portfolioDir = path.join(outDir, "portfolio");

fs.mkdirSync(portfolioDir, { recursive: true });

const jpeg = { quality: 82, mozjpeg: true };

async function save(pipeline, dest) {
  await pipeline.jpeg(jpeg).toFile(dest);
  const meta = await sharp(dest).metadata();
  console.log(
    path.basename(dest),
    `${meta.width}x${meta.height}`,
    `${Math.round((meta.size || 0) / 1024)}kb`
  );
}

function src(file) {
  return path.join(srcDir, file);
}

const files = {
  hero: "IMG_0743.jpg",
  heroAlt: "A990FAFF-A8CC-40E7-A434-7F80B7195044.png",
  featureDrawer: "IMG_0703.jpg",
  boardAction: "IMG_0719.jpg",
  brand: "IMG_0673.jpg",
  boardMaple: "IMG_0685.jpg",
  boardMapleAlt: "IMG_0743.jpg",
  boardBamboo: "IMG_0725.jpg",
  boardGroove: "IMG_0695.jpg",
  logoClose: "IMG_0673.jpg",
  story: "29217372-7E1D-4472-94B8-0CC2B676F14C.jpg",
  ugc1: "IMG_0719.jpg",
  ugc2: "IMG_0725.jpg",
  ugc3: "IMG_0685.jpg",
  ugc4: "IMG_0743.jpg",
  ugc5: "IMG_0703.jpg",
  ugc6: "IMG_0673.jpg",
};

for (const [key, file] of Object.entries(files)) {
  const filePath = src(file);
  if (!fs.existsSync(filePath)) {
    console.warn("Missing", key, file);
    continue;
  }
  const meta = await sharp(filePath).metadata();
  console.log("SRC", key, file, `${meta.width}x${meta.height}`);
}

// Hero: full action shot with tray extended
await save(
  sharp(src(files.hero)).resize(2400, 1200, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "hero.jpg")
);

// Alternate hero / story image
await save(
  sharp(src(files.heroAlt)).resize(1800, 1200, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "story.jpg")
);

await save(
  sharp(src(files.featureDrawer)).resize(1800, 1400, {
    fit: "cover",
    position: "west",
  }),
  path.join(outDir, "feature-drawer.jpg")
);

await save(
  sharp(src(files.brand)).resize(1800, 1400, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "brand.jpg")
);

await save(
  sharp(src(files.boardMaple)).resize(1400, 1750, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "board-maple.jpg")
);

await save(
  sharp(src(files.boardBamboo)).resize(1400, 1750, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "board-bamboo.jpg")
);

await save(
  sharp(src(files.boardAction)).resize(1400, 1750, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "board-action.jpg")
);

await save(
  sharp(src(files.boardGroove)).resize(1400, 1750, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "board-groove.jpg")
);

await save(
  sharp(src(files.logoClose)).resize(1600, 1600, {
    fit: "cover",
    position: "attention",
  }),
  path.join(outDir, "logo-close.jpg")
);

const ugcFiles = [
  ["ugc-1.jpg", files.ugc1],
  ["ugc-2.jpg", files.ugc2],
  ["ugc-3.jpg", files.ugc3],
  ["ugc-4.jpg", files.ugc4],
  ["ugc-5.jpg", files.ugc5],
  ["ugc-6.jpg", files.ugc6],
];

for (const [dest, source] of ugcFiles) {
  await save(
    sharp(src(source)).resize(900, 900, {
      fit: "cover",
      position: "attention",
    }),
    path.join(outDir, dest)
  );
}

const portfolioSources = [
  {
    file: "IMG_0743.jpg",
    slug: "brisket-service",
    width: 1600,
    height: 1200,
    position: "attention",
  },
  {
    file: "IMG_0719.jpg",
    slug: "juice-groove",
    width: 1200,
    height: 1500,
    position: "attention",
  },
  {
    file: "IMG_0703.jpg",
    slug: "drip-tray",
    width: 1600,
    height: 1200,
    position: "west",
  },
  {
    file: "IMG_0685.jpg",
    slug: "steak-rest",
    width: 1200,
    height: 1500,
    position: "attention",
  },
  {
    file: "IMG_0725.jpg",
    slug: "carving-line",
    width: 1200,
    height: 1500,
    position: "attention",
  },
  {
    file: "IMG_0673.jpg",
    slug: "laser-mark",
    width: 1200,
    height: 1500,
    position: "attention",
  },
  {
    file: "A990FAFF-A8CC-40E7-A434-7F80B7195044.png",
    slug: "bench-setup",
    width: 1200,
    height: 1500,
    position: "attention",
  },
  {
    file: "IMG_0695.jpg",
    slug: "edge-detail",
    width: 1200,
    height: 1500,
    position: "attention",
  },
  {
    file: "IMG_0678.jpg",
    slug: "grain-finish",
    width: 1200,
    height: 1500,
    position: "attention",
  },
  {
    file: "IMG_0697.jpg",
    slug: "smokehouse-cut",
    width: 1600,
    height: 1200,
    position: "attention",
  },
  {
    file: "IMG_0689.jpg",
    slug: "corner-groove",
    width: 1200,
    height: 1200,
    position: "attention",
  },
  {
    file: "29217372-7E1D-4472-94B8-0CC2B676F14C.jpg",
    slug: "mill-shot",
    width: 1600,
    height: 1200,
    position: "attention",
  },
];

for (const item of portfolioSources) {
  const source = src(item.file);
  if (!fs.existsSync(source)) {
    console.warn("Missing portfolio source", item.file);
    continue;
  }

  await save(
    sharp(source).resize(item.width, item.height, {
      fit: "cover",
      position: item.position,
    }),
    path.join(portfolioDir, `${item.slug}.jpg`)
  );
}

console.log("done");
