/**
 * Generates the PWA icon set from the Kyreo monogram.
 *
 * The source mark (public/brand/logo-source.png) is a white monogram on a
 * transparent ground — it was always meant to sit on a brand colour, so every
 * icon here composites it over navy. Run with: node scripts/generate-icons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SRC = "public/brand/logo-source.png";
const OUT = "public/icons";
const NAVY = { r: 0x1d, g: 0x3c, b: 0x58, alpha: 1 };

/**
 * @param {number} size  final icon edge length in px
 * @param {number} inset fraction of the canvas the mark occupies. Maskable icons
 *                       need the mark inside a 40% safe radius, so they get a
 *                       smaller inset than the standard "any" icons.
 */
async function icon(size, inset) {
  const markWidth = Math.round(size * inset);
  const mark = await sharp(SRC)
    .resize({ width: markWidth, fit: "inside" })
    .toBuffer();
  const { height: markHeight } = await sharp(mark).metadata();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: NAVY,
    },
  })
    .composite([
      {
        input: mark,
        top: Math.round((size - (markHeight ?? markWidth)) / 2),
        left: Math.round((size - markWidth) / 2),
      },
    ])
    .png()
    .toBuffer();
}

const TARGETS = [
  { file: "icon-192.png", size: 192, inset: 0.62 },
  { file: "icon-512.png", size: 512, inset: 0.62 },
  { file: "icon-maskable-192.png", size: 192, inset: 0.46 },
  { file: "icon-maskable-512.png", size: 512, inset: 0.46 },
  // iOS home screen. Must be opaque — Safari does not composite transparency.
  { file: "apple-touch-icon.png", size: 180, inset: 0.62 },
];

await mkdir(OUT, { recursive: true });
for (const { file, size, inset } of TARGETS) {
  await writeFile(`${OUT}/${file}`, await icon(size, inset));
  console.log(`  ${OUT}/${file}  ${size}x${size}`);
}
console.log("icon set generated");
