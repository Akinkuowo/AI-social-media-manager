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
      where: { userId: session.user.id },
      include: {
        company: {
          include: {
            socialAccounts: true, // For gap analysis context later
          }
        }
      }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const competitors = await prisma.competitor.findMany({
      where: { companyId: teamMember.companyId },
      include: {
        posts: {
          orderBy: { likes: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(competitors);
  } catch (err) {
    console.error("COMPETITOR_FETCH_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, platform, handle } = await req.json();
    if (!name || !platform || !handle) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // 1. Create the competitor record
    const competitor = await prisma.competitor.upsert({
      where: {
        companyId_platform_handle: {
          companyId: teamMember.companyId,
          platform: platform.toLowerCase(),
          handle
        }
      },
      update: { name },
      create: {
        companyId: teamMember.companyId,
        name,
        platform: platform.toLowerCase(),
        handle,
        followerCount: Math.floor(Math.random() * 50000) + 5000, // Mock data
        engagementRate: parseFloat((Math.random() * 5 + 1).toFixed(2)) // Mock 1-6%
      }
    });

    // 2. Generate some Mock Posts for this competitor to populate the UI immediately
    // In a real app, this would be a trigger to a scraping/discovery service
    const mockPosts = [
      {
        competitorId: competitor.id,
        postId: `mock_${Date.now()}_1`,
        caption: `🚀 Top performing ${platform} post from ${name}! #innovation #growth`,
        likes: Math.floor(Math.random() * 1000) + 500,
        comments: Math.floor(Math.random() * 50) + 10,
        postedAt: new Date(Date.now() - 86400000), // Yesterday
        hashtags: "#innovation #growth"
      },
      {
        competitorId: competitor.id,
        postId: `mock_${Date.now()}_2`,
        caption: `Weekly round-up of the best ${platform} trends.`,
        likes: Math.floor(Math.random() * 800) + 200,
        comments: Math.floor(Math.random() * 30) + 5,
        postedAt: new Date(Date.now() - 172800000),
        hashtags: "#trends #socialmedia"
      }
    ];

    await prisma.competitorPost.createMany({
      data: mockPosts,
      skipDuplicates: true
    });

    return NextResponse.json(competitor);
  } catch (err) {
    console.error("COMPETITOR_CREATE_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
