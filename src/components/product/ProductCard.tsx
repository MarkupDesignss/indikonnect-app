"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Dinner from "../../../public/images/Dinner.jpeg";

// Static product data with local images
const PRODUCTS = [
    {
        id: 1,
        name: "Premium Porcelain Dinner Set",
        category: "Dinnerware",
        price: 2999,
        originalPrice: 3999,
        discount: 25,
        image: Dinner,
        rating: 4.5,
        reviews: 128,
        inStock: true,
    },
    {
        id: 2,
        name: "Classic Ceramic Bowls Set",
        category: "Dinnerware",
        price: 1899,
        originalPrice: null,
        discount: null,
        image: Dinner,
        rating: 4.8,
        reviews: 96,
        inStock: true,
    },
    {
        id: 3,
        name: "Luxury Gold-Trim Dinnerware",
        category: "Dinnerware",
        price: 4599,
        originalPrice: 5599,
        discount: 18,
        image: Dinner,
        rating: 4.2,
        reviews: 73,
        inStock: false,
    },
    {
        id: 4,
        name: "Minimalist Stoneware Collection",
        category: "Dinnerware",
        price: 2499,
        originalPrice: null,
        discount: null,
        image: Dinner,
        rating: 4.6,
        reviews: 205,
        inStock: true,
    },
    {
        id: 5,
        name: "Elegant Crystal Glass Set",
        category: "Dinnerware",
        price: 3299,
        originalPrice: 4299,
        discount: 23,
        image: Dinner,
        rating: 4.7,
        reviews: 157,
        inStock: true,
    },
    {
        id: 6,
        name: "Rustic Farmhouse Dinner Set",
        category: "Dinnerware",
        price: 2799,
        originalPrice: null,
        discount: null,
        image: Dinner,
        rating: 4.3,
        reviews: 89,
        inStock: true,
    },
];

interface ProductCardProps {
    productId?: number;
}

export default function ProductCard({
    productId = 0,
}: ProductCardProps): JSX.Element {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [showAddedMessage, setShowAddedMessage] = useState(false);

    const product =
        productId > 0
            ? PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0]
            : PRODUCTS[0];

    const renderRatingStars = (rating: number): string => {
        return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
    };

    // Navigate to product detail page
    const handleCardClick = () => {
        if (product && product.id) {
            router.push(`/product/${product.id}`);
        }
    };

    // Handle Add to Cart
    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation
        if (product.inStock) {
            setShowAddedMessage(true);
            setTimeout(() => setShowAddedMessage(false), 3000);
            console.log("Added to cart:", product.id);
        }
    };

    // Handle Wishlist
    const handleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation
        console.log("Wishlist toggled for product:", product.id);
    };

    // Handle Quick View
    const handleQuickView = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation
        router.push(`/product/${product.id}`);
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
                        src={product.image}
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

                {product.discount && (
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
                        {product.category}
                    </div>
                    <AnimatePresence>
                        {isHovered && (
                            <motion.button
                                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-1"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                aria-label="Add to wishlist"
                                onClick={handleWishlist}
                            >
                                <svg
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </motion.button>
                        )}
                    </AnimatePresence>
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
                    className={`w-full mt-2 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold transition-all duration-300 relative overflow-hidden flex-shrink-0 ${product.inStock
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    variants={buttonVariants}
                    initial="initial"
                    whileHover={product.inStock ? "hover" : {}}
                    whileTap={product.inStock ? "tap" : {}}
                    aria-label={`Add ${product.name} to cart`}
                    disabled={!product.inStock}
                    onClick={handleAddToCart}
                >
                    {product.inStock && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">
                        {product.inStock ? (
                            <span className="flex items-center justify-center gap-1">
                                <span>Add to Cart</span>
                            </span>
                        ) : (
                            "Out of Stock"
                        )}
                    </span>
                </motion.button>

                <AnimatePresence>
                    {showAddedMessage && product.inStock && (
                        <motion.div
                            className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-medium whitespace-nowrap"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            ✓ Added to Cart
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}