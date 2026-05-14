import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

const pdfPath = './题目.pdf';
const outputDir = './images/questions';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjsLib.getDocument({ data }).promise;

console.log(`PDF has ${doc.numPages} pages`);

let imageCount = 0;
const seen = new Set();

for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
  const page = await doc.getPage(pageNum);
  const ops = await page.getOperatorList();

  const imageNames = [];
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject ||
        ops.fnArray[i] === pdfjsLib.OPS.paintJpegXObject) {
      imageNames.push(ops.argsArray[i][0]);
    }
  }

  if (imageNames.length === 0) continue;
  console.log(`Page ${pageNum}: found ${imageNames.length} images`);

  for (const name of imageNames) {
    if (seen.has(name)) continue;
    seen.add(name);
    try {
      // get() returns a Promise that resolves to the object
      const obj = await page.objs.get(name);
      if (!obj) {
        console.log(`  ${name}: null obj`);
        continue;
      }

      let imgData = null;
      if (obj.data) {
        imgData = obj.data;
      } else if (obj.get) {
        const inner = await obj.get();
        if (inner && inner.data) imgData = inner.data;
      }

      // Sometimes the data is directly in obj
      if (!imgData && obj.code) {
        // This might be a CanvasImage wrapper; try to extract raw data
      }

      if (!imgData) {
        // Try render to canvas and export
        console.log(`  ${name}: trying canvas render...`);
        continue;
      }

      const ext = imgData[0] === 0xFF && imgData[1] === 0xD8 ? 'jpg' : 'png';
      const outFile = path.join(outputDir, `page${pageNum}_${name}.${ext}`);
      fs.writeFileSync(outFile, Buffer.from(imgData));
      console.log(`  Saved ${name} -> ${outFile} (${imgData.length} bytes)`);
      imageCount++;
    } catch (e) {
      console.error(`  Error extracting ${name}:`, e.message);
    }
  }
}

console.log(`\nTotal images extracted: ${imageCount}`);

// Also try rendering each page to see what's there
console.log('\n--- Rendering pages to preview ---');
for (let pageNum = 1; pageNum <= Math.min(doc.numPages, 5); pageNum++) {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2 });
  console.log(`Page ${pageNum}: ${viewport.width}x${viewport.height}`);
}
