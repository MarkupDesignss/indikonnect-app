// next.config.ts

import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",

  images: {
    unoptimized: true,
  },

  trailingSlash: true,

  reactStrictMode: true,

  // ✅ Fix multiple lockfiles / workspace root warning
  turbopack: {
    root: __dirname,
  },

  // ✅ Production subdirectory
  basePath: isProd ? "/indiekonnect-web" : "",
  assetPrefix: isProd ? "/indiekonnect-web" : "",

  // ✅ Static export
  distDir: "out",

  // ⚠️ Currently TypeScript errors won't fail the build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
