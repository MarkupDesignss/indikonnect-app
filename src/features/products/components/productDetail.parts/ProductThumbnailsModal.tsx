"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CheckCircle, X } from "lucide-react";
import { PLACEHOLDER } from "@/features/products/components/productDetail.parts/support";
import type { ProductDetailViewModel } from './useProductDetail';


export default function ProductThumbnailsModal({
  showAllThumbnails,
  setShowAllThumbnails,
  gallery,
  setActiveImage,
  activeImage,
  product,
}: Pick<ProductDetailViewModel, 
  "showAllThumbnails"
  | "setShowAllThumbnails"
  | "gallery"
  | "setActiveImage"
  | "activeImage"
  | "product"
>) {
  return (
<AnimatePresence>
        {showAllThumbnails && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 px-4"
            onClick={() => setShowAllThumbnails(false)}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              transition={{
                duration: 0.2,
              }}
              className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[14px] bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E8E8E8] px-5 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#999]">
                    Product Gallery
                  </p>

                  <h3 className="mt-1 text-[18px] font-semibold text-[#111]">
                    All Images ({gallery.length})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllThumbnails(false)}
                  className="rounded-full p-2 text-[#777] transition hover:bg-[#F3F3F3] hover:text-[#111]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-5">
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {gallery.map((img, index) => (
                    <button
                      key={`all-${img}-${index}`}
                      type="button"
                      onClick={() => {
                        setActiveImage(index);
                        setShowAllThumbnails(false);
                      }}
                      className={`relative aspect-square overflow-hidden rounded-[8px] border-2 bg-[#F3F3F3] transition ${
                        activeImage === index
                          ? "border-[#111]"
                          : "border-transparent hover:border-[#999]"
                      }`}
                    >
                      <Image
                        src={img || PLACEHOLDER}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />

                      {activeImage === index && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                            <CheckCircle className="h-4 w-4 text-[#111]" />
                          </span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
