"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/product/FilterSidebar";
import Newsletter from "@/components/product/Newsletter";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/common/Header";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/Profile/userApi";

// =====================================================
// TYPES
// =====================================================

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

type SortOption =
  | "recommended"
  | "price-low"
  | "price-high"
  | "newest";

// =====================================================
// CONSTANTS
// =====================================================

const PRODUCTS_PER_PAGE = 12;
const MAX_PRICE_LIMIT = 8000;
const VISIBLE_PAGES = 5;
const SKELETON_COUNT = 8;

// =====================================================
// SORT LABELS
// =====================================================

const SORT_LABELS: Record<SortOption, string> = {
  recommended: "Recommended",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  newest: "Newest",
};

// =====================================================
// HELPERS
// =====================================================

const getProductPrice = (
  product: any,
  accountType?: string,
): number => {
  if (!product) return 0;

  const type = String(accountType || "")
    .trim()
    .toLowerCase();

  if (type === "distributor") {
    return Number(
      product.distributor_price ??
        product.distributor?.price ??
        product.retail_price ??
        0,
    );
  }

  return Number(
    product.retail_price ??
      product.retail?.price ??
      product.price ??
      0,
  );
};

const getProductMrp = (
  product: any,
  accountType?: string,
): number => {
  if (!product) return 0;

  const type = String(accountType || "")
    .trim()
    .toLowerCase();

  if (type === "distributor") {
    return Number(
      product.distributor_mrp ??
        product.distributor?.mrp ??
        product.retail_mrp ??
        0,
    );
  }

  return Number(
    product.retail_mrp ??
      product.retail?.mrp ??
      product.mrp ??
      0,
  );
};

const getDiscountPercentage = (
  product: any,
  accountType?: string,
): number => {
  if (!product) return 0;

  const mrp = getProductMrp(product, accountType);
  const price = getProductPrice(product, accountType);

  if (mrp > 0 && price > 0 && mrp > price) {
    return Math.round(((mrp - price) / mrp) * 100);
  }

  return 0;
};

// =====================================================
// NORMALIZE ACCOUNT TYPE
// =====================================================

const getAccountType = (profile: any): string => {
  const accountType =
    profile?.user?.account_type ??
    profile?.data?.user?.account_type ??
    profile?.data?.account_type ??
    profile?.account_type ??
    "retail";

  const normalized = String(accountType)
    .trim()
    .toLowerCase();

  if (normalized === "distributor") {
    return "distributor";
  }

  return "retail";
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ProductsPage(): JSX.Element {
  const searchParams = useSearchParams();

  // ===================================================
  // PROFILE
  // ===================================================

  const { data: userProfile } = useGetUserProfileQuery({});

  const userType = useMemo(
    () => getAccountType(userProfile),
    [userProfile],
  );

  // ===================================================
  // URL VALUES
  // ===================================================

  const isNewArrivals =
    searchParams.get("new-arrivals") === "true";

  const getInitialCategories = (): string[] => {
    return (
      searchParams
        .get("category")
        ?.split(",")
        .map((item) => decodeURIComponent(item).trim())
        .filter(Boolean) || []
    );
  };

  const getInitialPriceRange = (): [number, number] => {
    const min = Number(searchParams.get("min_price") || 0);
    const max = Number(
      searchParams.get("max_price") || MAX_PRICE_LIMIT,
    );

    return [
      Number.isFinite(min) ? min : 0,
      Number.isFinite(max) && max > 0
        ? max
        : MAX_PRICE_LIMIT,
    ];
  };

  const getInitialAvailability = () => ({
    inStock: searchParams.get("in_stock") === "true",
    outOfStock:
      searchParams.get("out_of_stock") === "true",
  });

  const getInitialPage = () => {
    const page = Number(searchParams.get("page") || 1);

    if (!Number.isFinite(page) || page < 1) {
      return 1;
    }

    return page;
  };

  // ===================================================
  // FILTER STATE
  // ===================================================

  const [filters, setFilters] = useState<FilterState>(() => ({
    categories: getInitialCategories(),
    priceRange: getInitialPriceRange(),
    availability: getInitialAvailability(),
  }));

  const [currentPage, setCurrentPage] =
    useState<number>(getInitialPage);

  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const sort = searchParams.get("sort");

    if (
      sort === "price-low" ||
      sort === "price-high" ||
      sort === "newest"
    ) {
      return sort;
    }

    return "recommended";
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  const [isMobileFilterOpen, setIsMobileFilterOpen] =
    useState(false);

  // ===================================================
  // CATEGORY API
  // ===================================================

  const { data: categoriesData } =
    useGetCategoriesQuery({});

  // ===================================================
  // CATEGORY MAP
  // ===================================================

  const categoryIdMap = useMemo(() => {
    const map = new Map<string, number>();

    categoriesData?.data?.forEach((cat: Category) => {
      if (cat?.title && cat?.id != null) {
        map.set(cat.title, Number(cat.id));
      }
    });

    return map;
  }, [categoriesData]);

  // ===================================================
  // SYNC STATE WITH URL
  // IMPORTANT:
  // No router.replace here, otherwise page blink can happen.
  // ===================================================

  useEffect(() => {
    const categoryParam = searchParams.get("category");

    const urlCategories = categoryParam
      ? categoryParam
          .split(",")
          .map((item) => decodeURIComponent(item).trim())
          .filter(Boolean)
      : [];

    const validCategories =
      categoriesData?.data?.length > 0
        ? urlCategories.filter((title) =>
            categoriesData.data.some(
              (category: Category) =>
                category.title === title,
            ),
          )
        : urlCategories;

    const minPrice = Number(
      searchParams.get("min_price") || 0,
    );

    const maxPrice = Number(
      searchParams.get("max_price") ||
        MAX_PRICE_LIMIT,
    );

    const nextPage = Number(
      searchParams.get("page") || 1,
    );

    const safePage =
      Number.isFinite(nextPage) && nextPage > 0
        ? nextPage
        : 1;

    const urlSort = searchParams.get("sort");

    const nextSort: SortOption =
      urlSort === "price-low" ||
      urlSort === "price-high" ||
      urlSort === "newest"
        ? urlSort
        : "recommended";

    const nextSearch =
      searchParams.get("search") || "";

    setFilters((prev) => {
      const nextFilters: FilterState = {
        categories: validCategories,
        priceRange: [
          Number.isFinite(minPrice) && minPrice >= 0
            ? minPrice
            : 0,
          Number.isFinite(maxPrice) &&
          maxPrice > 0
            ? maxPrice
            : MAX_PRICE_LIMIT,
        ],
        availability: {
          inStock:
            searchParams.get("in_stock") === "true",
          outOfStock:
            searchParams.get("out_of_stock") ===
            "true",
        },
      };

      const same =
        JSON.stringify(prev) ===
        JSON.stringify(nextFilters);

      return same ? prev : nextFilters;
    });

    setCurrentPage((prev) =>
      prev === safePage ? prev : safePage,
    );

    setSortBy((prev) =>
      prev === nextSort ? prev : nextSort,
    );

    setSearchQuery((prev) =>
      prev === nextSearch ? prev : nextSearch,
    );
  }, [searchParams, categoriesData]);

  // ===================================================
  // BUILD URL
  // Uses history API instead of router.replace
  // to prevent page refresh/blinking.
  // ===================================================

  const updateBrowserUrl = useCallback(
    ({
      nextFilters = filters,
      nextPage = currentPage,
      nextSort = sortBy,
      nextSearch = searchQuery,
    }: {
      nextFilters?: FilterState;
      nextPage?: number;
      nextSort?: SortOption;
      nextSearch?: string;
    } = {}) => {
      const params = new URLSearchParams();

      if (isNewArrivals) {
        params.set("new-arrivals", "true");
      }

      if (nextFilters.categories.length > 0) {
        params.set(
          "category",
          nextFilters.categories.join(","),
        );
      }

      if (nextFilters.priceRange[0] > 0) {
        params.set(
          "min_price",
          String(nextFilters.priceRange[0]),
        );
      }

      if (
        nextFilters.priceRange[1] <
        MAX_PRICE_LIMIT
      ) {
        params.set(
          "max_price",
          String(nextFilters.priceRange[1]),
        );
      }

      if (nextFilters.availability.inStock) {
        params.set("in_stock", "true");
      }

      if (nextFilters.availability.outOfStock) {
        params.set("out_of_stock", "true");
      }

      if (nextSearch.trim()) {
        params.set("search", nextSearch.trim());
      }

      if (nextSort !== "recommended") {
        params.set("sort", nextSort);
      }

      if (nextPage > 1) {
        params.set("page", String(nextPage));
      }

      const queryString = params.toString();

      const newUrl = queryString
        ? `/products?${queryString}`
        : "/products";

      const currentUrl =
        window.location.pathname +
        window.location.search;

      if (newUrl !== currentUrl) {
        window.history.replaceState(
          null,
          "",
          newUrl,
        );
      }
    },
    [
      filters,
      currentPage,
      sortBy,
      searchQuery,
      isNewArrivals,
    ],
  );

  // ===================================================
  // BUILD API QUERY
  // ===================================================

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: currentPage,
      per_page: PRODUCTS_PER_PAGE,
      is_published: 1,
    };

    // NEW ARRIVALS

    if (isNewArrivals) {
      params.new_arrivals = true;
    }

    // CATEGORY

    if (filters.categories.length > 0) {
      const categoryIds = filters.categories
        .map((title) =>
          categoryIdMap.get(title),
        )
        .filter(
          (id): id is number =>
            id !== undefined,
        )
        .join(",");

      if (categoryIds) {
        params.category_ids = categoryIds;
      }
    }

    // PRICE

    if (filters.priceRange[0] > 0) {
      params.min_price = filters.priceRange[0];
    }

    if (
      filters.priceRange[1] <
      MAX_PRICE_LIMIT
    ) {
      params.max_price = filters.priceRange[1];
    }

    // STOCK

    if (
      filters.availability.inStock &&
      !filters.availability.outOfStock
    ) {
      params.stock_status = "in_stock";
    } else if (
      !filters.availability.inStock &&
      filters.availability.outOfStock
    ) {
      params.stock_status = "out_of_stock";
    }

    // SEARCH

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    // SORT

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
  }, [
    currentPage,
    filters,
    searchQuery,
    sortBy,
    categoryIdMap,
    isNewArrivals,
  ]);

  // ===================================================
  // PRODUCTS API
  // ===================================================

  const {
    data: productsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetProductsQuery(queryParams);

  // ===================================================
  // PAGINATION DATA
  // ===================================================

  const pagination = productsData?.pagination;
  const meta = productsData?.meta;

  const totalProducts = Number(
    pagination?.total ??
      meta?.total ??
      0,
  );

  const lastPage = Number(
    pagination?.last_page ??
      meta?.last_page ??
      1,
  );

  const apiCurrentPage = Number(
    pagination?.current_page ??
      meta?.current_page ??
      currentPage,
  );

  // ===================================================
  // FIX INVALID PAGE
  //
  // Example:
  // /products?new-arrivals=true&page=2
  //
  // If new arrivals have only 1 page,
  // automatically move back to page 1.
  // ===================================================

  useEffect(() => {
    if (
      !isLoading &&
      lastPage > 0 &&
      currentPage > lastPage
    ) {
      const validPage = lastPage;

      setCurrentPage(validPage);

      updateBrowserUrl({
        nextPage: validPage,
      });
    }
  }, [
    isLoading,
    lastPage,
    currentPage,
    updateBrowserUrl,
  ]);

  // ===================================================
  // TRANSFORM PRODUCTS
  // ===================================================

  const products = useMemo(() => {
    if (!Array.isArray(productsData?.data)) {
      return [];
    }

    return productsData.data.map(
      (product: any) => {
        const price = getProductPrice(
          product,
          userType,
        );

        const mrp = getProductMrp(
          product,
          userType,
        );

        const discount =
          getDiscountPercentage(
            product,
            userType,
          );

        const stockQuantity = Number(
          product?.stock_quantity ??
            product?.stock ??
            0,
        );

        const stockStatus = String(
          product?.stock_status ??
            product?.status ??
            "",
        ).toLowerCase();

        const active =
          product?.is_active ??
          product?.active ??
          true;

        const inStock =
          stockQuantity > 0 &&
          active !== false &&
          stockStatus !== "inactive" &&
          stockStatus !== "out_of_stock";

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,

          category:
            product?.category?.name ||
            product?.category?.title ||
            "Uncategorized",

          price,

          originalPrice:
            mrp > price ? mrp : null,

          discount:
            discount > 0
              ? discount
              : null,

          image:
            product.primary_image_url ||
            product.image_url ||
            product.image ||
            "/images/placeholder.jpg",

          rating:
            Number(
              product.average_rating ??
                product.rating ??
                0,
            ) || 0,

          reviews:
            Number(
              product.review_count ??
                product.reviews_count ??
                0,
            ) || 0,

          inStock,

          stockQuantity,

          stockStatus,

          userType,
        };
      },
    );
  }, [productsData, userType]);

  // ===================================================
  // FILTER HANDLER
  // ===================================================

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      setCurrentPage(1);

      updateBrowserUrl({
        nextFilters: newFilters,
        nextPage: 1,
      });
    },
    [updateBrowserUrl],
  );

  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);

      updateBrowserUrl({
        nextSearch: query,
        nextPage: 1,
      });
    },
    [updateBrowserUrl],
  );

  // ===================================================
  // SORT
  // ===================================================

  const handleSortChange =
    useCallback(
      (sort: SortOption) => {
        setSortBy(sort);
        setCurrentPage(1);

        updateBrowserUrl({
          nextSort: sort,
          nextPage: 1,
        });
      },
      [updateBrowserUrl],
    );

  // ===================================================
  // PAGE CHANGE
  // ===================================================

  const handlePageChange =
    useCallback(
      (page: number) => {
        if (page < 1) return;

        if (
          lastPage > 0 &&
          page > lastPage
        ) {
          return;
        }

        setCurrentPage(page);

        updateBrowserUrl({
          nextPage: page,
        });

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      },
      [lastPage, updateBrowserUrl],
    );

  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  const handleClearFilters =
    useCallback(() => {
      const newFilters: FilterState = {
        categories: [],
        priceRange: [
          0,
          MAX_PRICE_LIMIT,
        ],
        availability: {
          inStock: false,
          outOfStock: false,
        },
      };

      setFilters(newFilters);
      setSearchQuery("");
      setSortBy("recommended");
      setCurrentPage(1);

      // Keep new-arrivals context if already on it.
      const params = new URLSearchParams();

      if (isNewArrivals) {
        params.set(
          "new-arrivals",
          "true",
        );
      }

      const queryString =
        params.toString();

      const url = queryString
        ? `/products?${queryString}`
        : "/products";

      window.history.replaceState(
        null,
        "",
        url,
      );
    }, [isNewArrivals]);

  // ===================================================
  // PAGINATION PAGES
  // ===================================================

  const paginationPages = useMemo(() => {
    if (
      !lastPage ||
      lastPage <= 1
    ) {
      return [];
    }

    const pages: number[] = [];

    if (lastPage <= VISIBLE_PAGES) {
      for (
        let i = 1;
        i <= lastPage;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    if (currentPage <= 3) {
      for (
        let i = 1;
        i <= VISIBLE_PAGES;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    if (
      currentPage >=
      lastPage - 2
    ) {
      for (
        let i =
          lastPage -
          VISIBLE_PAGES +
          1;
        i <= lastPage;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    for (
      let i = currentPage - 2;
      i <= currentPage + 2;
      i++
    ) {
      pages.push(i);
    }

    return pages;
  }, [lastPage, currentPage]);

  // ===================================================
  // SKELETON
  // ===================================================

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 md:gap-5">
      {Array.from({
        length: SKELETON_COUNT,
      }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-[#ece9e2] bg-white"
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

  // ===================================================
  // ERROR
  // ===================================================

  const renderError = () => (
    <div
      className="py-12 text-center"
      style={{
        fontFamily: "Lato, sans-serif",
      }}
      role="alert"
    >
      <div
        className="mb-4 text-4xl text-red-500"
        aria-hidden="true"
      >
        ⚠️
      </div>

      <h3 className="mb-2 text-lg font-semibold text-[#111111]">
        Failed to load products
      </h3>

      <p className="mb-4 text-[#8b918f]">
        Please try refreshing the page
      </p>

      <button
        onClick={() => refetch()}
        className="rounded-lg bg-[#111111] px-4 py-2 text-white transition-all duration-300 hover:bg-black/80"
      >
        Retry
      </button>
    </div>
  );

  // ===================================================
  // EMPTY
  // ===================================================

  const renderEmptyState = () => (
    <div
      className="py-12 text-center"
      style={{
        fontFamily: "Lato, sans-serif",
      }}
    >
      <div
        className="mb-4 text-6xl"
        aria-hidden="true"
      >
        🔍
      </div>

      <p className="text-lg text-[#8b918f]">
        No products found matching your
        criteria
      </p>

      <button
        onClick={handleClearFilters}
        className="mt-4 font-medium text-[#111111] underline underline-offset-4 transition-colors hover:text-black/70"
      >
        Clear all filters
      </button>
    </div>
  );

  // ===================================================
  // PRODUCT GRID
  // ===================================================

  const renderProductGrid = () => (
    <div className="relative">
      <motion.div
        className={`grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 md:gap-5 transition-opacity duration-200 ${
          isFetching
            ? "opacity-60"
            : "opacity-100"
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={currentPage}
      >
        {products.map((product: any) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
          >
            <ProductCard
              product={product}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Fetching overlay only */}
      {isFetching && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-3">
          <div className="rounded-full border border-[#ece9e2] bg-white px-4 py-2 text-xs font-medium text-[#111111] shadow-sm">
            Loading products...
          </div>
        </div>
      )}
    </div>
  );

  // ===================================================
  // PAGINATION
  // ===================================================

  const renderPagination = () => {
    if (
      isLoading ||
      lastPage <= 1 ||
      totalProducts <= 0
    ) {
      return null;
    }

    const currentPageNum =
      apiCurrentPage ||
      currentPage;

    const hasPrevious =
      currentPageNum > 1;

    const hasNext =
      currentPageNum < lastPage;

    const start =
      (currentPageNum - 1) *
        PRODUCTS_PER_PAGE +
      1;

    const end = Math.min(
      currentPageNum *
        PRODUCTS_PER_PAGE,
      totalProducts,
    );

    return (
      <div
        className="mt-10 flex flex-col items-center gap-4"
        style={{
          fontFamily:
            "Lato, sans-serif",
        }}
      >
        <div className="text-sm text-[#8b918f]">
          Page {currentPageNum} of{" "}
          {lastPage}
        </div>

        <nav
          className="flex items-center gap-1.5"
          aria-label="Pagination"
        >
          {/* Previous */}

          <button
            onClick={() =>
              handlePageChange(
                currentPageNum - 1,
              )
            }
            disabled={!hasPrevious}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300 ${
              hasPrevious
                ? "border-[#ece9e2] text-[#111111] hover:bg-[#111111] hover:text-white"
                : "cursor-not-allowed border-[#f0f0f0] text-[#c5c5c5]"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* First page */}

          {paginationPages.length >
            0 &&
            paginationPages[0] > 1 && (
              <>
                <button
                  onClick={() =>
                    handlePageChange(1)
                  }
                  className="flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-[#ece9e2] px-3 text-sm font-medium text-[#111111] transition-all duration-300 hover:bg-[#111111] hover:text-white"
                >
                  1
                </button>

                {paginationPages[0] >
                  2 && (
                  <span className="flex h-10 w-10 items-center justify-center text-[#8b918f]">
                    …
                  </span>
                )}
              </>
            )}

          {/* Pages */}

          {paginationPages.map(
            (page) => (
              <button
                key={page}
                onClick={() =>
                  handlePageChange(page)
                }
                className={`flex h-10 min-w-[40px] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-all duration-300 ${
                  currentPageNum === page
                    ? "border-[#111111] bg-[#111111] text-white"
                    : "border-[#ece9e2] text-[#111111] hover:bg-[#111111] hover:text-white"
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={
                  currentPageNum === page
                    ? "page"
                    : undefined
                }
              >
                {page}
              </button>
            ),
          )}

          {/* Last page */}

          {paginationPages.length >
            0 &&
            paginationPages[
              paginationPages.length -
                1
            ] < lastPage && (
              <>
                {paginationPages[
                  paginationPages.length -
                    1
                ] <
                  lastPage - 1 && (
                  <span className="flex h-10 w-10 items-center justify-center text-[#8b918f]">
                    …
                  </span>
                )}

                <button
                  onClick={() =>
                    handlePageChange(
                      lastPage,
                    )
                  }
                  className="flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-[#ece9e2] px-3 text-sm font-medium text-[#111111] transition-all duration-300 hover:bg-[#111111] hover:text-white"
                >
                  {lastPage}
                </button>
              </>
            )}

          {/* Next */}

          <button
            onClick={() =>
              handlePageChange(
                currentPageNum + 1,
              )
            }
            disabled={!hasNext}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300 ${
              hasNext
                ? "border-[#ece9e2] text-[#111111] hover:bg-[#111111] hover:text-white"
                : "cursor-not-allowed border-[#f0f0f0] text-[#c5c5c5]"
            }`}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>

        <div className="text-xs text-[#8b918f]">
          Showing {start}–{end} of{" "}
          {totalProducts} products
        </div>
      </div>
    );
  };

  // ===================================================
  // ANIMATIONS
  // ===================================================

  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,

      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // ===================================================
  // COUNTS
  // ===================================================

  const startProduct =
    products.length > 0
      ? (currentPage - 1) *
          PRODUCTS_PER_PAGE +
        1
      : 0;

  const endProduct =
    products.length > 0
      ? Math.min(
          currentPage *
            PRODUCTS_PER_PAGE,
          totalProducts,
        )
      : 0;

  // ===================================================
  // INITIAL LOADING ONLY
  //
  // IMPORTANT:
  // isFetching alone no longer replaces content.
  // This removes page blinking.
  // ===================================================

  const showInitialSkeleton =
    isLoading &&
    products.length === 0;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="w-full bg-white px-4 py-8 md:px-8 md:py-10 lg:px-16">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col items-start justify-between border-b border-[#ece9e2] pb-5 sm:flex-row sm:items-center">
          <h1
            className="text-2xl font-semibold text-[#111111] md:text-3xl"
            style={{
              fontFamily:
                "Lato, sans-serif",
            }}
          >
            {isNewArrivals
              ? "New Arrivals"
              : "Collections"}
          </h1>

          <nav
            className="mt-2 flex items-center gap-2 text-sm text-[#8b918f] sm:mt-0"
            style={{
              fontFamily:
                "Lato, sans-serif",
            }}
            aria-label="Breadcrumb"
          >
            <span>Home</span>

            <span className="text-[#d9d6cd]">
              /
            </span>

            <span>Products</span>

            {isNewArrivals && (
              <>
                <span className="text-[#d9d6cd]">
                  /
                </span>

                <span>
                  New Arrivals
                </span>
              </>
            )}
          </nav>
        </div>

        {/* =================================================
            MOBILE FILTER + SORT
        ================================================= */}

        <div
          className="mb-5 flex items-center justify-between gap-3 md:hidden"
          style={{
            fontFamily:
              "Lato, sans-serif",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setIsMobileFilterOpen(
                true,
              )
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#ece9e2] bg-white px-4 py-2.5 text-sm font-medium text-[#111111] shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />

            Filter
          </button>

          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(event) =>
                handleSortChange(
                  event.target
                    .value as SortOption,
                )
              }
              className="w-full appearance-none rounded-xl border border-[#ece9e2] bg-white px-4 py-2.5 pr-9 text-sm font-medium text-[#111111] shadow-sm focus:outline-none"
            >
              {(
                Object.keys(
                  SORT_LABELS,
                ) as SortOption[]
              ).map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {
                    SORT_LABELS[
                      option
                    ]
                  }
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b918f]" />
          </div>
        </div>

        {/* =================================================
            MOBILE FILTER DRAWER
        ================================================= */}

        <AnimatePresence>
          {isMobileFilterOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/40 md:hidden"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onClick={() =>
                  setIsMobileFilterOpen(
                    false,
                  )
                }
              />

              <motion.div
                className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-white p-4 shadow-2xl md:hidden"
                initial={{
                  x: "-100%",
                }}
                animate={{
                  x: 0,
                }}
                exit={{
                  x: "-100%",
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <div
                  className="mb-4 flex items-center justify-between"
                  style={{
                    fontFamily:
                      "Lato, sans-serif",
                  }}
                >
                  <h2 className="text-base font-semibold text-[#111111]">
                    Filters
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      setIsMobileFilterOpen(
                        false,
                      )
                    }
                    className="rounded-full p-1.5 text-[#111111] hover:bg-[#ece9e2]/60"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <FilterSidebar
                  onFilterChange={
                    handleFilterChange
                  }
                  maxPrice={
                    MAX_PRICE_LIMIT
                  }
                  selectedCategories={
                    filters.categories
                  }
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr] md:gap-8">
          {/* =================================================
              DESKTOP FILTER
          ================================================= */}

          <div className="hidden md:block">
            <FilterSidebar
              onFilterChange={
                handleFilterChange
              }
              maxPrice={
                MAX_PRICE_LIMIT
              }
              selectedCategories={
                filters.categories
              }
            />
          </div>

          {/* =================================================
              PRODUCT AREA
          ================================================= */}

          <div>
            {/* =================================================
                SEARCH + SORT DESKTOP
            ================================================= */}

            <div className="mb-5 hidden flex-col items-start justify-between gap-3 sm:flex-row sm:items-center md:flex">
              <div className="w-full flex-1 sm:max-w-sm">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(event) =>
                    handleSearch(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-[#ece9e2] bg-white px-4 py-2.5 text-[#111111] placeholder-[#8b918f] transition-all focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/15"
                  style={{
                    fontFamily:
                      "Lato, sans-serif",
                  }}
                  aria-label="Search products"
                />
              </div>

              <select
                value={sortBy}
                onChange={(event) =>
                  handleSortChange(
                    event.target
                      .value as SortOption,
                  )
                }
                className="rounded-lg border border-[#ece9e2] bg-white px-4 py-2.5 text-sm text-[#111111] transition-all focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/15"
                style={{
                  fontFamily:
                    "Lato, sans-serif",
                }}
                aria-label="Sort products"
              >
                <option value="recommended">
                  Recommended
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="newest">
                  Newest
                </option>
              </select>
            </div>

            {/* =================================================
                SEARCH MOBILE
            ================================================= */}

            <div className="mb-5 md:hidden">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(event) =>
                  handleSearch(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-[#ece9e2] bg-white px-4 py-2.5 text-[#111111] placeholder-[#8b918f] transition-all focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/15"
                style={{
                  fontFamily:
                    "Lato, sans-serif",
                }}
              />
            </div>

            {/* =================================================
                ACCOUNT TYPE
            ================================================= */}

            {/*
              Profile se account_type check:

              distributor -> distributor price
              retail/customer -> retail price

              ProductCard ko `userType` bhi pass ho raha hai.
            */}

            {/* =================================================
                PRODUCT COUNT
            ================================================= */}

            <div
              className="mb-4 text-sm text-[#8b918f]"
              style={{
                fontFamily:
                  "Lato, sans-serif",
              }}
              aria-live="polite"
            >
              {showInitialSkeleton ? (
                <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
              ) : products.length >
                0 ? (
                `Showing ${startProduct}-${endProduct} of ${totalProducts} Products`
              ) : null}
            </div>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            {showInitialSkeleton ? (
              renderSkeletons()
            ) : error &&
              products.length === 0 ? (
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

      {/* =================================================
          FOOTER
      ================================================= */}

      <Newsletter />

      <Footer />
    </div>
  );
}