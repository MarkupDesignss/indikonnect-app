"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "../../lib/slices/toastSlice";

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
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<SortOption>("recommended");
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
    const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
    const productsPerPage: number = 12;

    // Fetch products from API
    const { 
        data: productsData, 
        isLoading, 
        error, 
        refetch 
    } = useGetProductsQuery({
        per_page: 100,
        page: 1,
        is_published: true,
    });

    // Add to cart mutation
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

    const handleImageLoad = (productId: number) => {
        setImageLoaded(prev => ({ ...prev, [productId]: true }));
    };

    // Handle Add to Cart
    const handleAddToCart = async (productId: number, productName: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAddingToCart) return;

        setAddingToCartId(productId);
        try {
            await addToCart({
                product_id: productId,
                quantity: 1
            }).unwrap();

            dispatch(
                showToast({
                    message: `${productName} added to cart successfully! 🛒`,
                    type: "success",
                })
            );
        } catch (error: any) {
            console.error("Failed to add to cart:", error);
            dispatch(
                showToast({
                    message: error?.data?.message || "Failed to add item to cart",
                    type: "error",
                })
            );
        } finally {
            setAddingToCartId(null);
        }
    };

    // Transform API data to product format
    const products = useMemo(() => {
        if (!productsData?.data) return [];
        return productsData.data.map((product: any) => {
            const retailPrice = parseFloat(product.retail_price);
            const distributorPrice = parseFloat(product.distributor_price);
            const discount = distributorPrice > retailPrice 
                ? Math.round(((distributorPrice - retailPrice) / distributorPrice) * 100)
                : null;

            return {
                id: product.id,
                slug: product.slug,
                name: product.name,
                category: product.category?.name || "Uncategorized",
                price: retailPrice,
                originalPrice: distributorPrice > retailPrice ? distributorPrice : null,
                discount: discount,
                image: product.primary_image_url || "/images/placeholder.jpg",
                images: product.images || [],
                rating: 4.5, // Default rating since API doesn't provide
                reviews: 120, // Default reviews
                inStock: product.stock_status === 'active' && product.stock_quantity > 0,
                stockQuantity: product.stock_quantity,
                description: product.description,
                specification: product.specification,
                isWishlisted: product.is_wishlisted || false,
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
        indexOfLastProduct
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

    const renderRatingStars = (rating: number = 4.5) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="text-yellow-400 text-xs">★</span>
                ))}
                {hasHalfStar && (
                    <span className="text-yellow-400 text-xs">★</span>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="text-gray-300 text-xs">★</span>
                ))}
            </div>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                            <div className="relative pt-[100%] bg-gray-200" />
                            <div className="p-4 space-y-3">
                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-5 bg-gray-200 rounded w-1/2" />
                                <div className="h-8 bg-gray-200 rounded w-full" />
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Failed to load products
                </h3>
                <p className="text-gray-500 mb-4">
                    Please try refreshing the page
                </p>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-[#C9A227] text-white rounded-lg hover:bg-[#B6871C] transition-colors"
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
                    className="text-xs sm:text-sm text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {sortedProducts.length > 0 ? (
                        `Showing ${indexOfFirstProduct + 1}-
                        ${Math.min(indexOfLastProduct, sortedProducts.length)} of 
                        ${sortedProducts.length} Products`
                    ) : (
                        "No products found"
                    )}
                </motion.div>
                <motion.div
                    className="flex items-center gap-2 w-full sm:w-auto"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <label htmlFor="sort-select" className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        Sort By:
                    </label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={handleSortChange}
                        className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
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
                    className="text-center py-10 text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    No products found
                </motion.div>
            ) : (
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    key={currentPage}
                >
                    {currentProducts.map((product: any) => {
                        const isAdding = addingToCartId === product.id;
                        const isInStock = product.inStock;

                        return (
                            <motion.div
                                key={product.id}
                                variants={itemVariants}
                                className="h-full"
                                onMouseEnter={() => setHoveredProduct(product.id)}
                                onMouseLeave={() => setHoveredProduct(null)}
                            >
                                <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50 relative h-full flex flex-col">
                                    {/* Product Image */}
                                    <Link href={`/product/${product.slug}`} className="block flex-shrink-0">
                                        <div className="relative pt-[100%] bg-gray-100 overflow-hidden">
                                            <Image
                                                src={product.image || '/images/placeholder.jpg'}
                                                alt={product.name}
                                                fill
                                                className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                                                    imageLoaded[product.id] ? 'opacity-100' : 'opacity-0'
                                                }`}
                                                onLoadingComplete={() => handleImageLoad(product.id)}
                                            />
                                            
                                            {!imageLoaded[product.id] && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                                            )}

                                            {/* Discount Badge */}
                                            {product.discount && product.discount > 0 && (
                                                <motion.span
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                                                    className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-[10px] font-bold z-10 shadow-lg"
                                                >
                                                    -{product.discount}%
                                                </motion.span>
                                            )}

                                            {/* Out of Stock Overlay */}
                                            {!isInStock && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                                    <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}

                                            {/* Wishlist Button */}
                                            <motion.button
                                                className="absolute top-3 left-3 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (product.isWishlisted) {
                                                        dispatch(
                                                            showToast({
                                                                message: `Removed ${product.name} from wishlist`,
                                                                type: "info",
                                                            })
                                                        );
                                                    } else {
                                                        dispatch(
                                                            showToast({
                                                                message: `${product.name} added to wishlist! ❤️`,
                                                                type: "success",
                                                            })
                                                        );
                                                    }
                                                }}
                                            >
                                                <Heart 
                                                    className={`w-4 h-4 transition-colors ${
                                                        product.isWishlisted 
                                                            ? 'text-red-500 fill-red-500' 
                                                            : 'text-gray-500 hover:text-red-500'
                                                    }`} 
                                                />
                                            </motion.button>

                                            {/* Quick View on Hover */}
                                            <AnimatePresence>
                                                {hoveredProduct === product.id && isInStock && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 bg-black/20 flex items-center justify-center z-10"
                                                    >
                                                        <motion.button
                                                            initial={{ scale: 0.8, y: 10 }}
                                                            animate={{ scale: 1, y: 0 }}
                                                            exit={{ scale: 0.8, y: 10 }}
                                                            className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-gray-50 transition-colors"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                router.push(`/product/${product.slug}`);
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Quick View
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </Link>

                                    {/* Product Details */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <Link href={`/product/${product.slug}`} className="flex-1">
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                                                {product.category}
                                            </div>
                                            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-[#C9A227] transition-colors">
                                                {product.name}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-base font-bold text-gray-900">
                                                    ₹{product.price.toLocaleString()}
                                                </span>
                                                {product.originalPrice && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ₹{product.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-1 mt-1">
                                                {renderRatingStars(product.rating)}
                                                <span className="text-gray-400 text-[10px]">({product.reviews})</span>
                                            </div>
                                        </Link>

                                        {/* Add to Cart Button */}
                                        <motion.button
                                            whileHover={isInStock && !isAdding ? { scale: 1.02 } : {}}
                                            whileTap={isInStock && !isAdding ? { scale: 0.98 } : {}}
                                            disabled={!isInStock || isAdding}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (isInStock) {
                                                    handleAddToCart(product.id, product.name, e);
                                                }
                                            }}
                                            className={`w-full mt-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 relative overflow-hidden ${
                                                isInStock && !isAdding
                                                    ? "bg-[#C9A227] text-white hover:bg-[#B6871C] cursor-pointer"
                                                    : isAdding
                                                    ? "bg-gray-600 text-white cursor-wait"
                                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }`}
                                        >
                                            {isAdding ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <motion.div
                                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    Adding...
                                                </span>
                                            ) : isInStock ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <ShoppingCart className="w-4 h-4" />
                                                    Add to Cart
                                                </span>
                                            ) : (
                                                "Out of Stock"
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
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
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm cursor-pointer transition-all hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className={`px-2.5 py-1.5 md:px-3.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm cursor-pointer transition-all ${
                                        currentPage === page
                                            ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                            : "bg-white hover:bg-gray-100"
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
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm cursor-pointer transition-all hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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