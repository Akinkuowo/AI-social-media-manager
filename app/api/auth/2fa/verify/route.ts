import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { code, enable } = await req.json();

    const cleanCode = String(code).replace(/\s+/g, '');

    if (!cleanCode || cleanCode.length !== 6) {
      return NextResponse.json({ message: "A valid 6-digit code is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ message: "2FA setup not initiated" }, { status: 400 });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: cleanCode,
      window: 10 // Extended window to 10 (allows 5 minutes of drift) to cover extreme laptop clock skews
    });

    if (!isValid) {
      const currentExpected = speakeasy.totp({ secret: user.twoFactorSecret, encoding: 'base32' });
      // Debug log to confirm parameters during dev
      console.log(`2FA Failed for ${user.email}`);
      console.log(`User provided code: ${cleanCode}`);
      console.log(`Server generated code right now: ${currentExpected}`);
      return NextResponse.json({ message: "Invalid code. Please ensure your device clock is synced." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: enable },
    });

    return NextResponse.json({ message: `2FA ${enable ? 'enabled' : 'disabled'} successfully` }, { status: 200 });

  } catch (err) {
    console.error("2FA_VERIFY_ERROR", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
