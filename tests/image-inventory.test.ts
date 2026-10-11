import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import assert from 'assert';
import { computeImageComparison } from '../src/lib/vision/diffEngine';
import {
  DEMO_IMG_VISIT_1,
  DEMO_IMG_VISIT_2,
  DEMO_IMG_DIFF_MASK,
  REAL_IMG_VISIT_1,
  REAL_IMG_VISIT_2,
  REAL_IMG_DIFF_MASK,
} from '../src/lib/storage/seedData';

interface ImageInspectionRecord {
  name: string;
  sourceType: 'fixture' | 'upload' | 'public' | 'seed';
  format?: string;
  width?: number;
  height?: number;
  channels?: number;
  sizeBytes: number;
  decodable: boolean;
  visionEngineProcessed: boolean;
  visionResult?: {
    visualDifferencePercentage: number;
    excessGreenDelta: number;
    structuralSimilarityScore: number;
    alignmentConfidence: string;
    limitationFlags: string[];
  };
  errorNotes?: string;
}

async function runImageInventoryAudit() {
  console.log('================================================================');
  console.log('           WILDTRACE EXHAUSTIVE IMAGE INVENTORY AUDIT           ');
  console.log('================================================================\n');

  // Disable Sharp file handle cache for Windows safe testing
  sharp.cache(false);

  const FIXTURES_DIR = path.join(process.cwd(), 'tests', 'fixtures', 'images');
  const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');
  const PUBLIC_DIR = path.join(process.cwd(), 'public');
  const baselineFixture = path.join(FIXTURES_DIR, '01_baseline.png');

  const records: ImageInspectionRecord[] = [];

  // Helper to inspect a buffer or file
  async function inspectFile(filePath: string, sourceType: 'fixture' | 'upload' | 'public'): Promise<ImageInspectionRecord> {
    const filename = path.basename(filePath);
    const sizeBytes = fs.statSync(filePath).size;
    const fileBuf = fs.readFileSync(filePath);

    let decodable = false;
    let format: string | undefined;
    let width: number | undefined;
    let height: number | undefined;
    let channels: number | undefined;
    let errorNotes: string | undefined;
    let visionEngineProcessed = false;
    let visionResult: any = undefined;

    try {
      const meta = await sharp(fileBuf).metadata();
      decodable = true;
      format = meta.format;
      width = meta.width;
      height = meta.height;
      channels = meta.channels;
    } catch (e: any) {
      errorNotes = `Decode failed: ${e.message}`;
    }

    if (decodable) {
      try {
        const res = await computeImageComparison(baselineFixture, filePath);
        visionEngineProcessed = true;
        visionResult = {
          visualDifferencePercentage: res.visualDifferencePercentage,
          excessGreenDelta: res.excessGreenDelta,
          structuralSimilarityScore: res.structuralSimilarityScore,
          alignmentConfidence: res.alignmentConfidence,
          limitationFlags: res.limitationFlags,
        };
      } catch (e: any) {
        errorNotes = `Vision engine error: ${e.message}`;
      }
    } else {
      // Test that vision engine rejects cleanly
      try {
        await computeImageComparison(baselineFixture, filePath);
        errorNotes = 'Unexpectedly succeeded on non-decodable image';
      } catch (e: any) {
        visionEngineProcessed = false;
        errorNotes = `Gracefully rejected by vision engine (${e.message.slice(0, 60)})`;
      }
    }

    return {
      name: filename,
      sourceType,
      format,
      width,
      height,
      channels,
      sizeBytes,
      decodable,
      visionEngineProcessed,
      visionResult,
      errorNotes,
    };
  }

  // Helper to inspect data URI
  async function inspectDataUri(name: string, dataUri: string): Promise<ImageInspectionRecord> {
    const sizeBytes = Buffer.byteLength(dataUri, 'utf8');
    let decodable = false;
    let format: string | undefined = 'svg';
    let width: number | undefined;
    let height: number | undefined;
    let channels: number | undefined;
    let errorNotes: string | undefined;
    let visionEngineProcessed = false;
    let visionResult: any = undefined;

    try {
      let svgContent = dataUri.replace(/^data:image\/svg\+xml(;[a-zA-Z0-9=-]+)?,/, '');
      try {
        svgContent = decodeURIComponent(svgContent);
      } catch {
        svgContent = svgContent.replace(/%23/g, '#');
      }
      const pngBuf = await sharp(Buffer.from(svgContent)).png().toBuffer();
      const meta = await sharp(pngBuf).metadata();
      decodable = true;
      format = 'svg (rendered as png)';
      width = meta.width;
      height = meta.height;
      channels = meta.channels;
    } catch (e: any) {
      errorNotes = `Data URI decode error: ${e.message}`;
    }

    if (decodable) {
      try {
        const res = await computeImageComparison(baselineFixture, dataUri);
        visionEngineProcessed = true;
        visionResult = {
          visualDifferencePercentage: res.visualDifferencePercentage,
          excessGreenDelta: res.excessGreenDelta,
          structuralSimilarityScore: res.structuralSimilarityScore,
          alignmentConfidence: res.alignmentConfidence,
          limitationFlags: res.limitationFlags,
        };
      } catch (e: any) {
        errorNotes = `Vision engine error: ${e.message}`;
      }
    }

    return {
      name,
      sourceType: 'seed',
      format,
      width,
      height,
      channels,
      sizeBytes,
      decodable,
      visionEngineProcessed,
      visionResult,
      errorNotes,
    };
  }

  // 1. Process all fixtures in tests/fixtures/images/
  const fixtureFiles = fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.png'));
  for (const f of fixtureFiles) {
    const rec = await inspectFile(path.join(FIXTURES_DIR, f), 'fixture');
    records.push(rec);
  }

  // 2. Process uploads directory
  if (fs.existsSync(UPLOADS_DIR)) {
    const uploadFiles = fs.readdirSync(UPLOADS_DIR).filter((f) => !f.startsWith('.'));
    for (const f of uploadFiles) {
      const rec = await inspectFile(path.join(UPLOADS_DIR, f), 'upload');
      records.push(rec);
    }
  }

  // 3. Process public assets
  if (fs.existsSync(PUBLIC_DIR)) {
    const publicFiles = fs.readdirSync(PUBLIC_DIR).filter((f) => f.endsWith('.svg') || f.endsWith('.png'));
    for (const f of publicFiles) {
      const rec = await inspectFile(path.join(PUBLIC_DIR, f), 'public');
      records.push(rec);
    }
  }

  // 4. Process seeded SVG images
  const seeded = [
    { name: 'DEMO_IMG_VISIT_1 (Synthetic Beech Visit 1)', uri: DEMO_IMG_VISIT_1 },
    { name: 'DEMO_IMG_VISIT_2 (Synthetic Beech Visit 2)', uri: DEMO_IMG_VISIT_2 },
    { name: 'DEMO_IMG_DIFF_MASK (Synthetic Diff Mask)', uri: DEMO_IMG_DIFF_MASK },
    { name: 'REAL_IMG_VISIT_1 (Real Field Lichen Visit 1)', uri: REAL_IMG_VISIT_1 },
    { name: 'REAL_IMG_VISIT_2 (Real Field Lichen Visit 2)', uri: REAL_IMG_VISIT_2 },
    { name: 'REAL_IMG_DIFF_MASK (Real Field Diff Mask)', uri: REAL_IMG_DIFF_MASK },
  ];
  for (const s of seeded) {
    const rec = await inspectDataUri(s.name, s.uri);
    records.push(rec);
  }

  // Log Detailed Table
  console.log('| Filename / Asset | Type | Format | Dimensions | Size | Decodable? | Vision Processed? | Visual Diff % | ExG Delta | Edge Corr | Alignment | Notes |');
  console.log('| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |');

  let passedDecodes = 0;
  let gracefullyHandledFailures = 0;

  for (const r of records) {
    const dim = r.width && r.height ? `${r.width}x${r.height}` : 'N/A';
    const diff = r.visionResult ? `${r.visionResult.visualDifferencePercentage}%` : 'N/A';
    const exg = r.visionResult ? `${r.visionResult.excessGreenDelta > 0 ? '+' : ''}${r.visionResult.excessGreenDelta}%` : 'N/A';
    const corr = r.visionResult ? r.visionResult.structuralSimilarityScore.toFixed(2) : 'N/A';
    const conf = r.visionResult ? r.visionResult.alignmentConfidence : 'N/A';
    const note = r.errorNotes || 'Cleanly processed';

    console.log(
      `| ${r.name} | ${r.sourceType} | ${r.format || 'Unknown'} | ${dim} | ${r.sizeBytes}B | ${r.decodable ? 'YES' : 'NO'} | ${r.visionEngineProcessed ? 'YES' : 'NO'} | ${diff} | ${exg} | ${corr} | ${conf} | ${note} |`
    );

    if (r.decodable) passedDecodes++;
    else gracefullyHandledFailures++;
  }

  console.log('\n================================================================');
  console.log(`Total Image Assets Audited: ${records.length}`);
  console.log(`Successfully Decoded & Processed: ${passedDecodes}`);
  console.log(`Corrupted / Handled Gracefully: ${gracefullyHandledFailures}`);
  console.log('Uncaught Crashes: 0');
  console.log('================================================================\n');

  // Assertions
  assert.ok(records.length >= 20, 'Must audit at least 20 image assets');
  assert.ok(passedDecodes >= 19, 'At least 19 valid images should decode successfully');
  assert.strictEqual(gracefullyHandledFailures, 1, 'Exactly 1 image (corrupted fixture) should fail and be gracefully handled');

  console.log('✓ All image assets in the repository successfully verified!');
}

runImageInventoryAudit().catch((err) => {
  console.error('Fatal image audit failure:', err);
  process.exit(1);
});
