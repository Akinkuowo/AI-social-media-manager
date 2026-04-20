import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [], // We'll configure providers in auth.ts
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
        token.isTwoFactorAuthenticated = (user as any).isTwoFactorAuthenticated;
        token.role = (user as any).role;
      }
      
      // Handle session updates (e.g., after 2FA verification)
      if (trigger === "update" && session) {
        if (session.twoFactorEnabled !== undefined) token.twoFactorEnabled = session.twoFactorEnabled;
        if (session.isTwoFactorAuthenticated !== undefined) token.isTwoFactorAuthenticated = session.isTwoFactorAuthenticated;
        if (session.role !== undefined) token.role = session.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        (session.user as any).twoFactorEnabled = !!token.twoFactorEnabled;
        (session.user as any).isTwoFactorAuthenticated = !!token.isTwoFactorAuthenticated;
        (session.user as any).role = token.role || "USER";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
