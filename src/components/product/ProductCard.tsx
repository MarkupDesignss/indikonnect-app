"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "../../lib/slices/toastSlice";
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery} from "@/lib/redux/api/Wishlist/wishlistApi";

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
    const dispatch = useAppDispatch();
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
            y: -4,
            scale: 1.02,
            boxShadow: "0 15px 30px rgba(0,0,0,0.12)",
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
                duration: 0.4,
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

    const heartVariants = {
        initial: { scale: 0, rotate: -180 },
        animate: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
            }
        },
        exit: {
            scale: 0,
            rotate: 180,
            transition: {
                duration: 0.2,
            }
        },
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

    const wishlistButtonVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.1,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10,
            }
        },
        tap: {
            scale: 0.9,
            transition: {
                duration: 0.1,
            }
        }
    };

    return (
        <motion.div
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative h-full flex flex-col cursor-pointer"
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
                        className="absolute inset-0 pointer-events-none z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/10 via-transparent to-yellow-400/10 rounded-xl" />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="relative pt-[100%] bg-gray-100 overflow-hidden flex-shrink-0"
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
                        src={product.image || "/images/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        loading="lazy"
                        onLoadingComplete={() => setIsImageLoaded(true)}
                    />
                </motion.div>

                {!isImageLoaded && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                        animate={{
                            backgroundPosition: ["0% 0%", "100% 100%"],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        style={{
                            backgroundSize: "200% 200%",
                        }}
                    />
                )}

                {product.discount && product.discount > 0 && (
                    <motion.span
                        className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold z-10 shadow-lg"
                        variants={discountVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                    >
                        -{product.discount}%
                    </motion.span>
                )}

                {!product.inStock && (
                    <motion.div
                        className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.span
                            className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-xl"
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

                <AnimatePresence>
                    {isHovered && product.inStock && (
                        <motion.button
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-medium shadow-lg z-10 whitespace-nowrap"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleQuickView}
                        >
                            Quick View
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div
                className="p-2.5 sm:p-3 md:p-4 flex-1 flex flex-col"
                variants={contentVariants}
                initial="initial"
                animate="animate"
            >
                <div className="flex items-start justify-between mb-0.5">
                    <div className="text-[9px] sm:text-xs text-gray-400 uppercase tracking-wider font-medium">
                        {product.category || "Uncategorized"}
                    </div>

                    {/* Wishlist - Always Visible */}
                    <motion.button
                        className={`relative z-10 p-1 cursor-pointer rounded-full transition-colors ${isWishlisted
                                ? "text-red-500 hover:text-red-600"
                                : "text-gray-400 hover:text-red-500"
                            }`}
                        variants={wishlistButtonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        aria-label={
                            isWishlisted
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                        }
                        onClick={handleWishlistToggle}
                        disabled={isWishlistLoading}
                    >
                        <motion.svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill={isWishlisted ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            </motion.div>
                        )}
                    </motion.button>
                </div>
                <motion.h3
                    className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-1 line-clamp-2 leading-tight"
                    whileHover={{ color: "#F9C744" }}
                    transition={{ duration: 0.2 }}
                >
                    {product.name}
                </motion.h3>

                <div className="flex items-center gap-1.5 mb-1">
                    <motion.span
                        className="text-sm sm:text-base md:text-lg font-bold text-gray-900"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        ₹{product.price.toLocaleString()}
                    </motion.span>
                    {product.originalPrice && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                        </span>
                    )}
                </div>

                <motion.div
                    className="flex items-center gap-0.5 text-[10px] sm:text-sm"
                    aria-label={`Rating: ${product.rating} out of 5 stars`}
                    variants={ratingVariants}
                    initial="initial"
                    animate="animate"
                >
                    <motion.span
                        className="text-yellow-500 text-[10px] sm:text-sm"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        {renderRatingStars(product.rating)}
                    </motion.span>
                    <span className="text-gray-400 text-[8px] sm:text-xs">({product.reviews})</span>
                </motion.div>

                <motion.button
                    className={`w-full mt-2 py-2 sm:py-2.5 cursor-pointer rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold transition-all duration-300 relative overflow-hidden flex-shrink-0 ${product.inStock && !isAddingToCart
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : product.inStock && isAddingToCart
                                ? "bg-gray-600 text-white cursor-wait"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    variants={buttonVariants}
                    initial="initial"
                    whileHover={product.inStock && !isAddingToCart ? "hover" : {}}
                    whileTap={product.inStock && !isAddingToCart ? "tap" : {}}
                    aria-label={`Add ${product.name} to cart`}
                    disabled={!product.inStock || isAddingToCart}
                    onClick={handleAddToCart}
                >
                    {product.inStock && !isAddingToCart && (
                        <motion.div
                            className="absolute inset-0 cursor-pointer bg-gradient-to-r from-yellow-400/20 to-transparent"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isAddingToCart ? (
                            <>
                                <motion.div
                                    className="w-4 h-4 border-2  border-white border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                />
                                <span>Adding...</span>
                            </>
                        ) : product.inStock ? (
                            "Add to Cart"
                        ) : (
                            "Out of Stock"
                        )}
                    </span>
                </motion.button>
            </motion.div>
        </motion.div>
    );
}