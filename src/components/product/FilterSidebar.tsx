
"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import {
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

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
  priceRange: [number, number];
  availability: {
    inStock: boolean;
    outOfStock: boolean;
  };
}

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  maxPrice?: number;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function FilterSidebar({
  onFilterChange,
  maxPrice,
}: FilterSidebarProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const {
    data: categoriesData,
    isLoading,
  } = useGetCategoriesQuery({});

  /* ======================================================================== */
  /* ACTIVE CATEGORIES                                                        */
  /* ======================================================================== */

  const categories: Category[] = useMemo(() => {
    return (categoriesData?.data || []).filter(
      (category: Category) => category.status === "active"
    );
  }, [categoriesData?.data]);

  /* ======================================================================== */
  /* BRANDS                                                                   */
  /* ======================================================================== */

  const brands: Brand[] = useMemo(() => {
    return categoriesData?.brands || [];
  }, [categoriesData?.brands]);

  /* ======================================================================== */
  /* MAX PRICE                                                                */
  /* ======================================================================== */

  const apiMaxPrice = useMemo(() => {
    const categoryMaxPrices = categories
      .map((category) => Number(category.max_price || 0))
      .filter(
        (value) =>
          Number.isFinite(value) && value > 0
      );

    const allPrices = [
      Number(categoriesData?.most_expensive_price || 0),
      Number(maxPrice || 0),
      ...categoryMaxPrices,
    ].filter(
      (value) =>
        Number.isFinite(value) && value > 0
    );

    return allPrices.length > 0
      ? Math.max(...allPrices)
      : 0;
  }, [
    categories,
    categoriesData?.most_expensive_price,
    maxPrice,
  ]);

  /* ======================================================================== */
  /* DEBOUNCE                                                                  */
  /* ======================================================================== */

  const debounceTimerRef =
    useRef<NodeJS.Timeout | null>(null);

  /* ======================================================================== */
  /* INITIAL FILTER STATE                                                      */
  /* ======================================================================== */

  const [filters, setFilters] =
    useState<FilterState>(() => {
      const brandParam =
        searchParams.get("brand_ids");

      const categoryParam =
        searchParams.get("category");

      const subCategoryParam =
        searchParams.get("subcategory_ids");

      const brandIds = brandParam
        ? brandParam
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const categoryNames = categoryParam
        ? categoryParam
            .split(",")
            .map((item) =>
              decodeURIComponent(item).trim()
            )
            .filter(Boolean)
        : [];

      const subCategoryIds = subCategoryParam
        ? subCategoryParam
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const minPrice = parseInt(
        searchParams.get("min_price") || "0",
        10
      );

      const maxPriceParam = parseInt(
        searchParams.get("max_price") ||
          String(apiMaxPrice || 8000),
        10
      );

      const inStock =
        searchParams.get("in_stock") === "true";

      const outOfStock =
        searchParams.get("out_of_stock") === "true";

      return {
        brands: brandIds,

        categories: categoryNames,

        subCategories: subCategoryIds,

        priceRange: [
          Number.isFinite(minPrice)
            ? minPrice
            : 0,

          Number.isFinite(maxPriceParam) &&
          maxPriceParam > 0
            ? maxPriceParam
            : apiMaxPrice || 8000,
        ],

        availability: {
          inStock,
          outOfStock,
        },
      };
    });

  /* ======================================================================== */
  /* PRICE INPUT STATE                                                         */
  /* ======================================================================== */

  const [priceInputs, setPriceInputs] =
    useState({
      min: String(filters.priceRange[0]),
      max: String(filters.priceRange[1]),
    });

  /* ======================================================================== */
  /* MAIN SECTION STATE                                                        */
  /* ======================================================================== */

  const [
    expandedSections,
    setExpandedSections,
  ] = useState({
    brands: true,
    categories: true,
    price: true,
    availability: true,
  });

  /* ======================================================================== */
  /* CATEGORY ACCORDION STATE                                                  */
  /* ======================================================================== */

  const [
    expandedCategoryIds,
    setExpandedCategoryIds,
  ] = useState<number[]>([]);

  /* ======================================================================== */
  /* AUTO EXPAND CATEGORIES WITH ACTIVE SUBCATEGORIES                          */
  /* ======================================================================== */

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const categoryIds = categories
      .filter((category) =>
        (category.subcategories || []).some(
          (subCategory) =>
            subCategory.status === true
        )
      )
      .map((category) => category.id);

    setExpandedCategoryIds(categoryIds);
  }, [categories]);

  /* ======================================================================== */
  /* PRICE INPUT SYNC                                                          */
  /* ======================================================================== */

  useEffect(() => {
    setPriceInputs({
      min: String(filters.priceRange[0]),
      max: String(filters.priceRange[1]),
    });
  }, [filters.priceRange]);

  /* ======================================================================== */
  /* UPDATE MAX PRICE AFTER API LOAD                                           */
  /* ======================================================================== */

  useEffect(() => {
    if (apiMaxPrice <= 0) {
      return;
    }

    setFilters((prev) => {
      const currentMax = prev.priceRange[1];

      if (
        currentMax === 0 ||
        currentMax > apiMaxPrice ||
        currentMax === 8000
      ) {
        return {
          ...prev,

          priceRange: [
            Math.min(
              prev.priceRange[0],
              apiMaxPrice
            ),
            apiMaxPrice,
          ],
        };
      }

      return prev;
    });

    setPriceInputs((prev) => ({
      min:
        prev.min === ""
          ? "0"
          : prev.min,

      max:
        prev.max === "" ||
        Number(prev.max) > apiMaxPrice ||
        prev.max === "8000"
          ? String(apiMaxPrice)
          : prev.max,
    }));
  }, [apiMaxPrice]);

  /* ======================================================================== */
  /* UPDATE FILTERS FROM URL                                                   */
  /* ======================================================================== */

  useEffect(() => {
    const brandParam =
      searchParams.get("brand_ids");

    const categoryParam =
      searchParams.get("category");

    const subCategoryParam =
      searchParams.get("subcategory_ids");

    const brandIds = brandParam
      ? brandParam
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const categoryNames = categoryParam
      ? categoryParam
          .split(",")
          .map((item) =>
            decodeURIComponent(item).trim()
          )
          .filter(Boolean)
      : [];

    const subCategoryIds = subCategoryParam
      ? subCategoryParam
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const minPriceParam =
      searchParams.get("min_price");

    const maxPriceParam =
      searchParams.get("max_price");

    const inStock =
      searchParams.get("in_stock") === "true";

    const outOfStock =
      searchParams.get("out_of_stock") === "true";

    setFilters((prev) => {
      const nextMin =
        minPriceParam !== null
          ? Number(minPriceParam)
          : prev.priceRange[0];

      const nextMax =
        maxPriceParam !== null
          ? Number(maxPriceParam)
          : prev.priceRange[1];

      return {
        ...prev,

        brands: brandIds,

        categories: categoryNames,

        subCategories: subCategoryIds,

        priceRange: [
          Number.isFinite(nextMin)
            ? nextMin
            : 0,

          Number.isFinite(nextMax)
            ? nextMax
            : apiMaxPrice || 8000,
        ],

        availability: {
          inStock,
          outOfStock,
        },
      };
    });
  }, [searchParams, apiMaxPrice]);

  /* ======================================================================== */
  /* SECTION TOGGLE                                                            */
  /* ======================================================================== */

  const toggleSection = (
    section: keyof typeof expandedSections
  ) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  /* ======================================================================== */
  /* CATEGORY TOGGLE                                                           */
  /* ======================================================================== */

  const toggleCategory = (
    categoryId: number
  ) => {
    setExpandedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter(
            (id) => id !== categoryId
          )
        : [...prev, categoryId]
    );
  };

  /* ======================================================================== */
  /* BRAND CHANGE                                                              */
  /* ======================================================================== */

  const handleBrandChange =
    useCallback(
      (brandId: string) => {
        setFilters((prev) => {
          const newBrands =
            prev.brands.includes(brandId)
              ? prev.brands.filter(
                  (id) => id !== brandId
                )
              : [
                  ...prev.brands,
                  brandId,
                ];

          const newFilters = {
            ...prev,
            brands: newBrands,
          };

          onFilterChange?.(newFilters);

          return newFilters;
        });
      },
      [onFilterChange]
    );

  /* ======================================================================== */
  /* CATEGORY CHANGE                                                           */
  /* ======================================================================== */

  const handleCategoryChange =
    useCallback(
      (categoryTitle: string) => {
        setFilters((prev) => {
          const newCategories =
            prev.categories.includes(
              categoryTitle
            )
              ? prev.categories.filter(
                  (category) =>
                    category !==
                    categoryTitle
                )
              : [
                  ...prev.categories,
                  categoryTitle,
                ];

          const newFilters = {
            ...prev,
            categories: newCategories,
          };

          onFilterChange?.(newFilters);

          return newFilters;
        });
      },
      [onFilterChange]
    );

  /* ======================================================================== */
  /* SUBCATEGORY CHANGE                                                        */
  /* ======================================================================== */

  const handleSubCategoryChange =
    useCallback(
      (subCategoryId: number) => {
        const id = String(
          subCategoryId
        );

        setFilters((prev) => {
          const newSubCategories =
            prev.subCategories.includes(id)
              ? prev.subCategories.filter(
                  (item) => item !== id
                )
              : [
                  ...prev.subCategories,
                  id,
                ];

          const newFilters = {
            ...prev,

            subCategories:
              newSubCategories,
          };

          onFilterChange?.(newFilters);

          return newFilters;
        });
      },
      [onFilterChange]
    );

  /* ======================================================================== */
  /* GET SUBCATEGORY BY ID                                                     */
  /* ======================================================================== */

  const getSubCategoryById =
    useCallback(
      (
        subCategoryId: string
      ): SubCategory | undefined => {
        for (const category of categories) {
          const found = (
            category.subcategories || []
          ).find(
            (subCategory) =>
              String(subCategory.id) ===
              subCategoryId
          );

          if (found) {
            return found;
          }
        }

        return undefined;
      },
      [categories]
    );

  /* ======================================================================== */
  /* APPLY FILTERS TO URL                                                      */
  /* ======================================================================== */

  const applyFiltersToUrl =
    useCallback(
      (
        currentFilters: FilterState = filters
      ) => {
        const params =
          new URLSearchParams(
            searchParams.toString()
          );

        /* ------------------------------------------------------------------ */
        /* BRAND IDS                                                           */
        /* ------------------------------------------------------------------ */

        if (
          currentFilters.brands.length > 0
        ) {
          params.set(
            "brand_ids",
            currentFilters.brands.join(",")
          );
        } else {
          params.delete("brand_ids");
        }

        /* ------------------------------------------------------------------ */
        /* CATEGORY                                                             */
        /* ------------------------------------------------------------------ */

        if (
          currentFilters.categories.length > 0
        ) {
          params.set(
            "category",
            currentFilters.categories.join(",")
          );
        } else {
          params.delete("category");
        }

        /* ------------------------------------------------------------------ */
        /* SUBCATEGORY IDS                                                      */
        /* ------------------------------------------------------------------ */

        if (
          currentFilters.subCategories
            .length > 0
        ) {
          params.set(
            "subcategory_ids",
            currentFilters.subCategories.join(",")
          );
        } else {
          params.delete(
            "subcategory_ids"
          );
        }

        /* ------------------------------------------------------------------ */
        /* MIN PRICE                                                            */
        /* ------------------------------------------------------------------ */

        if (
          currentFilters.priceRange[0] > 0
        ) {
          params.set(
            "min_price",
            String(
              currentFilters.priceRange[0]
            )
          );
        } else {
          params.delete("min_price");
        }

        /* ------------------------------------------------------------------ */
        /* MAX PRICE                                                            */
        /* ------------------------------------------------------------------ */

        if (
          apiMaxPrice > 0 &&
          currentFilters.priceRange[1] <
            apiMaxPrice
        ) {
          params.set(
            "max_price",
            String(
              currentFilters.priceRange[1]
            )
          );
        } else {
          params.delete("max_price");
        }

        /* ------------------------------------------------------------------ */
        /* AVAILABILITY                                                         */
        /* ------------------------------------------------------------------ */

        if (
          currentFilters.availability
            .inStock
        ) {
          params.set(
            "in_stock",
            "true"
          );
        } else {
          params.delete("in_stock");
        }

        if (
          currentFilters.availability
            .outOfStock
        ) {
          params.set(
            "out_of_stock",
            "true"
          );
        } else {
          params.delete(
            "out_of_stock"
          );
        }

        /* ------------------------------------------------------------------ */
        /* RESET PAGE                                                           */
        /* ------------------------------------------------------------------ */

        params.delete("page");

        const queryString =
          params.toString();

        router.push(
          queryString
            ? `${pathname}?${queryString}`
            : pathname
        );
      },
      [
        filters,
        searchParams,
        router,
        pathname,
        apiMaxPrice,
      ]
    );

  /* ======================================================================== */
  /* PRICE CHANGE - SLIDER ONLY                                                */
  /* ======================================================================== */

  const handlePriceChange =
    useCallback(
      (
        index: 0 | 1,
        value: number
      ) => {
        const maxVal =
          apiMaxPrice || 100000;

        const safeValue = Math.min(
          Math.max(
            Number.isFinite(value)
              ? value
              : 0,
            0
          ),
          maxVal
        );

        let nextFilters:
          | FilterState
          | null = null;

        setFilters((prev) => {
          const newRange: [
            number,
            number
          ] = [
            prev.priceRange[0],
            prev.priceRange[1],
          ];

          /* MIN */
          if (index === 0) {
            newRange[0] = safeValue;

            if (
              newRange[0] >
              newRange[1]
            ) {
              newRange[1] =
                newRange[0];
            }
          }

          /* MAX */
          if (index === 1) {
            newRange[1] = safeValue;

            if (
              newRange[1] <
              newRange[0]
            ) {
              newRange[0] =
                newRange[1];
            }
          }

          nextFilters = {
            ...prev,
            priceRange: newRange,
          };

          onFilterChange?.(
            nextFilters
          );

          return nextFilters;
        });

        if (
          debounceTimerRef.current
        ) {
          clearTimeout(
            debounceTimerRef.current
          );
        }

        debounceTimerRef.current =
          setTimeout(() => {
            if (nextFilters) {
              applyFiltersToUrl(
                nextFilters
              );
            }
          }, 3000);
      },
      [
        apiMaxPrice,
        onFilterChange,
        applyFiltersToUrl,
      ]
    );

  /* ======================================================================== */
  /* PRICE INPUT CHANGE - NO API / NO FILTER UPDATE                            */
  /* ======================================================================== */

  const handlePriceInputChange =
    useCallback(
      (
        index: 0 | 1,
        value: string
      ) => {
        const key =
          index === 0
            ? "min"
            : "max";

        /* Empty value is allowed while typing */
        if (value === "") {
          setPriceInputs((prev) => ({
            ...prev,
            [key]: "",
          }));

          return;
        }

        /* Only numbers */
        if (!/^\d*$/.test(value)) {
          return;
        }

        /*
         * IMPORTANT:
         * Only local input state updates here.
         * No setFilters()
         * No onFilterChange()
         * No API call
         * No URL update
         */
        setPriceInputs((prev) => ({
          ...prev,
          [key]: value,
        }));
      },
      []
    );

  /* ======================================================================== */
  /* PRICE INPUT BLUR - ONLY NORMALIZE INPUT                                   */
  /* ======================================================================== */

  const handlePriceInputBlur =
    useCallback(
      (index: 0 | 1) => {
        const key =
          index === 0
            ? "min"
            : "max";

        const currentValue =
          priceInputs[key];

        /* MIN EMPTY */
        if (
          index === 0 &&
          currentValue === ""
        ) {
          setPriceInputs((prev) => ({
            ...prev,
            min: "0",
          }));

          return;
        }

        /* MAX EMPTY */
        if (
          index === 1 &&
          currentValue === ""
        ) {
          const fallbackMax =
            apiMaxPrice || 100000;

          setPriceInputs((prev) => ({
            ...prev,
            max: String(
              fallbackMax
            ),
          }));

          return;
        }

        const numericValue =
          Number(currentValue);

        if (
          !Number.isFinite(
            numericValue
          )
        ) {
          const fallbackValue =
            index === 0
              ? 0
              : apiMaxPrice ||
                100000;

          setPriceInputs((prev) => ({
            ...prev,
            [key]: String(
              fallbackValue
            ),
          }));

          return;
        }

        /* Normalize values only in the input */
        const safeValue = Math.min(
          Math.max(
            numericValue,
            0
          ),
          apiMaxPrice ||
            100000
        );

        setPriceInputs((prev) => ({
          ...prev,
          [key]: String(
            safeValue
          ),
        }));
      },
      [
        priceInputs,
        apiMaxPrice,
      ]
    );

  /* ======================================================================== */
  /* APPLY PRICE INPUTS                                                        */
  /* ======================================================================== */

  const applyPriceInputs =
    useCallback(() => {
      const maxVal =
        apiMaxPrice || 100000;

      let minValue = Number(
        priceInputs.min
      );

      let maxValue = Number(
        priceInputs.max
      );

      if (
        !Number.isFinite(
          minValue
        )
      ) {
        minValue = 0;
      }

      if (
        !Number.isFinite(
          maxValue
        ) ||
        priceInputs.max === ""
      ) {
        maxValue = maxVal;
      }

      minValue = Math.min(
        Math.max(
          minValue,
          0
        ),
        maxVal
      );

      maxValue = Math.min(
        Math.max(
          maxValue,
          0
        ),
        maxVal
      );

      /*
       * Keep range valid.
       */
      if (
        minValue > maxValue
      ) {
        maxValue = minValue;
      }

      const updatedFilters: FilterState =
        {
          ...filters,

          priceRange: [
            minValue,
            maxValue,
          ],
        };

      /*
       * Sync local input values
       */
      setPriceInputs({
        min: String(
          minValue
        ),
        max: String(
          maxValue
        ),
      });

      /*
       * Update actual filter state
       */
      setFilters(
        updatedFilters
      );

      /*
       * IMPORTANT:
       * API/filter callback runs ONLY
       * when Apply Filters is clicked.
       */
      onFilterChange?.(
        updatedFilters
      );

      /*
       * Update URL only after Apply.
       */
      applyFiltersToUrl(
        updatedFilters
      );
    }, [
      apiMaxPrice,
      priceInputs,
      filters,
      onFilterChange,
      applyFiltersToUrl,
    ]);

  /* ======================================================================== */
  /* AVAILABILITY                                                              */
  /* ======================================================================== */

  const handleAvailabilityChange =
    useCallback(
      (
        type: keyof FilterState["availability"]
      ) => {
        setFilters((prev) => {
          const newFilters = {
            ...prev,

            availability: {
              ...prev.availability,

              [type]:
                !prev.availability[
                  type
                ],
            },
          };

          onFilterChange?.(
            newFilters
          );

          return newFilters;
        });
      },
      [onFilterChange]
    );

  /* ======================================================================== */
  /* CLEAR FILTERS                                                             */
  /* ======================================================================== */

  const clearFilters =
    useCallback(() => {
      const maxVal =
        apiMaxPrice || 0;

      const resetFilters: FilterState =
        {
          brands: [],
          categories: [],
          subCategories: [],

          priceRange: [
            0,
            maxVal,
          ],

          availability: {
            inStock: false,
            outOfStock: false,
          },
        };

      setFilters(
        resetFilters
      );

      setPriceInputs({
        min: "0",
        max: String(
          maxVal
        ),
      });

      onFilterChange?.(
        resetFilters
      );

      if (
        debounceTimerRef.current
      ) {
        clearTimeout(
          debounceTimerRef.current
        );
      }

      router.push(
        pathname
      );
    }, [
      apiMaxPrice,
      onFilterChange,
      router,
      pathname,
    ]);

  /* ======================================================================== */
  /* FILTER COUNT                                                              */
  /* ======================================================================== */

  const getFilterCount =
    (): number => {
      return (
        filters.brands.length +
        filters.categories.length +
        filters.subCategories.length +
        Object.values(
          filters.availability
        ).filter(Boolean).length
      );
    };

  /* ======================================================================== */
  /* BRAND MAP                                                                 */
  /* ======================================================================== */

  const brandMap = useMemo(() => {
    const map =
      new Map<string, string>();

    brands.forEach((brand) => {
      map.set(
        String(brand.id),
        brand.title
      );
    });

    return map;
  }, [brands]);

  /* ======================================================================== */
  /* PRICE SLIDER                                                              */
  /* ======================================================================== */

  const priceMin =
    filters.priceRange[0];

  const priceMax =
    filters.priceRange[1];

  const minPercent =
    apiMaxPrice > 0
      ? (priceMin / apiMaxPrice) *
        100
      : 0;

  const maxPercent =
    apiMaxPrice > 0
      ? (priceMax / apiMaxPrice) *
        100
      : 100;

  /* ======================================================================== */
  /* RENDER                                                                    */
  /* ======================================================================== */

  return (
    <motion.aside
      className="bg-white rounded-xl border border-[#ece9e2] h-fit md:sticky md:top-5 overflow-hidden"
      aria-label="Product filters"
      variants={
        sidebarVariants
      }
      initial="hidden"
      animate="visible"
    >
      {/* ================================================================== */}
      {/* HEADER                                                              */}
      {/* ================================================================== */}

      <motion.div
        className="flex justify-between items-center p-4 md:p-5 border-b border-[#ece9e2]"
        variants={
          sectionVariants
        }
      >
        <motion.h3
          className="text-sm sm:text-[15px] font-semibold text-[#101827] flex items-center gap-2"
          whileHover={{
            scale: 1.01,
          }}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#101827]" />

          Filter

          {getFilterCount() >
            0 && (
            <motion.span
              className="bg-[#101827] text-white text-[10px] px-2 py-0.5 rounded-full min-w-[18px] text-center font-semibold"
              animate={{
                scale: [
                  1,
                  1.15,
                  1,
                ],
              }}
            >
              {getFilterCount()}
            </motion.span>
          )}
        </motion.h3>

        <motion.button
          onClick={
            clearFilters
          }
          className="text-[11px] sm:text-xs text-[#8b918f] hover:text-[#101827] transition-colors flex items-center gap-1"
          variants={
            clearButtonVariants
          }
          whileHover="hover"
          whileTap="tap"
        >
          <X className="w-3 h-3" />
          Reset
        </motion.button>
      </motion.div>

      {/* ================================================================== */}
      {/* BRANDS                                                              */}
      {/* ================================================================== */}

      <motion.div
        className="border-b border-[#ece9e2]"
        variants={
          sectionVariants
        }
      >
        <motion.div
          className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-[#f4f3ee] transition-colors"
          onClick={() =>
            toggleSection(
              "brands"
            )
          }
        >
          <h4 className="text-[10px] sm:text-[11px] font-semibold text-[#101827] uppercase tracking-wide">
            Brands

            {!isLoading && (
              <span className="ml-2 text-[10px] text-[#8b918f] font-normal normal-case tracking-normal">
                ({brands.length})
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
            {expandedSections.brands ? (
              <ChevronUp className="w-4 h-4 text-[#8b918f]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8b918f]" />
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence
          initial={false}
        >
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
              <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-2.5">
                {isLoading ? (
                  <div className="text-[13px] text-[#8b918f] py-2">
                    Loading brands...
                  </div>
                ) : brands.length ===
                  0 ? (
                  <div className="text-[13px] text-[#8b918f] py-2">
                    No brands available
                  </div>
                ) : (
                  brands.map(
                    (
                      brand,
                      index
                    ) => {
                      const brandId =
                        String(
                          brand.id
                        );

                      const isChecked =
                        filters.brands.includes(
                          brandId
                        );

                      return (
                        <motion.label
                          key={
                            brand.id
                          }
                          className="flex items-center gap-2.5 text-[13px] cursor-pointer group"
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
                                brandId
                              )
                            }
                            className="w-4 h-4 cursor-pointer accent-[#101827] rounded border-[#dedbd3] focus:ring-[#101827] focus:ring-2"
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
                            className="text-[#555b63] group-hover:text-[#101827] transition-colors flex-1"
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
                              className="text-[#101827] text-xs font-bold"
                            >
                              ✓
                            </motion.span>
                          )}
                        </motion.label>
                      );
                    }
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ================================================================== */}
      {/* CATEGORIES + SUBCATEGORIES                                          */}
      {/* ================================================================== */}

      <motion.div
        className="border-b border-[#ece9e2]"
        variants={
          sectionVariants
        }
      >
        <motion.div
          className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-[#f4f3ee] transition-colors"
          onClick={() =>
            toggleSection(
              "categories"
            )
          }
        >
          <h4 className="text-[10px] sm:text-[11px] font-semibold text-[#101827] uppercase tracking-wide">
            Categories

            {!isLoading && (
              <span className="ml-2 text-[10px] text-[#8b918f] font-normal normal-case tracking-normal">
                ({categories.length})
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
            {expandedSections.categories ? (
              <ChevronUp className="w-4 h-4 text-[#8b918f]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8b918f]" />
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence
          initial={false}
        >
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
              <div className="px-4 md:px-5 pb-4 md:pb-5">
                {isLoading ? (
                  <div className="text-[13px] text-[#8b918f] py-2">
                    Loading categories...
                  </div>
                ) : categories.length ===
                  0 ? (
                  <div className="text-[13px] text-[#8b918f] py-2">
                    No categories available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map(
                      (
                        category,
                        index
                      ) => {
                        const isChecked =
                          filters.categories.includes(
                            category.title
                          );

                        const activeSubCategories =
                          (
                            category.subcategories ||
                            []
                          ).filter(
                            (
                              subCategory
                            ) =>
                              subCategory.status ===
                              true
                          );

                        const hasSubCategories =
                          activeSubCategories.length >
                          0;

                        const isCategoryExpanded =
                          expandedCategoryIds.includes(
                            category.id
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
                              <label className="flex items-center gap-2.5 text-[13px] cursor-pointer group flex-1 min-w-0">
                                <motion.input
                                  type="checkbox"
                                  checked={
                                    isChecked
                                  }
                                  onChange={() =>
                                    handleCategoryChange(
                                      category.title
                                    )
                                  }
                                  className="w-4 h-4 shrink-0 cursor-pointer accent-[#101827] rounded border-[#dedbd3] focus:ring-[#101827] focus:ring-2"
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
                                  className="text-[#555b63] group-hover:text-[#101827] transition-colors flex-1 truncate"
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

                                <span className="text-[11px] text-[#8b918f] shrink-0">
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
                                    className="text-[#101827] text-xs font-bold shrink-0"
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
                                      category.id
                                    )
                                  }
                                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#f4f3ee] transition-colors shrink-0"
                                  aria-label={`Toggle ${category.title} subcategories`}
                                >
                                  <motion.div
                                    animate={{
                                      rotate:
                                        isCategoryExpanded
                                          ? 180
                                          : 0,
                                    }}
                                    transition={{
                                      duration:
                                        0.2,
                                    }}
                                  >
                                    <ChevronDown className="w-3.5 h-3.5 text-[#8b918f]" />
                                  </motion.div>
                                </motion.button>
                              )}
                            </div>

                            <AnimatePresence
                              initial={false}
                            >
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
                                    <div className="ml-6 mt-2 pl-3 border-l border-[#ece9e2] space-y-2">
                                      {activeSubCategories.map(
                                        (
                                          subCategory
                                        ) => {
                                          const isSubChecked =
                                            filters.subCategories.includes(
                                              String(
                                                subCategory.id
                                              )
                                            );

                                          return (
                                            <motion.label
                                              key={
                                                subCategory.id
                                              }
                                              className="flex items-center gap-2.5 text-[12px] cursor-pointer group"
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
                                                    subCategory.id
                                                  )
                                                }
                                                className="w-3.5 h-3.5 cursor-pointer accent-[#101827] rounded border-[#dedbd3] focus:ring-[#101827] focus:ring-2"
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
                                                className="text-[#666b72] group-hover:text-[#101827] transition-colors flex-1"
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
                                                  transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 10,
                                                  }}
                                                  className="text-[#101827] text-[11px] font-bold"
                                                >
                                                  ✓
                                                </motion.span>
                                              )}
                                            </motion.label>
                                          );
                                        }
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ================================================================== */}
      {/* PRICE                                                               */}
      {/* ================================================================== */}

      <motion.div
        className="border-b border-[#ece9e2]"
        variants={
          sectionVariants
        }
      >
        <motion.div
          className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-[#f4f3ee] transition-colors"
          onClick={() =>
            toggleSection("price")
          }
        >
          <h4 className="text-[10px] sm:text-[11px] font-semibold text-[#101827] uppercase tracking-wide">
            Price

            {apiMaxPrice > 0 && (
              <span className="ml-2 text-[10px] text-[#8b918f] font-normal normal-case tracking-normal">
                (Max: ₹
                {apiMaxPrice.toLocaleString(
                  "en-IN"
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
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4 text-[#8b918f]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8b918f]" />
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence
          initial={false}
        >
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
              <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4">
                <div className="flex items-center gap-3">
                  {/* MIN */}

                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8b918f] font-medium">
                      ₹
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        priceInputs.min
                      }
                      onChange={(e) =>
                        handlePriceInputChange(
                          0,
                          e.target
                            .value
                        )
                      }
                      onBlur={() =>
                        handlePriceInputBlur(
                          0
                        )
                      }
                      className="w-full pl-7 pr-3 py-2 border border-[#dedbd3] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#101827] focus:border-transparent transition-all duration-200 text-[#101827]"
                      placeholder="0"
                    />
                  </div>

                  <span className="text-[#8b918f] text-xs font-medium">
                    —
                  </span>

                  {/* MAX */}

                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8b918f] font-medium">
                      ₹
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        priceInputs.max
                      }
                      onChange={(e) =>
                        handlePriceInputChange(
                          1,
                          e.target
                            .value
                        )
                      }
                      onBlur={() =>
                        handlePriceInputBlur(
                          1
                        )
                      }
                      className="w-full pl-7 pr-3 py-2 border border-[#dedbd3] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#101827] focus:border-transparent transition-all duration-200 text-[#101827]"
                      placeholder={
                        apiMaxPrice
                          ? String(
                              apiMaxPrice
                            )
                          : "0"
                      }
                    />
                  </div>
                </div>

                {apiMaxPrice > 0 && (
                  <div className="space-y-2.5">
                    <div className="relative w-full h-6 flex items-center">
                      <div className="absolute left-0 right-0 h-1.5 rounded-full bg-[#ece9e2]" />

                      <div
                        className="absolute h-1.5 rounded-full bg-[#101827]"
                        style={{
                          left: `${Math.min(
                            minPercent,
                            maxPercent
                          )}%`,
                          right: `${
                            100 -
                            Math.max(
                              minPercent,
                              maxPercent
                            )
                          }%`,
                        }}
                      />

                      {/* MIN SLIDER */}

                      <input
                        type="range"
                        min="0"
                        max={
                          apiMaxPrice
                        }
                        step="100"
                        value={Math.min(
                          priceMin,
                          apiMaxPrice
                        )}
                        onChange={(e) =>
                          handlePriceChange(
                            0,
                            Number(
                              e.target
                                .value
                            )
                          )
                        }
                        className="price-range-input absolute inset-0 w-full h-6 appearance-none bg-transparent cursor-pointer"
                        aria-label="Minimum price slider"
                      />

                      {/* MAX SLIDER */}

                      <input
                        type="range"
                        min="0"
                        max={
                          apiMaxPrice
                        }
                        step="100"
                        value={Math.min(
                          priceMax,
                          apiMaxPrice
                        )}
                        onChange={(e) =>
                          handlePriceChange(
                            1,
                            Number(
                              e.target
                                .value
                            )
                          )
                        }
                        className="price-range-input absolute inset-0 w-full h-6 appearance-none bg-transparent cursor-pointer"
                        aria-label="Maximum price slider"
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-[#8b918f] px-0.5">
                      <span>
                        ₹0
                      </span>

                      <span>
                        ₹
                        {apiMaxPrice.toLocaleString(
                          "en-IN"
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

      {/* ================================================================== */}
      {/* AVAILABILITY                                                        */}
      {/* ================================================================== */}

      <motion.div
        variants={
          sectionVariants
        }
      >
        <motion.div
          className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-[#f4f3ee] transition-colors"
          onClick={() =>
            toggleSection(
              "availability"
            )
          }
        >
          <h4 className="text-[10px] sm:text-[11px] font-semibold text-[#101827] uppercase tracking-wide">
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
            {expandedSections.availability ? (
              <ChevronUp className="w-4 h-4 text-[#8b918f]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8b918f]" />
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence
          initial={false}
        >
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
              <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-2.5">
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
                      filters.availability[
                        key as keyof FilterState["availability"]
                      ];

                    return (
                      <motion.label
                        key={
                          key
                        }
                        className="flex items-center gap-2.5 text-[13px] cursor-pointer group"
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
                              key as keyof FilterState["availability"]
                            )
                          }
                          className="w-4 h-4 cursor-pointer accent-[#101827] rounded border-[#dedbd3] focus:ring-[#101827] focus:ring-2"
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
                          className={`text-[#555b63] group-hover:text-[#101827] transition-colors ${
                            key ===
                              "inStock" &&
                            isChecked
                              ? "text-emerald-600"
                              : ""
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
                  }
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ================================================================== */}
      {/* APPLY                                                               */}
      {/* ================================================================== */}

      <motion.div
        className="p-4 md:p-5 bg-[#f4f3ee] border-t border-[#ece9e2]"
        variants={
          sectionVariants
        }
      >
        <motion.button
          type="button"
          onClick={() => {
            /*
             * IMPORTANT:
             * Apply button now commits the
             * manually entered Min/Max values.
             */
            applyPriceInputs();
          }}
          className="w-full py-2.5 bg-[#101827] text-white rounded-lg text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wide hover:bg-black transition-colors duration-200 relative overflow-hidden"
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
                className="bg-white text-[#101827] px-2 py-0.5 rounded-full text-[10px] font-bold normal-case tracking-normal"
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                }}
              >
                {getFilterCount()}
              </motion.span>
            )}
          </span>
        </motion.button>

        {/* ACTIVE FILTERS */}

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
              {/* BRANDS */}

              {filters.brands.map(
                (brandId) => (
                  <motion.span
                    key={`brand-${brandId}`}
                    className="bg-white text-[#101827] text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#ece9e2]"
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
                    {brandMap.get(
                      brandId
                    ) ??
                      `Brand ${brandId}`}

                    <motion.button
                      type="button"
                      onClick={() =>
                        handleBrandChange(
                          brandId
                        )
                      }
                      className="hover:text-black ml-0.5"
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
                )
              )}

              {/* CATEGORIES */}

              {filters.categories.map(
                (category) => (
                  <motion.span
                    key={`category-${category}`}
                    className="bg-white text-[#101827] text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#ece9e2]"
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
                    {category}

                    <motion.button
                      type="button"
                      onClick={() =>
                        handleCategoryChange(
                          category
                        )
                      }
                      className="hover:text-black ml-0.5"
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
                )
              )}

              {/* SUBCATEGORY */}

              {filters.subCategories.map(
                (subCategoryId) => {
                  const subCategory =
                    getSubCategoryById(
                      subCategoryId
                    );

                  return (
                    <motion.span
                      key={`subcategory-${subCategoryId}`}
                      className="bg-[#f4f3ee] text-[#101827] text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#dedbd3]"
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
                      {subCategory?.name ??
                        `Subcategory ${subCategoryId}`}

                      <motion.button
                        type="button"
                        onClick={() =>
                          handleSubCategoryChange(
                            Number(
                              subCategoryId
                            )
                          )
                        }
                        className="hover:text-black ml-0.5"
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
                }
              )}

              {/* IN STOCK */}

              {filters.availability
                .inStock && (
                <motion.span
                  className="bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200"
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
                        "inStock"
                      )
                    }
                    className="hover:text-emerald-800 ml-0.5"
                  >
                    ×
                  </motion.button>
                </motion.span>
              )}

              {/* OUT OF STOCK */}

              {filters.availability
                .outOfStock && (
                <motion.span
                  className="bg-red-50 text-red-700 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-red-200"
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
                        "outOfStock"
                      )
                    }
                    className="hover:text-red-800 ml-0.5"
                  >
                    ×
                  </motion.button>
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ================================================================== */}
      {/* SLIDER CSS                                                          */}
      {/* ================================================================== */}

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
          box-shadow: 0 2px 6px
            rgba(
              16,
              24,
              39,
              0.25
            );
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
          box-shadow: 0 2px 6px
            rgba(
              16,
              24,
              39,
              0.25
            );
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
