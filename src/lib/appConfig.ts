// src/lib/appConfig.ts

export type AppType = "customer" | "distributor";

/**
 * =========================================================
 * APP BASE PATHS
 * =========================================================
 *
 * CUSTOMER:
 * /indiekonnect-web
 *
 * DISTRIBUTOR:
 * /indiekonnect-distributor
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
 * GET APP TYPE
 * =========================================================
 *
 * OPTION B:
 *
 * Same domain:
 *
 * https://www.markupdesigns.net/indiekonnect-web/
 *        -> customer
 *
 * https://www.markupdesigns.net/indiekonnect-distributor/
 *        -> distributor
 *
 * LOCAL:
 *
 * http://customer.indiekonnect.test:3000/
 *        -> customer
 *
 * http://distributor.indiekonnect.test:3000/
 *        -> distributor
 */
export const getAppType = (): AppType => {
  // -------------------------------------------------------
  // SERVER SIDE
  // -------------------------------------------------------
  //
  // During SSR there is no window.
  // Use build-time environment variable when available.
  //
  if (typeof window === "undefined") {
    const buildBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

    if (buildBasePath === DISTRIBUTOR_BASE_PATH) {
      return "distributor";
    }

    return "customer";
  }

  const pathname = normalizePath(window.location.pathname);

  const hostname = window.location.hostname;

  // -------------------------------------------------------
  // LOCAL DEVELOPMENT
  // -------------------------------------------------------

  if (hostname === "distributor.indiekonnect.test") {
    return "distributor";
  }

  if (hostname === "customer.indiekonnect.test") {
    return "customer";
  }

  // -------------------------------------------------------
  // PRODUCTION / SAME-DOMAIN SUBDIRECTORIES
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // LOCALHOST DEFAULT
  // -------------------------------------------------------
  //
  // Plain localhost is treated as customer.
  //
  if (hostname === "localhost") {
    return "customer";
  }

  // -------------------------------------------------------
  // DEFAULT
  // -------------------------------------------------------

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
 *
 * Customer:
 * /indiekonnect-web/
 *
 * Distributor:
 * /indiekonnect-distributor/
 */
export const getAppHomeUrl = (): string => {
  return `${getAppBasePath()}/`;
};

/**
 * =========================================================
 * GET CUSTOMER DOMAIN / URL
 * =========================================================
 *
 * IMPORTANT:
 * Since customer and distributor use the SAME domain,
 * this returns the same origin with customer base path.
 */
export const getCustomerDomain = (): string => {
  // -------------------------------------------------------
  // SERVER SIDE
  // -------------------------------------------------------

  if (typeof window === "undefined") {
    return `${PRODUCTION_ORIGIN}${CUSTOMER_BASE_PATH}`;
  }

  const hostname = window.location.hostname;

  // -------------------------------------------------------
  // LOCAL DEVELOPMENT
  // -------------------------------------------------------

  if (
    hostname === "customer.indiekonnect.test" ||
    hostname === "distributor.indiekonnect.test"
  ) {
    return `${window.location.protocol}//${window.location.host.replace(
      hostname,
      "customer.indiekonnect.test",
    )}`;
  }

  if (hostname === "localhost") {
    return `http://localhost:3000${CUSTOMER_BASE_PATH}`;
  }

  // -------------------------------------------------------
  // PRODUCTION
  // -------------------------------------------------------

  return `${window.location.origin}${CUSTOMER_BASE_PATH}`;
};

/**
 * =========================================================
 * GET DISTRIBUTOR DOMAIN / URL
 * =========================================================
 *
 * IMPORTANT:
 * Same domain + distributor subdirectory.
 */
export const getDistributorDomain = (): string => {
  // -------------------------------------------------------
  // SERVER SIDE
  // -------------------------------------------------------

  if (typeof window === "undefined") {
    return `${PRODUCTION_ORIGIN}${DISTRIBUTOR_BASE_PATH}`;
  }

  const hostname = window.location.hostname;

  // -------------------------------------------------------
  // LOCAL DEVELOPMENT
  // -------------------------------------------------------

  if (
    hostname === "customer.indiekonnect.test" ||
    hostname === "distributor.indiekonnect.test"
  ) {
    return `${window.location.protocol}//${window.location.host.replace(
      hostname,
      "distributor.indiekonnect.test",
    )}`;
  }

  if (hostname === "localhost") {
    return `http://localhost:3000${DISTRIBUTOR_BASE_PATH}`;
  }

  // -------------------------------------------------------
  // PRODUCTION
  // -------------------------------------------------------

  return `${window.location.origin}${DISTRIBUTOR_BASE_PATH}`;
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
