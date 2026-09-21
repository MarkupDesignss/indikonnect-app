"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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

  // ✅ no argument (void query)
  const { data, isLoading, isError } = useGetProductSectionsQuery();

  const bestSellers: ApiProduct[] =
    data?.data?.best_sellers?.products ?? [];

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -460,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 460,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <section className="w-full px-4 py-5 sm:px-6">
        <div className="rounded-[9px] bg-[#FDE8E8] px-5 py-5 sm:px-6">
          <div className="mb-7 h-[28px] w-[140px] animate-pulse rounded bg-white/60" />
          <div className="flex gap-[21px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[300px] w-[201px] flex-none animate-pulse rounded-[10px] bg-white/70 sm:w-[202px]"
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
      <div className="relative overflow-hidden rounded-[9px] bg-[#FDE8E8] px-5 py-5 sm:px-6">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-[18px] font-medium tracking-[-0.2px] text-[#292929] sm:text-[19px]">
            {data?.data?.best_sellers?.title ?? "Best Sellers"}
          </h2>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Previous products"
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ChevronLeft
                size={25}
                strokeWidth={1.8}
                className="text-[#B6B6B6]"
              />
            </button>

            <button
              type="button"
              onClick={scrollRight}
              aria-label="Next products"
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ChevronRight
                size={25}
                strokeWidth={1.8}
                className="text-[#181818]"
              />
            </button>
          </div>
        </div>

        {/* Products */}
        <div
          ref={scrollRef}
          className="flex gap-[21px] overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-none"
        >
          {bestSellers.map((product) => {
            const brand =
              product.category?.name ??
              product.subcategory?.name ??
              "";

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
                className="flex-none w-[201px] overflow-hidden rounded-[10px] bg-white pb-[18px] sm:w-[202px]"
              >
                {/* Image */}
                <div className="px-[15px] pt-[18px]">
                  <div className="relative h-[169px] w-full overflow-hidden rounded-[4px] bg-[#F5F5F5]">
                    <Image
                      src={product.primary_image_url}
                      alt={product.name}
                      fill
                      sizes="202px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="px-[15px] pt-[10px]">
                  {rating !== undefined && rating > 0 && (
                    <div className="mb-[6px] flex items-center">
                      <div className="inline-flex items-center gap-[4px] rounded-[5px] bg-[#F5F5F5] px-[5px] py-[1px]">
                        <span className="text-[12px] font-normal leading-none text-[#3C3C3C]">
                          {rating}
                        </span>

                        <Star
                          size={12}
                          fill="#3C8F2F"
                          strokeWidth={0}
                          className="text-[#3C8F2F]"
                        />

                        <span className="mx-[1px] text-[11px] text-[#777]">
                          |
                        </span>

                        <span className="text-[12px] font-normal leading-none text-[#303030]">
                          {reviews}
                        </span>
                      </div>
                    </div>
                  )}

                  {brand && (
                    <p className="text-[14px] font-medium leading-[18px] text-[#1E1E1E]">
                      {brand}
                    </p>
                  )}

                  <p
                    title={product.name}
                    className="mt-[1px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-normal leading-[18px] text-[#626262]"
                  >
                    {product.name}
                  </p>

                  <div className="mt-[10px] flex flex-wrap items-center gap-[6px]">
                    <span className="text-[15px] font-semibold leading-none text-[#171717]">
                      ₹ {price.toLocaleString("en-IN")}
                    </span>

                    {product.has_discount && mrp > price && (
                      <span className="text-[12px] font-normal leading-none text-[#A2A2A2] line-through">
                        ₹ {mrp.toLocaleString("en-IN")}
                      </span>
                    )}

                    {product.has_discount && discount > 0 && (
                      <span className="text-[12px] font-medium leading-none text-[#3E9A38]">
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