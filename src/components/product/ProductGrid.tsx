"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";

type SortOption = "recommended" | "price-low" | "price-high" | "newest";

type ApiProduct = {
  id: number | string;
  name?: string | null;
  slug?: string | null;
  retail_price?: number | string | null;
  retail_mrp?: number | string | null;
  distributor_price?: number | string | null;
  distributor_mrp?: number | string | null;
  effective_price?: number | string | null;
  effective_mrp?: number | string | null;
  retail_discount_percentage?: number | string | null;
  stock_quantity?: number | string | null;
  stock_status?: string | null;
  primary_image_url?: string | null;
  images?: Array<string | { image_url?: string; url?: string; is_primary?: boolean; sort_order?: number }>;
  category?: { id?: number; name?: string; slug?: string } | null;
  brand?: string | null;
  brand_name?: string | null;
  brandName?: string | null;
  reviews_summary?: { average_rating?: number | string | null; total_reviews?: number | string | null };
  description?: string | null;
  short_description?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.035, delayChildren: 0.02 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
};

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getProductList = (response: unknown): ApiProduct[] => {
  if (Array.isArray(response)) return response as ApiProduct[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  if (Array.isArray(value.data)) return value.data as ApiProduct[];
  if (Array.isArray(value.products)) return value.products as ApiProduct[];
  if (Array.isArray(value.items)) return value.items as ApiProduct[];

  const nested = value.data;
  if (nested && typeof nested === "object") {
    const nestedValue = nested as Record<string, unknown>;
    if (Array.isArray(nestedValue.data)) return nestedValue.data as ApiProduct[];
    if (Array.isArray(nestedValue.products)) return nestedValue.products as ApiProduct[];
    if (Array.isArray(nestedValue.items)) return nestedValue.items as ApiProduct[];
  }

  return [];
};

export default function ProductGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const productsPerPage = 12;

  const {
    data: productsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetProductsQuery({
    per_page: 100,
    page: 1,
    is_published: true,
  });

  const products = useMemo(() => {
    return getProductList(productsData).map((product) => {
      const retailPrice = toNumber(
        product.retail_price ?? product.effective_price ?? product.price,
      );
      const mrp = toNumber(
        product.retail_mrp ?? product.effective_mrp ?? product.originalPrice,
      );
      const providedDiscount = toNumber(product.retail_discount_percentage);
      const calculatedDiscount = mrp > retailPrice && mrp > 0
        ? Math.round(((mrp - retailPrice) / mrp) * 100)
        : 0;

      const stockValue = product.stock_quantity ?? product.stockQuantity;
      const hasStockValue = stockValue !== undefined && stockValue !== null && stockValue !== "";
      const quantity = toNumber(stockValue);
      const stockStatus = String(product.stock_status ?? product.stockStatus ?? "").toLowerCase();
      const statusAllowsStock = !stockStatus || stockStatus === "active" || stockStatus === "low_stock";
      const inStock = typeof product.inStock === "boolean"
        ? product.inStock
        : statusAllowsStock && (!hasStockValue || quantity > 0);

      return {
        ...product,
        id: product.id,
        name: product.name || "Product",
        slug: product.slug ?? null,
        // Preserve the original API fields so ProductCard can correctly choose
        // retail or distributor pricing and find category IDs / image galleries.
        price: retailPrice,
        originalPrice: mrp > retailPrice ? mrp : (product.originalPrice ?? null),
        discount: providedDiscount > 0 ? providedDiscount : calculatedDiscount,
        image:
          product.primary_image_url ||
          (typeof product.image === "string" ? product.image : "") ||
          "/indiekonnect-web/images/test.jpg",
        rating: toNumber(product.reviews_summary?.average_rating ?? product.rating),
        reviews: toNumber(product.reviews_summary?.total_reviews ?? product.reviews),
        inStock,
      };
    });
  }, [productsData]);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => toNumber(a.price) - toNumber(b.price));
      case "price-high":
        return sorted.sort((a, b) => toNumber(b.price) - toNumber(a.price));
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = Date.parse(String(a.created_at ?? "")) || 0;
          const dateB = Date.parse(String(b.created_at ?? "")) || 0;
          if (dateA !== dateB) return dateB - dateA;
          return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
        });
      default:
        return sorted;
    }
  }, [products, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / productsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const indexOfFirstProduct = (safePage - 1) * productsPerPage;
  const indexOfLastProduct = Math.min(indexOfFirstProduct + productsPerPage, sortedProducts.length);
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as SortOption);
    setCurrentPage(1);
  };

  // Break out of a centered/max-width parent so the product section can use
  // the full viewport width. The inner padding keeps cards off the screen edge.
  const viewportSectionClass =
    "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-2 sm:px-3 lg:px-5";

  if (isLoading) {
    return (
      <section className={viewportSectionClass} aria-label="Loading products">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="h-4 w-40 animate-pulse rounded bg-[#eeeeee]" />
          <div className="h-9 w-36 animate-pulse rounded-lg bg-[#eeeeee]" />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="min-w-0 animate-pulse">
              <div className="aspect-square rounded-[9px] border border-[#eeeeef] bg-[#f5f5f5]" />
              <div className="mt-3 h-4 w-20 rounded bg-[#eeeeee]" />
              <div className="mt-2 h-3 w-4/5 rounded bg-[#eeeeee]" />
              <div className="mt-2 h-3 w-3/5 rounded bg-[#eeeeee]" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`${viewportSectionClass} py-12 text-center`}>
        <p className="mb-2 text-lg font-semibold text-[#222]">Failed to load products</p>
        <p className="mb-4 text-sm text-[#777]">Please check your connection and try again.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-full bg-[#111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#333]"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className={`${viewportSectionClass} pb-8`} aria-label="Products">
      <motion.div
        className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="text-xs text-[#666] sm:text-sm" aria-live="polite">
          {sortedProducts.length > 0
            ? `Showing ${indexOfFirstProduct + 1}–${indexOfLastProduct} of ${sortedProducts.length} products`
            : "No products found"}
          {isFetching && !isLoading ? " · Updating…" : ""}
        </p>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label htmlFor="product-sort" className="whitespace-nowrap text-xs text-[#666] sm:text-sm">
            Sort by:
          </label>
          <select
            id="product-sort"
            value={sortBy}
            onChange={handleSortChange}
            className="h-9 min-w-0 flex-1 rounded-lg border border-[#e2e2e2] bg-white px-3 text-xs text-[#222] outline-none transition focus:border-[#999] sm:flex-none sm:text-sm"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </motion.div>

      {currentProducts.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#777]">No products found.</div>
      ) : (
        <motion.div
          key={`${safePage}-${sortBy}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 items-start gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-5"
        >
          {currentProducts.map((product) => (
            <motion.div key={String(product.id)} variants={itemVariants} className="min-w-0 w-full">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Product pages">
          <button
            type="button"
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage === 1}
            className="rounded-lg border border-[#e1e1e1] bg-white px-3 py-2 text-xs text-[#222] transition hover:border-[#222] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter((page) =>
              totalPages <= 7 ||
              page === 1 ||
              page === totalPages ||
              Math.abs(page - safePage) <= 2,
            )
            .map((page, index, pages) => (
              <span key={page} className="contents">
                {index > 0 && page - pages[index - 1] > 1 && (
                  <span className="px-1 text-xs text-[#888]" aria-hidden="true">…</span>
                )}
                <button
                  type="button"
                  onClick={() => handlePageChange(page)}
                  aria-current={safePage === page ? "page" : undefined}
                  className={`h-9 min-w-9 rounded-lg border px-3 text-xs transition sm:text-sm ${safePage === page
                      ? "border-[#111] bg-[#111] text-white"
                      : "border-[#e1e1e1] bg-white text-[#222] hover:border-[#222]"
                    }`}
                >
                  {page}
                </button>
              </span>
            ))}

          <button
            type="button"
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage === totalPages}
            className="rounded-lg border border-[#e1e1e1] bg-white px-3 py-2 text-xs text-[#222] transition hover:border-[#222] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
