import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken, fetchInstagramAccounts } from "@/lib/social-oauth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("[INSTAGRAM_OAUTH_ERROR]:", searchParams.get("error_description") || error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=oauth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=oauth_failed`);
  }

  // 1. Verify State for CSRF Protection
  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=oauth_failed`);
  }
  
  // Clear the state cookie
  cookieStore.delete("oauth_state");

  // 2. Identify the user's company
  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!teamMember) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=no_company`);
  }

  // 3. Exchange Code for Access Token
  let tokenData;
  try {
    // We exchange code using Facebook platform credentials since IG uses Facebook OAuth
    tokenData = await exchangeCodeForToken("facebook", code);
  } catch (exErr) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=token_exchange_failed`);
  }

  // 4. Fetch Instagram Accounts linked to Facebook Pages
  let igAccountData = null;
  try {
    const pagesData = await fetchInstagramAccounts(tokenData.access_token);
    const pages = pagesData.data || [];
    
    // Find the first page that has an instagram_business_account
    const pageWithIg = pages.find((p: any) => p.instagram_business_account != null);
    
    if (pageWithIg) {
      igAccountData = {
        platformId: pageWithIg.instagram_business_account.id,
        name: pageWithIg.instagram_business_account.username,
        // For Instagram publishing, we actually need the Facebook Page Access Token, not the user token.
        accessToken: pageWithIg.access_token, 
        metadata: {
          facebookPageId: pageWithIg.id,
          profilePictureUrl: pageWithIg.instagram_business_account.profile_picture_url
        }
      };
    } else {
      console.warn("[INSTAGRAM_CALLBACK] No linked Instagram accounts found.");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=no_pages_found&details=No+Instagram+Business+Account+found.`);
    }
  } catch (apiErr) {
    console.error("[INSTAGRAM_API_FAILED]:", apiErr);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=facebook_api_error`);
  }

  // 5. Save to Database
  try {
    console.log("[INSTAGRAM_DB_SAVE] Attempting to save:", {
      companyId: teamMember.companyId,
      platform: 'instagram',
      platformId: igAccountData.platformId,
      name: igAccountData.name,
      hasToken: !!igAccountData.accessToken
    });

    const existing = await prisma.socialAccount.findFirst({
      where: {
        companyId: teamMember.companyId,
        platform: 'instagram',
        platformId: igAccountData.platformId
      }
    });

    if (existing) {
      await prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          accessToken: igAccountData.accessToken,
          refreshToken: tokenData.refresh_token || null,
          expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
          name: igAccountData.name,
          metadata: igAccountData.metadata
        }
      });
      console.log("[INSTAGRAM_DB_SAVE] Updated existing account:", existing.id);
    } else {
      await prisma.socialAccount.create({
        data: {
          companyId: teamMember.companyId,
          platform: 'instagram',
          platformId: igAccountData.platformId,
          name: igAccountData.name,
          accessToken: igAccountData.accessToken,
          refreshToken: tokenData.refresh_token || null,
          expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
          metadata: igAccountData.metadata
        }
      });
      console.log("[INSTAGRAM_DB_SAVE] Created new account");
    }

    // 6. Log Activity
    await prisma.activityLog.create({
      data: {
        companyId: teamMember.companyId,
        userId: session.user.id,
        action: 'SOCIAL_ACCOUNT_CONNECTED',
        details: `Connected Instagram account: @${igAccountData.name}`
      }
    });
  } catch (dbErr: any) {
    console.error("[INSTAGRAM_DATABASE_FAILED]:", dbErr);
    const msg = encodeURIComponent(dbErr.message?.substring(0, 200) || "Database failure");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=database_error&details=${msg}`);
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?success=connected`);
}
