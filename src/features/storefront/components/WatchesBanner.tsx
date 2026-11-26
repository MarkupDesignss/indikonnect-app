
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";

/* =========================================================
   BASE PATH CONFIGURATION
========================================================= */

const getBasePath = (): string => {
  if (typeof window === "undefined") {
    return "/indiekonnect-web";
  }

  const path = window.location.pathname || "";

  return path.startsWith("/indiekonnect-distributor")
    ? "/indiekonnect-distributor"
    : "/indiekonnect-web";
};

const getPlaceholderImage = (): string =>
  `${getBasePath()}/images/placeholder.png`;

/* =========================================================
   IMAGE URL HANDLER
========================================================= */

const IMAGE_STORAGE_URL =
  "https://www.markupdesigns.net/indikonnect/storage/";

const resolveImageUrl = (image?: string | null): string => {
  if (!image || typeof image !== "string") {
    return getPlaceholderImage();
  }

  const value = image.trim();

  if (!value) {
    return getPlaceholderImage();
  }

  // Already absolute URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Protocol-relative URL
  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  // Base64 image
  if (value.startsWith("data:image/")) {
    return value;
  }

  // Local application image
  if (
    value.startsWith("/indiekonnect-web/") ||
    value.startsWith("/indiekonnect-distributor/")
  ) {
    return value;
  }

  // API image path
  const cleanPath = value
    .replace(/^\/+/, "")
    .replace(/^storage\//i, "");

  return `${IMAGE_STORAGE_URL}${cleanPath
    .split("/")
    .map((part) => encodeURIComponent(decodeURIComponentSafe(part)))
    .join("/")}`;
};

const decodeURIComponentSafe = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/* =========================================================
   TYPES
========================================================= */

interface Subcategory {
  id: number;
  category_id: number;
  category_title?: string;
  name: string;
  slug: string;
  image: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  products_count: number;
}

interface Category {
  id: number;
  title: string;
  image: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  products_count: number;
  max_price: string;
  max_price_formatted: string;
  max_price_product: {
    id: number;
    name: string;
    product_code: string;
    retail_price: string;
    distributor_price: string;
  };
  subcategories: Subcategory[];
}

interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
  brands?: {
    id: number;
    title: string;
    products_count: number;
  }[];
  subcategories?: Subcategory[];
}

interface BannerCardProps {
  id: number;
  imageSrc: string;
  imageAlt: string;
  slug: string;
  productsCount: number;
  index: number;
  categoryTitle?: string;
}

/* =========================================================
   BANNER IMAGE
   Handles loading, broken URLs and fallback images.
========================================================= */

function BannerImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority: boolean;
}) {
  const fallback = getPlaceholderImage();

  const [currentSrc, setCurrentSrc] = useState(
    () => resolveImageUrl(src),
  );

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(resolveImageUrl(src));
    setHasError(false);
  }, [src]);

  const handleImageError = () => {
    if (hasError || currentSrc === fallback) {
      return;
    }

    setHasError(true);
    setCurrentSrc(fallback);
  };

  return (
    <Image
      src={currentSrc}
      alt={alt || "Category banner"}
      fill
      priority={priority}
      unoptimized
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
      className="
        object-cover object-center
        transition-transform duration-700 ease-out
        group-hover:scale-[1.06]
      "
      onError={handleImageError}
    />
  );
}

/* =========================================================
   BANNER CARD
========================================================= */

function BannerCard({
  id,
  imageSrc,
  imageAlt,
  slug,
  index,
}: BannerCardProps) {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams();

    if (id) {
      params.set("subcategory_ids", String(id));
    }

    if (slug) {
      params.set("subcategory", slug);
    }

    router.push(
      `${getBasePath()}/products?${params.toString()}`,
    );
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 24,
        scale: 0.97,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        min-w-0 w-full shrink-0 basis-full
        snap-center snap-always

        sm:min-w-0 sm:w-full sm:basis-auto
        sm:shrink sm:snap-align-none
      "
    >
      <div
        onClick={handleClick}
        style={{
          transformStyle: "preserve-3d",
        }}
        className="
          group relative w-full cursor-pointer
          overflow-hidden bg-[#eeeeee]

          shadow-[0_5px_18px_rgba(0,0,0,0.08)]
          ring-1 ring-black/[0.05]

          aspect-[1.8/1]
          min-[375px]:aspect-[2/1]
          sm:aspect-[2.3/1]
          md:aspect-[2.4/1]
          lg:aspect-[2.3/1]
          xl:aspect-[1.85/1]

          transition-all duration-500
          hover:-translate-y-1
          hover:shadow-[0_16px_35px_rgba(0,0,0,0.14)]
        "
      >
        {/* IMAGE */}

        <div className="absolute inset-0 overflow-hidden">
          <BannerImage
            src={imageSrc}
            alt={imageAlt}
            priority={index < 2}
          />
        </div>

        {/* OVERLAY */}

        <div className="pointer-events-none absolute inset-0" />

        {/* BOTTOM CONTENT */}

        <div
          className="
            absolute inset-x-0 bottom-0 z-10
            flex items-end justify-between gap-1

            px-2 pb-2 pt-6
            min-[375px]:px-2.5
            min-[375px]:pb-2.5

            sm:px-3 sm:pb-3
            lg:px-4 lg:pb-4
          "
        >
          <div className="min-w-0 flex-1" />

          <div
            className="
              flex shrink-0 items-center gap-1 pb-[1px]

              text-[6px] font-medium uppercase
              tracking-[0.05em] text-white/90

              min-[375px]:text-[7px]
              sm:text-[8px]
              lg:text-[9px]
            "
          >
            <span>Shop</span>

            <svg
              className="
                h-2.5 w-2.5
                transition-transform duration-300
                group-hover:translate-x-1

                sm:h-3 sm:w-3
                lg:h-3.5 lg:w-3.5
              "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function SkeletonCard() {
  return (
    <div
      className="
        relative w-full shrink-0 basis-full
        snap-center snap-always overflow-hidden
        bg-gray-100

        sm:min-w-0 sm:w-full sm:basis-auto
        sm:shrink sm:snap-align-none

        aspect-[1.8/1]
        min-[375px]:aspect-[2/1]
        sm:aspect-[2.3/1]
        md:aspect-[2.4/1]
        lg:aspect-[2.3/1]
        xl:aspect-[2.4/1]
      "
    >
      <div
        className="
          absolute inset-0 -translate-x-full
          animate-[shimmer_1.6s_infinite]
          bg-gradient-to-r
          from-transparent via-white/70 to-transparent
        "
      />
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function WatchesBanner() {
  const {
    data,
    isLoading,
    isError,
  } = useGetCategoriesQuery({});

  const response = data as CategoriesResponse | undefined;

  const categories: Category[] = response?.data || [];

  /* =======================================================
     MERGE SUBCATEGORIES
  ======================================================= */

  const nestedSubcategories: Subcategory[] = categories.flatMap(
    (category) =>
      (category.subcategories || []).map((subcategory) => ({
        ...subcategory,
        category_title: category.title,
      })),
  );

  const topLevelSubcategories: Subcategory[] =
    response?.subcategories || [];

  const allSubcategories: Subcategory[] = [
    ...nestedSubcategories,
    ...topLevelSubcategories,
  ]
    .filter(
      (subcategory) => subcategory.status === true,
    )
    .filter(
      (subcategory, index, self) =>
        index ===
        self.findIndex(
          (item) => item.id === subcategory.id,
        ),
    );

  /* =======================================================
     CATEGORY SORTING
  ======================================================= */

  const himKeywords = ["him", "men", "male"];

  const herKeywords = ["her", "women", "female"];

  const matchesKeyword = (
    subcategory: Subcategory,
    keywords: string[],
  ) => {
    const name = subcategory.name?.toLowerCase() || "";
    const slug = subcategory.slug?.toLowerCase() || "";

    return keywords.some(
      (keyword) =>
        name.includes(keyword) ||
        slug.includes(keyword),
    );
  };

  const himSubcategories = allSubcategories.filter(
    (subcategory) =>
      matchesKeyword(subcategory, himKeywords),
  );

  const herSubcategories = allSubcategories.filter(
    (subcategory) =>
      !matchesKeyword(subcategory, himKeywords) &&
      matchesKeyword(subcategory, herKeywords),
  );

  const otherSubcategories = allSubcategories.filter(
    (subcategory) =>
      !matchesKeyword(subcategory, himKeywords) &&
      !matchesKeyword(subcategory, herKeywords),
  );

  const sortedSubcategories = [
    ...himSubcategories,
    ...herSubcategories,
    ...otherSubcategories,
  ];

  const displayedSubcategories =
    sortedSubcategories.slice(0, 2);

  /* =======================================================
     MOBILE CAROUSEL
  ======================================================= */

  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const [isPaused, setIsPaused] = useState(false);

  /* AUTO SCROLL */

  useEffect(() => {
    if (displayedSubcategories.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (isPaused) {
        return;
      }

      const element = scrollRef.current;

      if (!element) {
        return;
      }

      const nextIndex =
        (activeIndex + 1) %
        displayedSubcategories.length;

      element.scrollTo({
        left: nextIndex * element.clientWidth,
        behavior: "smooth",
      });

      setActiveIndex(nextIndex);
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    activeIndex,
    isPaused,
    displayedSubcategories.length,
  ]);

  /* SCROLL POSITION */

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const onScroll = () => {
      if (!element.clientWidth) {
        return;
      }

      const index = Math.round(
        element.scrollLeft / element.clientWidth,
      );

      setActiveIndex((previous) =>
        previous !== index ? index : previous,
      );
    };

    element.addEventListener(
      "scroll",
      onScroll,
      { passive: true },
    );

    return () => {
      element.removeEventListener(
        "scroll",
        onScroll,
      );
    };
  }, []);

  /* RESIZE HANDLING */

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    let raf = 0;

    const onResize = () => {
      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        element.scrollTo({
          left: activeIndex * element.clientWidth,
          behavior: "auto",
        });
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [activeIndex]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <section
        className="
          w-full bg-white
          py-4 sm:py-7 lg:py-10
          px-[clamp(12px,4vw,40px)]
        "
      >
        <div
          className="
            mx-auto w-full max-w-[min(100%,1400px)]

            flex gap-0 overflow-x-auto
            snap-x snap-mandatory

            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            sm:grid sm:grid-cols-2
            sm:gap-4 sm:overflow-visible

            md:gap-5
            lg:gap-6
          "
        >
          {[1, 2].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      </section>
    );
  }

  /* =======================================================
     ERROR / EMPTY STATE
  ======================================================= */

  if (
    isError ||
    displayedSubcategories.length === 0
  ) {
    return null;
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <section
      className="
        w-full bg-white
        py-4 sm:py-7 lg:py-10
        px-[clamp(12px,4vw,40px)]
      "
    >
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="
          mx-auto w-full max-w-[min(100%,1400px)]

          flex gap-0 overflow-x-auto
          snap-x snap-mandatory scroll-smooth

          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden

          sm:grid sm:grid-cols-2
          sm:gap-4 sm:overflow-visible

          md:gap-5
          lg:gap-6
        "
      >
        {displayedSubcategories.map(
          (subcategory, index) => (
            <BannerCard
              key={subcategory.id}
              id={subcategory.id}
              imageSrc={subcategory.image}
              imageAlt={subcategory.name}
              slug={subcategory.slug}
              productsCount={subcategory.products_count}
              categoryTitle={subcategory.category_title}
              index={index}
            />
          ),
        )}
      </div>

      {/* MOBILE DOTS */}

      <div
        className="
          mt-3 flex items-center
          justify-center gap-2 sm:hidden
        "
      >
        {displayedSubcategories.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              const element = scrollRef.current;

              if (!element) {
                return;
              }

              element.scrollTo({
                left: index * element.clientWidth,
                behavior: "smooth",
              });

              setActiveIndex(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={
              index === activeIndex ? "true" : undefined
            }
            className={`
              h-1.5 rounded-full
              transition-all duration-300

              ${
                index === activeIndex
                  ? "w-6 bg-black/80"
                  : "w-1.5 bg-black/25"
              }
            `}
          />
        ))}
      </div>
    </section>
  );
}

export default React.memo(WatchesBanner);
