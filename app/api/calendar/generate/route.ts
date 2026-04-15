import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { month, year } = await req.json();

    // Get company details for the prompt
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { company: true },
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company found" }, { status: 404 });
    }

    const { company } = teamMember;

    const prompt = `
      You are an expert Social Media Manager AI for ${company.name}, a company in the ${company.niche} niche.
      Target Audience: ${company.targetAudience}
      Business Goals: ${company.businessGoals}
      Brand Voice: ${company.brandVoice}

      Generate a comprehensive 30-day social media content calendar for ${formatMonth(month)} ${year}.
      
      For each day, provide:
      1. Content Type (Educational, Promotional, Storytelling, Tips, Meme, or Video)
      2. Post Idea / Topic
      3. A preliminary Caption
      4. Relevant Hashtags

      Constraints:
      - Varied content types.
      - At least 2 promotional posts per week.
      - Strong focus on engagement for the target audience.
      - Professional and valuable insights.

      Return the response ONLY as a JSON object in this format:
      {
        "posts": [
          {
            "day": 1,
            "type": "Educational",
            "idea": "...",
            "caption": "...",
            "hashtags": "..."
          },
          ... up to day 30
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const generatedData = JSON.parse(jsonStr);

    // Create or find calendar
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

    // Save posts to DB
    const createdPosts = await Promise.all(
      generatedData.posts.map((post: any) => {
        const scheduledAt = new Date(year, month - 1, post.day, 10, 0, 0); // Default to 10AM
        return prisma.post.create({
          data: {
            calendarId: calendar.id,
            day: post.day,
            type: post.type,
            caption: post.caption,
            hashtags: post.hashtags,
            scheduledAt,
            status: "DRAFT",
          },
        });
      })
    );

    return NextResponse.json({
      message: "30-day calendar generated successfully",
      posts: createdPosts,
    });
  } catch (err: any) {
    console.error("GENERATION_ERROR:", err);
    return NextResponse.json(
      { message: "Failed to generate calendar. " + err.message },
      { status: 500 }
    );
  }
}

function formatMonth(m: number) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[m - 1];
}
