import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const auth = req.auth as any;
  const is2FAAuthenticated = auth?.user?.isTwoFactorAuthenticated;
  const userNeeds2FA = auth?.user?.twoFactorEnabled;

  const isPublicRoute = nextUrl.pathname === "/login" || 
                        nextUrl.pathname === "/register" || 
                        nextUrl.pathname === "/forgot-password" ||
                        nextUrl.pathname === "/reset-password";
  
  const is2FARoute = nextUrl.pathname === "/login/2fa";
  
  const isDashboard = nextUrl.pathname.startsWith("/dashboard") || 
                      nextUrl.pathname.startsWith("/calendar") ||
                      nextUrl.pathname.startsWith("/generate") ||
                      nextUrl.pathname.startsWith("/analytics") ||
                      nextUrl.pathname.startsWith("/settings") ||
                      nextUrl.pathname.startsWith("/media");

  // If logged in and on a public route, redirect to dashboard if 2FA is complete
  if (isPublicRoute && isLoggedIn) {
    if (userNeeds2FA && !is2FAAuthenticated) {
      return Response.redirect(new URL("/login/2fa", nextUrl));
    }
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  // If logged in but 2FA is needed and not authenticated, redirect to 2FA page
  if (isLoggedIn && userNeeds2FA && !is2FAAuthenticated && !is2FARoute) {
     return Response.redirect(new URL("/login/2fa", nextUrl));
  }

  // If not logged in and trying to access dashboard/2FA, redirect to login
  if (!isLoggedIn && (isDashboard || is2FARoute)) {
    return Response.redirect(new URL("/login", nextUrl));
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
