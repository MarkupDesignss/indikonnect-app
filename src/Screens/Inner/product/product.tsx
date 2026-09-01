"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, ChevronDown, X, ChevronLeft, ChevronRight } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/product/FilterSidebar";
import Newsletter from "@/components/product/Newsletter";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/common/Header";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/Profile/userApi";

import BannerImage from "../../../../public/indiekonnect-web/images/Bannerimage.png";

// ==================== TYPES ====================

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  availability: {
    inStock: boolean;
    outOfStock: boolean;
  };
}

interface Category {
  id: number;
  title: string;
  slug: string;
  name?: string;
}

type SortOption = "recommended" | "price-low" | "price-high" | "newest";

// ==================== CONSTANTS ====================

const PRODUCTS_PER_PAGE = 12;
const MAX_PRICE_LIMIT = 8000;
const VISIBLE_PAGES = 5;
const SKELETON_COUNT = 8;

const SORT_LABELS: Record<SortOption, string> = {
  recommended: "Recommended",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  newest: "Newest",
};

// ==================== HELPER FUNCTIONS ====================

const getProductPrice = (product: any, userType?: string) => {
  if (!product) return 0;

  if (userType === "distributor") {
    return Number(product.distributor_price || product.retail_price || 0);
  }

  return Number(product.retail_price || 0);
};

const getProductMrp = (product: any, userType?: string) => {
  if (!product) return 0;

  if (userType === "distributor") {
    return Number(product.distributor_mrp || product.retail_mrp || 0);
  }

  return Number(product.retail_mrp || 0);
};

const getDiscountPercentage = (product: any, userType?: string) => {
  if (!product) return 0;

  const mrp = getProductMrp(product, userType);

  const price = getProductPrice(product, userType);

  if (mrp > 0 && price > 0 && mrp > price) {
    return Math.round(((mrp - price) / mrp) * 100);
  }

  return 0;
};

// ==================== MAIN COMPONENT ====================

export default function ProductsPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==================== USER PROFILE ====================

  const { data: userProfile } = useGetUserProfileQuery({});

  const userType = userProfile?.user?.account_type || "customer";

  // ==================== NEW ARRIVALS ====================

  const isNewArrivals = searchParams.get("new-arrivals") === "true";

  // ==================== FILTER STATE ====================

  const [filters, setFilters] = useState<FilterState>(() => ({
    categories: searchParams.get("category")?.split(",").filter(Boolean) || [],

    priceRange: [
      parseInt(searchParams.get("min_price") || "0", 10),
      parseInt(searchParams.get("max_price") || String(MAX_PRICE_LIMIT), 10),
    ],

    availability: {
      inStock: searchParams.get("in_stock") === "true",

      outOfStock: searchParams.get("out_of_stock") === "true",
    },
  }));

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );

  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "recommended",
  );

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  // ==================== MOBILE FILTER DRAWER ====================

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ==================== CATEGORIES ====================

  const { data: categoriesData } = useGetCategoriesQuery({});

  // ==================== CATEGORY ID MAP ====================

  const categoryIdMap = useMemo(() => {
    const map = new Map<string, number>();

    categoriesData?.data?.forEach((cat: Category) => {
      map.set(cat.title, cat.id);
    });

    return map;
  }, [categoriesData]);

  // ==================== SYNC CATEGORIES FROM URL ====================

  useEffect(() => {
    const categoryParam = searchParams.get("category");

    if (!categoryParam || !categoriesData?.data) {
      return;
    }

    const urlCategories = categoryParam
      .split(",")
      .map((category) => decodeURIComponent(category).trim())
      .filter(Boolean);

    const validCategories = urlCategories.filter((categoryTitle) =>
      categoriesData.data.some(
        (category: Category) => category.title === categoryTitle,
      ),
    );

    setFilters((prev) => {
      const sameCategories =
        prev.categories.length === validCategories.length &&
        prev.categories.every((category) => validCategories.includes(category));

      if (sameCategories) {
        return prev;
      }

      return {
        ...prev,
        categories: validCategories,
      };
    });
  }, [searchParams, categoriesData]);

  // ==================== SYNC SEARCH + PAGE ====================

  useEffect(() => {
    const search = searchParams.get("search") || "";

    const page = parseInt(searchParams.get("page") || "1", 10);

    setSearchQuery((prev) => (prev === search ? prev : search));

    setCurrentPage((prev) => (prev === page ? prev : page));
  }, [searchParams]);

  // ==================== BUILD API QUERY ====================

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: currentPage,
      per_page: PRODUCTS_PER_PAGE,
      is_published: 1,
    };

    if (isNewArrivals) {
      params.new_arrivals = true;
    }

    // ==================== CATEGORIES ====================

    if (filters.categories.length > 0) {
      const categoryIds = filters.categories
        .map((title) => categoryIdMap.get(title))
        .filter((id): id is number => id !== undefined)
        .join(",");

      if (categoryIds) {
        params.category_ids = categoryIds;
      }
    }

    // ==================== PRICE RANGE ====================

    if (filters.priceRange[0] > 0) {
      params.min_price = filters.priceRange[0];
    }

    if (filters.priceRange[1] < MAX_PRICE_LIMIT) {
      params.max_price = filters.priceRange[1];
    }

    // ==================== STOCK ====================

    if (filters.availability.inStock && !filters.availability.outOfStock) {
      params.stock_status = "in_stock";
    } else if (
      !filters.availability.inStock &&
      filters.availability.outOfStock
    ) {
      params.stock_status = "out_of_stock";
    }

    // ==================== SEARCH ====================

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    // ==================== SORT ====================

    switch (sortBy) {
      case "price-low":
        params.sort_by = "retail_price";
        params.sort_direction = "asc";
        break;

      case "price-high":
        params.sort_by = "retail_price";
        params.sort_direction = "desc";
        break;

      case "newest":
        params.sort_by = "created_at";
        params.sort_direction = "desc";
        break;

      case "recommended":
      default:
        break;
    }

    return params;
  }, [currentPage, filters, searchQuery, sortBy, categoryIdMap, isNewArrivals]);

  // ==================== FETCH PRODUCTS ====================

  const {
    data: productsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetProductsQuery(queryParams);

  // ==================== TRANSFORM PRODUCTS ====================

  const products = useMemo(() => {
    if (!productsData?.data) {
      return [];
    }

    return productsData.data.map((product: any) => {
      const price = getProductPrice(product, userType);

      const mrp = getProductMrp(product, userType);

      const discount = getDiscountPercentage(product, userType);

      return {
        id: product.id,

        name: product.name,

        slug: product.slug,

        category: product.category?.name || "Uncategorized",

        price,

        originalPrice: mrp > price ? mrp : null,

        discount: discount > 0 ? discount : null,

        image: product.primary_image_url || "/images/placeholder.jpg",

        rating: 4.5,

        reviews: 120,

        inStock:
          product.stock_status === "active" && product.stock_quantity > 0,

        userType,
      };
    });
  }, [productsData, userType]);

  // ==================== URL SYNC ====================

  useEffect(() => {
    const params = new URLSearchParams();

    // ==================== NEW ARRIVALS ====================

    if (isNewArrivals) {
      params.set("new-arrivals", "true");
    }

    // ==================== CATEGORIES ====================

    if (filters.categories.length > 0) {
      params.set("category", filters.categories.join(","));
    }

    // ==================== PRICE ====================

    if (filters.priceRange[0] > 0) {
      params.set("min_price", filters.priceRange[0].toString());
    }

    if (filters.priceRange[1] < MAX_PRICE_LIMIT) {
      params.set("max_price", filters.priceRange[1].toString());
    }

    // ==================== STOCK ====================

    if (filters.availability.inStock) {
      params.set("in_stock", "true");
    }

    if (filters.availability.outOfStock) {
      params.set("out_of_stock", "true");
    }

    // ==================== SEARCH ====================

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    // ==================== SORT ====================

    if (sortBy !== "recommended") {
      params.set("sort", sortBy);
    }

    // ==================== PAGE ====================

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    const queryString = params.toString();

    const newUrl = queryString ? `/products?${queryString}` : "/products";

    const currentUrl = `/products${searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;

    if (newUrl !== currentUrl) {
      router.replace(newUrl, {
        scroll: false,
      });
    }
  }, [
    filters,
    searchQuery,
    sortBy,
    currentPage,
    isNewArrivals,
    router,
    searchParams,
  ]);

  // ==================== FILTER HANDLER ====================

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);

    setCurrentPage(1);
  }, []);

  // ==================== SEARCH ====================

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    setCurrentPage(1);
  }, []);

  // ==================== SORT ====================

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, []);

  // ==================== PAGINATION ====================

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // ==================== CLEAR FILTERS ====================

  const handleClearFilters = useCallback(() => {
    setFilters({
      categories: [],

      priceRange: [0, MAX_PRICE_LIMIT],

      availability: {
        inStock: false,
        outOfStock: false,
      },
    });

    setSearchQuery("");

    setSortBy("recommended");

    setCurrentPage(1);

    router.replace("/products", {
      scroll: false,
    });
  }, [router]);

  // ==================== PAGINATION HELPERS ====================

  const getPaginationPages = useMemo(() => {
    const lastPage = productsData?.pagination?.last_page ||
      productsData?.meta?.last_page || 0;

    if (lastPage <= 1) {
      return [];
    }

    const pages: number[] = [];

    if (lastPage <= VISIBLE_PAGES) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= VISIBLE_PAGES; i++) {
        pages.push(i);
      }
    } else if (currentPage >= lastPage - 2) {
      for (let i = lastPage - VISIBLE_PAGES + 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [productsData?.pagination?.last_page, productsData?.meta?.last_page, currentPage]);

  // ==================== SKELETON ====================

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 md:gap-5">
      {Array.from({
        length: SKELETON_COUNT,
      }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-[#ece9e2] bg-white"
          aria-label="Loading product"
        >
          <div className="h-64 w-full animate-pulse bg-gray-200" />

          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />

            <div className="h-5 w-4/5 animate-pulse rounded bg-gray-200" />

            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />

            <div className="flex items-center justify-between">
              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />

              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ==================== ERROR ====================

  const renderError = () => (
    <div
      className="py-12 text-center"
      style={{ fontFamily: "Lato, sans-serif" }}
      role="alert"
    >
      <div className="mb-4 text-4xl text-red-500" aria-hidden="true">
        ⚠️
      </div>

      <h3 className="mb-2 text-lg font-semibold text-[#111111]">
        Failed to load products
      </h3>

      <p className="mb-4 text-[#8b918f]">Please try refreshing the page</p>

      <button
        onClick={() => refetch()}
        className="rounded-lg bg-[#111111] px-4 py-2 text-white transition-all duration-300 hover:bg-black/80"
        aria-label="Retry loading products"
      >
        Retry
      </button>
    </div>
  );

  // ==================== PRODUCT GRID ====================

  const renderProductGrid = () => (
    <motion.div
      className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 md:gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key={currentPage}
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );

  // ==================== EMPTY ====================

  const renderEmptyState = () => (
    <div
      className="py-12 text-center"
      style={{ fontFamily: "Lato, sans-serif" }}
    >
      <div className="mb-4 text-6xl" aria-hidden="true">
        🔍
      </div>

      <p className="text-lg text-[#8b918f]">
        No products found matching your criteria
      </p>

      <button
        onClick={handleClearFilters}
        className="mt-4 font-medium text-[#111111] underline underline-offset-4 transition-colors hover:text-black/70"
      >
        Clear all filters
      </button>
    </div>
  );

  // ==================== PAGINATION ====================

  const renderPagination = () => {
    const total = productsData?.pagination?.total ||
      productsData?.meta?.total || 0;
    const lastPage = productsData?.pagination?.last_page ||
      productsData?.meta?.last_page || 0;
    const currentPageNum = productsData?.pagination?.current_page ||
      productsData?.meta?.current_page ||
      currentPage;

    if (isLoading || isFetching || lastPage <= 1 || total === 0) {
      return null;
    }

    const pages = getPaginationPages;
    const hasPrevious = currentPageNum > 1;
    const hasNext = currentPageNum < lastPage;

    return (
      <div className="mt-10 flex flex-col items-center gap-4">
        {/* Page info */}
        <div
          className="text-sm text-[#8b918f]"
          style={{ fontFamily: "Lato, sans-serif" }}
        >
          Page {currentPageNum} of {lastPage}
        </div>

        {/* Pagination buttons */}
        <nav
          className="flex items-center gap-1.5"
          style={{ fontFamily: "Lato, sans-serif" }}
          aria-label="Pagination"
        >
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPageNum - 1)}
            disabled={!hasPrevious}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300 ${hasPrevious
                ? "border-[#ece9e2] text-[#111111] hover:bg-[#111111] hover:text-white"
                : "cursor-not-allowed border-[#f0f0f0] text-[#c5c5c5]"
              }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* First page */}
          {pages.length > 0 && pages[0] > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className={`flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-[#ece9e2] px-3 text-sm font-medium text-[#111111] transition-all duration-300 hover:bg-[#111111] hover:text-white`}
                aria-label="Go to first page"
              >
                1
              </button>
              {pages[0] > 2 && (
                <span className="flex h-10 w-10 items-center justify-center text-[#8b918f]">
                  …
                </span>
              )}
            </>
          )}

          {/* Page numbers */}
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`flex h-10 min-w-[40px] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-all duration-300 ${currentPageNum === page
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#ece9e2] text-[#111111] hover:bg-[#111111] hover:text-white"
                }`}
              aria-label={`Go to page ${page}`}
              aria-current={currentPageNum === page ? "page" : undefined}
            >
              {page}
            </button>
          ))}

          {/* Last page */}
          {pages.length > 0 && pages[pages.length - 1] < lastPage && (
            <>
              {pages[pages.length - 1] < lastPage - 1 && (
                <span className="flex h-10 w-10 items-center justify-center text-[#8b918f]">
                  …
                </span>
              )}
              <button
                onClick={() => handlePageChange(lastPage)}
                className={`flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-[#ece9e2] px-3 text-sm font-medium text-[#111111] transition-all duration-300 hover:bg-[#111111] hover:text-white`}
                aria-label="Go to last page"
              >
                {lastPage}
              </button>
            </>
          )}

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPageNum + 1)}
            disabled={!hasNext}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300 ${hasNext
                ? "border-[#ece9e2] text-[#111111] hover:bg-[#111111] hover:text-white"
                : "cursor-not-allowed border-[#f0f0f0] text-[#c5c5c5]"
              }`}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>

        {/* Results info */}
        {total > 0 && (
          <div
            className="text-xs text-[#8b918f]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            Showing {((currentPageNum - 1) * PRODUCTS_PER_PAGE) + 1}–{Math.min(currentPageNum * PRODUCTS_PER_PAGE, total)} of {total} products
          </div>
        )}
      </div>
    );
  };

  // ==================== ANIMATIONS ====================

  const bannerVariants = {
    hidden: {
      opacity: 0,
      scale: 1.1,
    },

    visible: {
      opacity: 1,
      scale: 1,

      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,

      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  // ==================== COUNTS ====================

  const totalProducts = productsData?.pagination?.total ||
    productsData?.meta?.total ||
    products.length;

  const startProduct =
    products.length > 0 ? (currentPage - 1) * PRODUCTS_PER_PAGE + 1 : 0;

  const endProduct =
    products.length > 0
      ? Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)
      : 0;

  // ==================== RENDER ====================

  return (
    <div>
      <Header />

      {/* ==================== BANNER ==================== */}

      {/* <motion.div
        className="relative h-[120px] w-full overflow-hidden sm:h-[150px] md:h-[180px] lg:h-[200px]"
        variants={
          bannerVariants
        }
        initial="hidden"
        animate="visible"
      >
        <Image
          src={
            BannerImage
          }
          alt="Collections Banner"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-[#0A1628]/80 via-[#0A1628]/50 to-transparent">
          <div className="w-full px-4 md:px-12 lg:px-16">
            <div className="max-w-2xl">
              <motion.h2
                className="mb-2 text-2xl font-bold text-white md:mb-4 md:text-4xl lg:text-5xl"
                style={{
                  fontFamily:
                    "Lato, sans-serif",
                }}
                initial={{
                  opacity: 0,
                  x: -30,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.7,
                }}
              >
                Premium
                Collection
                ✨
              </motion.h2>

              <motion.p
                className="mb-4 text-sm text-white/80 md:mb-6"
                style={{
                  fontFamily:
                    "Lato, sans-serif",
                }}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.9,
                }}
              >
                Discover
                our
                curated
                selection
                of premium
                dinnerware
                and
                accessories
              </motion.p>

             
            </div>
          </div>
        </div>
      </motion.div> */}

      {/* ==================== CONTENT ==================== */}

      <div className="w-full bg-white px-4 py-8 md:px-8 md:py-10 lg:px-16">
        {/* PAGE HEADER */}

        <div className="mb-6 flex flex-col items-start justify-between border-b border-[#ece9e2] pb-5 sm:flex-row sm:items-center">
          <h1
            className="text-2xl font-semibold text-[#111111] md:text-3xl"
            style={{
              fontFamily: "Lato, sans-serif",
            }}
          >
            {isNewArrivals ? "New Arrivals" : "Collections"}
          </h1>

          <nav
            className="mt-2 flex items-center gap-2 text-sm text-[#8b918f] sm:mt-0"
            style={{
              fontFamily: "Lato, sans-serif",
            }}
            aria-label="Breadcrumb"
          >
            <span>Home</span>

            <span className="text-[#d9d6cd]" aria-hidden="true">
              /
            </span>

            <span>Products</span>

            {isNewArrivals && (
              <>
                <span className="text-[#d9d6cd]" aria-hidden="true">
                  /
                </span>

                <span>New Arrivals</span>
              </>
            )}
          </nav>
        </div>

        {/* ==================== MOBILE FILTER + SORT PILLS ==================== */}
        {/* Same font-family (Lato) and theme as the rest of the page, styled as two pill buttons for mobile */}

        <div
          className="mb-5 flex items-center justify-between gap-3 md:hidden"
          style={{ fontFamily: "Lato, sans-serif" }}
        >
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#ece9e2] bg-white px-4 py-2.5 text-sm font-medium text-[#111111] shadow-sm"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>

          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="w-full appearance-none rounded-xl border border-[#ece9e2] bg-white px-4 py-2.5 pr-9 text-sm font-medium text-[#111111] shadow-sm focus:outline-none"
              style={{ fontFamily: "Lato, sans-serif" }}
              aria-label="Sort products"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                <option key={option} value={option}>
                  {SORT_LABELS[option]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b918f]" />
          </div>
        </div>

        {/* ==================== MOBILE FILTER DRAWER ==================== */}

        <AnimatePresence>
          {isMobileFilterOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
              />
              <motion.div
                className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-white p-4 shadow-2xl md:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div
                  className="mb-4 flex items-center justify-between"
                  style={{ fontFamily: "Lato, sans-serif" }}
                >
                  <h2 className="text-base font-semibold text-[#111111]">
                    Filters
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="rounded-full p-1.5 text-[#111111] hover:bg-[#ece9e2]/60"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <FilterSidebar
                  onFilterChange={handleFilterChange}
                  maxPrice={MAX_PRICE_LIMIT}
                  selectedCategories={filters.categories}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MAIN LAYOUT */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr] md:gap-8">
          {/* FILTER SIDEBAR (desktop only — mobile uses the drawer above) */}

          <div className="hidden md:block">
            <FilterSidebar
              onFilterChange={handleFilterChange}
              maxPrice={MAX_PRICE_LIMIT}
              selectedCategories={filters.categories}
            />
          </div>

          {/* PRODUCT AREA */}

          <div>
            {/* SEARCH + SORT (desktop) */}

            <div className="mb-5 hidden flex-col items-start justify-between gap-3 sm:flex-row sm:items-center md:flex">
              <div className="w-full flex-1 sm:max-w-sm">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-[#ece9e2] bg-white px-4 py-2.5 text-[#111111] placeholder-[#8b918f] transition-all focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/15"
                  style={{
                    fontFamily: "Lato, sans-serif",
                  }}
                  aria-label="Search products"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="rounded-lg border border-[#ece9e2] bg-white px-4 py-2.5 text-sm text-[#111111] transition-all focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/15"
                style={{
                  fontFamily: "Lato, sans-serif",
                }}
                aria-label="Sort products"
              >
                <option value="recommended">Recommended</option>

                <option value="price-low">Price: Low to High</option>

                <option value="price-high">Price: High to Low</option>

                <option value="newest">Newest</option>
              </select>
            </div>

            {/* SEARCH (mobile — sort lives in the pill row above) */}

            <div className="mb-5 md:hidden">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-[#ece9e2] bg-white px-4 py-2.5 text-[#111111] placeholder-[#8b918f] transition-all focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/15"
                style={{ fontFamily: "Lato, sans-serif" }}
                aria-label="Search products"
              />
            </div>

            {/* PRODUCT COUNT */}

            <div
              className="mb-4 text-sm text-[#8b918f]"
              style={{
                fontFamily: "Lato, sans-serif",
              }}
              aria-live="polite"
            >
              {isLoading || isFetching ? (
                <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
              ) : products.length > 0 ? (
                `Showing ${startProduct}-${endProduct} of ${totalProducts} Products`
              ) : null}
            </div>

            {/* PRODUCTS */}

            {isLoading || isFetching ? (
              renderSkeletons()
            ) : error ? (
              renderError()
            ) : products.length > 0 ? (
              <>
                {renderProductGrid()}
                {renderPagination()}
              </>
            ) : (
              renderEmptyState()
            )}
          </div>
        </div>
      </div>

      {/* ==================== FOOTER ==================== */}

      <Newsletter />

      <Footer />
    </div>
  );
}