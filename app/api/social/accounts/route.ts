import { requireAuth, getCompanyId } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const company = await getCompanyId(auth.userId);
  if (company.error) return company.error;

  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { companyId: company.companyId },
      orderBy: { platform: "asc" },
      // Never expose tokens to the client
      select: {
        id: true,
        platform: true,
        platformId: true,
        name: true,
        expiresAt: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(accounts);
  } catch (err) {
    console.error("SOCIAL_ACCOUNTS_FETCH_ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
