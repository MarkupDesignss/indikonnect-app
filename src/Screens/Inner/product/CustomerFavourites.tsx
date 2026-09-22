"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetProductSectionsQuery } from "@/lib/redux/api/Home/contentApi";

type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  original_price: string;
  current_price: string;
  discounted_price: number | null;
  discount_percentage: string | number;
  has_discount: boolean;
  stock_status: string;
  is_best_seller: boolean;
  is_best_offer?: boolean;
  primary_image_url: string;

  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;

  subcategory?: {
    id: number;
    name: string;
    slug: string;
  } | null;

  reviews_summary?: {
    average_rating: number;
    total_reviews: number;
  };
};

type SectionKey =
  | "best_sellers"
  | "best_offers";

type ProductSectionSliderProps = {
  section: SectionKey;
  title?: string;
};


export default function ProductSectionSlider({
  section,
  title,
}: ProductSectionSliderProps) {
  const router = useRouter();

  const scrollRef =
    useRef<HTMLDivElement>(null);

  const [atStart, setAtStart] =
    useState(true);

  const [atEnd, setAtEnd] =
    useState(false);

  const {
    data,
    isLoading,
    isError,
  } = useGetProductSectionsQuery();

  const sectionData =
    data?.data?.[section];

  const products: ApiProduct[] =
    sectionData?.products ?? [];

  const defaultTitle =
    section === "best_sellers"
      ? "Customer Favourites"
      : "Recommended For You";

  const sectionTitle =
    title || defaultTitle;

  const isRecommended =
    section === "best_offers";

  /* =====================================================
     PRODUCT DETAIL NAVIGATION
  ===================================================== */

  const handleProductClick = (slug: string) => {
    if (!slug) return;
  
    router.push(`/product/${slug}`);
  };

  /* =====================================================
     SCROLL STATE
  ===================================================== */

  const updateScrollState = () => {
    const el =
      scrollRef.current;

    if (!el) return;

    setAtStart(
      el.scrollLeft <= 4,
    );

    setAtEnd(
      el.scrollLeft +
        el.clientWidth >=
        el.scrollWidth - 4,
    );
  };

  /* =====================================================
     SCROLL LEFT
  ===================================================== */

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -420,
      behavior: "smooth",
    });
  };

  /* =====================================================
     SCROLL RIGHT
  ===================================================== */

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 420,
      behavior: "smooth",
    });
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (isLoading) {
    return (
      <section className="w-full py-2">
        <div
          className={`relative overflow-hidden rounded-[14px] px-4 py-3 sm:px-5 ${
            isRecommended
              ? "bg-gradient-to-br from-[#D9DEFF] via-[#E8EFFF] to-[#E7FAF7]"
              : "bg-gradient-to-br from-[#FDE8E8] to-[#FCEFEF]"
          }`}
        >
          {/* Skeleton Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="h-[20px] w-[150px] animate-pulse rounded bg-white/60" />

            <div className="flex items-center gap-[6px]">
              <div className="h-[34px] w-[34px] animate-pulse rounded-full bg-white/60" />

              <div className="h-[34px] w-[34px] animate-pulse rounded-full bg-white/60" />
            </div>
          </div>

          {/* Skeleton Cards */}
          <div className="flex gap-[14px] overflow-hidden">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[265px] w-[182px] flex-none animate-pulse rounded-[12px] bg-white/70 sm:w-[186px]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* =====================================================
     ERROR / EMPTY
  ===================================================== */

  if (
    isError ||
    products.length === 0
  ) {
    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="w-full py-2">
      <div
        className={`relative overflow-hidden rounded-[14px] px-4 py-3 sm:px-5 ${
          isRecommended
            ? "bg-gradient-to-br from-[#D9DEFF] via-[#E8EFFF] to-[#E7FAF7]"
            : "bg-gradient-to-br from-[#FDE8E8] to-[#FCEFEF]"
        }`}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold leading-[21px] tracking-[-0.2px] text-[#232323] sm:text-[15px]">
            {sectionTitle}
          </h2>

          <div className="flex items-center gap-[6px]">
            {/* Previous */}
            <button
              type="button"
              onClick={scrollLeft}
              disabled={atStart}
              aria-label={`Previous ${sectionTitle}`}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <ChevronLeft
                size={18}
                strokeWidth={2}
                className="text-[#3A3A3A]"
              />
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={scrollRight}
              disabled={atEnd}
              aria-label={`Next ${sectionTitle}`}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#232323] shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <ChevronRight
                size={18}
                strokeWidth={2}
                className="text-white"
              />
            </button>
          </div>
        </div>

        {/* Left Fade */}
        <div
          className={`pointer-events-none absolute left-0 top-[60px] bottom-3 z-10 w-6 bg-gradient-to-r to-transparent sm:left-1 ${
            isRecommended
              ? "from-[#D9DEFF]"
              : "from-[#FDE8E8]"
          }`}
        />

        {/* Right Fade */}
        <div
          className={`pointer-events-none absolute right-0 top-[60px] bottom-3 z-10 w-7 bg-gradient-to-l to-transparent sm:right-1 ${
            isRecommended
              ? "from-[#E7FAF7]"
              : "from-[#FCEFEF]"
          }`}
        />

        {/* Product Slider */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-[14px] overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-none"
        >
          {products.map(
            (product, index) => {
              const brand =
                product.category?.name ??
                product.subcategory?.name ??
                "";

              const rating =
                product
                  .reviews_summary
                  ?.average_rating;

              const reviews =
                product
                  .reviews_summary
                  ?.total_reviews;

              const price = Number(
                product.discounted_price ??
                  product.current_price,
              );

              const mrp = Number(
                product.original_price,
              );

              const discount =
                Number(
                  product.discount_percentage,
                );

              const recommendedCardColors =
                [
                  "bg-white",
                  "bg-[#FCFBFF]",
                  "bg-[#F9FCFF]",
                  "bg-[#FFFCF8]",
                  "bg-[#FAFAFF]",
                ];

              const cardColor =
                isRecommended
                  ? recommendedCardColors[
                      index %
                        recommendedCardColors.length
                    ]
                  : "bg-white";

              return (
                <article
                  key={product.id}
                  className={`group flex-none w-[182px] overflow-hidden rounded-[12px] pb-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.07)] sm:w-[186px] ${cardColor}`}
                >
                  {/* =================================================
                     IMAGE
                  ================================================== */}

                  <button
                    type="button"
                    onClick={() =>
                      handleProductClick(
                        product.slug,
                      )
                    }
                    aria-label={`View ${product.name}`}
                    className="group/image relative block w-full cursor-pointer border-0 bg-transparent p-0 text-left outline-none"
                  >
                    <div className="relative px-[11px] pt-[11px]">
                      <div className="relative h-[150px] w-full overflow-hidden rounded-[7px] bg-[#F5F5F5]">
                        <Image
                          src={
                            product.primary_image_url
                          }
                          alt={
                            product.name
                          }
                          fill
                          sizes="186px"
                          className="object-cover transition-transform duration-500 group-hover/image:scale-[1.06]"
                        />
                      </div>

                  
                    </div>
                  </button>

                  {/* =================================================
                     INFO
                  ================================================== */}

                  <div className="px-[12px] pt-[8px]">
                    {/* Rating */}
                    {rating !==
                      undefined &&
                      rating > 0 && (
                        <div className="mb-[4px] flex items-center">
                          <div className="inline-flex items-center gap-[3px] rounded-[5px] bg-[#F5F5F5] px-[5px] py-[2px]">
                            <span className="text-[11px] font-medium leading-none text-[#3C3C3C]">
                              {
                                rating
                              }
                            </span>

                            <Star
                              size={
                                11
                              }
                              fill="#3C8F2F"
                              strokeWidth={
                                0
                              }
                              className="text-[#3C8F2F]"
                            />

                            <span className="mx-[1px] text-[10px] text-[#B0B0B0]">
                              |
                            </span>

                            <span className="text-[11px] font-normal leading-none text-[#5C5C5C]">
                              {
                                reviews
                              }
                            </span>
                          </div>
                        </div>
                      )}

                    {/* Brand */}
                    {brand && (
                      <p className="text-[11px] font-semibold leading-[16px] text-[#1A1A1A]">
                        {
                          brand
                        }
                      </p>
                    )}

                    {/* Product Name */}
                    <p
                      title={
                        product.name
                      }
                      className="mt-[1px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] leading-[16px] text-[#828282]"
                    >
                      {
                        product.name
                      }
                    </p>

                    {/* Price */}
                    <div className="mt-[8px] flex flex-wrap items-center gap-[5px]">
                      <span className="text-[13px] font-semibold leading-none text-[#171717]">
                        ₹
                        {price.toLocaleString(
                          "en-IN",
                        )}
                      </span>

                      {/* MRP */}
                      {product.has_discount &&
                        mrp >
                          price && (
                          <span className="text-[10px] font-normal leading-none text-[#B0B0B0] line-through">
                            ₹
                            {mrp.toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        )}

                      {/* Discount */}
                      {product.has_discount &&
                        discount >
                          0 && (
                          <span className="text-[10px] font-semibold leading-none text-[#3E9A38]">
                            {
                              discount
                            }
                            % off
                          </span>
                        )}
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}