"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Heart,
    Trash2,
    ShoppingCart,
    Eye,
    MoveRight,
    Star,
    Loader2,
    ChevronRight,
    Sparkles,
} from "lucide-react";

import {
    useGetWishlistQuery,
    useRemoveFromWishlistMutation,
} from "@/lib/redux/api/Wishlist/wishlistApi";

import {
    useAddToCartMutation,
    useGetCartQuery,
} from "@/lib/redux/api/cartApi";

import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "../../lib/slices/toastSlice";

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

interface TransformedWishlistItem {
    id: number;
    slug: string;
    name: string;
    category: string;
    price: number;
    originalPrice: number | null;
    discount: number | null;
    image: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    stockQuantity: number;
    addedDate: string;
}

const transformWishlistItem = (
    item: WishlistItem
): TransformedWishlistItem => {
    const product = item.product;

    const retailPrice = parseFloat(product.retail_price);
    const distributorPrice = parseFloat(product.distributor_price);

    const discount =
        distributorPrice > 0
            ? Math.round(
                  ((distributorPrice - retailPrice) /
                      distributorPrice) *
                      100
              )
            : null;

    const rating = 4.5;
    const reviews = 120;

    return {
        id: item.product_id,
        slug: product.slug,
        name: product.name,
        category: product.category?.name || "Uncategorized",
        price: retailPrice,
        originalPrice:
            distributorPrice > retailPrice
                ? distributorPrice
                : null,
        discount: discount && discount > 0 ? discount : null,
        image:
            product.primary_image_url ||
            "/indiekonnect-web/images/placeholder.jpg",
        rating,
        reviews,
        inStock:
            product.stock_status === "in_stock" &&
            product.stock_quantity > 0,
        stockQuantity: product.stock_quantity,
        addedDate: new Date(
            item.added_at
        ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
    };
};

interface WishlistComponentProps {
    onItemClick?: (slug: string) => void;
}

export default function WishlistComponent({
    onItemClick,
}: WishlistComponentProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const {
        data: wishlistData,
        isLoading: isWishlistLoading,
        error: wishlistError,
        refetch: refetchWishlist,
    } = useGetWishlistQuery();

    const { refetch: refetchCart } = useGetCartQuery();

    const [
        removeFromWishlist,
        { isLoading: isRemoving },
    ] = useRemoveFromWishlistMutation();

    const [
        addToCart,
        { isLoading: isAddingToCart },
    ] = useAddToCartMutation();

    const [
        wishlistItems,
        setWishlistItems,
    ] = useState<TransformedWishlistItem[]>([]);

    const [
        hoveredItem,
        setHoveredItem,
    ] = useState<number | null>(null);

    const [
        removingId,
        setRemovingId,
    ] = useState<number | null>(null);

    const [
        addingToCartId,
        setAddingToCartId,
    ] = useState<number | null>(null);

    const [
        isInitialLoad,
        setIsInitialLoad,
    ] = useState(true);

    useEffect(() => {
        if (wishlistData?.data) {
            const transformedItems =
                wishlistData.data.map(
                    transformWishlistItem
                );

            setWishlistItems(transformedItems);
            setIsInitialLoad(false);
        }
    }, [wishlistData]);

    const handleRemove = async (
        productId: number
    ) => {
        setRemovingId(productId);

        try {
            await removeFromWishlist({
                product_id: productId,
            }).unwrap();

            setWishlistItems((prevItems) =>
                prevItems.filter(
                    (item) => item.id !== productId
                )
            );

            await refetchWishlist();

            dispatch(
                showToast({
                    message:
                        "Item removed from wishlist 🗑️",
                    type: "success",
                })
            );
        } catch (error: any) {
            console.error(
                "Failed to remove:",
                error
            );

            dispatch(
                showToast({
                    message:
                        error?.data?.message ||
                        "Failed to remove item",
                    type: "error",
                })
            );
        } finally {
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

        if (
            addingToCartId === productId ||
            isAddingToCart
        ) {
            return;
        }

        setAddingToCartId(productId);

        try {
            await addToCart({
                product_id: productId,
                quantity: 1,
                from_wishlist: true,
            }).unwrap();

            await refetchCart();

            setWishlistItems((prevItems) =>
                prevItems.filter(
                    (item) => item.id !== productId
                )
            );

            await refetchWishlist();

            dispatch(
                showToast({
                    message: `${productName} added to cart successfully! 🛒`,
                    type: "success",
                })
            );
        } catch (error: any) {
            console.error(
                "Failed to add to cart:",
                error
            );

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

    const handleItemClick = (
        slug: string
    ) => {
        if (onItemClick) {
            onItemClick(slug);
        } else {
            router.push(`/product/${slug}`);
        }
    };

    const renderRatingStars = (
        rating: number
    ) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar =
            rating % 1 >= 0.5;

        const emptyStars =
            5 -
            fullStars -
            (hasHalfStar ? 1 : 0);

        return (
            <span className="flex items-center gap-0.5">
                {[...Array(fullStars)].map(
                    (_, i) => (
                        <Star
                            key={`full-${i}`}
                            className="w-3 h-3 fill-[#C9A227] text-[#C9A227]"
                        />
                    )
                )}

                {hasHalfStar && (
                    <div className="relative w-3 h-3">
                        <Star className="absolute inset-0 w-3 h-3 text-[#C9A227]" />

                        <div className="absolute inset-0 w-1.5 h-3 overflow-hidden">
                            <Star className="w-3 h-3 fill-[#C9A227] text-[#C9A227]" />
                        </div>
                    </div>
                )}

                {[...Array(emptyStars)].map(
                    (_, i) => (
                        <Star
                            key={`empty-${i}`}
                            className="w-3 h-3 text-[#E7DBC0]"
                        />
                    )
                )}
            </span>
        );
    };

    const containerVariants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
            },
        },
        exit: {
            opacity: 0,
            y: -20,
            scale: 0.9,
            transition: {
                duration: 0.3,
            },
        },
    };

    if (
        isWishlistLoading &&
        isInitialLoad
    ) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
                    <span 
                        className="text-sm text-[#8a7f6e]"
                        style={{ fontFamily: "Jost, sans-serif" }}
                    >
                        Loading wishlist...
                    </span>
                </div>
            </div>
        );
    }

    if (wishlistError) {
        return (
            <div className="text-center py-16">
                <div className="text-red-500 text-4xl mb-4">
                    ⚠️
                </div>

                <h3 
                    className="text-lg font-semibold text-[#2B2420] mb-2"
                    style={{ fontFamily: "Jost, sans-serif" }}
                >
                    Failed to load wishlist
                </h3>

                <p 
                    className="text-[#8a7f6e] mb-4"
                    style={{ fontFamily: "Jost, sans-serif" }}
                >
                    Please try refreshing the page
                </p>

                <button
                    onClick={() =>
                        refetchWishlist()
                    }
                    className="px-6 py-2.5 bg-[#2B2420] text-white rounded-full hover:bg-[#92403F] transition-colors text-sm font-medium"
                    style={{ fontFamily: "Jost, sans-serif" }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="text-center py-16"
            >
                <motion.div
                    className="relative w-24 h-24 mx-auto mb-6"
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <Heart
                        className="w-24 h-24 text-[#E7DBC0] mx-auto"
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
                        <Heart className="w-24 h-24 text-[#C9A227]/20 mx-auto" />
                    </motion.div>
                </motion.div>

                <h3 
                    className="text-2xl font-semibold text-[#2B2420] mb-2"
                    style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                    Your wishlist is empty
                </h3>

                <p 
                    className="text-[#8a7f6e] mb-6 max-w-md mx-auto"
                    style={{ fontFamily: "Jost, sans-serif" }}
                >
                    Start adding your favorite items to your wishlist by browsing our collection.
                </p>

                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#2B2420] text-white rounded-full font-medium hover:bg-[#92403F] transition-colors"
                    style={{ fontFamily: "Jost, sans-serif" }}
                >
                    Explore Products
                    <MoveRight className="w-4 h-4" />
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="mx-auto">
            {/* Header */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: -10,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
            >
                <div className="flex items-center gap-3">
                    <h2 
                        className="text-[28px] font-semibold text-[#2B2420]"
                        style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                    >
                        Saved Items
                    </h2>

                    <span 
                        className="text-xs text-[#8a7f6e] bg-[#FBF6EC] px-3 py-1 rounded-full border border-[#E7DBC0]/50"
                        style={{ fontFamily: "Jost, sans-serif" }}
                    >
                        {wishlistItems.length} items
                    </span>
                </div>

                <Link
                    href="/products"
                    className="text-sm text-[#C9A227] hover:text-[#92403F] transition-colors flex items-center gap-1 font-medium"
                    style={{ fontFamily: "Jost, sans-serif" }}
                >
                    Browse More
                    <MoveRight className="w-4 h-4" />
                </Link>
            </motion.div>

            {/* Wishlist Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {wishlistItems.map(
                        (item) => {
                            const isThisItemAdding =
                                addingToCartId ===
                                item.id;

                            return (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    layout
                                    exit={{
                                        opacity: 0,
                                        scale: 0.8,
                                        y: -20,
                                        transition: {
                                            duration: 0.3,
                                        },
                                    }}
                                    animate={{
                                        opacity:
                                            removingId ===
                                            item.id
                                                ? 0
                                                : 1,
                                        scale:
                                            removingId ===
                                            item.id
                                                ? 0.8
                                                : 1,
                                    }}
                                    transition={{
                                        duration: 0.3,
                                    }}
                                    className="group bg-white rounded-[20px] overflow-hidden shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] hover:shadow-[0_12px_40px_-12px_rgba(43,36,32,0.12)] transition-all duration-300 border border-[#E7DBC0]/70 relative"
                                    onMouseEnter={() =>
                                        setHoveredItem(
                                            item.id
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setHoveredItem(
                                            null
                                        )
                                    }
                                >
                                    {/* Remove button */}
                                    <button
                                        onClick={() =>
                                            handleRemove(
                                                item.id
                                            )
                                        }
                                        disabled={
                                            isRemoving &&
                                            removingId ===
                                                item.id
                                        }
                                        className="absolute top-3 right-3 z-20 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-[#FFF5F5] hover:text-[#B85F59] transition-colors group-hover:opacity-100 opacity-70 disabled:opacity-50 border border-[#E7DBC0]/50"
                                    >
                                        <Trash2 className="w-4 h-4 text-[#8a7f6e] hover:text-[#B85F59] transition-colors" />
                                    </button>

                                    <div
                                        onClick={() =>
                                            handleItemClick(
                                                item.slug
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        {/* Product Image */}
                                        <div className="relative aspect-square bg-[#F0EEE8] overflow-hidden">
                                            <Image
                                                src={
                                                    item.image
                                                }
                                                alt={
                                                    item.name
                                                }
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(
                                                    e
                                                ) => {
                                                    const target =
                                                        e.target as HTMLImageElement;

                                                    target.src =
                                                        "/indiekonnect-web/images/placeholder.jpg";
                                                }}
                                            />

                                            {/* Discount Badge */}
                                            {item.discount && (
                                                <span className="absolute top-3 left-3 bg-[#B85F59] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold z-10 border border-white/20">
                                                    -{item.discount}%
                                                </span>
                                            )}

                                            {/* Out of Stock */}
                                            {!item.inStock && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                                    <span className="bg-white/95 text-[#2B2420] px-4 py-1.5 rounded-full text-xs font-semibold border border-[#E7DBC0] shadow-lg">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}

                                            {/* Quick View */}
                                            <AnimatePresence>
                                                {hoveredItem ===
                                                    item.id && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                        }}
                                                        className="absolute inset-0 bg-black/10 flex items-center justify-center"
                                                    >
                                                        <motion.button
                                                            initial={{
                                                                scale: 0.8,
                                                                y: 10,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                                y: 0,
                                                            }}
                                                            exit={{
                                                                scale: 0.8,
                                                                y: 10,
                                                            }}
                                                            className="bg-white/95 backdrop-blur-sm text-[#2B2420] px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-white transition-colors border border-[#E7DBC0]/50"
                                                            style={{ fontFamily: "Jost, sans-serif" }}
                                                            onClick={(
                                                                e
                                                            ) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();

                                                                handleItemClick(
                                                                    item.slug
                                                                );
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Quick View
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Product Details */}
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <span 
                                                    className="text-[10px] uppercase tracking-[0.22em] text-[#8a7f6e]"
                                                    style={{ fontFamily: "Jost, sans-serif" }}
                                                >
                                                    {item.category}
                                                </span>

                                                <span 
                                                    className="text-[9px] text-[#C2BCB0]"
                                                    style={{ fontFamily: "Jost, sans-serif" }}
                                                >
                                                    Added {item.addedDate}
                                                </span>
                                            </div>

                                            <h3 
                                                className="font-semibold text-[#2B2420] text-base line-clamp-2 group-hover:text-[#C9A227] transition-colors"
                                                style={{ fontFamily: "Jost, sans-serif" }}
                                            >
                                                {item.name}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span 
                                                    className="text-xl font-semibold text-[#2B2420]"
                                                    style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                                                >
                                                    ₹{item.price.toLocaleString()}
                                                </span>

                                                {item.originalPrice && (
                                                    <span 
                                                        className="text-xs text-[#C2BCB0] line-through"
                                                        style={{ fontFamily: "Jost, sans-serif" }}
                                                    >
                                                        ₹{item.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-1 mt-1.5">
                                                {renderRatingStars(
                                                    item.rating
                                                )}

                                                <span 
                                                    className="text-[#C2BCB0] text-[9px] ml-1"
                                                    style={{ fontFamily: "Jost, sans-serif" }}
                                                >
                                                    ({item.reviews})
                                                </span>
                                            </div>

                                            {/* Bottom Actions */}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EFE6D3]">
                                                <span 
                                                    className={`text-[10px] font-medium ${
                                                        item.inStock
                                                            ? "text-[#24887C]"
                                                            : "text-[#B85F59]"
                                                    }`}
                                                    style={{ fontFamily: "Jost, sans-serif" }}
                                                >
                                                    {item.inStock
                                                        ? "In Stock"
                                                        : "Out of Stock"}
                                                </span>

                                                {/* Add to Cart Button - Black style */}
                                                <button
                                                    type="button"
                                                    onClick={(
                                                        e
                                                    ) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();

                                                        if (
                                                            item.inStock &&
                                                            !isThisItemAdding
                                                        ) {
                                                            handleAddToCart(
                                                                item.id,
                                                                item.name,
                                                                e
                                                            );
                                                        }
                                                    }}
                                                    disabled={
                                                        !item.inStock ||
                                                        isThisItemAdding
                                                    }
                                                    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full transition-all duration-200 text-[10px] font-medium uppercase tracking-[0.18em] ${
                                                        item.inStock &&
                                                        !isThisItemAdding
                                                            ? "bg-[#071a41] text-white hover:shadow-md cursor-pointer"
                                                            : "bg-[#E7DBC0] text-[#C2BCB0] cursor-not-allowed"
                                                    }`}
                                                    style={{ fontFamily: "Jost, sans-serif" }}
                                                >
                                                    {isThisItemAdding ? (
                                                        <>
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            <span>
                                                                Adding...
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                            <span>
                                                                Add to Cart
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}