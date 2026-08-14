import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// ✅ Set basePath to "/indiekonnect-web" only
const basePath = isProd ? "/indiekonnect-web" : "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,

  // ✅ CORRECT - Single basePath
  basePath: basePath,
  assetPrefix: basePath,

  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;