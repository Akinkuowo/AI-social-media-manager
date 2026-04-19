export interface OptimizedPayload {
  chunks: string[]; 
  mediaUrls: string[]; 
}

const PLATFORM_LIMITS: Record<string, { chars: number, hashtags: number, media: number }> = {
  twitter: { chars: 280, hashtags: 10, media: 4 },
  linkedin: { chars: 3000, hashtags: 15, media: 9 }, 
  facebook: { chars: 63206, hashtags: 30, media: 10 },
  instagram: { chars: 2200, hashtags: 30, media: 10 },
  default: { chars: 2200, hashtags: 30, media: 4 }
};

export function optimizePost(
  platform: string, 
  caption: string, 
  hashtags: string = "", 
  mediaUrls: string[] = []
): OptimizedPayload {
  const rules = PLATFORM_LIMITS[platform.toLowerCase()] || PLATFORM_LIMITS.default;
  
  const hashString = hashtags ? `\n\n${hashtags}` : '';
  const fullText = caption + hashString;

  const finalMedia = mediaUrls.slice(0, rules.media);

  // If Twitter, slice it into threads mathematically
  if (platform.toLowerCase() === 'twitter' && fullText.length > rules.chars) {
    const chunks: string[] = [];
    let remainingText = fullText;

    while (remainingText.length > 0) {
      if (remainingText.length <= rules.chars - 8) { // Room for counters
        chunks.push(remainingText);
        break;
      }
      
      // Attempt to split at the nearest space BEFORE the character limit
      let sliceIndex = remainingText.lastIndexOf(' ', rules.chars - 8); 
      if (sliceIndex === -1 || sliceIndex < rules.chars - 50) {
        sliceIndex = rules.chars - 8;
      }

      chunks.push(remainingText.substring(0, sliceIndex).trim());
      remainingText = remainingText.substring(sliceIndex).trim();
    }

    // Append standard thread counters visually 
    const threadedChunks = chunks.map((chunk, idx) => {
      if (chunks.length > 1) {
        return `${chunk}\n(${idx + 1}/${chunks.length})`;
      }
      return chunk;
    });

    return {
      chunks: threadedChunks,
      mediaUrls: finalMedia
    };
  }

  // Non-Twitter or short text, just truncate cleanly if over max
  let safeText = fullText;
  if (safeText.length > rules.chars) {
    safeText = safeText.substring(0, rules.chars - 3) + '...';
  }

  return {
    chunks: [safeText],
    mediaUrls: finalMedia
  };
}
