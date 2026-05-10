import * as cheerio from 'cheerio';

export async function fetchFacebookFollowers(handleOrUrl: string): Promise<number> {
  return await scrapeSocialFollowers(handleOrUrl, 'facebook');
}

export async function fetchInstagramFollowers(handleOrUrl: string): Promise<number> {
  return await scrapeSocialFollowers(handleOrUrl, 'instagram');
}

async function scrapeSocialFollowers(handleOrUrl: string, platform: 'facebook' | 'instagram'): Promise<number> {
  try {
    let url = handleOrUrl;
    if (!handleOrUrl.startsWith('http')) {
      const cleanHandle = handleOrUrl.replace('@', '').trim();
      url = platform === 'facebook' 
        ? `https://www.facebook.com/${cleanHandle}`
        : `https://www.instagram.com/${cleanHandle}/`;
    } else if (handleOrUrl.includes('facebook.com/profile.php?id=')) {
      // Ensure we use the correct mobile-friendly or desktop link if needed
      url = handleOrUrl;
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!res.ok) return 0;

    const html = await res.text();
    const $ = cheerio.load(html);

    // 1. Try Meta Description (Common for both FB and IG)
    const ogDesc = $('meta[property="og:description"]').attr('content') || 
                   $('meta[name="description"]').attr('content');
                   
    if (ogDesc) {
      // Patterns: "82 followers", "1.2K Followers", "Followers: 82", etc.
      const followerMatch = ogDesc.match(/([\d.,]+[KMB]?)\s+followers/i) || 
                            ogDesc.match(/followers:\s+([\d.,]+[KMB]?)/i);
      if (followerMatch) {
        return parseAbbreviatedNumber(followerMatch[1]);
      }
    }

    // 2. Try JSON metadata fallback
    const jsonMatch = html.match(/"follower_count":(\d+)/) || 
                      html.match(/edge_followed_byContent":{"count":(\d+)}/) ||
                      html.match(/"text":"([\d.,]+[KMB]?)\s+followers"/);
    
    if (jsonMatch) {
      return parseAbbreviatedNumber(jsonMatch[1]);
    }

    return 0;
  } catch (error) {
    console.error(`FETCH_${platform.toUpperCase()}_FOLLOWERS_ERROR:`, error);
    return 0;
  }
}

function parseAbbreviatedNumber(numStr: string): number {
  const clean = numStr.replace(/,/g, '').toLowerCase().trim();
  if (clean.endsWith('k')) return parseFloat(clean) * 1000;
  if (clean.endsWith('m')) return parseFloat(clean) * 1000000;
  if (clean.endsWith('b')) return parseFloat(clean) * 1000000000;
  return parseInt(clean) || 0;
}
