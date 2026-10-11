import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { computeImageComparison } from '../src/lib/vision/diffEngine';

async function main() {
  const dir = path.join(process.cwd(), 'MossImages');
  const files = ['moss img1.jpeg', 'moss img2.jpeg', 'moss img3.jpeg'];

  console.log('================================================================');
  console.log('         MOSSIMAGES ASSET INSPECTION & VISION ANALYSIS          ');
  console.log('================================================================\n');

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const fullPath = path.join(dir, filename);
    const stat = fs.statSync(fullPath);
    const buf = fs.readFileSync(fullPath);

    const meta = await sharp(buf).metadata();
    const stats = await sharp(buf).stats();

    // Compute basic photometric metrics
    const meanR = stats.channels[0].mean;
    const meanG = stats.channels[1].mean;
    const meanB = stats.channels[2].mean;
    const exg = (2 * meanG - meanR - meanB) / 255;

    console.log(`[Image ${i + 1}] ${filename}:`);
    console.log(`  • Size on disk: ${stat.size} bytes (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`  • Format: ${meta.format} (channels: ${meta.channels}, space: ${meta.space})`);
    console.log(`  • Dimensions: ${meta.width} x ${meta.height}`);
    console.log(`  • Has EXIF: ${!!meta.exif}`);
    console.log(`  • Mean RGB: R=${meanR.toFixed(1)}, G=${meanG.toFixed(1)}, B=${meanB.toFixed(1)}`);
    console.log(`  • Mean Excess Green Index (ExG): ${(exg * 100).toFixed(2)}%`);
    console.log(`  • Perceived Luminance: ${(0.299 * meanR + 0.587 * meanG + 0.114 * meanB).toFixed(1)}/255\n`);
  }

  console.log('----------------------------------------------------------------');
  console.log('                  PAIRWISE COMPARISON METRICS                   ');
  console.log('----------------------------------------------------------------\n');

  const pairs = [
    { name: 'Comparison 1: Day 1 (moss img1) vs Day 7 (moss img2)', a: 'moss img1.jpeg', b: 'moss img2.jpeg' },
    { name: 'Comparison 2: Day 7 (moss img2) vs Day 14 (moss img3)', a: 'moss img2.jpeg', b: 'moss img3.jpeg' },
    { name: 'Comparison 3: Day 1 (moss img1) vs Day 14 (moss img3)', a: 'moss img1.jpeg', b: 'moss img3.jpeg' },
  ];

  for (const pair of pairs) {
    console.log(`▶ ${pair.name}:`);
    const pathA = path.join(dir, pair.a);
    const pathB = path.join(dir, pair.b);
    const comp = await computeImageComparison(pathA, pathB);
    console.log(`  • Visual Difference: ${comp.visualDifferencePercentage}%`);
    console.log(`  • Excess Green Delta: ${comp.excessGreenDelta > 0 ? '+' : ''}${comp.excessGreenDelta}%`);
    console.log(`  • Edge Correlation (Structural Similarity): ${comp.structuralSimilarityScore}`);
    console.log(`  • Alignment Confidence: ${comp.alignmentConfidence}`);
    console.log(`  • Limitation Flags: [${comp.limitationFlags.join(', ')}]`);
    console.log(`  • Diff Mask Generated: ${comp.diffMaskPath.startsWith('data:image/svg+xml') ? 'YES' : 'NO'}\n`);
  }
}

main().catch((err) => {
  console.error('Fatal error during MossImages inspection:', err);
  process.exit(1);
});
