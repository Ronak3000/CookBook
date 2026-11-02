import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep development output separate so production builds cannot disrupt a running app.
  distDir: process.env.NODE_ENV === "development" ? ".next-development" : ".next",
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
