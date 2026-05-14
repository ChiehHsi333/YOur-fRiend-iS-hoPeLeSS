import sharp from 'sharp';
import fs from 'fs';

const input = './pdf-page-1.png';
const meta = await sharp(input).metadata();
const W = meta.width;
const H = meta.height;
console.log(`Image: ${W}x${H}`);

// Create a downscaled preview to inspect layout
await sharp(input)
  .resize(Math.round(W / 8), Math.round(H / 8))
  .toFile('./pdf-preview.jpg');
console.log('Saved preview: pdf-preview.jpg');

// The page seems to have a title at top, then question cards in grid.
// Let's inspect top-left region of first question card at full resolution.
// Assume 5 columns. First card approx x:0-1400, y:200-2200
const cardW = Math.floor(W / 5);
const sampleRegions = [
  { name: 'q1-top',      left: 50, top: 200, w: cardW - 100, h: 400 },
  { name: 'q1-mid',      left: 50, top: 600, w: cardW - 100, h: 400 },
  { name: 'q6-top',      left: 50, top: 200 + Math.floor(H/2.5), w: cardW - 100, h: 400 },
  { name: 'q11-top',     left: 50, top: 200 + 2*Math.floor(H/2.5), w: cardW - 100, h: 400 },
];

for (const r of sampleRegions) {
  try {
    await sharp(input)
      .extract({ left: r.left, top: r.top, width: r.w, height: r.h })
      .toFile(`./inspect-${r.name}.png`);
    console.log(`Saved inspect-${r.name}.png`);
  } catch (e) {
    console.error(`Failed ${r.name}:`, e.message);
  }
}
