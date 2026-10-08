// src/lib/appConfig.ts

export type AppType = "customer" | "distributor";

/**
 * =========================================================
 * APP BASE PATHS
 * =========================================================
 */

export const CUSTOMER_BASE_PATH = "/indiekonnect-web";

export const DISTRIBUTOR_BASE_PATH = "/indiekonnect-distributor";

/**
 * =========================================================
 * PRODUCTION HOST
 * =========================================================
 */

export const PRODUCTION_ORIGIN = "https://www.markupdesigns.net";

/**
 * =========================================================
 * NORMALIZE PATH
 * =========================================================
 */

const normalizePath = (path: string): string => {
  if (!path) {
    return "/";
  }

  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
};

/**
 * =========================================================
 * ✅ SSR-SAFE SITE ORIGIN
 * =========================================================
 *
 * Returns the same origin on BOTH server & client.
 *
 * Priority:
 *   1. NEXT_PUBLIC_SITE_ORIGIN (env)
 *   2. PRODUCTION_ORIGIN (fallback)
 *
 * Why:
 *   SSR + CSR must render the SAME href values.
 *   Using window.location.origin on the client alone
 *   causes React hydration mismatches.
 */
const getSiteOrigin = (): string => {
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || PRODUCTION_ORIGIN;

  return origin.replace(/\/$/, "");
};

/**
 * =========================================================
 * GET APP TYPE
 * =========================================================
 */
export const getAppType = (): AppType => {
  /* -------------------------------------------------------
     SERVER SIDE
     ------------------------------------------------------- */
  if (typeof window === "undefined") {
    const buildBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

    if (buildBasePath === DISTRIBUTOR_BASE_PATH) {
      return "distributor";
    }

    return "customer";
  }

  const pathname = normalizePath(window.location.pathname);
  const hostname = window.location.hostname;

  /* -------------------------------------------------------
     LOCAL DEVELOPMENT — SUBDOMAINS
     ------------------------------------------------------- */
  if (hostname === "distributor.indiekonnect.test") {
    return "distributor";
  }

  if (hostname === "customer.indiekonnect.test") {
    return "customer";
  }

  /* -------------------------------------------------------
     PRODUCTION / SAME-DOMAIN SUBDIRECTORIES
     ------------------------------------------------------- */
  if (
    pathname === DISTRIBUTOR_BASE_PATH ||
    pathname.startsWith(`${DISTRIBUTOR_BASE_PATH}/`)
  ) {
    return "distributor";
  }

  if (
    pathname === CUSTOMER_BASE_PATH ||
    pathname.startsWith(`${CUSTOMER_BASE_PATH}/`)
  ) {
    return "customer";
  }

  /* -------------------------------------------------------
     LOCALHOST DEFAULT
     ------------------------------------------------------- */
  if (hostname === "localhost") {
    return "customer";
  }

  return "customer";
};

/**
 * =========================================================
 * GET CURRENT APP BASE PATH
 * =========================================================
 */
export const getAppBasePath = (): string => {
  return getAppType() === "distributor"
    ? DISTRIBUTOR_BASE_PATH
    : CUSTOMER_BASE_PATH;
};

/**
 * =========================================================
 * GET CURRENT APP HOME URL
 * =========================================================
 */
export const getAppHomeUrl = (): string => {
  return `${getAppBasePath()}/`;
};

/**
 * =========================================================
 * ✅ FIXED — GET CUSTOMER DOMAIN / URL
 * =========================================================
 *
 * NOW: Server + Client BOTH render the SAME origin.
 *      No more hydration mismatch.
 *
 * Local dev override:
 *   Set NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3000
 *   in `.env.local` to test locally.
 */
export const getCustomerDomain = (): string => {
  return `${getSiteOrigin()}${CUSTOMER_BASE_PATH}`;
};

/**
 * =========================================================
 * ✅ FIXED — GET DISTRIBUTOR DOMAIN / URL
 * =========================================================
 */
export const getDistributorDomain = (): string => {
  return `${getSiteOrigin()}${DISTRIBUTOR_BASE_PATH}`;
};

/**
 * =========================================================
 * CUSTOMER APP CHECK
 * =========================================================
 */
export const isCustomerApp = (): boolean => {
  return getAppType() === "customer";
};

/**
 * =========================================================
 * DISTRIBUTOR APP CHECK
 * =========================================================
 */
export const isDistributorApp = (): boolean => {
  return getAppType() === "distributor";
};
