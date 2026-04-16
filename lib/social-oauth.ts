/**
 * This utility handles the generic OAuth 2.0 flow logic for social media platforms.
 * It provides helpers for constructing authorization URLs and exchanging codes for tokens.
 */

export const SOCIAL_SCOPES = {
  facebook: ['pages_manage_posts', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish', 'public_profile'],
  linkedin: ['w_member_social', 'r_liteprofile', 'r_emailaddress'],
  twitter: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  tiktok: ['video.upload', 'user.info.basic'],
};

export const PLATFORM_ENDPOINTS = {
  facebook: {
    auth: 'https://www.facebook.com/v18.0/dialog/oauth',
    token: 'https://graph.facebook.com/v18.0/oauth/access_token',
  },
  linkedin: {
    auth: 'https://www.linkedin.com/oauth/v2/authorization',
    token: 'https://www.linkedin.com/oauth/v2/accessToken',
  },
  twitter: {
    auth: 'https://twitter.com/i/oauth2/authorize',
    token: 'https://api.twitter.com/2/oauth2/token',
  },
  tiktok: {
    auth: 'https://www.tiktok.com/v2/auth/authorize/',
    token: 'https://open.tiktokapis.com/v2/oauth/token/',
  }
};

export function getAuthorizationUrl(platform: keyof typeof PLATFORM_ENDPOINTS, state: string) {
  const config = PLATFORM_ENDPOINTS[platform];
  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/${platform}`;
  
  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    state: state,
    response_type: 'code',
    scope: SOCIAL_SCOPES[platform].join(' '),
  });

  // Twitter PKCE requirement
  if (platform === 'twitter') {
    params.append('code_challenge', 'challenge'); // In a real app, generate a proper challenge
    params.append('code_challenge_method', 'plain');
  }

  return `${config.auth}?${params.toString()}`;
}

export async function exchangeCodeForToken(platform: keyof typeof PLATFORM_ENDPOINTS, code: string) {
  const config = PLATFORM_ENDPOINTS[platform];
  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/${platform}`;

  const params = new URLSearchParams({
    client_id: clientId || '',
    client_secret: clientSecret || '',
    redirect_uri: redirectUri,
    code: code,
    grant_type: 'authorization_code',
  });

  const response = await fetch(config.token, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`[OAUTH_TOKEN_EXCHANGE] Error for ${platform}:`, error);
    throw new Error(`Failed to exchange code for token on ${platform}`);
  }

  return response.json();
}

/**
 * Fetch the basic profile of the authenticated Facebook user.
 */
export async function fetchFacebookProfile(accessToken: string) {
  const response = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${accessToken}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Facebook profile');
  }
  return response.json();
}

/**
 * Fetch the list of Facebook Pages managed by the authenticated user.
 */
export async function fetchFacebookPages(accessToken: string) {
  const response = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,category,picture&access_token=${accessToken}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Facebook pages');
  }
  return response.json();
}

/**
 * Fetch the basic profile of the authenticated LinkedIn member.
 */
export async function fetchLinkedInProfile(accessToken: string) {
  const response = await fetch('https://api.linkedin.com/v2/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch LinkedIn profile');
  }
  return response.json();
}


