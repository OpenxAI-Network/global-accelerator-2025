import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true, // ✅ disables eslint blocking builds
  },
};

export default nextConfig;
