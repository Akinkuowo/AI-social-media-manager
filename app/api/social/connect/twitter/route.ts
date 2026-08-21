import { auth } from "@/auth";
import { getAuthorizationUrl } from "@/lib/social-oauth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { verifier, challenge } = generatePKCE();
  console.log('[TWITTER_CONNECT] challenge:', challenge, 'length:', challenge.length);

  const cookieStore = await cookies();
  const savedState = cookieStore.get('oauth_state')?.value;
  const codeVerifier = cookieStore.get('oauth_code_verifier')?.value;


  cookieStore.set('oauth_code_verifier', verifier, {
    maxAge: 300,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  const state = Math.random().toString(36).substring(7);
  cookieStore.set('oauth_state', state, {
    maxAge: 300,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  const authUrl = getAuthorizationUrl('twitter', state, challenge);

  return NextResponse.redirect(authUrl);
}
