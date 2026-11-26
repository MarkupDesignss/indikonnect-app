"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronRight, X, ChevronLeft } from "lucide-react";
import { PLACEHOLDER } from "@/features/products/components/productDetail.parts/support";
import type { ProductDetailViewModel } from './useProductDetail';


export default function ProductFullscreen({
  isFullscreen,
  gallery,
  closeFullscreen,
  fullscreenImageIndex,
  product,
  prevFullscreenImage,
  nextFullscreenImage,
  setFullscreenImageIndex,
}: Pick<ProductDetailViewModel, 
  "isFullscreen"
  | "gallery"
  | "closeFullscreen"
  | "fullscreenImageIndex"
  | "product"
  | "prevFullscreenImage"
  | "nextFullscreenImage"
  | "setFullscreenImageIndex"
>) {
  return (
<AnimatePresence>
        {isFullscreen && gallery.length > 0 && (
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
            onClick={closeFullscreen}
          >
            <button
              type="button"
              onClick={closeFullscreen}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute left-1/2 top-4 -translate-x-1/2 text-xs text-white/60">
              {fullscreenImageIndex + 1} / {gallery.length}
            </div>

            <div
              className="relative h-[80vh] w-[90vw] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={gallery[fullscreenImageIndex] || product.image}
                alt={product.name}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevFullscreenImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  onClick={nextFullscreenImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 flex max-w-[85vw] -translate-x-1/2 gap-1.5 overflow-x-auto">
              {gallery.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImageIndex(index);
                  }}
                  className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border-2 ${
                    fullscreenImageIndex === index
                      ? "border-white"
                      : "border-transparent opacity-50"
                  }`}
                  aria-label={`Open image ${index + 1}`}
                >
                  <Image
                    src={img || PLACEHOLDER}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
