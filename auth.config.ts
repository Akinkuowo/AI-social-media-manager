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
      }
      if (trigger === "update" && session?.twoFactorEnabled !== undefined) {
        token.twoFactorEnabled = session.twoFactorEnabled;
      }
      if (trigger === "update" && session?.isTwoFactorAuthenticated !== undefined) {
        token.isTwoFactorAuthenticated = session.isTwoFactorAuthenticated;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        (session.user as any).twoFactorEnabled = token.twoFactorEnabled;
        (session.user as any).isTwoFactorAuthenticated = token.isTwoFactorAuthenticated;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
