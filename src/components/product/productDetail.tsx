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
    Sparkles,
    Menu,
    X,
    ShoppingCart,
    Trash2,
    Plus as PlusIcon,
    PackageOpen,
} from "lucide-react";

import Logo from "../../../public/images/logo.png";
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

export default function ProductDetail({ productSlug }: ProductDetailProps) {

    console.log(productSlug)
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [activeTab, setActiveTab] = useState("description");
    const [activeImage, setActiveImage] = useState(0);
    const [hoveredSimilar, setHoveredSimilar] = useState<number | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoverPopupData, setHoverPopupData] = useState<any>(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [popupQuantity, setPopupQuantity] = useState(1);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    // ---- Cart state ----
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { 
        data: productData, 
        isLoading: isProductLoading, 
        error 
    } = useGetProductBySlugQuery(
        productSlug,
        { skip: !productSlug }
    );

    console.log(productData)

    const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery();

    // Get category ID from product data
    const categoryId = productData?.data?.category_id || productData?.category_id || null;
    console.log(categoryId)

    // Fetch similar products by category
    const {
        data: categoryProductsData,
        isLoading: isCategoryLoading,
      } = useGetProductsByCategoryQuery(
        categoryId,
        { skip: !categoryId }
      );

    console.log('Category Products:', categoryProductsData);

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
                  "/images/placeholder.jpg",
    
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
                "/images/placeholder.jpg",

            rating: 4.5,
            reviews: 120,

            inStock:
                (p.status === "active" || p.stock_status === "active") &&
                Number(p.stock_quantity) > 0,

            stockQuantity: Number(p.stock_quantity || 0),
        }))
    : [];

    // Auto-slide animation for similar products
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
            setQuantity((prev) => Math.min(prev + 1, 10));
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

    const goToWishlist = () => {
        router.push("/wishlist");
    };

    // ---- Wishlist Handler ----
    const handleWishlistToggle = async () => {
        if (!product || isWishlistLoading) return;
        
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

    const removeCartItem = (id: number) => {
        setCartItems((prev) => prev.filter((c) => c.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((sum, c) => sum + c.quantity, 0);
    const cartSubtotal = cartItems.reduce(
        (sum, c) => sum + c.price * c.quantity,
        0,
    );

    const openCartDropdown = () => {
        if (cartCloseTimer.current) clearTimeout(cartCloseTimer.current);
        setIsCartOpen(true);
    };

    const scheduleCloseCartDropdown = () => {
        if (cartCloseTimer.current) clearTimeout(cartCloseTimer.current);
        cartCloseTimer.current = setTimeout(() => setIsCartOpen(false), 200);
    };

    // ---- Handle Add to Cart with API ----
    const handleAddToCart = async () => {
        if (!product) return;
        
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

    const handlePopupAddToCart = async () => {
        if (!hoverPopupData) return;
        
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
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500 text-sm">Loading product...</p>
                </div>
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

    return (
        <div className="bg-gray-50 min-h-screen">
           <Header />

            <div className="container mx-auto px-4 py-6 md:py-10">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition-colors mb-4 group text-sm"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </button>

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
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
                        <div className="space-y-3">
                            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
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
                                            src={gallery[activeImage] || "/images/placeholder.jpg"}
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
                                        className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                                    />
                                </button>

                                {product.rating >= 4.5 && (
                                    <span className="absolute bottom-4 left-4 flex items-center gap-1 bg-yellow-400 text-gray-900 px-2.5 py-1 rounded-md text-xs font-bold shadow-md z-10">
                                        <Zap className="w-3 h-3 fill-gray-900" /> Bestseller
                                    </span>
                                )}
                            </div>

                            {/* Thumbnails */}
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {gallery.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                                            activeImage === i
                                                ? "border-yellow-400 ring-2 ring-yellow-400/30"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <Image
                                            src={img || "/images/placeholder.jpg"}
                                            alt={`${product.name} ${i + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Trust badges row */}
                            <div className="grid grid-cols-3 gap-2 pt-2">
                                <div className="flex flex-col items-center text-center gap-1 py-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <Truck className="w-5 h-5 text-yellow-600" />
                                    <span className="text-[11px] text-gray-600 font-medium leading-tight">
                                        Free
                                        <br />
                                        Shipping
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1 py-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <Shield className="w-5 h-5 text-yellow-600" />
                                    <span className="text-[11px] text-gray-600 font-medium leading-tight">
                                        1 Year
                                        <br />
                                        Warranty
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1 py-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <RotateCcw className="w-5 h-5 text-yellow-600" />
                                    <span className="text-[11px] text-gray-600 font-medium leading-tight">
                                        7 Day
                                        <br />
                                        Return
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
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
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
                                    <span className="text-3xl md:text-4xl font-bold text-gray-900">
                                        ₹{product.price.toLocaleString()}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-base text-gray-400 line-through">
                                            M.R.P: ₹{product.originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                                {product.discount && product.discount > 0 && product.originalPrice && (
                                    <p className="text-sm text-green-700 font-medium">
                                        You save ₹
                                        {(product.originalPrice - product.price).toLocaleString()}{" "}
                                        on this order
                                    </p>
                                )}
                                {product.stockQuantity && (
                                    <p className="text-xs text-gray-400">
                                        {product.stockQuantity} units available
                                    </p>
                                )}
                            </div>

                            {/* Bank offers */}
                            <div className="bg-yellow-50/60 border border-yellow-200/70 rounded-xl p-4 space-y-2.5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <Tag className="w-4 h-4 text-yellow-600" />
                                    Available Offers
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>
                                        10% instant discount on select bank cards, up to ₹1,500
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>No cost EMI available on orders above ₹3,000</span>
                                </div>
                            </div>

                            {/* Tabs - Description & Specifications */}
                            <div>
                                <div className="flex gap-6 border-b border-gray-200">
                                    {["description", "specifications"].map((tab) => (
                                        <button
                                            key={tab}
                                            className={`py-2 text-sm font-semibold transition-all relative ${
                                                activeTab === tab
                                                    ? "text-gray-900"
                                                    : "text-gray-400 hover:text-gray-600"
                                            }`}
                                            onClick={() => setActiveTab(tab)}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            {activeTab === tab && (
                                                <motion.div
                                                    layoutId="tab-underline-side"
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
                                        className="py-4"
                                    >
                                        {activeTab === "description" && (
                                            <p className="text-gray-600 leading-relaxed text-sm">
                                                {product.description ||
                                                    "Premium quality product with exceptional design and craftsmanship."}
                                            </p>
                                        )}
                                        {activeTab === "specifications" && specData ? (
                                            <div className="space-y-2">
                                                {Object.entries(specData).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex justify-between py-2 border-b border-gray-100 text-sm"
                                                    >
                                                        <span className="text-gray-500">{key}</span>
                                                        <span className="text-gray-900 font-medium">
                                                            {String(value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {[
                                                    ["Product Code", product.productCode || "N/A"],
                                                    ["Category", product.category || "Uncategorized"],
                                                    ["Price", `₹${product.price.toLocaleString()}`],
                                                    [
                                                        "Availability",
                                                        product.inStock ? "In Stock" : "Out of Stock",
                                                    ],
                                                    ["Stock Quantity", product.stockQuantity || 0],
                                                    ["Rating", `${product.rating} / 5`],
                                                    ["Reviews", `${product.reviews} reviews`],
                                                    ["Warranty", "1 Year"],
                                                    ["Return Policy", "7 Days"],
                                                ].map(([label, value]) => (
                                                    <div
                                                        key={label}
                                                        className="flex justify-between py-2 border-b border-gray-100 text-sm"
                                                    >
                                                        <span className="text-gray-500">{label}</span>
                                                        <span className="text-gray-900 font-medium">
                                                            {value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Quantity & Actions */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-sm font-medium text-gray-700">
                                        Quantity
                                    </span>
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                        <button
                                            className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                            onClick={() => handleQuantityChange("decrement")}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-medium">
                                            {quantity}
                                        </span>
                                        <button
                                            className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                            onClick={() => handleQuantityChange("increment")}
                                            disabled={quantity >= 10}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="flex items-center gap-2 text-sm ml-auto">
                                        <span
                                            className={`w-2 h-2 rounded-full ${
                                                product.inStock ? "bg-green-500 animate-pulse" : "bg-red-500"
                                            }`}
                                        />
                                        <span
                                            className={`font-medium ${
                                                product.inStock ? "text-green-600" : "text-red-600"
                                            }`}
                                        >
                                            {product.inStock ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileHover={{ scale: product.inStock ? 1.01 : 1 }}
                                        whileTap={{ scale: product.inStock ? 0.98 : 1 }}
                                        className={`flex-1 py-3.5 rounded-xl font-semibold transition-all relative overflow-hidden ${
                                            product.inStock
                                                ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:shadow-xl"
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
                                                    Added to Cart
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
                                                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>

                                    {product.inStock && (
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1 py-3.5 rounded-xl font-semibold bg-yellow-400 text-gray-900 hover:bg-yellow-300 hover:shadow-xl transition-all"
                                        >
                                            Buy Now
                                        </motion.button>
                                    )}

                                    <button className="p-3.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex-shrink-0">
                                        <Share2 className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 mt-2">
                                {[
                                    "Premium Quality Material",
                                    "Elegant Design",
                                    "Durable Construction",
                                    "Satisfaction Guaranteed",
                                ].map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 text-sm text-gray-600 pt-3"
                                    >
                                        <CheckCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Customer Reviews
                    </h3>
                    <div className="flex flex-col md:flex-row gap-10 max-w-3xl">
                        <div className="flex flex-col items-center md:items-start gap-2 flex-shrink-0">
                            <span className="text-5xl font-bold text-gray-900">
                                {product.rating}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${
                                            i < Math.floor(product.rating)
                                                ? "fill-yellow-500"
                                                : "fill-gray-200 text-gray-200"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">
                                {product.reviews?.toLocaleString()} global ratings
                            </span>
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            {ratingBreakdown.map((r) => (
                                <div key={r.stars} className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-600 w-12">{r.stars} star</span>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full"
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
                </div>

                {/* Similar Products - Auto Slider */}
                {similarProducts.length > 0 && (
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                <h2 className="text-xl font-bold text-gray-900">
                                    Similar Products
                                </h2>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full animate-pulse">
                                    Auto-scroll
                                </span>
                            </div>
                            <Link
                                href="/products"
                                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
                            >
                                View All
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Slider Container */}
                        <div className="relative">
                            <div
                                ref={sliderRef}
                                className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
                                style={{
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                }}
                            >
                                {[
                                    ...similarProducts,
                                ].map((similar, index) => (
                                    <div
                                        key={`${similar.id}-${index}`}
                                        className="flex-shrink-0 w-[200px] sm:w-[220px] relative"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                y: 0,
                                                transition: {
                                                    delay: (index % similarProducts.length) * 0.05,
                                                },
                                            }}
                                            whileHover={{
                                                y: -8,
                                                scale: 1.03,
                                                transition: {
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 20,
                                                },
                                            }}
                                            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                                        >
                                            <Link href={`/product/${similar.slug}`}>
                                                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                                    <Image
                                                        src={similar.image || "/images/placeholder.jpg"}
                                                        alt={similar.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    {similar.discount && similar.discount > 0 && (
                                                        <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                                            -{similar.discount}%
                                                        </span>
                                                    )}

                                                    {similar.inStock ? (
                                                        <span className="absolute bottom-2 left-2 bg-green-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                                                            In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="absolute bottom-2 left-2 bg-red-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                                                        {similar.category || "Uncategorized"}
                                                    </div>
                                                    <h3 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-yellow-600 transition-colors">
                                                        {similar.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-base font-bold text-gray-900">
                                                            ₹{similar.price.toLocaleString()}
                                                        </span>
                                                        {similar.originalPrice && (
                                                            <span className="text-xs text-gray-400 line-through">
                                                                ₹{similar.originalPrice.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-yellow-500 text-xs">
                                                                {renderRatingStars(similar.rating)}
                                                            </span>
                                                            <span className="text-gray-400 text-[10px]">
                                                                ({similar.reviews})
                                                            </span>
                                                        </div>
                                                        <motion.button
                                                            className="p-1.5 bg-yellow-400 rounded-full text-gray-900 hover:bg-yellow-300 transition-colors"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onMouseEnter={(e) => {
                                                                e.preventDefault();
                                                                handleCartIconHover(similar, e);
                                                            }}
                                                            onMouseLeave={handlePopupLeave}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePopupAddToCart();
                                                            }}
                                                        >
                                                            <ShoppingCart className="w-4 h-4" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>

                            {/* Gradient overlays */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
                        </div>

                        {/* Scroll indicators */}
                        <div className="flex justify-center gap-1.5 mt-3">
                            {similarProducts.slice(0, 6).map((_, index) => (
                                <div
                                    key={index}
                                    className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 animate-pulse"
                                    style={{ animationDelay: `${index * 0.2}s` }}
                                />
                            ))}
                            <span className="text-[10px] text-gray-400 ml-2 flex items-center gap-1">
                                <span>◀</span> scrolling <span>▶</span>
                            </span>
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
                        className="fixed z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
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
                                    <span className="font-semibold text-gray-900 text-sm">
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
                                        src={hoverPopupData.image || "/images/placeholder.jpg"}
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
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                                        {hoverPopupData.category || "Uncategorized"}
                                    </div>
                                    <h4 className="font-medium text-gray-900 text-sm truncate">
                                        {hoverPopupData.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-base font-bold text-gray-900">
                                            ₹{hoverPopupData.price.toLocaleString()}
                                        </span>
                                        {hoverPopupData.originalPrice && (
                                            <span className="text-[10px] text-gray-400 line-through">
                                                ₹{hoverPopupData.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-yellow-500 text-[10px]">
                                            {renderRatingStars(hoverPopupData.rating)}
                                        </span>
                                        <span className="text-gray-400 text-[8px]">
                                            ({hoverPopupData.reviews})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                <span className="text-sm text-gray-500">Quantity</span>
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                        onClick={() => handlePopupQuantityChange("decrement")}
                                        disabled={popupQuantity <= 1}
                                    >
                                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-medium">
                                        {popupQuantity}
                                    </span>
                                    <button
                                        className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                        onClick={() => handlePopupQuantityChange("increment")}
                                        disabled={popupQuantity >= 10}
                                    >
                                        <PlusIcon className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Subtotal */}
                            <div className="flex justify-between items-center mt-3 py-2 border-t border-gray-100">
                                <span className="text-sm text-gray-500">Subtotal</span>
                                <span className="text-lg font-bold text-gray-900">
                                    ₹{(hoverPopupData.price * popupQuantity).toLocaleString()}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 mt-3">
                                <button
                                    className="w-full py-2.5 bg-yellow-400 text-gray-900 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                                    onClick={handlePopupAddToCart}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                </button>
                                <button
                                    className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                    onClick={handlePopupLeave}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Popup Footer */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
                            <span className="text-[10px] text-gray-400">
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
            <Footer />
        </div>
    );
}