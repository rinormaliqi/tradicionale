import sharp from "sharp";

/**
 * Process an uploaded image into two optimized WebP buffers:
 *  - `data`:  full-size, capped at 1200px, good quality
 *  - `thumb`: 400px square-ish preview for cards/lists
 * Storing WebP keeps the bytes (and load times) small.
 */
export async function processImage(input: Buffer): Promise<{
  data: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
}> {
  const base = sharp(input, { failOn: "none" }).rotate(); // honor EXIF orientation

  const full = base.clone().resize({
    width: 1200,
    height: 1200,
    fit: "inside",
    withoutEnlargement: true,
  });

  const data = await full.webp({ quality: 80 }).toBuffer();
  const meta = await sharp(data).metadata();

  const thumb = await base
    .clone()
    .resize({ width: 400, height: 400, fit: "cover", position: "centre" })
    .webp({ quality: 70 })
    .toBuffer();

  return {
    data,
    thumb,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}
