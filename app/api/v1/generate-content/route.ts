import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { generateSocialContent } from "@/lib/gemini";
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
    const { platform, type, tone, promptOverride } = body;

    if (!platform || !type) {
      return NextResponse.json({ message: "Missing required fields: platform, type" }, { status: 400 });
    }

    // Generate content using the company's brand voice
    const result = await generateSocialContent({
      platform,
      type,
      tone: tone || company.brandVoice || "Professional",
      brandVoice: company.brandVoice || "Professional",
      niche: company.niche || "General",
      targetAudience: company.targetAudience || "Social Media Users",
      promptOverride: promptOverride || "",
      userId: user.id
    });

    await logActivity(
      company.id,
      user.id,
      "API_GENERATE_CONTENT",
      `External API generated a ${type} post for ${platform}`
    );

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        platform,
        type,
        tone: tone || company.brandVoice
      }
    });

  } catch (err: any) {
    console.error("[V1_GENERATE_CONTENT_ERR]:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
