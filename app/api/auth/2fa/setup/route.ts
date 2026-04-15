import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const secret = speakeasy.generateSecret({
      name: `SocialAI (${session.user.email})`
    });
    
    if (!secret.otpauth_url) {
      return NextResponse.json({ message: "Failed to generate QR URL" }, { status: 500 });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save the base32 secret temporarily in the database to be verified in the next step
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 },
    });

    return NextResponse.json({ qrCode: qrCodeDataUrl, secret: secret.base32 });

  } catch (err) {
    console.error("2FA_SETUP_ERROR", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
