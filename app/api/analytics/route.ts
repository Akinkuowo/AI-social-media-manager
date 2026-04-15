import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subDays, format } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Find user's company
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company association found" }, { status: 404 });
    }

    const companyId = teamMember.companyId;

    // 2. Fetch all analytics for the company's posts
    const analyticsData = await prisma.analytics.findMany({
      where: {
        post: {
          calendar: {
            companyId: companyId
          }
        }
      },
      include: {
        post: {
          include: {
            socialAccount: true
          }
        }
      }
    });

    // 3. Aggregate Global Stats
    const totalStats = analyticsData.reduce((acc, current) => {
      acc.impressions += current.impressions;
      acc.reach += current.reach;
      acc.engagement += current.engagement;
      acc.likes += current.likes;
      acc.shares += current.shares;
      acc.comments += current.comments;
      return acc;
    }, { impressions: 0, reach: 0, engagement: 0, likes: 0, shares: 0, comments: 0 });

    const engagementRate = totalStats.reach > 0 
      ? (totalStats.engagement / totalStats.reach) * 100 
      : 0;

    // 4. Generate Time Series Data (Mock/Simulation for last 14 days)
    // In a real app, this would query aggregated data by date
    const timeSeries = Array.from({ length: 14 }).map((_, i) => {
      const date = subDays(new Date(), 13 - i);
      const dateStr = format(date, 'MMM dd');
      
      // Simulate growth pattern
      const baseReach = 100 + (i * 15);
      const baseEngagement = Math.floor(baseReach * (0.05 + Math.random() * 0.05));
      
      return {
        name: dateStr,
        reach: baseReach,
        engagement: baseEngagement
      };
    });

    // 5. Platform Breakdown
    const platformStats = analyticsData.reduce((acc: any, curr) => {
      const platform = curr.post.socialAccount?.platform || 'unknown';
      if (!acc[platform]) acc[platform] = { platform, engagement: 0, reach: 0 };
      acc[platform].engagement += curr.engagement;
      acc[platform].reach += curr.reach;
      return acc;
    }, {});

    // 6. Top Posts
    const topPosts = analyticsData
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5)
      .map(item => ({
        id: item.post.id,
        platform: item.post.socialAccount?.platform || 'instagram',
        caption: item.post.caption,
        engagement: item.engagement,
        reach: item.reach,
        type: item.post.type
      }));

    return NextResponse.json({
      totalStats,
      engagementRate,
      timeSeries,
      platformBreakdown: Object.values(platformStats),
      topPosts
    });

  } catch (err) {
    console.error("ANALYTICS_FETCH_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
