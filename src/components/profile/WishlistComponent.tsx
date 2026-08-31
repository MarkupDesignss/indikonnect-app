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
                        "Item removed from wishlist",
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
                    message: `${productName} added to cart`,
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
                            className="h-3 w-3 fill-[#111111] text-[#111111]"
                        />
                    )
                )}

                {hasHalfStar && (
                    <div className="relative h-3 w-3">
                        <Star className="absolute inset-0 h-3 w-3 text-[#111111]" />

                        <div className="absolute inset-0 h-3 w-1.5 overflow-hidden">
                            <Star className="h-3 w-3 fill-[#111111] text-[#111111]" />
                        </div>
                    </div>
                )}

                {[...Array(emptyStars)].map(
                    (_, i) => (
                        <Star
                            key={`empty-${i}`}
                            className="h-3 w-3 text-[#DCDCDA]"
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
                staggerChildren: 0.06,
                delayChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 14,
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
            y: -14,
            scale: 0.94,
            transition: {
                duration: 0.25,
            },
        },
    };

    if (
        isWishlistLoading &&
        isInitialLoad
    ) {
        return (
            <div className="flex items-center justify-center py-16 font-sans">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-7 w-7 animate-spin text-[#111111]" />
                    <span className="text-[12px] text-[#888888]">
                        Loading wishlist...
                    </span>
                </div>
            </div>
        );
    }

    if (wishlistError) {
        return (
            <div className="py-16 text-center font-sans">
                <div className="mb-4 text-3xl">
                    ⚠️
                </div>

                <h3 className="mb-1.5 text-[16px] font-semibold text-[#171717]">
                    Failed to load wishlist
                </h3>

                <p className="mb-4 text-[12px] text-[#888888]">
                    Please try refreshing the page
                </p>

                <button
                    onClick={() =>
                        refetchWishlist()
                    }
                    className="rounded-[6px] bg-[#111111] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
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
                    y: 16,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="py-16 text-center font-sans"
            >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F1F0]">
                    <Heart
                        className="h-7 w-7 text-[#999999]"
                        strokeWidth={1.5}
                    />
                </div>

                <h3 className="text-[17px] font-semibold text-[#171717]">
                    Your wishlist is empty
                </h3>

                <p className="mx-auto mb-6 mt-2 max-w-md text-[12px] leading-5 text-[#888888]">
                    Start adding your favorite items to your wishlist by browsing our collection.
                </p>

                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-[6px] bg-[#111111] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
                >
                    Explore Products
                    <MoveRight className="h-3.5 w-3.5" />
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="mx-auto font-sans">
            {/* HEADER */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: -8,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
            >
                <div className="flex items-center gap-2.5">
                    <h2 className="text-[20px] font-semibold text-[#171717]">
                        Saved Items
                    </h2>

                    <span className="rounded-full border border-[#E4E4E2] bg-[#FAFAF9] px-2.5 py-1 text-[10px] font-medium text-[#777777]">
                        {wishlistItems.length} items
                    </span>
                </div>

                <Link
                    href="/products"
                    className="flex items-center gap-1 text-[11px] font-medium text-[#111111] underline underline-offset-2 transition hover:text-[#292929]"
                >
                    Browse More
                    <MoveRight className="h-3.5 w-3.5" />
                </Link>
            </motion.div>

            {/* WISHLIST GRID */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4"
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
                                        scale: 0.85,
                                        y: -14,
                                        transition: {
                                            duration: 0.25,
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
                                                ? 0.85
                                                : 1,
                                    }}
                                    transition={{
                                        duration: 0.25,
                                    }}
                                    className="group relative overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white transition hover:border-[#CFCFCC]"
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
                                    {/* REMOVE BUTTON */}
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
                                        className="absolute right-2.5 top-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-[#E4E4E2] bg-white/95 text-[#888888] opacity-70 transition hover:border-[#F0CFCF] hover:text-[#B24C4C] disabled:opacity-50 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>

                                    <div
                                        onClick={() =>
                                            handleItemClick(
                                                item.slug
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        {/* PRODUCT IMAGE */}
                                        <div className="relative aspect-square overflow-hidden bg-[#F7F7F6]">
                                            <Image
                                                src={
                                                    item.image
                                                }
                                                alt={
                                                    item.name
                                                }
                                                fill
                                                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                                onError={(
                                                    e
                                                ) => {
                                                    const target =
                                                        e.target as HTMLImageElement;

                                                    target.src =
                                                        "/indiekonnect-web/images/placeholder.jpg";
                                                }}
                                            />

                                            {/* DISCOUNT BADGE */}
                                            {item.discount && (
                                                <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#111111] px-2 py-0.5 text-[9px] font-semibold text-white">
                                                    -{item.discount}%
                                                </span>
                                            )}

                                            {/* OUT OF STOCK */}
                                            {!item.inStock && (
                                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                                                    <span className="rounded-full border border-[#E4E4E2] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#777777]">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}

                                            {/* QUICK VIEW */}
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
                                                            className="absolute inset-0 flex items-center justify-center bg-black/5"
                                                        >
                                                            <motion.button
                                                                initial={{
                                                                    scale: 0.9,
                                                                    y: 8,
                                                                }}
                                                                animate={{
                                                                    scale: 1,
                                                                    y: 0,
                                                                }}
                                                                exit={{
                                                                    scale: 0.9,
                                                                    y: 8,
                                                                }}
                                                                className="flex items-center gap-1.5 rounded-full border border-[#E4E4E2] bg-white/95 px-4 py-2 text-[11px] font-medium text-[#111111] shadow-sm transition hover:bg-white"
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
                                                                <Eye className="h-3.5 w-3.5" />
                                                                Quick View
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                            </AnimatePresence>
                                        </div>

                                        {/* PRODUCT DETAILS */}
                                        <div className="p-3.5">
                                            <div className="mb-1 flex items-center justify-between gap-2">
                                                <span className="min-w-0 truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-[#888888]">
                                                    {item.category}
                                                </span>

                                                <span className="shrink-0 text-[9px] text-[#AAAAAA]">
                                                    {item.addedDate}
                                                </span>
                                            </div>

                                            <h3 className="line-clamp-2 text-[13px] font-medium text-[#171717] transition-colors group-hover:text-[#111111]">
                                                {item.name}
                                            </h3>

                                            <div className="mt-1.5 flex items-center gap-2">
                                                <span className="text-[15px] font-semibold text-[#111111]">
                                                    ₹{item.price.toLocaleString()}
                                                </span>

                                                {item.originalPrice && (
                                                    <span className="text-[11px] text-[#AAAAAA] line-through">
                                                        ₹{item.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* RATING */}
                                            <div className="mt-1.5 flex items-center gap-1">
                                                {renderRatingStars(
                                                    item.rating
                                                )}

                                                <span className="ml-1 text-[9px] text-[#AAAAAA]">
                                                    ({item.reviews})
                                                </span>
                                            </div>

                                            {/* BOTTOM ACTIONS */}
                                            <div className="mt-3 flex items-center justify-between border-t border-[#E6E6E4] pt-3">
                                                <span
                                                    className={`text-[10px] font-medium ${item.inStock
                                                            ? "text-[#3F765A]"
                                                            : "text-[#B24C4C]"
                                                        }`}
                                                >
                                                    {item.inStock
                                                        ? "In Stock"
                                                        : "Out of Stock"}
                                                </span>

                                                {/* ADD TO CART */}
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
                                                    className={`inline-flex items-center justify-center gap-1.5 rounded-[6px] px-3.5 py-2 text-[10px] font-semibold transition ${item.inStock &&
                                                            !isThisItemAdding
                                                            ? "border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white cursor-pointer"
                                                            : "border border-[#DCDCDA] bg-[#F7F7F6] text-[#AAAAAA] cursor-not-allowed"
                                                        }`}
                                                >
                                                    {isThisItemAdding ? (
                                                        <>
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            <span>
                                                                Adding...
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart className="h-3.5 w-3.5" />
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