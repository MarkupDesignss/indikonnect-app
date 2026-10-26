"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

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

type CategoriesResponse = { data?: Category[] | { data?: Category[] } };

export interface ShopByCategoryProps {
  categories?: Category[];
  categoriesData?: CategoriesResponse | Category[] | null;
  isCategoriesLoading?: boolean;
  isCategoriesError?: boolean;
  className?: string;
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const cardSize =
  "w-[185px] sm:w-[225px] md:w-[245px] lg:w-[265px] xl:w-[285px]";
const imageSize =
  "h-[280px] sm:h-[335px] md:h-[365px] lg:h-[405px] xl:h-[430px]";

function CategoryCard({
  category,
  index,
  onClick,
}: {
  category: Category;
  index: number;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  const imageUrl =
    category.image_url?.trim() ||
    category.image?.trim() ||
    category.banner?.trim() ||
    category.logo?.trim() ||
    "";

  const displayTexts =
    category.categoryData && category.categoryData.length > 0
      ? category.categoryData
      : [category.name || category.title || "Category", "Shop now"];

  const primaryText = displayTexts[0] || "Category";
  const secondaryText = displayTexts[1] || "Shop now";

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <motion.div variants={fadeInUp} className={`group shrink-0 ${cardSize}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label={`Explore ${primaryText}`}
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-[22px] bg-[#e9e8e2] text-center ring-1 ring-black/5 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-18px_rgba(30,40,25,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#55634d] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt=""
            loading={index < 2 ? "eager" : "lazy"}
            decoding="async"
            onError={() => setImageError(true)}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#dfe4d8] via-[#cfd6c4] to-[#b9c3ab]">
            <span className="font-serif text-7xl text-[#55634d]/40">
              {primaryText.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-opacity duration-500 group-hover:from-[#2a3524]/85" />

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-md transition-colors duration-500 group-hover:bg-white/25">
          <div className="min-w-0 flex-1 text-left">
            <h3 className="truncate text-[15px] font-medium leading-tight text-white sm:text-base">
              {primaryText}
            </h3>
            <p className="mt-0.5 truncate text-[11px] text-white/70 transition-all duration-500 sm:text-xs">
              {secondaryText}
            </p>
          </div>
          {/* Card arrow — hover pe black */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2b2b2b] transition-all duration-500 group-hover:rotate-45 group-hover:bg-black group-hover:text-white motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
            <ArrowUpRight size={17} strokeWidth={1.8} />
          </span>
        </div>
      </button>
    </motion.div>
  );
}

export default function ShopByCategory({
  categories,
  categoriesData,
  isCategoriesLoading = false,
  isCategoriesError = false,
  className = "",
}: ShopByCategoryProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const items = useMemo(() => {
    if (categories) return categories;
    if (Array.isArray(categoriesData)) return categoriesData;
    const data = categoriesData?.data;
    if (Array.isArray(data)) return data;
    if (data && !Array.isArray(data) && Array.isArray(data.data)) return data.data;
    return [];
  }, [categories, categoriesData]);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 2
    );
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);
    if (element.firstElementChild) resizeObserver.observe(element.firstElementChild);
    return () => resizeObserver.disconnect();
  }, [items, isCategoriesLoading, updateScrollState]);

  const scrollCards = (direction: -1 | 1) => {
    const element = scrollRef.current;
    if (!element) return;
    const card = element.querySelector<HTMLElement>("[data-category-card]");
    const row = element.firstElementChild;
    const gap = row ? parseFloat(getComputedStyle(row).columnGap) || 16 : 16;
    element.scrollBy({
      left: direction * ((card?.offsetWidth || 265) + gap),
      behavior: "smooth",
    });
  };

  const handleCategoryClick = (category: Category) => {
    const categoryName = category.name || category.title;

    if (categoryName) {
      router.push(`/products/?category=${encodeURIComponent(categoryName)}`);
    } else if (category.slug) {
      router.push(`/products/?category=${encodeURIComponent(category.slug)}`);
    } else {
      router.push(`/products/?category=${category.id}`);
    }
  };

  return (
    <motion.section
      className={`relative isolate w-full bg-white py-8 sm:py-10 lg:py-12 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={staggerContainer}
    >
      <div className="mx-auto w-full max-w-[1900px]">
        <motion.div
          variants={fadeInUp}
          className="mb-6 flex flex-col items-center px-4 text-center sm:mb-8"
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-7 bg-[#78836e] sm:w-10" />
            <span className="text-[8px] font-medium uppercase tracking-[0.25em] text-[#777] sm:text-[10px]">
              Explore Our Range
            </span>
            <span className="h-px w-7 bg-[#78836e] sm:w-10" />
          </div>
          <h2 className="font-serif text-[28px] font-normal leading-[1.15] tracking-[-0.035em] text-[#171717] sm:text-[34px] lg:text-[40px]">
            Shop by <span className="text-[#55634d]">Category</span>
          </h2>
          <p className="mt-2 text-[8px] font-medium uppercase tracking-[0.20em] text-[#888] sm:text-[10px] sm:tracking-[0.25em]">
            Discover Products For Every Lifestyle
          </p>
        </motion.div>

        <div className="relative w-full">
          {!isCategoriesLoading && !isCategoriesError && items.length > 0 && (
            <>
              {/* Prev arrow — hover pe black */}
              <button
                type="button"
                aria-label="Previous categories"
                onClick={() => scrollCards(-1)}
                disabled={!canScrollLeft}
                className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#111] shadow-[0_5px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-0 lg:flex xl:left-4"
              >
                <ChevronLeft size={21} strokeWidth={1.7} />
              </button>
              {/* Next arrow — hover pe black */}
              <button
                type="button"
                aria-label="Next categories"
                onClick={() => scrollCards(1)}
                disabled={!canScrollRight}
                className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#111] shadow-[0_5px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-0 lg:flex xl:right-4"
              >
                <ChevronRight size={21} strokeWidth={1.7} />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            id="category-scroll"
            onScroll={updateScrollState}
            className="w-full overflow-x-auto scroll-smooth snap-x snap-mandatory pb-5 pt-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              scrollPaddingInline: "clamp(16px, 4vw, 40px)",
            }}
          >
            <div className="mx-auto flex w-max items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:gap-5 lg:px-10">
              {isCategoriesLoading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    data-category-card
                    className={`shrink-0 animate-pulse rounded-xl bg-[#eae9e5] ${cardSize} ${imageSize}`}
                  />
                ))
              ) : isCategoriesError ? (
                <div className="flex min-h-[180px] w-[90vw] items-center justify-center text-[13px] text-[#777]">
                  Unable to load categories.
                </div>
              ) : items.length === 0 ? (
                <div className="flex min-h-[180px] w-[90vw] items-center justify-center text-[13px] text-[#777]">
                  No categories available
                </div>
              ) : (
                items.map((category, index) => (
                  <div
                    key={category.id ?? index}
                    data-category-card
                    className="shrink-0 snap-start"
                  >
                    <CategoryCard
                      category={category}
                      index={index}
                      onClick={() => handleCategoryClick(category)}
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