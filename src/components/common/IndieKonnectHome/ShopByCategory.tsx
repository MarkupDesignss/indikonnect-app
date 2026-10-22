"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const title = category.name || category.title || "Category";

  useEffect(() => setImageError(false), [imageUrl]);

  return (
    <motion.div variants={fadeInUp} className={`group shrink-0 ${cardSize}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label={`Explore ${title}`}
        className="block w-full overflow-hidden rounded-xl bg-[#f3f2ee] text-left shadow-[0_4px_18px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.13)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#55634d]"
      >
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={title}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              onError={() => setImageError(true)}
              className="absolute inset-0 h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#f3f2ee]" />
          )}
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

  // ✅ FIXED REDIRECT LOGIC HERE
  const handleCategoryClick = (category: Category) => {
    const categoryName = category.name || category.title;
    
    if (categoryName) {
      // Aapke format ke hisaab se URL build kiya
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
        {/* Heading Section */}
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

        {/* Cards Section */}
        <div className="relative w-full">
          {!isCategoriesLoading && !isCategoriesError && items.length > 0 && (
            <>
              <button
                type="button"
                aria-label="Previous categories"
                onClick={() => scrollCards(-1)}
                disabled={!canScrollLeft}
                className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#111] shadow-[0_5px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-[#111] hover:text-white disabled:cursor-not-allowed disabled:opacity-0 lg:flex xl:left-4"
              >
                <ChevronLeft size={21} strokeWidth={1.7} />
              </button>
              <button
                type="button"
                aria-label="Next categories"
                onClick={() => scrollCards(1)}
                disabled={!canScrollRight}
                className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#111] shadow-[0_5px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-[#111] hover:text-white disabled:cursor-not-allowed disabled:opacity-0 lg:flex xl:right-4"
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