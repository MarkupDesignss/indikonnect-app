"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";

type SortOption = "recommended" | "price-low" | "price-high" | "newest";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function ProductGrid(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const productsPerPage: number = 12;

  // Fetch products from API
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useGetProductsQuery({
    per_page: 100,
    page: 1,
    is_published: true,
  });

  // Transform API data to product format
  const products = useMemo(() => {
    if (!productsData?.data) return [];
    return productsData.data.map((product: any) => {
      const retailPrice = parseFloat(product.retail_price);
      const distributorPrice = parseFloat(product.distributor_price);
      const discount =
        distributorPrice > retailPrice
          ? Math.round(
            ((distributorPrice - retailPrice) / distributorPrice) * 100,
          )
          : null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category?.name || "Uncategorized",
        price: retailPrice,
        originalPrice: distributorPrice > retailPrice ? distributorPrice : null,
        discount: discount && discount > 0 ? discount : null,
        image: product.primary_image_url || "/indiekonnect-web/images/placeholder.jpg",
        rating: 4.5,
        reviews: 120,
        inStock:
          product.stock_status === "active" && product.stock_quantity > 0,
      };
    });
  }, [productsData]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        return sorted.sort((a, b) => b.id - a.id);
      default:
        return sorted;
    }
  }, [sortBy, products]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(e.target.value as SortOption);
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div className="h-4 bg-[#E5E7EB] rounded w-48 animate-pulse" />
          <div className="h-10 bg-[#E5E7EB] rounded w-40 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_-8px_rgba(6,16,30,0.06)] animate-pulse border border-[#E5E7EB]/30"
            >
              <div className="relative pt-[100%] bg-[#E5E7EB]" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-[#E5E7EB] rounded w-1/3" />
                <div className="h-4 bg-[#E5E7EB] rounded w-3/4" />
                <div className="h-5 bg-[#E5E7EB] rounded w-1/2" />
                <div className="h-8 bg-[#E5E7EB] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-serif font-semibold text-[#06101E] mb-2">
          Failed to load products
        </h3>
        <p className="text-[#6B7280] mb-4 font-sans">
          Please try refreshing the page
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#06101E] text-white rounded-lg hover:bg-[#F9C744] hover:text-[#06101E] transition-all duration-300 font-sans font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Animation */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-xs sm:text-sm text-[#6B7280] font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {sortedProducts.length > 0
            ? `Showing ${indexOfFirstProduct + 1}-
                        ${Math.min(indexOfLastProduct, sortedProducts.length)} of 
                        ${sortedProducts.length} Products`
            : "No products found"}
        </motion.div>
        <motion.div
          className="flex items-center gap-2 w-full sm:w-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label
            htmlFor="sort-select"
            className="text-xs sm:text-sm text-[#6B7280] whitespace-nowrap font-sans"
          >
            Sort By:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={handleSortChange}
            className="flex-1 sm:flex-none px-3 py-1.5 border border-[#D1D5DB] rounded-lg text-xs sm:text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F9C744] focus:border-transparent transition-all duration-200 font-sans text-[#06101E]"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </motion.div>
      </motion.div>

      {/* Products Grid with Staggered Animation */}
      {currentProducts.length === 0 ? (
        <motion.div
          className="text-center py-10 text-[#6B7280] font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No products found
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={currentPage}
        >
          {currentProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="h-full"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination with Animation */}
      {totalPages > 1 && (
        <motion.div
          className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mt-6 md:mt-8 pt-4 md:pt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-white border border-[#D1D5DB] rounded-lg text-xs md:text-sm cursor-pointer transition-all hover:bg-[#06101E] hover:text-white hover:border-[#06101E] disabled:opacity-50 disabled:cursor-not-allowed font-sans text-[#06101E]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous page"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">‹</span>
          </motion.button>

          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              let page = i + 1;
              if (totalPages > 10) {
                if (currentPage <= 5) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 4) {
                  page = totalPages - 9 + i;
                } else {
                  page = currentPage - 4 + i;
                }
              }
              return (
                <motion.button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-2.5 py-1.5 md:px-3.5 md:py-2 border border-[#D1D5DB] rounded-lg text-xs md:text-sm cursor-pointer transition-all font-sans ${currentPage === page
                      ? "bg-[#06101E] text-white border-[#06101E] shadow-md shadow-[#06101E]/10"
                      : "bg-white text-[#06101E] hover:bg-[#F9C744] hover:text-[#06101E] hover:border-[#F9C744]"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-white border border-[#D1D5DB] rounded-lg text-xs md:text-sm cursor-pointer transition-all hover:bg-[#06101E] hover:text-white hover:border-[#06101E] disabled:opacity-50 disabled:cursor-not-allowed font-sans text-[#06101E]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">›</span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}