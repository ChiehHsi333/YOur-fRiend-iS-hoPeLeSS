import sharp from 'sharp';
import fs from 'fs';

const inputFile = './pdf-page-1.png';
const outputDir = './images/questions';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get image info
const metadata = await sharp(inputFile).metadata();
console.log(`Image size: ${metadata.width}x${metadata.height}`);

// From the screenshot, page 1 has 10 questions in a 5x2 grid
// Each question has an image at the top
// Based on visual inspection of the screenshot:
// - 5 columns, 2 rows of questions
// - Each question card has an image at the top portion

// Let's crop the top portion of each question card
// Approximate coordinates based on 2400x1800 image
const imgW = metadata.width;
const imgH = metadata.height;

// The questions seem to be arranged in a grid
// Let's define approximate regions for each question's top image
// Based on the screenshot, each question card is roughly:
// Width: imgW / 5, Height: imgH / 2 (for the card)
// The image is at the top of each card

const cols = 5;
const rows = 2;
const cardW = Math.floor(imgW / cols);
const cardH = Math.floor(imgH / rows);

// The image appears to be in the upper portion of each card
// Let's crop a region from each card
const imageHeight = Math.floor(cardH * 0.45); // top 45% of card is image
const imageWidth = Math.floor(cardW * 0.9);   // slightly narrower than card

let qNum = 1;
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const left = Math.floor(col * cardW + (cardW - imageWidth) / 2);
    const top = Math.floor(row * cardH + 10); // small offset from top
    
    const outputFile = `${outputDir}/q${qNum}.png`;
    
    try {
      await sharp(inputFile)
        .extract({ left, top, width: imageWidth, height: imageHeight })
        .toFile(outputFile);
      console.log(`Saved: ${outputFile} (${left},${top} ${imageWidth}x${imageHeight})`);
    } catch (e) {
      console.error(`Error cropping q${qNum}:`, e.message);
    }
    
    qNum++;
  }
}

console.log(`\nCropped ${qNum - 1} question images to ${outputDir}`);
