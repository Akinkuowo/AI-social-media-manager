import { prisma } from "./prisma";

/**
 * Validates an external API Key and returns the associated context.
 * Updates the lastUsed timestamp for the key.
 */
export async function validateApiKey(apiKey: string) {
  if (!apiKey) return null;

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        company: true,
        user: true
      }
    });

    if (!keyRecord) return null;

    // Update last used timestamp (fire and forget)
    prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() }
    }).catch(err => console.error("[API_KEY_TRACK_ERR]:", err));

    return {

      company: keyRecord.company,
      user: keyRecord.user
    };
  } catch (err) {
    console.error("[API_KEY_VAL_ERR]:", err);
    return null;
  }
}
