import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { code, enable } = await req.json();

    if (!code) {
      return NextResponse.json({ message: "Code is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ message: "2FA setup not initiated" }, { status: 400 });
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      return NextResponse.json({ message: "Invalid code" }, { status: 400 });
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
