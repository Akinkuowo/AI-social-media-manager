import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using gemini-2.5-flash for maximum speed and intelligence
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { task, competitorNames } = await req.json();

    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { company: true }
    });

    if (!teamMember?.company) {
      return NextResponse.json({ message: "Company profile missing" }, { status: 404 });
    }

    const { company } = teamMember;

    const prompts: Record<string, string> = {
      ideas: `Generate 10 fresh, highly creative content ideas for ${company.name}, a brand in the ${company.niche} niche. 
              Target Audience: ${company.targetAudience}. 
              Tone: ${company.brandVoice}. 
              Format: Markdown list with a catchy title and a brief 'why this works' description for each.`,
      
      trends: `Analyze currently performing trends in the ${company.niche} industry. 
               Identify 3-5 specific topics, challenges, or meme formats that are currently viral or growing.
               Provide actionable advice on how ${company.name} can jump on these trends authentically.`,
      
      competitors: `Perform a strategic competitor analysis for a brand in the ${company.niche} niche.
                    ${competitorNames ? `Analyze these specific competitors: ${competitorNames}.` : "Identify general market leaders."}
                    Identify their common content themes, where they are weak, and where ${company.name} has a 'blue ocean' opportunity.
                    Format as a SWOT analysis in Markdown.`,
      
      hashtags: `Generate a specialized hashtag strategy for ${company.name}. 
                 Include: 
                 1. Core brand tags
                 2. Niche-specific tags for ${company.niche}
                 3. High-volume general tags
                 4. Low-volume 'discovery' tags.
                 Provide them in ready-to-copy clusters.`,
      
      campaigns: `Generate 3 high-level marketing campaign concepts for next quarter.
                  Business Goals: ${company.businessGoals}.
                  Each campaign should have a theme name, a primary hashtag, a set of 5 core message points, and 3 specific post formats to execute.`
    };

    const selectedPrompt = prompts[task];
    if (!selectedPrompt) {
      return NextResponse.json({ message: "Invalid strategy task" }, { status: 400 });
    }

    const systemContext = `You are a world-class CMO and AI Social Media Strategy Assistant. 
    You are working for ${company.name}. 
    Brand Voice: ${company.brandVoice}.
    Target Audience: ${company.targetAudience}.
    Always provide strategic, high-value, and non-generic advice.`;

    const result = await model.generateContent([systemContext, selectedPrompt]);
    const text = result.response.text();

    return NextResponse.json({ result: text });

  } catch (err: any) {
    console.error("STRATEGY_ASSIST_ERROR:", err);
    return NextResponse.json({ message: "Strategy generation failed. Please check your API key." }, { status: 500 });
  }
}
