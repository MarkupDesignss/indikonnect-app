"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { products } from "../../data/products";
import Logo from "../../../public/images/logo.png";
import BannerImage from "../../../public/images/banner.png";

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

    useEffect(() => {
        // Simulate loading wishlist items (in real app, fetch from API/localStorage)
        setTimeout(() => {
            const wishlist = products.slice(0, 6).map((p, index) => ({
                ...p,
                addedDate: new Date(Date.now() - index * 86400000).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                ),
            }));
            setWishlistItems(wishlist);
            setLoading(false);
        }, 800);
    }, []);

    const removeFromWishlist = (id: number) => {
        setWishlistItems((prev) => prev.filter((item) => item.id !== id));
        setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    };

    const toggleSelectItem = (id: number) => {
        setSelectedItems((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id]
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
            selectedItems.includes(item.id)
        );
        console.log("Moving to cart:", itemsToMove);
        // In real app, add to cart logic here
        setWishlistItems((prev) =>
            prev.filter((item) => !selectedItems.includes(item.id))
        );
        setSelectedItems([]);
    };

    const renderRatingStars = (rating: number) => {
        return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-[#C9A227]/30 border-b-transparent rounded-full animate-spin animate-reverse"></div>
                    </div>
                    <p className="mt-6 text-[#8a7f6c] text-sm tracking-wide">
                        Loading your wishlist...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBF8F2]">
            {/* Header */}
            <header className="bg-white border-b border-[#e9e1d0] sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative w-8 h-8">
                                <Image src={Logo} alt="Logo" fill className="object-contain" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                                INDIE<span className="text-[#C9A227]">KONNECT</span>
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-sm">
                            <Link href="/" className="text-gray-600 hover:text-[#C9A227] transition-colors">Home</Link>
                            <Link href="/products" className="text-gray-600 hover:text-[#C9A227] transition-colors">Products</Link>
                            <Link href="#" className="text-gray-600 hover:text-[#C9A227] transition-colors">Collections</Link>
                            <Link href="#" className="text-gray-600 hover:text-[#C9A227] transition-colors">About</Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/wishlist" className="p-2 text-[#C9A227] hover:text-[#B6871C] transition-colors relative">
                                <Heart className="w-5 h-5 fill-[#C9A227]" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {wishlistItems.length}
                                </span>
                            </Link>
                            <button className="p-2 text-gray-600 hover:text-[#C9A227] transition-colors relative">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 bg-[#C9A227] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                    0
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Banner Section */}
            <div className="relative w-full h-[180px] md:h-[280px] lg:h-[350px] overflow-hidden">
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
                                transition={{ duration: 0.6 }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Heart className="w-8 h-8 text-[#C9A227] fill-[#C9A227]" />
                                    <span className="text-white/70 text-sm font-medium tracking-widest uppercase">
                                        Your Collection
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                                    My Wishlist
                                </h1>
                                <p className="text-white/80 text-sm md:text-base">
                                    {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved for later
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
                {/* Decorative element */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FBF8F2] to-transparent"></div>
            </div>

            {/* Wishlist Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Header with actions */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Saved Items
                        </h2>
                        <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                            {wishlistItems.length} items
                        </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {wishlistItems.length > 0 && (
                            <>
                                <button
                                    onClick={selectAllItems}
                                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {selectedItems.length === wishlistItems.length
                                        ? "Deselect All"
                                        : "Select All"}
                                </button>
                                {selectedItems.length > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={moveAllToCart}
                                        className="px-4 py-2 bg-[#C9A227] text-white rounded-lg text-sm font-semibold hover:bg-[#B6871C] transition-colors flex items-center gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Move to Cart ({selectedItems.length})
                                    </motion.button>
                                )}
                            </>
                        )}
                        <Link
                            href="/products"
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                        >
                            Browse More
                            <MoveRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Wishlist Grid */}
                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {wishlistItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50 relative"
                            >
                                {/* Select checkbox */}
                                <div className="absolute top-3 left-3 z-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => toggleSelectItem(item.id)}
                                        className="w-4 h-4 rounded border-gray-300 text-[#C9A227] focus:ring-[#C9A227] cursor-pointer"
                                    />
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors group-hover:opacity-100 opacity-70"
                                >
                                    <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
                                </button>

                                <Link href={`/product/${item.id}`}>
                                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                        <Image
                                            src={item.image || "/images/placeholder.jpg"}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {item.discount && (
                                            <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                -{item.discount}%
                                            </span>
                                        )}
                                        {!item.inStock && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                        {/* Quick view on hover */}
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-gray-50 transition-colors">
                                                <Eye className="w-4 h-4" />
                                                Quick View
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                {item.category}
                                            </div>
                                            <span className="text-[9px] text-gray-300">
                                                Added {item.addedDate}
                                            </span>
                                        </div>
                                        <h3 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-[#C9A227] transition-colors">
                                            {item.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-base font-bold text-gray-900">
                                                ₹{item.price.toLocaleString()}
                                            </span>
                                            {item.originalPrice && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    ₹{item.originalPrice.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-yellow-500 text-[10px]">
                                                {renderRatingStars(item.rating)}
                                            </span>
                                            <span className="text-gray-400 text-[9px]">
                                                ({item.reviews})
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                            <span className={`text-[10px] font-medium ${item.inStock ? "text-green-600" : "text-red-500"}`}>
                                                {item.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                            <button
                                                className="p-1.5 bg-[#C9A227] text-white rounded-lg hover:bg-[#B6871C] transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    console.log("Added to cart:", item.id);
                                                }}
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 md:py-24"
                    >
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="absolute inset-0 bg-[#C9A227]/10 rounded-full blur-2xl"></div>
                            <Heart className="w-32 h-32 text-gray-200 mx-auto relative z-10" strokeWidth={0.5} />
                            <Heart className="absolute inset-0 w-32 h-32 text-[#C9A227]/20 mx-auto animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Your wishlist is empty
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Start adding your favorite items to your wishlist by browsing our collection.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A227] text-white rounded-full font-semibold hover:bg-[#B6871C] transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Explore Products
                        </Link>
                    </motion.div>
                )}

                {/* Bottom section with stats */}
                {wishlistItems.length > 0 && (
                    <div className="mt-8 p-4 bg-white rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                                <span className="font-semibold text-gray-900">{wishlistItems.length}</span> items total
                            </span>
                            <span className="w-px h-4 bg-gray-200" />
                            <span>
                                <span className="font-semibold text-gray-900">{selectedItems.length}</span> selected
                            </span>
                            <span className="w-px h-4 bg-gray-200" />
                            <span>
                                Subtotal:{" "}
                                <span className="font-semibold text-gray-900">
                                    ₹{wishlistItems
                                        .filter((item) => selectedItems.includes(item.id))
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()}
                                </span>
                            </span>
                        </div>
                        {selectedItems.length > 0 && (
                            <button
                                onClick={moveAllToCart}
                                className="px-6 py-2 bg-[#C9A227] text-white rounded-lg text-sm font-semibold hover:bg-[#B6871C] transition-colors flex items-center gap-2"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Add Selected to Cart
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-reverse {
                    animation-direction: reverse;
                }
            `}</style>
        </div>
    );
}