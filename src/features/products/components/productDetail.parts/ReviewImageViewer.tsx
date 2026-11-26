"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronRight, X, ChevronLeft } from "lucide-react";
import type { ProductDetailViewModel } from './useProductDetail';


export default function ReviewImageViewer({
  isReviewViewerOpen,
  reviewViewerImages,
  closeReviewViewer,
  reviewViewerIndex,
  prevReviewViewerImage,
  nextReviewViewerImage,
  setReviewViewerIndex,
}: Pick<ProductDetailViewModel, 
  "isReviewViewerOpen"
  | "reviewViewerImages"
  | "closeReviewViewer"
  | "reviewViewerIndex"
  | "prevReviewViewerImage"
  | "nextReviewViewerImage"
  | "setReviewViewerIndex"
>) {
  return (
<AnimatePresence>
        {isReviewViewerOpen && reviewViewerImages.length > 0 && (
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
            className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/95 px-4"
            onClick={closeReviewViewer}
          >
            <button
              type="button"
              onClick={closeReviewViewer}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close review image viewer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur">
              {reviewViewerIndex + 1} / {reviewViewerImages.length}
            </div>

            <div
              className="relative h-[78vh] w-[90vw] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={reviewViewerImages[reviewViewerIndex]}
                alt="Review image"
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>

            {reviewViewerImages.length > 1 && (
              <button
                type="button"
                onClick={prevReviewViewerImage}
                className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
                aria-label="Previous review image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {reviewViewerImages.length > 1 && (
              <button
                type="button"
                onClick={nextReviewViewerImage}
                className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
                aria-label="Next review image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {reviewViewerImages.length > 1 && (
              <div
                className="absolute bottom-4 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-[10px] bg-black/20 p-2 backdrop-blur"
                onClick={(e) => e.stopPropagation()}
              >
                {reviewViewerImages.map((img, index) => (
                  <button
                    type="button"
                    key={`${img}-${index}`}
                    onClick={() => setReviewViewerIndex(index)}
                    className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border-2 transition ${
                      reviewViewerIndex === index
                        ? "border-white"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                    aria-label={`Open review image ${index + 1}`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
  );
}
