import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  twoFactorEnabled: boolean;
  isTwoFactorAuthenticated: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User extends ExtendedUser {}
}

import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    twoFactorEnabled?: boolean;
    isTwoFactorAuthenticated?: boolean;
  }
}

