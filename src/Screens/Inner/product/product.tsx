"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

import {
  SlidersHorizontal,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Truck,
  ArrowRight,
  Search,
} from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/product/FilterSidebar";
import Newsletter from "@/components/product/Newsletter";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/common/Header";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";

/* =====================================================
   TYPES
===================================================== */

interface FilterState {
  brands: string[];
  categories: string[];
  priceRange: [number, number];

  availability: {
    inStock: boolean;
    outOfStock: boolean;
  };
}

interface Category {
  id: number;
  title?: string;
  slug: string;
  name?: string;
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

const VISIBLE_PAGES = 5;

const SKELETON_COUNT = 8;

/* =====================================================
   SORT LABELS
===================================================== */

const SORT_LABELS: Record<
  SortOption,
  string
> = {
  recommended: "Relevance",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  newest: "Newest",
};

/* =====================================================
   HELPERS
===================================================== */

const getProductPrice = (
  product: any,
  accountType?: string,
): number => {
  if (!product) return 0;

  const type = String(
    accountType || "",
  )
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

  const type = String(
    accountType || "",
  )
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

/* =====================================================
   ACCOUNT TYPE
===================================================== */

const getAccountType = (
  profile: any,
): string => {
  const accountType =
    profile?.user?.account_type ??
    profile?.data?.user?.account_type ??
    profile?.data?.account_type ??
    profile?.account_type ??
    "retail";

  const normalized =
    String(accountType)
      .trim()
      .toLowerCase();

  return normalized ===
    "distributor"
    ? "distributor"
    : "retail";
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function ProductsPage(): JSX.Element {
  const searchParams =
    useSearchParams();

  /* ===================================================
     PROFILE
  =================================================== */

  const {
    data: userProfile,
  } =
    useGetUserProfileQuery({});

  const userType = useMemo(
    () =>
      getAccountType(
        userProfile,
      ),
    [userProfile],
  );

  /* ===================================================
     URL VALUES
  =================================================== */

  const isNewArrivals =
    searchParams.get(
      "new-arrivals",
    ) === "true";

  const getInitialBrands =
    (): string[] => {
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
      searchParams.get(
        "page",
      ) || 1,
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
    useState<FilterState>(
      () => ({
        brands:
          getInitialBrands(),

        categories:
          getInitialCategories(),

        priceRange:
          getInitialPriceRange(),

        availability:
          getInitialAvailability(),
      }),
    );

  const [
    currentPage,
    setCurrentPage,
  ] = useState<number>(
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

  const [
    searchQuery,
    setSearchQuery,
  ] = useState(
    searchParams.get(
      "search",
    ) || "",
  );

  const [
    isMobileFilterOpen,
    setIsMobileFilterOpen,
  ] = useState(false);

  /* ===================================================
     BANNER
  =================================================== */

  const [
    activeBanner,
    setActiveBanner,
  ] = useState(0);

  /* ===================================================
     CATEGORY API
  =================================================== */

  const {
    data: categoriesData,
  } =
    useGetCategoriesQuery({});

  /* ===================================================
     CATEGORY MAP
  =================================================== */

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
              Number(cat.id),
            );
          }
        },
      );

      return map;
    }, [
      categoriesData,
    ]);

  /* ===================================================
     BRAND MAP
  =================================================== */

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
     SYNC URL
  =================================================== */

  useEffect(() => {
    const brandParam =
      searchParams.get(
        "brand_ids",
      );

    const urlBrands =
      brandParam
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
        : urlCategories;

    const minPrice =
      Number(
        searchParams.get(
          "min_price",
        ) || 0,
      );

    const maxPrice =
      Number(
        searchParams.get(
          "max_price",
        ) ||
          MAX_PRICE_LIMIT,
      );

    const nextPage =
      Number(
        searchParams.get(
          "page",
        ) || 1,
      );

    const safePage =
      Number.isFinite(
        nextPage,
      ) && nextPage > 0
        ? nextPage
        : 1;

    const urlSort =
      searchParams.get(
        "sort",
      );

    const nextSort: SortOption =
      urlSort ===
        "price-low" ||
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
      const nextFilters:
        FilterState = {
        brands:
          validBrands,

        categories:
          validCategories,

        priceRange: [
          Number.isFinite(
            minPrice,
          ) &&
          minPrice >= 0
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
            ) ===
            "true",

          outOfStock:
            searchParams.get(
              "out_of_stock",
            ) ===
            "true",
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

    setCurrentPage(
      (prev) =>
        prev === safePage
          ? prev
          : safePage,
    );

    setSortBy(
      (prev) =>
        prev === nextSort
          ? prev
          : nextSort,
    );

    setSearchQuery(
      (prev) =>
        prev === nextSearch
          ? prev
          : nextSearch,
    );
  }, [
    searchParams,
    categoriesData,
  ]);

  /* ===================================================
     UPDATE URL
  =================================================== */

  const updateBrowserUrl =
    useCallback(
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
          nextFilters.priceRange[0] >
          0
        ) {
          params.set(
            "min_price",
            String(
              nextFilters
                .priceRange[0],
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
              nextFilters
                .priceRange[1],
            ),
          );
        }

        if (
          nextFilters
            .availability
            .inStock
        ) {
          params.set(
            "in_stock",
            "true",
          );
        }

        if (
          nextFilters
            .availability
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

        const newUrl =
          queryString
            ? `/products?${queryString}`
            : "/products";

        const currentUrl =
          window.location
            .pathname +
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
        filters,
        currentPage,
        sortBy,
        searchQuery,
        isNewArrivals,
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

        if (
          categoryIds
        ) {
          params.category_ids =
            categoryIds;
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
        !filters
          .availability
          .outOfStock
      ) {
        params.stock_status =
          "in_stock";
      } else if (
        !filters
          .availability
          .inStock &&
        filters
          .availability
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
          params.sort_by =
            userType ===
            "distributor"
              ? "distributor_price"
              : "retail_price";

          params.sort_direction =
            "asc";

          break;

        case "price-high":
          params.sort_by =
            userType ===
            "distributor"
              ? "distributor_price"
              : "retail_price";

          params.sort_direction =
            "desc";

          break;

        case "newest":
          params.sort_by =
            "created_at";

          params.sort_direction =
            "desc";

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
  } =
    useGetProductsQuery(
      queryParams,
    );

  /* ===================================================
     PAGINATION DATA
  =================================================== */

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
              product?.brand_banner ||
                product?.brand
                  ?.brand_banner ||
                "",
            ).trim();

          const brandName =
            product?.brand_name ||
            product?.brand?.name ||
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

  /* ===================================================
     RESET BANNER
  =================================================== */

  useEffect(() => {
    setActiveBanner(0);
  }, [
    currentPage,
    brandBanners.length,
  ]);

  /* ===================================================
     AUTO BANNER
  =================================================== */

  useEffect(() => {
    if (
      brandBanners.length <=
      1
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setActiveBanner(
            (prev) =>
              (prev + 1) %
              brandBanners.length,
          );
        },
        5000,
      );

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

  const products =
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
     FILTER HANDLER
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

        updateBrowserUrl({
          nextFilters:
            newFilters,
          nextPage: 1,
        });
      },
      [updateBrowserUrl],
    );

  /* ===================================================
     SEARCH
  =================================================== */

  const handleSearch =
    useCallback(
      (query: string) => {
        setSearchQuery(
          query,
        );

        setCurrentPage(1);

        updateBrowserUrl({
          nextSearch:
            query,
          nextPage: 1,
        });
      },
      [updateBrowserUrl],
    );

  /* ===================================================
     SORT
  =================================================== */

  const handleSortChange =
    useCallback(
      (
        sort: SortOption,
      ) => {
        setSortBy(
          sort,
        );

        setCurrentPage(1);

        updateBrowserUrl({
          nextSort:
            sort,
          nextPage: 1,
        });
      },
      [updateBrowserUrl],
    );

  /* ===================================================
     PAGE CHANGE
  =================================================== */

  const handlePageChange =
    useCallback(
      (page: number) => {
        if (
          page < 1
        ) {
          return;
        }

        if (
          lastPage > 0 &&
          page > lastPage
        ) {
          return;
        }

        setCurrentPage(
          page,
        );

        updateBrowserUrl({
          nextPage:
            page,
        });

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });
      },
      [
        lastPage,
        updateBrowserUrl,
      ],
    );

  /* ===================================================
     CLEAR FILTERS
  =================================================== */

  const handleClearFilters =
    useCallback(() => {
      const newFilters:
        FilterState = {
        brands: [],

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

      setFilters(
        newFilters,
      );

      setSearchQuery("");

      setSortBy(
        "recommended",
      );

      setCurrentPage(1);

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

      const url =
        queryString
          ? `/products?${queryString}`
          : "/products";

      window.history.replaceState(
        null,
        "",
        url,
      );
    }, [
      isNewArrivals,
    ]);

  /* ===================================================
     PAGINATION
  =================================================== */

  const paginationPages =
    useMemo(() => {
      if (
        !lastPage ||
        lastPage <= 1
      ) {
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

        return pages;
      }

      if (
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
          i <=
          lastPage;
          i++
        ) {
          pages.push(i);
        }

        return pages;
      }

      for (
        let i =
          currentPage - 2;
        i <=
        currentPage + 2;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }, [
      lastPage,
      currentPage,
    ]);

  /* ===================================================
     SKELETON
  =================================================== */

  const renderSkeletons =
    () => (
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-4 xl:gap-y-6">
        {Array.from({
          length:
            SKELETON_COUNT,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="overflow-hidden bg-white"
            >
              <div className="aspect-square w-full animate-pulse rounded-lg bg-[#f3f3f3]" />

              <div className="space-y-2 pt-2.5">
                <div className="h-2 w-14 animate-pulse rounded bg-[#ededed]" />

                <div className="h-3 w-3/4 animate-pulse rounded bg-[#ededed]" />

                <div className="h-2.5 w-1/2 animate-pulse rounded bg-[#ededed]" />
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
      <div
        className="py-16 text-center"
        style={{
          fontFamily:
            "Lato, sans-serif",
        }}
      >
        <div className="mb-4 text-4xl">
          ⚠️
        </div>

        <h3 className="mb-2 text-lg font-semibold text-[#111111]">
          Failed to load
          products
        </h3>

        <p className="mb-4 text-sm text-[#8b918f]">
          Please try refreshing
          the page
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
      <div
        className="py-16 text-center"
        style={{
          fontFamily:
            "Lato, sans-serif",
        }}
      >
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
     PRODUCT GRID
  =================================================== */

  const renderProductGrid = () => (
    <div className="group relative">
      <motion.div
        className={`grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-4 xl:gap-y-6 transition-opacity duration-200 ${
          isFetching
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
            Loading products...
          </div>
        </div>
      )}

      {/* Previous / Next Buttons */}
      {lastPage > 1 && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex translate-y-2 gap-1.5 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          {/* Previous */}
          <button
            type="button"
            onClick={() =>
              handlePageChange(
                currentPage - 1,
              )
            }
            disabled={
              currentPage <= 1 ||
              isFetching
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#222] shadow-[0_4px_14px_rgba(0,0,0,0.10)] backdrop-blur-xl transition-all duration-200 hover:bg-white/80 hover:shadow-[0_6px_18px_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={() =>
              handlePageChange(
                currentPage + 1,
              )
            }
            disabled={
              currentPage >=
                lastPage ||
              isFetching
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#222] shadow-[0_4px_14px_rgba(0,0,0,0.10)] backdrop-blur-xl transition-all duration-200 hover:bg-white/80 hover:shadow-[0_6px_18px_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  /* ===================================================
     PAGINATION UI
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
        currentPageNum > 1;

      const hasNext =
        currentPageNum <
        lastPage;

      const start =
        (currentPageNum -
          1) *
          PRODUCTS_PER_PAGE +
        1;

      const end =
        Math.min(
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
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                hasPrevious
                  ? "border-[#dedede] text-[#111111] hover:bg-[#111111] hover:text-white"
                  : "cursor-not-allowed border-[#f0f0f0] text-[#c5c5c5]"
              }`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {paginationPages.map(
              (page) => (
                <button
                  key={
                    page
                  }
                  onClick={() =>
                    handlePageChange(
                      page,
                    )
                  }
                  className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg border px-2 text-[11px] font-medium transition ${
                    currentPageNum ===
                    page
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#dedede] text-[#111111] hover:bg-[#111111] hover:text-white"
                  }`}
                >
                  {
                    page
                  }
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
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                hasNext
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
      },
    };

  const itemVariants =
    {
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
     COUNTS
  =================================================== */

  const startProduct =
    products.length > 0
      ? (currentPage -
          1) *
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

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="w-full bg-white px-4 py-4 sm:px-6 md:px-8 md:py-5 lg:px-10 xl:px-12">

        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_minmax(0,1fr)] lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="hidden md:block">
            <div className="sticky top-24">

              {/* BREADCRUMB */}
              <div
                className="mb-4 flex items-center gap-2 text-[12px]"
                style={{
                  fontFamily:
                    "Lato, sans-serif",
                }}
              >
                <span className="text-[#7d8aa0]">
                  Home
                </span>

                <ChevronRight className="h-3 w-3 text-[#adb4be]" />

                <span className="font-medium text-[#111111]">
                  {isNewArrivals
                    ? "New Arrivals"
                    : "Collection"}
                </span>
              </div>

              {/* FILTER CONTENT */}
              <FilterSidebar
                onFilterChange={
                  handleFilterChange
                }
                maxPrice={
                  MAX_PRICE_LIMIT
                }
              />
            </div>
          </aside>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <main className="min-w-0">

            {/* =================================================
                BANNER - HALF HEIGHT
            ================================================= */}

            {!showInitialSkeleton &&
              brandBanners.length >
                0 && (
                <div className="mb-3">
                  <div className="relative overflow-hidden rounded-[8px] bg-[#f8f8f8]">
                    <div className="relative aspect-[14.4/1] min-h-[14px] w-full overflow-hidden sm:min-h-[16px] md:min-h-[18px] lg:min-h-[19px] xl:min-h-[20px]">

                      <AnimatePresence
                        initial={false}
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

                      {/* ONLY DOTS - SMALLER */}
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
                                aria-label={`Go to banner ${
                                  index +
                                  1
                                }`}
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
                              />
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* =================================================
                DELIVERY
            ================================================= */}

            <div className="mb-3 flex flex-col gap-2 rounded-[9px] border border-[#f0eee9] bg-gradient-to-r from-[#fff0d4] via-[#fff7ea] to-[#fffdf8] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5a623]/10">
                  <Truck className="h-3.5 w-3.5 text-[#f08a00]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[12px] font-semibold text-[#171717]">
                      Next Day Delivery
                    </h3>

                    <ArrowRight className="h-3 w-3 text-[#222222]" />
                  </div>

                  <p className="text-[9px] text-[#5e5e5e] sm:text-[10px]">
                    Shop products that can reach you in just 48 hours
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="rounded-full border border-[#eadfcf] bg-white/70 px-2.5 py-1 text-[9px] font-medium text-[#6b5a43]">
                  Fast & Secure Delivery
                </span>
              </div>

            </div>

            {/* =================================================
                SHOWING / SORT - COMPACT
            ================================================= */}

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

              <div className="hidden items-center gap-2 sm:flex">

                <span className="text-[10px] text-[#929292]">
                  Sort by
                </span>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(
                      event,
                    ) =>
                      handleSortChange(
                        event
                          .target
                          .value as SortOption,
                      )
                    }
                    className="appearance-none rounded-lg border border-[#dedede] bg-white py-1.5 pl-2.5 pr-8 text-[11px] font-medium text-[#111111] outline-none transition hover:border-[#bdbdbd] focus:border-[#111111]"
                  >
                    {(
                      Object.keys(
                        SORT_LABELS,
                      ) as SortOption[]
                    ).map(
                      (
                        option,
                      ) => (
                        <option
                          key={
                            option
                          }
                          value={
                            option
                          }
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

                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#6f6f6f]" />
                </div>

              </div>
            </div>

            {/* =================================================
                SEARCH - COMPACT
            ================================================= */}

            <div className="mb-3">
              <div className="relative">

                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8f949a]" />

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
                  className="w-full rounded-lg border border-[#e8e9eb] bg-[#f7f8f9] py-2 pl-9 pr-3 text-sm text-[#111111] placeholder-[#9a9da2] outline-none transition-all focus:border-[#cfcfcf] focus:bg-white focus:ring-1 focus:ring-[#111111]/5"
                  style={{
                    fontFamily:
                      "Lato, sans-serif",
                  }}
                />

              </div>
            </div>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            {showInitialSkeleton ? (
              renderSkeletons()
            ) : error &&
              products.length ===
                0 ? (
              renderError()
            ) : products.length >
              0 ? (
              <>
                {
                  renderProductGrid()
                }

                {
                  renderPagination()
                }
              </>
            ) : (
              renderEmptyState()
            )}

          </main>
        </div>
      </div>

      <Newsletter />

      <Footer />
    </div>
  );
}