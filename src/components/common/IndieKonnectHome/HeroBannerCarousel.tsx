"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetContentsQuery } from "@/lib/redux/api/Home/contentApi";

interface BannerImage {
  id: number;
  url: string;
  alt_text?: string | null;
  is_primary?: boolean;
}

interface BannerBlock {
  id: number;
  heading?: string | null;
  short_description?: string | null;
  description?: string | null;
  sort_order: number;
  images?: BannerImage[];
  videos?: any[];
}

interface ContentItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  blocks?: BannerBlock[];
}

interface Banner {
  id: number;
  image: string;
  alt: string;
  heading?: string | null;
}

export default function HeroBannerCarousel() {
  const { data, isLoading } = useGetContentsQuery(undefined);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // =========================================================
  // Normalize API Response
  // =========================================================
  const contents: ContentItem[] = useMemo(() => {
    if (Array.isArray(data)) {
      return data as ContentItem[];
    }

    if (Array.isArray((data as any)?.data)) {
      return (data as any).data;
    }

    if (Array.isArray((data as any)?.contents)) {
      return (data as any).contents;
    }

    return [];
  }, [data]);

  // =========================================================
  // Find Banner Content
  // =========================================================
  const bannerContent = useMemo(() => {
    return contents.find(
      (item) =>
        item.slug?.toLowerCase() === "banners" ||
        item.title?.toLowerCase() === "banners",
    );
  }, [contents]);

  // =========================================================
  // Convert API Blocks Into Banners
  // =========================================================
  const banners: Banner[] = useMemo(() => {
    if (!bannerContent?.blocks?.length) {
      return [];
    }

    return [...bannerContent.blocks]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((block) => {
        const image =
          block.images?.find((item) => item.is_primary) ||
          block.images?.[0];

        if (!image?.url) {
          return null;
        }

        return {
          id: block.id,
          image: image.url,
          alt:
            image.alt_text ||
            block.heading ||
            "IndieKonnect Banner",
          heading: block.heading,
        };
      })
      .filter(Boolean) as Banner[];
  }, [bannerContent]);

  // =========================================================
  // Next Slide
  // =========================================================
  const nextSlide = useCallback(() => {
    if (!banners.length) return;

    setActiveIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  // =========================================================
  // Previous Slide
  // =========================================================
  const prevSlide = useCallback(() => {
    if (!banners.length) return;

    setActiveIndex(
      (prev) =>
        (prev - 1 + banners.length) % banners.length,
    );
  }, [banners.length]);

  // =========================================================
  // Go To Specific Slide
  // =========================================================
  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // =========================================================
  // Reset Index When Banners Change
  // =========================================================
  useEffect(() => {
    if (
      activeIndex >= banners.length &&
      banners.length > 0
    ) {
      setActiveIndex(0);
    }
  }, [activeIndex, banners.length]);

  // =========================================================
  // Auto Slide
  // =========================================================
  useEffect(() => {
    if (banners.length <= 1 || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [nextSlide, banners.length, isPaused]);

  // =========================================================
  // Keyboard Navigation
  // =========================================================
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextSlide();
      }

      if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [nextSlide, prevSlide]);

  // =========================================================
  // Loading State
  // =========================================================
  if (isLoading) {
    return (
      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-[1430px] px-3 sm:px-4 lg:px-0">
          <div className="relative w-full overflow-hidden">
            <div
              className="
                aspect-[1430/218]
                w-full
                animate-pulse
                bg-gradient-to-r
                from-[#f4f4f4]
                via-[#e9e9e9]
                to-[#f4f4f4]
              "
            />
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="
                  h-[5px]
                  w-[5px]
                  animate-pulse
                  rounded-full
                  bg-[#d5d5d5]
                "
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // No Banners
  // =========================================================
  if (!banners.length) {
    return null;
  }

  return (
    <section className="w-full bg-white py-10">
      <div className="mx-auto w-full max-w-[1430px] px-3 sm:px-4 lg:px-0">
        <div
          className="group relative w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* =================================================
              MAIN BANNER
          ================================================= */}
          <div
            className="
              relative
              aspect-[1430/218]
              w-full
              overflow-hidden
              bg-[#f7f7f7]
            "
          >
            {banners.map((banner, index) => {
              const isActive = index === activeIndex;

              const isPrev =
                index ===
                (activeIndex - 1 + banners.length) %
                  banners.length;

              return (
                <div
                  key={banner.id}
                  className={`
                    absolute
                    inset-0
                    h-full
                    w-full
                    transition-all
                    duration-700
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    ${
                      isActive
                        ? "z-10 translate-x-0 scale-100 opacity-100"
                        : isPrev
                          ? "z-0 -translate-x-full scale-[0.99] opacity-0"
                          : "z-0 translate-x-full scale-[0.99] opacity-0"
                    }
                  `}
                >
                  <Image
                    src={banner.image}
                    alt={banner.alt}
                    fill
                    priority={index === 0}
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1430px"
                    className="
                      h-full
                      w-full
                      object-cover
                      object-center
                    "
                  />

                  {/* Very subtle overlay for premium depth */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-r
                      from-black/[0.025]
                      via-transparent
                      to-black/[0.025]
                    "
                  />
                </div>
              );
            })}
          </div>

          {/* =================================================
              DOT NAVIGATION
          ================================================= */}
          {banners.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-[6px] sm:mt-3.5">
              {banners.map((banner, index) => {
                const isActive = activeIndex === index;

                return (
                  <button
                    key={banner.id}
                    type="button"
                    aria-label={`Go to banner ${index + 1}`}
                    aria-current={isActive}
                    onClick={() => goToSlide(index)}
                    className="
                      group/dot
                      flex
                      h-[7px]
                      items-center
                      justify-center
                      p-0
                      focus:outline-none
                    "
                  >
                    <span
                      className={`
                        block
                        rounded-full
                        transition-all
                        duration-500
                        ease-out
                        ${
                          isActive
                            ? "h-[5px] w-[22px] bg-[#222222]"
                            : "h-[5px] w-[5px] bg-[#d3d3d3] group-hover/dot:w-[9px] group-hover/dot:bg-[#999999]"
                        }
                      `}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}