"use client";



/* =========================================================
   DISTRIBUTOR / WEB BASE PATH
========================================================= */

/**
 * Distributor route:  /indiekonnect-distributor/home/
 * Web route:         /indiekonnect-web/home/
 *
 * We detect distributor by the current pathname.
 * All fallback images and asset paths are resolved from this base.
 */
export const getBasePath = (): string => {
  if (typeof window === "undefined") {
    return "/indiekonnect-web";
  }

  const path = window.location.pathname || "";

  if (path.startsWith("/indiekonnect-distributor")) {
    return "/indiekonnect-distributor";
  }

  return "/indiekonnect-web";
};


export const getPlaceholderImage = (): string =>
  `${getBasePath()}/images/placeholder.png`;


export const getPromoPlaceholderImage = (): string =>
  `${getBasePath()}/images/prod.png`;


/* =========================================================
   ANIMATIONS
========================================================= */

export const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 60,
    filter: "blur(4px)",
  },

  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",

    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};


export const fadeIn = {
  hidden: {
    opacity: 0,
    filter: "blur(4px)",
  },

  visible: {
    opacity: 1,
    filter: "blur(0px)",

    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};


export const staggerContainer = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};


/* =========================================================
   COMMON CONTAINER
========================================================= */

export const sectionContainerClass = `
  mx-auto
  w-full
  max-w-[min(100%,1400px)]
  px-3
  sm:px-4
  md:px-5
  lg:px-6
`;


/* =========================================================
   HELPERS
========================================================= */

export type HomeProductImage = { image_url?: string | null; is_primary?: boolean | number | string | null };
export type HomePricingFields = {
  distributor_offer_price?: unknown;
  offer_price_distributor?: unknown;
  distributor_final_price?: unknown;
  distributor_offer_percentage?: unknown;
  offer_discount_percentage?: unknown;
  offer_percentage?: unknown;
  offer?: { discount_percentage?: unknown; percentage?: unknown } | null;
  distributor_price?: unknown;
  current_price?: unknown;
  retail_price?: unknown;
  distributor_mrp?: unknown;
  original_price?: unknown;
  retail_mrp?: unknown;
  allowed_purchsed?: unknown;
  images?: HomeProductImage[] | null;
  primary_image_url?: string | null;
  image?: string | null;
};
export type HomeCardProduct = HomePricingFields & {
  id: number | string;
  name: string;
  slug?: string | null;
  brand_name?: string | null;
  brand?: { name?: string | null } | null;
  category?: { name?: string | null } | null;
  reviews?: { average_rating?: unknown } | null;
  reviews_summary?: { average_rating?: unknown } | null;
  rating?: unknown;
  in_stock?: boolean | null;
  stock_status?: unknown;
  stock_quantity?: unknown;
};

/** Distributor-only BA offer price. Explicit final price wins; otherwise
 * apply the API's offer percentage once to the distributor base price.
 * Never alter the customer price calculation.
 */
export const getDistributorOfferPrice = (product: HomePricingFields | null | undefined, base: number): number => {
  if (!Number.isFinite(base) || base <= 0) return base;

  const explicitFinalPrice = [
    product?.distributor_offer_price,
    product?.offer_price_distributor,
    product?.distributor_final_price,
  ].find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value)) &&
      Number(value) > 0,
  );
  if (explicitFinalPrice !== undefined) return Number(explicitFinalPrice);

  const rawPercentage = [
    product?.distributor_offer_percentage,
    product?.offer_discount_percentage,
    product?.offer_percentage,
    product?.offer?.discount_percentage,
    product?.offer?.percentage,
  ].find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value)),
  );
  const percentage = Number(rawPercentage ?? 0);
  if (percentage <= 0 || percentage > 100) return base;

  return Math.round(base * (1 - percentage / 100) * 100) / 100;
};


export const getProductPrice = (product: HomePricingFields | null | undefined, userType?: string) => {
  if (!product) return 0;

  if (userType === "distributor") {
    const basePrice = Number(
      product.distributor_price ||
        product.current_price ||
        product.retail_price ||
        0,
    );
    return getDistributorOfferPrice(product, basePrice);
  }

  return Number(product.current_price || product.retail_price || 0);
};


export const getProductMrp = (product: HomePricingFields | null | undefined, userType?: string) => {
  if (!product) return 0;

  if (userType === "distributor") {
    return Number(
      product.distributor_mrp ||
        product.original_price ||
        product.retail_mrp ||
        0,
    );
  }

  return Number(product.original_price || product.retail_mrp || 0);
};


export const getDiscountPercentage = (product: HomePricingFields | null | undefined, userType?: string) => {
  if (!product) return 0;

  const mrp = getProductMrp(product, userType);

  const price = getProductPrice(product, userType);

  if (mrp > 0 && price > 0 && mrp > price) {
    return Math.round(((mrp - price) / mrp) * 100);
  }

  return 0;
};


/** The API intentionally spells this field `allowed_purchsed`. */
export const isPurchaseAllowedWithoutStock = (product: HomePricingFields | null | undefined): boolean =>
  product?.allowed_purchsed === true ||
  product?.allowed_purchsed === 1 ||
  product?.allowed_purchsed === "1";


export const getProductImage = (product: HomePricingFields | null | undefined) => {
  if (!product) {
    return getPlaceholderImage();
  }

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const primary = product.images.find((img: HomeProductImage) => img?.is_primary);

    return (
      primary?.image_url ||
      product.images[0]?.image_url ||
      product.primary_image_url ||
      getPlaceholderImage()
    );
  }

  return product?.primary_image_url || product?.image || getPlaceholderImage();
};


export const railGapClass =
  "gap-x-3 gap-y-7 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 lg:gap-x-6";
