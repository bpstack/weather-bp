import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");
const svg = readFileSync(join(publicDir, "favicon.svg"));

const sizes = [
  { file: "favicon-16x16.png",             size: 16,  maskable: false },
  { file: "con-16x16.png",                 size: 16,  maskable: false },
  { file: "favicon-32x32.png",             size: 32,  maskable: false },
  { file: "apple-touch-icon.png",          size: 180, maskable: false },
  { file: "android-chrome-192x192.png",    size: 192, maskable: false },
  { file: "android-chrome-512x512.png",    size: 512, maskable: false },
  { file: "android-chrome-512x512-maskable.png", size: 512, maskable: true },
];

// For maskable icons the safe zone is the center 80% → pad to 20% on each side
async function renderSvg(svgBuf, px, maskable) {
  if (!maskable) {
    return sharp(svgBuf, { density: Math.round((px / 64) * 72) })
      .resize(px, px)
      .png()
      .toBuffer();
  }
  // Maskable: render icon at 73% of canvas, center it on dark bg
  const iconPx = Math.round(px * 0.73);
  const pad = Math.round((px - iconPx) / 2);
  const iconBuf = await sharp(svgBuf, { density: Math.round((iconPx / 64) * 72) })
    .resize(iconPx, iconPx)
    .png()
    .toBuffer();
  return sharp({
    create: { width: px, height: px, channels: 4, background: { r: 12, g: 28, b: 54, alpha: 1 } },
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
