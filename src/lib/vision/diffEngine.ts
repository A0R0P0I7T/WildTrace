import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/storage/db';

export interface DiffResult {
  visualDifferencePercentage: number; // Photometric frame shift percentage
  excessGreenDelta: number;           // Excess Green Index shift (image-derived)
  structuralSimilarityScore: number;  // Edge gradient correlation
  diffMaskPath: string;
  alignmentConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  limitationFlags: string[];
}

/**
 * Loads an image from a local path, data URI, or upload URL into a Sharp instance
 */
async function loadSharpBuffer(imageSource: string): Promise<Buffer> {
  if (imageSource.startsWith('data:image')) {
    if (imageSource.includes('svg+xml')) {
      let svgContent = imageSource.replace(/^data:image\/svg\+xml(;[a-zA-Z0-9=-]+)?,/, '');
      try {
        svgContent = decodeURIComponent(svgContent);
      } catch {
        svgContent = svgContent.replace(/%23/g, '#');
      }
      return sharp(Buffer.from(svgContent)).png().toBuffer();
    }
    const base64Data = imageSource.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

  if (imageSource.startsWith('/api/uploads/')) {
    const filename = path.basename(imageSource);
    const diskPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(diskPath)) {
      return fs.readFileSync(diskPath);
    }
  }

  if (fs.existsSync(imageSource)) {
    return fs.readFileSync(imageSource);
  }

  const publicPath = path.join(process.cwd(), 'public', imageSource.replace(/^\//, ''));
  if (fs.existsSync(publicPath)) {
    return fs.readFileSync(publicPath);
  }

  throw new Error(`Unable to load image buffer from source: ${imageSource.substring(0, 50)}...`);
}

/**
 * Computes simple 3x3 Sobel gradient magnitude for edge correlation evaluation
 */
function computeSobelEdges(grayscale: Uint8Array, width: number, height: number): Float32Array {
  const edges = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      // Sobel horizontal
      const gx =
        -grayscale[idx - width - 1] +
        grayscale[idx - width + 1] -
        2 * grayscale[idx - 1] +
        2 * grayscale[idx + 1] -
        grayscale[idx + width - 1] +
        grayscale[idx + width + 1];

      // Sobel vertical
      const gy =
        -grayscale[idx - width - 1] -
        2 * grayscale[idx - width] -
        grayscale[idx - width + 1] +
        grayscale[idx + width - 1] +
        2 * grayscale[idx + width] +
        grayscale[idx + width + 1];

      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return edges;
}

/**
 * Calculates genuine image-derived photometric indicators and checks alignment suitability
 */
export async function computeImageComparison(
  baselinePath: string,
  targetPath: string
): Promise<DiffResult> {
  const WIDTH = 256;
  const HEIGHT = 256;

  // 1. Normalize and resize both images to standard square grid for initial analysis
  const buf1 = await loadSharpBuffer(baselinePath);
  const buf2 = await loadSharpBuffer(targetPath);

  const raw1 = await sharp(buf1)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer();

  const raw2 = await sharp(buf2)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer();

  let totalPixels = WIDTH * HEIGHT;
  let alteredPixels = 0;
  let sumExG1 = 0;
  let sumExG2 = 0;
  let sumLum1 = 0;
  let sumLum2 = 0;

  const gray1 = new Uint8Array(totalPixels);
  const gray2 = new Uint8Array(totalPixels);

  const GRID_SIZE = 16;
  const CELL_PX = WIDTH / GRID_SIZE;
  const gridHotspots = new Array(GRID_SIZE * GRID_SIZE).fill(0);

  for (let i = 0; i < totalPixels; i++) {
    const r1 = raw1[i * 3];
    const g1 = raw1[i * 3 + 1];
    const b1 = raw1[i * 3 + 2];

    const r2 = raw2[i * 3];
    const g2 = raw2[i * 3 + 1];
    const b2 = raw2[i * 3 + 2];

    // Grayscale luminance
    const lum1 = Math.round(0.299 * r1 + 0.587 * g1 + 0.114 * b1);
    const lum2 = Math.round(0.299 * r2 + 0.587 * g2 + 0.114 * b2);
    gray1[i] = lum1;
    gray2[i] = lum2;
    sumLum1 += lum1;
    sumLum2 += lum2;

    // Excess Green Index (ExG = 2G - R - B)
    const exg1 = 2 * g1 - r1 - b1;
    const exg2 = 2 * g2 - r2 - b2;
    sumExG1 += exg1;
    sumExG2 += exg2;

    // Euclidean color distance in RGB space
    const dist = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
    if (dist > 30) {
      alteredPixels++;
      const x = i % WIDTH;
      const y = Math.floor(i / WIDTH);
      const gx = Math.floor(x / CELL_PX);
      const gy = Math.floor(y / CELL_PX);
      gridHotspots[gy * GRID_SIZE + gx]++;
    }
  }

  // 2. Correlation of edge gradients to detect framing/perspective consistency
  const edges1 = computeSobelEdges(gray1, WIDTH, HEIGHT);
  const edges2 = computeSobelEdges(gray2, WIDTH, HEIGHT);

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  for (let i = 0; i < totalPixels; i++) {
    dotProduct += edges1[i] * edges2[i];
    mag1 += edges1[i] * edges1[i];
    mag2 += edges2[i] * edges2[i];
  }
  const edgeCorrelation = mag1 && mag2 ? dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2)) : 0;
  const structuralSimilarityScore = Math.round(Math.max(0, Math.min(1, edgeCorrelation)) * 100) / 100;

  // 3. Evaluate Metrics & Suitability
  const visualDifferencePercentage = Math.round((alteredPixels / totalPixels) * 1000) / 10;
  const avgExG1 = sumExG1 / totalPixels;
  const avgExG2 = sumExG2 / totalPixels;
  const excessGreenDelta = Math.round((avgExG2 - avgExG1) * 10) / 10;

  const avgLum1 = sumLum1 / totalPixels;
  const avgLum2 = sumLum2 / totalPixels;
  const luminanceDeltaPercent = Math.abs((avgLum2 - avgLum1) / (avgLum1 || 1)) * 100;

  const limitationFlags: string[] = [];

  // Lighting Disparity Warning
  if (luminanceDeltaPercent > 28) {
    limitationFlags.push('HIGH_ILLUMINATION_DISPARITY');
  }

  // Structural Alignment Confidence Scoring
  let alignmentConfidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
  if (structuralSimilarityScore < 0.45 || visualDifferencePercentage > 50) {
    alignmentConfidence = 'LOW';
    limitationFlags.push('INCOMPATIBLE_FOR_PIXEL_DIFF');
    limitationFlags.push('PERSPECTIVE_SHIFT_DETECTED');
  } else if (structuralSimilarityScore < 0.65 || visualDifferencePercentage > 30 || luminanceDeltaPercent > 22) {
    alignmentConfidence = 'MEDIUM';
    limitationFlags.push('MODERATE_FRAMING_VARIANCE');
  }

  // Generate SVG Heatmap difference mask
  let rectSvg = '';
  const maxCellPixels = CELL_PX * CELL_PX;
  for (let gy = 0; gy < GRID_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      const count = gridHotspots[gy * GRID_SIZE + gx];
      if (count > maxCellPixels * 0.1) {
        const opacity = Math.min(0.85, (count / maxCellPixels) * 1.2);
        const isGreening = excessGreenDelta > 0;
        const color = isGreening ? '%23a3e635' : '%23f43f5e';
        rectSvg += `<rect x="${gx * 50}" y="${gy * 50}" width="50" height="50" fill="${color}" fill-opacity="${opacity.toFixed(2)}" rx="8"/>`;
      }
    }
  }

  const diffMaskSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <rect width="800" height="800" fill="%23040805" fill-opacity="0.85"/>
    ${rectSvg}
    <text x="30" y="50" font-family="monospace" font-size="20" font-weight="bold" fill="%23a3e635">IMAGE-DERIVED DELTA MASK (${visualDifferencePercentage}% altered)</text>
    <text x="30" y="80" font-family="monospace" font-size="14" fill="%23cbd5e1">Excess Green Shift: ${excessGreenDelta > 0 ? '+' : ''}${excessGreenDelta} | Confidence: ${alignmentConfidence}</text>
  </svg>`;

  return {
    visualDifferencePercentage,
    excessGreenDelta,
    structuralSimilarityScore,
    diffMaskPath: diffMaskSvg,
    alignmentConfidence,
    limitationFlags,
  };
}
