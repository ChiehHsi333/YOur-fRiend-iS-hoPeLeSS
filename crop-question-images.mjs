import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = './pdf-rendered';
const outputDir = './images/questions';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir)
  .filter(f => f.endsWith('.png'))
  .sort((a, b) => {
    const na = parseInt(a.match(/\d+/)[0], 10);
    const nb = parseInt(b.match(/\d+/)[0], 10);
    return na - nb;
  });

// Crop top region of each page as the question hero image
const left = 80;
const top = 60;
const width = 1031;
const height = 520;

for (const file of files) {
  const inputPath = path.join(inputDir, file);
  const qNum = parseInt(file.match(/\d+/)[0], 10);
  const outputPath = path.join(outputDir, `q${qNum}.png`);

  try {
    const meta = await sharp(inputPath).metadata();
    const cropWidth = Math.min(width, meta.width - left);
    const cropHeight = Math.min(height, meta.height - top);
    await sharp(inputPath)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .toFile(outputPath);
    console.log(`Saved q${qNum}.png (${cropWidth}x${cropHeight})`);
  } catch (e) {
    console.error(`Error cropping ${file}:`, e.message);
  }
}

console.log('\nDone!');
