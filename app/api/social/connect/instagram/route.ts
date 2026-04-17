import { auth } from "@/auth";
import { getAuthorizationUrl } from "@/lib/social-oauth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  
  // Store state in cookies to verify on callback
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, { 
    maxAge: 300, // 5 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  // For Instagram publishing, we use the Facebook Graph API.
  // The scopes already include 'instagram_basic' and 'instagram_content_publish'.
  // This will use the same OAuth application as Facebook.
  const authUrl = getAuthorizationUrl('facebook', state);
  
  return NextResponse.redirect(`${authUrl}&display=popup`);
}
