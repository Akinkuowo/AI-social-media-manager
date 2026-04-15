import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";
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

    // Generate a new TOTP secret if user doesn't have one, or reuse existing temporarily
    // Usually it's better to always generate a new one during setup until verified
    const secret = authenticator.generateSecret();
    
    // Create the provisioning URI for Google Authenticator / Authy etc.
    const otpauth = authenticator.keyuri(
      session.user.email,
      "SocialAI",
      secret
    );

    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    // Save the secret temporarily in the database to be verified in the next step
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({ qrCode: qrCodeDataUrl, secret });

  } catch (err) {
    console.error("2FA_SETUP_ERROR", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
