const fs = require('fs');
const path = require('path');

// Try using pdfjs-dist to extract images
async function extractImages() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
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
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const imgName = ops.argsArray[i][0];
        try {
          const img = await page.objs.get(imgName);
          if (img && img.data) {
            const ext = img.kind === 'JPG' ? 'jpg' : 'png';
            const filename = path.join(outputDir, `page${pageNum}_img${imageCount}.${ext}`);
            fs.writeFileSync(filename, Buffer.from(img.data));
            console.log(`Saved: ${filename}`);
            imageCount++;
          }
        } catch (e) {
          // skip
        }
      }
    }
  }
  
  console.log(`Extracted ${imageCount} images`);
}

extractImages().catch(console.error);
