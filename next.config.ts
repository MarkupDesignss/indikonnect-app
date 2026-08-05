import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",

  images: {
    unoptimized: true,
  },

  trailingSlash: true,

  reactStrictMode: true,

  // Enable only when deploying to a subfolder
  ...(isProd && {
    basePath: "/indikonnect-web",
    assetPrefix: "/indikonnect-web",
  }),

  // Ignore TypeScript errors during production build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Turbopack workspace root
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
