import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { logActivity } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ message: "No API Key provided in x-api-key header" }, { status: 401 });
    }

    const context = await validateApiKey(apiKey);
    if (!context) {
      return NextResponse.json({ message: "Invalid or expired API Key" }, { status: 403 });
    }

    const { company, user } = context;
    const body = await req.json();
    const { 
      caption, 
      hashtags, 
      platform, 
      scheduledAt, 
      mediaUrls,
      type
    } = body;

    if (!caption || !platform) {
      return NextResponse.json({ message: "Missing required fields: caption, platform" }, { status: 400 });
    }

    // Find a calendar for the current month/year or create one
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    let calendar = await prisma.calendar.findUnique({
      where: {
        companyId_month_year: {
          companyId: company.id,
          month,
          year
        }
      }
    });

    if (!calendar) {
      calendar = await prisma.calendar.create({
        data: {
          companyId: company.id,
          month,
          year
        }
      });
    }

    // Find the social account for the specified platform
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        companyId: company.id,
        platform: platform.toLowerCase()
      }
    });

    if (!socialAccount) {
      return NextResponse.json({ 
        message: `No social account found for platform: ${platform}. Please connect it in the dashboard first.` 
      }, { status: 404 });
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        calendarId: calendar.id,
        socialAccountId: socialAccount.id,
        day: now.getDate(),
        caption,
        hashtags: hashtags || "",
        mediaUrls: mediaUrls || [],
        type: type || "educational",
        status: "SCHEDULED",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 3600000), // Default to 1 hour from now
      }
    });

    await logActivity(
      company.id,
      user.id,
      "API_SCHEDULE_POST",
      `External API scheduled a ${post.type} post for ${platform}`
    );

    return NextResponse.json({
      success: true,
      message: "Post successfully scheduled in the publisher queue",
      data: {
        id: post.id,
        status: post.status,
        scheduledAt: post.scheduledAt,
        platform: platform
      }
    });

  } catch (err: any) {
    console.error("[V1_SCHEDULE_POST_ERR]:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
