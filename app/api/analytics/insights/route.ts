import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Updated to use gemini-pro as per previous fixes

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: {
        company: true
      }
    });

    if (!teamMember?.company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const { company } = teamMember;

    // 1. Check Cache (24 Hours)
    if (company.lastInsightAt && company.aiInsights) {
      const hoursSinceLast = (Date.now() - new Date(company.lastInsightAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) {
        console.log("[INSIGHTS_CACHE] Serving cached AI insights.");
        return NextResponse.json(company.aiInsights);
      }
    }

    // 2. Fetch Performance Data for Context
    const analytics = await prisma.analytics.findMany({
      where: {
        post: {
          calendar: { companyId: company.id }
        }
      },
      include: {
        post: true
      },
      orderBy: { post: { scheduledAt: 'desc' } },
      take: 20
    });

    if (analytics.length === 0) {
      return NextResponse.json({ 
        message: "Not enough data yet for AI insights. Post more content to unlock!",
        isPlaceholder: true
      });
    }

    // 3. Construct Prompt
    const dataSummary = analytics.map(a => ({
      type: a.post.type,
      caption: a.post.caption.substring(0, 50),
      reach: a.reach,
      engagement: a.engagement,
      dayOfWeek: a.post.scheduledAt ? new Date(a.post.scheduledAt).toLocaleDateString('en-US', { weekday: 'long' }) : 'Unknown',
      time: a.post.scheduledAt ? new Date(a.post.scheduledAt).getHours() : 'Unknown'
    }));

    const prompt = `
      You are an elite Social Media Strategist AI.
      Analyze the following performance data for ${company.name} (${company.niche}):
      ${JSON.stringify(dataSummary)}

      Task: Provide exactly 3 high-impact, actionable insights to improve their engagement and growth.
      
      Return ONLY a JSON object in this format:
      {
        "bestDay": "Weekday name",
        "bestTime": "HH:MM",
        "trendingType": "Educational/Promotional etc",
        "insights": [
          { "title": "...", "description": "...", "impact": "High/Medium" },
          { "title": "...", "description": "...", "impact": "High/Medium" },
          { "title": "...", "description": "...", "impact": "High/Medium" }
        ],
        "hashtagStrategy": "Suggestions for hashtags"
      }
    `;

    // 4. Generate with Gemini
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const insights = JSON.parse(jsonStr);

    // 5. Update Cache
    await prisma.company.update({
      where: { id: company.id },
      data: {
        aiInsights: insights,
        lastInsightAt: new Date()
      }
    });

    return NextResponse.json(insights);

  } catch (err: any) {
    console.error("INSIGHTS_API_ERROR:", err);
    return NextResponse.json({ message: "Failed to generate insights." }, { status: 500 });
  }
}
