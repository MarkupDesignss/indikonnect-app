"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { PLACEHOLDER, generateSlugFromName } from "@/features/products/components/productDetail.parts/support";
import type { ProductDetailViewModel } from './useProductDetail';

type Props = Pick<ProductDetailViewModel, 
  "buildProductPath"
  | "setShowRelatedSheet"
  | "toggleWishlist"
  | "wishlistState"
  | "isDistributorApp"
  | "userAccountType"
  | "relatedBusyId"
  | "addRelatedToCart"
> & { item: ProductDetailViewModel['similarProducts'][number]; index: number };
export default function RelatedProductCard({
  item,
  index,
  buildProductPath,
  setShowRelatedSheet,
  toggleWishlist,
  wishlistState,
  isDistributorApp,
  userAccountType,
  relatedBusyId,
  addRelatedToCart,
}: Props) {
    const url = buildProductPath(
      item.slug || generateSlugFromName(item.name) || String(item.id),
    );

    const discounted = item.originalPrice > item.price && item.price > 0;

    const discountPercent = discounted
      ? Math.round((1 - item.price / item.originalPrice) * 100)
      : 0;

    const lowStock =
      !item.allowedWithoutStock &&
      item.inStock &&
      item.stockQuantity > 0 &&
      item.stockQuantity <= (item.lowStockThreshold || 10);

    // A zero/missing rating must not display a rating row.
    const hasRating =
      Number.isFinite(Number(item.rating)) && Number(item.rating) > 0;

    return (
      <motion.article
        key={item.id}
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.22,
          delay: Math.min(index, 8) * 0.03,
        }}
        className="group/related flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e9e9e9] bg-white transition-all hover:border-[#d5d5d5] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
      >
        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden bg-[#faf9f7]">
          <Link
            href={url}
            onClick={() => setShowRelatedSheet(false)}
            className="block h-full w-full"
          >
            <Image
              src={item.image || PLACEHOLDER}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 45vw, 260px"
              className="object-cover transition-transform duration-300 group-hover/related:scale-[1.025]"
            />
          </Link>

          {item.badge && (
            <span className="absolute left-2 top-2 max-w-[65%] truncate rounded bg-white/95 px-2 py-1 text-[9px] font-semibold text-[#222] shadow-sm">
              {item.badge}
            </span>
          )}

          {/* WISHLIST */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(Number(item.id));
            }}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-105"
            aria-label={
              wishlistState[Number(item.id)]
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            <Heart
              className={`h-4 w-4 ${
                wishlistState[Number(item.id)]
                  ? "fill-red-500 text-red-500"
                  : "text-[#222]"
              }`}
            />
          </button>

          {!item.inStock && (
            <span className="absolute bottom-2 left-2 rounded bg-[#222]/90 px-2 py-1 text-[9px] text-white">
              Out of stock
            </span>
          )}
        </div>

        {/* PRODUCT CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col px-2.5 pb-3 pt-2.5 sm:px-3">
          {/* RATING - GREEN */}
          {hasRating && (
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded bg-[#f4f4f4] px-1.5 py-0.5 text-[10px]">
                <span className="font-semibold text-[#333]">
                  {Number(item.rating).toFixed(1)}
                </span>

                <Star className="h-3 w-3 fill-[#188447] text-[#188447]" />

                {item.reviews > 0 && (
                  <>
                    <span className="text-[#bbb]">|</span>

                    <span className="text-[#777]">{item.reviews}</span>
                  </>
                )}
              </span>
            </div>
          )}

          <Link
            href={url}
            onClick={() => setShowRelatedSheet(false)}
            className="block min-w-0"
          >
            <p className="truncate text-[11px] text-[#464d5a]">
              <span className="font-semibold text-[#171717]">
                {item.brand || item.name}
              </span>

              {item.category ? ` | ${item.category}` : ""}
            </p>

            <p
              className="mt-0.5 truncate text-[10px] text-[#748095]"
              title={item.name}
            >
              {item.name}
            </p>
          </Link>

          {/* PRICE */}
          {isDistributorApp && userAccountType === "distributor" ? (
            <div className="mt-3 rounded-xl border border-[#E4E9E6] bg-gradient-to-br from-[#F6FBF8] to-white p-3">
              <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-wide text-[#49745A]">
                    BA Price
                  </p>
                  <p className="mt-1 text-[19px] font-bold leading-none tracking-tight text-[#146C43]">
                    ₹
                    {Number(item.price || 0).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                {item.originalPrice > 0 && (
                  <div className="min-w-0 text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#78828A]">
                      Retail Price
                    </p>
                    <p className="mt-1 text-[14px] font-medium leading-none text-[#89939B] line-through decoration-[#89939B] decoration-[1.5px]">
                      ₹
                      {Number(item.originalPrice).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="text-[13px] font-bold text-[#161616]">
                ₹{Number(item.price || 0).toLocaleString("en-IN")}
              </span>

              {discounted && (
                <span className="text-[10px] text-[#939393] line-through">
                  ₹{Number(item.originalPrice).toLocaleString("en-IN")}
                </span>
              )}

              {discountPercent > 0 && (
                <span className="text-[10px] font-semibold text-[#16803c]">
                  {discountPercent}% off
                </span>
              )}
            </div>
          )}
          {/* DISTRIBUTOR-ONLY COMMISSION (category API) */}
          {isDistributorApp &&
            userAccountType === "distributor" &&
            item.commissionValue !== null && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2">
                <span className="text-[10px] font-semibold text-emerald-900">
                  Commission Value
                </span>
                <span className="whitespace-nowrap text-[12px] font-bold text-emerald-800">
                  {item.commissionValue.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  pts
                  <span className="ml-1 text-[9px] font-medium">/unit</span>
                </span>
              </div>
            )}

          {/* STOCK */}
          {lowStock && (
            <p className="mt-1 text-[9px] font-medium text-[#d23c52]">
              Only {item.stockQuantity} left in stock!
            </p>
          )}

          {!lowStock && item.peopleBought > 0 && (
            <p className="mt-1 truncate text-[9px] text-[#444]">
              {item.peopleBought} people bought this week
            </p>
          )}

          {/* ACTIONS */}
          <div className="mt-auto grid grid-cols-2 gap-1.5 pt-2.5">
            <button
              type="button"
              disabled={!item.inStock || relatedBusyId !== null}
              onClick={() => addRelatedToCart(item, true)}
              className="min-h-9 rounded-lg bg-[#171717] px-1 text-[10px] font-semibold text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {relatedBusyId === String(item.id) ? "Please wait..." : "Buy Now"}
            </button>

            <button
              type="button"
              disabled={!item.inStock || relatedBusyId !== null}
              onClick={() => addRelatedToCart(item, false)}
              className="flex min-h-9 items-center justify-center gap-1 rounded-lg border border-[#dedbd4] px-1 text-[10px] font-semibold text-[#222] transition hover:border-[#111] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="h-3 w-3 shrink-0" />
              Add to Cart
            </button>
          </div>
        </div>
      </motion.article>
    );
  }
