import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Resolves an observation image reference to a base64 Data URL suitable for multimodal VLM inference.
 * Supports disk upload paths (/api/uploads/...), data URIs (including SVG rasterization), and relative assets.
 */
export async function prepareImageAsDataUrl(imagePath: string): Promise<string> {
  if (!imagePath || typeof imagePath !== 'string') {
    throw new Error('Image path is required to prepare Data URL for vision model');
  }

  // 1. If it's already an SVG Data URI, rasterize to PNG via Sharp
  if (imagePath.startsWith('data:image/svg+xml')) {
    const rawSvg = decodeURIComponent(imagePath.replace(/^data:image\/svg\+xml;?(?:utf8)?,/, ''));
    const pngBuffer = await sharp(Buffer.from(rawSvg)).png().toBuffer();
    return `data:image/png;base64,${pngBuffer.toString('base64')}`;
  }

  // 2. If it's already a raster Base64 Data URI (png/jpeg/webp)
  if (imagePath.startsWith('data:image/')) {
    return imagePath;
  }

  // 3. Direct disk path check (restricted strictly to valid image extensions)
  const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg']);
  if (fs.existsSync(imagePath)) {
    const ext = path.extname(imagePath).toLowerCase();
    if (!ALLOWED_IMAGE_EXTS.has(ext)) {
      throw new Error(`Unauthorized or non-image file access denied: ${ext || 'no extension'}`);
    }
    const fileBytes = await fs.promises.readFile(imagePath);
    let mime = 'image/webp';
    if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
    else if (ext === '.png') mime = 'image/png';
    else if (ext === '.webp') mime = 'image/webp';
    else if (ext === '.svg') {
      const pngBuffer = await sharp(fileBytes).png().toBuffer();
      return `data:image/png;base64,${pngBuffer.toString('base64')}`;
    }
    return `data:${mime};base64,${fileBytes.toString('base64')}`;
  }

  // 3. If it's an uploaded file path like /api/uploads/obs-xyz.webp
  let filename = imagePath;
  if (imagePath.startsWith('/api/uploads/')) {
    filename = path.basename(imagePath);
  }

  const uploadDir = path.join(process.cwd(), 'data', 'uploads');
  const diskPath = path.join(uploadDir, filename);

  if (fs.existsSync(diskPath)) {
    const fileBytes = await fs.promises.readFile(diskPath);
    const ext = path.extname(diskPath).toLowerCase();
    let mime = 'image/webp';
    if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
    else if (ext === '.png') mime = 'image/png';
    else if (ext === '.webp') mime = 'image/webp';
    else if (ext === '.svg') {
      const pngBuffer = await sharp(fileBytes).png().toBuffer();
      return `data:image/png;base64,${pngBuffer.toString('base64')}`;
    }
    return `data:${mime};base64,${fileBytes.toString('base64')}`;
  }

  // 4. Check if it's a fixture or public asset path
  const sanitized = imagePath.replace(/^\//, '');
  let altPath: string | null = null;
  if (sanitized.startsWith('tests/')) {
    altPath = path.join(process.cwd(), 'tests', sanitized.slice(6));
  } else if (sanitized.startsWith('public/')) {
    altPath = path.join(process.cwd(), 'public', sanitized.slice(7));
  }

  if (altPath && fs.existsSync(altPath)) {
    const fileBytes = await fs.promises.readFile(altPath);
    const ext = path.extname(altPath).toLowerCase();
    let mime = 'image/webp';
    if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
    else if (ext === '.png') mime = 'image/png';
    else if (ext === '.webp') mime = 'image/webp';
    else if (ext === '.svg') {
      const pngBuffer = await sharp(fileBytes).png().toBuffer();
      return `data:image/png;base64,${pngBuffer.toString('base64')}`;
    }
    return `data:${mime};base64,${fileBytes.toString('base64')}`;
  }

  throw new Error(`Unable to resolve image file on disk or parse as data URL: ${imagePath}`);
}
