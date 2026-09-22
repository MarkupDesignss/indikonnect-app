/** @type {import('next').NextConfig} */

const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => {
  const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER;

  const productionDistDirectory =
    appBasePath === "/indiekonnect-distributor"
      ? "out-distributor"
      : appBasePath === "/indiekonnect-web"
        ? "out-customer"
        : "out";

  return {
    // ==========================================
    // STATIC EXPORT FOR CPANEL / APACHE HOSTING
    // ==========================================
    output: "export",

    // ==========================================
    // APP BASE PATH
    // ==========================================
    //
    // Customer:
    // /indiekonnect-web
    //
    // Distributor:
    // /indiekonnect-distributor
    //
    basePath: appBasePath,

    // ==========================================
    // IMAGE CONFIG
    // ==========================================
    images: {
      unoptimized: true,
    },

    // ==========================================
    // TRAILING SLASH
    // ==========================================
    trailingSlash: true,

    // ==========================================
    // BUILD DIRECTORY
    // ==========================================
    //
    // Development:
    //   Next.js default development directory
    //
    // Production:
    //   Customer     -> out-customer
    //   Distributor  -> out-distributor
    //
    // This prevents dev from creating
    // out-customer / out-distributor.
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
    // TURBOPACK PROJECT ROOT
    // ==========================================
    turbopack: {
      root: __dirname,
    },
  };
};
