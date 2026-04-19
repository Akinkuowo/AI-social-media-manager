import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!genAI || !apiKey) {
    return NextResponse.json({ message: "Gemini API key not configured" }, { status: 500 });
  }

  try {
    const { competitorId } = await req.json();
    if (!competitorId) {
      return NextResponse.json({ message: "Competitor ID required" }, { status: 400 });
    }

    // 1. Fetch User's Brand context and Top Posts
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: {
        company: {
          include: {
            socialAccounts: {
              include: {
                posts: {
                  where: { status: 'PUBLISHED' },
                  orderBy: { analytics: { engagement: 'desc' } },
                  take: 5
                }
              }
            }
          }
        }
      }
    });

    // 2. Fetch Competitor context and Top Posts
    const competitor = await prisma.competitor.findUnique({
      where: { id: competitorId },
      include: {
        posts: {
          orderBy: { likes: 'desc' },
          take: 5
        }
      }
    });

    if (!teamMember || !competitor) {
      return NextResponse.json({ message: "Data not found" }, { status: 404 });
    }

    const { company } = teamMember;
    
    // 3. Prepare the Prompt
    const userPostsContext = company.socialAccounts.flatMap(acc => acc.posts).map(p => p.caption).join("\n---\n");
    const compPostsContext = competitor.posts.map(p => p.caption).join("\n---\n");

    const systemPrompt = `You are a strategic marketing consultant specialized in competitive intelligence.
    
    TASK: Perform a "Content Gap Analysis" between my brand and a competitor.
    
    MY BRAND CONTEXT:
    Niche: ${company.niche}
    Target Audience: ${company.targetAudience}
    Recent Top Content:
    ${userPostsContext}
    
    COMPETITOR CONTEXT (${competitor.name} on ${competitor.platform}):
    Their Top Content:
    ${compPostsContext}
    
    RETURN A JSON OBJECT WITH:
    - analysis: A 2-sentence summary of the main strategic difference.
    - gapTitle: A short catchy title for the identified gap.
    - gapDescription: A detailed explanation of what they are doing that we are NOT (e.g., "They focus on behind-the-scenes video whereas you focus on static product quotes").
    - actionableSteps: A list of 3 specific content ideas we should create to close this gap.
    - dominantHashtags: List of 5 hashtags they use that we should adopt.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }

    return NextResponse.json({ analysis: text });

  } catch (err) {
    console.error("COMPETITOR_ANALYSIS_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
