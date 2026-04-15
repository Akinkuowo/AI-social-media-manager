import NextAuth, { CredentialsSignin } from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";

class TwoFactorRequiredError extends CredentialsSignin {
  code = "2FA_REQUIRED";
}

class InvalidTwoFactorError extends CredentialsSignin {
  code = "INVALID_2FA_CODE";
}

class TwoFactorSecretMissingError extends CredentialsSignin {
  code = "2FA_SECRET_MISSING";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        if (user.twoFactorEnabled) {
          if (!credentials.code) {
             console.log(`[AUTH] 2FA required for user: ${user.email}`);
             // Instead of throwing, we return the user but mark them as NOT 2FA authenticated.
             // This allows Auth.js to create a session that we can then use in middleware
             // to force the user to the 2FA page.
             return {
               id: user.id,
               email: user.email,
               name: user.name,
               twoFactorEnabled: user.twoFactorEnabled,
               isTwoFactorAuthenticated: false,
             };
          }

          if (!user.twoFactorSecret) {
             console.error(`[AUTH] 2FA enabled but secret missing for user: ${user.email}`);
             throw new TwoFactorSecretMissingError();
          }

          const cleanCode = String(credentials.code).replace(/\s+/g, '');
          const isTwoFactorValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: cleanCode,
            window: 10
          });

          if (!isTwoFactorValid) {
            const currentExpected = speakeasy.totp({ secret: user.twoFactorSecret, encoding: 'base32' });
            console.log(`[LOGIN_2FA] Failed for ${user.email}. Provided: ${cleanCode}, Expected: ${currentExpected}`);
            throw new InvalidTwoFactorError();
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          twoFactorEnabled: user.twoFactorEnabled,
          isTwoFactorAuthenticated: true,
        };
      },
    }),
  ],
});
