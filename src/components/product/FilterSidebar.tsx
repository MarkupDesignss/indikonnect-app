
"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useRouter, useSearchParams } from "next/navigation";

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
}

interface Brand {
  id: number;
  title: string;
}

interface FilterState {
  brands: string[];
  categories: string[];
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

export default function FilterSidebar({
  onFilterChange,
  maxPrice,
}: FilterSidebarProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: categoriesData, isLoading } = useGetCategoriesQuery({});

  /*
   * ============================================================
   * API MAX PRICE
   * ============================================================
   */
  const apiMaxPrice = Number(
    categoriesData?.most_expensive_price ?? maxPrice ?? 0,
  );

  /*
   * ============================================================
   * INITIAL FILTER STATE
   * ============================================================
   */
  const [filters, setFilters] = useState<FilterState>(() => {
    const brandParam = searchParams.get("brand");
    const categoryParam = searchParams.get("category");

    const brandNames = brandParam ? brandParam.split(",") : [];
    const categoryNames = categoryParam ? categoryParam.split(",") : [];

    const minPrice = parseInt(
      searchParams.get("min_price") || "0",
      10,
    );

    const maxPriceParam = parseInt(
      searchParams.get("max_price") ||
        String(apiMaxPrice || 8000),
      10,
    );

    const inStock =
      searchParams.get("in_stock") === "true";

    const outOfStock =
      searchParams.get("out_of_stock") === "true";

    return {
      brands: brandNames,
      categories: categoryNames,
      priceRange: [
        minPrice,
        maxPriceParam || apiMaxPrice || 8000,
      ],
      availability: {
        inStock,
        outOfStock,
      },
    };
  });

  /*
   * ============================================================
   * EXPANDED SECTIONS
   * ============================================================
   */
  const [expandedSections, setExpandedSections] = useState({
    brands: true,
    categories: true,
    price: true,
    availability: true,
  });

  /*
   * ============================================================
   * UPDATE PRICE WHEN API LOADS
   * ============================================================
   */
  useEffect(() => {
    if (apiMaxPrice > 0) {
      setFilters((prev) => {
        const currentMax = prev.priceRange[1];

        // Only update if current max is 0 or greater than API max
        if (
          currentMax === 0 ||
          currentMax > apiMaxPrice
        ) {
          return {
            ...prev,
            priceRange: [
              Math.min(prev.priceRange[0], apiMaxPrice),
              apiMaxPrice,
            ],
          };
        }

        return prev;
      });
    }
  }, [apiMaxPrice]);

  /*
   * ============================================================
   * UPDATE FILTERS WHEN URL CHANGES
   * ============================================================
   */
  useEffect(() => {
    const brandParam = searchParams.get("brand");
    const categoryParam = searchParams.get("category");

    const brandNames = brandParam
      ? brandParam.split(",")
      : [];

    const categoryNames = categoryParam
      ? categoryParam.split(",")
      : [];

    const minPriceParam =
      searchParams.get("min_price");

    const maxPriceParam =
      searchParams.get("max_price");

    const inStock =
      searchParams.get("in_stock") === "true";

    const outOfStock =
      searchParams.get("out_of_stock") === "true";

    setFilters((prev) => ({
      ...prev,

      brands: brandParam
        ? brandNames
        : [],

      categories: categoryParam
        ? categoryNames
        : [],

      priceRange: [
        minPriceParam !== null
          ? Number(minPriceParam)
          : prev.priceRange[0],

        maxPriceParam !== null
          ? Number(maxPriceParam)
          : prev.priceRange[1],
      ],

      availability: {
        inStock,
        outOfStock,
      },
    }));
  }, [searchParams]);

  /*
   * ============================================================
   * TOGGLE SECTION
   * ============================================================
   */
  const toggleSection = (
    section: keyof typeof expandedSections,
  ) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  /*
   * ============================================================
   * BRAND CHANGE
   * ============================================================
   */
  const handleBrandChange = useCallback(
    (brandTitle: string): void => {
      setFilters((prev) => {
        const newBrands = prev.brands.includes(brandTitle)
          ? prev.brands.filter(
              (brand) => brand !== brandTitle,
            )
          : [...prev.brands, brandTitle];

        const newFilters: FilterState = {
          ...prev,
          brands: newBrands,
        };

        onFilterChange?.(newFilters);

        return newFilters;
      });
    },
    [onFilterChange],
  );

  /*
   * ============================================================
   * CATEGORY CHANGE
   * ============================================================
   */
  const handleCategoryChange = useCallback(
    (categoryTitle: string): void => {
      setFilters((prev) => {
        const newCategories = prev.categories.includes(
          categoryTitle,
        )
          ? prev.categories.filter(
              (category) => category !== categoryTitle,
            )
          : [...prev.categories, categoryTitle];

        const newFilters: FilterState = {
          ...prev,
          categories: newCategories,
        };

        onFilterChange?.(newFilters);

        return newFilters;
      });
    },
    [onFilterChange],
  );

  /*
   * ============================================================
   * PRICE CHANGE
   * ============================================================
   */
  const handlePriceChange = useCallback(
    (index: number, value: number): void => {
      setFilters((prev) => {
        const newRange: [number, number] = [
          ...prev.priceRange,
        ] as [number, number];

        const maxVal =
          apiMaxPrice || 100000;

        const safeValue = Math.min(
          Math.max(value, 0),
          maxVal,
        );

        newRange[index] = safeValue;

        if (
          index === 0 &&
          newRange[0] > newRange[1]
        ) {
          newRange[1] = newRange[0];
        }

        if (
          index === 1 &&
          newRange[1] < newRange[0]
        ) {
          newRange[0] = newRange[1];
        }

        const newFilters: FilterState = {
          ...prev,
          priceRange: newRange,
        };

        onFilterChange?.(newFilters);

        return newFilters;
      });
    },
    [apiMaxPrice, onFilterChange],
  );

  /*
   * ============================================================
   * AVAILABILITY CHANGE
   * ============================================================
   */
  const handleAvailabilityChange = useCallback(
    (
      type: keyof FilterState["availability"],
    ): void => {
      setFilters((prev) => {
        const newFilters: FilterState = {
          ...prev,
          availability: {
            ...prev.availability,
            [type]: !prev.availability[type],
          },
        };

        onFilterChange?.(newFilters);

        return newFilters;
      });
    },
    [onFilterChange],
  );

  /*
   * ============================================================
   * APPLY FILTERS
   * ============================================================
   */
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    /*
     * Brands
     */
    if (filters.brands.length > 0) {
      params.set(
        "brand",
        filters.brands.join(","),
      );
    } else {
      params.delete("brand");
    }

    /*
     * Categories
     */
    if (filters.categories.length > 0) {
      params.set(
        "category",
        filters.categories.join(","),
      );
    } else {
      params.delete("category");
    }

    /*
     * Price
     */
    if (filters.priceRange[0] > 0) {
      params.set(
        "min_price",
        String(filters.priceRange[0]),
      );
    } else {
      params.delete("min_price");
    }

    if (
      apiMaxPrice > 0 &&
      filters.priceRange[1] < apiMaxPrice
    ) {
      params.set(
        "max_price",
        String(filters.priceRange[1]),
      );
    } else {
      params.delete("max_price");
    }

    /*
     * Availability
     */
    if (filters.availability.inStock) {
      params.set("in_stock", "true");
    } else {
      params.delete("in_stock");
    }

    if (filters.availability.outOfStock) {
      params.set("out_of_stock", "true");
    } else {
      params.delete("out_of_stock");
    }

    /*
     * Reset pagination
     */
    params.delete("page");

    const queryString = params.toString();

    router.push(
      queryString
        ? `/products?${queryString}`
        : "/products",
    );

    onFilterChange?.(filters);
  }, [
    filters,
    searchParams,
    router,
    apiMaxPrice,
    onFilterChange,
  ]);

  /*
   * ============================================================
   * CLEAR FILTERS
   * ============================================================
   */
  const clearFilters = useCallback((): void => {
    const maxVal = apiMaxPrice || 0;

    const resetFilters: FilterState = {
      brands: [],
      categories: [],
      priceRange: [0, maxVal],
      availability: {
        inStock: false,
        outOfStock: false,
      },
    };

    setFilters(resetFilters);

    onFilterChange?.(resetFilters);

    router.push("/products");
  }, [
    apiMaxPrice,
    onFilterChange,
    router,
  ]);

  /*
   * ============================================================
   * FILTER COUNT
   * ============================================================
   */
  const getFilterCount = (): number => {
    return (
      filters.brands.length +
      filters.categories.length +
      Object.values(filters.availability).filter(
        Boolean,
      ).length
    );
  };

  /*
   * ============================================================
   * API DATA
   * ============================================================
   */
  const categories: Category[] =
    categoriesData?.data || [];

  const brands: Brand[] =
    categoriesData?.brands || [];

  /*
   * ============================================================
   * ANIMATIONS
   * ============================================================
   */
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

  return (
    <motion.aside
      className="bg-white rounded-xl border border-[#ece9e2] h-fit md:sticky md:top-5 overflow-hidden"
      aria-label="Product filters"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* =====================================================
          HEADER
      ====================================================== */}
      <motion.div
        className="flex justify-between items-center p-4 md:p-5 border-b border-[#ece9e2]"
        variants={sectionVariants}
      >
        <motion.h3
          className="text-sm sm:text-[15px] font-semibold text-[#101827] flex items-center gap-2"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.15 }}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#101827]" />

          Filter

          {getFilterCount() > 0 && (
            <motion.span
              className="bg-[#101827] text-white text-[10px] px-2 py-0.5 rounded-full min-w-[18px] text-center font-semibold"
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 0.4,
                repeat: 1,
                repeatDelay: 0.4,
              }}
            >
              {getFilterCount()}
            </motion.span>
          )}
        </motion.h3>

        <motion.button
          onClick={clearFilters}
          className="text-[11px] sm:text-xs text-[#8b918f] hover:text-[#101827] transition-colors flex items-center gap-1"
          variants={clearButtonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Clear all filters"
        >
          <X className="w-3 h-3" />
          Reset
        </motion.button>
      </motion.div>

      {/* =====================================================
          BRANDS
      ====================================================== */}
      <motion.div
        className="border-b border-[#ece9e2]"
        variants={sectionVariants}
      >
        <motion.div
          className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-[#f4f3ee] transition-colors"
          onClick={() =>
            toggleSection("brands")
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
              rotate: expandedSections.brands
                ? 180
                : 0,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            {expandedSections.brands ? (
              <ChevronUp className="w-4 h-4 text-[#8b918f]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8b918f]" />
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence initial={false}>
          {expandedSections.brands && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden"
            >
              <div
                className="px-4 md:px-5 pb-4 md:pb-5 space-y-2.5"
                role="group"
                aria-label="Brand filters"
              >
                {isLoading ? (
                  <div className="text-[13px] text-[#8b918f] py-2">
                    Loading brands...
                  </div>
                ) : brands.length === 0 ? (
                  <div className="text-[13px] text-[#8b918f] py-2">
                    No brands available
                  </div>
                ) : (
                  brands.map(
                    (
                      brand: Brand,
                      index: number,
                    ) => {
                      const isChecked =
                        filters.brands.includes(
                          brand.title,
                        );

                      return (
                        <motion.label
                          key={brand.id}
                          className="flex items-center gap-2.5 text-[13px] cursor-pointer group"
                          variants={itemVariants}
                          custom={index}
                          whileHover="hover"
                        >
                          <motion.input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handleBrandChange(
                                brand.title,
                              )
                            }
                            className="w-4 h-4 cursor-pointer accent-[#101827] rounded border-[#dedbd3] focus:ring-[#101827] focus:ring-2"
                            aria-label={`Filter by ${brand.title}`}
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
                              fontWeight: isChecked
                                ? 600
                                : 400,
                            }}
                            transition={{
                              duration: 0.15,
                            }}
                          >
                            {brand.title}
                          </motion.span>

                          {isChecked && (
                            <motion.span
                              initial={{
                                scale: 0,
                              }}
                              animate={{
                                scale: 1,
                              }}
                              exit={{
                                scale: 0,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              }}
                              className="text-[#101827] text-xs font-bold"
                            >
                              ✓
                            </motion.span>
                          )}
                        </motion.label>
                      );
                    },
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* =====================================================
          CATEGORIES
      ====================================================== */}
      <motion.div
        className="border-b border-[#ece9e2]"
        variants={sectionVariants}
      >
        <motion.div
          className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-[#f4f3ee] transition-colors"
          onClick={() =>
            toggleSection("categories")
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
              rotate: expandedSections.categories
                ? 180
                : 0,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            {expandedSections.categories ? (
              <ChevronUp className="w-4 h-4 text-[#8b918f]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8b918f]" />
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence initial={false}>
          {expandedSections.categories && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden"
            >
              <div
                className="px-4 md:px-5 pb-4 md:pb-5 space-y-2.5"
                role="group"
                aria-label="Category filters"
              >
                {isLoading ? (
                  <div className="text-[13px] text-[#8b918f] py-2">
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-[13px] text-[#8b918f] py-2">
                    No categories available
                  </div>
                ) : (
                  categories.map(
                    (
                      category: Category,
                      index: number,
                    ) => {
                      const isChecked =
                        filters.categories.includes(
                          category.title,
                        );

                      return (
                        <motion.label
                          key={category.id}
                          className="flex items-center gap-2.5 text-[13px] cursor-pointer group"
                          variants={itemVariants}
                          custom={index}
                          whileHover="hover"
                        >
                          <motion.input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handleCategoryChange(
                                category.title,
                              )
                            }
                            className="w-4 h-4 cursor-pointer accent-[#101827] rounded border-[#dedbd3] focus:ring-[#101827] focus:ring-2"
                            aria-label={`Filter by ${category.title}`}
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
                              fontWeight: isChecked
                                ? 600
                                : 400,
                            }}
                            transition={{
                              duration: 0.15,
                            }}
                          >
                            {category.title}
                          </motion.span>

                          <span className="text-[11px] text-[#8b918f]">
                            ({category.products_count})
                          </span>

                          {isChecked && (
                            <motion.span
                              initial={{
                                scale: 0,
                              }}
                              animate={{
                                scale: 1,
                              }}
                              exit={{
                                scale: 0,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              }}
                              className="text-[#101827] text-xs font-bold"
                            >
                              ✓
                            </motion.span>
                          )}
                        </motion.label>
                      );
                    },
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* =====================================================
          PRICE RANGE
      ====================================================== */}
      <motion.div
        className="border-b border-[#ece9e2]"
        variants={sectionVariants}
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
                {apiMaxPrice.toLocaleString()})
              </span>
            )}
          </h4>

          <motion.div
            animate={{
              rotate: expandedSections.price
                ? 180
                : 0,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4 text-[#8b918f]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8b918f]" />
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence initial={false}>
          {expandedSections.price && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden"
            >
              <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{
                      scale: 1.01,
                    }}
                    className="relative flex-1"
                  >
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#8b918f]">
                      ₹
                    </span>

                    <input
                      type="number"
                      value={
                        filters.priceRange[0]
                      }
                      onChange={(e) =>
                        handlePriceChange(
                          0,
                          Number(e.target.value),
                        )
                      }
                      className="w-full pl-6 pr-2 py-1.5 border border-[#dedbd3] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#101827] focus:border-transparent transition-all duration-200 text-[#101827]"
                      min="0"
                      max={
                        apiMaxPrice || 100000
                      }
                      aria-label="Minimum price"
                    />
                  </motion.div>

                  <span className="text-[#8b918f] text-xs">
                    —
                  </span>

                  <motion.div
                    whileHover={{
                      scale: 1.01,
                    }}
                    className="relative flex-1"
                  >
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#8b918f]">
                      ₹
                    </span>

                    <input
                      type="number"
                      value={
                        filters.priceRange[1]
                      }
                      onChange={(e) =>
                        handlePriceChange(
                          1,
                          Number(e.target.value),
                        )
                      }
                      className="w-full pl-6 pr-2 py-1.5 border border-[#dedbd3] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#101827] focus:border-transparent transition-all duration-200 text-[#101827]"
                      min="0"
                      max={
                        apiMaxPrice || 100000
                      }
                      aria-label="Maximum price"
                    />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <motion.input
                    type="range"
                    min="0"
                    max={
                      apiMaxPrice || 100000
                    }
                    step="100"
                    value={
                      filters.priceRange[0]
                    }
                    onChange={(e) =>
                      handlePriceChange(
                        0,
                        Number(e.target.value),
                      )
                    }
                    className="w-full h-1 bg-[#ece9e2] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#101827] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:bg-black transition-all"
                    aria-label="Minimum price slider"
                    whileHover={{
                      scale: 1.01,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  />

                  <motion.input
                    type="range"
                    min="0"
                    max={
                      apiMaxPrice || 100000
                    }
                    step="100"
                    value={
                      filters.priceRange[1]
                    }
                    onChange={(e) =>
                      handlePriceChange(
                        1,
                        Number(e.target.value),
                      )
                    }
                    className="w-full h-1 bg-[#ece9e2] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#101827] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:bg-black transition-all"
                    aria-label="Maximum price slider"
                    whileHover={{
                      scale: 1.01,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  />

                  {apiMaxPrice > 0 && (
                    <>
                      <motion.div
                        className="relative w-full h-1 bg-[#ece9e2] rounded-full overflow-hidden mt-1"
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          delay: 0.2,
                        }}
                      >
                        <motion.div
                          className="absolute h-full bg-[#101827] rounded-full"
                          style={{
                            left: `${
                              (filters.priceRange[0] /
                                apiMaxPrice) *
                              100
                            }%`,
                            right: `${
                              100 -
                              (filters.priceRange[1] /
                                apiMaxPrice) *
                                100
                            }%`,
                          }}
                          animate={{
                            left: `${
                              (filters.priceRange[0] /
                                apiMaxPrice) *
                              100
                            }%`,
                            right: `${
                              100 -
                              (filters.priceRange[1] /
                                apiMaxPrice) *
                                100
                            }%`,
                          }}
                          transition={{
                            duration: 0.25,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>

                      <div className="flex justify-between text-[10px] text-[#8b918f] mt-1">
                        <span>
                          ₹0
                        </span>

                        <span>
                          ₹
                          {apiMaxPrice.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* =====================================================
          AVAILABILITY
      ====================================================== */}
      <motion.div
        variants={sectionVariants}
      >
        <motion.div
          className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-[#f4f3ee] transition-colors"
          onClick={() =>
            toggleSection("availability")
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
            transition={{
              duration: 0.25,
            }}
          >
            {expandedSections.availability ? (
              <ChevronUp className="w-4 h-4 text-[#8b918f]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8b918f]" />
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence initial={false}>
          {expandedSections.availability && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden"
            >
              <div
                className="px-4 md:px-5 pb-4 md:pb-5 space-y-2.5"
                role="group"
                aria-label="Availability filters"
              >
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
                  ({ key, label }) => {
                    const isChecked =
                      filters.availability[
                        key as keyof FilterState["availability"]
                      ];

                    return (
                      <motion.label
                        key={key}
                        className="flex items-center gap-2.5 text-[13px] cursor-pointer group"
                        variants={itemVariants}
                        whileHover="hover"
                      >
                        <motion.input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleAvailabilityChange(
                              key as keyof FilterState["availability"],
                            )
                          }
                          className="w-4 h-4 cursor-pointer accent-[#101827] rounded border-[#dedbd3] focus:ring-[#101827] focus:ring-2"
                          aria-label={`Filter by ${label}`}
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
                          className={`text-[#555b63] group-hover:text-[#101827] transition-colors ${
                            key === "inStock" &&
                            isChecked
                              ? "text-emerald-600"
                              : ""
                          } ${
                            key === "outOfStock" &&
                            isChecked
                              ? "text-red-600"
                              : ""
                          }`}
                          animate={{
                            fontWeight: isChecked
                              ? 600
                              : 400,
                          }}
                          transition={{
                            duration: 0.15,
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
                            exit={{
                              scale: 0,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                            className={`ml-auto text-xs font-bold ${
                              key === "inStock"
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

      {/* =====================================================
          APPLY FILTERS
      ====================================================== */}
      <motion.div
        className="p-4 md:p-5 bg-[#f4f3ee] border-t border-[#ece9e2]"
        variants={sectionVariants}
      >
        <motion.button
          type="button"
          onClick={applyFilters}
          className="w-full py-2.5 bg-[#101827] text-white rounded-lg text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wide hover:bg-black transition-colors duration-200 relative overflow-hidden"
          aria-label="Apply all filters"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Apply Filters

            {getFilterCount() > 0 && (
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

        {/* =================================================
            ACTIVE FILTERS
        ================================================== */}
        <AnimatePresence>
          {getFilterCount() > 0 && (
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
              transition={{
                duration: 0.25,
              }}
            >
              {/* BRAND CHIPS */}
              {filters.brands.map(
                (brand) => (
                  <motion.span
                    key={`brand-${brand}`}
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
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10,
                    }}
                  >
                    {brand}

                    <motion.button
                      type="button"
                      onClick={() =>
                        handleBrandChange(
                          brand,
                        )
                      }
                      className="hover:text-black ml-0.5"
                      whileHover={{
                        scale: 1.2,
                      }}
                      whileTap={{
                        scale: 0.8,
                      }}
                      aria-label={`Remove ${brand} brand filter`}
                    >
                      ×
                    </motion.button>
                  </motion.span>
                ),
              )}

              {/* CATEGORY CHIPS */}
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
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10,
                    }}
                  >
                    {category}

                    <motion.button
                      type="button"
                      onClick={() =>
                        handleCategoryChange(
                          category,
                        )
                      }
                      className="hover:text-black ml-0.5"
                      whileHover={{
                        scale: 1.2,
                      }}
                      whileTap={{
                        scale: 0.8,
                      }}
                      aria-label={`Remove ${category} category filter`}
                    >
                      ×
                    </motion.button>
                  </motion.span>
                ),
              )}

              {/* IN STOCK */}
              {filters.availability.inStock && (
                <motion.span
                  className="bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200"
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
                  In Stock

                  <motion.button
                    type="button"
                    onClick={() =>
                      handleAvailabilityChange(
                        "inStock",
                      )
                    }
                    className="hover:text-emerald-800 ml-0.5"
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
                  exit={{
                    scale: 0,
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
                    className="hover:text-red-800 ml-0.5"
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
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.aside>
  );
}

