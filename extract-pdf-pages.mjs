import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs';
import fs from 'fs';
import { createCanvas } from 'canvas';

const data = new Uint8Array(fs.readFileSync('./题目.pdf'));
const pdf = await pdfjsLib.getDocument({ data }).promise;

const outputDir = './images/questions';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  const page = await pdf.getPage(pageNum);
  const scale = 2.0;
  const viewport = page.getViewport({ scale });
  
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  
  await page.render({ canvasContext: ctx, viewport }).promise;
  
  const buffer = canvas.toBuffer('image/png');
  const filename = `${outputDir}/page${pageNum}.png`;
  fs.writeFileSync(filename, buffer);
  console.log(`Saved: ${filename} (${viewport.width}x${viewport.height})`);
}

console.log(`\nRendered ${pdf.numPages} pages to ${outputDir}`);
