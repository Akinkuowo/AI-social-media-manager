import Jimp from "jimp";

/**
 * Overlays a logo onto a base image.
 * @param baseImageUrl The URL of the background image.
 * @param logoUrl The URL of the logo to overlay.
 * @returns A Buffer of the processed image.
 */
export async function watermarkImage(baseImageUrl: string, logoUrl: string): Promise<Buffer> {
  try {
    const [image, logo] = await Promise.all([
      Jimp.read(baseImageUrl),
      Jimp.read(logoUrl)
    ]);

    // Resize logo to 15% of the base image width
    const logoWidth = image.getWidth() * 0.15;
    logo.resize(logoWidth, Jimp.AUTO);

    // Calculate position (bottom right with padding)
    const padding = 20;
    const x = image.getWidth() - logo.getWidth() - padding;
    const y = image.getHeight() - logo.getHeight() - padding;

    // Apply transparency to logo (optional, can adjust)
    logo.opacity(0.85);

    // Composite
    image.composite(logo, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    });

    return await image.getBufferAsync(Jimp.MIME_PNG);
  } catch (err) {
    console.error("[WATERMARK_ERROR]:", err);
    // Fallback to original image if watermarking fails
    const fallback = await Jimp.read(baseImageUrl);
    return await fallback.getBufferAsync(Jimp.MIME_PNG);
  }
}
