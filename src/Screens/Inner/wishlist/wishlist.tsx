"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../../components/common/Header";
import {
    Heart,
    Trash2,
    Sparkles,
    ShoppingCart,
    Eye,
    MoveRight,
} from "lucide-react";

import BannerImage from "../../../../public/indiekonnect-web/images/banner.png";
import {
    useGetWishlistQuery,
    useRemoveFromWishlistMutation
} from "@/lib/redux/api/Wishlist/wishlistApi";
import { useAddToCartMutation, useGetCartQuery } from "@/lib/redux/api/cartApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "../../../lib/slices/toastSlice";
import Loader from "@/components/ui/Spinner/Loader";
import Footer from "@/components/Footer/Footer";

interface WishlistProductImage {
    id: number;
    image: string;
    image_url: string;
    sort_order: number;
    is_primary: boolean;
}

interface WishlistProduct {
    id: number;
    product_code: string;
    name: string;
    slug: string;
    description: string;
    specification: string;
    category_id: number;
    category: {
        id: number;
        name: string | null;
        slug: string;
    };
    tax_category_id: number;
    retail_price: string;
    retail_price_formatted: string;
    distributor_price: string;
    distributor_price_formatted: string;
    stock_quantity: number;
    low_stock_threshold: number;
    stock_status: string;
    is_published: boolean;
    status: string;
    is_wishlisted: boolean;
    images: WishlistProductImage[];
    primary_image: string;
    primary_image_url: string;
    created_at: string;
    updated_at: string;
}

interface WishlistItem {
    id: number;
    product_id: number;
    product: WishlistProduct;
    added_at: string;
}

const transformWishlistItem = (item: WishlistItem) => {
    const product = item.product;
    const retailPrice = parseFloat(product.retail_price);
    const distributorPrice = parseFloat(product.distributor_price);
    const discount = distributorPrice > 0
        ? Math.round(((distributorPrice - retailPrice) / distributorPrice) * 100)
        : null;

    const rating = 4.5;
    const reviews = 120;

    return {
        id: item.product_id,
        slug: product.slug,
        name: product.name,
        category: product.category?.name || "Uncategorized",
        price: retailPrice,
        originalPrice: distributorPrice > retailPrice ? distributorPrice : null,
        discount: discount && discount > 0 ? discount : null,
        image: product.primary_image_url || "/indiekonnect-web/images/placeholder.jpg",
        rating: rating,
        reviews: reviews,
        inStock: product.stock_status === "in_stock" && product.stock_quantity > 0,
        stockQuantity: product.stock_quantity,
        addedDate: new Date(item.added_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
    };
};

export default function WishlistPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const {
        data: wishlistData,
        isLoading: isWishlistLoading,
        error: wishlistError,
        refetch: refetchWishlist
    } = useGetWishlistQuery();

    const { refetch: refetchCart } = useGetCartQuery();

    const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

    useEffect(() => {
        if (wishlistData?.data) {
            const transformedItems = wishlistData.data.map(transformWishlistItem);
            setWishlistItems(transformedItems);
            setIsInitialLoad(false);
        }
    }, [wishlistData]);

    const removeFromWishlistHandler = async (productId: number) => {
        setRemovingId(productId);
        try {
            await removeFromWishlist({ product_id: productId }).unwrap();
            dispatch(
                showToast({
                    message: "Item removed from wishlist 🗑️",
                    type: "success",
                })
            );
            refetchWishlist();
        } catch (error: any) {
            console.error("Failed to remove:", error);
            dispatch(
                showToast({
                    message: error?.data?.message || "Failed to remove item",
                    type: "error",
                })
            );
            setRemovingId(null);
        }
    };

    const handleAddToCart = async (
        productId: number,
        productName: string,
        e: React.MouseEvent
    ) => {
        e.preventDefault();
        e.stopPropagation();
    
        // Prevent duplicate click for same product
        if (addingToCartId === productId) return;
    
        setAddingToCartId(productId);
    
        try {
            // Add product to cart
            await addToCart({
                product_id: productId,
                quantity: 1,
                from_wishlist: true,
            }).unwrap();
    
            // Refresh cart data
            await refetchCart();
    
            // Immediately remove item from wishlist UI
            setWishlistItems((prevItems) =>
                prevItems.filter((item) => item.id !== productId)
            );
    
            // Sync wishlist with backend
            await refetchWishlist();
    
            // Success message
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
                    message:
                        error?.data?.message ||
                        "Failed to add item to cart",
                    type: "error",
                })
            );
        } finally {
            setAddingToCartId(null);
        }
    };

    const renderRatingStars = (rating: number) => {
        return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
    };

    // Animation variants
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
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
            },
        },
        exit: {
            opacity: 0,
            y: -30,
            scale: 0.8,
            transition: {
                duration: 0.3,
            },
        },
        hover: {
            y: -8,
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
            },
        },
    };

    const bannerVariants = {
        hidden: { opacity: 0, scale: 1.1 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                delay: 0.3,
                ease: "easeOut",
            },
        },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    // Loading state with new white + yellow centered loader
    if (isWishlistLoading && isInitialLoad) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader width={200} height={200} />
            </div>
        );
    }

    // Error state
    if (wishlistError) {
        return (
            <div className="min-h-screen bg-[#FBF8F2]">
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Failed to load wishlist
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Please try refreshing the page
                        </p>
                        <button
                            onClick={() => refetchWishlist()}
                            className="px-6 py-2 bg-[#C9A227] text-white rounded-lg hover:bg-[#B6871C] transition-colors"
                        >
                            Retry
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FBF8F2] flex flex-col"
        >
            <Header />

            {/* Banner Section */}
            <motion.div
                variants={bannerVariants}
                initial="hidden"
                animate="visible"
                className="relative w-full h-[180px] md:h-[280px] lg:h-[350px] overflow-hidden flex-shrink-0"
            >
                <Image
                    src={BannerImage}
                    alt="Wishlist Banner"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
                    <div className="container mx-auto px-4">
                        <div className="px-6 md:px-12 max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <motion.div
                                    className="flex items-center gap-3 mb-2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <Heart className="w-8 h-8 text-[#C9A227] fill-[#C9A227]" />
                                    </motion.div>
                                    <span className="text-white/70 text-sm font-medium tracking-widest uppercase">
                                        Your Collection
                                    </span>
                                </motion.div>
                                <motion.h1
                                    className="text-3xl md:text-5xl font-bold text-white mb-2"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    My Wishlist
                                </motion.h1>
                                <motion.p
                                    className="text-white/80 text-sm "
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    {wishlistItems.length}{" "}
                                    {wishlistItems.length === 1 ? "item" : "items"} saved for
                                    later
                                </motion.p>
                            </motion.div>
                        </div>
                    </div>
                </div>
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FBF8F2] to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                />
            </motion.div>

            {/* Wishlist Content - Added padding bottom for spacing with footer */}
            <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="container mx-auto px-4 py-8 pb-16 md:pb-20 lg:pb-24 flex-1"
            >
                {/* Header with actions - Reorganized to left align */}
                <motion.div
                    variants={headerVariants}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                        <div className="flex items-center gap-3">
                            <motion.h2
                                className="font-serif text-2xl font-bold text-gray-900"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                Saved Items
                            </motion.h2>
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full"
                            >
                                {wishlistItems.length} items
                            </motion.span>
                        </div>
                        {/* Browse More link moved to left, below the title on mobile */}
                        <motion.div
                            className="flex items-center"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <Link
                                href="/products"
                                className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                            >
                                Browse More
                                <MoveRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Wishlist Grid */}
                {wishlistItems.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        {wishlistItems.map((item, index) => {
                            const isThisItemAdding = addingToCartId === item.id;
                            return (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    whileHover="hover"
                                    layout
                                    animate={{
                                        opacity: removingId === item.id ? 0 : 1,
                                        scale: removingId === item.id ? 0.8 : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50 relative"
                                    onMouseEnter={() => setHoveredItem(item.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    {/* Remove button with animation */}
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeFromWishlistHandler(item.id)}
                                        disabled={isRemoving && removingId === item.id}
                                        className="absolute top-3 cursor-pointer right-3 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors group-hover:opacity-100 opacity-70 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
                                    </motion.button>

                                    <Link href={`/product/${item.slug}`}>
                                        <motion.div
                                            className="relative aspect-square bg-gray-100 overflow-hidden"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Image
                                                src={item.image || "/indiekonnect-web/images/placeholder.jpg"}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            {item.discount && (
                                                <motion.span
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                                    className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-bold"
                                                >
                                                    -{item.discount}% off
                                                </motion.span>
                                            )}
                                            {!item.inStock && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                            {/* Quick view on hover */}
                                            <AnimatePresence>
                                                {hoveredItem === item.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 bg-black/20 flex items-center justify-center"
                                                    >
                                                        <motion.button
                                                            initial={{ scale: 0.8, y: 10 }}
                                                            animate={{ scale: 1, y: 0 }}
                                                            exit={{ scale: 0.8, y: 10 }}
                                                            className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-gray-50 transition-colors"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                router.push(`/product/${item.slug}`);
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Quick View
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                        <motion.div
                                            className="p-3"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                    {item.category}
                                                </div>
                                                <span className="text-[9px] text-gray-300">
                                                    Added {item.addedDate}
                                                </span>
                                            </div>
                                            <motion.h3
                                                className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-[#C9A227] transition-colors"
                                                whileHover={{ color: "#C9A227" }}
                                            >
                                                {item.name}
                                            </motion.h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <motion.span
                                                    className="text-black font-bold text-gray-900"
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                >
                                                    ₹{item.price.toLocaleString()}
                                                </motion.span>
                                                {item.originalPrice && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ₹{item.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <motion.span
                                                    className="text-yellow-500 text-[10px]"
                                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                                >
                                                    {renderRatingStars(item.rating)}
                                                </motion.span>
                                                <span className="text-gray-400 text-[9px]">
                                                    ({item.reviews})
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                                <span
                                                    className={`text-[10px] font-medium ${item.inStock ? "text-green-600" : "text-red-500"}`}
                                                >
                                                    {item.inStock ? "In Stock" : "Out of Stock"}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    disabled={!item.inStock || isThisItemAdding}
                                                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${item.inStock && !isThisItemAdding
                                                        ? "bg-[#C9A227] text-white hover:bg-[#B6871C] cursor-pointer"
                                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        }`}
                                                    onClick={(e) => {
                                                        if (item.inStock && !isThisItemAdding) {
                                                            handleAddToCart(item.id, item.name, e);
                                                        }
                                                    }}
                                                >
                                                    {isThisItemAdding ? (
                                                        <>
                                                            <motion.div
                                                                className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                            />
                                                            <span className="text-[9px]">Adding...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                            <span className="text-[9px] hidden sm:inline">Add</span>
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    // Empty State with animations
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center py-16 md:py-24"
                    >
                        <motion.div
                            className="relative w-32 h-32 mx-auto mb-6"
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <div className="absolute inset-0 bg-[#C9A227]/10 rounded-full blur-2xl"></div>
                            <Heart
                                className="w-32 h-32 text-gray-200 mx-auto relative z-10"
                                strokeWidth={0.5}
                            />
                            <motion.div
                                className="absolute inset-0"
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <Heart className="w-32 h-32 text-[#C9A227]/20 mx-auto" />
                            </motion.div>
                        </motion.div>
                        <motion.h3
                            className="text-2xl font-bold text-gray-900 mb-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Your wishlist is empty
                        </motion.h3>
                        <motion.p
                            className="text-gray-400 mb-6 max-w-md mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Start adding your favorite items to your wishlist by browsing our
                            collection.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A227] text-white rounded-full font-semibold hover:bg-[#B6871C] transition-colors"
                            >
                                <Sparkles className="w-4 h-4" />
                                Explore Products
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>

            <style jsx>{`
                .animate-reverse {
                    animation-direction: reverse;
                }
            `}</style>

            <Footer/>
        </motion.div>
    );
}