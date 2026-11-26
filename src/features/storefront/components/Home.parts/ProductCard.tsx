"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { useCheckProductStockMutation } from "@/lib/redux/api/productApi";
import { getPlaceholderImage, getProductImage, getProductMrp, getProductPrice, isPurchaseAllowedWithoutStock } from "@/features/storefront/components/Home.parts/support";


/* =========================================================
   PRODUCT CARD
========================================================= */

export function ProductCard({
  product,
  index = 0,
  router: routerProp,
  userType,
  wish,
  handleToggleWishlist,
  imageIndex = 0,
  images = [],
  onDotClick,
  label,
  showCartButtons = true,
}: any) {
  const routerFromHook = useRouter();
  const router = routerProp || routerFromHook;
  const dispatch = useAppDispatch();

  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [checkProductStock] = useCheckProductStockMutation();
  const purchaseLockRef = useRef(false);
  const [stockUnavailable, setStockUnavailable] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const price = getProductPrice(product, userType);
  const mrp = getProductMrp(product, userType);
  const discount =
    mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const rating =
    product?.reviews?.average_rating ??
    product?.reviews_summary?.average_rating ??
    product?.rating ??
    4.4;

  // Product listing API exposes brand_name directly (not necessarily brand.name).
  const brandName = String(
    product?.brand_name ?? product?.brand?.name ?? "",
  ).trim();

  const categoryName = product?.category?.name || "All Watches";
  const fullTitle = product?.name || "Premium watch";

  const currentImage =
    images.length > 0
      ? images[imageIndex]?.image_url || images[0]?.image_url
      : getProductImage(product);

  const isWishlisted = wish?.[product?.id] || false;

  // Explicit purchase permission bypasses stock quantity and stock status only.
  const allowsPurchaseWithoutStock = isPurchaseAllowedWithoutStock(product);
  const inStock =
    allowsPurchaseWithoutStock ||
    (!stockUnavailable &&
      product?.in_stock !== false &&
      !["out_of_stock", "inactive", "disabled"].includes(
        String(product?.stock_status ?? "").toLowerCase(),
      ) &&
      (product?.stock_quantity == null || Number(product.stock_quantity) > 0));

  const stockQty = Number(product?.stock_quantity);
  const lowStock =
    !allowsPurchaseWithoutStock &&
    inStock &&
    Number.isFinite(stockQty) &&
    stockQty > 0 &&
    stockQty <= 5;

  useEffect(() => {
    setStockUnavailable(false);
  }, [product?.id]);

  const verifyLiveStock = async () => {
    const id = Number(product?.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid product. Please refresh and try again.");
    }

    // Do not call stock API when the product explicitly permits purchases.
    if (allowsPurchaseWithoutStock) return;

    const response = await checkProductStock({
      product_id: id,
      quantity: 1,
    }).unwrap();
    const stock = response?.data;
    const quantity = Number(stock?.stock_quantity);

    if (
      response?.success !== true ||
      Number(stock?.product_id) !== id ||
      typeof stock?.available !== "boolean" ||
      !Number.isFinite(quantity)
    ) {
      throw new Error("Unable to verify live stock. Please try again.");
    }

    if (!stock.available || quantity < 1) {
      setStockUnavailable(true);
      throw new Error("This product is currently out of stock.");
    }
    setStockUnavailable(false);
  };

  const openProduct = () => {
    if (!product?.slug) return;
    router.push(`/product/${product.slug}/`);
  };

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [justAdded]);

  /* ---------------- ADD TO CART ---------------- */

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.id || !inStock || purchaseLockRef.current) return;

    purchaseLockRef.current = true;
    try {
      await verifyLiveStock();
      await addToCart({ product_id: Number(product.id), quantity: 1 }).unwrap();
      setJustAdded(true);
      dispatch(
        showToast({
          message: `${product.name} added to cart 🛒`,
          type: "success",
        }),
      );
    } catch (err: any) {
      dispatch(
        showToast({
          message:
            err?.data?.message || err?.message || "Failed to add item to cart",
          type: "error",
        }),
      );
    } finally {
      purchaseLockRef.current = false;
    }
  };

  /* ---------------- BUY NOW (stock verified, no cart mutation) ---------------- */

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.id || !inStock || purchaseLockRef.current) return;

    purchaseLockRef.current = true;
    setIsBuyingNow(true);
    try {
      await verifyLiveStock();
      const params = new URLSearchParams({
        checkout_type: "buy_now",
        product_id: String(product.id),
        quantity: "1",
      });
      router.push(`/checkout?${params.toString()}`);
    } catch (err: any) {
      dispatch(
        showToast({
          message:
            err?.data?.message || err?.message || "Unable to verify stock",
          type: "error",
        }),
      );
    } finally {
      purchaseLockRef.current = false;
      setIsBuyingNow(false);
    }
  };

  return (
    <motion.article
      className="group/card flex h-full w-full min-w-0 flex-col"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* =================== IMAGE =================== */}
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-2xl bg-[#f4f3ef] ring-1 ring-black/5 transition-shadow duration-500 group-hover/card:shadow-[0_18px_36px_-20px_rgba(0,0,0,0.45)]">
        <img
          src={currentImage || getPlaceholderImage()}
          alt={product?.name || "Product"}
          loading={index < 6 ? "eager" : "lazy"}
          decoding="async"
          onClick={openProduct}
          onError={(e) => {
            // placeholder bhi fail ho to infinite loop na bane
            if (e.currentTarget.dataset.fallback) return;
            e.currentTarget.dataset.fallback = "1";
            e.currentTarget.src = getPlaceholderImage();
          }}
          className={`absolute inset-0 h-full w-full cursor-pointer object-cover object-center transition-transform duration-700 ease-out group-hover/card:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100 ${
            inStock ? "" : "opacity-60 grayscale"
          }`}
        />

        {/* soft bottom fade so rating/dots stay readable */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/15 to-transparent" />

        {/* LABEL + DISCOUNT (top-left) */}
        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
          {label && (
            <span className="rounded-full bg-white/90 px-2 py-[3px] text-[10px] font-medium leading-none text-[#171717] shadow-sm backdrop-blur-sm sm:text-[11px]">
              {label}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-[#1a8a3f] px-2 py-[3px] text-[10px] font-semibold leading-none text-white shadow-sm sm:text-[11px]">
              {discount}% off
            </span>
          )}
        </div>

        {/* WISHLIST (top-right) */}
        <button
          type="button"
          aria-label={
            isWishlisted
              ? `Remove ${product?.name || "product"} from wishlist`
              : `Add ${product?.name || "product"} to wishlist`
          }
          aria-pressed={isWishlisted}
          onClick={(e) => handleToggleWishlist(product?.id, product?.name, e)}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#171717] shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] sm:h-9 sm:w-9"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[15px] w-[15px]"
            fill={isWishlisted ? "#e0455f" : "none"}
            stroke={isWishlisted ? "#e0455f" : "currentColor"}
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
            />
          </svg>
        </button>

        {/* RATING (bottom-left) */}
        {Number(rating) > 0 && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm">
            <span className="text-[11px] font-semibold leading-none text-[#111111]">
              {Number(rating).toFixed(1)}
            </span>
            <svg
              viewBox="0 0 24 24"
              className="h-[10px] w-[10px] text-[#1a8a3f]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2.5l2.9 6.34 6.95.63-5.24 4.66 1.56 6.87L12 17.3l-6.13 3.7 1.56-6.87-5.24-4.66 6.95-.63L12 2.5z" />
            </svg>
          </div>
        )}

        {/* IMAGE DOTS (bottom-right) – mobile par tap se image badlo */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center rounded-full bg-black/25 px-1 backdrop-blur-sm">
            {images.slice(0, 5).map((_: any, i: number) => (
              <button
                key={i}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={(e) => onDotClick?.(product?.id, i, e)}
                className="flex h-5 w-4 items-center justify-center"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    i === imageIndex
                      ? "h-1.5 w-3 bg-white"
                      : "h-1.5 w-1.5 bg-white/60"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* OUT OF STOCK overlay */}
        {!inStock && (
          <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-white/30">
            <span className="rounded-full bg-[#111111]/85 px-3 py-1.5 text-[11px] font-medium text-white">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* =================== INFO =================== */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* BRAND | CATEGORY */}
        <p
          onClick={openProduct}
          className="mt-3 min-h-[18px] cursor-pointer truncate text-[12.5px] leading-tight text-[#151515] sm:text-[13px]"
        >
          {brandName && <span className="font-semibold">{brandName}</span>}
          {brandName && categoryName && (
            <span className="text-gray-400"> | </span>
          )}
          {categoryName && (
            <span className="font-normal text-gray-600">{categoryName}</span>
          )}
        </p>

        {/* TITLE */}
        <p
          onClick={openProduct}
          title={fullTitle}
          className="mt-1 min-h-[32px] cursor-pointer text-[11.5px] leading-[16px] text-gray-500 line-clamp-2 sm:text-xs"
        >
          {fullTitle}
        </p>

        {/* PRICE — distributor BA Price + crossed-out MRP; customer unchanged */}
        {userType === "distributor" ? (
          <div className="mt-1 flex min-w-0 flex-wrap items-end justify-between gap-x-3 gap-y-1.5 rounded-xl border border-[#e4eee6] bg-[#f7fbf8] px-2.5 py-2 sm:px-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#29764b] sm:text-[11px]">
                BA Price
              </p>
              <p className="mt-0.5 text-[17px] font-bold leading-tight tracking-tight text-[#166534] sm:text-[19px]">
                {price > 0 ? `₹${price.toLocaleString("en-IN")}` : "View price"}
              </p>
            </div>
            {mrp > 0 && (
              <div className="min-w-0 pb-0.5 text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#737d79]">
                  MRP
                </p>
                <p className="text-[12px] font-medium leading-tight text-[#929b95] line-through decoration-[#929b95] decoration-[1.5px] sm:text-[13px]">
                  ₹{mrp.toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-[22px] flex-wrap items-baseline gap-x-2">
            <span className="text-[15px] font-bold tracking-tight text-[#111111] sm:text-base">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {mrp > price && (
              <span className="text-[11px] text-gray-400 line-through sm:text-xs">
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        )}

        {/* LOW STOCK hint */}
        <p className="mt-0.5 min-h-[14px] text-[11px] font-medium text-[#c2410c]">
          {lowStock ? `Only ${stockQty} left` : ""}
        </p>

        {/* ACTIONS */}
        {showCartButtons && (
          <div className="mt-auto flex items-center gap-1.5 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock || isAddingToCart || isBuyingNow}
              aria-label="Add to cart"
              title={inStock ? "Add to cart" : "Out of stock"}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] sm:h-10 sm:w-10 ${
                !inStock
                  ? "cursor-not-allowed border-[#eeeeee] bg-[#f7f7f7] text-[#cccccc]"
                  : justAdded
                    ? "border-[#1a8a3f] bg-[#eafaf0] text-[#1a8a3f]"
                    : "border-[#d9d9d9] bg-white text-[#111111] hover:border-[#111111]"
              }`}
            >
              {isAddingToCart ? (
                <Loader2 className="h-[15px] w-[15px] animate-spin" />
              ) : justAdded ? (
                <Check className="h-[15px] w-[15px]" />
              ) : (
                <ShoppingBag className="h-[15px] w-[15px]" />
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock || isBuyingNow || isAddingToCart}
              aria-label="Buy now"
              className={`flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-[11.5px] font-medium tracking-tight transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] sm:h-10 sm:text-xs ${
                !inStock
                  ? "cursor-not-allowed bg-[#f0f0f0] text-[#bbbbbb]"
                  : isBuyingNow
                    ? "cursor-wait bg-[#252525] text-white"
                    : "bg-[#111111] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              {isBuyingNow ? (
                <>
                  <Loader2 className="h-[13px] w-[13px] animate-spin" />
                  <span>Processing…</span>
                </>
              ) : inStock ? (
                "Buy now"
              ) : (
                "Out of stock"
              )}
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
