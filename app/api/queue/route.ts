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

    const recentPosts = await prisma.post.findMany({
      where: {
        calendar: {
          companyId: teamMember.companyId
        },
        status: {
          not: 'FAILED'
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

    const failedPosts = await prisma.post.findMany({
      where: {
        calendar: {
          companyId: teamMember.companyId
        },
        status: 'FAILED'
      },
      include: {
        socialAccount: true
      },
      orderBy: {
        scheduledAt: 'desc'
      },
      take: 50 // Always surface up to 50 failed posts so they don't get lost
    });

    const posts = [...failedPosts, ...recentPosts].sort((a, b) => {
      const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json(posts);
  } catch (err: any) {
    console.error("QUEUE_FETCH_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
