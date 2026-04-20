import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { generate30DayCalendar } from "@/lib/gemini";
import { logActivity } from "@/lib/logger";

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
    const { platform, trendingTopics } = body;

    if (!platform) {
      return NextResponse.json({ message: "Missing required field: platform" }, { status: 400 });
    }

    const calendar = await generate30DayCalendar({
      platform,
      niche: company.niche || "General",
      targetAudience: company.targetAudience || "Social Media Users",
      businessGoals: company.businessGoals || "Increase awareness",
      trendingTopics: trendingTopics || "Latest industry trends",
      userId: user.id
    });

    await logActivity(
      company.id,
      user.id,
      "API_GENERATE_CALENDAR",
      `External API triggered 30-day strategy generation for ${platform}`
    );

    return NextResponse.json({
      success: true,
      data: calendar,
      meta: {
        platform,
        company: company.name
      }
    });

  } catch (err: any) {
    console.error("[V1_GENERATE_CALENDAR_ERR]:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
