"use client";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  useSearchParams,
  useRouter,
} from "next/navigation";

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

type SortOption =
  | "recommended"
  | "price-low"
  | "price-high"
  | "newest";

// ==================== CONSTANTS ====================

const PRODUCTS_PER_PAGE = 12;
const MAX_PRICE_LIMIT = 8000;
const VISIBLE_PAGES = 5;
const SKELETON_COUNT = 8;

// ==================== HELPER FUNCTIONS ====================

const getProductPrice = (
  product: any,
  userType?: string
) => {
  if (!product) return 0;

  if (userType === "distributor") {
    return Number(
      product.distributor_price ||
        product.retail_price ||
        0
    );
  }

  return Number(product.retail_price || 0);
};

const getProductMrp = (
  product: any,
  userType?: string
) => {
  if (!product) return 0;

  if (userType === "distributor") {
    return Number(
      product.distributor_mrp ||
        product.retail_mrp ||
        0
    );
  }

  return Number(product.retail_mrp || 0);
};

const getDiscountPercentage = (
  product: any,
  userType?: string
) => {
  if (!product) return 0;

  const mrp = getProductMrp(
    product,
    userType
  );

  const price = getProductPrice(
    product,
    userType
  );

  if (
    mrp > 0 &&
    price > 0 &&
    mrp > price
  ) {
    return Math.round(
      ((mrp - price) / mrp) * 100
    );
  }

  return 0;
};

// ==================== MAIN COMPONENT ====================

export default function ProductsPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==================== USER PROFILE ====================

  const { data: userProfile } =
    useGetUserProfileQuery({});

  const userType =
    userProfile?.user?.account_type ||
    "customer";

  // ==================== NEW ARRIVALS ====================


  const isNewArrivals =
    searchParams.get("new-arrivals") ===
    "true";

  // ==================== FILTER STATE ====================

  const [filters, setFilters] =
    useState<FilterState>(() => ({
      categories:
        searchParams
          .get("category")
          ?.split(",")
          .filter(Boolean) || [],

      priceRange: [
        parseInt(
          searchParams.get(
            "min_price"
          ) || "0",
          10
        ),
        parseInt(
          searchParams.get(
            "max_price"
          ) ||
            String(MAX_PRICE_LIMIT),
          10
        ),
      ],

      availability: {
        inStock:
          searchParams.get(
            "in_stock"
          ) === "true",

        outOfStock:
          searchParams.get(
            "out_of_stock"
          ) === "true",
      },
    }));

  const [currentPage, setCurrentPage] =
    useState(
      parseInt(
        searchParams.get("page") || "1",
        10
      )
    );

  const [sortBy, setSortBy] =
    useState<SortOption>(
      (searchParams.get(
        "sort"
      ) as SortOption) ||
        "recommended"
    );

  const [searchQuery, setSearchQuery] =
    useState(
      searchParams.get("search") || ""
    );

  // ==================== CATEGORIES ====================

  const { data: categoriesData } =
    useGetCategoriesQuery({});

  // ==================== CATEGORY ID MAP ====================

  const categoryIdMap = useMemo(() => {
    const map = new Map<string, number>();

    categoriesData?.data?.forEach(
      (cat: Category) => {
        map.set(
          cat.title,
          cat.id
        );
      }
    );

    return map;
  }, [categoriesData]);

  // ==================== SYNC CATEGORIES FROM URL ====================

  useEffect(() => {
    const categoryParam =
      searchParams.get("category");

    if (
      !categoryParam ||
      !categoriesData?.data
    ) {
      return;
    }

    const urlCategories =
      categoryParam
        .split(",")
        .map((category) =>
          decodeURIComponent(
            category
          ).trim()
        )
        .filter(Boolean);

    const validCategories =
      urlCategories.filter(
        (categoryTitle) =>
          categoriesData.data.some(
            (category: Category) =>
              category.title ===
              categoryTitle
          )
      );

    setFilters((prev) => {
      const sameCategories =
        prev.categories.length ===
          validCategories.length &&
        prev.categories.every(
          (category) =>
            validCategories.includes(
              category
            )
        );

      if (sameCategories) {
        return prev;
      }

      return {
        ...prev,
        categories:
          validCategories,
      };
    });
  }, [
    searchParams,
    categoriesData,
  ]);

  // ==================== SYNC SEARCH + PAGE ====================

  useEffect(() => {
    const search =
      searchParams.get("search") ||
      "";

    const page = parseInt(
      searchParams.get("page") ||
        "1",
      10
    );

    setSearchQuery((prev) =>
      prev === search
        ? prev
        : search
    );

    setCurrentPage((prev) =>
      prev === page
        ? prev
        : page
    );
  }, [searchParams]);

  // ==================== BUILD API QUERY ====================

  const queryParams = useMemo(() => {
    const params: Record<string, any> =
      {
        page: currentPage,
        per_page:
          PRODUCTS_PER_PAGE,
        is_published: 1,
      };


    if (isNewArrivals) {
      params.new_arrivals = true;
    }

    // ==================== CATEGORIES ====================

    if (
      filters.categories.length > 0
    ) {
      const categoryIds =
        filters.categories
          .map((title) =>
            categoryIdMap.get(
              title
            )
          )
          .filter(
            (
              id
            ): id is number =>
              id !== undefined
          )
          .join(",");

      if (categoryIds) {
        params.category_ids =
          categoryIds;
      }
    }

    // ==================== PRICE RANGE ====================

    if (
      filters.priceRange[0] > 0
    ) {
      params.min_price =
        filters.priceRange[0];
    }

    if (
      filters.priceRange[1] <
      MAX_PRICE_LIMIT
    ) {
      params.max_price =
        filters.priceRange[1];
    }

    // ==================== STOCK ====================

    if (
      filters.availability
        .inStock &&
      !filters.availability
        .outOfStock
    ) {
      params.stock_status =
        "in_stock";
    } else if (
      !filters.availability
        .inStock &&
      filters.availability
        .outOfStock
    ) {
      params.stock_status =
        "out_of_stock";
    }

    // ==================== SEARCH ====================

    if (searchQuery.trim()) {
      params.search =
        searchQuery.trim();
    }

    // ==================== SORT ====================

    switch (sortBy) {
      case "price-low":
        params.sort_by =
          "retail_price";
        params.sort_direction =
          "asc";
        break;

      case "price-high":
        params.sort_by =
          "retail_price";
        params.sort_direction =
          "desc";
        break;

      case "newest":
        params.sort_by =
          "created_at";
        params.sort_direction =
          "desc";
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

  // ==================== FETCH PRODUCTS ====================

  const {
    data: productsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetProductsQuery(
    queryParams
  );

  // ==================== TRANSFORM PRODUCTS ====================

  const products = useMemo(() => {
    if (!productsData?.data) {
      return [];
    }

    return productsData.data.map(
      (product: any) => {
        const price =
          getProductPrice(
            product,
            userType
          );

        const mrp =
          getProductMrp(
            product,
            userType
          );

        const discount =
          getDiscountPercentage(
            product,
            userType
          );

        return {
          id: product.id,

          name: product.name,

          slug: product.slug,

          category:
            product.category?.name ||
            "Uncategorized",

          price,

          originalPrice:
            mrp > price
              ? mrp
              : null,

          discount:
            discount > 0
              ? discount
              : null,

          image:
            product.primary_image_url ||
            "/images/placeholder.jpg",

          rating: 4.5,

          reviews: 120,

          inStock:
            product.stock_status ===
              "active" &&
            product.stock_quantity >
              0,

          userType,
        };
      }
    );
  }, [
    productsData,
    userType,
  ]);

  // ==================== URL SYNC ====================

  useEffect(() => {
    const params =
      new URLSearchParams();

    // ==================== NEW ARRIVALS ====================

    if (isNewArrivals) {
      params.set(
        "new-arrivals",
        "true"
      );
    }

    // ==================== CATEGORIES ====================

    if (
      filters.categories.length >
      0
    ) {
      params.set(
        "category",
        filters.categories.join(
          ","
        )
      );
    }

    // ==================== PRICE ====================

    if (
      filters.priceRange[0] > 0
    ) {
      params.set(
        "min_price",
        filters.priceRange[0].toString()
      );
    }

    if (
      filters.priceRange[1] <
      MAX_PRICE_LIMIT
    ) {
      params.set(
        "max_price",
        filters.priceRange[1].toString()
      );
    }

    // ==================== STOCK ====================

    if (
      filters.availability.inStock
    ) {
      params.set(
        "in_stock",
        "true"
      );
    }

    if (
      filters.availability
        .outOfStock
    ) {
      params.set(
        "out_of_stock",
        "true"
      );
    }

    // ==================== SEARCH ====================

    if (searchQuery.trim()) {
      params.set(
        "search",
        searchQuery.trim()
      );
    }

    // ==================== SORT ====================

    if (
      sortBy !== "recommended"
    ) {
      params.set(
        "sort",
        sortBy
      );
    }

    // ==================== PAGE ====================

    if (currentPage > 1) {
      params.set(
        "page",
        currentPage.toString()
      );
    }

    const queryString =
      params.toString();

    const newUrl =
      queryString
        ? `/products?${queryString}`
        : "/products";

    const currentUrl =
      `/products${
        searchParams.toString()
          ? `?${searchParams.toString()}`
          : ""
      }`;

    if (newUrl !== currentUrl) {
      router.replace(
        newUrl,
        {
          scroll: false,
        }
      );
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

  const handleFilterChange =
    useCallback(
      (
        newFilters: FilterState
      ) => {
        setFilters(
          newFilters
        );

        setCurrentPage(1);
      },
      []
    );

  // ==================== SEARCH ====================

  const handleSearch =
    useCallback(
      (query: string) => {
        setSearchQuery(
          query
        );

        setCurrentPage(1);
      },
      []
    );

  // ==================== SORT ====================

  const handleSortChange =
    useCallback(
      (sort: SortOption) => {
        setSortBy(sort);
        setCurrentPage(1);
      },
      []
    );

  // ==================== PAGINATION ====================

  const handlePageChange =
    useCallback(
      (page: number) => {
        setCurrentPage(page);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      },
      []
    );

  // ==================== CLEAR FILTERS ====================

  const handleClearFilters =
    useCallback(() => {
      setFilters({
        categories: [],

        priceRange: [
          0,
          MAX_PRICE_LIMIT,
        ],

        availability: {
          inStock: false,
          outOfStock: false,
        },
      });

      setSearchQuery("");

      setSortBy(
        "recommended"
      );

      setCurrentPage(1);

      router.replace(
        "/products",
        {
          scroll: false,
        }
      );
    }, [router]);

  // ==================== PAGINATION HELPERS ====================

  const getPaginationPages =
    useMemo(() => {
      const lastPage =
        productsData?.meta
          ?.last_page || 0;

      if (lastPage <= 1) {
        return [];
      }

      const pages: number[] =
        [];

      if (
        lastPage <=
        VISIBLE_PAGES
      ) {
        for (
          let i = 1;
          i <= lastPage;
          i++
        ) {
          pages.push(i);
        }
      } else if (
        currentPage <= 3
      ) {
        for (
          let i = 1;
          i <=
            VISIBLE_PAGES;
          i++
        ) {
          pages.push(i);
        }
      } else if (
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
      } else {
        for (
          let i =
            currentPage - 2;
          i <=
            currentPage + 2;
          i++
        ) {
          pages.push(i);
        }
      }

      return pages;
    }, [
      productsData?.meta
        ?.last_page,
      currentPage,
    ]);

  // ==================== SKELETON ====================

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
      {Array.from({
        length:
          SKELETON_COUNT,
      }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-[#E7DBC0] bg-white"
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
      role="alert"
    >
      <div
        className="mb-4 text-4xl text-red-500"
        aria-hidden="true"
      >
        ⚠️
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-800">
        Failed to load
        products
      </h3>

      <p className="mb-4 text-gray-500">
        Please try
        refreshing the
        page
      </p>

      <button
        onClick={() =>
          refetch()
        }
        className="rounded-lg bg-[#26253A] px-4 py-2 text-white transition-all duration-300 hover:bg-[#F7B407] hover:text-[#26253A]"
        aria-label="Retry loading products"
      >
        Retry
      </button>
    </div>
  );

  // ==================== PRODUCT GRID ====================

  const renderProductGrid =
    () => (
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4"
        variants={
          containerVariants
        }
        initial="hidden"
        animate="visible"
        key={currentPage}
      >
        {products.map(
          (product) => (
            <motion.div
              key={
                product.id
              }
              variants={
                itemVariants
              }
            >
              <ProductCard
                product={
                  product
                }
              />
            </motion.div>
          )
        )}
      </motion.div>
    );

  // ==================== EMPTY ====================

  const renderEmptyState =
    () => (
      <div className="py-12 text-center">
        <div
          className="mb-4 text-6xl"
          aria-hidden="true"
        >
          🔍
        </div>

        <p className="text-lg text-gray-500">
          No products found
          matching your
          criteria
        </p>

        <button
          onClick={
            handleClearFilters
          }
          className="mt-4 font-medium text-[#F7B407] transition-colors hover:text-[#d49e06]"
        >
          Clear all
          filters
        </button>
      </div>
    );

  // ==================== PAGINATION ====================

  const renderPagination =
    () => {
      const lastPage =
        productsData?.meta
          ?.last_page || 0;

      if (
        isLoading ||
        isFetching ||
        lastPage <= 1
      ) {
        return null;
      }

      return (
        <nav
          className="mt-8 flex justify-center gap-2"
          aria-label="Pagination"
        >
          <button
            onClick={() =>
              handlePageChange(
                currentPage -
                  1
              )
            }
            disabled={
              currentPage ===
              1
            }
            className="rounded-lg border border-gray-200 px-4 py-2 text-[#26253A] transition-all duration-300 hover:bg-[#26253A] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            Previous
          </button>

          {getPaginationPages.map(
            (page) => (
              <button
                key={page}
                onClick={() =>
                  handlePageChange(
                    page
                  )
                }
                className={`rounded-lg px-4 py-2 transition-all duration-300 ${
                  currentPage ===
                  page
                    ? "bg-[#F7B407] font-semibold text-[#26253A]"
                    : "border border-gray-200 text-[#26253A] hover:bg-[#26253A] hover:text-white"
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={
                  currentPage ===
                  page
                    ? "page"
                    : undefined
                }
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() =>
              handlePageChange(
                currentPage +
                  1
              )
            }
            disabled={
              currentPage ===
              lastPage
            }
            className="rounded-lg border border-gray-200 px-4 py-2 text-[#26253A] transition-all duration-300 hover:bg-[#26253A] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
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
        staggerChildren:
          0.08,
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

  const totalProducts =
    productsData?.meta?.total ??
    products.length;

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
          totalProducts
        )
      : 0;

  // ==================== RENDER ====================

  return (
    <div>
      <Header />

      {/* ==================== BANNER ==================== */}

      <motion.div
        className="relative h-[200px] w-full overflow-hidden md:h-[300px] lg:h-[400px]"
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

              <motion.button
                onClick={() =>
                  router.push(
                    "/products"
                  )
                }
                className="rounded-lg bg-[#F7B407] px-6 py-2 text-sm font-semibold text-[#26253A] shadow-lg transition-all hover:bg-[#f5c94a] hover:shadow-xl hover:shadow-[#F7B407]/20 md:px-8 md:py-3"
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                style={{
                  fontFamily:
                    "Lato, sans-serif",
                }}
                aria-label="Shop now"
                type="button"
              >
                Shop Now →
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ==================== CONTENT ==================== */}

      <div className="w-full bg-[#F8F4EE] px-4 py-8 md:px-8 md:py-10 lg:px-16">
        {/* PAGE HEADER */}

        <div className="mb-6 flex flex-col items-start justify-between border-b border-[#E7DBC0] pb-5 sm:flex-row sm:items-center">
          <h1
            className="text-2xl font-semibold text-[#26253A] md:text-3xl"
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
            className="mt-2 flex items-center gap-2 text-sm text-[#8a7f6e] sm:mt-0"
            style={{
              fontFamily:
                "Lato, sans-serif",
            }}
            aria-label="Breadcrumb"
          >
            <span>
              Home
            </span>

            <span
              className="text-[#D9CFBA]"
              aria-hidden="true"
            >
              /
            </span>

            <span>
              Products
            </span>

            {isNewArrivals && (
              <>
                <span
                  className="text-[#D9CFBA]"
                  aria-hidden="true"
                >
                  /
                </span>

                <span>
                  New
                  Arrivals
                </span>
              </>
            )}
          </nav>
        </div>

        {/* MAIN LAYOUT */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr] md:gap-8">
          {/* FILTER SIDEBAR */}

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

          {/* PRODUCT AREA */}

          <div>
            {/* SEARCH + SORT */}

            <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="w-full flex-1 sm:max-w-sm">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={
                    searchQuery
                  }
                  onChange={(e) =>
                    handleSearch(
                      e.target
                        .value
                    )
                  }
                  className="w-full rounded-lg border border-[#E7DBC0] bg-white px-4 py-2.5 text-[#26253A] placeholder-[#a89c86] transition-all focus:border-[#F7B407] focus:outline-none focus:ring-2 focus:ring-[#F7B407]"
                  style={{
                    fontFamily:
                      "Lato, sans-serif",
                  }}
                  aria-label="Search products"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) =>
                  handleSortChange(
                    e.target
                      .value as SortOption
                  )
                }
                className="rounded-lg border border-[#E7DBC0] bg-white px-4 py-2.5 text-sm text-[#26253A] transition-all focus:border-[#F7B407] focus:outline-none focus:ring-2 focus:ring-[#F7B407]"
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
                  Price: Low
                  to High
                </option>

                <option value="price-high">
                  Price: High
                  to Low
                </option>

                <option value="newest">
                  Newest
                </option>
              </select>
            </div>

            {/* PRODUCT COUNT */}

            <div
              className="mb-4 text-sm text-[#8a7f6e]"
              style={{
                fontFamily:
                  "Lato, sans-serif",
              }}
              aria-live="polite"
            >
              {isLoading ||
              isFetching ? (
                <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
              ) : products.length >
                0 ? (
                `Showing ${startProduct}-${endProduct} of ${totalProducts} Products`
              ) : null}
            </div>

            {/* PRODUCTS */}

            {isLoading ||
            isFetching ? (
              renderSkeletons()
            ) : error ? (
              renderError()
            ) : products.length >
              0 ? (
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