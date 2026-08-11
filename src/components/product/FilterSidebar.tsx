"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";
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
}

interface FilterState {
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

  // Get the most expensive price from API or use provided maxPrice or default to 0
  const apiMaxPrice = Number(
    categoriesData?.most_expensive_price ?? maxPrice ?? 0
  );

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    // Get categories from URL
    const categoryParam = searchParams.get('category');
    const categorySlugs = categoryParam ? categoryParam.split(',') : [];

    // Get price range from URL
    const minPrice = parseInt(searchParams.get('min_price') || '0');
    const maxPriceParam = parseInt(searchParams.get('max_price') || String(apiMaxPrice || 8000));

    // Get availability from URL
    const inStock = searchParams.get('in_stock') === 'true';
    const outOfStock = searchParams.get('out_of_stock') === 'true';

    return {
      categories: categorySlugs,
      priceRange: [minPrice, maxPriceParam || apiMaxPrice || 8000],
      availability: {
        inStock,
        outOfStock,
      },
    };
  });

  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    availability: true,
  });

  // Update price range when API data loads
  useEffect(() => {
    if (apiMaxPrice > 0) {
      setFilters((prev) => ({
        ...prev,
        priceRange: [prev.priceRange[0], apiMaxPrice],
      }));
    }
  }, [apiMaxPrice]);

  // Update filters when URL changes (for navigation)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const categorySlugs = categoryParam ? categoryParam.split(',') : [];
    const minPrice = parseInt(searchParams.get('min_price') || '0');
    const maxPriceParam = parseInt(searchParams.get('max_price') || String(apiMaxPrice || 8000));
    const inStock = searchParams.get('in_stock') === 'true';
    const outOfStock = searchParams.get('out_of_stock') === 'true';

    setFilters((prev) => ({
      categories: categorySlugs.length > 0 ? categorySlugs : prev.categories,
      priceRange: [minPrice || prev.priceRange[0], maxPriceParam || prev.priceRange[1]],
      availability: {
        inStock: inStock || prev.availability.inStock,
        outOfStock: outOfStock || prev.availability.outOfStock,
      },
    }));
  }, [searchParams, apiMaxPrice]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = useCallback((categoryTitle: string): void => {
    setFilters((prev) => {
      const newCategories = prev.categories.includes(categoryTitle)
        ? prev.categories.filter((c) => c !== categoryTitle)
        : [...prev.categories, categoryTitle];
      const newFilters = {
        ...prev,
        categories: newCategories,
      };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  const handlePriceChange = useCallback(
    (index: number, value: number): void => {
      setFilters((prev) => {
        const newRange: [number, number] = [...prev.priceRange] as [number, number];
        const maxVal = apiMaxPrice || 100000;
        newRange[index] = Math.min(Math.max(value, 0), maxVal);
        // Ensure min <= max
        if (index === 0 && newRange[0] > newRange[1]) {
          newRange[1] = newRange[0];
        }
        if (index === 1 && newRange[1] < newRange[0]) {
          newRange[0] = newRange[1];
        }
        const newFilters = { ...prev, priceRange: newRange };
        onFilterChange?.(newFilters);
        return newFilters;
      });
    },
    [apiMaxPrice, onFilterChange],
  );

  const handleAvailabilityChange = useCallback(
    (type: keyof FilterState["availability"]): void => {
      setFilters((prev) => {
        const newFilters = {
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

  const clearFilters = useCallback((): void => {
    const maxVal = apiMaxPrice || 0;
  
    const resetFilters: FilterState = {
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
  }, [apiMaxPrice, onFilterChange, router]);

  const getFilterCount = (): number => {
    return (
      filters.categories.length +
      Object.values(filters.availability).filter((v) => v).length
    );
  };

  // Get categories from API response
  const categories = categoriesData?.data || [];

  // Animation variants
  const sidebarVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      x: 4,
      color: "#F9C744",
      transition: { duration: 0.2 },
    },
  };

  const checkboxVariants = {
    unchecked: { scale: 1 },
    checked: {
      scale: 1.2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 },
    },
  };

  const contentVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 30px rgba(6,16,30,0.15)",
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  const clearButtonVariants = {
    hover: {
      scale: 1.05,
      color: "#06101E",
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  return (
    <motion.aside
      className="bg-white rounded-xl shadow-[0_4px_20px_-8px_rgba(6,16,30,0.06)] h-fit md:sticky md:top-5 overflow-hidden border border-[#E5E7EB]"
      aria-label="Product filters"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center p-4 md:p-5 border-b border-[#E5E7EB]"
        variants={sectionVariants}
      >
        <motion.h3
          className="text-sm font-bold text-[#06101E] flex items-center gap-2 font-serif"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          FILTERS
          <motion.span
            className="bg-[#F9C744] text-[#06101E] text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center font-sans font-semibold"
            animate={{
              scale: getFilterCount() > 0 ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: getFilterCount() > 0 ? 2 : 0,
              repeatDelay: 0.5,
            }}
          >
            {getFilterCount()}
          </motion.span>
        </motion.h3>
        <motion.button
          onClick={clearFilters}
          className="text-xs text-[#6B7280] hover:text-[#06101E] transition-colors flex items-center gap-1 font-sans"
          variants={clearButtonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Clear all filters"
        >
          <X className="w-3 h-3" />
          Clear All
        </motion.button>
      </motion.div>

      {/* Categories Section */}
      <motion.div
        className="border-b border-[#E5E7EB]"
        variants={sectionVariants}
      >
        <motion.div
          className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-[#FFF8E1]/50 transition-colors"
          onClick={() => toggleSection("categories")}
          whileHover={{ backgroundColor: "#FFF8E1/50" }}
        >
          <h4 className="text-sm font-semibold text-[#4B5563] font-sans tracking-wide">
            CATEGORIES
            {!isLoading && (
              <span className="ml-2 text-xs text-[#6B7280] font-normal">
                ({categories.length})
              </span>
            )}
          </h4>
          <motion.div
            animate={{
              rotate: expandedSections.categories ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {expandedSections.categories ? (
              <ChevronUp className="w-4 h-4 text-[#6B7280]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6B7280]" />
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
                  <div className="text-sm text-[#6B7280] py-2">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="text-sm text-[#6B7280] py-2">No categories available</div>
                ) : (
                  categories.map((category: Category, index: number) => (
                    <motion.label
                      key={category.id}
                      className="flex items-center gap-2.5 text-sm cursor-pointer group font-sans"
                      variants={itemVariants}
                      custom={index}
                      whileHover="hover"
                    >
                      <motion.input
                        type="checkbox"
                        checked={filters.categories.includes(category.title)}
                        onChange={() => handleCategoryChange(category.title)}
                        className="w-4 h-4 cursor-pointer accent-[#F9C744] rounded border-[#D1D5DB] focus:ring-[#F9C744] focus:ring-2"
                        aria-label={`Filter by ${category.title}`}
                        variants={checkboxVariants}
                        animate={
                          filters.categories.includes(category.title)
                            ? "checked"
                            : "unchecked"
                        }
                        whileHover="hover"
                        whileTap={{ scale: 0.9 }}
                      />
                      <motion.span
                        className="text-[#4B5563] group-hover:text-[#F9C744] transition-colors flex-1"
                        animate={{
                          fontWeight: filters.categories.includes(category.title)
                            ? 600
                            : 400,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {category.title}
                      </motion.span>
                      <span className="text-xs text-[#6B7280]">
                        ({category.products_count})
                      </span>
                      {filters.categories.includes(category.title) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          }}
                          className="text-[#F9C744] text-xs font-bold"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.label>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Price Range Section */}
      <motion.div
        className="border-b border-[#E5E7EB]"
        variants={sectionVariants}
      >
        <motion.div
          className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-[#FFF8E1]/50 transition-colors"
          onClick={() => toggleSection("price")}
          whileHover={{ backgroundColor: "#FFF8E1/50" }}
        >
          <h4 className="text-sm font-semibold text-[#4B5563] font-sans tracking-wide">
            PRICE
            {apiMaxPrice > 0 && (
              <span className="ml-2 text-xs text-[#6B7280] font-normal">
                (Max: ₹{apiMaxPrice.toLocaleString()})
              </span>
            )}
          </h4>
          <motion.div
            animate={{
              rotate: expandedSections.price ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4 text-[#6B7280]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6B7280]" />
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
                    whileHover={{ scale: 1.02 }}
                    className="relative flex-1"
                  >
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] font-sans">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handlePriceChange(0, Number(e.target.value))
                      }
                      className="w-full pl-6 pr-2 py-1.5 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9C744] focus:border-transparent transition-all duration-200 font-sans text-[#06101E]"
                      min="0"
                      max={apiMaxPrice || 100000}
                      aria-label="Minimum price"
                    />
                  </motion.div>
                  <span className="text-[#6B7280] text-xs font-sans">—</span>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative flex-1"
                  >
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] font-sans">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handlePriceChange(1, Number(e.target.value))
                      }
                      className="w-full pl-6 pr-2 py-1.5 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9C744] focus:border-transparent transition-all duration-200 font-sans text-[#06101E]"
                      min="0"
                      max={apiMaxPrice || 100000}
                      aria-label="Maximum price"
                    />
                  </motion.div>
                </div>
                <div className="space-y-1">
                  <motion.input
                    type="range"
                    min="0"
                    max={apiMaxPrice || 100000}
                    step="100"
                    value={filters.priceRange[0]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handlePriceChange(0, Number(e.target.value))
                    }
                    className="w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#F9C744] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:bg-[#E9AC3C] transition-all"
                    aria-label="Minimum price slider"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  />
                  <motion.input
                    type="range"
                    min="0"
                    max={apiMaxPrice || 100000}
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handlePriceChange(1, Number(e.target.value))
                    }
                    className="w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#F9C744] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:bg-[#E9AC3C] transition-all"
                    aria-label="Maximum price slider"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  />
                  {/* Price Range Visualization */}
                  {apiMaxPrice > 0 && (
                    <>
                      <motion.div
                        className="relative w-full h-1 bg-[#E5E7EB] rounded-full overflow-hidden mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div
                          className="absolute h-full bg-gradient-to-r from-[#F9C744] to-[#E9AC3C] rounded-full"
                          style={{
                            left: `${(filters.priceRange[0] / apiMaxPrice) * 100}%`,
                            right: `${100 - (filters.priceRange[1] / apiMaxPrice) * 100}%`,
                          }}
                          animate={{
                            left: `${(filters.priceRange[0] / apiMaxPrice) * 100}%`,
                            right: `${100 - (filters.priceRange[1] / apiMaxPrice) * 100}%`,
                          }}
                          transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>
                      <div className="flex justify-between text-[10px] text-[#6B7280] mt-1 font-sans">
                        <span>₹0</span>
                        <span>₹{apiMaxPrice.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Availability Section */}
      <motion.div variants={sectionVariants}>
        <motion.div
          className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-[#FFF8E1]/50 transition-colors"
          onClick={() => toggleSection("availability")}
          whileHover={{ backgroundColor: "#FFF8E1/50" }}
        >
          <h4 className="text-sm font-semibold text-[#4B5563] font-sans tracking-wide">
            AVAILABILITY
          </h4>
          <motion.div
            animate={{
              rotate: expandedSections.availability ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {expandedSections.availability ? (
              <ChevronUp className="w-4 h-4 text-[#6B7280]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6B7280]" />
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
                  { key: "inStock", label: "In Stock" },
                  {
                    key: "outOfStock",
                    label: "Out Of Stock",
                  },
                ].map(({ key, label }) => {
                  const isChecked =
                    filters.availability[
                    key as keyof FilterState["availability"]
                    ];
                  return (
                    <motion.label
                      key={key}
                      className="flex items-center gap-2.5 text-sm cursor-pointer group font-sans"
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
                        className="w-4 h-4 cursor-pointer accent-[#F9C744] rounded border-[#D1D5DB] focus:ring-[#F9C744] focus:ring-2"
                        aria-label={`Filter by ${label}`}
                        variants={checkboxVariants}
                        animate={isChecked ? "checked" : "unchecked"}
                        whileHover="hover"
                        whileTap={{ scale: 0.9 }}
                      />
                      <motion.span
                        className={`text-[#4B5563] group-hover:text-[#F9C744] transition-colors ${key === "inStock" && isChecked
                            ? "text-emerald-600"
                            : ""
                          } ${key === "outOfStock" && isChecked
                            ? "text-red-600"
                            : ""
                          }`}
                        animate={{
                          fontWeight: isChecked ? 600 : 400,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {label}
                      </motion.span>
                      {isChecked && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          }}
                          className={`ml-auto text-xs font-bold ${key === "inStock"
                              ? "text-emerald-600"
                              : "text-red-600"
                            }`}
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.label>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Apply Filters Button */}
      <motion.div
        className="p-4 md:p-5 bg-[#FFF8E1]/30 border-t border-[#E5E7EB]"
        variants={sectionVariants}
      >
        <motion.button
          className="w-full py-3 bg-gradient-to-r from-[#06101E] to-[#0A1A2E] text-white rounded-xl text-sm font-semibold hover:from-[#0A1A2E] hover:to-[#06101E] transition-all duration-300 relative overflow-hidden shadow-lg shadow-[#06101E]/10 font-sans"
          aria-label="Apply all filters"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          {/* Button Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          {/* Button Glow */}
          <motion.div
            className="absolute inset-0 bg-[#F9C744]/10 rounded-xl"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            Apply Filters
            {getFilterCount() > 0 && (
              <motion.span
                className="bg-[#F9C744] text-[#06101E] px-2 py-0.5 rounded-full text-xs font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
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

        {/* Active Filters Display */}
        <AnimatePresence>
          {getFilterCount() > 0 && (
            <motion.div
              className="mt-3 flex flex-wrap gap-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {filters.categories.map((cat) => (
                <motion.span
                  key={cat}
                  className="bg-[#F9C744]/10 text-[#06101E] text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#F9C744]/20 font-sans"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                  }}
                >
                  {cat}
                  <motion.button
                    onClick={() => handleCategoryChange(cat)}
                    className="hover:text-[#06101E] ml-0.5"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    ×
                  </motion.button>
                </motion.span>
              ))}
              {filters.availability.inStock && (
                <motion.span
                  className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 font-sans"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                  }}
                >
                  In Stock
                  <motion.button
                    onClick={() => handleAvailabilityChange("inStock")}
                    className="hover:text-emerald-800 ml-0.5"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    ×
                  </motion.button>
                </motion.span>
              )}
              {filters.availability.outOfStock && (
                <motion.span
                  className="bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-red-200 font-sans"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                  }}
                >
                  Out of Stock
                  <motion.button
                    onClick={() => handleAvailabilityChange("outOfStock")}
                    className="hover:text-red-800 ml-0.5"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
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