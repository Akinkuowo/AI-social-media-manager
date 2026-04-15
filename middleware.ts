import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth((req) => {
  const isLoggedIn = !!req.auth
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard") || 
                      req.nextUrl.pathname.startsWith("/calendar") ||
                      req.nextUrl.pathname.startsWith("/generate") ||
                      req.nextUrl.pathname.startsWith("/analytics")
  
  if (isDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
