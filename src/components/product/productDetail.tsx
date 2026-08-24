'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Star,
    Heart,
    Share2,
    Truck,
    Shield,
    RotateCcw,
    Minus,
    Plus,
    CheckCircle,
    ArrowLeft,
    ShoppingBag,
    BadgeCheck,
    Tag,
    CreditCard,
    Zap,
    ChevronRight,
    X,
    ShoppingCart,
    Plus as PlusIcon,
    Headphones,
    PackageCheck,
} from "lucide-react";

import Footer from "../Footer/Footer";
import {
    useGetProductBySlugQuery,
    useGetProductsByCategoryQuery
} from "@/lib/redux/api/productApi";
import {
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
    useGetWishlistQuery
} from "@/lib/redux/api/Wishlist/wishlistApi";
import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "../../lib/slices/toastSlice";
import Header from "../common/Header";
import Loader from "../ui/Spinner/Loader";

interface ProductDetailProps {
    productSlug: string;
}

interface CartItem {
    id: number;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    quantity: number;
}

// ---------- micro-interaction helpers (no new deps, DOM-only) ----------
const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fireRipple(e: React.MouseEvent<HTMLElement>) {
    if (prefersReduced()) return;
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "ik-ripple";
    span.style.left = e.clientX - r.left - 7 + "px";
    span.style.top = e.clientY - r.top - 7 + "px";
    btn.appendChild(span);
    setTimeout(() => span.remove(), 700);
}

function flyImageToCart(sourceEl: HTMLElement | null, imgSrc: string) {
    if (prefersReduced() || !sourceEl) return;
    const target = document.querySelector("#cart-icon") as HTMLElement | null;
    const a = sourceEl.getBoundingClientRect();
    const b = target
        ? target.getBoundingClientRect()
        : { left: window.innerWidth - 60, top: 20, width: 24, height: 24 } as DOMRect;

    const ghost = document.createElement("div");
    ghost.className = "ik-fly-ghost";
    ghost.style.left = a.left + "px";
    ghost.style.top = a.top + "px";
    ghost.style.width = a.width + "px";
    ghost.style.height = a.height + "px";
    ghost.style.backgroundImage = `url(${imgSrc})`;
    document.body.appendChild(ghost);

    const dx = b.left - a.left + b.width / 2 - a.width / 2;
    const dy = b.top - a.top + b.height / 2 - a.height / 2;

    const anim = ghost.animate(
        [
            { transform: "translate(0,0) scale(1)", opacity: 1 },
            { transform: `translate(${dx * 0.5}px, ${dy * 0.35 - 90}px) scale(.6)`, opacity: 0.95, offset: 0.55 },
            { transform: `translate(${dx}px, ${dy}px) scale(.06)`, opacity: 0 },
        ],
        { duration: 900, easing: "cubic-bezier(.5,-0.2,.35,1)" }
    );
    anim.onfinish = () => {
        ghost.remove();
        if (target) {
            target.classList.remove("ik-bump");
            void target.offsetWidth;
            target.classList.add("ik-bump");
        }
    };
}

function popHeart(e: React.MouseEvent<HTMLElement>) {
    const el = e.currentTarget;
    el.classList.remove("ik-heart-pop");
    void el.offsetWidth;
    el.classList.add("ik-heart-pop");
}
// -------------------------------------------------------------------

export default function ProductDetail({ productSlug }: ProductDetailProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [activeTab, setActiveTab] = useState("description");
    const [activeImage, setActiveImage] = useState(0);
    const [hoveredSimilar, setHoveredSimilar] = useState<number | null>(null);
    const [hoverPopupData, setHoverPopupData] = useState<any>(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [popupQuantity, setPopupQuantity] = useState(1);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [wishlistState, setWishlistState] = useState<Record<number, boolean>>({});
    const sliderRef = useRef<HTMLDivElement>(null);
    const mainImageBoxRef = useRef<HTMLDivElement>(null);

    // ---- Cart state ----
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        data: productData,
        isLoading: isProductLoading,
        error
    } = useGetProductBySlugQuery(
        productSlug,
        { skip: !productSlug }
    );

    const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery();

    // Get category ID from product data
    const categoryId = productData?.data?.category_id || productData?.category_id || null;

    // Fetch similar products by category
    const {
        data: categoryProductsData,
        isLoading: isCategoryLoading,
    } = useGetProductsByCategoryQuery(
        categoryId,
        { skip: !categoryId }
    );

    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();
    const [addToCart] = useAddToCartMutation();

    const apiProduct = productData?.data ?? productData;

    const product = apiProduct
        ? {
            id: apiProduct.id,
            name: apiProduct.name,
            slug: apiProduct.slug,
            description: apiProduct.description,
            specification: apiProduct.specification,
            category: apiProduct.category?.name || "Uncategorized",
            categoryId: apiProduct.category_id || apiProduct.category?.id,

            productCode: apiProduct.product_code,

            retailPrice: Number(apiProduct.retail_price || 0),
            distributorPrice: Number(apiProduct.distributor_price || 0),

            price: Number(apiProduct.retail_price || 0),

            originalPrice:
                Number(apiProduct.distributor_price || 0) >
                    Number(apiProduct.retail_price || 0)
                    ? Number(apiProduct.distributor_price)
                    : null,

            discount:
                Number(apiProduct.distributor_price || 0) >
                    Number(apiProduct.retail_price || 0)
                    ? Math.round(
                        ((Number(apiProduct.distributor_price) -
                            Number(apiProduct.retail_price)) /
                            Number(apiProduct.distributor_price)) *
                        100
                    )
                    : null,

            image:
                apiProduct.primary_image_url ||
                apiProduct.images?.[0]?.image_url ||
                "/indiekonnect-web/images/placeholder.jpg",

            images: apiProduct.images || [],

            rating: 4.5,
            reviews: 120,

            inStock:
                apiProduct.status === "active" &&
                Number(apiProduct.stock_quantity) > 0,

            stockQuantity: Number(apiProduct.stock_quantity || 0),

            lowStockThreshold: Number(
                apiProduct.low_stock_threshold || 10
            ),

            isPublished: apiProduct.is_published,

            status: apiProduct.status,

            isWishlisted: apiProduct.is_wishlisted || false,

            taxCategoryId: apiProduct.tax_category_id,

            createdAt: apiProduct.created_at,
            updatedAt: apiProduct.updated_at,
        }
        : null;

    // Check if product is in wishlist
    useEffect(() => {
        if (wishlistData?.data && product?.id) {
            const isInWishlist = wishlistData.data.some(
                (item: any) => item.product_id === product.id
            );
            setIsWishlisted(isInWishlist);
        }
    }, [wishlistData, product?.id]);

    const similarProducts = Array.isArray(categoryProductsData?.data)
        ? categoryProductsData.data
            .slice(0, 12)
            .map((p: any) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                category: p.category?.name || "Uncategorized",

                price: Number(p.retail_price || 0),

                originalPrice:
                    Number(p.distributor_price || 0) >
                        Number(p.retail_price || 0)
                        ? Number(p.distributor_price)
                        : null,

                discount:
                    Number(p.distributor_price || 0) >
                        Number(p.retail_price || 0)
                        ? Math.round(
                            ((Number(p.distributor_price) -
                                Number(p.retail_price)) /
                                Number(p.distributor_price)) *
                            100
                        )
                        : null,

                image:
                    p.primary_image_url ||
                    p.images?.find((img: any) => img.is_primary)?.image_url ||
                    p.images?.[0]?.image_url ||
                    "/indiekonnect-web/images/placeholder.jpg",

                rating: 4.5,
                reviews: 120,

                inStock:
                    (p.status === "active" || p.stock_status === "active") &&
                    Number(p.stock_quantity) > 0,

                stockQuantity: Number(p.stock_quantity || 0),
            }))
        : [];

    // Initialize wishlist state for similar products
    useEffect(() => {
        if (wishlistData?.data) {
            const wishlistMap: Record<number, boolean> = {};
            wishlistData.data.forEach((item: any) => {
                wishlistMap[item.product_id] = true;
            });
            setWishlistState(wishlistMap);
        }
    }, [wishlistData]);

    const toggleWishlist = async (productId: number) => {
        try {
            const isWishlisted = wishlistState[productId] || false;

            if (isWishlisted) {
                await removeFromWishlist({ product_id: productId }).unwrap();
                setWishlistState(prev => ({ ...prev, [productId]: false }));
                dispatch(
                    showToast({
                        message: "Removed from wishlist",
                        type: "info",
                    })
                );
            } else {
                await addToWishlist({ product_id: productId }).unwrap();
                setWishlistState(prev => ({ ...prev, [productId]: true }));
                dispatch(
                    showToast({
                        message: "Added to wishlist! ❤️",
                        type: "success",
                    })
                );
            }
            await refetchWishlist();
        } catch (error: any) {
            console.error("Wishlist operation failed:", error);
            dispatch(
                showToast({
                    message: error?.data?.message || "Failed to update wishlist",
                    type: "error",
                })
            );
        }
    };

    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider || similarProducts.length === 0) return;

        let scrollAmount = 0;
        const scrollSpeed = 0.8;
        let animationId: number;
        let isPaused = false;

        const autoScroll = () => {
            if (!slider || isPaused) {
                animationId = requestAnimationFrame(autoScroll);
                return;
            }

            const maxScroll = slider.scrollWidth - slider.clientWidth;

            if (scrollAmount >= maxScroll) {
                scrollAmount = 0;
                slider.scrollLeft = 0;
            } else {
                scrollAmount += scrollSpeed;
                slider.scrollLeft = scrollAmount;
            }

            animationId = requestAnimationFrame(autoScroll);
        };

        animationId = requestAnimationFrame(autoScroll);

        const pauseAutoScroll = () => {
            isPaused = true;
            cancelAnimationFrame(animationId);
        };

        const resumeAutoScroll = () => {
            isPaused = false;
            if (animationId) cancelAnimationFrame(animationId);
            animationId = requestAnimationFrame(autoScroll);
        };

        slider.addEventListener("mouseenter", pauseAutoScroll);
        slider.addEventListener("mouseleave", resumeAutoScroll);
        slider.addEventListener("touchstart", pauseAutoScroll);
        slider.addEventListener("touchend", resumeAutoScroll);

        return () => {
            cancelAnimationFrame(animationId);
            slider.removeEventListener("mouseenter", pauseAutoScroll);
            slider.removeEventListener("mouseleave", resumeAutoScroll);
            slider.removeEventListener("touchstart", pauseAutoScroll);
            slider.removeEventListener("touchend", resumeAutoScroll);
        };
    }, [similarProducts]);

    const handleQuantityChange = (type: "increment" | "decrement") => {
        if (type === "increment") {
            setQuantity((prev) => Math.min(prev + 1, Math.min(product?.stockQuantity || 10, 10)));
        } else {
            setQuantity((prev) => Math.max(prev - 1, 1));
        }
    };

    const handlePopupQuantityChange = (type: "increment" | "decrement") => {
        if (type === "increment") {
            setPopupQuantity((prev) => Math.min(prev + 1, 10));
        } else {
            setPopupQuantity((prev) => Math.max(prev - 1, 1));
        }
    };

    // ---- Wishlist Handler ----
    const handleWishlistToggle = async (e?: React.MouseEvent<HTMLElement>) => {
        if (!product || isWishlistLoading) return;
        if (e) popHeart(e);

        setIsWishlistLoading(true);

        try {
            if (isWishlisted) {
                await removeFromWishlist({ product_id: product.id }).unwrap();
                setIsWishlisted(false);
                dispatch(
                    showToast({
                        message: `${product.name} removed from wishlist`,
                        type: "info",
                    })
                );
            } else {
                await addToWishlist({ product_id: product.id }).unwrap();
                setIsWishlisted(true);
                dispatch(
                    showToast({
                        message: `${product.name} added to wishlist! ❤️`,
                        type: "success",
                    })
                );
            }
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

    // ---- Cart helpers ----
    const addToCartLocal = (item: any, qty: number = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((c) => c.id === item.id);
            if (existing) {
                return prev.map((c) =>
                    c.id === item.id
                        ? { ...c, quantity: Math.min(c.quantity + qty, 10) }
                        : c,
                );
            }
            return [
                ...prev,
                {
                    id: item.id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    originalPrice: item.originalPrice,
                    quantity: qty,
                },
            ];
        });
    };

    // ---- Handle Add to Cart with API ----
    const handleAddToCart = async (e?: React.MouseEvent<HTMLElement>) => {
        if (!product || !product.inStock) return;
        if (e) {
            fireRipple(e);
            flyImageToCart(mainImageBoxRef.current, gallery[activeImage] || product.image);
        }

        try {
            await addToCart({
                product_id: product.id,
                quantity: quantity
            }).unwrap();

            addToCartLocal(product, quantity);
            setIsAddedToCart(true);

            dispatch(
                showToast({
                    message: `${product.name} added to cart successfully! 🛒`,
                    type: "success",
                })
            );

            setTimeout(() => setIsAddedToCart(false), 3000);
        } catch (error: any) {
            console.error("Failed to add to cart:", error);
            dispatch(
                showToast({
                    message: error?.data?.message || "Failed to add item to cart",
                    type: "error",
                })
            );
        }
    };

    const handleBuyNow = () => {
        if (!product || !product.inStock) return;

        const params = new URLSearchParams({
            product_id: String(product.id),
            quantity: String(quantity),
        });

        router.push(`/checkout?${params.toString()}`);
    };

    const handleCartIconHover = (similar: any, event: React.MouseEvent) => {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setPopupPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
        });
        setHoverPopupData(similar);
        setHoveredSimilar(similar.id);
        setPopupQuantity(1);
    };

    const handlePopupLeave = () => {
        setHoverPopupData(null);
        setHoveredSimilar(null);
    };

    const handlePopupAddToCart = async (e?: React.MouseEvent<HTMLElement>) => {
        if (!hoverPopupData) return;
        if (e) fireRipple(e);

        try {
            await addToCart({
                product_id: hoverPopupData.id,
                quantity: popupQuantity
            }).unwrap();

            addToCartLocal(hoverPopupData, popupQuantity);

            dispatch(
                showToast({
                    message: `${hoverPopupData.name} added to cart! 🛒`,
                    type: "success",
                })
            );

            handlePopupLeave();
        } catch (error: any) {
            console.error("Failed to add to cart:", error);
            dispatch(
                showToast({
                    message: error?.data?.message || "Failed to add item to cart",
                    type: "error",
                })
            );
        }
    };

    // Render loading state
    if (isProductLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader width={200} height={200} />
            </div>
        );
    }

    // Render error state
    if (error || !product) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Product Not Found
                    </h2>
                    <p className="text-gray-500 mb-6">
                        The product you're looking for doesn't exist or may have been
                        removed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                        >
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Gallery images
    const gallery = product.images && product.images.length > 0
        ? product.images.map((img: any) => img.image_url || img.image)
        : [product.image];

    const ratingBreakdown = [
        { stars: 5, pct: 68 },
        { stars: 4, pct: 20 },
        { stars: 3, pct: 7 },
        { stars: 2, pct: 3 },
        { stars: 1, pct: 2 },
    ];

    const renderRatingStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const emptyStars = 5 - fullStars;
        return "★".repeat(fullStars) + "☆".repeat(emptyStars);
    };

    // Parse specification if it's a string
    const parseSpecification = (spec: any) => {
        if (!spec) return null;
        if (typeof spec === 'string') {
            try {
                return JSON.parse(spec);
            } catch {
                return null;
            }
        }
        return spec;
    };

    const specData = parseSpecification(product.specification);

    // Check if product is low stock
    const isLowStock = product.inStock && product.stockQuantity <= product.lowStockThreshold;

    const tabs = ["description", "specifications", "shipping", "reviews"];
    const tabLabels: Record<string, string> = {
        description: "Description",
        specifications: "Specifications",
        shipping: "Shipping & Returns",
        reviews: `Reviews (${product.reviews?.toLocaleString() || 0})`,
    };

    const specRows: [string, string | number][] = specData
        ? (Object.entries(specData) as [string, any][]).map(([k, v]) => [
            k.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
            String(v)
        ])
        : [
            ["Product Type", product.category || "Uncategorized"],
            ["Product Code", product.productCode || "N/A"],
            ["Availability", product.inStock ? "In Stock" : "Out of Stock"],
            ["Stock Quantity", product.stockQuantity || 0],
            ["Rating", `${product.rating} / 5`],
            ["Warranty", "1 Year Warranty"],
            ["Return Policy", "7 Days Return"],
            ["Assembly", "Minor Assembly Required"],
        ];

    // Reusable spec table renderer (used in both Description and Specifications tabs)
    const renderSpecTable = () => (
        <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
                {specRows.map(([label, value], i) => (
                    <div
                        key={label}
                        className={`flex justify-between gap-4 px-5 py-3 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } border-b border-gray-100 md:border-r`}
                    >
                        <span className="text-gray-500 font-medium tracking-wide font-sans">{label}</span>
                        <span className="text-gray-900 font-semibold text-right font-sans">
                            {value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Header />

            <div className="container mx-auto px-4 pb-6 md:pb-10">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 mt-4 flex-wrap font-sans">
                    <Link href="/" className="hover:text-yellow-600 transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <Link
                        href="/products"
                        className="hover:text-yellow-600 transition-colors"
                    >
                        Products
                    </Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <Link
                        href={`/products?category=${product.category || 'all'}`}
                        className="hover:text-yellow-600 transition-colors"
                    >
                        {product.category || 'All'}
                    </Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span className="text-gray-800 font-medium truncate max-w-[200px]">
                        {product.name}
                    </span>
                </nav>

                {/* Main Product Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                        {/* Left Column - Gallery */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                {/* Thumbnails - Left Side */}
                                <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] hide-scrollbar">
                                    {gallery.map((img: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 hover:scale-105 ${activeImage === i
                                                ? "border-yellow-400 ring-2 ring-yellow-400/30 scale-105"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <Image
                                                src={img || "/indiekonnect-web/images/placeholder.jpg"}
                                                alt={`${product.name} ${i + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Main Image */}
                                <div ref={mainImageBoxRef} data-card className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] flex-1 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeImage}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="absolute inset-0"
                                        >
                                            <Image
                                                src={gallery[activeImage] || "/indiekonnect-web/images/placeholder.jpg"}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                priority
                                            />
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Discount Badge */}
                                    {product.discount && product.discount > 0 && (
                                        <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                                            -{product.discount}% OFF
                                        </span>
                                    )}

                                    {/* Stock Status Badge */}
                                    {!product.inStock && (
                                        <span className="absolute top-4 left-4 bg-gray-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                                            Out of Stock
                                        </span>
                                    )}
                                    {isLowStock && product.inStock && (
                                        <span className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 animate-pulse">
                                            Only {product.stockQuantity} left!
                                        </span>
                                    )}

                                    {/* Wishlist Button */}
                                    <button
                                        className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:shadow-lg transition-all z-10 hover:scale-110"
                                        onClick={handleWishlistToggle}
                                        disabled={isWishlistLoading}
                                    >
                                        <Heart
                                            className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                                                }`}
                                        />
                                    </button>

                                    {product.rating >= 4.5 && (
                                        <span className="absolute bottom-4 left-4 flex items-center gap-1 bg-yellow-400 text-gray-900 px-2.5 py-1 rounded-md text-xs font-bold shadow-md z-10">
                                            <Zap className="w-3 h-3 fill-gray-900" /> Bestseller
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Trust badges - Free Shipping, Secure Payment, Easy Returns, 24/7 Support - Below Main Image */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="flex flex-col items-center text-center gap-2 py-4 px-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:bg-white/55 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-yellow-400/20 backdrop-blur-md flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <span className="text-xs text-gray-700 font-semibold leading-tight tracking-tight font-sans">
                                        Free Shipping
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 py-4 px-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:bg-white/55 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-yellow-400/20 backdrop-blur-md flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <span className="text-xs text-gray-700 font-semibold leading-tight tracking-tight font-sans">
                                        Secure Payment
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 py-4 px-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:bg-white/55 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-yellow-400/20 backdrop-blur-md flex items-center justify-center">
                                        <PackageCheck className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <span className="text-xs text-gray-700 font-semibold leading-tight tracking-tight font-sans">
                                        Easy Returns
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 py-4 px-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:bg-white/55 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-yellow-400/20 backdrop-blur-md flex items-center justify-center">
                                        <Headphones className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <span className="text-xs text-gray-700 font-semibold leading-tight tracking-tight font-sans">
                                        24/7 Support
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Product Info */}
                        <div className="space-y-5">
                            {/* Category & Title */}
                            <div>
                                <div className="flex items-center gap-2 text-xs text-yellow-700 font-semibold uppercase tracking-wide mb-2 flex-wrap">
                                    <span>{product.category || "Uncategorized"}</span>
                                    {product.productCode && (
                                        <>
                                            <span className="w-1 h-1 bg-yellow-400 rounded-full" />
                                            <span className="text-gray-500 font-normal uppercase tracking-normal">
                                                #{product.productCode}
                                            </span>
                                        </>
                                    )}
                                    {product.inStock && (
                                        <>
                                            <span className="w-1 h-1 bg-yellow-400 rounded-full" />
                                            <span className="flex items-center gap-1 text-green-600">
                                                <BadgeCheck className="w-3.5 h-3.5" /> Verified Seller
                                            </span>
                                        </>
                                    )}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 leading-tight tracking-tight font-sans">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded-md text-sm font-semibold">
                                        <span>{product.rating}</span>
                                        <Star className="w-3.5 h-3.5 fill-white" />
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {product.reviews?.toLocaleString()} ratings
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-sm text-gray-500">
                                        {product.reviews
                                            ? Math.floor(product.reviews * 0.7).toLocaleString()
                                            : 0}{" "}
                                        reviews
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="border-t border-b border-gray-100 py-4 space-y-1.5">
                                <div className="flex items-baseline gap-3 flex-wrap">
                                    {product.discount && product.discount > 0 && (
                                        <span className="text-green-600 font-bold text-lg">
                                            -{product.discount}%
                                        </span>
                                    )}
                                    <span className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight font-sans">
                                        ₹{product.price.toLocaleString()}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-gray-400 line-through font-sans">
                                            M.R.P: ₹{product.originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 font-sans">Inclusive of all taxes</p>
                                {product.discount && product.discount > 0 && product.originalPrice && (
                                    <p className="text-sm text-green-700 font-medium font-sans">
                                        You save ₹
                                        {(product.originalPrice - product.price).toLocaleString()}{" "}
                                        on this order
                                    </p>
                                )}
                                {product.stockQuantity ? (
                                    <p className="text-xs text-gray-400 font-sans">
                                        {product.stockQuantity} units available
                                    </p>
                                ) : null}
                            </div>

                            {/* Quantity - Improved UI */}
                            <div className="space-y-8 pt-2">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className="text-sm font-medium text-gray-700 font-sans">
                                        Quantity
                                    </span>
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden shadow-sm">
                                        <button
                                            className="px-4 py-2.5 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                            onClick={() => handleQuantityChange("decrement")}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <span className="w-14 text-center font-semibold text-gray-800 text-base font-sans">
                                            {quantity}
                                        </span>
                                        <button
                                            className="px-4 py-2.5 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                            onClick={() => handleQuantityChange("increment")}
                                            disabled={quantity >= 10 || quantity >= (product?.stockQuantity || 10)}
                                        >
                                            <Plus className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                    <span className="flex items-center gap-2 text-sm ml-auto font-sans">
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full ${product.inStock ? "bg-green-500 animate-pulse" : "bg-red-500"
                                                }`}
                                        />
                                        <span
                                            className={`font-medium ${product.inStock ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {product.inStock ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </span>
                                </div>

                                {/* 4 Action Buttons - 2x2 grid with rounded corners */}
                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        whileHover={{ scale: product.inStock ? 1.01 : 1 }}
                                        whileTap={{ scale: product.inStock ? 0.98 : 1 }}
                                        className={`ik-glass py-3.5 rounded-lg font-semibold transition-all relative overflow-hidden font-sans ${product.inStock
                                            ? "bg-gray-900 text-white hover:shadow-xl"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }`}
                                        onClick={handleAddToCart}
                                        disabled={!product.inStock}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isAddedToCart ? (
                                                <motion.span
                                                    key="added"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="relative z-10 flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    Added
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="add"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="relative z-10 flex items-center justify-center gap-2"
                                                >
                                                    <ShoppingBag className="w-4 h-4" />
                                                    Add to Cart
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: product.inStock ? 1.01 : 1 }}
                                        whileTap={{ scale: product.inStock ? 0.98 : 1 }}
                                        className={`ik-glass py-3.5 rounded-lg font-semibold transition-all font-sans ${product.inStock
                                            ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300 hover:shadow-xl"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }`}
                                        onClick={(e) => { fireRipple(e); handleBuyNow(); }}
                                        disabled={!product.inStock}
                                    >
                                        Buy Now
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="py-3.5 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-sans"
                                        onClick={handleWishlistToggle}
                                        disabled={isWishlistLoading}
                                    >
                                        <Heart
                                            className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                                        />
                                        {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="py-3.5 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-sans"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </motion.button>
                                </div>
                            </div>

                            {/* Bank offers */}
                            <div className="bg-yellow-50/60 border border-yellow-200/70 rounded-xl p-4 space-y-2.5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 font-sans">
                                    <Tag className="w-4 h-4 text-yellow-600" />
                                    Available Offers
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-600 font-sans">
                                    <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>
                                        10% instant discount on select bank cards, up to ₹1,500
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-600 font-sans">
                                    <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>No cost EMI available on orders above ₹3,000</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Full width Tabs section (Description / Specifications / Shipping / Reviews) ===== */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex gap-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    className={`py-2 px-1 text-sm font-semibold whitespace-nowrap transition-all relative font-sans ${activeTab === tab
                                        ? "text-gray-900"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tabLabels[tab]}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="tab-underline"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="py-6"
                            >
                                {/* Description tab - text on left, SMALLER image on right, specs below */}
                                {activeTab === "description" && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 mb-2.5 tracking-tight font-sans">
                                                    Product Overview
                                                </h3>
                                                <p className="text-gray-600 leading-relaxed text-[15px] mb-5 font-normal font-sans">
                                                    {product.description ||
                                                        "Premium quality product with exceptional design and craftsmanship."}
                                                </p>
                                                <div className="space-y-2.5">
                                                    {[
                                                        "Premium quality material",
                                                        "Ergonomic design for maximum comfort",
                                                        "Sturdy construction & finish",
                                                        "Perfect for living room, bedroom or office",
                                                    ].map((feature, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2.5 text-sm text-gray-700 font-medium font-sans"
                                                        >
                                                            <CheckCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                                            <span>{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Smaller lifestyle image, right-aligned */}
                                            <div className="flex justify-center md:justify-end">
                                                <div className="relative w-full max-w-[240px] md:max-w-[260px] aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                                                    <Image
                                                        src={gallery[1] || gallery[0] || "/indiekonnect-web/images/placeholder.jpg"}
                                                        alt={`${product.name} lifestyle`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specifications shown directly below the description */}
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 mb-3 tracking-tight font-sans">
                                                Specifications
                                            </h3>
                                            {renderSpecTable()}
                                        </div>
                                    </div>
                                )}

                                {/* Specifications tab - clean 2-column table like screenshot */}
                                {activeTab === "specifications" && renderSpecTable()}

                                {/* Shipping & Returns tab */}
                                {activeTab === "shipping" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="flex flex-col items-center text-center gap-2 p-5 bg-gray-50 rounded-xl border border-gray-100">
                                            <Truck className="w-6 h-6 text-yellow-600" />
                                            <span className="text-sm font-semibold text-gray-800 font-sans">
                                                Free Shipping
                                            </span>
                                            <span className="text-xs text-gray-500 font-sans">
                                                On orders above ₹999
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center text-center gap-2 p-5 bg-gray-50 rounded-xl border border-gray-100">
                                            <RotateCcw className="w-6 h-6 text-yellow-600" />
                                            <span className="text-sm font-semibold text-gray-800 font-sans">
                                                Easy Returns
                                            </span>
                                            <span className="text-xs text-gray-500 font-sans">
                                                7 days return policy
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center text-center gap-2 p-5 bg-gray-50 rounded-xl border border-gray-100">
                                            <Shield className="w-6 h-6 text-yellow-600" />
                                            <span className="text-sm font-semibold text-gray-800 font-sans">
                                                1 Year Warranty
                                            </span>
                                            <span className="text-xs text-gray-500 font-sans">
                                                Manufacturer backed
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Reviews tab */}
                                {activeTab === "reviews" && (
                                    <div className="flex flex-col md:flex-row gap-10 max-w-3xl">
                                        <div className="flex flex-col items-center md:items-start gap-2 flex-shrink-0">
                                            <span className="text-5xl font-bold text-gray-900 font-sans">
                                                {product.rating}
                                            </span>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                            ? "fill-yellow-500"
                                                            : "fill-gray-200 text-gray-200"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-500 font-sans">
                                                {product.reviews?.toLocaleString()} global ratings
                                            </span>
                                        </div>
                                        <div className="flex-1 space-y-2 w-full">
                                            {ratingBreakdown.map((r) => (
                                                <div key={r.stars} className="flex items-center gap-3 text-sm font-sans">
                                                    <span className="text-gray-600 w-12">{r.stars} star</span>
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-yellow-400 rounded-full transition-[width] duration-700 ease-out"
                                                            style={{ width: `${r.pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-gray-500 w-10 text-right">
                                                        {r.pct}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* ============================================================
                    YOU MAY ALSO LIKE - Similar Products Section (Screenshot Style)
                ============================================================ */}
                {similarProducts.length > 0 && (
                    <div className="mt-16 mb-8">
                        <h2 className="text-center text-xl md:text-2xl font-semibold tracking-[0.15em] text-gray-800 mb-8 font-sans">
                            YOU MAY ALSO LIKE
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 max-w-full mx-auto px-2">
                            {similarProducts.map((similarProduct) => (
                                <Link
                                    key={similarProduct.id}
                                    href={`/product/${similarProduct.slug}`}
                                    className="group block"
                                    onMouseEnter={(e) => handleCartIconHover(similarProduct, e)}
                                    onMouseLeave={handlePopupLeave}
                                >
                                    {/* Image Container - Light beige background like screenshot */}
                                    <div className="relative aspect-square bg-[#f5f2ed] rounded-lg overflow-hidden border border-gray-100 group-hover:border-yellow-400 transition-colors duration-300">
                                        <Image
                                            src={similarProduct.image || "/indiekonnect-web/images/placeholder.jpg"}
                                            alt={similarProduct.name}
                                            fill
                                            className="object-cover rounded-xl p-1 group-hover:scale-105 transition-transform duration-400"
                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                        />
                                        {/* Wishlist heart icon - top right */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                popHeart(e);
                                                toggleWishlist(similarProduct.id);
                                            }}
                                            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-all shadow-sm hover:shadow-md"
                                            aria-label="Add to wishlist"
                                        >
                                            <Heart
                                                className={`w-4 h-4 transition-all duration-200 ${wishlistState[similarProduct.id]
                                                        ? "fill-red-500 text-red-500 scale-110"
                                                        : "text-gray-500 hover:text-red-500"
                                                    }`}
                                            />
                                        </button>

                                        {/* Out of Stock overlay - optional */}
                                        {!similarProduct.inStock && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info - Center aligned like screenshot */}
                                    <div className="mt-2.5 text-center">
                                        <h3 className="text-xs sm:text-sm text-gray-800 font-medium leading-tight line-clamp-1 group-hover:text-black transition-colors font-sans">
                                            {similarProduct.name}
                                        </h3>

                                        {/* Price - bold with original price crossed out */}
                                        <div className="flex items-center justify-center gap-2 mt-0.5">
                                            <p className="text-sm sm:text-base text-gray-900 font-semibold font-sans">
                                                ₹{similarProduct.price.toLocaleString()}
                                            </p>
                                            {similarProduct.originalPrice && (
                                                <p className="text-[10px] text-gray-400 line-through font-sans">
                                                    ₹{similarProduct.originalPrice.toLocaleString()}
                                                </p>
                                            )}
                                        </div>

                                        {/* Rating Stars */}
                                        <div className="flex items-center justify-center gap-1 mt-0.5">
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${i < Math.floor(similarProduct.rating || 0)
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "fill-gray-200 text-gray-200"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-sans">
                                                ({similarProduct.reviews || 0})
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Hover Popup Card */}
            <AnimatePresence>
                {hoverPopupData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 5 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="fixed z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden font-sans"
                        style={{
                            left: `${Math.max(20, Math.min(popupPosition.x - 160, window.innerWidth - 340))}px`,
                            top: `${Math.max(20, popupPosition.y - 320)}px`,
                        }}
                        onMouseEnter={() => setHoveredSimilar(hoverPopupData.id)}
                        onMouseLeave={handlePopupLeave}
                    >
                        {/* Popup Header */}
                        <div className="relative bg-gradient-to-r from-yellow-400/10 to-yellow-400/5 px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                                        <ShoppingCart className="w-4 h-4 text-gray-900" />
                                    </div>
                                    <span className="font-semibold text-gray-900 text-sm font-sans">
                                        Quick Add
                                    </span>
                                </div>
                                <button
                                    onClick={handlePopupLeave}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Popup Content */}
                        <div className="p-4">
                            <div className="flex gap-3">
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                                    <Image
                                        src={hoverPopupData.image || "/indiekonnect-web/images/placeholder.jpg"}
                                        alt={hoverPopupData.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {hoverPopupData.discount && hoverPopupData.discount > 0 && (
                                        <span className="absolute top-0.5 left-0.5 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px] font-bold">
                                            -{hoverPopupData.discount}%
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-sans">
                                        {hoverPopupData.category || "Uncategorized"}
                                    </div>
                                    <h4 className="font-medium text-gray-900 text-sm truncate font-sans">
                                        {hoverPopupData.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-black font-bold text-gray-900 font-sans">
                                            ₹{hoverPopupData.price.toLocaleString()}
                                        </span>
                                        {hoverPopupData.originalPrice && (
                                            <span className="text-[10px] text-gray-400 line-through font-sans">
                                                ₹{hoverPopupData.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-yellow-500 text-[10px]">
                                            {renderRatingStars(hoverPopupData.rating)}
                                        </span>
                                        <span className="text-gray-400 text-[8px] font-sans">
                                            ({hoverPopupData.reviews})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                <span className="text-sm text-gray-500 font-sans">Quantity</span>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden shadow-sm">
                                    <button
                                        className="px-3 py-1.5 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                        onClick={() => handlePopupQuantityChange("decrement")}
                                        disabled={popupQuantity <= 1}
                                    >
                                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                    <span className="w-10 text-center text-sm font-semibold text-gray-800 font-sans">
                                        {popupQuantity}
                                    </span>
                                    <button
                                        className="px-3 py-1.5 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                        onClick={() => handlePopupQuantityChange("increment")}
                                        disabled={popupQuantity >= 10}
                                    >
                                        <PlusIcon className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Subtotal */}
                            <div className="flex justify-between items-center mt-3 py-2 border-t border-gray-100">
                                <span className="text-sm text-gray-500 font-sans">Subtotal</span>
                                <span className="text-lg font-bold text-gray-900 font-sans">
                                    ₹{(hoverPopupData.price * popupQuantity).toLocaleString()}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 mt-3">
                                <button
                                    className="ik-glass w-full py-2.5 bg-yellow-400 text-gray-900 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow font-sans"
                                    onClick={handlePopupAddToCart}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                </button>
                                <button
                                    className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-sans"
                                    onClick={handlePopupLeave}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Popup Footer */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
                            <span className="text-[10px] text-gray-400 font-sans">
                                Free shipping on orders above ₹999
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <style jsx global>{`
                .ik-glass { position: relative; overflow: hidden; }
                .ik-glass::after {
                    content: '';
                    position: absolute; top: 0; left: -65%;
                    width: 45%; height: 100%;
                    pointer-events: none;
                    transform: skewX(-18deg);
                    background: linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.5) 50%, rgba(255,255,255,0) 100%);
                }
                .ik-glass:hover::after { animation: ikSheen .5s ease-out forwards; }
                @keyframes ikSheen { from { left: -65%; } to { left: 120%; } }

                .ik-ripple {
                    position: absolute; width: 14px; height: 14px;
                    border-radius: 50%; background: currentColor;
                    opacity: .28; pointer-events: none;
                    animation: ikRip .7s cubic-bezier(.2,.8,.2,1) forwards;
                }
                @keyframes ikRip { to { transform: scale(15); opacity: 0; } }

                .ik-heart-pop { animation: ikHeart .55s cubic-bezier(.2,.9,.2,1); }
                @keyframes ikHeart {
                    0% { transform: scale(1); } 40% { transform: scale(1.5); }
                    70% { transform: scale(.88); } 100% { transform: scale(1); }
                }

                .ik-bump { animation: ikBump .5s cubic-bezier(.2,.9,.2,1); }
                @keyframes ikBump {
                    0% { transform: scale(1); } 45% { transform: scale(1.5); } 100% { transform: scale(1); }
                }

                .ik-fly-ghost {
                    position: fixed; z-index: 9997; border-radius: 12px;
                    pointer-events: none; background-size: cover; background-position: center;
                    box-shadow: 0 18px 40px rgba(0,0,0,.25);
                }

                @media (prefers-reduced-motion: reduce) {
                    .ik-glass::after, .ik-ripple, .ik-heart-pop, .ik-bump { display: none; animation: none; }
                }
            `}</style>
            <Footer />
        </div>
    );
}
