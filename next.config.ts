import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/*": ["./app/generated/prisma/**/*"],
    },
  }, .
};

export default nextConfig;
