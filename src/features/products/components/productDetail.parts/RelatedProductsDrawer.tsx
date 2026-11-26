"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { poppins } from './font';
import type { ProductDetailViewModel } from './useProductDetail';

import RelatedProductCard from './RelatedProductCard';

export default function RelatedProductsDrawer({
  showRelatedSheet,
  setShowRelatedSheet,
  sortedSimilarProducts,
  relatedSortOption,
  setRelatedSortOption,
  buildProductPath,
  toggleWishlist,
  wishlistState,
  isDistributorApp,
  userAccountType,
  relatedBusyId,
  addRelatedToCart,
}: Pick<ProductDetailViewModel, 
  "showRelatedSheet"
  | "setShowRelatedSheet"
  | "sortedSimilarProducts"
  | "relatedSortOption"
  | "setRelatedSortOption"
  | "buildProductPath"
  | "toggleWishlist"
  | "wishlistState"
  | "isDistributorApp"
  | "userAccountType"
  | "relatedBusyId"
  | "addRelatedToCart"
>) {
  return (
<AnimatePresence>
        {showRelatedSheet && (
          <motion.div
            className="fixed inset-0 z-[9998]"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <div
              className="absolute inset-0 bg-black/45"
              onClick={() => setShowRelatedSheet(false)}
              aria-hidden="true"
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Similar products"
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                type: "spring",
                stiffness: 270,
                damping: 30,
              }}
              className={`${poppins.className} absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-white shadow-[-15px_0_45px_rgba(0,0,0,0.14)] sm:w-[min(560px,95vw)]`}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[#eee] px-5 py-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#888]">
                    You may also like
                  </p>

                  <h2 className="mt-1 text-[19px] font-semibold text-[#161616]">
                    Similar Products{" "}
                    <span className="text-sm font-normal text-[#888]">
                      ({sortedSimilarProducts.length})
                    </span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRelatedSheet(false)}
                  aria-label="Close similar products"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e9e9e9] hover:bg-[#f5f5f5]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6 pt-4 sm:px-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#888]">
                    {sortedSimilarProducts.length} products
                  </span>

                  <select
                    aria-label="Sort similar products"
                    value={relatedSortOption}
                    onChange={(e) =>
                      setRelatedSortOption(
                        e.target.value as typeof relatedSortOption,
                      )
                    }
                    className="max-w-[185px] rounded-lg border border-[#e5e5e5] bg-white px-2 py-2 text-[11px] text-[#333] outline-none focus:border-[#222]"
                  >
                    <option value="recommended">Recommended</option>

                    <option value="price_asc">Price: Low to High</option>

                    <option value="price_desc">Price: High to Low</option>

                    <option value="newest">Newest</option>
                  </select>
                </div>

                {sortedSimilarProducts.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[#777]">
                    No similar products available.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 items-stretch gap-2.5 sm:gap-3">
                    {sortedSimilarProducts.map((item, index) =>
                      <RelatedProductCard key={item.id} item={item} index={index} buildProductPath={buildProductPath} setShowRelatedSheet={setShowRelatedSheet} toggleWishlist={toggleWishlist} wishlistState={wishlistState} isDistributorApp={isDistributorApp} userAccountType={userAccountType} relatedBusyId={relatedBusyId} addRelatedToCart={addRelatedToCart} />,
                    )}
                  </div>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
