import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",

  images: {
    unoptimized: true,
  },

  trailingSlash: false,

  reactStrictMode: true,

  ...(isProd
    ? {
        basePath: "/indikonnect-web",
        assetPrefix: "/indikonnect-web",
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
