import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Tell Turbopack the correct workspace root
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Fix for images.domains deprecation
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Server actions configuration
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
