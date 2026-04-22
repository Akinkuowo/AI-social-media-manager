/**
 * This utility handles the generic OAuth 2.0 flow logic for social media platforms.
 * It provides helpers for constructing authorization URLs and exchanging codes for tokens.
 */

export const SOCIAL_SCOPES = {
  facebook: ['pages_manage_posts', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish', 'public_profile'],
  instagram: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement', 'public_profile'],
  linkedin: ['w_member_social', 'openid', 'profile', 'email'],
  twitter: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  tiktok: ['user.info.basic', 'video.list', 'video.publish'],
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
  instagram: {
    auth: 'https://www.facebook.com/v18.0/dialog/oauth',
    token: 'https://graph.facebook.com/v18.0/oauth/access_token',
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
  
  // TikTok v2 requires comma-separated scopes, others use space.
  const scopeSeparator = platform === 'tiktok' ? ',' : ' ';
  
  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    state: state,
    response_type: 'code',
    scope: SOCIAL_SCOPES[platform].join(scopeSeparator),
  });

  // Twitter PKCE requirement (Allows 'plain' method)
  if (platform === 'twitter') {
    params.append('code_challenge', 'challenge');
    params.append('code_challenge_method', 'plain');
  }

  // TikTok strictly requires 'S256' for its PKCE challenge and 'client_key' parameter.
  if (platform === 'tiktok') {
    params.append('code_challenge', 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'); 
    params.append('code_challenge_method', 'S256');
    params.delete('client_id');
    params.append('client_key', clientId || '');
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
    redirect_uri: redirectUri,
    code: code,
    grant_type: 'authorization_code',
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (platform === 'twitter') {
    // Twitter PKCE requires the code_verifier, and it expects Basic Auth
    params.append('code_verifier', 'challenge');
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${basicAuth}`;
  } else {
    // Other platforms usually accept client_secret in the body
    params.append('client_secret', clientSecret || '');
  }

  const response = await fetch(config.token, {
    method: 'POST',
    body: params,
    headers: headers,
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
 * Fetch Instagram Business Accounts connected to the user's Facebook Pages.
 */
export async function fetchInstagramAccounts(accessToken: string) {
  // We query the pages the user manages, requesting the instagram_business_account field
  const response = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Instagram accounts via Facebook Pages');
  }
  return response.json();
}

/**
 * Fetch the basic profile of the authenticated LinkedIn member.
 */
export async function fetchLinkedInProfile(accessToken: string) {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    const err = await response.text();
    console.error('[LINKEDIN_PROFILE_ERROR]:', err);
    throw new Error('Failed to fetch LinkedIn profile');
  }
  return response.json();
}

/**
 * Fetch the basic profile of the authenticated Twitter/X user.
 */
export async function fetchTwitterProfile(accessToken: string) {
  const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch Twitter profile');
  }
  return response.json();
}

/**
 * Refresh an OAuth 2.0 access token using a refresh token.
 */
export async function refreshAccessToken(platform: keyof typeof PLATFORM_ENDPOINTS, refreshToken: string) {
  const config = PLATFORM_ENDPOINTS[platform];
  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];

  const params = new URLSearchParams({
    client_id: clientId || '',
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (platform === 'twitter') {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${basicAuth}`;
  } else {
    params.append('client_secret', clientSecret || '');
  }

  const response = await fetch(config.token, {
    method: 'POST',
    body: params,
    headers: headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error(`[OAUTH_TOKEN_REFRESH] Error for ${platform}:`, error);
    throw new Error(`Failed to refresh token on ${platform}`);
  }

  return response.json();
}
