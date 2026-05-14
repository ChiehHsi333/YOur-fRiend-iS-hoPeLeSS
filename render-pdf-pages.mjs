import * as pdfjsLib from './node_modules/pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';
import fs from 'fs';

const pdfPath = './题目.pdf';
const outputDir = './pdf-rendered';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjsLib.getDocument({ data }).promise;

console.log(`PDF has ${doc.numPages} pages`);

const scale = 2;
for (let pageNum = 1; pageNum <= Math.min(doc.numPages, 15); pageNum++) {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport }).promise;

  const outFile = `${outputDir}/page_${String(pageNum).padStart(2, '0')}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outFile, buffer);
  console.log(`Rendered page ${pageNum} -> ${outFile} (${viewport.width}x${viewport.height})`);
}

console.log('Done rendering');
