import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const FIXTURES_DIR = path.join(process.cwd(), 'tests', 'fixtures', 'images');

export async function generateAllFixtures() {
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  const WIDTH = 256;
  const HEIGHT = 256;

  // Helper to create raw RGB buffer
  function createBaseBuffer(width = WIDTH, height = HEIGHT): Buffer {
    const buf = Buffer.alloc(width * height * 3);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 3;
        // Wood/bark base: Brown background
        let r = 90 + Math.floor(Math.sin(x / 10) * 15);
        let g = 65 + Math.floor(Math.sin(y / 12) * 10);
        let b = 45;

        // Circular central moss patch: (128, 128), radius 60
        const dx = x - 128;
        const dy = y - 128;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) {
          // Moss/lichen green
          r = 70;
          g = 135 + Math.floor(Math.cos(dist / 5) * 15);
          b = 40;
        }

        buf[idx] = Math.max(0, Math.min(255, r));
        buf[idx + 1] = Math.max(0, Math.min(255, g));
        buf[idx + 2] = Math.max(0, Math.min(255, b));
      }
    }
    return buf;
  }

  const baseBuf = createBaseBuffer();

  // 1. Baseline Image
  const pBaseline = path.join(FIXTURES_DIR, '01_baseline.png');
  await sharp(baseBuf, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
    .png()
    .toFile(pBaseline);

  // 2. Pixel-Identical Image
  const pIdentical = path.join(FIXTURES_DIR, '02_identical.png');
  fs.copyFileSync(pBaseline, pIdentical);

  // 3. Slightly Greener Variant (G + 30 on moss patch)
  const greenerBuf = Buffer.from(baseBuf);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const dx = x - 128;
      const dy = y - 128;
      if (Math.sqrt(dx * dx + dy * dy) < 70) {
        const idx = (y * WIDTH + x) * 3;
        greenerBuf[idx + 1] = Math.min(255, greenerBuf[idx + 1] + 45);
      }
    }
  }
  const pGreener = path.join(FIXTURES_DIR, '03_slightly_greener.png');
  await sharp(greenerBuf, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
    .png()
    .toFile(pGreener);

  // 4. Large Color Change Variant (Autumn Bloom / Red Tint)
  const redBuf = Buffer.from(baseBuf);
  for (let i = 0; i < redBuf.length; i += 3) {
    redBuf[i] = Math.min(255, redBuf[i] + 70); // boost red
    redBuf[i + 1] = Math.max(0, redBuf[i + 1] - 40); // drop green
  }
  const pLargeColor = path.join(FIXTURES_DIR, '04_large_color_change.png');
  await sharp(redBuf, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
    .png()
    .toFile(pLargeColor);

  // 5. Brightness-Only Variant (+45 to R, G, B equally)
  const brightBuf = Buffer.from(baseBuf);
  for (let i = 0; i < brightBuf.length; i++) {
    brightBuf[i] = Math.min(255, brightBuf[i] + 45);
  }
  const pBright = path.join(FIXTURES_DIR, '05_brightness_increase.png');
  await sharp(brightBuf, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
    .png()
    .toFile(pBright);

  // 6. Darkened / Moisture Variant (-35 to R, G, B equally)
  const darkBuf = Buffer.from(baseBuf);
  for (let i = 0; i < darkBuf.length; i++) {
    darkBuf[i] = Math.max(0, darkBuf[i] - 35);
  }
  const pDark = path.join(FIXTURES_DIR, '06_darkened_moisture.png');
  await sharp(darkBuf, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
    .png()
    .toFile(pDark);

  // 7. Small Translation Shift (20px shift)
  const pTranslated = path.join(FIXTURES_DIR, '07_translated_shift.png');
  await sharp(pBaseline)
    .extract({ left: 16, top: 16, width: WIDTH - 16, height: HEIGHT - 16 })
    .extend({ top: 0, bottom: 16, left: 0, right: 16, background: { r: 90, g: 65, b: 45 } })
    .toFile(pTranslated);

  // 8. Rotated Variant (15 degrees)
  const pRotated = path.join(FIXTURES_DIR, '08_rotated.png');
  await sharp(pBaseline)
    .rotate(15, { background: { r: 90, g: 65, b: 45 } })
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .toFile(pRotated);

  // 9. Scaled / Distance Change (Zoomed in 1.4x)
  const pScaled = path.join(FIXTURES_DIR, '09_scaled_distance.png');
  await sharp(pBaseline)
    .extract({ left: 36, top: 36, width: 184, height: 184 })
    .resize(WIDTH, HEIGHT)
    .toFile(pScaled);

  // 10. Partial Occlusion (Grey leaf or object covering corner)
  const occludedBuf = Buffer.from(baseBuf);
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      const idx = (y * WIDTH + x) * 3;
      occludedBuf[idx] = 160;     // Gray
      occludedBuf[idx + 1] = 160;
      occludedBuf[idx + 2] = 160;
    }
  }
  const pOccluded = path.join(FIXTURES_DIR, '10_partial_occlusion.png');
  await sharp(occludedBuf, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
    .png()
    .toFile(pOccluded);

  // 11. Blurred / Low-Resolution
  const pBlurred = path.join(FIXTURES_DIR, '11_blurred_lowres.png');
  await sharp(pBaseline)
    .blur(6)
    .toFile(pBlurred);

  // 12. Unrelated Scene (Blue sky, bright stone, water)
  const unrelatedBuf = Buffer.alloc(WIDTH * HEIGHT * 3);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const idx = (y * WIDTH + x) * 3;
      unrelatedBuf[idx] = 40;     // low red
      unrelatedBuf[idx + 1] = 120; // cyan-blue
      unrelatedBuf[idx + 2] = 220; // high blue
    }
  }
  const pUnrelated = path.join(FIXTURES_DIR, '12_unrelated_scene.png');
  await sharp(unrelatedBuf, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
    .png()
    .toFile(pUnrelated);

  // 13. Different Aspect Ratio (16:9 - 455x256)
  const pAspect16_9 = path.join(FIXTURES_DIR, '13_aspect_ratio_16_9.png');
  const wideBuf = createBaseBuffer(455, 256);
  await sharp(wideBuf, { raw: { width: 455, height: 256, channels: 3 } })
    .png()
    .toFile(pAspect16_9);

  // 14. Corrupted File (Invalid bytes)
  const pCorrupted = path.join(FIXTURES_DIR, '14_corrupted_bad_bytes.png');
  fs.writeFileSync(pCorrupted, Buffer.from('NOT_AN_IMAGE_PAYLOAD_CORRUPT_BYTES_XYZ_12345\x00\xFF\xAA'));

  console.log('✓ Successfully generated 14 synthetic image fixtures in tests/fixtures/images/');
}

// Run directly if invoked via CLI
if (process.argv[1]?.endsWith('generate-fixtures.ts') || process.argv[1]?.endsWith('generate-fixtures.js')) {
  generateAllFixtures().catch(console.error);
}
