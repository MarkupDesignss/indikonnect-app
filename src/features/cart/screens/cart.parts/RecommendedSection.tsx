"use client";

import { type MouseEvent as ReactMouseEvent, type RefObject } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, ShoppingBag, Sparkles } from "lucide-react";
import { PLACEHOLDER_IMAGE, formatPrice, getRecommendedImage, isPurchaseWithoutStockAllowed, parsePrice } from "@/features/cart/screens/cart.parts/support";


// ─────────────────────────────────────────────────────────────────────────────
// Recommended section
// ─────────────────────────────────────────────────────────────────────────────

export function RecommendedSection({
  recommended,
  addingProductId,
  handleRecommendedAddToCart,
  scrollRecommended,
  recommendedScrollRef,
}: {
  recommended: any[];
  addingProductId: number | string | null;
  handleRecommendedAddToCart: (
    product: any,
    event?: ReactMouseEvent<HTMLButtonElement>,
  ) => void;
  scrollRecommended: (direction: "left" | "right") => void;
  recommendedScrollRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="rounded-xl border border-[#E6E6E4] bg-white p-4 sm:p-[18px]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#333]" />

            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#999]">
              Curated for you
            </span>
          </div>

          <h2 className="text-[15px] font-semibold text-[#171717]">
            You might also like
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="hidden text-[9px] font-medium uppercase tracking-wide text-[#777] underline underline-offset-4 hover:text-black sm:block"
          >
            View all
          </Link>

          {recommended.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollRecommended("left")}
                aria-label="Scroll left"
                className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-[#D8D8D6] bg-white text-[#333] hover:bg-[#F3F3F2]"
              >
                <ArrowLeft className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={() => scrollRecommended("right")}
                aria-label="Scroll right"
                className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-black text-white hover:bg-[#333]"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={recommendedScrollRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {recommended.map((product: any) => {
          const isAdding = addingProductId === product.id;
          const explicitlyOutOfStock =
            !isPurchaseWithoutStockAllowed(product?.allowed_purchsed) &&
            (product?.in_stock === false ||
              product?.is_in_stock === false ||
              ["out_of_stock", "sold_out", "inactive", "disabled"].includes(
                String(product?.stock_status ?? "").toLowerCase(),
              ) ||
              (product?.stock_quantity != null && Number(product.stock_quantity) <= 0));

          return (
            <div
              key={product.id}
              className="group w-[128px] shrink-0 snap-start sm:w-[140px] md:w-[150px]"
            >
              <Link href={`/product/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden rounded-[5px] border border-[#E5E5E3] bg-[#F1F1F0] transition group-hover:border-black">
                  <img
                    src={getRecommendedImage(product)}
                    alt={product.name || "Recommended product"}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(event) => {
                      const image = event.currentTarget;

                      if (!image.src.endsWith(PLACEHOLDER_IMAGE)) {
                        image.src = PLACEHOLDER_IMAGE;
                      }
                    }}
                  />
                </div>
              </Link>

              <div className="pt-2">
                <p className="truncate text-[10px] font-medium text-[#222]">
                  {product.name}
                </p>

                <p className="mt-0.5 text-[12px] font-semibold text-[#111]">
                  {formatPrice(parsePrice(product.retail_price))}
                </p>

                <button
                  type="button"
                  onClick={(event) =>
                    handleRecommendedAddToCart(product, event)
                  }
                  disabled={isAdding || explicitlyOutOfStock}
                  className="mt-1.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-[5px] bg-black text-[9px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#333] disabled:opacity-50"
                >
                  {isAdding ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-3 w-3" />
                  )}

                  {isAdding ? "Adding..." : explicitlyOutOfStock ? "Out of stock" : "Add"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
