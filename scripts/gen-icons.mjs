import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");
const svg = readFileSync(join(publicDir, "favicon.svg"));

const sizes = [
  { file: "favicon-16x16.png", size: 16, maskable: false },
  { file: "con-16x16.png", size: 16, maskable: false },
  { file: "favicon-32x32.png", size: 32, maskable: false },
  { file: "apple-touch-icon.png", size: 180, maskable: false },
  { file: "android-chrome-192x192.png", size: 192, maskable: false },
  { file: "android-chrome-512x512.png", size: 512, maskable: false },
  { file: "android-chrome-512x512-maskable.png", size: 512, maskable: true },
];

const BG = { r: 255, g: 255, b: 255, alpha: 1 };

// All PNGs are rendered on a solid full-bleed background so no OS (iOS/Android)
// fills transparent corners with black.
async function renderSvg(svgBuf, px, maskable) {
  const iconPx = maskable ? Math.round(px * 0.73) : px;
  const pad = maskable ? Math.round((px - iconPx) / 2) : 0;

  const iconBuf = await sharp(svgBuf, {
    density: Math.round((iconPx / 64) * 72),
  })
    .resize(iconPx, iconPx)
    .png()
    .toBuffer();

  return sharp({
    create: { width: px, height: px, channels: 4, background: BG },
  })
    .composite([{ input: iconBuf, left: pad, top: pad }])
    .png()
    .toBuffer();
}

for (const { file, size, maskable } of sizes) {
  const buf = await renderSvg(svg, size, maskable);
  await sharp(buf).toFile(join(publicDir, file));
  console.log(`✓ ${file} (${size}px${maskable ? " maskable" : ""})`);
}

// favicon.ico: embed 16 and 32 px layers (use 32px as single layer — browsers accept PNG-in-ICO)
const ico32 = await renderSvg(svg, 32, false);
await sharp(ico32).toFile(join(publicDir, "favicon.ico"));
console.log("✓ favicon.ico (32px)");
