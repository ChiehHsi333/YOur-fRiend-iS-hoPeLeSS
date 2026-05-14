import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = './题目图片';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort((a,b) => parseInt(a)-parseInt(b));
for (const f of files) {
  const meta = await sharp(path.join(dir, f)).metadata();
  console.log(`${f}: ${meta.width}x${meta.height}`);
}
