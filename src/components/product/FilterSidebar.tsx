"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  useGetCategoriesQuery,
} from "@/lib/redux/api/categoryApi";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

/*
 * IMPORTANT:
 *
 * Next.js already has:
 *
 * basePath: "/indiekonnect-web"
 *
 * Therefore router.push() must use:
 *
 * "/products/"
 *
 * NOT:
 *
 * "/indiekonnect-web/products/"
 *
 * Next.js automatically converts it to:
 *
 * /indiekonnect-web/products/
 */

const PRODUCTS_ROUTE = "/products/";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}


interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  image: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  products_count: number;
}

interface Category {
  id: number;
  title: string;
  image: string | null;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  products_count: number;
  max_price?: string;
  max_price_formatted?: string;
  max_price_product?: {
    id: number;
    name: string;
    product_code: string;
    retail_price: string;
    distributor_price: string;
  };
  subcategories?: SubCategory[];
}

interface Brand {
  id: number;
  title: string;
  products_count?: number;
}

interface FilterState {
  brands: string[];
  categories: string[];
  subCategories: string[];

  priceRange: [
    number,
    number,
  ];

  availability: {
    inStock: boolean;
    outOfStock: boolean;
  };
}

interface FilterSidebarProps {
  onFilterChange?: (
    filters: FilterState,
  ) => void;

  maxPrice?: number;

  mobile?: boolean;

  onMobileClose?: () => void;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function FilterSidebar({
  onFilterChange,
  maxPrice,
  mobile = false,
  onMobileClose,
}: FilterSidebarProps): JSX.Element {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const {
    data: categoriesData,
    isLoading,
  } = useGetCategoriesQuery({});

  /* ======================================================================== */
  /* ACTIVE CATEGORIES                                                        */
  /* ======================================================================== */

  const categories: Category[] =
    useMemo(() => {
      return (
        categoriesData?.data ||
        []
      ).filter(
        (
          category: Category,
        ) =>
          category.status ===
          "active",
      );
    }, [
      categoriesData?.data,
    ]);

  /* ======================================================================== */
  /* BRANDS                                                                   */
  /* ======================================================================== */

  const brands: Brand[] =
    useMemo(() => {
      return (
        categoriesData?.brands ||
        []
      );
    }, [
      categoriesData?.brands,
    ]);

  /* ======================================================================== */
  /* BRANDS SEE MORE STATE                                                    */
  /* ======================================================================== */

  const [showAllBrands, setShowAllBrands] =
    useState(false);

  const BRANDS_VISIBLE_LIMIT = 7;

  const visibleBrands = useMemo(() => {
    if (showAllBrands) return brands;
    return brands.slice(0, BRANDS_VISIBLE_LIMIT);
  }, [brands, showAllBrands]);

  const hasMoreBrands =
    brands.length > BRANDS_VISIBLE_LIMIT;

  /* ======================================================================== */
  /* MAX PRICE                                                                */
  /* ======================================================================== */

  const apiMaxPrice =
    useMemo(() => {
      const categoryMaxPrices =
        categories
          .map(
            (category) =>
              Number(
                category.max_price ||
                  0,
              ),
          )
          .filter(
            (value) =>
              Number.isFinite(
                value,
              ) &&
              value > 0,
          );

      const allPrices = [
        Number(
          categoriesData?.most_expensive_price ||
            0,
        ),

        Number(
          maxPrice || 0,
        ),

        ...categoryMaxPrices,
      ].filter(
        (value) =>
          Number.isFinite(
            value,
          ) &&
          value > 0,
      );

      return allPrices.length
        ? Math.max(
            ...allPrices,
          )
        : 0;
    }, [
      categories,
      categoriesData?.most_expensive_price,
      maxPrice,
    ]);

  const debounceTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );


  const [
    filters,
    setFilters,
  ] = useState<FilterState>(() => {
    const brandParam =
      searchParams.get(
        "brand_ids",
      );

    const categoryParam =
      searchParams.get(
        "category",
      );

    const subCategoryParam =
      searchParams.get(
        "subcategory_ids",
      );

    const brandIds =
      brandParam
        ? brandParam
            .split(",")
            .map(
              (item) =>
                item.trim(),
            )
            .filter(Boolean)
        : [];

    const categoryNames =
      categoryParam
        ? categoryParam
            .split(",")
            .map((item) =>
              decodeSafe(
                item,
              ).trim(),
            )
            .filter(Boolean)
        : [];

    const subCategoryIds =
      subCategoryParam
        ? subCategoryParam
            .split(",")
            .map(
              (item) =>
                item.trim(),
            )
            .filter(Boolean)
        : [];

    const minPrice =
      parseInt(
        searchParams.get(
          "min_price",
        ) || "0",
        10,
      );

    const maxPriceParam =
      parseInt(
        searchParams.get(
          "max_price",
        ) ||
          String(
            apiMaxPrice ||
              8000,
          ),
        10,
      );

    const inStock =
      searchParams.get(
        "in_stock",
      ) === "true";

    const outOfStock =
      searchParams.get(
        "out_of_stock",
      ) === "true";

    return {
      brands:
        brandIds,

      categories:
        categoryNames,

      subCategories:
        subCategoryIds,

      priceRange: [
        Number.isFinite(
          minPrice,
        )
          ? minPrice
          : 0,

        Number.isFinite(
          maxPriceParam,
        ) &&
        maxPriceParam > 0
          ? maxPriceParam
          : apiMaxPrice ||
            8000,
      ],

      availability: {
        inStock,

        outOfStock,
      },
    };
  });

  /* ======================================================================== */
  /* PRICE INPUT STATE                                                        */
  /* ======================================================================== */

  const [
    priceInputs,
    setPriceInputs,
  ] = useState({
    min: String(
      filters.priceRange[0],
    ),

    max: String(
      filters.priceRange[1],
    ),
  });

  /* ======================================================================== */
  /* MAIN SECTION STATE                                                       */
  /* ======================================================================== */
  /*                                                                          */
  /* IMPORTANT:                                                               */
  /* - Brands & Categories are EXPANDED by default (true)                     */
  /* - Price & Availability are COLLAPSED by default (false)                  */
  /*                                                                          */
  /* ======================================================================== */

  const [
    expandedSections,
    setExpandedSections,
  ] = useState({
    brands: true,

    categories: false,

    price: false,

    availability: false,
  });

  /* ======================================================================== */
  /* CATEGORY ACCORDION                                                       */
  /* ======================================================================== */

  const [
    expandedCategoryIds,
    setExpandedCategoryIds,
  ] = useState<number[]>([]);

  /* ======================================================================== */
  /* AUTO EXPAND CATEGORIES                                                   */
  /* ======================================================================== */

  useEffect(() => {
    if (
      categories.length ===
      0
    ) {
      return;
    }

    const ids =
      categories
        .filter(
          (category) =>
            (
              category.subcategories ||
              []
            ).some(
              (
                subCategory,
              ) =>
                subCategory.status ===
                true,
            ),
        )
        .map(
          (category) =>
            category.id,
        );

    setExpandedCategoryIds(
      ids,
    );
  }, [
    categories,
  ]);

  /* ======================================================================== */
  /* PRICE INPUT SYNC                                                         */
  /* ======================================================================== */

  useEffect(() => {
    setPriceInputs({
      min: String(
        filters.priceRange[0],
      ),

      max: String(
        filters.priceRange[1],
      ),
    });
  }, [
    filters.priceRange,
  ]);

  /* ======================================================================== */
  /* UPDATE MAX PRICE                                                         */
  /* ======================================================================== */

  useEffect(() => {
    if (
      apiMaxPrice <= 0
    ) {
      return;
    }

    setFilters(
      (prev) => {
        const currentMax =
          prev.priceRange[1];

        if (
          currentMax === 0 ||
          currentMax >
            apiMaxPrice ||
          currentMax ===
            8000
        ) {
          return {
            ...prev,

            priceRange: [
              Math.min(
                prev.priceRange[0],
                apiMaxPrice,
              ),

              apiMaxPrice,
            ],
          };
        }

        return prev;
      },
    );

    setPriceInputs(
      (prev) => ({
        min:
          prev.min === ""
            ? "0"
            : prev.min,

        max:
          prev.max === "" ||
          Number(
            prev.max,
          ) >
            apiMaxPrice ||
          prev.max ===
            "8000"
            ? String(
                apiMaxPrice,
              )
            : prev.max,
      }),
    );
  }, [
    apiMaxPrice,
  ]);

  /* ======================================================================== */
  /* URL -> FILTER STATE                                                      */
  /* ======================================================================== */

  useEffect(() => {
    const brandParam =
      searchParams.get(
        "brand_ids",
      );

    const categoryParam =
      searchParams.get(
        "category",
      );

    const subCategoryParam =
      searchParams.get(
        "subcategory_ids",
      );

    const brandIds =
      brandParam
        ? brandParam
            .split(",")
            .map(
              (item) =>
                item.trim(),
            )
            .filter(Boolean)
        : [];

    const categoryNames =
      categoryParam
        ? categoryParam
            .split(",")
            .map((item) =>
              decodeSafe(
                item,
              ).trim(),
            )
            .filter(Boolean)
        : [];

    const subCategoryIds =
      subCategoryParam
        ? subCategoryParam
            .split(",")
            .map(
              (item) =>
                item.trim(),
            )
            .filter(Boolean)
        : [];

    const minPriceParam =
      searchParams.get(
        "min_price",
      );

    const maxPriceParam =
      searchParams.get(
        "max_price",
      );

    const inStock =
      searchParams.get(
        "in_stock",
      ) === "true";

    const outOfStock =
      searchParams.get(
        "out_of_stock",
      ) === "true";

    setFilters(
      (prev) => {
        const nextMin =
          minPriceParam !==
          null
            ? Number(
                minPriceParam,
              )
            : prev
                .priceRange[0];

        const nextMax =
          maxPriceParam !==
          null
            ? Number(
                maxPriceParam,
              )
            : prev
                .priceRange[1];

        return {
          ...prev,

          brands:
            brandIds,

          categories:
            categoryNames,

          subCategories:
            subCategoryIds,

          priceRange: [
            Number.isFinite(
              nextMin,
            )
              ? nextMin
              : 0,

            Number.isFinite(
              nextMax,
            )
              ? nextMax
              : apiMaxPrice ||
                8000,
          ],

          availability: {
            inStock,

            outOfStock,
          },
        };
      },
    );
  }, [
    searchParams,
    apiMaxPrice,
  ]);

  /* ======================================================================== */
  /* SECTION TOGGLE                                                           */
  /* ======================================================================== */

  const toggleSection =
    (
      section: keyof typeof expandedSections,
    ) => {
      setExpandedSections(
        (prev) => ({
          ...prev,

          [section]:
            !prev[
              section
            ],
        }),
      );
    };

  /* ======================================================================== */
  /* CATEGORY TOGGLE                                                          */
  /* ======================================================================== */

  const toggleCategory =
    (
      categoryId: number,
    ) => {
      setExpandedCategoryIds(
        (prev) =>
          prev.includes(
            categoryId,
          )
            ? prev.filter(
                (id) =>
                  id !==
                  categoryId,
              )
            : [
                ...prev,
                categoryId,
              ],
      );
    };

  /* ======================================================================== */
  /* APPLY FILTERS TO URL                                                     */
  /* ======================================================================== */

  const applyFiltersToUrl =
    useCallback(
      (
        currentFilters: FilterState,
      ) => {
        const params =
          new URLSearchParams(
            searchParams.toString(),
          );

        /* BRAND */

        if (
          currentFilters.brands
            .length > 0
        ) {
          params.set(
            "brand_ids",
            currentFilters.brands.join(
              ",",
            ),
          );
        } else {
          params.delete(
            "brand_ids",
          );
        }

        /* CATEGORY */

        if (
          currentFilters
            .categories
            .length > 0
        ) {
          params.set(
            "category",
            currentFilters.categories.join(
              ",",
            ),
          );
        } else {
          params.delete(
            "category",
          );
        }

        /* SUBCATEGORY */

        if (
          currentFilters
            .subCategories
            .length > 0
        ) {
          params.set(
            "subcategory_ids",
            currentFilters.subCategories.join(
              ",",
            ),
          );
        } else {
          params.delete(
            "subcategory_ids",
          );
        }

        /* MIN PRICE */

        if (
          currentFilters.priceRange[0] >
          0
        ) {
          params.set(
            "min_price",
            String(
              currentFilters
                .priceRange[0],
            ),
          );
        } else {
          params.delete(
            "min_price",
          );
        }

        /* MAX PRICE */

        if (
          apiMaxPrice > 0 &&
          currentFilters.priceRange[1] <
            apiMaxPrice
        ) {
          params.set(
            "max_price",
            String(
              currentFilters
                .priceRange[1],
            ),
          );
        } else {
          params.delete(
            "max_price",
          );
        }

        /* IN STOCK */

        if (
          currentFilters
            .availability
            .inStock
        ) {
          params.set(
            "in_stock",
            "true",
          );
        } else {
          params.delete(
            "in_stock",
          );
        }

        /* OUT OF STOCK */

        if (
          currentFilters
            .availability
            .outOfStock
        ) {
          params.set(
            "out_of_stock",
            "true",
          );
        } else {
          params.delete(
            "out_of_stock",
          );
        }

        /* PAGE */

        params.delete(
          "page",
        );

        const queryString =
          params.toString();

        const nextUrl =
          queryString
            ? `${PRODUCTS_ROUTE}?${queryString}`
            : PRODUCTS_ROUTE;

        router.push(
          nextUrl,
        );
      },
      [
        searchParams,
        router,
        apiMaxPrice,
      ],
    );

  /* ======================================================================== */
  /* IMMEDIATE FILTER COMMIT                                                  */
  /* ======================================================================== */

  const commitImmediateFilter =
    useCallback(
      (
        nextFilters: FilterState,
      ) => {
        if (
          debounceTimerRef.current
        ) {
          clearTimeout(
            debounceTimerRef.current,
          );

          debounceTimerRef.current =
            null;
        }

        setFilters(
          nextFilters,
        );

        onFilterChange?.(
          nextFilters,
        );

        applyFiltersToUrl(
          nextFilters,
        );

        if (
          mobile
        ) {
          onMobileClose?.();
        }
      },
      [
        onFilterChange,
        applyFiltersToUrl,
        mobile,
        onMobileClose,
      ],
    );

  /* ======================================================================== */
  /* BRAND CHANGE                                                             */
  /* ======================================================================== */

  const handleBrandChange =
    useCallback(
      (
        brandId: string,
      ) => {
        const newBrands =
          filters.brands.includes(
            brandId,
          )
            ? filters.brands.filter(
                (id) =>
                  id !==
                  brandId,
              )
            : [
                ...filters.brands,
                brandId,
              ];

        commitImmediateFilter({
          ...filters,

          brands:
            newBrands,
        });
      },
      [
        filters,
        commitImmediateFilter,
      ],
    );

  /* ======================================================================== */
  /* CATEGORY CHANGE                                                          */
  /* ======================================================================== */

  const handleCategoryChange =
    useCallback(
      (
        categoryTitle: string,
      ) => {
        const newCategories =
          filters.categories.includes(
            categoryTitle,
          )
            ? filters.categories.filter(
                (
                  category,
                ) =>
                  category !==
                  categoryTitle,
              )
            : [
                ...filters.categories,
                categoryTitle,
              ];

        commitImmediateFilter({
          ...filters,

          categories:
            newCategories,
        });
      },
      [
        filters,
        commitImmediateFilter,
      ],
    );

  /* ======================================================================== */
  /* SUBCATEGORY CHANGE                                                       */
  /* ======================================================================== */

  const handleSubCategoryChange =
    useCallback(
      (
        subCategoryId: number,
      ) => {
        const id =
          String(
            subCategoryId,
          );

        const newSubCategories =
          filters.subCategories.includes(
            id,
          )
            ? filters.subCategories.filter(
                (item) =>
                  item !== id,
              )
            : [
                ...filters.subCategories,
                id,
              ];

        commitImmediateFilter({
          ...filters,

          subCategories:
            newSubCategories,
        });
      },
      [
        filters,
        commitImmediateFilter,
      ],
    );

  /* ======================================================================== */
  /* AVAILABILITY CHANGE                                                      */
  /* ======================================================================== */

  const handleAvailabilityChange =
    useCallback(
      (
        type: keyof FilterState["availability"],
      ) => {
        commitImmediateFilter({
          ...filters,

          availability: {
            ...filters
              .availability,

            [type]:
              !filters
                .availability[
                type
              ],
          },
        });
      },
      [
        filters,
        commitImmediateFilter,
      ],
    );

  /* ======================================================================== */
  /* GET SUBCATEGORY                                                          */
  /* ======================================================================== */

  const getSubCategoryById =
    useCallback(
      (
        subCategoryId: string,
      ):
        | SubCategory
        | undefined => {
        for (
          const category of categories
        ) {
          const found =
            (
              category.subcategories ||
              []
            ).find(
              (
                subCategory,
              ) =>
                String(
                  subCategory.id,
                ) ===
                subCategoryId,
            );

          if (
            found
          ) {
            return found;
          }
        }

        return undefined;
      },
      [categories],
    );

  /* ======================================================================== */
  /* PRICE SLIDER                                                             */
  /* ======================================================================== */

  const handlePriceChange =
    useCallback(
      (
        index: 0 | 1,
        value: number,
      ) => {
        const maxVal =
          apiMaxPrice ||
          100000;

        const safeValue =
          Math.min(
            Math.max(
              Number.isFinite(
                value,
              )
                ? value
                : 0,
              0,
            ),
            maxVal,
          );

        const newRange: [
          number,
          number,
        ] = [
          filters.priceRange[0],
          filters.priceRange[1],
        ];

        if (
          index === 0
        ) {
          newRange[0] =
            safeValue;

          if (
            newRange[0] >
            newRange[1]
          ) {
            newRange[1] =
              newRange[0];
          }
        }

        if (
          index === 1
        ) {
          newRange[1] =
            safeValue;

          if (
            newRange[1] <
            newRange[0]
          ) {
            newRange[0] =
              newRange[1];
          }
        }

        const nextFilters:
          FilterState =
          {
            ...filters,

            priceRange:
              newRange,
          };

        setFilters(
          nextFilters,
        );

        onFilterChange?.(
          nextFilters,
        );

        if (
          debounceTimerRef.current
        ) {
          clearTimeout(
            debounceTimerRef.current,
          );
        }

        debounceTimerRef.current =
          setTimeout(() => {
            applyFiltersToUrl(
              nextFilters,
            );

            debounceTimerRef.current =
              null;
          }, 800);
      },
      [
        filters,
        apiMaxPrice,
        onFilterChange,
        applyFiltersToUrl,
      ],
    );

  /* ======================================================================== */
  /* PRICE INPUT CHANGE                                                       */
  /* ======================================================================== */

  const handlePriceInputChange =
    useCallback(
      (
        index: 0 | 1,
        value: string,
      ) => {
        const key =
          index === 0
            ? "min"
            : "max";

        if (
          value === ""
        ) {
          setPriceInputs(
            (prev) => ({
              ...prev,

              [key]:
                "",
            }),
          );

          return;
        }

        if (
          !/^\d*$/.test(
            value,
          )
        ) {
          return;
        }

        setPriceInputs(
          (prev) => ({
            ...prev,

            [key]:
              value,
          }),
        );
      },
      [],
    );

  /* ======================================================================== */
  /* PRICE INPUT BLUR                                                         */
  /* ======================================================================== */

  const handlePriceInputBlur =
    useCallback(
      (
        index: 0 | 1,
      ) => {
        const key =
          index === 0
            ? "min"
            : "max";

        const currentValue =
          priceInputs[key];

        if (
          index === 0 &&
          currentValue ===
            ""
        ) {
          setPriceInputs(
            (prev) => ({
              ...prev,

              min: "0",
            }),
          );

          return;
        }

        if (
          index === 1 &&
          currentValue ===
            ""
        ) {
          setPriceInputs(
            (prev) => ({
              ...prev,

              max: String(
                apiMaxPrice ||
                  100000,
              ),
            }),
          );

          return;
        }

        const numericValue =
          Number(
            currentValue,
          );

        if (
          !Number.isFinite(
            numericValue,
          )
        ) {
          const fallback =
            index ===
            0
              ? 0
              : apiMaxPrice ||
                100000;

          setPriceInputs(
            (prev) => ({
              ...prev,

              [key]:
                String(
                  fallback,
                ),
            }),
          );

          return;
        }

        const safeValue =
          Math.min(
            Math.max(
              numericValue,
              0,
            ),
            apiMaxPrice ||
              100000,
          );

        setPriceInputs(
          (prev) => ({
            ...prev,

            [key]:
              String(
                safeValue,
              ),
          }),
        );
      },
      [
        priceInputs,
        apiMaxPrice,
      ],
    );

  /* ======================================================================== */
  /* APPLY PRICE INPUTS                                                       */
  /* ======================================================================== */

  const applyPriceInputs =
    useCallback(() => {
      const maxVal =
        apiMaxPrice ||
        100000;

      let minValue =
        Number(
          priceInputs.min,
        );

      let maxValue =
        Number(
          priceInputs.max,
        );

      if (
        !Number.isFinite(
          minValue,
        )
      ) {
        minValue = 0;
      }

      if (
        !Number.isFinite(
          maxValue,
        ) ||
        priceInputs.max ===
          ""
      ) {
        maxValue =
          maxVal;
      }

      minValue =
        Math.min(
          Math.max(
            minValue,
            0,
          ),
          maxVal,
        );

      maxValue =
        Math.min(
          Math.max(
            maxValue,
            0,
          ),
          maxVal,
        );

      if (
        minValue >
        maxValue
      ) {
        maxValue =
          minValue;
      }

      const updatedFilters:
        FilterState =
        {
          ...filters,

          priceRange: [
            minValue,
            maxValue,
          ],
        };

      setPriceInputs({
        min: String(
          minValue,
        ),

        max: String(
          maxValue,
        ),
      });

      setFilters(
        updatedFilters,
      );

      onFilterChange?.(
        updatedFilters,
      );

      applyFiltersToUrl(
        updatedFilters,
      );

      if (
        debounceTimerRef.current
      ) {
        clearTimeout(
          debounceTimerRef.current,
        );

        debounceTimerRef.current =
          null;
      }

      if (
        mobile
      ) {
        onMobileClose?.();
      }
    }, [
      apiMaxPrice,
      priceInputs,
      filters,
      onFilterChange,
      applyFiltersToUrl,
      mobile,
      onMobileClose,
    ]);

  /* ======================================================================== */
  /* CLEAR FILTERS                                                            */
  /* ======================================================================== */

  const clearFilters =
    useCallback(() => {
      if (
        debounceTimerRef.current
      ) {
        clearTimeout(
          debounceTimerRef.current,
        );

        debounceTimerRef.current =
          null;
      }

      const resetFilters:
        FilterState =
        {
          brands: [],

          categories: [],

          subCategories: [],

          priceRange: [
            0,
            apiMaxPrice ||
              8000,
          ],

          availability: {
            inStock: false,

            outOfStock: false,
          },
        };

      setFilters(
        resetFilters,
      );

      setPriceInputs({
        min: "0",

        max: String(
          apiMaxPrice ||
            8000,
        ),
      });

      onFilterChange?.(
        resetFilters,
      );

      if (
        mobile
      ) {
        onMobileClose?.();
      }

      router.push(
        PRODUCTS_ROUTE,
      );
    }, [
      apiMaxPrice,
      onFilterChange,
      mobile,
      onMobileClose,
      router,
    ]);

  /* ======================================================================== */
  /* FILTER COUNT                                                             */
  /* ======================================================================== */

  const getFilterCount =
    (): number => {
      return (
        filters.brands.length +
        filters.categories.length +
        filters.subCategories.length +
        Object.values(
          filters.availability,
        ).filter(Boolean)
          .length
      );
    };

  /* ======================================================================== */
  /* BRAND MAP                                                                */
  /* ======================================================================== */

  const brandMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          string
        >();

      brands.forEach(
        (brand) => {
          map.set(
            String(
              brand.id,
            ),

            brand.title,
          );
        },
      );

      return map;
    }, [brands]);

  /* ======================================================================== */
  /* PRICE SLIDER                                                             */
  /* ======================================================================== */

  const priceMin =
    filters.priceRange[0];

  const priceMax =
    filters.priceRange[1];

  const minPercent =
    apiMaxPrice > 0
      ? (priceMin /
          apiMaxPrice) *
        100
      : 0;

  const maxPercent =
    apiMaxPrice > 0
      ? (priceMax /
          apiMaxPrice) *
        100
      : 100;

  /* ======================================================================== */
  /* RENDER                                                                   */
  /* ======================================================================== */

  return (
    <motion.aside
      className={
        mobile
          ? "relative flex max-h-[90dvh] flex-col overflow-hidden rounded-t-[22px] border border-[#ece9e2] bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.18)]"
          : "h-fit overflow-hidden rounded-xl border border-[#ece9e2] bg-white md:sticky md:top-5"
      }
      aria-label="Product filters"
      variants={
        sidebarVariants
      }
      initial="hidden"
      animate="visible"
    >
      {/* MOBILE HANDLE */}

      {mobile && (
        <div className="flex shrink-0 justify-center border-b border-[#f2efe9] bg-white pb-1.5 pt-2.5">
          <div className="h-1 w-10 rounded-full bg-[#d9d6cf]" />
        </div>
      )}

      {/* HEADER */}

      <motion.div
        className="flex shrink-0 items-center justify-between border-b border-[#ece9e2] bg-white px-4 py-3.5 md:p-5"
        variants={
          sectionVariants
        }
      >
        <motion.h3
          className="flex items-center gap-2 text-sm font-semibold text-[#101827] sm:text-[15px]"
          whileHover={{
            scale: 1.01,
          }}
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#101827]" />

          <span>
            Filter
          </span>

          {getFilterCount() >
            0 && (
            <motion.span
              className="min-w-[18px] rounded-full bg-[#101827] px-2 py-0.5 text-center text-[10px] font-semibold text-white"
              animate={{
                scale: [
                  1,
                  1.15,
                  1,
                ],
              }}
            >
              {
                getFilterCount()
              }
            </motion.span>
          )}
        </motion.h3>

        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={
              clearFilters
            }
            className="shrink-0 text-[11px] font-medium text-[#8b918f] underline transition-colors hover:text-[#101827] sm:text-xs"
            variants={
              clearButtonVariants
            }
            whileHover="hover"
            whileTap="tap"
          >
            Reset
          </motion.button>

          {mobile && (
            <motion.button
              type="button"
              onClick={
                onMobileClose
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e1d9] bg-white text-[#62676d] shadow-sm transition-colors hover:border-[#cfc9bf] hover:bg-[#f8f7f4] hover:text-[#101827]"
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.94,
              }}
              aria-label="Close filters"
            >
              <X className="h-[18px] w-[18px]" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* SCROLL AREA */}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        {/* ================================================================ */}
        {/* BRANDS                                                           */}
        {/* ================================================================ */}

        <motion.div
          className="border-b border-[#ece9e2]"
          variants={
            sectionVariants
          }
        >
          <motion.div
            className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-[#f4f3ee] md:p-5"
            onClick={() =>
              toggleSection(
                "brands",
              )
            }
          >
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#101827] sm:text-[11px]">
              Brands

              {!isLoading && (
                <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-[#8b918f]">
                  (
                  {
                    brands.length
                  }
                  )
                </span>
              )}
            </h4>

            <motion.div
              animate={{
                rotate:
                  expandedSections.brands
                    ? 180
                    : 0,
              }}
            >
              {
                expandedSections.brands ? (
                  <ChevronUp className="h-4 w-4 text-[#8b918f]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#8b918f]" />
                )
              }
            </motion.div>
          </motion.div>

          <AnimatePresence initial={false}>
            {expandedSections.brands && (
              <motion.div
                variants={
                  contentVariants
                }
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                <div className="space-y-2.5 px-4 pb-4 md:px-5 md:pb-5">
                  {isLoading ? (
                    <div className="py-2 text-[13px] text-[#8b918f]">
                      Loading brands...
                    </div>
                  ) : brands.length ===
                    0 ? (
                    <div className="py-2 text-[13px] text-[#8b918f]">
                      No brands available
                    </div>
                  ) : (
                    <>
                      {visibleBrands.map(
                        (
                          brand,
                          index,
                        ) => {
                          const brandId =
                            String(
                              brand.id,
                            );

                          const isChecked =
                            filters.brands.includes(
                              brandId,
                            );

                          return (
                            <motion.label
                              key={
                                brand.id
                              }
                              className="group flex cursor-pointer items-center gap-2.5 text-[13px]"
                              variants={
                                itemVariants
                              }
                              custom={
                                index
                              }
                              whileHover="hover"
                            >
                              <motion.input
                                type="checkbox"
                                checked={
                                  isChecked
                                }
                                onChange={() =>
                                  handleBrandChange(
                                    brandId,
                                  )
                                }
                                className="h-4 w-4 cursor-pointer rounded border-[#dedbd3] accent-[#101827] focus:ring-2 focus:ring-[#101827]"
                                variants={
                                  checkboxVariants
                                }
                                animate={
                                  isChecked
                                    ? "checked"
                                    : "unchecked"
                                }
                                whileHover="hover"
                                whileTap={{
                                  scale: 0.9,
                                }}
                              />

                              <motion.span
                                className="flex-1 text-[#555b63] transition-colors group-hover:text-[#101827]"
                                animate={{
                                  fontWeight:
                                    isChecked
                                      ? 600
                                      : 400,
                                }}
                              >
                                {
                                  brand.title
                                }
                              </motion.span>

                              {brand.products_count !==
                                undefined && (
                                <span className="text-[11px] text-[#8b918f]">
                                  (
                                  {
                                    brand.products_count
                                  }
                                  )
                                </span>
                              )}

                              {isChecked && (
                                <motion.span
                                  initial={{
                                    scale: 0,
                                  }}
                                  animate={{
                                    scale: 1,
                                  }}
                                  className="text-xs font-bold text-[#101827]"
                                >
                                  ✓
                                </motion.span>
                              )}
                            </motion.label>
                          );
                        },
                      )}

                      {/* SEE MORE / SEE LESS */}
                      {hasMoreBrands && (
                        <motion.button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAllBrands(
                              (prev) => !prev,
                            );
                          }}
                          className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-[#101827] underline underline-offset-2 transition-colors hover:text-black"
                          whileHover={{
                            scale: 1.01,
                          }}
                          whileTap={{
                            scale: 0.97,
                          }}
                        >
                          {showAllBrands
                            ? "See Less"
                            : "See More"}

                          <motion.span
                            animate={{
                              rotate:
                                showAllBrands
                                  ? 180
                                  : 0,
                            }}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </motion.span>
                        </motion.button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ================================================================ */}
        {/* CATEGORIES                                                       */}
        {/* ================================================================ */}

        <motion.div
          className="border-b border-[#ece9e2]"
          variants={
            sectionVariants
          }
        >
          <motion.div
            className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-[#f4f3ee] md:p-5"
            onClick={() =>
              toggleSection(
                "categories",
              )
            }
          >
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#101827] sm:text-[11px]">
              Categories

              {!isLoading && (
                <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-[#8b918f]">
                  (
                  {
                    categories.length
                  }
                  )
                </span>
              )}
            </h4>

            <motion.div
              animate={{
                rotate:
                  expandedSections.categories
                    ? 180
                    : 0,
              }}
            >
              {
                expandedSections.categories ? (
                  <ChevronUp className="h-4 w-4 text-[#8b918f]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#8b918f]" />
                )
              }
            </motion.div>
          </motion.div>

          <AnimatePresence initial={false}>
            {expandedSections.categories && (
              <motion.div
                variants={
                  contentVariants
                }
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 md:px-5 md:pb-5">
                  {isLoading ? (
                    <div className="py-2 text-[13px] text-[#8b918f]">
                      Loading categories...
                    </div>
                  ) : categories.length ===
                    0 ? (
                    <div className="py-2 text-[13px] text-[#8b918f]">
                      No categories available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categories.map(
                        (
                          category,
                          index,
                        ) => {
                          const isChecked =
                            filters.categories.includes(
                              category.title,
                            );

                          const activeSubCategories =
                            (
                              category.subcategories ||
                              []
                            ).filter(
                              (
                                subCategory,
                              ) =>
                                subCategory.status ===
                                true,
                            );

                          const hasSubCategories =
                            activeSubCategories.length >
                            0;

                          const isCategoryExpanded =
                            expandedCategoryIds.includes(
                              category.id,
                            );

                          return (
                            <motion.div
                              key={
                                category.id
                              }
                              variants={
                                itemVariants
                              }
                              custom={
                                index
                              }
                            >
                              <div className="flex items-center gap-2">
                                <label className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-[13px]">
                                  <motion.input
                                    type="checkbox"
                                    checked={
                                      isChecked
                                    }
                                    onChange={() =>
                                      handleCategoryChange(
                                        category.title,
                                      )
                                    }
                                    className="h-4 w-4 shrink-0 cursor-pointer rounded border-[#dedbd3] accent-[#101827] focus:ring-2 focus:ring-[#101827]"
                                    variants={
                                      checkboxVariants
                                    }
                                    animate={
                                      isChecked
                                        ? "checked"
                                        : "unchecked"
                                    }
                                    whileHover="hover"
                                    whileTap={{
                                      scale: 0.9,
                                    }}
                                  />

                                  <motion.span
                                    className="flex-1 truncate text-[#555b63] transition-colors group-hover:text-[#101827]"
                                    animate={{
                                      fontWeight:
                                        isChecked
                                          ? 600
                                          : 400,
                                    }}
                                  >
                                    {
                                      category.title
                                    }
                                  </motion.span>

                                  <span className="shrink-0 text-[11px] text-[#8b918f]">
                                    (
                                    {
                                      category.products_count
                                    }
                                    )
                                  </span>

                                  {isChecked && (
                                    <motion.span
                                      initial={{
                                        scale: 0,
                                      }}
                                      animate={{
                                        scale: 1,
                                      }}
                                      className="shrink-0 text-xs font-bold text-[#101827]"
                                    >
                                      ✓
                                    </motion.span>
                                  )}
                                </label>

                                {hasSubCategories && (
                                  <motion.button
                                    type="button"
                                    onClick={() =>
                                      toggleCategory(
                                        category.id,
                                      )
                                    }
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[#f4f3ee]"
                                    aria-label={`Toggle ${category.title} subcategories`}
                                  >
                                    <motion.div
                                      animate={{
                                        rotate:
                                          isCategoryExpanded
                                            ? 180
                                            : 0,
                                      }}
                                    >
                                      <ChevronDown className="h-3.5 w-3.5 text-[#8b918f]" />
                                    </motion.div>
                                  </motion.button>
                                )}
                              </div>

                              <AnimatePresence initial={false}>
                                {hasSubCategories &&
                                  isCategoryExpanded && (
                                    <motion.div
                                      initial={{
                                        height: 0,
                                        opacity: 0,
                                      }}
                                      animate={{
                                        height:
                                          "auto",
                                        opacity: 1,
                                      }}
                                      exit={{
                                        height: 0,
                                        opacity: 0,
                                      }}
                                      transition={{
                                        duration:
                                          0.25,
                                        ease: "easeInOut",
                                      }}
                                      className="overflow-hidden"
                                    >
                                      <div className="ml-6 mt-2 space-y-2 border-l border-[#ece9e2] pl-3">
                                        {activeSubCategories.map(
                                          (
                                            subCategory,
                                          ) => {
                                            const isSubChecked =
                                              filters.subCategories.includes(
                                                String(
                                                  subCategory.id,
                                                ),
                                              );

                                            return (
                                              <motion.label
                                                key={
                                                  subCategory.id
                                                }
                                                className="group flex cursor-pointer items-center gap-2.5 text-[12px]"
                                                whileHover={{
                                                  x: 2,
                                                }}
                                              >
                                                <motion.input
                                                  type="checkbox"
                                                  checked={
                                                    isSubChecked
                                                  }
                                                  onChange={() =>
                                                    handleSubCategoryChange(
                                                      subCategory.id,
                                                    )
                                                  }
                                                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#dedbd3] accent-[#101827] focus:ring-2 focus:ring-[#101827]"
                                                  aria-label={`Filter by ${subCategory.name}`}
                                                  variants={
                                                    checkboxVariants
                                                  }
                                                  animate={
                                                    isSubChecked
                                                      ? "checked"
                                                      : "unchecked"
                                                  }
                                                  whileTap={{
                                                    scale: 0.9,
                                                  }}
                                                />

                                                <motion.span
                                                  className="flex-1 text-[#666b72] transition-colors group-hover:text-[#101827]"
                                                  animate={{
                                                    fontWeight:
                                                      isSubChecked
                                                        ? 600
                                                        : 400,
                                                  }}
                                                >
                                                  {
                                                    subCategory.name
                                                  }
                                                </motion.span>

                                                <span className="text-[10px] text-[#8b918f]">
                                                  (
                                                  {
                                                    subCategory.products_count
                                                  }
                                                  )
                                                </span>

                                                {isSubChecked && (
                                                  <motion.span
                                                    initial={{
                                                      scale: 0,
                                                    }}
                                                    animate={{
                                                      scale: 1,
                                                    }}
                                                    className="text-[11px] font-bold text-[#101827]"
                                                  >
                                                    ✓
                                                  </motion.span>
                                                )}
                                              </motion.label>
                                            );
                                          },
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ================================================================ */}
        {/* PRICE                                                            */}
        {/* ================================================================ */}

        <motion.div
          className="border-b border-[#ece9e2]"
          variants={
            sectionVariants
          }
        >
          <motion.div
            className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-[#f4f3ee] md:p-5"
            onClick={() =>
              toggleSection(
                "price",
              )
            }
          >
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#101827] sm:text-[11px]">
              Price

              {apiMaxPrice >
                0 && (
                <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-[#8b918f]">
                  (Max: ₹
                  {apiMaxPrice.toLocaleString(
                    "en-IN",
                  )}
                  )
                </span>
              )}
            </h4>

            <motion.div
              animate={{
                rotate:
                  expandedSections.price
                    ? 180
                    : 0,
              }}
            >
              {
                expandedSections.price ? (
                  <ChevronUp className="h-4 w-4 text-[#8b918f]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#8b918f]" />
                )
              }
            </motion.div>
          </motion.div>

          <AnimatePresence initial={false}>
            {expandedSections.price && (
              <motion.div
                variants={
                  contentVariants
                }
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                <div className="space-y-4 px-4 pb-4 md:px-5 md:pb-5">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#8b918f]">
                        ₹
                      </span>

                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          priceInputs.min
                        }
                        onChange={(
                          e,
                        ) =>
                          handlePriceInputChange(
                            0,
                            e.target
                              .value,
                          )
                        }
                        onBlur={() =>
                          handlePriceInputBlur(
                            0,
                          )
                        }
                        className="w-full rounded-lg border border-[#dedbd3] py-2 pl-7 pr-3 text-[13px] text-[#101827] transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#101827]"
                        placeholder="0"
                      />
                    </div>

                    <span className="text-xs font-medium text-[#8b918f]">
                      —
                    </span>

                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#8b918f]">
                        ₹
                      </span>

                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          priceInputs.max
                        }
                        onChange={(
                          e,
                        ) =>
                          handlePriceInputChange(
                            1,
                            e.target
                              .value,
                          )
                        }
                        onBlur={() =>
                          handlePriceInputBlur(
                            1,
                          )
                        }
                        className="w-full rounded-lg border border-[#dedbd3] py-2 pl-7 pr-3 text-[13px] text-[#101827] transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#101827]"
                        placeholder={
                          apiMaxPrice
                            ? String(
                                apiMaxPrice,
                              )
                            : "0"
                        }
                      />
                    </div>
                  </div>

                  {apiMaxPrice >
                    0 && (
                    <div className="space-y-2.5">
                      <div className="relative flex h-6 w-full items-center">
                        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-[#ece9e2]" />

                        <div
                          className="absolute h-1.5 rounded-full bg-[#101827]"
                          style={{
                            left: `${Math.min(
                              minPercent,
                              maxPercent,
                            )}%`,

                            right: `${
                              100 -
                              Math.max(
                                minPercent,
                                maxPercent,
                              )
                            }%`,
                          }}
                        />

                        <input
                          type="range"
                          min="0"
                          max={
                            apiMaxPrice
                          }
                          step="100"
                          value={Math.min(
                            priceMin,
                            apiMaxPrice,
                          )}
                          onChange={(
                            e,
                          ) =>
                            handlePriceChange(
                              0,
                              Number(
                                e.target
                                  .value,
                              ),
                            )
                          }
                          className="price-range-input absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent"
                          aria-label="Minimum price slider"
                        />

                        <input
                          type="range"
                          min="0"
                          max={
                            apiMaxPrice
                          }
                          step="100"
                          value={Math.min(
                            priceMax,
                            apiMaxPrice,
                          )}
                          onChange={(
                            e,
                          ) =>
                            handlePriceChange(
                              1,
                              Number(
                                e.target
                                  .value,
                              ),
                            )
                          }
                          className="price-range-input absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent"
                          aria-label="Maximum price slider"
                        />
                      </div>

                      <div className="flex justify-between px-0.5 text-[10px] text-[#8b918f]">
                        <span>
                          ₹0
                        </span>

                        <span>
                          ₹
                          {apiMaxPrice.toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ================================================================ */}
        {/* AVAILABILITY                                                     */}
        {/* ================================================================ */}

        <motion.div
          variants={
            sectionVariants
          }
        >
          <motion.div
            className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-[#f4f3ee] md:p-5"
            onClick={() =>
              toggleSection(
                "availability",
              )
            }
          >
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#101827] sm:text-[11px]">
              Availability
            </h4>

            <motion.div
              animate={{
                rotate:
                  expandedSections.availability
                    ? 180
                    : 0,
              }}
            >
              {
                expandedSections.availability ? (
                  <ChevronUp className="h-4 w-4 text-[#8b918f]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#8b918f]" />
                )
              }
            </motion.div>
          </motion.div>

          <AnimatePresence initial={false}>
            {expandedSections.availability && (
              <motion.div
                variants={
                  contentVariants
                }
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                <div className="space-y-2.5 px-4 pb-4 md:px-5 md:pb-5">
                  {[
                    {
                      key: "inStock",
                      label: "In Stock",
                    },

                    {
                      key: "outOfStock",
                      label: "Out Of Stock",
                    },
                  ].map(
                    ({
                      key,
                      label,
                    }) => {
                      const isChecked =
                        filters
                          .availability[
                          key as keyof FilterState["availability"]
                        ];

                      return (
                        <motion.label
                          key={key}
                          className="group flex cursor-pointer items-center gap-2.5 text-[13px]"
                          variants={
                            itemVariants
                          }
                          whileHover="hover"
                        >
                          <motion.input
                            type="checkbox"
                            checked={
                              isChecked
                            }
                            onChange={() =>
                              handleAvailabilityChange(
                                key as keyof FilterState["availability"],
                              )
                            }
                            className="h-4 w-4 cursor-pointer rounded border-[#dedbd3] accent-[#101827] focus:ring-2 focus:ring-[#101827]"
                            variants={
                              checkboxVariants
                            }
                            animate={
                              isChecked
                                ? "checked"
                                : "unchecked"
                            }
                            whileTap={{
                              scale: 0.9,
                            }}
                          />

                          <motion.span
                            className={`transition-colors group-hover:text-[#101827] ${
                              key ===
                                "inStock" &&
                              isChecked
                                ? "text-emerald-600"
                                : "text-[#555b63]"
                            } ${
                              key ===
                                "outOfStock" &&
                              isChecked
                                ? "text-red-600"
                                : ""
                            }`}
                            animate={{
                              fontWeight:
                                isChecked
                                  ? 600
                                  : 400,
                            }}
                          >
                            {label}
                          </motion.span>

                          {isChecked && (
                            <motion.span
                              initial={{
                                scale: 0,
                              }}
                              animate={{
                                scale: 1,
                              }}
                              className={`ml-auto text-xs font-bold ${
                                key ===
                                "inStock"
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              ✓
                            </motion.span>
                          )}
                        </motion.label>
                      );
                    },
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* APPLY */}

      <motion.div
        className="shrink-0 border-t border-[#ece9e2] bg-[#f4f3ee] p-4 md:p-5"
        variants={
          sectionVariants
        }
      >
        <motion.button
          type="button"
          onClick={
            applyPriceInputs
          }
          className="relative w-full overflow-hidden rounded-lg bg-[#101827] py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-black sm:text-xs md:text-sm"
          variants={
            buttonVariants
          }
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Apply Filters

            {getFilterCount() >
              0 && (
              <motion.span
                className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal text-[#101827]"
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
              >
                {
                  getFilterCount()
                }
              </motion.span>
            )}
          </span>
        </motion.button>

        <AnimatePresence>
          {getFilterCount() >
            0 && (
            <motion.div
              className="mt-3 flex flex-wrap gap-1.5"
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
            >
              {filters.brands.map(
                (brandId) => (
                  <motion.span
                    key={`brand-${brandId}`}
                    className="flex items-center gap-1 rounded-full border border-[#ece9e2] bg-white px-2.5 py-1 text-[11px] text-[#101827]"
                    initial={{
                      scale: 0,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    exit={{
                      scale: 0,
                    }}
                  >
                    {
                      brandMap.get(
                        brandId,
                      ) ??
                      `Brand ${brandId}`
                    }

                    <motion.button
                      type="button"
                      onClick={() =>
                        handleBrandChange(
                          brandId,
                        )
                      }
                      className="ml-0.5 hover:text-black"
                      whileHover={{
                        scale: 1.2,
                      }}
                      whileTap={{
                        scale: 0.8,
                      }}
                    >
                      ×
                    </motion.button>
                  </motion.span>
                ),
              )}

              {filters.categories.map(
                (
                  category,
                ) => (
                  <motion.span
                    key={`category-${category}`}
                    className="flex items-center gap-1 rounded-full border border-[#ece9e2] bg-white px-2.5 py-1 text-[11px] text-[#101827]"
                    initial={{
                      scale: 0,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    exit={{
                      scale: 0,
                    }}
                  >
                    {
                      category
                    }

                    <motion.button
                      type="button"
                      onClick={() =>
                        handleCategoryChange(
                          category,
                        )
                      }
                      className="ml-0.5 hover:text-black"
                      whileHover={{
                        scale: 1.2,
                      }}
                      whileTap={{
                        scale: 0.8,
                      }}
                    >
                      ×
                    </motion.button>
                  </motion.span>
                ),
              )}

              {filters.subCategories.map(
                (
                  subCategoryId,
                ) => {
                  const subCategory =
                    getSubCategoryById(
                      subCategoryId,
                    );

                  return (
                    <motion.span
                      key={`subcategory-${subCategoryId}`}
                      className="flex items-center gap-1 rounded-full border border-[#dedbd3] bg-[#f4f3ee] px-2.5 py-1 text-[11px] text-[#101827]"
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      exit={{
                        scale: 0,
                      }}
                    >
                      {
                        subCategory?.name ??
                        `Subcategory ${subCategoryId}`
                      }

                      <motion.button
                        type="button"
                        onClick={() =>
                          handleSubCategoryChange(
                            Number(
                              subCategoryId,
                            ),
                          )
                        }
                        className="ml-0.5 hover:text-black"
                        whileHover={{
                          scale: 1.2,
                        }}
                        whileTap={{
                          scale: 0.8,
                        }}
                      >
                        ×
                      </motion.button>
                    </motion.span>
                  );
                },
              )}

              {filters
                .availability
                .inStock && (
                <motion.span
                  className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700"
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                >
                  In Stock

                  <motion.button
                    type="button"
                    onClick={() =>
                      handleAvailabilityChange(
                        "inStock",
                      )
                    }
                    className="ml-0.5 hover:text-emerald-800"
                  >
                    ×
                  </motion.button>
                </motion.span>
              )}

              {filters
                .availability
                .outOfStock && (
                <motion.span
                  className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] text-red-700"
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                >
                  Out of Stock

                  <motion.button
                    type="button"
                    onClick={() =>
                      handleAvailabilityChange(
                        "outOfStock",
                      )
                    }
                    className="ml-0.5 hover:text-red-800"
                  >
                    ×
                  </motion.button>
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* SLIDER CSS */}

      <style jsx>{`
        .price-range-input {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          outline: none;
          margin: 0;
          padding: 0;
        }

        .price-range-input::-webkit-slider-runnable-track {
          height: 6px;
          background: transparent;
          border: none;
        }

        .price-range-input::-moz-range-track {
          height: 6px;
          background: transparent;
          border: none;
        }

        .price-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          margin-top: -6px;
          border-radius: 9999px;
          background: #101827;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(16, 24, 39, 0.25);
          cursor: grab;
          position: relative;
          z-index: 20;
        }

        .price-range-input::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.06);
        }

        .price-range-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #101827;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(16, 24, 39, 0.25);
          cursor: grab;
          position: relative;
          z-index: 20;
        }

        .price-range-input::-moz-range-thumb:active {
          cursor: grabbing;
        }

        .price-range-input:first-of-type {
          z-index: 5;
        }

        .price-range-input:last-of-type {
          z-index: 6;
        }

        @media (max-width: 767px) {
          .price-range-input::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
          }

          .price-range-input::-moz-range-thumb {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </motion.aside>
  );
}

/* -------------------------------------------------------------------------- */
/* ANIMATION VARIANTS                                                         */
/* -------------------------------------------------------------------------- */

const sidebarVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },

  visible: {
    opacity: 1,
    x: 0,

    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.06,
    },
  },
};

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -8,
  },

  visible: {
    opacity: 1,
    x: 0,

    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },

  hover: {
    x: 3,
    color: "#101827",

    transition: {
      duration: 0.15,
    },
  },
};

const checkboxVariants = {
  unchecked: {
    scale: 1,
  },

  checked: {
    scale: 1.15,

    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },

  hover: {
    scale: 1.08,

    transition: {
      duration: 0.15,
    },
  },
};

const contentVariants = {
  collapsed: {
    height: 0,
    opacity: 0,

    transition: {
      duration: 0.25,
      ease: "easeInOut",
    },
  },

  expanded: {
    height: "auto",
    opacity: 1,

    transition: {
      duration: 0.35,
      ease: "easeInOut",
    },
  },
};

const buttonVariants = {
  initial: {
    scale: 1,
  },

  hover: {
    scale: 1.01,

    transition: {
      duration: 0.15,
    },
  },

  tap: {
    scale: 0.98,

    transition: {
      duration: 0.1,
    },
  },
};

const clearButtonVariants = {
  hover: {
    scale: 1.03,
    color: "#111111",

    transition: {
      duration: 0.15,
    },
  },

  tap: {
    scale: 0.95,

    transition: {
      duration: 0.1,
    },
  },
};