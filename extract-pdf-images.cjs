const fs = require('fs');
const path = require('path');

(async () => {
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.cjs');
  
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
            console.log(`Saved: ${filename} (${img.width}x${img.height}, ${img.kind})`);
            imageCount++;
          }
        } catch (e) {
          console.error(`Error on page ${pageNum}, image ${imgName}:`, e.message);
        }
      }
    }
  }
  
  console.log(`\nExtracted ${imageCount} images to ${outputDir}`);
})();
