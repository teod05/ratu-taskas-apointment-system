import type { NextConfig } from "next";

const nextConfig = {
  outputFileTracingIncludes: {
    "/api/*": ["./app/generated/prisma/**/*"],
  },
} satisfies NextConfig;

export default nextConfig;
