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

    // 3. Fetch Real Page/Profile info from Facebook
    let realPlatformId: string;
    let realName: string;
    let pageToken: string;

    try {
      const pagesData = await fetchFacebookPages(tokenData.access_token);
      
      if (pagesData.data && pagesData.data.length > 0) {
        // Use the first page
        const page = pagesData.data[0];
        realPlatformId = page.id;
        realName = page.name;
        pageToken = page.access_token;
      } else {
        // Fallback to Personal Profile if no pages found
        const profile = await fetchFacebookProfile(tokenData.access_token);
        realPlatformId = profile.id;
        realName = `${profile.name} (Personal)`;
        pageToken = tokenData.access_token;
        console.warn("[FACEBOOK_CALLBACK] No pages found, falling back to profile.");
      }
    } catch (apiErr) {
      console.error("[FACEBOOK_API_FETCH_FAILED]:", apiErr);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=facebook_api_error`);
    }

    // 4. Save to Database
    try {
      console.log("[FACEBOOK_DB_SAVE] Attempting to save:", {
        companyId: teamMember.companyId,
        platform: 'facebook',
        platformId: realPlatformId,
        name: realName,
        hasToken: !!pageToken
      });

      // Use findFirst + create/update instead of upsert to avoid adapter issues
      const existing = await prisma.socialAccount.findFirst({
        where: {
          companyId: teamMember.companyId,
          platform: 'facebook',
          platformId: realPlatformId
        }
      });

      if (existing) {
        await prisma.socialAccount.update({
          where: { id: existing.id },
          data: {
            accessToken: pageToken,
            refreshToken: tokenData.refresh_token || null,
            expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
            name: realName
          }
        });
        console.log("[FACEBOOK_DB_SAVE] Updated existing account:", existing.id);
      } else {
        const created = await prisma.socialAccount.create({
          data: {
            companyId: teamMember.companyId,
            platform: 'facebook',
            platformId: realPlatformId,
            name: realName,
            accessToken: pageToken,
            refreshToken: tokenData.refresh_token || null,
            expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null
          }
        });
        console.log("[FACEBOOK_DB_SAVE] Created new account:", created.id);
      }

      // 5. Log Activity
      await prisma.activityLog.create({
        data: {
          companyId: teamMember.companyId,
          userId: session.user.id,
          action: 'SOCIAL_ACCOUNT_CONNECTED',
          details: `Connected Facebook account: ${realName}`
        }
      });
    } catch (dbErr: any) {
      console.error("[FACEBOOK_DATABASE_FAILED]:", dbErr);
      const msg = encodeURIComponent(dbErr.message?.substring(0, 200) || "Database failure");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=database_error&details=${msg}`);
    }

    // Clean up
    cookieStore.delete('oauth_state');

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?success=connected`);
  } catch (err) {
    console.error("[FACEBOOK_CALLBACK_FATAL]:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=server_error`);
  }
}
