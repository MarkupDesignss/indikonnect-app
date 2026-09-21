"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Flame } from "lucide-react";
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

export default function CustomerFavourites() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const { data, isLoading, isError } = useGetProductSectionsQuery();

  const bestSellers: ApiProduct[] = data?.data?.best_sellers?.products ?? [];

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -460, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 460, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="w-full px-4 py-5 sm:px-6">
        <div className="rounded-[16px] bg-gradient-to-br from-[#FDE8E8] to-[#FCEFEF] px-5 py-5 sm:px-6">
          <div className="mb-7 h-[28px] w-[140px] animate-pulse rounded bg-white/60" />
          <div className="flex gap-[21px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[300px] w-[201px] flex-none animate-pulse rounded-[14px] bg-white/70 sm:w-[202px]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || bestSellers.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 py-5 sm:px-6">
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#FDE8E8] to-[#FCEFEF] px-5 py-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:px-7">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white/70">
              <Flame size={14} className="text-[#E5544D]" strokeWidth={2} />
            </span>
            <h2 className="text-[19px] font-semibold tracking-[-0.3px] text-[#232323] sm:text-[20px]">
              {data?.data?.best_sellers?.title ?? "Best Sellers"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={scrollLeft}
              disabled={atStart}
              aria-label="Previous products"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <ChevronLeft size={22} strokeWidth={2} className="text-[#3A3A3A]" />
            </button>

            <button
              type="button"
              onClick={scrollRight}
              disabled={atEnd}
              aria-label="Next products"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#232323] shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <ChevronRight size={22} strokeWidth={2} className="text-white" />
            </button>
          </div>
        </div>

        {/* Edge fades for scroll affordance */}
        <div className="pointer-events-none absolute left-0 top-[92px] bottom-6 z-10 w-8 bg-gradient-to-r from-[#FDE8E8] to-transparent sm:left-1" />
        <div className="pointer-events-none absolute right-0 top-[92px] bottom-6 z-10 w-10 bg-gradient-to-l from-[#FCEFEF] to-transparent sm:right-1" />

        {/* Products */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-[18px] overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-none"
        >
          {bestSellers.map((product) => {
            const brand =
              product.category?.name ?? product.subcategory?.name ?? "";

            const rating = product.reviews_summary?.average_rating;
            const reviews = product.reviews_summary?.total_reviews;

            const price = Number(
              product.discounted_price ?? product.current_price,
            );
            const mrp = Number(product.original_price);
            const discount = Number(product.discount_percentage);

            return (
              <article
                key={product.id}
                className="group flex-none w-[201px] overflow-hidden rounded-[14px] bg-white pb-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:w-[204px]"
              >
                {/* Image */}
                <div className="relative px-[14px] pt-[14px]">
                  <div className="relative h-[169px] w-full overflow-hidden rounded-[8px] bg-[#F5F5F5]">
                    <Image
                      src={product.primary_image_url}
                      alt={product.name}
                      fill
                      sizes="204px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  </div>

                  {product.is_best_seller && (
                    <span className="absolute left-[22px] top-[22px] rounded-full bg-[#232323]/90 px-[9px] py-[3px] text-[10px] font-medium tracking-wide text-white backdrop-blur-sm">
                      Best Seller
                    </span>
                  )}

                  {product.has_discount && discount > 0 && (
                    <span className="absolute right-[22px] top-[22px] rounded-full bg-[#E5544D] px-[8px] py-[3px] text-[10px] font-semibold text-white">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="px-[15px] pt-[11px]">
                  {rating !== undefined && rating > 0 && (
                    <div className="mb-[7px] flex items-center">
                      <div className="inline-flex items-center gap-[4px] rounded-[6px] bg-[#F5F5F5] px-[6px] py-[2px]">
                        <span className="text-[12px] font-medium leading-none text-[#3C3C3C]">
                          {rating}
                        </span>
                        <Star
                          size={12}
                          fill="#3C8F2F"
                          strokeWidth={0}
                          className="text-[#3C8F2F]"
                        />
                        <span className="mx-[1px] text-[11px] text-[#B0B0B0]">
                          |
                        </span>
                        <span className="text-[12px] font-normal leading-none text-[#5C5C5C]">
                          {reviews}
                        </span>
                      </div>
                    </div>
                  )}

                  {brand && (
                    <p className="text-[14px] font-semibold leading-[18px] text-[#1A1A1A]">
                      {brand}
                    </p>
                  )}

                  <p
                    title={product.name}
                    className="mt-[2px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-normal leading-[18px] text-[#828282]"
                  >
                    {product.name}
                  </p>

                  <div className="mt-[11px] flex flex-wrap items-center gap-[7px]">
                    <span className="text-[16px] font-bold leading-none text-[#171717]">
                      ₹{price.toLocaleString("en-IN")}
                    </span>

                    {product.has_discount && mrp > price && (
                      <span className="text-[12px] font-normal leading-none text-[#B0B0B0] line-through">
                        ₹{mrp.toLocaleString("en-IN")}
                      </span>
                    )}

                    {product.has_discount && discount > 0 && (
                      <span className="text-[12px] font-semibold leading-none text-[#3E9A38]">
                        {discount}% off
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
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