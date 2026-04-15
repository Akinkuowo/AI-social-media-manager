import { prisma } from "./prisma";

export async function logActivity(
  companyId: string, 
  userId: string | null, 
  action: string, 
  details?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        companyId,
        userId,
        action,
        details
      }
    });
  } catch (err) {
    console.error("FAILED_TO_LOG_ACTIVITY:", err);
  }
}
