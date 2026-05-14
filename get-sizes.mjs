import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const pagesDir = './pdf-rendered';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.png')).sort();

for (const f of files) {
  const meta = await sharp(path.join(pagesDir, f)).metadata();
  console.log(`${f}: ${meta.width}x${meta.height}`);
}
