import { prisma } from "./prisma";

/**
 * Fetches real-time insights from Instagram for a specific business account.
 */
export async function syncInstagramInsights(socialAccountId: string) {
  const account = await prisma.socialAccount.findUnique({
    where: { id: socialAccountId },
    include: { company: true }
  });

  if (!account || account.platform.toLowerCase() !== 'instagram') return;

  try {
    // 1. Fetch Page Level Metrics (Followers, Reach 28 Days)
    const pageRes = await fetch(`https://graph.facebook.com/v18.0/${account.platformId}?fields=followers_count,insights.metric(reach,impressions).period(days_28)&access_token=${account.accessToken}`);
    
    if (!pageRes.ok) {
      console.error("[IG_SYNC_ERROR]:", await pageRes.text());
      return;
    }

    const pageData = await pageRes.json();

    // 2. Update PlatformMetric (Daily snapshot)
    await prisma.platformMetric.upsert({
      where: {
        socialAccountId_date: {
          socialAccountId: account.id,
          date: new Date(new Date().setHours(0,0,0,0))
        }
      },
      update: {
        followers: pageData.followers_count || 0,
        reach: pageData.insights?.data?.[0]?.values?.[0]?.value || 0,
      },
      create: {
        socialAccountId: account.id,
        date: new Date(new Date().setHours(0,0,0,0)),
        followers: pageData.followers_count || 0,
        reach: pageData.insights?.data?.[0]?.values?.[0]?.value || 0,
      }
    });

    // 3. Update Individual Post Analytics (Latest 10 posts)
    const mediaRes = await fetch(`https://graph.facebook.com/v18.0/${account.platformId}/media?fields=id,insights.metric(engagement,impressions,reach,saved,video_views)&limit=10&access_token=${account.accessToken}`);
    
    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      for (const item of mediaData.data) {
        const metrics: any = {};
        item.insights?.data?.forEach((m: any) => {
          metrics[m.name] = m.values?.[0]?.value || 0;
        });

        // Find the post in our DB by platformPostId
        const post = await prisma.post.findFirst({
          where: { platformOptimized: { path: ['platformPostId'], equals: item.id } }
        });

        if (post) {
          await prisma.analytics.upsert({
            where: { postId: post.id },
            update: {
              impressions: metrics.impressions || 0,
              reach: metrics.reach || 0,
              engagement: metrics.engagement || 0,
              likes: metrics.engagement || 0, // Approx
              comments: metrics.comments || 0,
            },
            create: {
              postId: post.id,
              impressions: metrics.impressions || 0,
              reach: metrics.reach || 0,
              engagement: metrics.engagement || 0,
            }
          });
        }
      }
    }

    console.log(`[IG_SYNC_SUCCESS]: Account ${account.name} metrics updated.`);
  } catch (err) {
    console.error("[IG_SYNC_EXCEPTION]:", err);
  }
}

/**
 * Fetches real-time insights from Facebook for a specific page.
 */
export async function syncFacebookInsights(socialAccountId: string) {
  const account = await prisma.socialAccount.findUnique({
    where: { id: socialAccountId }
  });

  if (!account || account.platform.toLowerCase() !== 'facebook') return;

  try {
    // 1. Fetch Page Metrics
    const pageRes = await fetch(`https://graph.facebook.com/v18.0/${account.platformId}?fields=fan_count,insights.metric(page_impressions_unique,page_post_engagements).period(days_28)&access_token=${account.accessToken}`);
    
    if (pageRes.ok) {
      const pageData = await pageRes.json();
      await prisma.platformMetric.upsert({
        where: {
          socialAccountId_date: {
            socialAccountId: account.id,
            date: new Date(new Date().setHours(0,0,0,0))
          }
        },
        update: {
          followers: pageData.fan_count || 0,
          reach: pageData.insights?.data?.[0]?.values?.[0]?.value || 0,
        },
        create: {
          socialAccountId: account.id,
          date: new Date(new Date().setHours(0,0,0,0)),
          followers: pageData.fan_count || 0,
          reach: pageData.insights?.data?.[0]?.values?.[0]?.value || 0,
        }
      });
    }

    // 2. Fetch Post Metrics
    const postsRes = await fetch(`https://graph.facebook.com/v18.0/${account.platformId}/published_posts?fields=id,insights.metric(post_impressions_unique,post_engagements,post_reactions_by_type_total)&limit=10&access_token=${account.accessToken}`);
    
    if (postsRes.ok) {
      const postsData = await postsRes.json();
      for (const item of postsData.data) {
        const metrics: any = {};
        item.insights?.data?.forEach((m: any) => {
          metrics[m.name] = m.values?.[0]?.value || 0;
        });

        const post = await prisma.post.findFirst({
          where: { platformOptimized: { path: ['platformPostId'], equals: item.id } }
        });

        if (post) {
          await prisma.analytics.upsert({
            where: { postId: post.id },
            update: {
              impressions: metrics.post_impressions_unique || 0,
              reach: metrics.post_impressions_unique || 0,
              engagement: metrics.post_engagements || 0,
              likes: metrics.post_reactions_by_type_total?.like || 0,
            },
            create: {
              postId: post.id,
              impressions: metrics.post_impressions_unique || 0,
              reach: metrics.post_impressions_unique || 0,
              engagement: metrics.post_engagements || 0,
            }
          });
        }
      }
    }
  } catch (err) {
    console.error("[FB_SYNC_ERROR]:", err);
  }
}

/**
 * Orquestrates full metrics sync for a company across all platforms.
 */
export async function syncAllMetrics(companyId: string) {
  const accounts = await prisma.socialAccount.findMany({
    where: { companyId }
  });

  console.log(`[Analytics] Starting global sync for company ${companyId}. Accounts: ${accounts.length}`);
  
  const tasks = accounts.map(account => {
    switch (account.platform.toLowerCase()) {
      case 'instagram': return syncInstagramInsights(account.id);
      case 'facebook': return syncFacebookInsights(account.id);
      default: return Promise.resolve();
    }
  });

  await Promise.all(tasks);
  console.log(`[Analytics] Global sync complete.`);
}
