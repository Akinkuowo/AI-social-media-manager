"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

interface LoginResult {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  values: any
): Promise<LoginResult> {
  const { email, password } = values;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      // In Auth.js v5, the custom error class name or code might be buried in the cause.
      const authErrContext = error as any;
      const typeOrMessage = String(authErrContext.type) + " " + String(authErrContext.cause?.err?.message) + " " + String(authErrContext.cause?.err?.code);
      
      console.log("[LOGIN_ACTION] AuthError trace:", typeOrMessage);

      // Handle specific errors if they still occur (e.g. from authorize throwing)
      if (typeOrMessage.includes("INVALID_2FA_CODE")) {
        return { error: "INVALID_2FA_CODE" };
      }

      return { error: "Invalid email or password" };
    }

    throw error;
  }
}
