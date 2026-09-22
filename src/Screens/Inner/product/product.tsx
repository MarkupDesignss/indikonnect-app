"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { usePathname, useSearchParams } from "next/navigation";

import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Truck,
} from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/product/FilterSidebar";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/common/Header";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";

import CustomerFavourites from "./CustomerFavourites";
import StyleFinder from "./StyleFinder";

/* =====================================================
   BASE PATH HELPER
===================================================== */

const BASE_PATH = "/indiekonnect-web";
const LOGO_SRC = `${BASE_PATH}/images/logo.png`;

function withBasePath(path: string): string {
  if (!path) return BASE_PATH;
  if (path === "/") return BASE_PATH;
  if (path.startsWith(BASE_PATH)) return path;

  return `${BASE_PATH}${path.startsWith("/") ? "" : "/"}${path}`;
}

/* =====================================================
   TYPES
===================================================== */

interface FilterState {
  brands: string[];
  categories: string[];
  subCategories: string[];
  priceRange: [number, number];
  availability: {
    inStock: boolean;
    outOfStock: boolean;
  };
}

interface Category {
  id: number;
  title?: string;
  name?: string;
  slug?: string;
  subcategories?: SubCategory[];
}

interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  status: boolean;
  products_count: number;
}

type SortOption =
  | "recommended"
  | "price-low"
  | "price-high"
  | "newest";

type RecommendationSection =
  | "best_sellers"
  | "best_offers";

/* =====================================================
   CONSTANTS
===================================================== */

const PRODUCTS_PER_PAGE = 12;
const MAX_PRICE_LIMIT = 200000;
const SKELETON_COUNT = 8;

/*
 * IMPORTANT
 *
 * Har 2 product rows ke baad section show hoga.
 *
 * 2 rows -> Customer Favourites
 * 2 rows -> Recommended For You
 * 2 rows -> Customer Favourites
 * 2 rows -> Recommended For You
 *
 * And this will continue...
 */
const SECTION_AFTER_ROWS = 2;

const SORT_LABELS: Record<SortOption, string> = {
  recommended: "Best Sellers",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  newest: "Newest First",
};

/* =====================================================
   HELPERS
===================================================== */

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

  const mrp = getProductMrp(
    product,
    accountType,
  );

  const price = getProductPrice(
    product,
    accountType,
  );

  if (
    mrp > 0 &&
    price > 0 &&
    mrp > price
  ) {
    return Math.round(
      ((mrp - price) / mrp) * 100,
    );
  }

  return 0;
};

const getAccountType = (
  profile: any,
): string => {
  const accountType =
    profile?.user?.account_type ??
    profile?.data?.user?.account_type ??
    profile?.data?.account_type ??
    profile?.account_type ??
    "retail";

  const normalized = String(accountType)
    .trim()
    .toLowerCase();

  return normalized === "distributor"
    ? "distributor"
    : "retail";
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function ProductsPage() {
  const searchParams =
    useSearchParams();

  const pathname =
    usePathname();

  /* ===================================================
     REFS
  =================================================== */

  const productsSectionRef =
    useRef<HTMLDivElement | null>(null);

  const lastProductRef =
    useRef<HTMLDivElement | null>(null);

  const endSentinelRef =
    useRef<HTMLDivElement | null>(null);

  const hasTriggeredRef =
    useRef<boolean>(false);

  /* ===================================================
     PROFILE / AUTH
  =================================================== */

  const {
    hasToken,
    userType: storedUserType,
  } = useTokenCheck();

  const {
    data: userProfile,
  } = useGetUserProfileQuery(
    {},
    {
      skip: hasToken !== true,
    },
  );

  const userType = useMemo(() => {
    if (hasToken !== true) {
      return "retail";
    }

    if (userProfile) {
      return getAccountType(
        userProfile,
      );
    }

    return storedUserType ===
      "distributor"
      ? "distributor"
      : "retail";
  }, [
    hasToken,
    userProfile,
    storedUserType,
  ]);

  /* ===================================================
     URL VALUES
  =================================================== */

  const isNewArrivals =
    searchParams.get(
      "new-arrivals",
    ) === "true";

  const getInitialBrands = (): string[] => {
    const brandParam =
      searchParams.get(
        "brand_ids",
      );

    return brandParam
      ? brandParam
          .split(",")
          .map((item) =>
            item.trim(),
          )
          .filter(Boolean)
      : [];
  };

  const getInitialCategories =
    (): string[] => {
      return (
        searchParams
          .get("category")
          ?.split(",")
          .map((item) =>
            decodeURIComponent(
              item,
            ).trim(),
          )
          .filter(Boolean) || []
      );
    };

  const getInitialSubCategories =
    (): string[] => {
      const subCategoryParam =
        searchParams.get(
          "subcategory_ids",
        );

      return subCategoryParam
        ? subCategoryParam
            .split(",")
            .map((item) =>
              item.trim(),
            )
            .filter(Boolean)
        : [];
    };

  const getInitialPriceRange =
    (): [number, number] => {
      const min = Number(
        searchParams.get(
          "min_price",
        ) || 0,
      );

      const max = Number(
        searchParams.get(
          "max_price",
        ) ||
          MAX_PRICE_LIMIT,
      );

      return [
        Number.isFinite(min)
          ? min
          : 0,

        Number.isFinite(max) &&
        max > 0
          ? max
          : MAX_PRICE_LIMIT,
      ];
    };

  const getInitialAvailability =
    () => ({
      inStock:
        searchParams.get(
          "in_stock",
        ) === "true",

      outOfStock:
        searchParams.get(
          "out_of_stock",
        ) === "true",
    });

  const getInitialPage = () => {
    const page = Number(
      searchParams.get("page") ||
        1,
    );

    if (
      !Number.isFinite(page) ||
      page < 1
    ) {
      return 1;
    }

    return page;
  };

  /* ===================================================
     FILTER STATE
  =================================================== */

  const [filters, setFilters] =
    useState<FilterState>(() => ({
      brands:
        getInitialBrands(),

      categories:
        getInitialCategories(),

      subCategories:
        getInitialSubCategories(),

      priceRange:
        getInitialPriceRange(),

      availability:
        getInitialAvailability(),
    }));

  const [currentPage, setCurrentPage] =
    useState<number>(
      getInitialPage,
    );

  const [sortBy, setSortBy] =
    useState<SortOption>(() => {
      const sort =
        searchParams.get(
          "sort",
        );

      if (
        sort ===
          "price-low" ||
        sort ===
          "price-high" ||
        sort === "newest"
      ) {
        return sort;
      }

      return "recommended";
    });

  const [searchQuery, setSearchQuery] =
    useState(
      searchParams.get(
        "search",
      ) || "",
    );

  const [
    isMobileFilterOpen,
    setIsMobileFilterOpen,
  ] = useState(false);

  const [allProducts, setAllProducts] =
    useState<any[]>([]);

  const [
    showFilterLoader,
    setShowFilterLoader,
  ] = useState(false);

  const [
    showEndMessage,
    setShowEndMessage,
  ] = useState(false);

  /* ===================================================
     RESPONSIVE GRID COLUMNS
  =================================================== */

  const [gridColumns, setGridColumns] =
    useState(2);

  useEffect(() => {
    const updateGridColumns =
      () => {
        if (
          window.innerWidth >=
          1024
        ) {
          setGridColumns(4);
        } else if (
          window.innerWidth >=
          768
        ) {
          setGridColumns(3);
        } else {
          setGridColumns(2);
        }
      };

    updateGridColumns();

    window.addEventListener(
      "resize",
      updateGridColumns,
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateGridColumns,
      );
    };
  }, []);

  /* ===================================================
     STABLE REFS
  =================================================== */

  const filtersRef =
    useRef(filters);

  const currentPageRef =
    useRef(currentPage);

  const sortByRef =
    useRef(sortBy);

  const searchQueryRef =
    useRef(searchQuery);

  useEffect(() => {
    filtersRef.current =
      filters;
  }, [filters]);

  useEffect(() => {
    currentPageRef.current =
      currentPage;
  }, [currentPage]);

  useEffect(() => {
    sortByRef.current =
      sortBy;
  }, [sortBy]);

  useEffect(() => {
    searchQueryRef.current =
      searchQuery;
  }, [searchQuery]);

  /* ===================================================
     MOBILE BODY SCROLL LOCK
  =================================================== */

  useEffect(() => {
    if (
      !isMobileFilterOpen
    ) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    isMobileFilterOpen,
  ]);

  /* ===================================================
     ESCAPE KEY
  =================================================== */

  useEffect(() => {
    if (
      !isMobileFilterOpen
    ) {
      return;
    }

    const handleKeyDown =
      (
        event: KeyboardEvent,
      ) => {
        if (
          event.key ===
          "Escape"
        ) {
          setIsMobileFilterOpen(
            false,
          );
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
  }, [
    isMobileFilterOpen,
  ]);

  /* ===================================================
     CATEGORY API
  =================================================== */

  const {
    data: categoriesData,
  } = useGetCategoriesQuery({});

  const categoryIdMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          number
        >();

      categoriesData?.data?.forEach(
        (cat: Category) => {
          const title =
            cat?.title ||
            cat?.name;

          if (
            title &&
            cat?.id != null
          ) {
            map.set(
              title,
              Number(
                cat.id,
              ),
            );
          }
        },
      );

      return map;
    }, [
      categoriesData,
    ]);

  const brandIdMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          number
        >();

      categoriesData?.brands?.forEach(
        (brand: any) => {
          if (
            brand?.id != null
          ) {
            map.set(
              String(
                brand.id,
              ),
              Number(
                brand.id,
              ),
            );
          }
        },
      );

      return map;
    }, [
      categoriesData,
    ]);

  /* ===================================================
     SYNC URL -> STATE
  =================================================== */

  const searchParamsString =
    searchParams.toString();

  useEffect(() => {
    const brandParam =
      searchParams.get(
        "brand_ids",
      );

    const urlBrands = brandParam
      ? brandParam
          .split(",")
          .map((item) =>
            item.trim(),
          )
          .filter(Boolean)
      : [];

    const validBrands =
      categoriesData?.brands
        ?.length
        ? urlBrands.filter(
            (id) =>
              categoriesData.brands.some(
                (brand: any) =>
                  String(
                    brand.id,
                  ) === id,
              ),
          )
        : urlBrands;

    const categoryParam =
      searchParams.get(
        "category",
      );

    const urlCategories =
      categoryParam
        ? categoryParam
            .split(",")
            .map((item) =>
              decodeURIComponent(
                item,
              ).trim(),
            )
            .filter(Boolean)
        : [];

    const validCategories =
      categoriesData?.data?.length
        ? urlCategories.filter(
            (title) =>
              categoriesData.data.some(
                (
                  category: Category,
                ) =>
                  (
                    category.title ||
                    category.name
                  ) === title,
              ),
          )
        : urlCategories;

    const subCategoryParam =
      searchParams.get(
        "subcategory_ids",
      );

    const urlSubCategoryIds =
      subCategoryParam
        ? subCategoryParam
            .split(",")
            .map((item) =>
              item.trim(),
            )
            .filter(Boolean)
        : [];

    const validSubCategoryIds =
      categoriesData?.data?.length
        ? urlSubCategoryIds.filter(
            (id) =>
              categoriesData.data.some(
                (
                  category: Category,
                ) =>
                  (
                    category.subcategories ||
                    []
                  ).some(
                    (
                      subCategory,
                    ) =>
                      String(
                        subCategory.id,
                      ) === id &&
                      subCategory.status ===
                        true,
                  ),
              ),
          )
        : urlSubCategoryIds;

    const minPrice = Number(
      searchParams.get(
        "min_price",
      ) || 0,
    );

    const maxPrice = Number(
      searchParams.get(
        "max_price",
      ) ||
        MAX_PRICE_LIMIT,
    );

    const nextPage = Number(
      searchParams.get(
        "page",
      ) || 1,
    );

    const safePage =
      Number.isFinite(nextPage) &&
      nextPage > 0
        ? nextPage
        : 1;

    const urlSort =
      searchParams.get(
        "sort",
      );

    const nextSort: SortOption =
      urlSort === "price-low" ||
      urlSort ===
        "price-high" ||
      urlSort === "newest"
        ? urlSort
        : "recommended";

    const nextSearch =
      searchParams.get(
        "search",
      ) || "";

    setFilters((prev) => {
      const nextFilters: FilterState =
        {
          brands:
            validBrands,

          categories:
            validCategories,

          subCategories:
            validSubCategoryIds,

          priceRange: [
            Number.isFinite(
              minPrice,
            ) &&
            minPrice >=
              0
              ? minPrice
              : 0,

            Number.isFinite(
              maxPrice,
            ) &&
            maxPrice > 0
              ? maxPrice
              : MAX_PRICE_LIMIT,
          ],

          availability: {
            inStock:
              searchParams.get(
                "in_stock",
              ) === "true",

            outOfStock:
              searchParams.get(
                "out_of_stock",
              ) === "true",
          },
        };

      return JSON.stringify(
        prev,
      ) ===
        JSON.stringify(
          nextFilters,
        )
        ? prev
        : nextFilters;
    });

    setCurrentPage((prev) =>
      prev === safePage
        ? prev
        : safePage,
    );

    setSortBy((prev) =>
      prev === nextSort
        ? prev
        : nextSort,
    );

    setSearchQuery((prev) =>
      prev === nextSearch
        ? prev
        : nextSearch,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParamsString,
    categoriesData,
  ]);

  /* ===================================================
     UPDATE BROWSER URL
  =================================================== */

  const updateBrowserUrl =
    useCallback(
      ({
        nextFilters =
          filtersRef.current,

        nextPage =
          currentPageRef.current,

        nextSort =
          sortByRef.current,

        nextSearch =
          searchQueryRef.current,
      }: {
        nextFilters?: FilterState;
        nextPage?: number;
        nextSort?: SortOption;
        nextSearch?: string;
      } = {}) => {
        const params =
          new URLSearchParams();

        if (
          isNewArrivals
        ) {
          params.set(
            "new-arrivals",
            "true",
          );
        }

        if (
          nextFilters.brands
            .length > 0
        ) {
          params.set(
            "brand_ids",
            nextFilters.brands.join(
              ",",
            ),
          );
        }

        if (
          nextFilters.categories
            .length > 0
        ) {
          params.set(
            "category",
            nextFilters.categories.join(
              ",",
            ),
          );
        }

        if (
          nextFilters
            .subCategories
            .length > 0
        ) {
          params.set(
            "subcategory_ids",
            nextFilters.subCategories.join(
              ",",
            ),
          );
        }

        if (
          nextFilters.priceRange[0] >
          0
        ) {
          params.set(
            "min_price",
            String(
              nextFilters.priceRange[0],
            ),
          );
        }

        if (
          nextFilters.priceRange[1] <
          MAX_PRICE_LIMIT
        ) {
          params.set(
            "max_price",
            String(
              nextFilters.priceRange[1],
            ),
          );
        }

        if (
          nextFilters.availability
            .inStock
        ) {
          params.set(
            "in_stock",
            "true",
          );
        }

        if (
          nextFilters.availability
            .outOfStock
        ) {
          params.set(
            "out_of_stock",
            "true",
          );
        }

        if (
          nextSearch.trim()
        ) {
          params.set(
            "search",
            nextSearch.trim(),
          );
        }

        if (
          nextSort !==
          "recommended"
        ) {
          params.set(
            "sort",
            nextSort,
          );
        }

        if (
          nextPage > 1
        ) {
          params.set(
            "page",
            String(
              nextPage,
            ),
          );
        }

        const queryString =
          params.toString();

        const safePath =
          withBasePath(
            pathname,
          );

        const newUrl =
          queryString
            ? `${safePath}?${queryString}`
            : safePath;

        const currentUrl =
          window.location.pathname +
          window.location.search;

        if (
          newUrl !==
          currentUrl
        ) {
          window.history.replaceState(
            null,
            "",
            newUrl,
          );
        }
      },
      [
        isNewArrivals,
        pathname,
      ],
    );

  /* ===================================================
     API QUERY
  =================================================== */

  const queryParams =
    useMemo(() => {
      const params: Record<
        string,
        any
      > = {
        page:
          currentPage,

        per_page:
          PRODUCTS_PER_PAGE,

        is_published: 1,
      };

      if (
        isNewArrivals
      ) {
        params.new_arrivals =
          true;
      }

      if (
        filters.brands
          .length > 0
      ) {
        const brandIds =
          filters.brands
            .map((id) =>
              brandIdMap.get(
                String(id),
              ),
            )
            .filter(
              (
                id,
              ): id is number =>
                id !==
                undefined,
            )
            .join(",");

        if (brandIds) {
          params.brand_ids =
            brandIds;
        }
      }

      if (
        filters.categories
          .length > 0
      ) {
        const categoryIds =
          filters.categories
            .map((title) =>
              categoryIdMap.get(
                title,
              ),
            )
            .filter(
              (
                id,
              ): id is number =>
                id !==
                undefined,
            )
            .join(",");

        if (categoryIds) {
          params.category_ids =
            categoryIds;
        }
      }

      if (
        filters.subCategories
          .length > 0
      ) {
        const subCategoryIds =
          filters.subCategories
            .map((id) =>
              Number(id),
            )
            .filter(
              (id) =>
                Number.isFinite(
                  id,
                ) &&
                id > 0,
            )
            .join(",");

        if (
          subCategoryIds
        ) {
          params.subcategory_ids =
            subCategoryIds;
        }
      }

      if (
        filters.priceRange[0] >
        0
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

      if (
        searchQuery.trim()
      ) {
        params.search =
          searchQuery.trim();
      }

      switch (sortBy) {
        case "price-low":
          params.sort =
            "price-low";
          break;

        case "price-high":
          params.sort =
            "price-high";
          break;

        case "newest":
          params.sort =
            "newest";
          break;

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
      brandIdMap,
      isNewArrivals,
      userType,
    ]);

  /* ===================================================
     PRODUCTS API
  =================================================== */

  const {
    data: productsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetProductsQuery(
    queryParams,
  );

  const pagination =
    productsData?.pagination;

  const meta =
    productsData?.meta;

  const totalProducts =
    Number(
      pagination?.total ??
        meta?.total ??
        0,
    );

  const lastPage =
    Number(
      pagination?.last_page ??
        meta?.last_page ??
        1,
    );

  const apiCurrentPage =
    Number(
      pagination?.current_page ??
        meta?.current_page ??
        currentPage,
    );

  /* ===================================================
     BRAND BANNERS
  =================================================== */

  const brandBanners =
    useMemo(() => {
      if (
        !Array.isArray(
          productsData?.data,
        )
      ) {
        return [];
      }

      const bannerMap =
        new Map<
          string,
          {
            url: string;
            brandName: string;
          }
        >();

      productsData.data.forEach(
        (product: any) => {
          const banner =
            String(
              product?.brand_banner ??
                product?.brand
                  ?.brand_banner ??
                "",
            ).trim();

          const brandName =
            product?.brand_name ??
            product?.brand
              ?.name ??
            "Brand";

          if (
            banner &&
            !bannerMap.has(
              banner,
            )
          ) {
            bannerMap.set(
              banner,
              {
                url: banner,
                brandName,
              },
            );
          }
        },
      );

      return Array.from(
        bannerMap.values(),
      );
    }, [
      productsData,
    ]);

  const [
    activeBanner,
    setActiveBanner,
  ] = useState(0);

  useEffect(() => {
    setActiveBanner(0);
  }, [
    currentPage,
    brandBanners.length,
  ]);

  useEffect(() => {
    if (
      brandBanners.length <= 1
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setActiveBanner(
          (prev) =>
            (prev + 1) %
            brandBanners.length,
        );
      }, 5000);

    return () =>
      window.clearInterval(
        timer,
      );
  }, [
    brandBanners.length,
  ]);

  /* ===================================================
     INVALID PAGE
  =================================================== */

  useEffect(() => {
    if (
      !isLoading &&
      lastPage > 0 &&
      currentPage >
        lastPage
    ) {
      const validPage =
        lastPage;

      setCurrentPage(
        validPage,
      );

      updateBrowserUrl({
        nextPage:
          validPage,
      });
    }
  }, [
    isLoading,
    lastPage,
    currentPage,
    updateBrowserUrl,
  ]);

  /* ===================================================
     TRANSFORM PRODUCTS
  =================================================== */

  const transformedProducts =
    useMemo(() => {
      if (
        !Array.isArray(
          productsData?.data,
        )
      ) {
        return [];
      }

      return productsData.data.map(
        (product: any) => {
          const price =
            getProductPrice(
              product,
              userType,
            );

          const mrp =
            getProductMrp(
              product,
              userType,
            );

          const discount =
            getDiscountPercentage(
              product,
              userType,
            );

          const stockQuantity =
            Number(
              product?.stock_quantity ??
                product?.stock ??
                0,
            );

          const stockStatus =
            String(
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
            stockStatus !==
              "inactive" &&
            stockStatus !==
              "out_of_stock";

          const images =
            Array.isArray(
              product?.images,
            )
              ? product.images
                  .slice()
                  .sort(
                    (
                      a: any,
                      b: any,
                    ) =>
                      Number(
                        a?.sort_order ??
                          0,
                      ) -
                      Number(
                        b?.sort_order ??
                          0,
                      ),
                  )
                  .map(
                    (
                      image: any,
                    ) =>
                      image?.image_url,
                  )
                  .filter(Boolean)
              : [];

          const finalImages =
            images.length > 0
              ? images
              : [
                  product.primary_image_url ||
                    product.image_url ||
                    product.image ||
                    "/images/placeholder.jpg",
                ];

          return {
            id:
              product.id,

            name:
              product.name,

            slug:
              product.slug,

            category:
              product?.category
                ?.name ||
              product?.category
                ?.title ||
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
              finalImages[0],

            images:
              finalImages,

            rating:
              Number(
                product
                  ?.reviews_summary
                  ?.average_rating ??
                  product?.average_rating ??
                  product?.rating ??
                  0,
              ) || 0,

            reviews:
              Number(
                product
                  ?.reviews_summary
                  ?.total_reviews ??
                  product?.review_count ??
                  product?.reviews_count ??
                  0,
              ) || 0,

            inStock,

            stockQuantity,

            stockStatus,

            userType,

            brandId:
              product?.brand_id,

            brandName:
              product?.brand_name ||
              product?.brand
                ?.name ||
              "",

            brandBanner:
              product?.brand_banner ||
              product?.brand
                ?.brand_banner ||
              "",
          };
        },
      );
    }, [
      productsData,
      userType,
    ]);

  /* ===================================================
     ACCUMULATE PRODUCTS
  =================================================== */

  useEffect(() => {
    if (
      !transformedProducts.length
    ) {
      if (
        !isFetching &&
        !isLoading
      ) {
        setAllProducts([]);
      }

      return;
    }

    setAllProducts(
      (prev) => {
        if (
          apiCurrentPage === 1
        ) {
          return transformedProducts;
        }

        const existingIds =
          new Set(
            prev.map(
              (p) => p.id,
            ),
          );

        const newItems =
          transformedProducts.filter(
            (p) =>
              !existingIds.has(
                p.id,
              ),
          );

        return [
          ...prev,
          ...newItems,
        ];
      },
    );
  }, [
    transformedProducts,
    apiCurrentPage,
    isFetching,
    isLoading,
  ]);

  /* ===================================================
     RESET ACCUMULATED LIST
  =================================================== */

  const filterSignature =
    useMemo(
      () =>
        JSON.stringify({
          filters,
          sortBy,
          searchQuery,
          isNewArrivals,
        }),
      [
        filters,
        sortBy,
        searchQuery,
        isNewArrivals,
      ],
    );

  const prevFilterSignatureRef =
    useRef<string>(
      filterSignature,
    );

  useEffect(() => {
    if (
      prevFilterSignatureRef.current ===
      filterSignature
    ) {
      return;
    }

    prevFilterSignatureRef.current =
      filterSignature;

    setAllProducts([]);

    hasTriggeredRef.current =
      false;

    setShowEndMessage(
      false,
    );

    setShowFilterLoader(
      true,
    );

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });
    });
  }, [
    filterSignature,
  ]);

  /* ===================================================
     TURN OFF FILTER LOADER
  =================================================== */

  useEffect(() => {
    if (
      !isFetching &&
      !isLoading &&
      showFilterLoader
    ) {
      setShowFilterLoader(
        false,
      );
    }
  }, [
    isFetching,
    isLoading,
    showFilterLoader,
  ]);

  /* ===================================================
     INFINITE SCROLL
  =================================================== */

  useEffect(() => {
    const node =
      lastProductRef.current;

    if (!node) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (
            !entry.isIntersecting
          ) {
            hasTriggeredRef.current =
              false;

            return;
          }

          if (
            hasTriggeredRef.current
          ) {
            return;
          }

          if (
            isLoading ||
            isFetching
          ) {
            return;
          }

          if (
            currentPage >=
            lastPage
          ) {
            return;
          }

          hasTriggeredRef.current =
            true;

          setCurrentPage(
            (prev) =>
              prev + 1,
          );
        },
        {
          root: null,
          rootMargin:
            "0px 0px 300px 0px",
          threshold: 0.15,
        },
      );

    observer.observe(node);

    return () =>
      observer.disconnect();
  }, [
    isLoading,
    isFetching,
    currentPage,
    lastPage,
    allProducts.length,
  ]);

  /* ===================================================
     END-OF-LIST
  =================================================== */

  const hasMore =
    currentPage <
    lastPage;

  const hasMoreStateRef =
    useRef<boolean>(
      hasMore,
    );

  useEffect(() => {
    hasMoreStateRef.current =
      hasMore;
  }, [hasMore]);

  useEffect(() => {
    const node =
      endSentinelRef.current;

    if (!node) {
      return;
    }

    if (
      hasMoreStateRef.current
    ) {
      setShowEndMessage(
        false,
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (
            !entry.isIntersecting
          ) {
            return;
          }

          if (
            isLoading ||
            isFetching
          ) {
            return;
          }

          if (
            hasMoreStateRef.current
          ) {
            return;
          }

          setShowEndMessage(
            true,
          );
        },
        {
          root: null,
          rootMargin:
            "0px 0px 120px 0px",
          threshold: 0.1,
        },
      );

    observer.observe(node);

    return () =>
      observer.disconnect();
  }, [
    isLoading,
    isFetching,
    allProducts.length,
    hasMore,
  ]);

  /* ===================================================
     SCROLL TO PRODUCTS
  =================================================== */

  const scrollToProducts =
    useCallback(() => {
      const section =
        productsSectionRef.current;

      if (!section) {
        return;
      }

      const headerOffset =
        90;

      const elementTop =
        section.getBoundingClientRect()
          .top +
        window.scrollY;

      const targetPosition =
        Math.max(
          0,
          elementTop -
            headerOffset,
        );

      window.scrollTo({
        top: targetPosition,
        behavior:
          "smooth",
      });
    }, []);

  /* ===================================================
     HANDLERS
  =================================================== */

  const handleFilterChange =
    useCallback(
      (
        newFilters: FilterState,
      ) => {
        setFilters(
          newFilters,
        );

        setCurrentPage(1);

        setAllProducts([]);

        hasTriggeredRef.current =
          false;

        setShowEndMessage(
          false,
        );

        setShowFilterLoader(
          true,
        );

        updateBrowserUrl({
          nextFilters:
            newFilters,
          nextPage: 1,
        });

        requestAnimationFrame(
          () => {
            window.scrollTo({
              top: 0,
              behavior:
                "smooth",
            });
          },
        );
      },
      [
        updateBrowserUrl,
      ],
    );

  const handleSearch =
    useCallback(
      (query: string) => {
        setSearchQuery(
          query,
        );

        setCurrentPage(1);

        setAllProducts([]);

        hasTriggeredRef.current =
          false;

        setShowEndMessage(
          false,
        );

        setShowFilterLoader(
          true,
        );

        updateBrowserUrl({
          nextSearch:
            query,
          nextPage: 1,
        });

        requestAnimationFrame(
          () => {
            window.scrollTo({
              top: 0,
              behavior:
                "smooth",
            });
          },
        );
      },
      [
        updateBrowserUrl,
      ],
    );

  const handleSortChange =
    useCallback(
      (
        sort: SortOption,
      ) => {
        setSortBy(sort);

        setCurrentPage(1);

        setAllProducts([]);

        hasTriggeredRef.current =
          false;

        setShowEndMessage(
          false,
        );

        setShowFilterLoader(
          true,
        );

        updateBrowserUrl({
          nextSort:
            sort,
          nextPage: 1,
        });

        requestAnimationFrame(
          () => {
            window.scrollTo({
              top: 0,
              behavior:
                "smooth",
            });
          },
        );
      },
      [
        updateBrowserUrl,
      ],
    );

  const handlePageChange =
    useCallback(
      (page: number) => {
        if (
          page < 1 ||
          page > lastPage
        ) {
          return;
        }

        setCurrentPage(
          page,
        );

        setAllProducts([]);

        hasTriggeredRef.current =
          false;

        setShowEndMessage(
          false,
        );

        setShowFilterLoader(
          true,
        );

        updateBrowserUrl({
          nextPage:
            page,
        });

        requestAnimationFrame(
          () => {
            window.scrollTo({
              top: 0,
              behavior:
                "smooth",
            });
          },
        );
      },
      [
        lastPage,
        updateBrowserUrl,
      ],
    );

  const handleClearFilters =
    useCallback(() => {
      const newFilters: FilterState =
        {
          brands: [],
          categories: [],
          subCategories: [],
          priceRange: [
            0,
            MAX_PRICE_LIMIT,
          ],
          availability: {
            inStock: false,
            outOfStock:
              false,
          },
        };

      setFilters(
        newFilters,
      );

      setSearchQuery("");

      setSortBy(
        "recommended",
      );

      setCurrentPage(1);

      setIsMobileFilterOpen(
        false,
      );

      setAllProducts([]);

      hasTriggeredRef.current =
        false;

      setShowEndMessage(
        false,
      );

      setShowFilterLoader(
        true,
      );

      const params =
        new URLSearchParams();

      if (
        isNewArrivals
      ) {
        params.set(
          "new-arrivals",
          "true",
        );
      }

      const queryString =
        params.toString();

      const safePath =
        withBasePath(
          pathname,
        );

      const url =
        queryString
          ? `${safePath}?${queryString}`
          : safePath;

      window.history.replaceState(
        null,
        "",
        url,
      );

      requestAnimationFrame(
        () => {
          window.scrollTo({
            top: 0,
            behavior:
              "smooth",
          });
        },
      );
    }, [
      isNewArrivals,
      pathname,
    ]);

  /* ===================================================
     SORT SELECT
  =================================================== */

  const renderSortSelect =
    () => (
      <div className="relative flex w-full items-center rounded-xl border border-[#c9ccd1] bg-white px-4 py-3 transition-colors focus-within:border-[#111111]">
        <span className="pointer-events-none whitespace-nowrap text-[14px] uppercase text-[#8a8f98]">
          Sort by:
        </span>

        <select
          value={sortBy}
          onChange={(event) =>
            handleSortChange(
              event.target
                .value as SortOption,
            )
          }
          className="ml-2 w-full cursor-pointer appearance-none bg-transparent pr-6 text-[15px] font-medium text-[#111111] outline-none"
          aria-label="Sort products"
        >
          {(
            Object.keys(
              SORT_LABELS,
            ) as SortOption[]
          ).map(
            (option) => (
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
            ),
          )}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]" />
      </div>
    );

  /* ===================================================
     SKELETON
  =================================================== */

  const renderSkeletons =
    () => (
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8">
        {Array.from({
          length:
            SKELETON_COUNT,
        }).map(
          (
            _,
            index,
          ) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl bg-white"
            >
              <div className="aspect-square w-full animate-pulse rounded-2xl bg-[#f3f3f3]" />

              <div className="space-y-2 pt-3">
                <div className="h-3 w-14 animate-pulse rounded-full bg-[#ededed]" />

                <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#ededed]" />

                <div className="h-3 w-1/2 animate-pulse rounded bg-[#ededed]" />
              </div>
            </div>
          ),
        )}
      </div>
    );

  /* ===================================================
     ERROR
  =================================================== */

  const renderError =
    () => (
      <div className="py-16 text-center">
        <div className="mb-4 text-4xl">
          ⚠️
        </div>

        <h3 className="mb-2 text-lg font-semibold text-[#111111]">
          Failed to load products
        </h3>

        <p className="mb-4 text-sm text-[#8b918f]">
          Please try refreshing the
          page
        </p>

        <button
          onClick={() =>
            refetch()
          }
          className="rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
        >
          Retry
        </button>
      </div>
    );

  /* ===================================================
     EMPTY
  =================================================== */

  const renderEmptyState =
    () => (
      <div className="py-16 text-center">
        <div className="mb-4 text-5xl">
          🔍
        </div>

        <p className="text-base text-[#8b918f]">
          No products found
          matching your criteria
        </p>

        <button
          onClick={
            handleClearFilters
          }
          className="mt-4 rounded-full px-4 py-2 text-sm font-medium text-[#111111] underline underline-offset-4"
        >
          Clear all filters
        </button>
      </div>
    );

  /* ===================================================
     BRAND LOADER
  =================================================== */

  const renderBrandLoader =
    () => (
      <motion.div
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className="flex items-center justify-center py-10"
      >
        <div className="flex items-center gap-3 rounded-full border border-[#ece9e2] bg-white px-6 py-3 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.12)]">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-transparent border-r-[#111111] border-t-[#111111]"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat:
                  Infinity,
                ease: "linear",
              }}
            />

            <span className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white">
              <img
                src={LOGO_SRC}
                alt="Indiekonnect"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (
                    e.target as HTMLImageElement
                  ).style.display =
                    "none";
                }}
              />
            </span>
          </div>

          <span className="text-[13px] font-semibold tracking-wide text-[#111111]">
            Indiekonnect —
            Loading more
          </span>
        </div>
      </motion.div>
    );

  /* ===================================================
     COUNTS
  =================================================== */

  const products =
    allProducts;

  const showInitialSkeleton =
    isLoading &&
    products.length ===
      0;

  const activeFilterCount =
    filters.brands
      .length +
    filters.categories
      .length +
    filters.subCategories
      .length +
    Object.values(
      filters.availability,
    ).filter(
      Boolean,
    ).length;

  const pageTitle =
    isNewArrivals
      ? "New Arrivals"
      : "Collection";

  const isInitialLoading =
    (isLoading ||
      isFetching) &&
    allProducts.length ===
      0 &&
    !showFilterLoader;

  const isFilterLoading =
    showFilterLoader;

  const isAppending =
    isFetching &&
    allProducts.length >
      0;

  /* ===================================================
     SECTION INSERTIONS
     
     IMPORTANT:
     Har 2 COMPLETE product rows ke baad
     next section insert hoga.
     
     2 rows -> Customer Favourites
     2 rows -> Recommended For You
     2 rows -> Customer Favourites
     2 rows -> Recommended For You
     2 rows -> Customer Favourites
     ...
  =================================================== */

  const sectionInsertions =
    useMemo(() => {
      const insertionMap =
        new Map<
          number,
          RecommendationSection
        >();

      if (
        products.length === 0 ||
        gridColumns <= 0
      ) {
        return insertionMap;
      }

      /*
       * sectionIndex:
       *
       * 0 = Customer Favourites
       * 1 = Recommended For You
       * 2 = Customer Favourites
       * 3 = Recommended For You
       */
      let sectionIndex = 0;

      for (
        let productPosition = 1;
        productPosition <=
          products.length;
        productPosition++
      ) {
        /*
         * Sirf complete row ke baad
         * section insert hoga.
         */
        const isCompleteRow =
          productPosition %
            gridColumns ===
          0;

        if (!isCompleteRow) {
          continue;
        }

        const completedRows =
          productPosition /
          gridColumns;

        /*
         * Har 2 rows ke baad.
         *
         * 2, 4, 6, 8...
         */
        const shouldInsert =
          completedRows %
            SECTION_AFTER_ROWS ===
          0;

        /*
         * Last product ke baad section
         * nahi dikhana.
         */
        const hasProductsAfter =
          productPosition <
          products.length;

        if (
          shouldInsert &&
          hasProductsAfter
        ) {
          const section:
            RecommendationSection =
            sectionIndex % 2 === 0
              ? "best_sellers"
              : "best_offers";

          insertionMap.set(
            productPosition,
            section,
          );

          sectionIndex++;
        }
      }

      return insertionMap;
    }, [
      products.length,
      gridColumns,
    ]);

  /* ===================================================
     RETURN
  =================================================== */

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily:
          "Poppins, Lato, sans-serif",
      }}
    >
      <Header />

      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_minmax(0,1fr)] lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8">

          {/* =================================================
             DESKTOP SIDEBAR
          ================================================== */}

          <aside className="hidden md:block">
            <div className="sticky top-24">
              <div className="mb-5 bg-white">
                <div className="mb-5 flex items-center gap-2 text-[14px]">
                  <span className="text-[#8a8f98]">
                    Home
                  </span>

                  <ChevronRight className="h-3.5 w-3.5 text-[#adb4be]" />

                  <span className="font-medium text-[#111111]">
                    {
                      pageTitle
                    }
                  </span>
                </div>

                <div>
                  {renderSortSelect()}
                </div>
              </div>

              <div className="h-auto">
                <FilterSidebar
                  onFilterChange={
                    handleFilterChange
                  }
                  maxPrice={
                    MAX_PRICE_LIMIT
                  }
                />
              </div>
            </div>
          </aside>

          {/* =================================================
             PRODUCTS
          ================================================== */}

          <main
            ref={
              productsSectionRef
            }
            className="min-w-0 scroll-mt-[90px]"
          >
            {/* ITEMS COUNT + SEARCH */}

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-[14px] text-[#6b7078]">
                {isInitialLoading ||
                isFilterLoading ? (
                  <div className="h-4 w-56 animate-pulse rounded bg-[#e9e9e9]" />
                ) : (
                  <span>
                    <span className="font-medium">
                      {totalProducts.toLocaleString(
                        "en-IN",
                      )}{" "}
                      items
                    </span>

                    <span className="mx-1.5 text-[#c5c8cd]">
                      |
                    </span>

                    <span>
                      Curated
                      selections
                      for you
                    </span>
                  </span>
                )}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f949a]" />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={
                    searchQuery
                  }
                  onChange={(
                    event,
                  ) =>
                    handleSearch(
                      event.target
                        .value,
                    )
                  }
                  className="w-full rounded-full border border-[#e2e4e7] bg-white py-2 pl-9 pr-4 text-[13px] text-[#111111] placeholder-[#9a9da2] outline-none transition-all focus:border-[#111111]"
                />
              </div>
            </div>

            {/* MOBILE SORT */}

            <div className="mb-4 md:hidden">
              {renderSortSelect()}
            </div>

            {/* BRAND BANNER */}

            {!isInitialLoading &&
              !isFilterLoading &&
              brandBanners.length >
                0 && (
                <div className="mb-3">
                  <div className="relative overflow-hidden rounded-[8px] bg-[#f8f8f8]">
                    <div className="relative aspect-[7/1] min-h-[42px] w-full overflow-hidden sm:aspect-[10/1] sm:min-h-[36px] md:aspect-[12/1] md:min-h-[32px] lg:aspect-[14.4/1] lg:min-h-[28px] xl:min-h-[24px]">
                      <AnimatePresence
                        initial={
                          false
                        }
                        mode="wait"
                      >
                        <motion.img
                          key={
                            brandBanners[
                              activeBanner
                            ]?.url
                          }
                          src={
                            brandBanners[
                              activeBanner
                            ]?.url
                          }
                          alt={
                            brandBanners[
                              activeBanner
                            ]?.brandName ||
                            "Brand banner"
                          }
                          className="absolute inset-0 h-full w-full object-cover object-center"
                          initial={{
                            opacity: 0,
                            x: 18,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -18,
                          }}
                          transition={{
                            duration:
                              0.3,
                            ease: "easeOut",
                          }}
                        />
                      </AnimatePresence>

                      {brandBanners.length >
                        1 && (
                        <div className="absolute bottom-1 right-2 flex items-center gap-1 rounded-full bg-white/75 px-1.5 py-0.5 backdrop-blur-sm">
                          {brandBanners.map(
                            (
                              _,
                              index,
                            ) => (
                              <button
                                key={
                                  index
                                }
                                type="button"
                                onClick={() =>
                                  setActiveBanner(
                                    index,
                                  )
                                }
                                className={`h-0.5 rounded-full transition-all ${
                                  activeBanner ===
                                  index
                                    ? "w-2.5 bg-[#111111]"
                                    : "w-0.5 bg-[#a9a9a9]"
                                }`}
                                aria-label={`Go to banner ${
                                  index +
                                  1
                                }`}
                              />
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* SHIPPING */}

            <div className="mb-3 flex flex-col gap-2 rounded-[9px] border border-[#f0eee9] bg-gradient-to-r from-[#fff0d4] via-[#fff7ea] to-[#fffdf8] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5a623]/10">
                  <Truck className="h-3.5 w-3.5 text-[#f08a00]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[12px] font-semibold text-[#171717]">
                      Fast Shipping
                    </h3>

                    <ArrowRight className="h-3 w-3 text-[#222222]" />
                  </div>

                  <p className="text-[9px] text-[#5e5e5e] sm:text-[10px]">
                    Quick dispatch on all
                    orders, delivered securely
                    to your doorstep
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="rounded-full border border-[#eadfcf] bg-white/70 px-2.5 py-1 text-[9px] font-medium text-[#6b5a43]">
                  Safe & Secure Delivery
                </span>
              </div>
            </div>

            {/* =================================================
               PRODUCT COUNT
            ================================================== */}

            <div
              className="mb-3 flex items-center justify-between gap-3"
              style={{
                fontFamily:
                  "Lato, sans-serif",
              }}
            >
              <div className="min-w-0">
                {!showInitialSkeleton &&
                  totalProducts >
                    0 && (
                    <div className="mt-0.5 text-[9px] text-[#a0a0a0]">
                      Curated
                      selections
                      for you
                    </div>
                  )}
              </div>
            </div>

            {/* =================================================
               PRODUCTS LIST
            ================================================== */}

            {showInitialSkeleton ? (
              renderSkeletons()
            ) : error &&
              products.length ===
                0 ? (
              renderError()
            ) : products.length >
              0 ? (
              <>
                <div
                  className={`grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-4 xl:gap-y-6 transition-opacity duration-200 ${
                    isFetching &&
                    !isAppending
                      ? "opacity-60"
                      : "opacity-100"
                  }`}
                >
                  {products.map(
                    (
                      product: any,
                      index: number,
                    ) => {
                      const isLastItem =
                        index ===
                        products.length -
                          1;

                      const productPosition =
                        index + 1;

                      /*
                       * Check if this product
                       * completes a row.
                       */
                      const isCompleteRow =
                        productPosition %
                          gridColumns ===
                        0;

                      /*
                       * Section insertion
                       * decided from exact
                       * product position.
                       */
                      const sectionToInsert =
                        sectionInsertions.get(
                          productPosition,
                        );

                      const shouldShowSection =
                        isCompleteRow &&
                        Boolean(
                          sectionToInsert,
                        ) &&
                        productPosition <
                          products.length;

                      return (
                        <React.Fragment
                          key={`product-group-${product.id}`}
                        >
                          {/* PRODUCT */}
                          <div
                            ref={
                              isLastItem
                                ? lastProductRef
                                : undefined
                            }
                            className="min-w-0 overflow-hidden rounded-2xl bg-white [&_button]:rounded-full"
                          >
                            <ProductCard
                              product={
                                product
                              }
                              hasToken={
                                hasToken ===
                                true
                              }
                            />
                          </div>

                          {/* =================================================
                             CUSTOMER FAVOURITES
                          ================================================== */}

                          {shouldShowSection &&
                            sectionToInsert ===
                              "best_sellers" && (
                              <div className="col-span-full w-full">
                                <CustomerFavourites
                                  section="best_sellers"
                                  title="Customer Favourites"
                                />
                              </div>
                            )}

                          {/* =================================================
                             RECOMMENDED FOR YOU
                          ================================================== */}

                          {shouldShowSection &&
                            sectionToInsert ===
                              "best_offers" && (
                              <div className="col-span-full w-full">
                                <CustomerFavourites
                                  section="best_offers"
                                  title="Recommended For You"
                                />
                              </div>
                            )}
                        </React.Fragment>
                      );
                    },
                  )}
                </div>

                {/* END SENTINEL */}

                <div
                  ref={
                    endSentinelRef
                  }
                  className="h-4 w-full"
                />

                {/* APPENDING LOADER */}

                {isAppending &&
                  renderBrandLoader()}

                {/* END MESSAGE */}

                {showEndMessage &&
                  !hasMore &&
                  products.length >
                    0 && (
                    <div className="py-8 text-center text-[12px] text-[#999999]">
                      You've reached
                      the end —{" "}
                      {
                        totalProducts
                      }{" "}
                      products
                    </div>
                  )}
              </>
            ) : (
              renderEmptyState()
            )}
          </main>
        </div>
      </div>

      {/* =====================================================
         MOBILE FILTER BUTTON
      ====================================================== */}

      <AnimatePresence>
        {!isMobileFilterOpen && (
          <motion.button
            type="button"
            onClick={() =>
              setIsMobileFilterOpen(
                true,
              )
            }
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.9,
            }}
            whileTap={{
              scale: 0.96,
            }}
            className="fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full bg-[#101827] px-4 py-3 text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] md:hidden"
            aria-label="Open product filters"
          >
            <SlidersHorizontal className="h-4 w-4" />

            <span className="text-[12px] font-semibold uppercase tracking-wide">
              Filter
            </span>

            {activeFilterCount >
              0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-[#101827]">
                {
                  activeFilterCount
                }
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* =====================================================
         MOBILE FILTER OVERLAY + DRAWER
      ====================================================== */}

      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Overlay */}

            <motion.div
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] md:hidden"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={() =>
                setIsMobileFilterOpen(
                  false,
                )
              }
            />

            {/* Drawer */}

            <motion.div
              className="fixed inset-x-0 bottom-0 z-[60] md:hidden"
              initial={{
                y: "100%",
              }}
              animate={{
                y: 0,
              }}
              exit={{
                y: "100%",
              }}
              transition={{
                type: "spring",
                stiffness: 340,
                damping: 34,
                mass: 0.85,
              }}
            >
              <div className="mx-auto max-w-2xl">
                <div
                  className="
                    h-auto
                    max-h-[88vh]
                    overflow-y-auto
                    overscroll-contain
                    touch-pan-y
                    rounded-t-2xl
                    bg-white
                    [-webkit-overflow-scrolling:touch]
                    [scrollbar-width:thin]
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-[#d4d4d4]
                    [&::-webkit-scrollbar-track]:bg-transparent
                  "
                >
                  <FilterSidebar
                    mobile
                    onMobileClose={() =>
                      setIsMobileFilterOpen(
                        false,
                      )
                    }
                    onFilterChange={
                      handleFilterChange
                    }
                    maxPrice={
                      MAX_PRICE_LIMIT
                    }
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
       

      <Footer />
        
      <div className="h-20 md:hidden" />

      <StyleFinder />
    </div>
  );
}