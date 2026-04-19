import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company association found" }, { status: 404 });
    }

    const posts = await prisma.post.findMany({
      where: {
        calendar: {
          companyId: teamMember.companyId
        }
      },
      include: {
        socialAccount: true
      },
      orderBy: {
        scheduledAt: 'desc'
      },
      take: 100 // Fetch latest 100 queue logs
    });

    return NextResponse.json(posts);
  } catch (err: any) {
    console.error("QUEUE_FETCH_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
