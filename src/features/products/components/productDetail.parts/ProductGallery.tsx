"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Layers } from "lucide-react";
import { Heart, CheckCircle, Gift } from "lucide-react";
import { PLACEHOLDER, prefersReduced } from "@/features/products/components/productDetail.parts/support";
import type { ProductDetailViewModel } from './useProductDetail';


export default function ProductGallery({
  gallery,
  MAX_VISIBLE_THUMBS,
  setShowAllThumbnails,
  setActiveImage,
  activeImage,
  product,
  mainImageBoxRef,
  openFullscreen,
  selectedVariantId,
  isCombo,
  comboItems,
  handleWishlistToggle,
  isWishlistLoading,
  isWishlisted,
  setShowRelatedSheet,
}: Pick<ProductDetailViewModel, 
  "gallery"
  | "MAX_VISIBLE_THUMBS"
  | "setShowAllThumbnails"
  | "setActiveImage"
  | "activeImage"
  | "product"
  | "mainImageBoxRef"
  | "openFullscreen"
  | "selectedVariantId"
  | "isCombo"
  | "comboItems"
  | "handleWishlistToggle"
  | "isWishlistLoading"
  | "isWishlisted"
  | "setShowRelatedSheet"
>) {
const [isZoomed, setIsZoomed] = useState(false);

const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = Math.min(
      100,
      Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
    );

    const y = Math.min(
      100,
      Math.max(0, ((e.clientY - rect.top) / rect.height) * 100),
    );

    setZoomPosition({ x, y });
  };

  return (
<div className="flex flex-col gap-2.5 lg:flex-row">
            {/* THUMBNAILS */}
            <div className="order-last flex w-full flex-row gap-2 overflow-x-auto pb-1 lg:order-first lg:w-[62px] lg:flex-shrink-0 lg:flex-col lg:gap-2 lg:overflow-visible lg:pb-0 xl:w-[76px]">
              {gallery.slice(0, MAX_VISIBLE_THUMBS).map((img, index) => {
                const isLastVisible = index === MAX_VISIBLE_THUMBS - 1;

                const hasMore = gallery.length > MAX_VISIBLE_THUMBS;

                return (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() =>
                      isLastVisible && hasMore
                        ? setShowAllThumbnails(true)
                        : setActiveImage(index)
                    }
                    onMouseEnter={() => {
                      if (!(isLastVisible && hasMore)) {
                        setActiveImage(index);
                      }
                    }}
                    className={`relative h-[62px] w-[62px] flex-shrink-0 overflow-hidden rounded-[7px] border-2 bg-white transition sm:h-[70px] sm:w-[70px] lg:h-[74px] lg:w-[74px] ${
                      activeImage === index
                        ? "border-[#111]"
                        : "border-[#E4E4E4] hover:border-[#999]"
                    }`}
                  >
                    <Image
                      src={img || PLACEHOLDER}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="74px"
                      className="object-cover transition duration-300 hover:scale-105"
                    />

                    {activeImage === index && !(isLastVisible && hasMore) && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                          <CheckCircle className="h-3.5 w-3.5 text-[#111]" />
                        </span>
                      </span>
                    )}

                    {isLastVisible && hasMore && (
                      <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-[1px]">
                        <span className="text-[15px] font-bold leading-none">
                          +{gallery.length - MAX_VISIBLE_THUMBS}
                        </span>

                        <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-wide">
                          More
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* MAIN IMAGE */}
            <div className="min-w-0 flex-1">
              <div
                ref={mainImageBoxRef}
                className="group relative h-[400px] w-full cursor-crosshair overflow-visible rounded-[8px] bg-[#EEEEEE] sm:h-[460px] lg:h-[500px] xl:h-[540px]"
                onClick={() => openFullscreen(activeImage)}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <div className="absolute inset-0 overflow-hidden rounded-[8px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedVariantId}-${gallery[activeImage]}`}
                      initial={{
                        opacity: 0.25,
                        scale: 1.01,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.28,
                      }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={
                          gallery[activeImage] || product.image || PLACEHOLDER
                        }
                        alt={product.name}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {isZoomed && (
                    <div
                      className="pointer-events-none absolute h-[100px] w-[100px] rounded-lg border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.18)]"
                      style={{
                        left: `${zoomPosition.x}%`,
                        top: `${zoomPosition.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}

                  {product.discount && product.discount > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#111] px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white">
                      {product.discount}% OFF
                    </span>
                  )}

                  {/* COMBO BADGE */}
                  {isCombo && (
                    <span
                      className={`absolute left-3 ${
                        product.discount && product.discount > 0
                          ? "top-11"
                          : "top-3"
                      } inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#111] shadow-sm`}
                    >
                      <Gift className="h-3 w-3" />
                      Combo · {comboItems.length} items
                    </span>
                  )}

                  {/* WISHLIST */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(e);
                    }}
                    disabled={isWishlistLoading}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur"
                    aria-label={
                      isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isWishlisted ? "fill-[#111] text-[#111]" : "text-[#111]"
                      }`}
                    />
                  </button>

                  {/* VIEW SIMILAR */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRelatedSheet(true);
                    }}
                    aria-label="View similar products"
                    className="group absolute bottom-3 right-3 z-10 flex h-11 items-center overflow-hidden rounded-full bg-white/95 pl-3 pr-3 shadow-md backdrop-blur transition-all duration-300 ease-out hover:pl-4 hover:pr-5 hover:shadow-lg sm:h-12"
                  >
                    <Layers
                      className="h-[22px] w-[22px] flex-shrink-0 text-[#111] sm:h-[24px] sm:w-[24px]"
                      strokeWidth={1.8}
                    />

                    <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-black opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-[140px] group-hover:opacity-100 sm:text-[12px]">
                      View Similar
                    </span>
                  </button>
                </div>

                {/* ZOOM */}
                <AnimatePresence>
                  {isZoomed && !prefersReduced() && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: 12,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: 12,
                      }}
                      transition={{
                        duration: 0.18,
                      }}
                      className="pointer-events-none absolute left-[calc(100%+14px)] top-0 z-[60] hidden h-[330px] w-[330px] overflow-hidden rounded-[10px] border border-[#E1E1E1] bg-white shadow-[0_15px_45px_rgba(0,0,0,0.16)] lg:block xl:h-[380px] xl:w-[380px]"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-no-repeat"
                        style={{
                          backgroundImage: `url(${
                            gallery[activeImage] || product.image || PLACEHOLDER
                          })`,
                          backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          backgroundSize: "250%",
                        }}
                      />

                      <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#555] shadow-sm">
                        Zoom Preview
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
  );
}
