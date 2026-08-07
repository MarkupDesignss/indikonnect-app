"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../../components/common/Header";
import {
    Heart,
    ShoppingBag,
    Trash2,
    Star,
    ChevronRight,
    Sparkles,
    X,
    ShoppingCart,
    Eye,
    ArrowLeft,
    MoveRight,
} from "lucide-react";

// Import products data
import { products } from "../../../data/products";
import Logo from "../../../../public/images/logo.png";
import BannerImage from "../../../../public/images/banner.png";

interface WishlistItem {
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice: number | null;
    discount: number | null;
    image: any;
    rating: number;
    reviews: number;
    inStock: boolean;
    addedDate: string;
}

export default function WishlistPage() {
    const router = useRouter();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);

    useEffect(() => {
        // Simulate loading wishlist items
        setTimeout(() => {
            const wishlist = products.slice(0, 6).map((p, index) => ({
                ...p,
                addedDate: new Date(Date.now() - index * 86400000).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                ),
            }));
            setWishlistItems(wishlist);
            setLoading(false);
        }, 800);
    }, []);

    const removeFromWishlist = (id: number) => {
        setRemovingId(id);
        setTimeout(() => {
            setWishlistItems((prev) => prev.filter((item) => item.id !== id));
            setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
            setRemovingId(null);
        }, 400);
    };

    const toggleSelectItem = (id: number) => {
        setSelectedItems((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id],
        );
    };

    const selectAllItems = () => {
        if (selectedItems.length === wishlistItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(wishlistItems.map((item) => item.id));
        }
    };

    const moveAllToCart = () => {
        const itemsToMove = wishlistItems.filter((item) =>
            selectedItems.includes(item.id),
        );
        console.log("Moving to cart:", itemsToMove);
        setWishlistItems((prev) =>
            prev.filter((item) => !selectedItems.includes(item.id)),
        );
        setSelectedItems([]);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <div className="relative w-16 h-16 mx-auto">
                        <motion.div
                            className="absolute inset-0 border-4 border-[#C9A227] border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                            className="absolute inset-2 border-4 border-[#C9A227]/30 border-b-transparent rounded-full"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 text-[#8a7f6c] text-sm tracking-wide"
                    >
                        Loading your wishlist...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FBF8F2]"
        >
            {/* Header */}
            {/* <motion.header
                variants={headerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white border-b border-[#e9e1d0] sticky top-0 z-40 shadow-sm"
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <motion.div
                                className="relative w-8 h-8"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Image src={Logo} alt="Logo" fill className="object-contain" />
                            </motion.div>
                            <motion.span
                                className="text-lg font-bold text-gray-900"
                                whileHover={{ color: "#C9A227" }}
                                transition={{ duration: 0.2 }}
                            >
                                INDIE<span className="text-[#C9A227]">KONNECT</span>
                            </motion.span>
                        </Link>

                        <motion.nav
                            className="hidden md:flex items-center gap-6 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-[#C9A227] transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/products"
                                className="text-gray-600 hover:text-[#C9A227] transition-colors"
                            >
                                Products
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-600 hover:text-[#C9A227] transition-colors"
                            >
                                Collections
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-600 hover:text-[#C9A227] transition-colors"
                            >
                                About
                            </Link>
                        </motion.nav>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-[#C9A227] hover:text-[#B6871C] transition-colors relative"
                            >
                                <Heart className="w-5 h-5 fill-[#C9A227]" />
                                <motion.span
                                    key={wishlistItems.length}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold"
                                >
                                    {wishlistItems.length}
                                </motion.span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-600 hover:text-[#C9A227] transition-colors relative"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 bg-[#C9A227] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                    0
                                </span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header> */}
            <Header />
            {/* Banner Section */}
            <motion.div
                variants={bannerVariants}
                initial="hidden"
                animate="visible"
                className="relative w-full h-[180px] md:h-[280px] lg:h-[350px] overflow-hidden"
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
                                    className="text-white/80 text-sm md:text-base"
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

            {/* Wishlist Content */}
            <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="container mx-auto px-4 py-8"
            >
                {/* Header with actions */}
                <motion.div
                    variants={headerVariants}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6"
                >
                    <div className="flex items-center gap-3">
                        <motion.h2
                            className="text-2xl font-bold text-gray-900"
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
                    <motion.div
                        className="flex items-center gap-3 flex-wrap"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {wishlistItems.length > 0 && (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={selectAllItems}
                                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {selectedItems.length === wishlistItems.length
                                        ? "Deselect All"
                                        : "Select All"}
                                </motion.button>
                                <AnimatePresence>
                                    {selectedItems.length > 0 && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={moveAllToCart}
                                            className="px-4 py-2 bg-[#C9A227] text-white rounded-lg text-sm font-semibold hover:bg-[#B6871C] transition-colors flex items-center gap-2"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Move to Cart ({selectedItems.length})
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                        <Link
                            href="/products"
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                        >
                            Browse More
                            <MoveRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Wishlist Grid */}
                {wishlistItems.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        {wishlistItems.map((item, index) => (
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
                                {/* Select checkbox with animation */}
                                <motion.div
                                    className="absolute top-3 left-3 z-10"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => toggleSelectItem(item.id)}
                                        className="w-4 h-4 rounded border-gray-300 text-[#C9A227] focus:ring-[#C9A227] cursor-pointer"
                                    />
                                </motion.div>

                                {/* Remove button with animation */}
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeFromWishlist(item.id)}
                                    className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors group-hover:opacity-100 opacity-70"
                                >
                                    <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
                                </motion.button>

                                <Link href={`/product/${item.id}`}>
                                    <motion.div
                                        className="relative aspect-square bg-gray-100 overflow-hidden"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Image
                                            src={item.image || "/images/placeholder.jpg"}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {item.discount && (
                                            <motion.span
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                                className="absolute top-3 right-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            >
                                                -{item.discount}%
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
                                                className="text-base font-bold text-gray-900"
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
                                                className="p-1.5 bg-[#C9A227] text-white rounded-lg hover:bg-[#B6871C] transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    console.log("Added to cart:", item.id);
                                                }}
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        ))}
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
                            <motion.Heart
                                className="absolute inset-0 w-32 h-32 text-[#C9A227]/20 mx-auto"
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
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

                {/* Bottom section with stats */}
                {wishlistItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 p-4 bg-white rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3"
                    >
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <motion.span
                                key={wishlistItems.length}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <span className="font-semibold text-gray-900">
                                    {wishlistItems.length}
                                </span>{" "}
                                items total
                            </motion.span>
                            <span className="w-px h-4 bg-gray-200" />
                            <motion.span
                                key={selectedItems.length}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <span className="font-semibold text-gray-900">
                                    {selectedItems.length}
                                </span>{" "}
                                selected
                            </motion.span>
                            <span className="w-px h-4 bg-gray-200" />
                            <motion.span
                                key={selectedItems.reduce((sum, id) => sum + id, 0)}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                Subtotal:{" "}
                                <span className="font-semibold text-gray-900">
                                    ₹
                                    {wishlistItems
                                        .filter((item) => selectedItems.includes(item.id))
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()}
                                </span>
                            </motion.span>
                        </div>
                        {selectedItems.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={moveAllToCart}
                                className="px-6 py-2 bg-[#C9A227] text-white rounded-lg text-sm font-semibold hover:bg-[#B6871C] transition-colors flex items-center gap-2"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Add Selected to Cart
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </motion.div>

            <style jsx>{`
                .animate-reverse {
                    animation-direction: reverse;
                }
            `}</style>
        </motion.div>
    );
}