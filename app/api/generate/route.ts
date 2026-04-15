import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateSocialContent } from "@/lib/gemini";
import { logActivity } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { platform, type, tone, promptOverride } = await req.json();

    // Fetch user's company settings for grounding
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: {
        company: true
      }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company found. Please complete onboarding." }, { status: 404 });
    }

    const company = teamMember.company;

    const result = await generateSocialContent({
      platform,
      type,
      tone: tone || company.brandVoice || "Professional",
      brandVoice: company.brandVoice || "Professional",
      niche: company.niche || "General",
      targetAudience: company.targetAudience || "Social Media Users",
      promptOverride: promptOverride || ""
    });

    await logActivity(
      company.id,
      session.user.id,
      "POST_GENERATED",
      `Generated a ${type} post for ${platform}`
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GENERATE_API_ERROR:", err);
    return NextResponse.json({ message: "Failed to generate content" }, { status: 500 });
  }
}
