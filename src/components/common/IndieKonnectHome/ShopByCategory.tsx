"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MouseEvent } from "react";
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
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ========================================
// TYPES
// ========================================

export type Category = {
  id: number | string;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  image?: string | null;
  image_url?: string | null;
  logo?: string | null;
  banner?: string | null;
  status?: number | boolean;
  categoryData?: string[];
};

type CategoriesResponse = {
  data?: Category[] | { data?: Category[] };
};

export interface ShopByCategoryProps {
  categories?: Category[];
  categoriesData?: CategoriesResponse | Category[] | null;
  isCategoriesLoading?: boolean;
  isCategoriesError?: boolean;
  className?: string;
}

// ========================================
// ANIMATIONS
// ========================================

const staggerContainer: Variants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: "easeOut" as const,
    },
  },
};

// Cards slowly right side se aakar settle hongi
const dealIn: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    y: 45,
    rotateZ: 8,
    scale: 0.93,
  },

  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotateZ: 0,
    scale: 1,

    transition: {
      type: "spring",
      stiffness: 65,
      damping: 19,
      mass: 1.15,
    },
  },
};

// ========================================
// CARD SIZES
// ========================================

const cardSize =
  "w-[185px] sm:w-[225px] md:w-[245px] lg:w-[265px] xl:w-[285px]";

const imageSize =
  "h-[280px] sm:h-[335px] md:h-[365px] lg:h-[405px] xl:h-[430px]";

// ========================================
// DOCK WAVE
// ========================================

const getLift = (
  index: number,
  hovered: number | null
) => {
  if (hovered === null) {
    return { y: 0, scale: 1, z: 0 };
  }

  const distance = Math.abs(index - hovered);

  if (distance === 0) {
    return { y: -26, scale: 1.04, z: 90 };
  }

  if (distance === 1) {
    return { y: -12, scale: 1.015, z: 40 };
  }

  if (distance === 2) {
    return { y: -4, scale: 1, z: 12 };
  }

  return { y: 0, scale: 1, z: 0 };
};

// ========================================
// CATEGORY CARD
// ========================================

function CategoryCard({
  category,
  index,
  hoveredIndex,
  reduceMotion,
  isInView,
  onClick,
}: {
  category: Category;
  index: number;
  hoveredIndex: number | null;
  reduceMotion: boolean;
  isInView: boolean;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  // ========================================
  // IMAGE
  // ========================================

  const imageUrl =
    category.image_url?.trim() ||
    category.image?.trim() ||
    category.banner?.trim() ||
    category.logo?.trim() ||
    "";

  const displayTexts =
    category.categoryData &&
    category.categoryData.length > 0
      ? category.categoryData
      : [
          category.name || category.title || "Category",
          "Shop now",
        ];

  const primaryText = displayTexts[0] || "Category";
  const secondaryText = displayTexts[1] || "Shop now";

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  // ========================================
  // HOVER
  // ========================================

  const isActive = hoveredIndex === index;

  const lift = reduceMotion
    ? { y: 0, scale: 1, z: 0 }
    : getLift(index, hoveredIndex);

  // ========================================
  // 3D TILT
  // ========================================

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const springConfig = {
    stiffness: 140,
    damping: 22,
    mass: 0.8,
  };

  const rotateY = useSpring(
    useTransform(mx, [0, 1], [-13, 13]),
    springConfig
  );

  const rotateX = useSpring(
    useTransform(my, [0, 1], [11, -11]),
    springConfig
  );

  // ========================================
  // GLARE
  // ========================================

  const glareX = useTransform(mx, [0, 1], [0, 100]);
  const glareY = useTransform(my, [0, 1], [0, 100]);

  const glare = useMotionTemplate`
    radial-gradient(
      circle at ${glareX}% ${glareY}%,
      rgba(255,255,255,0.42),
      rgba(255,255,255,0.08) 38%,
      transparent 62%
    )
  `;

  // ========================================
  // MOUSE EVENTS
  // ========================================

  const handleMouseMove = (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    if (reduceMotion || !isInView) return;

    const rect = e.currentTarget.getBoundingClientRect();

    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  // ========================================
  // JSX
  // ========================================

  return (
    <motion.div
      variants={dealIn}
      className={`relative shrink-0 ${cardSize}`}
      style={{
        zIndex: isActive ? 50 : 10,
        transformStyle: "preserve-3d",
      }}
    >
      {/* FLOOR SHADOW */}

      <motion.div
        aria-hidden
        className="
          pointer-events-none absolute
          -bottom-6 left-1/2
          h-5 w-[78%]
          -translate-x-1/2
          rounded-[100%]
          bg-black blur-xl
        "
        animate={{
          opacity: isActive ? 0.16 : 0.26,
          scaleX: isActive ? 0.8 : 1,
        }}
        transition={{
          duration: 0.55,
        }}
      />

      {/* DOCK WAVE LIFT */}

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
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* IDLE FLOAT */}

        <motion.div
          animate={
            isInView && !reduceMotion
              ? { y: [0, -7, 0] }
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
          style={{
            transformStyle: "preserve-3d",
          }}
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
            {/* =====================================
                ORIGINAL CATEGORY CARD UI
            ===================================== */}

            <button
              type="button"
              onClick={onClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              aria-label={`Explore ${primaryText}`}
              className="
                group relative block
                aspect-[3/4] w-full
                overflow-hidden
                rounded-[22px]
                bg-[#e9e8e2]
                text-center
                ring-1 ring-black/5
                transition-all duration-500 ease-out
                hover:-translate-y-1.5
                hover:shadow-[0_24px_50px_-18px_rgba(30,40,25,0.45)]
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-[#55634d]
                motion-reduce:transition-none
                motion-reduce:hover:translate-y-0
              "
            >
              {/* IMAGE */}

              {imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt=""
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  onError={() => setImageError(true)}
                  className="
                    absolute inset-0
                    h-full w-full
                    object-cover object-center
                    transition-transform
                    duration-[900ms] ease-out
                    group-hover:scale-[1.06]
                    motion-reduce:transition-none
                    motion-reduce:group-hover:scale-100
                  "
                />
              ) : (
                <div
                  className="
                    absolute inset-0
                    flex items-center justify-center
                    bg-gradient-to-br
                    from-[#dfe4d8]
                    via-[#cfd6c4]
                    to-[#b9c3ab]
                  "
                >
                  <span
                    className="
                      font-serif text-7xl
                      text-[#55634d]/40
                    "
                  >
                    {primaryText.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* BOTTOM GRADIENT */}

              <div
                className="
                  pointer-events-none
                  absolute inset-x-0 bottom-0
                  h-3/5
                  bg-gradient-to-t
                  from-black/70
                  via-black/25
                  to-transparent
                  transition-opacity duration-500
                  group-hover:from-[#2a3524]/85
                "
              />

              {/* MOUSE FOLLOW GLARE */}

              {!reduceMotion && (
                <motion.div
                  aria-hidden
                  className="
                    pointer-events-none
                    absolute inset-0
                    opacity-0
                    mix-blend-soft-light
                    transition-opacity duration-300
                    group-hover:opacity-100
                  "
                  style={{
                    background: glare,
                  }}
                />
              )}

              {/* SHINE SWEEP */}

              <div
                aria-hidden
                className="
                  pointer-events-none
                  absolute inset-y-0 -left-1/2
                  w-1/3 -skew-x-12
                  bg-gradient-to-r
                  from-transparent
                  via-white/30
                  to-transparent
                  opacity-0
                  transition-all duration-[900ms]
                  ease-out
                  group-hover:left-[130%]
                  group-hover:opacity-100
                "
              />

              {/* ORIGINAL GLASS LABEL */}

              <div
                className="
                  absolute inset-x-3 bottom-3
                  flex items-center justify-between
                  gap-3
                  rounded-2xl
                  border border-white/20
                  bg-white/15
                  px-4 py-3
                  backdrop-blur-md
                  transition-colors duration-500
                  group-hover:bg-white/25
                "
              >
                <div className="min-w-0 flex-1 text-left">
                  <h3
                    className="
                      truncate text-[15px]
                      font-medium leading-tight
                      text-white sm:text-base
                    "
                  >
                    {primaryText}
                  </h3>

                  <p
                    className="
                      mt-0.5 truncate
                      text-[11px]
                      text-white/70
                      transition-all duration-500
                      sm:text-xs
                    "
                  >
                    {secondaryText}
                  </p>
                </div>

                {/* ORIGINAL ARROW */}

                <span
                  className="
                    flex h-9 w-9 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-white
                    text-[#2b2b2b]
                    transition-all duration-500
                    group-hover:rotate-45
                    group-hover:bg-black
                    group-hover:text-white
                    motion-reduce:transition-none
                    motion-reduce:group-hover:rotate-0
                  "
                >
                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.8}
                  />
                </span>
              </div>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ========================================
// MAIN SHOP BY CATEGORY SECTION
// ========================================

export default function ShopByCategory({
  categories,
  categoriesData,
  isCategoriesLoading = false,
  isCategoriesError = false,
  className = "",
}: ShopByCategoryProps) {
  const router = useRouter();

  const scrollRef = useRef<HTMLDivElement>(null);

  const sectionRef = useRef<HTMLElement | null>(null);

  const reduceMotion = !!useReducedMotion();

  // ========================================
  // VIEWPORT DETECTION
  // ========================================

  // Section screen par aane ke baad hi animation start hogi.
  // Ek baar visible hone ke baad entrance animation repeat nahi hogi.

  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.08,
  });

  // ========================================
  // STATES
  // ========================================

  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const [canScrollRight, setCanScrollRight] = useState(false);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(
    null
  );

  // ========================================
  // CATEGORY DATA
  // ========================================

  const items = useMemo(() => {
    if (categories) return categories;

    if (Array.isArray(categoriesData)) {
      return categoriesData;
    }

    const data = categoriesData?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (
      data &&
      !Array.isArray(data) &&
      Array.isArray(data.data)
    ) {
      return data.data;
    }

    return [];
  }, [categories, categoriesData]);

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

    const resizeObserver = new ResizeObserver(
      updateScrollState
    );

    resizeObserver.observe(element);

    if (element.firstElementChild) {
      resizeObserver.observe(element.firstElementChild);
    }

    return () => resizeObserver.disconnect();
  }, [
    items.length,
    isCategoriesLoading,
    isCategoriesError,
    updateScrollState,
  ]);

  // ========================================
  // CAROUSEL SCROLL
  // ========================================

  const scrollCards = (direction: -1 | 1) => {
    const element = scrollRef.current;

    if (!element) return;

    const card = element.querySelector<HTMLElement>(
      "[data-category-card]"
    );

    const row = element.firstElementChild;

    const gap = row
      ? parseFloat(
          window.getComputedStyle(row).columnGap
        ) || 16
      : 16;

    element.scrollBy({
      left: direction * ((card?.offsetWidth || 265) + gap),
      behavior: "smooth",
    });
  };

  // ========================================
  // CATEGORY NAVIGATION
  // ========================================

  const handleCategoryClick = (category: Category) => {
    const categoryName = category.name || category.title;

    if (categoryName) {
      router.push(
        `/products/?category=${encodeURIComponent(categoryName)}`
      );
    } else if (category.slug) {
      router.push(
        `/products/?category=${encodeURIComponent(category.slug)}`
      );
    } else {
      router.push(`/products/?category=${category.id}`);
    }
  };

  // ========================================
  // JSX
  // ========================================

  return (
    <motion.section
      ref={sectionRef}
      className={`
        relative isolate w-full
        bg-white
        py-8 sm:py-10 lg:py-12
        ${className}
      `}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      <div className="mx-auto w-full max-w-[1900px]">

        {/* =====================================
            SECTION HEADER
        ===================================== */}

        <motion.div
          variants={fadeInUp}
          className="
            mb-6 flex flex-col
            items-center px-4 text-center
            sm:mb-8
          "
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-7 bg-[#78836e] sm:w-10" />

            <span
              className="
                text-[8px] font-medium
                uppercase tracking-[0.25em]
                text-[#777] sm:text-[10px]
              "
            >
              Explore Our Range
            </span>

            <span className="h-px w-7 bg-[#78836e] sm:w-10" />
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
            Shop by{" "}
            <span className="text-[#55634d]">
              Category
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
            Discover Products For Every Lifestyle
          </p>
        </motion.div>

        {/* =====================================
            CAROUSEL
        ===================================== */}

        <div className="relative w-full">

          {/* PREVIOUS BUTTON */}

          {!isCategoriesLoading &&
            !isCategoriesError &&
            items.length > 0 && (
              <>
                <button
                  type="button"
                  aria-label="Previous categories"
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
                    transition-all duration-300
                    hover:bg-black
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-0
                    lg:flex xl:left-4
                  "
                >
                  <ChevronLeft
                    size={21}
                    strokeWidth={1.7}
                  />
                </button>

                {/* NEXT BUTTON */}

                <button
                  type="button"
                  aria-label="Next categories"
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
                    transition-all duration-300
                    hover:bg-black
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-0
                    lg:flex xl:right-4
                  "
                >
                  <ChevronRight
                    size={21}
                    strokeWidth={1.7}
                  />
                </button>
              </>
            )}

          {/* =====================================
              SCROLL CONTAINER
          ===================================== */}

          <div
            ref={scrollRef}
            id="category-scroll"
            onScroll={updateScrollState}
            onMouseLeave={() => setHoveredIndex(null)}
            className="
              w-full overflow-x-auto
              scroll-smooth
              snap-x snap-mandatory
              pb-6 pt-6
            "
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              scrollPaddingInline: "clamp(16px, 4vw, 40px)",
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
              style={{
                transformStyle: "preserve-3d",
              }}
            >

              {/* =====================================
                  LOADING SKELETON
              ===================================== */}

              {isCategoriesLoading ? (
                Array.from(
                  { length: 5 },
                  (_, index) => (
                    <div
                      key={index}
                      data-category-card
                      className={`
                        shrink-0 animate-pulse
                        rounded-xl bg-[#eae9e5]
                        ${cardSize}
                        ${imageSize}
                      `}
                    />
                  )
                )
              ) : isCategoriesError ? (

                /* ERROR STATE */

                <div
                  className="
                    flex min-h-[180px]
                    w-[90vw]
                    items-center justify-center
                    text-[13px] text-[#777]
                  "
                >
                  Unable to load categories.
                </div>
              ) : items.length === 0 ? (

                /* EMPTY STATE */

                <div
                  className="
                    flex min-h-[180px]
                    w-[90vw]
                    items-center justify-center
                    text-[13px] text-[#777]
                  "
                >
                  No categories available
                </div>
              ) : (

                /* CATEGORY CARDS */

                items.map((category, index) => (
                  <div
                    key={category.id ?? index}
                    data-category-card
                    className="shrink-0 snap-start"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                    onMouseEnter={() =>
                      setHoveredIndex(index)
                    }
                  >
                    <CategoryCard
                      category={category}
                      index={index}
                      hoveredIndex={hoveredIndex}
                      reduceMotion={reduceMotion}
                      isInView={isInView}
                      onClick={() =>
                        handleCategoryClick(category)
                      }
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}