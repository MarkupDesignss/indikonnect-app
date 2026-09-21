// next.config.ts

import type { NextConfig } from "next";

const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

// Separate build folders so customer/distributor builds
// overwrite each other nahi karenge.
const distDirectory =
  appBasePath === "/indiekonnect-distributor"
    ? "out-distributor"
    : appBasePath === "/indiekonnect-web"
      ? "out-customer"
      : "out";

const nextConfig: NextConfig = {
  // ==========================================
  // STATIC EXPORT FOR CPANEL HOSTING
  // ==========================================
  output: "export",

  /**
   * Customer build:
   * /indiekonnect-web
   *
   * Distributor build:
   * /indiekonnect-distributor
   */
  basePath: appBasePath,

  // ==========================================
  // IMAGE CONFIG
  // ==========================================
  images: {
    unoptimized: true,
  },

  // Generate route/index.html structure
  // suitable for static cPanel hosting.
  trailingSlash: true,

  /**
   * Customer:
   * out-customer/
   *
   * Distributor:
   * out-distributor/
   */
  distDir: distDirectory,

  // ==========================================
  // IGNORE TYPESCRIPT ERRORS DURING BUILD
  // ==========================================
  typescript: {
    ignoreBuildErrors: true,
  },

  // ==========================================
  // LOCAL DEVELOPMENT
  // ==========================================
  allowedDevOrigins: [
    "customer.indiekonnect.test",
    "distributor.indiekonnect.test",
  ],

  // ==========================================
  // TURBOPACK
  // ==========================================
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
