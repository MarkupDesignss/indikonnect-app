/** @type {import('next').NextConfig} */

const appBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

const distDirectory =
  appBasePath === "/indiekonnect-distributor"
    ? "out-distributor"
    : appBasePath === "/indiekonnect-web"
      ? "out-customer"
      : "out";

const nextConfig = {
  /**
   * Static export for cPanel / Apache hosting
   */
  output: "export",

  /**
   * IMPORTANT:
   *
   * Customer build:
   * /indiekonnect-web
   *
   * Distributor build:
   * /indiekonnect-distributor
   */
  basePath: appBasePath,

  /**
   * Images are handled as static files
   */
  images: {
    unoptimized: true,
  },

  /**
   * Generate trailing slash URLs
   */
  trailingSlash: true,

  /**
   * Separate output directories so the two builds
   * do not overwrite each other.
   *
   * Customer:
   * out-customer/
   *
   * Distributor:
   * out-distributor/
   */
  distDir: distDirectory,

  /**
   * IGNORE TYPESCRIPT ERRORS DURING BUILD
   */
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * Local development
   */
  allowedDevOrigins: [
    "customer.indiekonnect.test",
    "distributor.indiekonnect.test",
  ],

  /**
   * Turbopack project root
   */
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
