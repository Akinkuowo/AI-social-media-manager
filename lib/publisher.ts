import { prisma } from "./prisma";

export async function processQueue() {
  const now = new Date();

  // Find all posts that are scheduled to be published and are due
  const pendingPosts = await prisma.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: {
        lte: now,
      },
    },
    include: {
      socialAccount: true,
    },
  });

  const results = [];

  for (const post of pendingPosts) {
    try {
      // In a real app, we would use post.socialAccount.accessToken 
      // and call the respective platform API.
      // For this implementation, we simulate the publishing process.
      
      console.log(`[Publisher] Publishing post ${post.id} to ${post.socialAccount?.platform || 'Mock Platform'}...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      await prisma.post.update({
        where: { id: post.id },
        data: { status: "PUBLISHED" },
      });

      // Initialize analytics for the new post
      await prisma.analytics.create({
        data: {
          postId: post.id,
          impressions: Math.floor(Math.random() * 1000), // Mock starting stats
          likes: Math.floor(Math.random() * 100),
        }
      });

      results.push({ id: post.id, status: "success" });
    } catch (err) {
      console.error(`[Publisher] Failed to publish post ${post.id}:`, err);
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "FAILED" },
      });
      results.push({ id: post.id, status: "failed", error: err });
    }
  }

  return results;
}
