"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";
<<<<<<< Updated upstream
import { usePathname, useSearchParams } from "next/navigation";
=======
import { useTokenCheck } from "@/hooks/useTokenCheck";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";
>>>>>>> Stashed changes

import {
  ChevronDown,
  ChevronRight,
  Truck,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/product/FilterSidebar";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/common/Header";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";

/* =====================================================
   BASE PATH HELPER
===================================================== */

const BASE_PATH = "/indiekonnect-web";
const LOGO_SRC = `${BASE_PATH}/images/logo.png`;

function withBasePath(path: string): string {
  if (!path) return BASE_PATH;
  if (path === "/") return BASE_PATH;
  if (path.startsWith(BASE_PATH)) return path;

<<<<<<< Updated upstream
  return `${BASE_PATH}${path.startsWith("/") ? "" : "/"}${path}`;
=======
  return `${BASE_PATH}${path.startsWith("/") ? "" : "/"
    }${path}`;
>>>>>>> Stashed changes
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

/* =====================================================
   CONSTANTS
===================================================== */

const PRODUCTS_PER_PAGE = 12;
const MAX_PRICE_LIMIT = 200000;
const SKELETON_COUNT = 8;

/* =====================================================
   SORT LABELS
===================================================== */

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

  const type = String(accountType || "").trim().toLowerCase();

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

  const type = String(accountType || "").trim().toLowerCase();

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

const getAccountType = (profile: any): string => {
  const accountType =
    profile?.user?.account_type ??
    profile?.data?.user?.account_type ??
    profile?.data?.account_type ??
    profile?.account_type ??
    "retail";

  const normalized = String(accountType).trim().toLowerCase();

  return normalized === "distributor" ? "distributor" : "retail";
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function ProductsPage(): JSX.Element {
  const searchParams = useSearchParams();
  const pathname = usePathname();

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
     PROFILE
  =================================================== */

<<<<<<< Updated upstream
  const { data: userProfile } =
    useGetUserProfileQuery({});

  const userType = useMemo(
    () => getAccountType(userProfile),
    [userProfile],
=======
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
>>>>>>> Stashed changes
  );

  const userType = useMemo(() => {
    // Guest user → always retail
    if (hasToken !== true) {
      return "retail";
    }

    // Logged-in user → profile value
    if (userProfile) {
      return getAccountType(userProfile);
    }

    // Fallback from localStorage user_type
    return storedUserType === "distributor"
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
    searchParams.get("new-arrivals") === "true";

  const getInitialBrands = (): string[] => {
    const brandParam = searchParams.get("brand_ids");

<<<<<<< Updated upstream
    return brandParam
      ? brandParam
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
      : [];
  };
=======
      return brandParam
        ? brandParam
          .split(",")
          .map((item) =>
            item.trim(),
          )
          .filter(Boolean)
        : [];
    };
>>>>>>> Stashed changes

  const getInitialCategories = (): string[] => {
    return (
      searchParams
        .get("category")
        ?.split(",")
        .map((i) => decodeURIComponent(i).trim())
        .filter(Boolean) || []
    );
  };

  const getInitialSubCategories = (): string[] => {
    const subCategoryParam =
      searchParams.get("subcategory_ids");

<<<<<<< Updated upstream
    return subCategoryParam
      ? subCategoryParam
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
      : [];
  };
=======
      return subCategoryParam
        ? subCategoryParam
          .split(",")
          .map((item) =>
            item.trim(),
          )
          .filter(Boolean)
        : [];
    };
>>>>>>> Stashed changes

  const getInitialPriceRange = (): [number, number] => {
    const min = Number(
      searchParams.get("min_price") || 0,
    );

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

<<<<<<< Updated upstream
  const getInitialAvailability = () => ({
    inStock:
      searchParams.get("in_stock") === "true",
    outOfStock:
      searchParams.get("out_of_stock") === "true",
  });

  const getInitialPage = () => {
    const page = Number(
      searchParams.get("page") || 1,
=======
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
>>>>>>> Stashed changes
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
      brands: getInitialBrands(),
      categories: getInitialCategories(),
      subCategories: getInitialSubCategories(),
      priceRange: getInitialPriceRange(),
      availability: getInitialAvailability(),
    }));

  const [currentPage, setCurrentPage] =
    useState<number>(getInitialPage);

  const [sortBy, setSortBy] =
    useState<SortOption>(() => {
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

  const [searchQuery, setSearchQuery] =
    useState(
      searchParams.get("search") || "",
    );

  const [isMobileFilterOpen, setIsMobileFilterOpen] =
    useState(false);

  /* ===================================================
     ACCUMULATED PRODUCTS
  =================================================== */

  const [allProducts, setAllProducts] =
    useState<any[]>([]);

  /* ===================================================
     LOADER
  =================================================== */

  const [showFilterLoader, setShowFilterLoader] =
    useState(false);

  /* ===================================================
     END MESSAGE
  =================================================== */

  const [showEndMessage, setShowEndMessage] =
    useState(false);

  /* ===================================================
     STABLE REFS
  =================================================== */

  const filtersRef = useRef(filters);
  const currentPageRef = useRef(currentPage);
  const sortByRef = useRef(sortBy);
  const searchQueryRef = useRef(searchQuery);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  /* ===================================================
     MOBILE BODY SCROLL LOCK
  =================================================== */

  useEffect(() => {
    if (!isMobileFilterOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

  /* ===================================================
     ESCAPE KEY
  =================================================== */

  useEffect(() => {
    if (!isMobileFilterOpen) return;

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setIsMobileFilterOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isMobileFilterOpen]);

  /* ===================================================
     CATEGORY API
  =================================================== */

  const { data: categoriesData } =
    useGetCategoriesQuery({});

  /* ===================================================
     CATEGORY MAP
  =================================================== */

  const categoryIdMap = useMemo(() => {
    const map = new Map<string, number>();

    categoriesData?.data?.forEach(
      (cat: Category) => {
        const title = cat?.title || cat?.name;

        if (
          title &&
          cat?.id != null
        ) {
          map.set(
            title,
            Number(cat.id),
          );
        }
      },
    );

    return map;
  }, [categoriesData]);

  /* ===================================================
     BRAND MAP
  =================================================== */

  const brandIdMap = useMemo(() => {
    const map = new Map<string, number>();

    categoriesData?.brands?.forEach(
      (brand: any) => {
        if (brand?.id != null) {
          map.set(
            String(brand.id),
            Number(brand.id),
          );
        }
      },
    );

    return map;
  }, [categoriesData]);

  /* ===================================================
     SYNC URL -> STATE
  =================================================== */

  const searchParamsString =
    searchParams.toString();

  useEffect(() => {
    const brandParam =
      searchParams.get("brand_ids");

    const urlBrands = brandParam
      ? brandParam
<<<<<<< Updated upstream
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
      : [];

    const validBrands =
      categoriesData?.brands?.length
        ? urlBrands.filter((id) =>
            categoriesData.brands.some(
              (b: any) =>
                String(b.id) === id,
            ),
          )
=======
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
>>>>>>> Stashed changes
        : urlBrands;

    const categoryParam =
      searchParams.get("category");

<<<<<<< Updated upstream
    const urlCategories = categoryParam
      ? categoryParam
          .split(",")
          .map((i) =>
            decodeURIComponent(i).trim(),
          )
          .filter(Boolean)
      : [];

    const validCategories =
      categoriesData?.data?.length
        ? urlCategories.filter((title) =>
            categoriesData.data.some(
              (c: Category) =>
                (c.title || c.name) ===
                title,
            ),
          )
=======
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
      categoriesData?.data
        ?.length
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
>>>>>>> Stashed changes
        : urlCategories;

    const subCategoryParam =
      searchParams.get("subcategory_ids");

    const urlSubCategoryIds =
      subCategoryParam
        ? subCategoryParam
<<<<<<< Updated upstream
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
=======
          .split(",")
          .map((item) =>
            item.trim(),
          )
          .filter(Boolean)
>>>>>>> Stashed changes
        : [];

    const validSubCategoryIds =
      categoriesData?.data?.length
        ? urlSubCategoryIds.filter(
<<<<<<< Updated upstream
            (id) =>
              categoriesData.data.some(
                (c: Category) =>
                  (c.subcategories || []).some(
                    (s) =>
                      String(s.id) === id &&
                      s.status === true,
                  ),
              ),
          )
=======
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
>>>>>>> Stashed changes
        : urlSubCategoryIds;

    const minPrice = Number(
      searchParams.get("min_price") || 0,
    );

    const maxPrice = Number(
      searchParams.get("max_price") ||
        MAX_PRICE_LIMIT,
    );

    const nextPage = Number(
<<<<<<< Updated upstream
      searchParams.get("page") || 1,
=======
      searchParams.get("page") ||
      1,
>>>>>>> Stashed changes
    );

    const safePage =
      Number.isFinite(nextPage) &&
      nextPage > 0
        ? nextPage
        : 1;

    const urlSort =
      searchParams.get("sort");

    const nextSort: SortOption =
      urlSort === "price-low" ||
        urlSort === "price-high" ||
        urlSort === "newest"
        ? urlSort
        : "recommended";

    const nextSearch =
      searchParams.get("search") || "";

    setFilters((prev) => {
<<<<<<< Updated upstream
      const nextFilters: FilterState = {
        brands: validBrands,
        categories: validCategories,
        subCategories:
          validSubCategoryIds,
        priceRange: [
          Number.isFinite(minPrice) &&
          minPrice >= 0
            ? minPrice
            : 0,

          Number.isFinite(maxPrice) &&
          maxPrice > 0
            ? maxPrice
            : MAX_PRICE_LIMIT,
        ],
        availability: {
          inStock:
            searchParams.get("in_stock") ===
            "true",

          outOfStock:
            searchParams.get(
              "out_of_stock",
            ) === "true",
        },
      };

      if (
        JSON.stringify(prev) ===
        JSON.stringify(nextFilters)
      ) {
        return prev;
      }

      return nextFilters;
=======
      const nextFilters: FilterState =
      {
        brands: validBrands,

        categories:
          validCategories,

        subCategories:
          validSubCategoryIds,

        priceRange: [
          Number.isFinite(
            minPrice,
          ) &&
            minPrice >= 0
            ? minPrice
            : 0,

          Number.isFinite(
            maxPrice,
          ) && maxPrice > 0
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
>>>>>>> Stashed changes
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

  const updateBrowserUrl = useCallback(
    ({
      nextFilters = filtersRef.current,
      nextPage = currentPageRef.current,
      nextSort = sortByRef.current,
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

      if (isNewArrivals) {
        params.set(
          "new-arrivals",
          "true",
        );
      }

      if (
        nextFilters.brands.length > 0
      ) {
        params.set(
          "brand_ids",
          nextFilters.brands.join(","),
        );
      }

      if (
        nextFilters.categories.length > 0
      ) {
        params.set(
          "category",
          nextFilters.categories.join(","),
        );
      }

      if (
        nextFilters.subCategories.length >
        0
      ) {
        params.set(
          "subcategory_ids",
          nextFilters.subCategories.join(","),
        );
      }

      if (
        nextFilters.priceRange[0] > 0
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
        nextFilters.availability.inStock
      ) {
        params.set(
          "in_stock",
          "true",
        );
      }

      if (
        nextFilters.availability.outOfStock
      ) {
        params.set(
          "out_of_stock",
          "true",
        );
      }

      if (nextSearch.trim()) {
        params.set(
          "search",
          nextSearch.trim(),
        );
      }

      if (
        nextSort !== "recommended"
      ) {
        params.set(
          "sort",
          nextSort,
        );
      }

      if (nextPage > 1) {
        params.set(
          "page",
          String(nextPage),
        );
      }

      const queryString =
        params.toString();

      const safePath =
        withBasePath(pathname);

      const newUrl = queryString
        ? `${safePath}?${queryString}`
        : safePath;

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
    [isNewArrivals, pathname],
  );

  /* ===================================================
     API QUERY
  =================================================== */

  const queryParams = useMemo(() => {
    const params: Record<
      string,
      any
    > = {
      page: currentPage,
      per_page: PRODUCTS_PER_PAGE,
      is_published: 1,
    };

    if (isNewArrivals) {
      params.new_arrivals = true;
    }

    if (filters.brands.length > 0) {
      const brandIds = filters.brands
        .map((id) =>
          brandIdMap.get(
            String(id),
          ),
        )
        .filter(
          (id): id is number =>
            id !== undefined,
        )
        .join(",");

      if (brandIds) {
        params.brand_ids = brandIds;
      }
    }

    if (
      filters.categories.length > 0
    ) {
      const categoryIds =
        filters.categories
          .map((title) =>
            categoryIdMap.get(
              title,
            ),
          )
          .filter(
            (id): id is number =>
              id !== undefined,
          )
          .join(",");

      if (categoryIds) {
        params.category_ids =
          categoryIds;
      }
    }

    if (
      filters.subCategories.length >
      0
    ) {
      const subCategoryIds =
        filters.subCategories
          .map((id) => Number(id))
          .filter(
            (id) =>
              Number.isFinite(id) &&
              id > 0,
          )
          .join(",");

      if (subCategoryIds) {
        params.subcategory_ids =
          subCategoryIds;
      }
    }

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

    if (
      filters.availability.inStock &&
      !filters.availability.outOfStock
    ) {
      params.stock_status =
        "in_stock";
    } else if (
      !filters.availability.inStock &&
      filters.availability.outOfStock
    ) {
      params.stock_status =
        "out_of_stock";
    }

    if (searchQuery.trim()) {
      params.search =
        searchQuery.trim();
    }

    switch (sortBy) {
      case "price-low":
        params.sort = "price-low";
        break;

      case "price-high":
        params.sort = "price-high";
        break;

      case "newest":
        params.sort = "newest";
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

  /* ===================================================
     PAGINATION DATA
  =================================================== */

  const pagination =
    productsData?.pagination;

  const meta =
    productsData?.meta;

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

  const apiCurrentPage =
    Number(
      pagination?.current_page ??
      meta?.current_page ??
      currentPage,
    );

  /* ===================================================
     BRAND BANNERS
  =================================================== */

  const brandBanners = useMemo(() => {
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

<<<<<<< Updated upstream
    productsData.data.forEach(
      (product: any) => {
        const banner = String(
          product?.brand_banner ??
            product?.brand
              ?.brand_banner ??
            "",
        ).trim();
=======
      productsData.data.forEach(
        (product: any) => {
          const banner = String(
            product?.brand_banner ||
            product?.brand
              ?.brand_banner ||
            "",
          ).trim();
>>>>>>> Stashed changes

        const brandName =
          product?.brand_name ??
          product?.brand?.name ??
          "Brand";

        if (
          banner &&
          !bannerMap.has(banner)
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
  }, [productsData]);

  /* ===================================================
     BANNER
  =================================================== */

  const [activeBanner, setActiveBanner] =
    useState(0);

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
      window.clearInterval(timer);
  }, [brandBanners.length]);

  /* ===================================================
     INVALID PAGE
  =================================================== */

  useEffect(() => {
    if (
      !isLoading &&
      lastPage > 0 &&
      currentPage > lastPage
    ) {
      const validPage =
        lastPage;

      setCurrentPage(
        validPage,
      );

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
<<<<<<< Updated upstream
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
                    (image: any) =>
                      image?.image_url,
                  )
                  .filter(Boolean)
=======
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
>>>>>>> Stashed changes
              : [];

          const finalImages =
            images.length > 0
              ? images
              : [
<<<<<<< Updated upstream
                  product?.primary_image_url ||
                    product?.image_url ||
                    product?.image ||
                    "/images/placeholder.jpg",
                ];
=======
                product.primary_image_url ||
                product.image_url ||
                product.image ||
                "/images/placeholder.jpg",
              ];
>>>>>>> Stashed changes

          return {
            id: product.id,
            name: product.name,
            slug: product.slug,

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
              product?.brand?.name ||
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
    if (!transformedProducts.length) {
      if (
        !isFetching &&
        !isLoading
      ) {
        setAllProducts([]);
      }

      return;
    }

    setAllProducts((prev) => {
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
    });
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

    setShowEndMessage(false);
    setShowFilterLoader(true);

    /*
      Filter/sort/search change hone par
      normal page scroll ko top par reset karna.
    */
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }, [filterSignature]);

  /* ===================================================
     TURN OFF FILTER LOADER
  =================================================== */

  useEffect(() => {
    if (
      !isFetching &&
      !isLoading &&
      showFilterLoader
    ) {
      setShowFilterLoader(false);
    }
  }, [
    isFetching,
    isLoading,
    showFilterLoader,
  ]);

  /* ===================================================
     INFINITE SCROLL
     NORMAL WEBSITE WINDOW SCROLL
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
            (prev) => prev + 1,
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

    return () => {
      observer.disconnect();
    };
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
    currentPage < lastPage;

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
      setShowEndMessage(false);
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

          setShowEndMessage(true);
        },
        {
          root: null,
          rootMargin:
            "0px 0px 120px 0px",
          threshold: 0.1,
        },
      );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
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

      const headerOffset = 90;

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
        behavior: "smooth",
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

        requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        });
      },
      [updateBrowserUrl],
    );

  const handleSearch =
    useCallback(
      (query: string) => {
        setSearchQuery(query);
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
          nextSearch: query,
          nextPage: 1,
        });

        requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        });
      },
      [updateBrowserUrl],
    );

  const handleSortChange =
    useCallback(
      (sort: SortOption) => {
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
          nextSort: sort,
          nextPage: 1,
        });

        requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        });
      },
      [updateBrowserUrl],
    );

  const handleClearFilters =
    useCallback(() => {
      const newFilters: FilterState =
<<<<<<< Updated upstream
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
            outOfStock: false,
          },
        };
=======
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
          outOfStock: false,
        },
      };
>>>>>>> Stashed changes

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

      if (isNewArrivals) {
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

      const url = queryString
        ? `${safePath}?${queryString}`
        : safePath;

      window.history.replaceState(
        null,
        "",
        url,
      );

      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
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
          length: SKELETON_COUNT,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="overflow-hidden bg-white"
            >
              <div className="aspect-square w-full animate-pulse rounded-lg bg-[#f3f3f3]" />

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
          Please try refreshing the page
        </p>

        <button
          onClick={() =>
            refetch()
          }
          className="rounded-lg bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
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
          matching your
          criteria
        </p>

        <button
          onClick={
            handleClearFilters
          }
          className="mt-4 text-sm font-medium text-[#111111] underline underline-offset-4"
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
                repeat: Infinity,
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
            Indiekonnect — Loading
            more
          </span>
        </div>
      </motion.div>
    );

  /* ===================================================
     ANIMATIONS
  =================================================== */

  const containerVariants =
  {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,

      transition: {
        staggerChildren:
          0.04,

        delayChildren:
          0.03,
      },
<<<<<<< Updated upstream

      visible: {
        opacity: 1,
        transition: {
          staggerChildren:
            0.04,
          delayChildren:
            0.03,
        },
      },
    };
=======
    },
  };
>>>>>>> Stashed changes

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 12,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.28,
        ease: "easeOut",
      },
    },
  };

  /* ===================================================
<<<<<<< Updated upstream
     COUNTS
  =================================================== */

=======
     PRODUCT GRID
  =================================================== */

  const renderProductGrid =
    () => (
      <div className="group relative">
        <motion.div
          className={`grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-4 xl:gap-y-6 transition-opacity duration-200 ${isFetching
              ? "opacity-60"
              : "opacity-100"
            }`}
          variants={
            containerVariants
          }
          initial="hidden"
          animate="visible"
          key={currentPage}
        >
          {products.map(
            (product: any) => (
              <motion.div
                key={
                  product.id
                }
                variants={
                  itemVariants
                }
                className="min-w-0"
              >
                <ProductCard
                  product={
                    product
                  }
                />
              </motion.div>
            ),
          )}
        </motion.div>

        {isFetching && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-3">
            <div className="rounded-full border border-[#e8e8e8] bg-white/95 px-3 py-1.5 text-[10px] font-medium text-[#111111] shadow-md backdrop-blur">
              Loading
              products...
            </div>
          </div>
        )}
      </div>
    );

  /* ===================================================
     PAGINATION
  =================================================== */

  const renderPagination =
    () => {
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
        currentPageNum >
        1;

      const hasNext =
        currentPageNum <
        lastPage;

      const start =
        (currentPageNum -
          1) *
        PRODUCTS_PER_PAGE +
        1;

      const end = Math.min(
        currentPageNum *
        PRODUCTS_PER_PAGE,
        totalProducts,
      );

      return (
        <div
          className="mt-10 flex flex-col items-center gap-3"
          style={{
            fontFamily:
              "Lato, sans-serif",
          }}
        >
          <nav
            className="flex items-center gap-1.5"
            aria-label="Pagination"
          >
            <button
              onClick={() =>
                handlePageChange(
                  currentPageNum -
                  1,
                )
              }
              disabled={
                !hasPrevious
              }
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${hasPrevious
                  ? "border-[#dedede] text-[#111111] hover:bg-[#111111] hover:text-white"
                  : "cursor-not-allowed border-[#f0f0f0] text-[#c5c5c5]"
                }`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {paginationPages.map(
              (page) => (
                <button
                  key={page}
                  onClick={() =>
                    handlePageChange(
                      page,
                    )
                  }
                  className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg border px-2 text-[11px] font-medium transition ${currentPageNum ===
                      page
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#dedede] text-[#111111] hover:bg-[#111111] hover:text-white"
                    }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={() =>
                handlePageChange(
                  currentPageNum +
                  1,
                )
              }
              disabled={
                !hasNext
              }
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${hasNext
                  ? "border-[#dedede] text-[#111111] hover:bg-[#111111] hover:text-white"
                  : "cursor-not-allowed border-[#f0f0f0] text-[#c5c5c5]"
                }`}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </nav>

          <div className="text-[10px] text-[#999999]">
            Showing{" "}
            {start}–
            {end} of{" "}
            {totalProducts}{" "}
            products
          </div>
        </div>
      );
    };

  /* ===================================================
     COUNTS
  =================================================== */

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

  const showInitialSkeleton =
    isLoading &&
    products.length === 0;

>>>>>>> Stashed changes
  const activeFilterCount =
    filters.brands.length +
    filters.categories.length +
    filters.subCategories
      .length +
    Object.values(
      filters.availability,
    ).filter(Boolean)
      .length;

  const pageTitle =
    isNewArrivals
      ? "New Arrivals"
      : "Collection";

  /* ===================================================
     COMPUTED FLAGS
  =================================================== */

  const isInitialLoading =
    (isLoading ||
      isFetching) &&
    allProducts.length === 0 &&
    !showFilterLoader;

  const isFilterLoading =
    showFilterLoader;

  const isAppending =
    isFetching &&
    allProducts.length > 0;

  const isEmptyResult =
    !isLoading &&
    !isFetching &&
    !showFilterLoader &&
    allProducts.length ===
      0 &&
    !error;

  const hasReachedEnd =
    showEndMessage &&
    !hasMore;

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
              {/* =============================================
                 BREADCRUMB + SORT
                 STAYS IN PLACE
              ============================================== */}

              <div className="mb-5 bg-white">
                <div className="mb-5 flex items-center gap-2 text-[14px]">
                  <span className="text-[#8a8f98]">
                    Home
                  </span>

                  <ChevronRight className="h-3.5 w-3.5 text-[#adb4be]" />

                  <span className="font-medium text-[#111111]">
                    {pageTitle}
                  </span>
                </div>

                <div>
                  {renderSortSelect()}
                </div>
              </div>

              {/* =============================================
                 FILTER ONLY SCROLLS
                 SCROLLBAR HIDDEN
              ============================================== */}

              <div
                className="
                  max-h-[calc(100vh-235px)]
                  overflow-y-auto
                  overscroll-contain
                  pr-1
                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >
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
             NORMAL WEBSITE / WINDOW SCROLL
          ================================================== */}

          <main
            ref={productsSectionRef}
            className="min-w-0 scroll-mt-[90px]"
          >
            {/* =================================================
               ITEMS COUNT + SEARCH
            ================================================== */}

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
                      event
                        .target
                        .value,
                    )
                  }
                  className="w-full rounded-full border border-[#e2e4e7] bg-white py-2 pl-9 pr-4 text-[13px] text-[#111111] placeholder-[#9a9da2] outline-none transition-all focus:border-[#111111]"
                />
              </div>
            </div>

            {/* =================================================
               MOBILE SORT
            ================================================== */}

            <div className="mb-4 md:hidden">
              {renderSortSelect()}
            </div>

            {/* =================================================
               BRAND BANNER
            ================================================== */}

            {!isInitialLoading &&
              !isFilterLoading &&
              brandBanners.length >
<<<<<<< Updated upstream
                0 && (
                <div className="mb-5">
                  <div className="relative overflow-hidden rounded-lg bg-[#f4f4f4]">
                    <div className="relative aspect-[5/1] w-full overflow-hidden sm:aspect-[8/1] lg:aspect-[12/1]">
=======
              0 && (
                <div className="mb-3">
                  <div className="relative overflow-hidden rounded-[8px] bg-[#f8f8f8]">
                    <div className="relative aspect-[7/1] min-h-[42px] w-full overflow-hidden sm:aspect-[10/1] sm:min-h-[36px] md:aspect-[12/1] md:min-h-[32px] lg:aspect-[14.4/1] lg:min-h-[28px] xl:min-h-[24px]">
>>>>>>> Stashed changes
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
                            duration: 0.3,
                            ease: "easeOut",
                          }}
                        />
                      </AnimatePresence>

                      {brandBanners.length >
                        1 && (
<<<<<<< Updated upstream
                        <div className="absolute bottom-2 right-3 flex items-center gap-1 rounded-full bg-white/80 px-1.5 py-1 backdrop-blur-sm">
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
                                className={`h-1.5 rounded-full transition-all ${
                                  activeBanner ===
                                  index
                                    ? "w-3.5 bg-[#111111]"
                                    : "w-1.5 bg-[#a9a9a9]"
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
=======
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
                                  className={`h-0.5 rounded-full transition-all ${activeBanner ===
                                      index
                                      ? "w-2.5 bg-[#111111]"
                                      : "w-0.5 bg-[#a9a9a9]"
                                    }`}
                                  aria-label={`Go to banner ${index +
                                    1
                                    }`}
                                />
                              ),
                            )}
                          </div>
                        )}
>>>>>>> Stashed changes
                    </div>
                  </div>
                </div>
              )}

            {/* =================================================
               DELIVERY BAR
            ================================================== */}

            <div className="mb-6">
              <div className="flex max-w-[560px] items-center gap-3 rounded-lg bg-gradient-to-r from-[#ffe2b8] via-[#fff1dc] to-white px-4 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5a623]/15">
                  <Truck className="h-[18px] w-[18px] text-[#f08a00]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] font-semibold text-[#171717]">
                      Fast Shipping
                    </h3>

                    <ChevronRight className="h-3.5 w-3.5 text-[#222222]" />
                  </div>

                  <p className="text-[11px] text-[#5e5e5e]">
                    Quick dispatch on
                    all orders,
                    delivered
                    securely to your
                    doorstep
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
               PRODUCT CONTENT
            ================================================== */}

<<<<<<< Updated upstream
            {isInitialLoading ? (
              renderSkeletons()
            ) : isFilterLoading ? (
              renderBrandLoader()
            ) : error &&
              allProducts.length ===
                0 ? (
              renderError()
            ) : allProducts.length >
              0 ? (
              <>
                <motion.div
                  className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8"
                  variants={
                    containerVariants
=======
            <div
              className="mb-3 flex items-center justify-between gap-3"
              style={{
                fontFamily:
                  "Lato, sans-serif",
              }}
            >
              <div className="min-w-0">
                {showInitialSkeleton ? (
                  <div className="h-3 w-36 animate-pulse rounded bg-[#e9e9e9]" />
                ) : products.length >
                  0 ? (
                  <div className="text-[12px] text-[#222222] sm:text-[13px]">
                    <span className="font-semibold">
                      Showing{" "}
                      {
                        startProduct
                      }
                      –
                      {
                        endProduct
                      }
                    </span>

                    <span className="text-[#7e7e7e]">
                      {" "}
                      of{" "}
                      {
                        totalProducts
                      }{" "}
                      Products
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-[#777777]">
                    Products
                  </span>
                )}

                {!showInitialSkeleton &&
                  totalProducts >
                  0 && (
                    <div className="mt-0.5 text-[9px] text-[#a0a0a0]">
                      Curated selections for you
                    </div>
                  )}
              </div>
            </div>

            {/* =================================================
                SEARCH + SORT
            ================================================= */}

            <div className="mb-3 flex w-full items-center gap-2">
              {/* SEARCH */}
              <div className="relative w-[40%]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8f949a]" />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={
                    searchQuery
>>>>>>> Stashed changes
                  }
                  initial="hidden"
                  animate="visible"
                >
                  {allProducts.map(
                    (
                      product: any,
                      index: number,
                    ) => {
                      const isLastItem =
                        index ===
                        allProducts.length -
                          1;

                      return (
                        <motion.div
                          key={
                            product.id
                          }
                          variants={
                            itemVariants
                          }
                          className="min-w-0"
                          ref={
                            isLastItem
                              ? lastProductRef
                              : undefined
                          }
                        >
<<<<<<< Updated upstream
                          <ProductCard
                            product={
                              product
                            }
                          />
                        </motion.div>
                      );
                    },
                  )}
                </motion.div>
=======
                          {
                            SORT_LABELS[
                            option
                            ]
                          }
                        </option>
                      ),
                    )}
                  </select>
>>>>>>> Stashed changes

                {/* =================================================
                   APPENDING LOADER
                ================================================== */}

                {isAppending &&
                  renderBrandLoader()}

<<<<<<< Updated upstream
                {/* =================================================
                   END SENTINEL
                ================================================== */}

                {!hasMore && (
                  <div
                    ref={
                      endSentinelRef
                    }
                    className="h-10 w-full"
                  />
                )}

                {/* =================================================
                   END MESSAGE
                ================================================== */}

                {hasReachedEnd && (
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
                    className="mt-12 flex flex-col items-center gap-3 pb-10"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ece9e2] bg-[#faf9f6] text-[#8b918f]">
                      ✓
                    </span>

                    <p className="text-[13px] font-medium text-[#6b7078]">
                      You've
                      reached
                      the end
                    </p>

                    <p className="text-[11px] text-[#a0a5ad]">
                      Showing
                      all{" "}
                      {
                        allProducts.length
                      }{" "}
                      products
                    </p>
                  </motion.div>
                )}
              </>
            ) : isEmptyResult ? (
              renderEmptyState()
            ) : null}
=======
            {showInitialSkeleton
              ? renderSkeletons()
              : error &&
                products.length ===
                0
                ? renderError()
                : products.length >
                  0
                  ? (
                    <>
                      {renderProductGrid()}
                      {renderPagination()}
                    </>
                  )
                  : renderEmptyState()}
>>>>>>> Stashed changes
          </main>
        </div>
      </div>

      {/* =====================================================
         MOBILE FILTER BUTTON
      ===================================================== */}

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
      ===================================================== */}

      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =====================================================
         FOOTER
         NORMAL WEBSITE FLOW
      ===================================================== */}

      <Footer />

      {/* =====================================================
         MOBILE BOTTOM SPACE
      ===================================================== */}

      <div className="h-20 md:hidden" />
    </div>
  );
}