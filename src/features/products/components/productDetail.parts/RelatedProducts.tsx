"use client";
import { ArrowRight } from "lucide-react";
import { poppins } from './font';
import type { ProductDetailViewModel } from './useProductDetail';

import RelatedProductCard from './RelatedProductCard';

export default function RelatedProducts({
  similarProducts,
  router,
  relatedSortOption,
  setRelatedSortOption,
  visibleSimilarProducts,
  buildProductPath,
  setShowRelatedSheet,
  toggleWishlist,
  wishlistState,
  isDistributorApp,
  userAccountType,
  relatedBusyId,
  addRelatedToCart,
}: Pick<ProductDetailViewModel, 
  "similarProducts"
  | "router"
  | "relatedSortOption"
  | "setRelatedSortOption"
  | "visibleSimilarProducts"
  | "buildProductPath"
  | "setShowRelatedSheet"
  | "toggleWishlist"
  | "wishlistState"
  | "isDistributorApp"
  | "userAccountType"
  | "relatedBusyId"
  | "addRelatedToCart"
>) {
  return (
similarProducts.length > 0 && (
          <section className="mt-7 rounded-[8px] bg-white p-5 sm:p-6 lg:p-7">
            <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#666]">
              <span className="font-semibold text-[#111]">
                {similarProducts.length} items
              </span>

              <span className="text-[#CFCFCF]">|</span>

              <span>Elegant picks curated for every occasion</span>
            </div>

            {/* PROMO BANNER */}
            <div className="relative mb-5 flex h-[110px] w-full items-center justify-between overflow-hidden rounded-[10px] bg-gradient-to-r from-[#EFE7DA] via-[#E9DFCF] to-[#3A332C] px-6 sm:h-[130px] sm:px-10">
              <div>
                <p
                  className={`${poppins.className} text-xl text-[#171717] sm:text-2xl`}
                >
                  IndieKonnect
                </p>

                <p className="mt-0.5 text-[11px] font-medium tracking-wide text-[#5A5245] sm:text-[12px]">
                  Discover pieces made for every occasion
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/products/")}
                className="hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-bold text-[#111] shadow-sm transition hover:shadow-md sm:inline-flex"
              >
                Shop Now
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* SORT */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#EEE] pb-4">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="related-sort"
                  className="text-[11px] font-medium text-[#777]"
                >
                  Sort by:
                </label>

                <select
                  id="related-sort"
                  value={relatedSortOption}
                  onChange={(e) =>
                    setRelatedSortOption(
                      e.target.value as typeof relatedSortOption,
                    )
                  }
                  className="rounded-[6px] border border-[#D8D8D8] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#111] outline-none focus:border-[#111]"
                >
                  <option value="recommended">Recommended</option>

                  <option value="price_asc">Price: Low to High</option>

                  <option value="price_desc">Price: High to Low</option>

                  <option value="newest">Newest</option>
                </select>
              </div>

              <p className="text-[11px] text-[#888]">
                Showing 1-
                {visibleSimilarProducts.length} of {similarProducts.length}{" "}
                Products
              </p>
            </div>

            <div className="mb-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#999]">
                You may also like
              </p>

              <h2
                className={`${poppins.className} mt-1 text-2xl text-[#171717]`}
              >
                Related pieces
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleSimilarProducts.map((item, index) =>
                <RelatedProductCard key={item.id} item={item} index={index} buildProductPath={buildProductPath} setShowRelatedSheet={setShowRelatedSheet} toggleWishlist={toggleWishlist} wishlistState={wishlistState} isDistributorApp={isDistributorApp} userAccountType={userAccountType} relatedBusyId={relatedBusyId} addRelatedToCart={addRelatedToCart} />,
              )}
            </div>
          </section>
        )
  );
}
