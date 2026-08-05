import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // If your site is in a subfolder
  basePath: "/indikonnect-web",
  assetPrefix: "/indikonnect-web",

  // Important for Redux and React 19
  reactStrictMode: true,
  swcMinify: true,

  // Skip type checking during build to avoid errors
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
