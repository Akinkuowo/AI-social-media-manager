"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";

interface TwoFactorResult {
  error?: string;
  success?: boolean;
}

export async function verifyTwoFactorAction(code: string): Promise<TwoFactorResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.twoFactorSecret) {
      return { error: "Two-factor authentication not established" };
    }

    const cleanCode = String(code).replace(/\s+/g, '');
    const isTwoFactorValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: cleanCode,
      window: 10
    });

    if (!isTwoFactorValid) {
      return { error: "Invalid verification code" };
    }

    return { success: true };
  } catch (error) {
    console.error("[2FA_VERIFY_ACTION_ERROR]", error);
    return { error: "An unexpected error occurred" };
  }
}
