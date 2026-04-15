import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken, fetchFacebookPages } from "@/lib/social-oauth";
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
    const tokenData = await exchangeCodeForToken('facebook', code);
    
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

    // 3. Fetch Real Page info from Facebook
    const pagesData = await fetchFacebookPages(tokenData.access_token);
    
    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=no_pages_found`);
    }

    // Automatically pick the first page for now
    const page = pagesData.data[0];
    const realPlatformId = page.id;
    const realName = page.name;
    const pageToken = page.access_token; // Important: Use the Page Token for posting, not the User Token

    // 4. Save to Database
    await prisma.socialAccount.upsert({
      where: {
        companyId_platform_platformId: {
          companyId: teamMember.companyId,
          platform: 'facebook',
          platformId: realPlatformId
        }
      },
      update: {
        accessToken: pageToken,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        name: realName
      },
      create: {
        companyId: teamMember.companyId,
        platform: 'facebook',
        platformId: realPlatformId,
        name: realName,
        accessToken: pageToken,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null
      }
    });


    // 5. Log Activity
    await prisma.activityLog.create({
      data: {
        companyId: teamMember.companyId,
        userId: session.user.id,
        action: 'SOCIAL_ACCOUNT_CONNECTED',
        details: `Connected Facebook account: ${realName}`
      }
    });

    // Clean up
    cookieStore.delete('oauth_state');

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?success=connected`);
  } catch (err) {
    console.error("[FACEBOOK_CALLBACK_FATAL]:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=server_error`);
  }
}
