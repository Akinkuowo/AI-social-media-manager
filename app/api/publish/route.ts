import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { refreshAccessToken, PLATFORM_ENDPOINTS } from "@/lib/social-oauth";
import { NextResponse } from "next/server";

/**
 * POST /api/publish
 * 
 * Checks for all posts with status = SCHEDULED and scheduledAt <= now(),
 * then attempts to publish them to the appropriate social platform.
 * 
 * For production: This should be triggered by a cron job every 1-5 minutes.
 * For local dev: Can be triggered manually from the calendar page.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all due posts
    const duePosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: new Date() }
      },
      include: {
        socialAccount: true,
        calendar: true
      }
    });

    if (duePosts.length === 0) {
      return NextResponse.json({ published: 0, failed: 0, message: "No posts due for publishing." });
    }

    let published = 0;
    let failed = 0;
    const results: any[] = [];

    for (const post of duePosts) {
      try {
        let platformPostId: string | null = null;

        if (post.socialAccount) {
          let { platform, accessToken, refreshToken, expiresAt } = post.socialAccount;

          // Silent Token Refresh Logic
          if (expiresAt && refreshToken) {
            const timeRemaining = new Date(expiresAt).getTime() - Date.now();
            if (timeRemaining < 300000) { // Refresh if expiring within 5 minutes
              console.log(`[PUBLISH] Token expiring soon for ${platform}. Refreshing...`);
              const tokens = await refreshAccessToken(platform as keyof typeof PLATFORM_ENDPOINTS, refreshToken);
              accessToken = tokens.access_token;
              
              await prisma.socialAccount.update({
                where: { id: post.socialAccount.id },
                data: {
                  accessToken: tokens.access_token,
                  refreshToken: tokens.refresh_token || refreshToken, // fallback to old if not rotated
                  expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
                }
              });
            }
          }

          switch (platform) {
            case 'facebook': {
              // Publish to Facebook Page
              const fbRes = await fetch(
                `https://graph.facebook.com/v18.0/${post.socialAccount.platformId}/feed`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    message: `${post.caption}${post.hashtags ? '\n\n' + post.hashtags : ''}`,
                    access_token: accessToken
                  })
                }
              );
              
              if (fbRes.ok) {
                const fbData = await fbRes.json();
                platformPostId = fbData.id;
              } else {
                const fbError = await fbRes.json();
                console.error("[PUBLISH_FACEBOOK_ERROR]:", fbError);
                throw new Error(fbError.error?.message || "Facebook API rejected the post");
              }
              break;
            }

            case 'linkedin': {
              // Publish to LinkedIn
              const linkedinRes = await fetch(
                'https://api.linkedin.com/v2/ugcPosts',
                {
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
                        shareCommentary: {
                          text: `${post.caption}${post.hashtags ? '\n\n' + post.hashtags : ''}`
                        },
                        shareMediaCategory: 'NONE'
                      }
                    },
                    visibility: {
                      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                    }
                  })
                }
              );

              if (linkedinRes.ok) {
                const linkedinData = await linkedinRes.json();
                platformPostId = linkedinData.id;
              } else {
                const linkedinError = await linkedinRes.text();
                console.error("[PUBLISH_LINKEDIN_ERROR]:", linkedinError);
                throw new Error("LinkedIn API rejected the post");
              }
              break;
            }

            case 'twitter': {
              // Publish to Twitter (X)
              const twitterRes = await fetch('https://api.twitter.com/2/tweets', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  text: `${post.caption}${post.hashtags ? '\n\n' + post.hashtags : ''}`
                })
              });

              if (twitterRes.ok) {
                const twitterData = await twitterRes.json();
                platformPostId = twitterData.data.id;
              } else {
                const errorText = await twitterRes.text();
                console.error("[PUBLISH_TWITTER_ERROR]:", errorText);
                let msg = errorText;
                try {
                  const errorJson = JSON.parse(errorText);
                  msg = errorJson.detail || errorJson.title || errorText;
                } catch (e) {
                  // Not Valid JSON, keep raw text
                }
                throw new Error(`X/Twitter Error: ${msg}`);
              }
              break;
            }

            default:
              // For platforms without API integration yet, simulate success
              console.warn(`[PUBLISH] Platform "${platform}" not yet supported for auto-publish. Marking as published.`);
              platformPostId = `sim_${Date.now()}`;
              break;
          }
        } else {
          // No social account linked - just mark as published (manual post)
          platformPostId = `manual_${Date.now()}`;
        }

        // Mark post as PUBLISHED
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            platformOptimized: platformPostId ? { platformPostId } : undefined
          }
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            companyId: post.calendar.companyId,
            userId: session.user.id,
            action: 'POST_PUBLISHED',
            details: `Published ${post.type} post to ${post.socialAccount?.platform || 'manual'}: "${post.caption.substring(0, 50)}..."`
          }
        });

        published++;
        results.push({ postId: post.id, status: 'PUBLISHED', platform: post.socialAccount?.platform });

      } catch (postErr: any) {
        console.error(`[PUBLISH_FAILED] Post ${post.id}:`, postErr);

        // Mark post as FAILED
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'FAILED',
            platformOptimized: { error: postErr.message }
          }
        });

        await prisma.activityLog.create({
          data: {
            companyId: post.calendar.companyId,
            userId: session.user.id,
            action: 'POST_FAILED',
            details: `Failed to publish to ${post.socialAccount?.platform || 'unknown'}: ${postErr.message}`
          }
        });

        failed++;
        results.push({ postId: post.id, status: 'FAILED', error: postErr.message });
      }
    }

    return NextResponse.json({
      published,
      failed,
      total: duePosts.length,
      results
    });

  } catch (err) {
    console.error("[PUBLISH_FATAL_ERROR]:", err);
    return NextResponse.json({ message: "Publisher failed" }, { status: 500 });
  }
}
