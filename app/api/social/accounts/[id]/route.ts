import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Verify ownership via team membership
    const account = await prisma.socialAccount.findFirst({
      where: {
        id,
        company: {
          members: {
            some: { userId: session.user.id }
          }
        }
      }
    });

    if (!account) {
      return NextResponse.json({ message: "Account not found or access denied" }, { status: 404 });
    }

    await prisma.socialAccount.delete({
      where: { id }
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        companyId: account.companyId,
        userId: session.user.id,
        action: 'SOCIAL_ACCOUNT_DISCONNECTED',
        details: `Disconnected ${account.platform} account: ${account.name}`
      }
    });

    return NextResponse.json({ message: "Account disconnected successfully" });
  } catch (err) {
    console.error("SOCIAL_ACCOUNT_DELETE_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
