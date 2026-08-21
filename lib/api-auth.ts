import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Validates the current session and returns the user id.
 * Returns a 401 NextResponse if unauthenticated.
 */
export async function requireAuth(): Promise<
  { userId: string; error?: never } | { userId?: never; error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId: session.user.id };
}

/**
 * Resolves the companyId for the authenticated user.
 * Also returns the teamMember record (role, etc.) for callers that need it.
 *
 * Returns a 401 if unauthenticated, 404 if no company association found.
 */
export async function getCompanyId(userId: string): Promise<
  | { companyId: string; teamMemberId: string; role: string; error?: never }
  | { companyId?: never; teamMemberId?: never; role?: never; error: NextResponse }
> {
  const teamMember = await prisma.teamMember.findFirst({
    where: { userId },
    select: { id: true, companyId: true, role: true },
  });

  if (!teamMember) {
    return {
      error: NextResponse.json(
        { message: "No company association found" },
        { status: 404 }
      ),
    };
  }

  return {
    companyId: teamMember.companyId,
    teamMemberId: teamMember.id,
    role: teamMember.role,
  };
}

/**
 * Validates an API key and returns the associated company and user context.
 * Updates the lastUsed timestamp of the API key.
 */
export async function validateApiKey(key: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: {
      company: true,
      user: true,
    },
  });

  if (!apiKey) {
    return null;
  }

  // Update lastUsed asynchronously
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  }).catch(console.error);

  return {
    company: apiKey.company,
    user: apiKey.user,
  };
}
