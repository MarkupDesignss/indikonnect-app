"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, Sparkles } from "lucide-react";
import { AnyObject, CARD, LABEL, SECTION_TITLE, formatCurrency } from "@/features/profile/screens/profile.parts/support";


/* ========================================================================= */
/* RECOMMENDED PRODUCTS                                                      */
/* ========================================================================= */

export function RecommendedProducts({
  products,
  isLoading,
  onProductClick,
}: {
  products: AnyObject[];
  isLoading: boolean;
  onProductClick: (slug: string) => void;
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={LABEL}>Handpicked For You</p>

          <h3
            className={`mt-1 flex items-center gap-2 ${SECTION_TITLE}`}
          >
            <span>Recommended For You</span>

            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F3ED]">
              <Sparkles className="h-3.5 w-3.5 text-[#34513C]" />
            </span>
          </h3>
        </div>

        <Link
          href="/products"
          className="
            group flex items-center gap-1.5
            rounded-full
            border border-black
            bg-black
            px-4 py-2
            text-[9px]
            font-bold
            text-white
            shadow-[0_8px_18px_-12px_rgba(0,0,0,0.75)]
            transition-all duration-200
            hover:border-[#262626]
            hover:bg-[#262626]
            hover:shadow-[0_10px_22px_-12px_rgba(0,0,0,0.55)]
            active:scale-[0.98]
          "
        >
          View All

          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="
                animate-pulse
                overflow-hidden
                rounded-[18px]
                border border-[#E8E8E3]
                bg-white
              "
            >
              <div className="h-[220px] bg-[#F0F1ED]" />

              <div className="space-y-3 p-4">
                <div className="h-2.5 w-20 rounded bg-[#E7E8E3]" />
                <div className="h-3.5 w-3/4 rounded bg-[#E7E8E3]" />
                <div className="h-3.5 w-20 rounded bg-[#E7E8E3]" />
                <div className="h-9 rounded-[10px] bg-[#E7E8E3]" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className={`${CARD} px-6 py-14 text-center`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#F3F4F0]">
            <Package className="h-7 w-7 text-[#B6B7B0]" />
          </div>

          <p className="mt-4 text-[11px] font-medium text-[#888981]">
            No recommendations available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 4).map(
            (product: AnyObject, index: number) => {
              const image =
                product?.primary_image_url ||
                product?.images?.[0]?.image_url ||
                "";

              const price = Number(
                product?.retail_price ??
                product?.price ??
                0,
              );

              const oldPrice = Number(
                product?.retail_mrp ??
                product?.distributor_mrp ??
                product?.mrp ??
                0,
              );

              // API rating comes from reviews_summary.average_rating.
              // Fallbacks support older product response formats.
              const rating = Number(
                product?.reviews_summary?.average_rating ??
                product?.rating ??
                0,
              );

              const reviewCount = Number(
                product?.reviews_summary?.total_reviews ??
                product?.reviews ??
                0,
              );

              // Show rating only when it is greater than zero.
              const hasRating = Number.isFinite(rating) && rating > 0;

              const safeRating = Math.min(5, Math.max(0, rating));
              const filledStars = Math.floor(safeRating);
              const emptyStars = 5 - filledStars;

              return (
                <motion.div
                  key={product?.id || index}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.06,
                  }}
                  onClick={() => {
                    if (product?.slug) {
                      onProductClick(product.slug);
                    }
                  }}
                  className="
                    group cursor-pointer
                    overflow-hidden
                    rounded-[18px]
                    border border-[#E7E7E2]
                    bg-white
                    shadow-[0_8px_30px_-20px_rgba(0,0,0,0.35)]
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-[#D4D5CF]
                    hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.38)]
                  "
                >
                  <div className="relative h-[220px] overflow-hidden bg-[#F5F6F2]">
                    {image ? (
                      <Image
                        src={image}
                        alt={product?.name || "Product"}
                        fill
                        className="rounded-2xl object-cover p-2 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-[#C0C2BA]" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/85 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#555750] shadow-sm backdrop-blur">
                      {product?.category?.name || "Product"}
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#9A9B94]">
                      {product?.category?.name || "Collection"}
                    </p>

                    <h4 className="mt-1 line-clamp-2 min-h-[34px] text-[13px] font-semibold leading-[1.35] text-[#181918]">
                      {product?.name || "Product"}
                    </h4>

                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-[16px] font-bold tracking-[-0.02em] text-[#111111]">
                        {formatCurrency(price)}
                      </p>

                      {oldPrice > price && (
                        <p className="text-[10px] font-medium text-[#A5A59F] line-through">
                          {formatCurrency(oldPrice)}
                        </p>
                      )}
                    </div>

                    {/* RATING: GREEN STARS, HIDDEN WHEN RATING IS 0 */}
                    {hasRating && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className="inline-flex items-center text-[13px] leading-none tracking-[1px]"
                          aria-label={`Rated ${safeRating} out of 5`}
                        >
                          {Array.from(
                            { length: filledStars },
                            (_, starIndex) => (
                              <span
                                key={`filled-${starIndex}`}
                                className="text-[#16A34A]"
                              >
                                ★
                              </span>
                            ),
                          )}

                          {Array.from(
                            { length: emptyStars },
                            (_, starIndex) => (
                              <span
                                key={`empty-${starIndex}`}
                                className="text-[#D1D5DB]"
                              >
                                ☆
                              </span>
                            ),
                          )}
                        </span>

                        {reviewCount > 0 && (
                          <span className="text-[9px] font-medium text-[#9B9C95]">
                            ({reviewCount})
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        if (product?.slug) {
                          onProductClick(product.slug);
                        }
                      }}
                      className="
                        mt-4 flex h-[42px]
                        w-full
                        items-center justify-center
                        gap-2
                        rounded-[10px]
                        border border-black
                        bg-black
                        text-[9px]
                        font-bold uppercase
                        tracking-[0.12em]
                        text-white
                        shadow-[0_10px_22px_-14px_rgba(0,0,0,0.9)]
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:border-[#262626]
                        hover:bg-[#262626]
                        hover:shadow-[0_14px_26px_-14px_rgba(0,0,0,0.75)]
                        active:scale-[0.98]
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-black
                        focus-visible:ring-offset-2
                      "
                    >
                      Shop Now
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              );
            },
          )}
        </div>
      )}
    </motion.section>
  );
}
