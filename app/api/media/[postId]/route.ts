import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImagePrompt } from "@/lib/gemini";
import { watermarkImage } from "@/lib/media-processor";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    let { postId } = await params;
    
    // Strip file extension if present (e.g. .png, .jpg) to get clean ID
    postId = postId.replace(/\.[^/.]+$/, "");
    
    // Find post and company logo
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        calendar: {
          include: { company: true }
        }
      }
    });

    if (!post) return new Response("Post not found", { status: 404 });

    const company = post.calendar.company;
    
    // Prioritize user-uploaded media, fallback to AI generation
    let baseImageUrl = post.mediaUrls[0];

    if (!baseImageUrl) {
      console.log(`[MediaEngine] Generating autonomous image for post: ${postId}`);
      const visualPrompt = await generateImagePrompt(post.caption, company.niche || "General");
      // Use Pollinations Flux model for high quality
      baseImageUrl = `https://pollinations.ai/p/${encodeURIComponent(visualPrompt)}?width=1024&height=1024&seed=${postId}&model=flux`;
    }

    // Common headers to bypass tunnel warnings and set cache
    const headers = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
      "ngrok-skip-browser-warning": "true",
    };

    // Apply watermark if logo exists
    if (company.logo) {
      console.log(`[MediaEngine] Applying brand watermark for ${company.name}`);
      const bufferedImage = await watermarkImage(baseImageUrl, company.logo);
      return new Response(bufferedImage, { headers });
    }

    // Proxy the image instead of redirecting to ensure extension compatibility and bypass tunnel warnings
    const imageRes = await fetch(baseImageUrl);
    const imageBlob = await imageRes.arrayBuffer();
    
    return new Response(imageBlob, { headers });

  } catch (err) {
    console.error("[MEDIA_ENGINE_CRITICAL_ERR]:", err);
    return new Response("Internal Media Generation Error", { 
      status: 500,
      headers: { "ngrok-skip-browser-warning": "true" }
    });
  }
}
