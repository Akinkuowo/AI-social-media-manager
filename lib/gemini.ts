import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function generateSocialContent({
  platform,
  type,
  tone,
  brandVoice,
  niche,
  targetAudience,
  promptOverride
}: {
  platform: string;
  type: string;
  tone: string;
  brandVoice: string;
  niche: string;
  targetAudience: string;
  promptOverride: string;
}) {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY_MISSING: Using mock generation.");
    return getMockContent(platform, type, tone);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();
    
    // Attempt to extract JSON from the text if code blocks were used
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
