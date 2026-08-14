// next.config.js
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,

  // ✅ IMPORTANT: basePath set karein
  basePath: isProd ? "/indiekonnect-web" : "",
  assetPrefix: isProd ? "/indiekonnect-web" : "",

  // ✅ Static export ke liye
  distDir: "out",

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
