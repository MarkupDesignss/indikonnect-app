"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { showToast } from "../../lib/slices/toastSlice";
import {
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
    useGetWishlistQuery
} from "@/lib/redux/api/Wishlist/wishlistApi";

interface ProductCardProps {
    product: {
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
    };
}

export default function ProductCard({ product }: ProductCardProps): JSX.Element {
    const router = useRouter();
    const dispatch = useDispatch();
    const [isHovered, setIsHovered] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted || false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    // Add to cart mutation
    const [addToCart] = useAddToCartMutation();

    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery();

    useEffect(() => {
        if (wishlistData?.data) {
            const isInWishlist = wishlistData.data.some(
                (item: any) => item.product_id === product.id
            );
            setIsWishlisted(isInWishlist);
        }
    }, [wishlistData, product.id]);

    const renderRatingStars = (rating: number): string => {
        return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
    };

    // Navigate to product detail page
    const handleCardClick = () => {
        if (product && product.slug) {
            router.push(`/product/${product.slug}`);
        }
    };

    // Handle Add to Cart with API
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!product.inStock || isAddingToCart) return;

        setIsAddingToCart(true);
        try {
            await addToCart({
                product_id: product.id,
                quantity: 1
            }).unwrap();

            dispatch(
                showToast({
                    message: `${product.name} added to cart successfully! 🛒`,
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
            setIsAddingToCart(false);
        }
    };

    // Handle Wishlist Toggle
    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isWishlistLoading) return;

        setIsWishlistLoading(true);

        try {
            if (isWishlisted) {
                // Remove from wishlist
                await removeFromWishlist({ product_id: product.id }).unwrap();
                setIsWishlisted(false);
                dispatch(
                    showToast({
                        message: `${product.name} removed from wishlist`,
                        type: "info",
                    })
                );
            } else {
                // Add to wishlist
                await addToWishlist({ product_id: product.id }).unwrap();
                setIsWishlisted(true);
                dispatch(
                    showToast({
                        message: `${product.name} added to wishlist! ❤️`,
                        type: "success",
                    })
                );
            }
            // Refetch wishlist to update state
            await refetchWishlist();
        } catch (error: any) {
            console.error("Wishlist operation failed:", error);
            dispatch(
                showToast({
                    message: error?.data?.message || "Failed to update wishlist",
                    type: "error",
                })
            );
        } finally {
            setIsWishlistLoading(false);
        }
    };

    // Handle Quick View
    const handleQuickView = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (product?.slug) {
            router.push(`/product/${product.slug}`);
        }
    };

    const cardVariants = {
        initial: {
            opacity: 0,
            y: 30,
            scale: 0.95,
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
        hover: {
            y: -6,
            scale: 1.02,
            boxShadow: "0 20px 40px -12px rgba(6,16,30,0.15)",
            borderColor: "#F9C744",
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            },
        },
    };

    const imageVariants = {
        initial: {
            scale: 1,
        },
        hover: {
            scale: 1.08,
            transition: {
                duration: 0.5,
                ease: "easeInOut",
            },
        },
    };

    const discountVariants = {
        initial: {
            scale: 0,
            rotate: -180,
        },
        animate: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
            },
        },
        hover: {
            scale: 1.1,
            rotate: -5,
            transition: {
                duration: 0.2,
            },
        },
    };

    const buttonVariants = {
        initial: {
            scale: 1,
        },
        hover: {
            scale: 1.03,
            transition: {
                duration: 0.2,
                ease: "easeInOut",
            },
        },
        tap: {
            scale: 0.95,
            transition: {
                duration: 0.1,
            },
        },
    };

    const contentVariants = {
        initial: {
            opacity: 0,
            y: 15,
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                delay: 0.15,
                ease: "easeOut",
            },
        },
    };

    const ratingVariants = {
        initial: {
            opacity: 0,
            scale: 0.8,
        },
        animate: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                delay: 0.3,
                ease: "easeOut",
            },
        },
    };

    const wishlistButtonVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.2,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10,
            }
        },
        tap: {
            scale: 0.8,
            transition: {
                duration: 0.1,
            }
        }
    };

    const shimmerVariants = {
        animate: {
            backgroundPosition: ["0% 0%", "200% 200%"],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "linear",
            },
        },
    };

    return (
        <motion.div
            className="bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_-8px_rgba(6,16,30,0.06)] border border-[#E5E7EB]/30 hover:border-[#F9C744]/50 transition-all duration-300 relative h-full flex flex-col"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
            role="article"
        >
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none z-20 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#F9C744]/5 via-transparent to-[#06101E]/5 rounded-xl" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Container */}
            <motion.div
                className="relative pt-[100%] bg-[#FFF8E1]/30 overflow-hidden flex-shrink-0"
                variants={imageVariants}
                initial="initial"
                whileHover="hover"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isImageLoaded ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={product.image || "/indiekonnect-web/images/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        loading="lazy"
                        onLoadingComplete={() => setIsImageLoaded(true)}
                    />
                </motion.div>

                {/* Shimmer Loading */}
                {!isImageLoaded && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#FFF8E1]/30 via-[#F9C744]/10 to-[#FFF8E1]/30"
                        variants={shimmerVariants}
                        animate="animate"
                        style={{
                            backgroundSize: "200% 200%",
                        }}
                    />
                )}

                {/* Discount Badge */}
                {product.discount && product.discount > 0 && (
                    <motion.span
                        className="absolute top-2 right-2 bg-gradient-to-r from-[#F9C744] to-[#E9AC3C] text-[#06101E] px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold z-10 shadow-lg shadow-[#F9C744]/30"
                        variants={discountVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                    >
                        -{product.discount}%
                    </motion.span>
                )}

                {/* In Stock Badge */}
                {product.inStock && (
                    <motion.div
                        className="absolute top-2 left-2 z-10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="bg-emerald-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-medium shadow-lg shadow-emerald-500/20">
                            In Stock
                        </span>
                    </motion.div>
                )}

                {/* Out of Stock Overlay */}
                {!product.inStock && (
                    <motion.div
                        className="absolute inset-0 bg-[#06101E]/60 backdrop-blur-sm flex items-center justify-center z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.span
                            className="bg-white/95 text-[#06101E] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-xl border border-[#F9C744]/30"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.2,
                            }}
                        >
                            Out of Stock
                        </motion.span>
                    </motion.div>
                )}

                {/* Quick View Button - On Hover */}
                <AnimatePresence>
                    {isHovered && product.inStock && (
                        <motion.button
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm text-[#06101E] px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-medium shadow-lg shadow-black/10 z-10 whitespace-nowrap border border-[#F9C744]/30"
                            initial={{ opacity: 0, y: 15, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.9 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            whileHover={{ scale: 1.05, backgroundColor: "#06101E", color: "#F9C744" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleQuickView}
                        >
                            Quick View
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Content */}
            <motion.div
                className="p-3 sm:p-4 flex-1 flex flex-col"
                variants={contentVariants}
                initial="initial"
                animate="animate"
            >
                {/* Category & Wishlist */}
                <div className="flex items-start justify-between mb-1">
                    <motion.span
                        className="text-[9px] sm:text-[10px] text-[#6B7280] uppercase tracking-wider font-medium"
                        whileHover={{ color: "#F9C744" }}
                    >
                        {product.category || "Uncategorized"}
                    </motion.span>

                    {/* Wishlist Button */}
                    <motion.button
                        className={`relative z-10 p-1.5 cursor-pointer rounded-full transition-all duration-200 ${isWishlisted
                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                            : "bg-[#FFF8E1]/50 text-[#6B7280] hover:bg-red-50 hover:text-red-500"
                            }`}
                        variants={wishlistButtonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        onClick={handleWishlistToggle}
                        disabled={isWishlistLoading}
                    >
                        <motion.svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill={isWishlisted ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={isWishlisted ? 0 : 2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </motion.svg>

                        {isWishlistLoading && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="w-3 h-3 border-2 border-[#F9C744] border-t-transparent rounded-full animate-spin" />
                            </motion.div>
                        )}
                    </motion.button>
                </div>

                {/* Product Name */}
                <motion.h3
                    className="text-sm sm:text-black font-serif font-semibold text-[#06101E] mb-1.5 line-clamp-2 leading-snug"
                    whileHover={{ color: "#F9C744" }}
                    transition={{ duration: 0.2 }}
                >
                    {product.name}
                </motion.h3>

                {/* Price */}
                <div className="flex items-center gap-2 mb-1.5">
                    <motion.span
                        className="text-black sm:text-lg font-bold text-[#06101E]"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        ₹{product.price.toLocaleString()}
                    </motion.span>
                    {product.originalPrice && (
                        <span className="text-[10px] sm:text-xs text-[#6B7280] line-through">
                            ₹{product.originalPrice.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Rating */}
                <motion.div
                    className="flex items-center gap-1 text-[10px] sm:text-sm"
                    aria-label={`Rating: ${product.rating} out of 5 stars`}
                    variants={ratingVariants}
                    initial="initial"
                    animate="animate"
                >
                    <motion.span
                        className="text-[#F9C744] text-[10px] sm:text-sm"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        {renderRatingStars(product.rating)}
                    </motion.span>
                    <span className="text-[#6B7280] text-[8px] sm:text-xs">
                        ({product.reviews})
                    </span>
                </motion.div>

                {/* Add to Cart Button */}
                <motion.button
                    className={`w-full mt-3 py-2.5 cursor-pointer rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold transition-all duration-300 relative overflow-hidden flex-shrink-0 ${product.inStock && !isAddingToCart
                        ? "bg-[#06101E] text-white hover:bg-[#F9C744] hover:text-[#06101E] shadow-md shadow-[#06101E]/10"
                        : product.inStock && isAddingToCart
                            ? "bg-[#6B7280] text-white cursor-wait"
                            : "bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed"
                        }`}
                    variants={buttonVariants}
                    initial="initial"
                    whileHover={product.inStock && !isAddingToCart ? "hover" : {}}
                    whileTap={product.inStock && !isAddingToCart ? "tap" : {}}
                    aria-label={`Add ${product.name} to cart`}
                    disabled={!product.inStock || isAddingToCart}
                    onClick={handleAddToCart}
                >
                    {/* Hover Shimmer Effect */}
                    {product.inStock && !isAddingToCart && (
                        <motion.div
                            className="absolute inset-0 cursor-pointer bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                        />
                    )}

                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isAddingToCart ? (
                            <>
                                <motion.div
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                />
                                <span>Adding...</span>
                            </>
                        ) : product.inStock ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Add to Cart
                            </>
                        ) : (
                            "Out of Stock"
                        )}
                    </span>
                </motion.button>
            </motion.div>
        </motion.div>
    );
}