import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",

  images: {
    unoptimized: true,
  },

  trailingSlash: true,

  reactStrictMode: true,

  ...(isProd
    ? {
        basePath: "/indiekonnect-web",
        assetPrefix: "/indiekonnect-web",
      }
    : {}),

  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;