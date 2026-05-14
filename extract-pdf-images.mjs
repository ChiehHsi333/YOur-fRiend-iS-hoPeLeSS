import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

const data = new Uint8Array(fs.readFileSync('./题目.pdf'));
const pdf = await pdfjsLib.getDocument({ data }).promise;

const outputDir = './images/questions';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let imageCount = 0;

for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  const page = await pdf.getPage(pageNum);
  const ops = await page.getOperatorList();
  
  // Collect all image names first
  const imageNames = [];
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject ||
        ops.fnArray[i] === pdfjsLib.OPS.paintImageXObjectRepeat) {
      imageNames.push(ops.argsArray[i][0]);
    }
  }
  
  // Wait for all images to be resolved
  const imagePromises = imageNames.map(name => page.objs.get(name).catch(() => null));
  const images = await Promise.all(imagePromises);
  
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img || !img.data) continue;
    
    try {
      const ext = img.kind === 'JPG' ? 'jpg' : 'png';
      const filename = path.join(outputDir, `page${pageNum}_img${imageCount}.${ext}`);
      fs.writeFileSync(filename, Buffer.from(img.data));
      console.log(`Saved: ${filename} (${img.width}x${img.height}, kind:${img.kind})`);
      imageCount++;
    } catch (e) {
      console.error(`Error saving page ${pageNum} image ${i}:`, e.message);
    }
  }
}

console.log(`\nExtracted ${imageCount} images to ${outputDir}`);
