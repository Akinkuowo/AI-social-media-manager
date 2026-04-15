import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company association found" }, { status: 404 });
    }

    const accounts = await prisma.socialAccount.findMany({
      where: { companyId: teamMember.companyId },
      orderBy: { platform: 'asc' }
    });

    return NextResponse.json(accounts);
  } catch (err) {
    console.error("SOCIAL_ACCOUNTS_FETCH_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
