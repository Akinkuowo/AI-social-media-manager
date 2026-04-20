import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Helper to handle transient AI errors with exponential backoff.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isRetryable = err.status === 503 || err.status === 429 || err.message?.includes('503') || err.message?.includes('429');
    
    if (isRetryable && retries > 0) {
      console.warn(`[GEMINI_RETRY] Service busy. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export async function generateSocialContent({
  platform,
  type,
  tone,
  brandVoice,
  niche,
  targetAudience,
  promptOverride,
  userId
}: {
  platform: string;
  type: string;
  tone: string;
  brandVoice: string;
  niche: string;
  targetAudience: string;
  promptOverride: string;
  userId?: string;
}) {
  if (!genAI || !apiKey) {
    console.warn("GEMINI_API_KEY_MISSING: Using mock generation.");
    return getMockContent(platform, type, tone);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `You are an expert social media manager and content creator. 
    Your niche is ${niche}. 
    Your brand voice is ${brandVoice}. 
    Your target audience is ${targetAudience}.
    
    Task: Create a highly engaging social media post for ${platform}.
    Post Type: ${type}
    Tone: ${tone}
    User Request: ${promptOverride}
    
    Return a JSON object with:
    - caption: The main text of the post (include emojis where appropriate for the platform).
    - hashtags: A list of 5-10 relevant hashtags.
    - mediaPrompt: A descriptive prompt for an AI image generator to create a matching visual for this post.
  `;

  try {
    const text = await withRetry(async () => {
      const result = await model.generateContent(systemPrompt);
      return result.response.text();
    });
    
    // Log usage if userId is provided
    if (userId) {
      const { logAIUsage } = await import("./usage");
      const estTokens = Math.ceil((systemPrompt.length + text.length) / 4);
      await logAIUsage(userId, `generate_post_${platform}`, estTokens);
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      caption: text,
      hashtags: ["#ai", "#socialmedia"],
      mediaPrompt: "A professional cinematic shot of a modern workspace."
    };
  } catch (err) {
    console.error("GEMINI_GENERATION_FAILED:", err);
    return getMockContent(platform, type, tone);
  }
}

function getMockContent(platform: string, type: string, tone: string) {
  return {
    caption: `✨ [MOCK] Boosting your ${platform} presence with our latest ${type} strategy! \n\nWe believe that consistency and authenticity are the keys to long-term growth. This post was designed with a ${tone} tone to resonate with your unique audience. \n\nHow are you scaling your brand today? Let us know in the comments! 👇`,
    hashtags: ["#DigitalGrowth", "#ContentStrategy", "#MarketingTips", "#SocialMediaROI", "#BrandBuilding"],
    mediaPrompt: `A vibrant, high-quality photograph of a diverse team collaborating in a modern, sunlit office space with sleek technology and a professional yet creative atmosphere.`
  };
}

export async function generate30DayCalendar({
  platform,
  niche,
  targetAudience,
  businessGoals,
  trendingTopics,
  performanceInsights = "",
  userId
}: {
  platform: string;
  niche: string;
  targetAudience: string;
  businessGoals: string;
  trendingTopics: string;
  performanceInsights?: string;
  userId?: string;
}) {
  if (!genAI || !apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `You are an expert social media manager. 
A key part of your job is to LEARN from past performance and optimize for growth.

Strategy Parameters:
- Niche: ${niche}
- Audience: ${targetAudience}
- Goals: ${businessGoals}
- Themes: ${trendingTopics}

${performanceInsights ? `ADAPTIVE LEARNING CONTEXT:
${performanceInsights}
CRITICAL: Use the data above to optimize the mix of content. If specific types are winners, increase their frequency. If specific times are optimal, schedule more posts then.` : ""}

Task: Create an engaging 30-day social media content calendar for ${platform}.
Output strictly a valid JSON array containing exactly 30 objects.

Schema for each object:
{
  "day": <number>,
  "postIdea": "Brief concept",
  "contentType": "(educational, promotional, storytelling, tips, meme, video)",
  "caption": "Full ready-to-publish content",
  "hashtags": "Space-separated hash tags",
  "bestPostingTime": "HH:MM",
  "mediaTopic": "Visual keywords for image generation"
}`;

  try {
    const text = await withRetry(async () => {
      const result = await model.generateContent(systemPrompt);
      return result.response.text();
    });
    
    // Log usage if userId is provided
    if (userId) {
      const { logAIUsage } = await import("./usage");
      const estTokens = Math.ceil((systemPrompt.length + text.length) / 4);
      await logAIUsage(userId, `generate_30day_calendar_${platform}`, estTokens);
    }
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("AI did not return a valid array of days.");
  } catch (err) {
    console.error("GEMINI_30DAY_GENERATION_FAILED:", err);
    throw err;
  }
}

