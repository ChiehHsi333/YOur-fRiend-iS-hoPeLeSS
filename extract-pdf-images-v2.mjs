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

for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
  const page = await doc.getPage(pageNum);
  const ops = await page.getOperatorList();

  const imageNames = [];
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
      imageNames.push(ops.argsArray[i][0]);
    } else if (ops.fnArray[i] === pdfjsLib.OPS.paintJpegXObject) {
      imageNames.push(ops.argsArray[i][0]);
    }
  }

  console.log(`Page ${pageNum}: found ${imageNames.length} images`);

  for (const name of imageNames) {
    try {
      const ref = await page.objs.get(name);
      if (!ref) {
        console.log(`  ${name}: no ref`);
        continue;
      }
      // Try to resolve the object
      let imgData = null;
      if (ref.data) {
        imgData = ref.data;
      } else if (ref.get) {
        const obj = await ref.get();
        if (obj && obj.data) imgData = obj.data;
      }

      if (!imgData || !imgData.length) {
        console.log(`  ${name}: no data`);
        continue;
      }

      const ext = imgData[0] === 0xFF && imgData[1] === 0xD8 ? 'jpg' : 'png';
      const outFile = path.join(outputDir, `page${pageNum}_img${imageCount}.${ext}`);
      fs.writeFileSync(outFile, Buffer.from(imgData));
      console.log(`  Saved ${name} -> ${outFile} (${imgData.length} bytes)`);
      imageCount++;
    } catch (e) {
      console.error(`  Error extracting ${name}:`, e.message);
    }
  }
}

console.log(`\nTotal images extracted: ${imageCount}`);
