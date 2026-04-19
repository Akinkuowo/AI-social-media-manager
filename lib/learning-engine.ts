import { prisma } from "./prisma";

/**
 * The Learning Engine analyzes historical engagement data for a company
 * and produces "Performance Insights" that guide the AI in future generations.
 */
export async function getPerformanceInsights(companyId: string) {
  try {
    // 1. Fetch the last 50 published posts with their analytics
    const pastPosts = await prisma.post.findMany({
      where: {
        calendar: { companyId },
        status: 'PUBLISHED',
        analytics: { isNot: null }
      },
      include: {
        analytics: true
      },
      orderBy: { scheduledAt: 'desc' },
      take: 50
    });

    if (pastPosts.length === 0) {
      return "No historical performance data available yet. Follow general industry best practices for a growing brand.";
    }

    // 2. Aggregate metrics by content type
    const typePerformance: Record<string, { totalEngagement: number; count: number }> = {};
    const hourPerformance: Record<number, number> = {};

    pastPosts.forEach(post => {
      const type = post.type;
      const engagement = post.analytics?.engagement || 0;
      
      // Type tracking
      if (!typePerformance[type]) typePerformance[type] = { totalEngagement: 0, count: 0 };
      typePerformance[type].totalEngagement += engagement;
      typePerformance[type].count += 1;

      // Time tracking (Hour of day)
      if (post.scheduledAt) {
        const hour = new Date(post.scheduledAt).getUTCHours();
        hourPerformance[hour] = (hourPerformance[hour] || 0) + engagement;
      }
    });

    // 3. Calculate averages and identify winners
    const insights = Object.entries(typePerformance).map(([type, stats]) => ({
      type,
      avgEngagement: stats.totalEngagement / stats.count,
      count: stats.count
    })).sort((a, b) => b.avgEngagement - a.avgEngagement);

    const winner = insights[0];
    const topHour = Object.entries(hourPerformance)
      .sort((a, b) => b[1] - (a[1] as any))?.[0]?.[0] || "18";

    // 4. Build the performance block for the AI
    let performanceContext = `HISTORICAL PERFORMANCE DATA (Learned from ${pastPosts.length} posts):\n`;
    performanceContext += `- Top Performing Content Type: "${winner.type}" (Avg. Engagement: ${winner.avgEngagement.toFixed(1)})\n`;
    
    if (insights.length > 1) {
      performanceContext += `- Performance Breakdown: ${insights.map(i => `${i.type} (${i.avgEngagement.toFixed(1)})`).join(', ')}\n`;
    }

    performanceContext += `- Optimal Engagement Time: ${topHour}:00 UTC based on past success.\n`;
    performanceContext += `- Learning Strategy: Prioritize high-performing types. Avoid types with low engagement unless experimenting with new angles.\n`;

    return performanceContext;
  } catch (err) {
    console.error("[LEARNING_ENGINE_ERROR]:", err);
    return "Error calculating historical performance. Default to general best practices.";
  }
}
