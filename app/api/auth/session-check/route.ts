import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to verify what the server-side session "sees".
 * This helps us determine if the issue is with the JWT propagation or the UI rendering.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ 
        authenticated: false, 
        message: "No active session found. Please log in." 
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role || "UNDEFINED",
        twoFactorEnabled: (session.user as any).twoFactorEnabled,
        isTwoFactorAuthenticated: (session.user as any).isTwoFactorAuthenticated,
      },
      token_check: {
          has_role_field: !!(session.user as any).role,
          role_value: (session.user as any).role
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "INTERNAL_DIAGNOSTIC_FAILURE", 
      message: error.message 
    }, { status: 500 });
  }
}
