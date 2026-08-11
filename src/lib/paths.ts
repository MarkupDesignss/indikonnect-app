// lib/paths.ts

// Hardcoded base path - no ENV needed
const BASE_PATH = "/indiekonnect-web";

/**
 * Get image path with basePath
 * @example getImagePath("/indiekonnect-web/images/logo.png") => "/indiekonnect-web/images/logo.png"
 */
export const getImagePath = (path: string): string => {
  // Remove leading slash if exists to avoid double slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${cleanPath}`;
};

/**
 * Get asset path with basePath
 * @example getAssetPath("/fonts/roboto.woff") => "/indiekonnect-web/fonts/roboto.woff"
 */
export const getAssetPath = getImagePath;

/**
 * Check if running in production
 */
export const isProduction = process.env.NODE_ENV === "production";
