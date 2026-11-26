"use client";

type OfferFields = {
  distributor_offer_price?: unknown;
  offer_price_distributor?: unknown;
  distributor_final_price?: unknown;
  distributor_offer_percentage?: unknown;
  offer_discount_percentage?: unknown;
  offer_percentage?: unknown;
  offer?: { discount_percentage?: unknown; percentage?: unknown } | null;
};
type StockPolicy = { allowed_purchsed?: unknown };
type ProfileIdentity = { id?: unknown; account_type?: unknown };
type ProfileEnvelope = ProfileIdentity & {
  user?: ProfileIdentity | null;
  data?: (ProfileIdentity & { user?: ProfileIdentity | null }) | null;
};
type RatingSummary = { average_rating?: unknown; total_reviews?: unknown };
type ImageFields = {
  image_url?: string | null;
  image?: string | null;
  is_primary?: boolean | number;
};
type VariantImageFields = {
  primary_image_url?: string | null;
  image_url?: string | null;
  image?: string | null;
  primary_image?: string | null;
  images?: ImageFields[] | null;
};

/* Distributor-only offer pricing. Customer pricing is untouched.
 * An explicit offer percentage is applied to the distributor base price.
 * If the API already supplies an offer/final price, prefer that value.
 * Do not infer an extra discount from the MRP/price difference.
 */
export const distributorOfferPrice = (
  item: OfferFields | null | undefined,
  base: number,
): number => {
  if (!Number.isFinite(base) || base <= 0) return base;
  const finalPrice = [
    item?.distributor_offer_price,
    item?.offer_price_distributor,
    item?.distributor_final_price,
  ].find((v) => v !== null && v !== undefined && v !== "" && Number(v) > 0);
  if (finalPrice !== undefined) return Number(finalPrice);
  const rawPercent = [
    item?.distributor_offer_percentage,
    item?.offer_discount_percentage,
    item?.offer_percentage,
    item?.offer?.discount_percentage,
    item?.offer?.percentage,
  ].find(
    (v) =>
      v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v)),
  );
  const percent = Number(rawPercent ?? 0);
  if (percent <= 0 || percent > 100) return base;
  return Math.round(base * (1 - percent / 100) * 100) / 100;
};

/** API spelling is intentionally `allowed_purchsed` (not allowed_purchased). */
export const isPurchaseAllowedWithoutStock = (
  item: StockPolicy | null | undefined,
): boolean =>
  item?.allowed_purchsed === true ||
  item?.allowed_purchsed === 1 ||
  String(item?.allowed_purchsed ?? "").toLowerCase() === "true" ||
  String(item?.allowed_purchsed ?? "") === "1";

/* =========================================================
   TYPES
========================================================= */

export interface ProductDetailProps {
  productSlug: string;
}

export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number | null;
  quantity: number;
}

/* =========================================================
   CONSTANTS
========================================================= */

export const PLACEHOLDER = "/indiekonnect-web/images/placeholder.jpg";

export const RATING_GREEN = "#188447";

/* =========================================================
   REDUCED MOTION
========================================================= */

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   RIPPLE
========================================================= */

export function fireRipple(e: React.MouseEvent<HTMLElement>) {
  if (prefersReduced()) return;

  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();

  const span = document.createElement("span");
  span.className = "ik-ripple";
  span.style.left = `${e.clientX - rect.left - 7}px`;
  span.style.top = `${e.clientY - rect.top - 7}px`;

  btn.appendChild(span);

  setTimeout(() => {
    span.remove();
  }, 700);
}

/* =========================================================
   FLY IMAGE TO CART
========================================================= */

export function flyImageToCart(sourceEl: HTMLElement | null, imgSrc: string) {
  if (prefersReduced() || !sourceEl) return;

  const target = document.querySelector("#cart-icon") as HTMLElement | null;

  const a = sourceEl.getBoundingClientRect();

  const b = target
    ? target.getBoundingClientRect()
    : ({
        left: window.innerWidth - 60,
        top: 20,
        width: 24,
        height: 24,
      } as DOMRect);

  const ghost = document.createElement("div");

  ghost.className = "ik-fly-ghost";
  ghost.style.left = `${a.left}px`;
  ghost.style.top = `${a.top}px`;
  ghost.style.width = `${a.width}px`;
  ghost.style.height = `${a.height}px`;
  ghost.style.backgroundImage = `url(${imgSrc})`;

  document.body.appendChild(ghost);

  const dx = b.left - a.left + b.width / 2 - a.width / 2;
  const dy = b.top - a.top + b.height / 2 - a.height / 2;

  const anim = ghost.animate(
    [
      {
        transform: "translate(0,0) scale(1)",
        opacity: 1,
      },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.35 - 90}px) scale(.6)`,
        opacity: 0.95,
        offset: 0.55,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(.06)`,
        opacity: 0,
      },
    ],
    {
      duration: 900,
      easing: "cubic-bezier(.5,-.2,.35,1)",
    },
  );

  anim.onfinish = () => {
    ghost.remove();

    if (target) {
      target.classList.remove("ik-bump");
      void target.offsetWidth;
      target.classList.add("ik-bump");
    }
  };
}

/* =========================================================
   HEART POP
========================================================= */

export function popHeart(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;

  el.classList.remove("ik-heart-pop");
  void el.offsetWidth;
  el.classList.add("ik-heart-pop");
}

/* =========================================================
   ACCOUNT TYPE
========================================================= */

export const getUserAccountType = (
  profileData: ProfileEnvelope | null | undefined,
): "retail" | "distributor" => {
  if (!profileData) return "retail";

  const accountType =
    profileData?.user?.account_type ||
    profileData?.account_type ||
    profileData?.data?.account_type ||
    profileData?.data?.user?.account_type;

  if (
    accountType === "distributor" ||
    accountType === "Distributor" ||
    accountType === "DISTRIBUTOR"
  ) {
    return "distributor";
  }

  return "retail";
};

/* =========================================================
   USER ID
========================================================= */

export const getUserId = (
  profileData: ProfileEnvelope | null | undefined,
): string | null => {
  if (!profileData) return null;

  const id =
    profileData?.user?.id ??
    profileData?.data?.user?.id ??
    profileData?.data?.id ??
    profileData?.id ??
    null;

  return id == null ? null : String(id);
};

/* =========================================================
   JSON PARSER
========================================================= */

export const parseJsonObject = (value: unknown): Record<string, unknown> => {
  if (!value) return {};

  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);

      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  return {};
};

/* =========================================================
   RATING HELPERS
========================================================= */

export const getAverageRating = (
  summary: RatingSummary | null | undefined,
): number => {
  const rating = Number(summary?.average_rating ?? 0);

  if (!Number.isFinite(rating)) return 0;

  return Math.min(5, Math.max(0, rating));
};

export const getTotalReviews = (
  summary: RatingSummary | null | undefined,
): number => {
  const total = Number(summary?.total_reviews ?? 0);

  if (!Number.isFinite(total)) return 0;

  return Math.max(0, total);
};

/* =========================================================
   VARIANT IMAGE
========================================================= */

export const getVariantImageUrl = (
  variant: VariantImageFields | null | undefined,
): string | null => {
  if (!variant) return null;

  if (variant.primary_image_url || variant.image_url || variant.image) {
    return (
      variant.primary_image_url || variant.image_url || variant.image || null
    );
  }

  if (Array.isArray(variant.images) && variant.images.length > 0) {
    const primary =
      variant.images.find((img: ImageFields) => img?.is_primary) ||
      variant.images[0];

    return primary?.image_url || primary?.image || null;
  }

  return null;
};

/* =========================================================
   VARIANT GALLERY
========================================================= */

export const getVariantGalleryImages = (
  variant: VariantImageFields | null | undefined,
): string[] => {
  if (!variant) return [];

  const images = Array.isArray(variant.images)
    ? variant.images
        .map((img: ImageFields) => img?.image_url || img?.image)
        .filter(Boolean)
    : [];

  const primary =
    variant.primary_image_url ||
    variant.image_url ||
    variant.image ||
    variant.primary_image ||
    null;

  return Array.from(
    new Set(
      [primary, ...images].filter(
        (url): url is string => typeof url === "string" && Boolean(url),
      ),
    ),
  );
};

/* =========================================================
   SLUG
========================================================= */

export const generateSlugFromName = (name: string): string => {
  if (!name) return "";

  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/* =========================================================
   COMBO HELPERS
========================================================= */

export const formatINR = (value: number): string =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
