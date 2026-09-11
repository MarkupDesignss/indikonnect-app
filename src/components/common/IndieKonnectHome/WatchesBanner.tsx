"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";

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
  brands?: { id: number; title: string; products_count: number }[];
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
   BANNER CARD
========================================================= */

function BannerCard({
  id,
  imageSrc,
  imageAlt,
  slug,
  productsCount,
  index,
  categoryTitle,
}: BannerCardProps) {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams();
    if (id) params.set("subcategory_ids", String(id));
    if (slug) params.set("subcategory", slug);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        min-w-0 w-full shrink-0 basis-full
        snap-start snap-always

        sm:shrink sm:basis-auto sm:w-auto sm:snap-align-none
      "
    >
      <div
        onClick={handleClick}
        style={{ transformStyle: "preserve-3d" }}
        className="
          group relative w-full cursor-pointer overflow-hidden
          bg-[#eeeeee]
          shadow-[0_5px_18px_rgba(0,0,0,0.08)]
          ring-1 ring-black/[0.05]

          /* MOBILE */
          aspect-[1.8/1]
          min-h-[110px]

          /* 375px+ */
          min-[375px]:aspect-[2/1]
          min-[375px]:min-h-[120px]

          /* SMALL TABLET */
          sm:aspect-[2.5/1]
          sm:min-h-[150px]

          /* TABLET */
          md:aspect-[2.5/1]
          md:min-h-[180px]

          /* DESKTOP — height thodi badhi */
          lg:aspect-[2.2/1]
          lg:min-h-[300px]

          /* LARGE DESKTOP */
          xl:aspect-[2.3/1]
          xl:min-h-[340px]

          transition-all duration-500
          hover:-translate-y-1
          hover:shadow-[0_16px_35px_rgba(0,0,0,0.14)]
        "
      >
        {/* IMAGE */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={imageSrc || "/images/placeholder.png"}
            alt={imageAlt || "Banner"}
            fill
            priority={index < 2}
            sizes="(max-width: 640px) 100vw, 50vw"
            className="
              object-cover object-center
              transition-transform duration-700 ease-out
              group-hover:scale-[1.06]
            "
            onError={(event) => {
              event.currentTarget.src = "/images/placeholder.png";
            }}
          />
        </div>

        {/* OVERLAY */}
        <div
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-t from-black/80 via-black/30 to-black/5
          "
        />

        {/* TOP CATEGORY */}
        {categoryTitle && (
          <div className="absolute left-2 top-2 z-10 sm:left-3 sm:top-3 lg:left-4 lg:top-4">
            <span
              className="
                inline-flex max-w-[70vw] truncate
                rounded-full border border-white/20
                bg-black/20 px-2 py-1
                text-[6px] font-medium uppercase tracking-[0.10em]
                text-white backdrop-blur-md

                min-[375px]:text-[7px]

                sm:px-2.5 sm:text-[8px]

                lg:px-3 lg:py-1.5 lg:text-[9px]
              "
            >
              {categoryTitle}
            </span>
          </div>
        )}

        {/* BOTTOM CONTENT */}
        <div
          className="
            absolute inset-x-0 bottom-0 z-10
            flex items-end justify-between gap-1
            px-2 pb-2 pt-6

            min-[375px]:px-2.5 min-[375px]:pb-2.5

            sm:px-3 sm:pb-3

            lg:px-4 lg:pb-4
          "
        >
          <div className="min-w-0 flex-1" />

          <div
            className="
              flex shrink-0 items-center gap-1 pb-[1px]
              text-[6px] font-medium uppercase tracking-[0.05em]
              text-white/90

              min-[375px]:text-[7px]

              sm:text-[8px]

              lg:text-[9px]
            "
          >
            <span>Shop</span>
            <svg
              className="
                h-2.5 w-2.5 transition-transform duration-300
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
        snap-start snap-always
        overflow-hidden bg-gray-100

        aspect-[1.8/1]
        min-h-[110px]

        min-[375px]:aspect-[2/1]
        min-[375px]:min-h-[120px]

        sm:aspect-[2.5/1]
        sm:basis-auto sm:shrink sm:snap-align-none
        sm:min-h-[150px]

        md:aspect-[2.5/1]
        md:min-h-[180px]

        lg:aspect-[2.2/1]
        lg:min-h-[300px]

        xl:aspect-[2.3/1]
        xl:min-h-[340px]
      "
    >
      <div
        className="
          absolute inset-0 -translate-x-full
          animate-[shimmer_1.6s_infinite]
          bg-gradient-to-r from-transparent via-white/70 to-transparent
        "
      />
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function WatchesBanner() {
  const { data, isLoading, isError } = useGetCategoriesQuery({});

  const response = data as CategoriesResponse | undefined;
  const categories: Category[] = response?.data || [];

  /* ---------- combine subcategories ---------- */
  const nestedSubcategories: Subcategory[] = categories.flatMap((category) =>
    (category.subcategories || []).map((subcategory) => ({
      ...subcategory,
      category_title: category.title,
    })),
  );

  const topLevelSubcategories: Subcategory[] = response?.subcategories || [];

  const allSubcategories: Subcategory[] = [
    ...nestedSubcategories,
    ...topLevelSubcategories,
  ]
    .filter((subcategory) => subcategory.status === true)
    .filter(
      (subcategory, index, self) =>
        index === self.findIndex((item) => item.id === subcategory.id),
    );

  /* ---------- priority: him → her → others ---------- */
  const himKeywords = ["him", "men", "male"];
  const herKeywords = ["her", "women", "female"];

  const matchesKeyword = (subcategory: Subcategory, keywords: string[]) => {
    const name = subcategory.name?.toLowerCase() || "";
    const slug = subcategory.slug?.toLowerCase() || "";
    return keywords.some(
      (keyword) => name.includes(keyword) || slug.includes(keyword),
    );
  };

  const himSubcategories = allSubcategories.filter((sub) =>
    matchesKeyword(sub, himKeywords),
  );

  const herSubcategories = allSubcategories.filter(
    (sub) =>
      !matchesKeyword(sub, himKeywords) && matchesKeyword(sub, herKeywords),
  );

  const otherSubcategories = allSubcategories.filter(
    (sub) =>
      !matchesKeyword(sub, himKeywords) && !matchesKeyword(sub, herKeywords),
  );

  const sortedSubcategories = [
    ...himSubcategories,
    ...herSubcategories,
    ...otherSubcategories,
  ];

  const displayedSubcategories = sortedSubcategories.slice(0, 2);

  /* =======================================================
     AUTO SCROLL CAROUSEL (mobile only)
  ======================================================= */

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (displayedSubcategories.length < 2) return;

    const id = setInterval(() => {
      if (isPaused) return;
      const el = scrollRef.current;
      if (!el) return;

      const nextIndex = (activeIndex + 1) % displayedSubcategories.length;
      el.scrollTo({
        left: nextIndex * el.clientWidth,
        behavior: "smooth",
      });
      setActiveIndex(nextIndex);
    }, 3000);

    return () => clearInterval(id);
  }, [activeIndex, isPaused, displayedSubcategories.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIndex(index);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <section className="w-full bg-white py-4 sm:px-5 sm:py-7 lg:px-8 lg:py-10 xl:px-10">
        <div
          className="
            mx-auto w-full

            flex gap-0 overflow-x-auto snap-x snap-mandatory
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible
            sm:max-w-7xl
            lg:gap-6 lg:max-w-[1500px]
            xl:max-w-[1600px]
          "
        >
          {[1, 2].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      </section>
    );
  }

  if (isError || displayedSubcategories.length === 0) {
    return null;
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="w-full bg-white py-4 sm:px-5 sm:py-7 md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-10">
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="
          mx-auto w-full

          flex gap-0 overflow-x-auto snap-x snap-mandatory scroll-smooth
          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden

          sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible
          sm:max-w-7xl
          md:gap-6
          lg:gap-7 lg:max-w-[1500px]
          xl:max-w-[1600px]
        "
      >
        {displayedSubcategories.map((subcategory, index) => (
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
        ))}
      </div>

      {/* MOBILE DOTS */}
      <div className="mt-3 flex items-center justify-center gap-2 sm:hidden">
        {displayedSubcategories.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              el.scrollTo({
                left: i * el.clientWidth,
                behavior: "smooth",
              });
              setActiveIndex(i);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={`
              h-1.5 rounded-full transition-all duration-300
              ${i === activeIndex ? "w-6 bg-black/80" : "w-1.5 bg-black/25"}
            `}
          />
        ))}
      </div>
    </section>
  );
}
