import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { fetchFacebookFollowers, fetchInstagramFollowers } from "@/lib/social/facebook";

async function discoverFollowers(platform: string, handle: string): Promise<number> {
  const p = platform.toLowerCase();
  if (p === 'facebook') {
    return await fetchFacebookFollowers(handle);
  }
  if (p === 'instagram') {
    return await fetchInstagramFollowers(handle);
  }

  // Fallback: Return 0 for other platforms or if discovery fails
  return 0;
}

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
            socialAccounts: true,
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

    // Attempt to discover real followers
    const discoveredFollowers = await discoverFollowers(platform, handle);

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
        followerCount: discoveredFollowers,
        engagementRate: 0
      }
    });

    const initialPosts = [
      {
        competitorId: competitor.id,
        postId: `discovery_${Date.now()}_1`,
        caption: discoveredFollowers > 0 
          ? `Successfully linked ${name} on ${platform}. Awaiting detailed post discovery...`
          : `Awaiting data discovery for ${name}. You may need to update stats manually if this is a private or restricted page.`,
        likes: 0,
        comments: 0,
        postedAt: new Date(),
        hashtags: ""
      }
    ];

    await prisma.competitorPost.createMany({
      data: initialPosts,
      skipDuplicates: true
    });

    return NextResponse.json(competitor);
  } catch (err) {
    console.error("COMPETITOR_CREATE_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
