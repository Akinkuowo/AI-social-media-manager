import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken, fetchFacebookPages, fetchFacebookProfile } from "@/lib/social-oauth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const savedState = cookieStore.get('oauth_state')?.value;

  if (error || !code || state !== savedState) {
    console.error("[FACEBOOK_CALLBACK_ERROR] Invalid state or OAuth error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=oauth_failed`);
  }

  try {
    // 1. Exchange code for token
    let tokenData;
    try {
      tokenData = await exchangeCodeForToken('facebook', code);
    } catch (tokenErr) {
      console.error("[FACEBOOK_TOKEN_EXCHANGE_FAILED]:", tokenErr);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=token_exchange_failed`);
    }
    
    // 2. Find user's company and check limits
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: {
        company: {
          include: {
            subscription: true,
            socialAccounts: true
          }
        }
      }
    });

    if (!teamMember) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=no_company`);
    }

    const plan = teamMember.company.subscription?.plan || "FREE";
    const currentCount = teamMember.company.socialAccounts.length;
    
    // Simple Limit Check
    if (plan === "FREE" && currentCount >= 2) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=limit_reached`);
    }

    // 3. Fetch Pages and Connected Instagram Accounts
    try {
      const { fetchInstagramAccounts } = await import("@/lib/social-oauth");
      const pagesData = await fetchInstagramAccounts(tokenData.access_token);
      
      let accountsConnectedCount = 0;

      if (pagesData.data && pagesData.data.length > 0) {
        for (const page of pagesData.data) {
          // A. Save Facebook Page
          const existingFB = await prisma.socialAccount.findFirst({
            where: {
              companyId: teamMember.companyId,
              platform: 'facebook',
              platformId: page.id
            }
          });

          if (existingFB) {
            await prisma.socialAccount.update({
              where: { id: existingFB.id },
              data: {
                accessToken: page.access_token,
                refreshToken: tokenData.refresh_token || null,
                expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
                name: page.name
              }
            });
          } else if (currentCount + accountsConnectedCount < (plan === "FREE" ? 2 : 10)) {
            await prisma.socialAccount.create({
              data: {
                companyId: teamMember.companyId,
                platform: 'facebook',
                platformId: page.id,
                name: page.name,
                accessToken: page.access_token,
                refreshToken: tokenData.refresh_token || null,
                expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null
              }
            });
            accountsConnectedCount++;
          }

          // B. Save Connected Instagram Business Account
          if (page.instagram_business_account) {
            const ig = page.instagram_business_account;
            const existingIG = await prisma.socialAccount.findFirst({
              where: {
                companyId: teamMember.companyId,
                platform: 'instagram',
                platformId: ig.id
              }
            });

            if (existingIG) {
              await prisma.socialAccount.update({
                where: { id: existingIG.id },
                data: {
                  accessToken: page.access_token, // IG uses the Page token
                  refreshToken: tokenData.refresh_token || null,
                  expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
                  name: ig.username
                }
              });
            } else if (currentCount + accountsConnectedCount < (plan === "FREE" ? 2 : 10)) {
              await prisma.socialAccount.create({
                data: {
                  companyId: teamMember.companyId,
                  platform: 'instagram',
                  platformId: ig.id,
                  name: ig.username,
                  accessToken: page.access_token,
                  refreshToken: tokenData.refresh_token || null,
                  expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null
                }
              });
              accountsConnectedCount++;
            }
          }
          
          // Only process the first page for Free users to keep things simple, 
          // but we capture both FB and IG from that one page.
          break; 
        }
      } else {
        // Fallback to Profile (Facebook only)
        const profile = await fetchFacebookProfile(tokenData.access_token);
        await prisma.socialAccount.upsert({
          where: { 
            companyId_platform_platformId: {
              companyId: teamMember.companyId,
              platform: 'facebook',
              platformId: profile.id
            }
          },
          update: {
            accessToken: tokenData.access_token,
            name: `${profile.name} (Personal)`
          },
          create: {
            companyId: teamMember.companyId,
            platform: 'facebook',
            platformId: profile.id,
            name: `${profile.name} (Personal)`,
            accessToken: tokenData.access_token
          }
        });
      }

      // 5. Log Activity
      await prisma.activityLog.create({
        data: {
          companyId: teamMember.companyId,
          userId: session.user.id,
          action: 'SOCIAL_ACCOUNT_CONNECTED',
          details: `Connected Facebook/Instagram accounts via Meta`
        }
      });
    } catch (apiErr: any) {
      console.error("[FACEBOOK_CALLBACK_PROCESS_FAILED]:", apiErr);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=callback_processing_failed&details=${encodeURIComponent(apiErr.message)}`);
    }

    // Clean up
    cookieStore.delete('oauth_state');

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?success=connected`);
  } catch (err) {
    console.error("[FACEBOOK_CALLBACK_FATAL]:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=server_error`);
  }
}
