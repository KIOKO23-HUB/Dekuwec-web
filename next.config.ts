import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Also ignore ESLint warnings during production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
