import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  // @ts-ignore - Required for ngrok dev tunneling
  allowedDevOrigins: ['sitcom-reverence-resistant.ngrok-free.dev'],
};

export default nextConfig;
