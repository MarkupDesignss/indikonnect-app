import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
  const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER;

  // Production static export folders
  const productionDistDirectory =
    appBasePath === "/indiekonnect-distributor"
      ? "out-distributor"
      : appBasePath === "/indiekonnect-web"
        ? "out-customer"
        : "out";

  return {
    // ==========================================
    // STATIC EXPORT FOR CPANEL HOSTING
    // ==========================================
    output: "export",

    // ==========================================
    // APP BASE PATH
    // ==========================================
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

    // ==========================================
    // BUILD DIRECTORY
    // ==========================================
    //
    // Development:
    //   .next
    //
    // Production:
    //   Customer     -> out-customer
    //   Distributor  -> out-distributor
    //
    distDir: isDevelopment ? ".next" : productionDistDirectory,

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
};

export default nextConfig;
