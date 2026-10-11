import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Ensure uploads directory is served or static files accessible
};

export default nextConfig;
