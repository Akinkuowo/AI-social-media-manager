import { prisma } from "./prisma";

/**
 * Logs AI token usage for cost monitoring.
 * Gemini Flash Pricing: ~$0.35 per 1 million tokens.
 */
export async function logAIUsage(userId: string, action: string, estimatedTokens: number) {
  try {
    const costEstimate = (estimatedTokens / 1_000_000) * 0.35;
    
    await prisma.usageLog.create({
      data: {
        userId,
        action,
        tokens: estimatedTokens,
        costEstimate: parseFloat(costEstimate.toFixed(6))
      }
    });
  } catch (err) {
    console.error("[USAGE_LOG_FAILED]", err);
  }
}
