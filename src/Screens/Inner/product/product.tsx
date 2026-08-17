// src/Screens/Inner/product/page.tsx
"use client";

import { Suspense, useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/product/FilterSidebar";
import Newsletter from "@/components/product/Newsletter";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/common/Header";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import BannerImage from "../../../../public/indiekonnect-web/images/banner.png";

// ==================== TYPES ====================
interface FilterState {
  categories: string[];
  priceRange: [number, number];
  availability: {
    inStock: boolean;
    outOfStock: boolean;
  };
}

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isWishlisted?: boolean;
}

interface Category {
  id: number;
  title: string;
  slug: string;
  name?: string;
}

interface CategoryResponse {
  data: Category[];
}

interface ProductApiResponse {
  data: any[];
  meta: {
    total: number;
    last_page: number;
    current_page: number;
    per_page: number;
  };
}

type SortOption = "recommended" | "price-low" | "price-high" | "newest";

// ==================== CONSTANTS ====================
const PRODUCTS_PER_PAGE = 12;
const MAX_PRICE_LIMIT = 8000;
const VISIBLE_PAGES = 5;
const SKELETON_COUNT = 6;

// ==================== MAIN COMPONENT ====================
export default function ProductsPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==================== FILTER STATE ====================
  const [filters, setFilters] = useState<FilterState>(() => ({
    categories: searchParams.get("category")?.split(",").filter(Boolean) || [],
    priceRange: [
      parseInt(searchParams.get("min_price") || "0"),
      parseInt(searchParams.get("max_price") || String(MAX_PRICE_LIMIT)),
    ],
    availability: {
      inStock: searchParams.get("in_stock") === "true",
      outOfStock: searchParams.get("out_of_stock") === "true",
    },
  }));

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "recommended"
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  // ==================== API FETCH ====================
  const { data: categoriesData } = useGetCategoriesQuery({});

  // Create category ID map for filtering
  const categoryIdMap = useMemo(() => {
    const map = new Map<string, number>();
    categoriesData?.data?.forEach((cat: Category) => {
      map.set(cat.title, cat.id);
    });
    return map;
  }, [categoriesData]);

  // Sync URL categories with state
  useEffect(() => {
    const categoryParam = searchParams.get("category");

    if (!categoryParam || !categoriesData?.data) return;

    const urlCategories = categoryParam
      .split(",")
      .map((category) => decodeURIComponent(category).trim())
      .filter(Boolean);

    const validCategories = urlCategories.filter((categoryTitle) =>
      categoriesData.data.some(
        (category: Category) => category.title === categoryTitle
      )
    );

    setFilters((prev) => {
      const sameCategories =
        prev.categories.length === validCategories.length &&
        prev.categories.every((category) => validCategories.includes(category));

      if (sameCategories) return prev;

      return {
        ...prev,
        categories: validCategories,
      };
    });
  }, [searchParams, categoriesData]);

  // Sync search and page from URL
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");

    setSearchQuery((prev) => (prev === search ? prev : search));
    setCurrentPage((prev) => (prev === page ? prev : page));
  }, [searchParams]);

  // Build API query parameters
  const buildQueryParams = useCallback(() => {
    const params: Record<string, any> = {
      page: currentPage,
      per_page: PRODUCTS_PER_PAGE,
      is_published: 1,
    };

    // Categories - convert category titles to IDs
    if (filters.categories.length > 0) {
      const categoryIds = filters.categories
        .map((title) => categoryIdMap.get(title))
        .filter((id): id is number => id !== undefined)
        .join(",");
      if (categoryIds) {
        params.category_ids = categoryIds;
      }
    }

    // Price range
    if (filters.priceRange[0] > 0) {
      params.min_price = filters.priceRange[0];
    }
    if (filters.priceRange[1] < MAX_PRICE_LIMIT) {
      params.max_price = filters.priceRange[1];
    }

    // Stock status
    if (filters.availability.inStock && !filters.availability.outOfStock) {
      params.stock_status = "in_stock";
    } else if (!filters.availability.inStock && filters.availability.outOfStock) {
      params.stock_status = "out_of_stock";
    }

    // Search
    if (searchQuery) {
      params.search = searchQuery;
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        params.sort_by = "retail_price";
        params.sort_direction = "asc";
        break;
      case "price-high":
        params.sort_by = "retail_price";
        params.sort_direction = "desc";
        break;
      case "newest":
        params.sort_by = "created_at";
        params.sort_direction = "desc";
        break;
      default:
        break;
    }

    return params;
  }, [filters, currentPage, searchQuery, sortBy, categoryIdMap]);

  // Fetch products
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useGetProductsQuery(buildQueryParams());

  // Transform API data to product format
  const products = useMemo(() => {
    if (!productsData?.data) return [];
    return productsData.data.map((product: any) => {
      const retailPrice = parseFloat(product.retail_price);
      const distributorPrice = parseFloat(product.distributor_price);
      const discount =
        distributorPrice > retailPrice
          ? Math.round(((distributorPrice - retailPrice) / distributorPrice) * 100)
          : null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category?.name || "Uncategorized",
        price: retailPrice,
        originalPrice: distributorPrice > retailPrice ? distributorPrice : null,
        discount: discount && discount > 0 ? discount : null,
        image: product.primary_image_url || "/images/placeholder.jpg",
        rating: 4.5,
        reviews: 120,
        inStock: product.stock_status === "active" && product.stock_quantity > 0,
      };
    });
  }, [productsData]);

  // ==================== URL SYNC ====================
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.categories.length > 0) {
      params.set("category", filters.categories.join(","));
    }

    if (filters.priceRange[0] > 0) {
      params.set("min_price", filters.priceRange[0].toString());
    }

    if (filters.priceRange[1] < MAX_PRICE_LIMIT) {
      params.set("max_price", filters.priceRange[1].toString());
    }

    if (filters.availability.inStock) {
      params.set("in_stock", "true");
    }

    if (filters.availability.outOfStock) {
      params.set("out_of_stock", "true");
    }

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    if (sortBy !== "recommended") {
      params.set("sort", sortBy);
    }

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    const queryString = params.toString();
    router.replace(
      queryString ? `/products?${queryString}` : "/products",
      { scroll: false }
    );
  }, [filters, searchQuery, sortBy, currentPage, router]);

  // ==================== HANDLERS ====================
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      categories: [],
      priceRange: [0, MAX_PRICE_LIMIT],
      availability: { inStock: false, outOfStock: false },
    });
    setSearchQuery("");
    setSortBy("recommended");
  }, []);

  // ==================== PAGINATION HELPERS ====================
  const getPaginationPages = useMemo(() => {
    const lastPage = productsData?.meta?.last_page || 0;
    if (lastPage <= 1) return [];

    const pages: number[] = [];
    const totalPages = Math.min(lastPage, VISIBLE_PAGES);

    if (lastPage <= VISIBLE_PAGES) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= VISIBLE_PAGES; i++) {
          pages.push(i);
        }
      } else if (currentPage >= lastPage - 2) {
        for (let i = lastPage - VISIBLE_PAGES + 1; i <= lastPage; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  }, [productsData?.meta?.last_page, currentPage]);

  // ==================== RENDER HELPERS ====================
  const renderSkeletons = () => (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 rounded-xl animate-pulse h-80"
          aria-label="Loading product skeleton"
        />
      ))}
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12" role="alert">
      <div className="text-red-500 text-4xl mb-4" aria-hidden="true">
        ⚠️
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Failed to load products
      </h3>
      <p className="text-gray-500 mb-4">Please try refreshing the page</p>
      <button
        onClick={() => refetch()}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition-all"
        aria-label="Retry loading products"
      >
        Retry
      </button>
    </div>
  );

  const renderProductGrid = () => (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key={currentPage}
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">
        No products found matching your criteria
      </p>
      <button
        onClick={handleClearFilters}
        className="mt-4 text-yellow-500 hover:text-yellow-600 font-medium"
      >
        Clear all filters
      </button>
    </div>
  );

  const renderPagination = () => {
    const lastPage = productsData?.meta?.last_page || 0;
    if (lastPage <= 1) return null;

    return (
      <nav className="flex justify-center mt-8 gap-2" aria-label="Pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          Previous
        </button>

        {getPaginationPages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-lg transition-all ${currentPage === page
                ? "bg-yellow-400 text-gray-900 font-semibold"
                : "border border-gray-200 hover:bg-gray-900 hover:text-white"
              }`}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    );
  };

  // ==================== ANIMATION VARIANTS ====================
  const bannerVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

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
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // ==================== RENDER ====================
  return (
    <div>
      <Header />

      {/* Banner */}
      <motion.div
        className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden"
        variants={bannerVariants}
        initial="hidden"
        animate="visible"
      >
        <Image
          src={BannerImage}
          alt="Collections Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
          <div className="w-full px-4 md:px-12 lg:px-16">
            <div className="max-w-2xl">
              <motion.h2
                className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Premium Collection ✨
              </motion.h2>
              <motion.p
                className="text-sm text-white mb-4 md:mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                Discover our curated selection of premium dinnerware and
                accessories
              </motion.p>
              <motion.button
                className="px-6 py-2 md:px-8 md:py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all text-sm md:text-black shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Shop now"
              >
                Shop Now →
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="w-full bg-white px-4 md:px-8 lg:px-16 py-8 md:py-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Collections
          </h1>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mt-2 sm:mt-0" aria-label="Breadcrumb">
            <span>Home</span>
            <span className="text-gray-300" aria-hidden="true">/</span>
            <span>Products</span>
          </nav>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            onFilterChange={handleFilterChange}
            maxPrice={MAX_PRICE_LIMIT}
            selectedCategories={filters.categories}
          />

          {/* Product Grid Area */}
          <div>
            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <div className="flex-1 w-full sm:max-w-sm">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  aria-label="Search products"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                aria-label="Sort products"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Product Count */}
            <div className="text-sm text-gray-500 mb-4" aria-live="polite">
              {products.length > 0
                ? `Showing ${(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-
                  ${Math.min(currentPage * PRODUCTS_PER_PAGE, productsData?.meta?.total || products.length)} of 
                  ${productsData?.meta?.total || products.length} Products`
                : "No products found"}
            </div>

            {/* Content */}
            {isLoading ? (
              renderSkeletons()
            ) : error ? (
              renderError()
            ) : (
              <>
                {products.length > 0 ? renderProductGrid() : renderEmptyState()}
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>

      <Newsletter />
      <Footer />
    </div>
  );
}