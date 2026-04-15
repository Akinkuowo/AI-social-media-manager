import { auth } from "@/auth";
import { getAuthorizationUrl } from "@/lib/social-oauth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const state = Math.random().toString(36).substring(7);
  
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, { 
    maxAge: 300,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  const authUrl = getAuthorizationUrl('linkedin', state);
  
  return NextResponse.redirect(authUrl);
}
