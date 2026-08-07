"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterState } from "../../Screens/types/product";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const CATEGORIES: string[] = [
    "All Collection",
    "Watch",
    "Dinnerware",
    "Business Tools",
];

export default function FilterSidebar(): JSX.Element {
    const [filters, setFilters] = useState<FilterState>({
        categories: [],
        priceRange: [1000, 5100],
        availability: {
            inStock: false,
            outOfStock: false,
        },
    });
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        availability: true,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleCategoryChange = useCallback((category: string): void => {
        setFilters((prev) => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter((c) => c !== category)
                : [...prev.categories, category],
        }));
    }, []);

    const handlePriceChange = useCallback(
        (index: number, value: number): void => {
            setFilters((prev) => {
                const newRange: [number, number] = [...prev.priceRange] as [
                    number,
                    number,
                ];
                newRange[index] = value;
                return { ...prev, priceRange: newRange };
            });
        },
        [],
    );

    const handleAvailabilityChange = useCallback(
        (type: keyof FilterState["availability"]): void => {
            setFilters((prev) => ({
                ...prev,
                availability: {
                    ...prev.availability,
                    [type]: !prev.availability[type],
                },
            }));
        },
        [],
    );

    const clearFilters = useCallback((): void => {
        setFilters({
            categories: [],
            priceRange: [1000, 5100],
            availability: {
                inStock: false,
                outOfStock: false,
            },
        });
    }, []);

    const getFilterCount = (): number => {
        return (
            filters.categories.length +
            Object.values(filters.availability).filter((v) => v).length
        );
    };

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
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
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
            color: "#000",
            transition: { duration: 0.2 },
        },
        tap: {
            scale: 0.95,
            transition: { duration: 0.1 },
        },
    };

    return (
        <motion.aside
            className="bg-white rounded-xl shadow-sm h-fit md:sticky md:top-5 overflow-hidden border border-gray-100"
            aria-label="Product filters"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div
                className="flex justify-between items-center p-4 md:p-5 border-b border-gray-100"
                variants={sectionVariants}
            >
                <motion.h3
                    className="text-sm font-bold text-gray-800 flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    FILTERS
                    <motion.span
                        className="bg-yellow-400 text-gray-900 text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center"
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
                    className="text-xs text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
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
                className="border-b border-gray-100"
                variants={sectionVariants}
            >
                <motion.div
                    className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSection("categories")}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                >
                    <h4 className="text-sm font-semibold text-gray-600">
                        CATEGORIES
                    </h4>
                    <motion.div
                        animate={{
                            rotate: expandedSections.categories ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {expandedSections.categories ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
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
                                {CATEGORIES.map((category, index) => (
                                    <motion.label
                                        key={category}
                                        className="flex items-center gap-2.5 text-sm cursor-pointer group"
                                        variants={itemVariants}
                                        custom={index}
                                        whileHover="hover"
                                    >
                                        <motion.input
                                            type="checkbox"
                                            checked={filters.categories.includes(
                                                category
                                            )}
                                            onChange={() =>
                                                handleCategoryChange(category)
                                            }
                                            className="w-4 h-4 cursor-pointer accent-yellow-500 rounded"
                                            aria-label={`Filter by ${category}`}
                                            variants={checkboxVariants}
                                            animate={
                                                filters.categories.includes(
                                                    category
                                                )
                                                    ? "checked"
                                                    : "unchecked"
                                            }
                                            whileHover="hover"
                                            whileTap={{ scale: 0.9 }}
                                        />
                                        <motion.span
                                            className="text-gray-700 group-hover:text-yellow-600 transition-colors"
                                            animate={{
                                                fontWeight: filters.categories.includes(
                                                    category
                                                )
                                                    ? 600
                                                    : 400,
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {category}
                                        </motion.span>
                                        {filters.categories.includes(
                                            category
                                        ) && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 400,
                                                        damping: 10,
                                                    }}
                                                    className="ml-auto text-yellow-500 text-xs"
                                                >
                                                    ✓
                                                </motion.span>
                                            )}
                                    </motion.label>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Price Range Section */}
            <motion.div
                className="border-b border-gray-100"
                variants={sectionVariants}
            >
                <motion.div
                    className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSection("price")}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                >
                    <h4 className="text-sm font-semibold text-gray-600">
                        PRICE
                    </h4>
                    <motion.div
                        animate={{
                            rotate: expandedSections.price ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {expandedSections.price ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
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
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={filters.priceRange[0]}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>
                                            ) =>
                                                handlePriceChange(
                                                    0,
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                                            min="0"
                                            aria-label="Minimum price"
                                        />
                                    </motion.div>
                                    <span className="text-gray-400 text-xs">
                                        —
                                    </span>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="relative flex-1"
                                    >
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={filters.priceRange[1]}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>
                                            ) =>
                                                handlePriceChange(
                                                    1,
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                                            min="0"
                                            aria-label="Maximum price"
                                        />
                                    </motion.div>
                                </div>
                                <div className="space-y-1">
                                    <motion.input
                                        type="range"
                                        min="0"
                                        max="6000"
                                        value={filters.priceRange[0]}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) =>
                                            handlePriceChange(
                                                0,
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:bg-yellow-400 transition-all"
                                        aria-label="Minimum price slider"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    />
                                    <motion.input
                                        type="range"
                                        min="0"
                                        max="6000"
                                        value={filters.priceRange[1]}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) =>
                                            handlePriceChange(
                                                1,
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:bg-yellow-400 transition-all"
                                        aria-label="Maximum price slider"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    />
                                    {/* Price Range Visualization */}
                                    <motion.div
                                        className="relative w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-1"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <motion.div
                                            className="absolute h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                                            style={{
                                                left: `${(filters.priceRange[0] / 6000) * 100}%`,
                                                right: `${100 - (filters.priceRange[1] / 6000) * 100}%`,
                                            }}
                                            animate={{
                                                left: `${(filters.priceRange[0] / 6000) * 100}%`,
                                                right: `${100 - (filters.priceRange[1] / 6000) * 100}%`,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    </motion.div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                        <span>₹0</span>
                                        <span>₹6,000</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Availability Section */}
            <motion.div variants={sectionVariants}>
                <motion.div
                    className="flex justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSection("availability")}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                >
                    <h4 className="text-sm font-semibold text-gray-600">
                        AVAILABILITY
                    </h4>
                    <motion.div
                        animate={{
                            rotate: expandedSections.availability ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {expandedSections.availability ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
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
                                            className="flex items-center gap-2.5 text-sm cursor-pointer group"
                                            variants={itemVariants}
                                            whileHover="hover"
                                        >
                                            <motion.input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() =>
                                                    handleAvailabilityChange(
                                                        key as keyof FilterState["availability"]
                                                    )
                                                }
                                                className="w-4 h-4 cursor-pointer accent-yellow-500 rounded"
                                                aria-label={`Filter by ${label}`}
                                                variants={checkboxVariants}
                                                animate={
                                                    isChecked
                                                        ? "checked"
                                                        : "unchecked"
                                                }
                                                whileHover="hover"
                                                whileTap={{ scale: 0.9 }}
                                            />
                                            <motion.span
                                                className="text-gray-700 group-hover:text-yellow-600 transition-colors"
                                                animate={{
                                                    fontWeight: isChecked
                                                        ? 600
                                                        : 400,
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
                                                    className="ml-auto text-yellow-500 text-xs"
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
                className="p-4 md:p-5 bg-gray-50 border-t border-gray-100"
                variants={sectionVariants}
            >
                <motion.button
                    className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl text-sm font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 relative overflow-hidden shadow-lg"
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
                        className="absolute inset-0 bg-yellow-400/10 rounded-xl"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Apply Filters
                        {getFilterCount() > 0 && (
                            <motion.span
                                className="bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold"
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
                                    className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-yellow-200"
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
                                        onClick={() =>
                                            handleCategoryChange(cat)
                                        }
                                        className="hover:text-yellow-900 ml-0.5"
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.8 }}
                                    >
                                        ×
                                    </motion.button>
                                </motion.span>
                            ))}
                            {filters.availability.inStock && (
                                <motion.span
                                    className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-green-200"
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
                                        onClick={() =>
                                            handleAvailabilityChange("inStock")
                                        }
                                        className="hover:text-green-900 ml-0.5"
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.8 }}
                                    >
                                        ×
                                    </motion.button>
                                </motion.span>
                            )}
                            {filters.availability.outOfStock && (
                                <motion.span
                                    className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-red-200"
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
                                        onClick={() =>
                                            handleAvailabilityChange(
                                                "outOfStock"
                                            )
                                        }
                                        className="hover:text-red-900 ml-0.5"
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