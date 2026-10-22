"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// ========================================
// TYPES
// ========================================

interface Brand {
  id: number;
  title: string;
  status: number;
  discount_percentage: number;
  logo: string | null;
  slug?: string | null;
}

interface BrandsResponse {
  data: Brand[];
}

interface NewArrivalsProps {
  brandsData?: BrandsResponse | null;
  isBrandsLoading: boolean;
}

// ========================================
// ANIMATIONS
// ========================================

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut" as const,
    },
  },
};

// ========================================
// BRAND CARD
// ========================================

function BrandCard({
  brand,
  onClick,
}: {
  brand: Brand;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  const logoUrl = brand.logo?.trim() || "";

  useEffect(() => setImageError(false), [logoUrl]);

  return (
    <motion.div
      variants={fadeInUp}
      className="
        group relative flex shrink-0 snap-start
        flex-col items-center justify-center
        text-center
        w-[185px]
        sm:w-[225px]
        md:w-[245px]
        lg:w-[265px]
        xl:w-[285px]
      "
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`Explore ${brand.title}`}
        className="
          relative block w-full overflow-hidden
          rounded-[12px] bg-[#f2ede6]
          text-left
          shadow-[0_4px_18px_rgba(0,0,0,0.05)]
          transition-all duration-500
          hover:-translate-y-1
          hover:shadow-[0_18px_40px_rgba(0,0,0,0.13)]
        "
      >
        {/* IMAGE CONTAINER */}
        <div
          className="
            relative h-[280px] w-full
            sm:h-[335px]
            md:h-[365px]
            lg:h-[405px]
            xl:h-[430px]
          "
        >
          {logoUrl && !imageError ? (
            <img
              src={logoUrl}
              alt={brand.title}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              className="
                absolute inset-0
                h-full w-full
                object-cover object-center
                transition-transform duration-700
                group-hover:scale-[1.05]
              "
            />
          ) : (
            <div
              className="
                absolute inset-0 flex
                items-center justify-center
                bg-[#f2ede6] p-5 text-center
              "
            >
              <span
                className="
                  font-serif text-[18px]
                  font-medium text-[#876942]
                  sm:text-[22px]
                "
              >
                {brand.title}
              </span>
            </div>
          )}

          {/* PREMIUM HOVER OVERLAY */}
          <div
            className="
              pointer-events-none
              absolute inset-0
              bg-black/0
              transition-colors duration-500
              group-hover:bg-black/[0.025]
            "
          />
        </div>
      </button>
    </motion.div>
  );
}

// ========================================
// MAIN NEW ARRIVALS SECTION
// ========================================

export default function NewArrivalsSection({
  brandsData,
  isBrandsLoading,
}: NewArrivalsProps) {
  const router = useRouter();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const brands = brandsData?.data || [];

  // ========================================
  // SCROLL STATE (arrows show/hide)
  // ========================================

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(
      element.scrollLeft + element.clientWidth <
        element.scrollWidth - 2
    );
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);
    if (element.firstElementChild) {
      resizeObserver.observe(element.firstElementChild);
    }

    return () => resizeObserver.disconnect();
  }, [brands.length, isBrandsLoading, updateScrollState]);

  // ========================================
  // CAROUSEL SCROLL
  // ========================================

  const scrollCards = (direction: number) => {
    const container = scrollRef.current;

    if (!container) return;

    const firstCard = container.querySelector(
      "[data-brand-item]"
    ) as HTMLElement | null;

    const cardWidth = firstCard?.offsetWidth || 285;

    const innerContainer = container.firstElementChild;

    const gap = innerContainer
      ? parseFloat(
          window.getComputedStyle(innerContainer).columnGap
        ) || 16
      : 16;

    container.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  // ========================================
  // BRAND NAVIGATION (FIXED)
  // ========================================

  const handleBrandClick = (brand: Brand) => {
    // Distributor path ke liye brand_ids use kiya
    router.push(
      `/products/?brand_ids=${encodeURIComponent(brand.id)}`
    );
  };

  // ========================================
  // JSX
  // ========================================

  return (
    <motion.section
      className="
        relative isolate w-full
        overflow-hidden
        bg-[#faf8f5]
        py-8 sm:py-10 lg:py-12
      "
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.08,
      }}
      variants={staggerContainer}
    >
      <div className="mx-auto w-full max-w-[1900px]">
        {/* =====================================
            PREMIUM SECTION HEADER
        ===================================== */}

        <motion.div
          variants={fadeInUp}
          className="
            relative mb-6 flex flex-col
            items-center px-4 text-center
            sm:mb-8
          "
        >
          {/* TOP SUBTITLE */}
          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-7 bg-[#b28b56] sm:w-10" />

            <span
              className="
                text-[8px] font-medium
                uppercase tracking-[0.25em]
                text-[#777]
                sm:text-[10px]
              "
            >
              Discover Our Latest
            </span>

            <span className="h-px w-7 bg-[#b28b56] sm:w-10" />
          </div>

          {/* MAIN TITLE */}
          <h2
            className="
              font-serif text-[28px]
              font-normal leading-[1.15]
              tracking-[-0.035em]
              text-[#171717]
              sm:text-[34px]
              lg:text-[40px]
            "
          >
            New{" "}
            <span className="text-[#94672f]">Arrivals</span>
          </h2>

          {/* BOTTOM SUBTITLE */}
          <p
            className="
              mt-2 text-[8px]
              font-medium uppercase
              tracking-[0.20em]
              text-[#888]
              sm:text-[10px]
              sm:tracking-[0.25em]
            "
          >
            Fresh Picks For A Modern Lifestyle
          </p>
        </motion.div>

        {/* =====================================
            LOADING SKELETON
        ===================================== */}

        {isBrandsLoading ? (
          <div className="w-full overflow-hidden pb-5 pt-2">
            <div
              className="
                mx-auto flex w-max items-center
                gap-3 px-4
                sm:gap-4 sm:px-6
                lg:gap-5 lg:px-10
              "
            >
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="
                    h-[280px] w-[185px]
                    shrink-0 animate-pulse
                    rounded-[12px]
                    bg-[#eae5dd]
                    sm:h-[335px]
                    sm:w-[225px]
                    md:h-[365px]
                    md:w-[245px]
                    lg:h-[405px]
                    lg:w-[265px]
                    xl:h-[430px]
                    xl:w-[285px]
                  "
                />
              ))}
            </div>
          </div>
        ) : brands.length === 0 ? (
          /* =====================================
             EMPTY STATE
          ===================================== */

          <div
            className="
              flex min-h-[180px]
              items-center justify-center
              px-4
            "
          >
            <p className="text-[13px] text-[#777]">
              No brands available
            </p>
          </div>
        ) : (
          /* =====================================
             BRAND CAROUSEL
          ===================================== */

          <div className="relative w-full">
            {/* PREVIOUS BUTTON */}
            <button
              type="button"
              aria-label="Previous brands"
              onClick={() => scrollCards(-1)}
              disabled={!canScrollLeft}
              className="
                absolute left-2 top-1/2 z-20
                hidden h-11 w-11
                -translate-y-1/2
                items-center justify-center
                rounded-full bg-white
                text-[#111]
                shadow-[0_5px_20px_rgba(0,0,0,0.12)]
                transition-all duration-300
                hover:scale-105
                hover:bg-[#111]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-0
                lg:flex
                xl:left-4
              "
            >
              <ChevronLeft size={21} strokeWidth={1.7} />
            </button>

            {/* NEXT BUTTON */}
            <button
              type="button"
              aria-label="Next brands"
              onClick={() => scrollCards(1)}
              disabled={!canScrollRight}
              className="
                absolute right-2 top-1/2 z-20
                hidden h-11 w-11
                -translate-y-1/2
                items-center justify-center
                rounded-full bg-white
                text-[#111]
                shadow-[0_5px_20px_rgba(0,0,0,0.12)]
                transition-all duration-300
                hover:scale-105
                hover:bg-[#111]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-0
                lg:flex
                xl:right-4
              "
            >
              <ChevronRight size={21} strokeWidth={1.7} />
            </button>

            {/* =====================================
                SCROLL CONTAINER (no horizontal padding here,
                padding is inside the row)
            ===================================== */}

            <div
              ref={scrollRef}
              id="brands-scroll"
              onScroll={updateScrollState}
              className="
                w-full overflow-x-auto
                scroll-smooth
                snap-x snap-mandatory
                pb-5 pt-2
              "
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
                scrollPaddingInline:
                  "clamp(12px, 4vw, 40px)",
              }}
            >
              {/*
                mx-auto + w-max:
                - cards kam hon  -> beech me center
                - cards zyada hon -> left se start, start/end dono taraf same padding
              */}
              <div
                className="
                  mx-auto flex w-max
                  items-center
                  gap-3 px-4
                  sm:gap-4 sm:px-6
                  lg:gap-5 lg:px-10
                "
              >
                {brands.map((brand, index) => (
                  <div
                    key={brand.id ?? index}
                    data-brand-item
                    className="shrink-0 snap-start"
                  >
                    <BrandCard
                      brand={brand}
                      onClick={() =>
                        handleBrandClick(brand)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}