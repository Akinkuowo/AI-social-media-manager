import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken } from "@/lib/social-oauth";
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

  const cookieStore = await cookies();
  const savedState = cookieStore.get('oauth_state')?.value;

  if (!code || state !== savedState) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=oauth_failed`);
  }

  try {
    const tokenData = await exchangeCodeForToken('linkedin', code);
    
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
    
    if (plan === "FREE" && currentCount >= 2) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=limit_reached`);
    }

    const mockPlatformId = `li_${Math.random().toString(36).substring(7)}`;
    const mockName = `LinkedIn Profile ${Math.floor(Math.random() * 100)}`;

    await prisma.socialAccount.upsert({
      where: {
        companyId_platform_platformId: {
          companyId: teamMember.companyId,
          platform: 'linkedin',
          platformId: mockPlatformId
        }
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        name: mockName
      },
      create: {
        companyId: teamMember.companyId,
        platform: 'linkedin',
        platformId: mockPlatformId,
        name: mockName,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null
      }
    });

    await prisma.activityLog.create({
      data: {
        companyId: teamMember.companyId,
        userId: session.user.id,
        action: 'SOCIAL_ACCOUNT_CONNECTED',
        details: `Connected LinkedIn account: ${mockName}`
      }
    });

    cookieStore.delete('oauth_state');

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?success=connected`);
  } catch (err) {
    console.error("[LINKEDIN_CALLBACK_FATAL]:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/accounts?error=server_error`);
  }
}
