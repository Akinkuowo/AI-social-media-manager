import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { fetchFacebookFollowers, fetchInstagramFollowers } from "@/lib/social/facebook";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const competitor = await prisma.competitor.findUnique({
      where: { id }
    });

    if (!competitor) {
      return NextResponse.json({ message: "Competitor not found" }, { status: 404 });
    }

    let followerCount = 0;
    const platform = competitor.platform.toLowerCase();

    if (platform === 'facebook') {
      followerCount = await fetchFacebookFollowers(competitor.handle);
    } else if (platform === 'instagram') {
      followerCount = await fetchInstagramFollowers(competitor.handle);
    }

    if (followerCount === 0) {
       return NextResponse.json({ message: `Could not fetch data for ${competitor.name}. The page might be private or restricted.` }, { status: 400 });
    }

    const updated = await prisma.competitor.update({
      where: { id },
      data: { followerCount }
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("COMPETITOR_SYNC_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
