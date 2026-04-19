import { prisma } from "./prisma";
import { refreshAccessToken, PLATFORM_ENDPOINTS } from "./social-oauth";
import { optimizePost } from "./content-optimizer";
import { sendNotification } from "./notifications";

/**
 * Downloads a remote file and converts to Base64 for API transmission.
 */
async function getMediaBase64(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch media from ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.toString('base64');
}

/**
 * Specialized Twitter Media Upload (V1.1 Endpoint)
 */
async function uploadTwitterMedia(accessToken: string, mediaUrl: string) {
  try {
    const base64Data = await getMediaBase64(mediaUrl);
    const res = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ media_data: base64Data })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[TWITTER_MEDIA_UPLOAD_ERR]:", err);
      return null;
    }

    const data = await res.json();
    return data.media_id_string;
  } catch (err) {
    console.error("[TWITTER_MEDIA_UPLOAD_EXCEPTION]:", err);
    return null;
  }
}

export async function processQueue() {
  const now = new Date();

  const pendingPosts = await prisma.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    include: {
      socialAccount: true,
      calendar: true
    },
  });

  const results = [];

  for (const post of pendingPosts) {
    try {
      console.log(`[Publisher] Processing post ${post.id} for ${post.socialAccount?.platform || 'manual'}...`);
      
      let platformPostId: string | null = null;

      if (post.socialAccount) {
        let { platform, accessToken, refreshToken, expiresAt } = post.socialAccount;

        // 1. Token Refresh
        if (expiresAt && refreshToken) {
          const timeRemaining = new Date(expiresAt).getTime() - Date.now();
          if (timeRemaining < 300000) {
            const tokens = await refreshAccessToken(platform as keyof typeof PLATFORM_ENDPOINTS, refreshToken);
            accessToken = tokens.access_token;
            await prisma.socialAccount.update({
              where: { id: post.socialAccount.id },
              data: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || refreshToken,
                expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
              }
            });
          }
        }

        const optimized = optimizePost(platform, post.caption, post.hashtags || "", post.mediaUrls);

        switch (platform.toLowerCase()) {
          case 'twitter':
          case 'x': {
            let mediaIds: string[] = [];
            // Upload first 4 media (X Limit)
            if (optimized.mediaUrls.length > 0) {
              for (const url of optimized.mediaUrls.slice(0, 4)) {
                const mid = await uploadTwitterMedia(accessToken, url);
                if (mid) mediaIds.push(mid);
              }
            }

            let lastTweetId: string | null = null;
            for (let i = 0; i < optimized.chunks.length; i++) {
              const payload: any = { text: optimized.chunks[i] };
              if (lastTweetId) payload.reply = { in_reply_to_tweet_id: lastTweetId };
              
              // Attach media only to the first tweet in a thread
              if (i === 0 && mediaIds.length > 0) {
                payload.media = { media_ids: mediaIds };
              }

              const res = await fetch('https://api.twitter.com/2/tweets', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              });

              if (!res.ok) {
                const errText = await res.text();
                throw new Error(`X API Error: ${errText}`);
              }

              const data = await res.json();
              lastTweetId = data.data.id;
              if (i === 0) platformPostId = lastTweetId;
            }
            break;
          }

          case 'facebook': {
            // Check for image or text
            const endpoint = optimized.mediaUrls.length > 0 
              ? `https://graph.facebook.com/v18.0/${post.socialAccount.platformId}/photos`
              : `https://graph.facebook.com/v18.0/${post.socialAccount.platformId}/feed`;
            
            const payload: any = optimized.mediaUrls.length > 0 
              ? { url: optimized.mediaUrls[0], caption: optimized.chunks[0], access_token: accessToken }
              : { message: optimized.chunks[0], access_token: accessToken };

            const fbRes = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            
            if (!fbRes.ok) {
              const fbError = await fbRes.json();
              throw new Error(fbError.error?.message || "Facebook API Error");
            }
            const fbData = await fbRes.json();
            platformPostId = fbData.id;
            break;
          }

          case 'linkedin': {
            // Simplified LinkedIn Post (Text + Link)
            const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
              },
              body: JSON.stringify({
                author: `urn:li:person:${post.socialAccount.platformId}`,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                  'com.linkedin.ugc.ShareContent': {
                    shareCommentary: { text: optimized.chunks[0] },
                    shareMediaCategory: optimized.mediaUrls.length > 0 ? 'ARTICLE' : 'NONE',
                    media: optimized.mediaUrls.length > 0 ? [{
                      status: 'READY',
                      originalUrl: optimized.mediaUrls[0],
                      title: { text: 'Shared Content' }
                    }] : undefined
                  }
                },
                visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
              })
            });

            if (!liRes.ok) {
              const liErr = await liRes.text();
              throw new Error(`LinkedIn API Error: ${liErr}`);
            }
            const liData = await liRes.json();
            platformPostId = liData.id;
            break;
          }

          case 'instagram': {
            if (optimized.mediaUrls.length === 0) {
              throw new Error("Instagram requires at least one image or video.");
            }

            // Step 1: Create Media Container
            const containerRes = await fetch(`https://graph.facebook.com/v18.0/${post.socialAccount.platformId}/media`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image_url: optimized.mediaUrls[0],
                caption: optimized.chunks[0],
                access_token: accessToken
              })
            });

            if (!containerRes.ok) {
              const containerErr = await containerRes.json();
              throw new Error(containerErr.error?.message || "Instagram Container Error");
            }
            const { id: creationId } = await containerRes.json();

            // Step 2: Publish Container
            const publishRes = await fetch(`https://graph.facebook.com/v18.0/${post.socialAccount.platformId}/media_publish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                creation_id: creationId,
                access_token: accessToken
              })
            });

            if (!publishRes.ok) {
              const publishErr = await publishRes.json();
              throw new Error(publishErr.error?.message || "Instagram Final Publish Error");
            }
            const publishData = await publishRes.json();
            platformPostId = publishData.id;
            break;
          }

          default:
            platformPostId = `sim_${Date.now()}`;
            break;
        }
      } else {
        platformPostId = `manual_${Date.now()}`;
      }

      // Handle Recurrence
      if (post.isRecurring && post.recurrenceInterval) {
        let newDate = new Date(post.scheduledAt || now);
        switch (post.recurrenceInterval) {
          case 'daily': newDate.setDate(newDate.getDate() + 1); break;
          case 'weekly': newDate.setDate(newDate.getDate() + 7); break;
          case 'monthly': newDate.setMonth(newDate.getMonth() + 1); break;
        }
        await prisma.post.create({
          data: {
            calendarId: post.calendarId, day: newDate.getDate(),
            scheduledAt: newDate, status: "SCHEDULED",
            type: post.type, caption: post.caption, hashtags: post.hashtags,
            mediaUrls: post.mediaUrls, isRecurring: true, recurrenceInterval: post.recurrenceInterval,
            socialAccountId: post.socialAccountId
          }
        });
      }

      await prisma.post.update({
        where: { id: post.id },
        data: { status: "PUBLISHED", errorLog: null, platformOptimized: platformPostId ? { platformPostId } : undefined },
      });

      await prisma.activityLog.create({
        data: { companyId: post.calendar.companyId, action: 'POST_PUBLISHED', details: `Published to ${post.socialAccount?.platform || 'manual'}` }
      });

      // Notify Team
      const members = await prisma.teamMember.findMany({
        where: { companyId: post.calendar.companyId },
        select: { userId: true }
      });

      for (const member of members) {
        await sendNotification({
          userId: member.userId,
          title: "Post Published! 🚀",
          message: `Your post for ${post.socialAccount?.platform || 'manual'} is live.`,
          type: "PUBLISH_SUCCESS",
          link: "/queue",
          channels: ["in-app", "email"]
        });
      }

      results.push({ id: post.id, status: "success" });

    } catch (err: any) {
      console.error(`[Publisher] Failed post ${post.id}:`, err);
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "FAILED", errorLog: String(err.message || 'Unknown error') },
      });

      // Notify Team of Failure
      const members = await prisma.teamMember.findMany({
        where: { companyId: post.calendar.companyId },
        select: { userId: true }
      });

      for (const member of members) {
        await sendNotification({
          userId: member.userId,
          title: "Post Failed to Publish ⚠️",
          message: `Reason: ${err.message || 'Unknown network error'}. Check the queue for details.`,
          type: "PUBLISH_FAILED",
          link: "/queue",
          channels: ["in-app", "email"]
        });
      }

      results.push({ id: post.id, status: "failed", error: err.message });
    }
  }

  return results;
}
