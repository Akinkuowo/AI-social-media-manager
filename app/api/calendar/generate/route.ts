import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generate30DayCalendar } from "@/lib/gemini";
import { logActivity } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { calendarId, platform, trendingTopics, month, year } = await req.json();

    if (!platform || month === undefined || year === undefined) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
    }

    // Get company details for the prompt
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { company: true },
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company found" }, { status: 404 });
    }

    const { company } = teamMember;

    // Contact the AI to build the array using our new lib function
    const calendarArray = await generate30DayCalendar({
      platform,
      niche: company.niche || "General Business",
      targetAudience: company.targetAudience || "General Audience",
      businessGoals: company.businessGoals || "Growth and Engagement",
      trendingTopics: trendingTopics || "General Industry Trends"
    });

    if (!Array.isArray(calendarArray) || calendarArray.length === 0) {
      return NextResponse.json({ message: "AI generated invalid schema." }, { status: 500 });
    }

    // Create or find the calendar container
    const calendar = await prisma.calendar.upsert({
      where: {
        companyId_month_year: {
          companyId: company.id,
          month,
          year,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        month,
        year,
      },
    });

    // We will find the socialAccountId for the specified platform
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        companyId: company.id,
        platform: platform.toLowerCase()
      }
    });

    // Insert the 30 posts into the database bulk
    const dataToInsert = calendarArray.map((aiPost: any) => {
      // Create a safely mapped scheduled date
      const timeParts = String(aiPost.bestPostingTime || "12:00").split(":");
      const hour = parseInt(timeParts[0]) || 12;
      const min = parseInt(timeParts[1]) || 0;
      
      const scheduledDate = new Date(year, month, aiPost.day || 1, hour, min, 0);

      const safeType = ["educational", "promotional", "storytelling", "tips", "meme", "video"].includes(aiPost.contentType) 
        ? aiPost.contentType 
        : "educational";

      return {
        calendarId: calendar.id,
        socialAccountId: socialAccount?.id || null,
        day: aiPost.day || 1,
        scheduledAt: scheduledDate,
        status: "DRAFT", // Saving them as DRAFT so the user can review before they are auto-published.
        type: safeType,
        caption: aiPost.caption || "Missing Caption",
        hashtags: aiPost.hashtags || "",
        mediaUrls: []
      };
    });

    const result = await prisma.post.createMany({
      data: dataToInsert,
      skipDuplicates: true
    });

    await logActivity(company.id, session.user.id, "CALENDAR_AI_GENERATED", `Generated a 30-day content calendar for ${platform}`);

    return NextResponse.json({ success: true, count: result.count });
  } catch (err: any) {
    console.error("CALENDAR_GENERATE_API_ERROR:", err);
    return NextResponse.json({ message: "Failed to generate AI calendar mapping." }, { status: 500 });
  }
}
