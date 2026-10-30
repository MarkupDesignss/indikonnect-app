"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
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
// ANIMATIONS  (SLOWED DOWN)
// ========================================

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.12,
    },
  },
};

const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: "easeOut" as const,
    },
  },
};

// Cards side se halka sa aakar settle hongi (subtle, no big zoom)
const dealIn: Variants = {
  hidden: {
    opacity: 0,
    x: 60,
    y: 25,
    rotateZ: 4,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotateZ: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 20,
      mass: 1,
    },
  },
};

// ========================================
// HELPERS  (subtle dock wave, no big zoom)
// ========================================

const getLift = (index: number, hovered: number | null) => {
  if (hovered === null) return { y: 0, scale: 1, z: 0 };

  const d = Math.abs(index - hovered);

  if (d === 0) return { y: -12, scale: 1.015, z: 40 };
  if (d === 1) return { y: -6, scale: 1.005, z: 20 };
  if (d === 2) return { y: -2, scale: 1, z: 6 };

  return { y: 0, scale: 1, z: 0 };
};

// ========================================
// BRAND CARD
// ========================================

function BrandCard({
  brand,
  index,
  hoveredIndex,
  reduceMotion,
  isInView,
  onClick,
}: {
  brand: Brand;
  index: number;
  hoveredIndex: number | null;
  reduceMotion: boolean;
  isInView: boolean;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  const logoUrl = brand.logo?.trim() || "";

  useEffect(() => {
    setImageError(false);
  }, [logoUrl]);

  const isActive = hoveredIndex === index;

  const lift = reduceMotion
    ? { y: 0, scale: 1, z: 0 }
    : getLift(index, hoveredIndex);

  // ---------- 3D TILT (very subtle) ----------
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const springCfg = {
    stiffness: 140,
    damping: 22,
    mass: 0.8,
  };

  const rotateY = useSpring(
    useTransform(mx, [0, 1], [-5, 5]),
    springCfg
  );

  const rotateX = useSpring(
    useTransform(my, [0, 1], [4, -4]),
    springCfg
  );

  const glareX = useTransform(mx, [0, 1], [0, 100]);
  const glareY = useTransform(my, [0, 1], [0, 100]);

  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.28), rgba(255,255,255,0.05) 38%, transparent 62%)`;

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduceMotion || !isInView) return;

    const rect = e.currentTarget.getBoundingClientRect();

    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      variants={dealIn}
      className="
        relative shrink-0
        w-[185px]
        sm:w-[225px]
        md:w-[245px]
        lg:w-[265px]
        xl:w-[285px]
      "
      style={{
        zIndex: isActive ? 50 : 10,
        transformStyle: "preserve-3d",
      }}
    >
      {/* FLOOR SHADOW */}
      <motion.div
        aria-hidden
        className="
          pointer-events-none absolute -bottom-6 left-1/2
          h-5 w-[78%] -translate-x-1/2
          rounded-[100%] bg-black blur-xl
        "
        animate={
          isInView
            ? {
                opacity: isActive ? 0.16 : 0.26,
                scaleX: isActive ? 0.88 : 1,
              }
            : {
                opacity: 0.26,
                scaleX: 1,
              }
        }
        transition={{ duration: 0.6 }}
      />

      {/* LIFT / DOCK WAVE */}
      <motion.div
        animate={
          isInView
            ? lift
            : { y: 0, scale: 1, z: 0 }
        }
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 22,
          mass: 0.85,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* IDLE FLOAT */}
        <motion.div
          animate={
            isInView && !reduceMotion
              ? { y: [0, -5, 0] }
              : { y: 0 }
          }
          transition={
            isInView && !reduceMotion
              ? {
                  duration: 5.5,
                  delay: (index % 6) * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : undefined
          }
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* 3D TILT */}
          <motion.div
            style={{
              rotateX: reduceMotion ? 0 : rotateX,
              rotateY: reduceMotion ? 0 : rotateY,
              transformStyle: "preserve-3d",
              willChange: isInView ? "transform" : "auto",
            }}
          >
            <button
              type="button"
              onClick={onClick}
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
              aria-label={`Explore ${brand.title}`}
              className="
                group relative block w-full overflow-hidden
                rounded-[14px] bg-[#f2ede6]
                text-left
                shadow-[0_10px_30px_rgba(60,40,10,0.14)]
                ring-1 ring-[#b28b56]/20
                transition-all duration-700
                hover:-translate-y-1
                hover:shadow-[0_26px_52px_rgba(60,40,10,0.24)]
                hover:ring-[#b28b56]/50
              "
            >
              {/* IMAGE CONTAINER */}
              <div
                className="
                  relative h-[305px] w-full
                  sm:h-[360px]
                  md:h-[390px]
                  lg:h-[430px]
                  xl:h-[455px]
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
                      transition-transform duration-[1400ms] ease-out
                      group-hover:scale-[1.03]
                    "
                  />
                ) : (
                  <div
                    className="
                      absolute inset-0 flex
                      items-center justify-center
                      bg-gradient-to-br from-[#f7f2ea] to-[#eadfce]
                      p-5 text-center
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

                {/* MOUSE FOLLOW GLARE */}
                {!reduceMotion && (
                  <motion.div
                    aria-hidden
                    className="
                      pointer-events-none absolute inset-0
                      opacity-0 mix-blend-soft-light
                      transition-opacity duration-500
                      group-hover:opacity-100
                    "
                    style={{ background: glare }}
                  />
                )}

                {/* SHINE SWEEP */}
                <div
                  aria-hidden
                  className="
                    pointer-events-none absolute inset-y-0 -left-1/2
                    w-1/3 -skew-x-12
                    bg-gradient-to-r from-transparent via-white/25 to-transparent
                    opacity-0
                    transition-all duration-[1400ms] ease-out
                    group-hover:left-[130%] group-hover:opacity-100
                  "
                />
              </div>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
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
  const reduceMotion = !!useReducedMotion();

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Section viewport mein aate hi animation start hogi.
  // Scroll direction (upar se neeche ya neeche se upar) kuch bhi ho,
  // jab bhi section viewport mein aayega tab animation play hogi.
  // Ek baar visible hone ke baad entrance animation repeat nahi hogi.
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.05,
    margin: "0px 0px -10% 0px",
  });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const brands = brandsData?.data || [];

  // ========================================
  // SCROLL STATE
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
  // BRAND NAVIGATION
  // ========================================

  const handleBrandClick = (brand: Brand) => {
    router.push(
      `/products/?brand_ids=${encodeURIComponent(brand.id)}`
    );
  };

  // ========================================
  // JSX
  // ========================================

  return (
    <motion.section
      ref={sectionRef}
      className="
        relative isolate w-full
        overflow-hidden
        bg-[#faf8f5]
        py-8 sm:py-10 lg:py-12
      "
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      viewport={{
        once: true,
        amount: 0.05,
      }}
      variants={staggerContainer}
    >
      {/* SOFT BACKGROUND GLOW */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute left-1/2 top-1/2 -z-10
          h-[420px] w-[80%] -translate-x-1/2 -translate-y-1/2
          rounded-full bg-[#e9d3ac]/25 blur-[120px]
        "
      />

      <div className="mx-auto w-full max-w-[1900px]">

        {/* SECTION HEADER */}
        <motion.div
          variants={fadeInUp}
          className="
            relative mb-2 flex flex-col
            items-center px-4 text-center
            sm:mb-2
          "
        >
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
            <span className="text-[#94672f]">
              Arrivals
            </span>
          </h2>

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

        {/* LOADING SKELETON */}
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
                    h-[305px] w-[185px]
                    shrink-0 animate-pulse
                    rounded-[12px]
                    bg-[#eae5dd]
                    sm:h-[360px]
                    sm:w-[225px]
                    md:h-[390px]
                    md:w-[245px]
                    lg:h-[430px]
                    lg:w-[265px]
                    xl:h-[455px]
                    xl:w-[285px]
                  "
                />
              ))}
            </div>
          </div>
        ) : brands.length === 0 ? (
          /* EMPTY STATE */
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
          /* BRAND CAROUSEL */
          <div className="relative w-full">

            {/* PREVIOUS BUTTON */}
            <button
              type="button"
              aria-label="Previous brands"
              onClick={() => scrollCards(-1)}
              disabled={!canScrollLeft}
              className="
                absolute left-2 top-1/2 z-[60]
                hidden h-11 w-11
                -translate-y-1/2
                items-center justify-center
                rounded-full bg-white
                text-[#111]
                shadow-[0_5px_20px_rgba(0,0,0,0.12)]
                transition-all duration-500
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
                absolute right-2 top-1/2 z-[60]
                hidden h-11 w-11
                -translate-y-1/2
                items-center justify-center
                rounded-full bg-white
                text-[#111]
                shadow-[0_5px_20px_rgba(0,0,0,0.12)]
                transition-all duration-500
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

            {/* SCROLL CONTAINER */}
            <div
              ref={scrollRef}
              id="brands-scroll"
              onScroll={updateScrollState}
              onMouseLeave={() => setHoveredIndex(null)}
              className="
                w-full overflow-x-auto
                scroll-smooth
                snap-x snap-mandatory
                pb-14 pt-12
              "
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
                scrollPaddingInline: "clamp(12px, 4vw, 40px)",
                perspective: "1400px",
                perspectiveOrigin: "50% 45%",
              }}
            >
              <div
                className="
                  mx-auto flex w-max
                  items-center
                  gap-3 px-4
                  sm:gap-4 sm:px-6
                  lg:gap-5 lg:px-10
                "
                style={{ transformStyle: "preserve-3d" }}
              >
                {brands.map((brand, index) => (
                  <div
                    key={brand.id ?? index}
                    data-brand-item
                    className="shrink-0 snap-start"
                    style={{ transformStyle: "preserve-3d" }}
                    onMouseEnter={() => setHoveredIndex(index)}
                  >
                    <BrandCard
                      brand={brand}
                      index={index}
                      hoveredIndex={hoveredIndex}
                      reduceMotion={reduceMotion}
                      isInView={isInView}
                      onClick={() => handleBrandClick(brand)}
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