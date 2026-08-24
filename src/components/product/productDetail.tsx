"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    Star,
    Heart,
    Truck,
    Shield,
    RotateCcw,
    Minus,
    Plus,
    CheckCircle,
    ArrowLeft,
    ShoppingBag,
    BadgeCheck,
    ChevronRight,
    ChevronDown,
    X,
    ShoppingCart,
    Plus as PlusIcon,
} from "lucide-react";

import Footer from "../Footer/Footer";

import {
    useGetProductBySlugQuery,
    useGetProductsByCategoryQuery,
} from "@/lib/redux/api/productApi";

import {
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
    useGetWishlistQuery,
} from "@/lib/redux/api/Wishlist/wishlistApi";

import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "../../lib/slices/toastSlice";
import Header from "../common/Header";
import { Marcellus } from "next/font/google";
import Loader from "../ui/Spinner/Loader";

const marcellus = Marcellus({
    subsets: ["latin"],
    weight: "400",
});

interface ProductDetailProps {
    productSlug: string;
}

interface CartItem {
    id: number;
    name: string;
    image: string;
    price: number;
    originalPrice?: number | null;
    quantity: number;
}

/* ============================================================
   MICRO INTERACTIONS
============================================================ */

const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fireRipple(e: React.MouseEvent<HTMLElement>) {
    if (prefersReduced()) return;

    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    const span = document.createElement("span");

    span.className = "ik-ripple";
    span.style.left = `${e.clientX - rect.left - 7}px`;
    span.style.top = `${e.clientY - rect.top - 7}px`;

    btn.appendChild(span);

    setTimeout(() => span.remove(), 700);
}

function flyImageToCart(
    sourceEl: HTMLElement | null,
    imgSrc: string,
) {
    if (prefersReduced() || !sourceEl) return;

    const target = document.querySelector(
        "#cart-icon",
    ) as HTMLElement | null;

    const a = sourceEl.getBoundingClientRect();

    const b = target
        ? target.getBoundingClientRect()
        : ({
            left: window.innerWidth - 60,
            top: 20,
            width: 24,
            height: 24,
        } as DOMRect);

    const ghost = document.createElement("div");

    ghost.className = "ik-fly-ghost";

    ghost.style.left = `${a.left}px`;
    ghost.style.top = `${a.top}px`;
    ghost.style.width = `${a.width}px`;
    ghost.style.height = `${a.height}px`;
    ghost.style.backgroundImage = `url(${imgSrc})`;

    document.body.appendChild(ghost);

    const dx =
        b.left -
        a.left +
        b.width / 2 -
        a.width / 2;

    const dy =
        b.top -
        a.top +
        b.height / 2 -
        a.height / 2;

    const anim = ghost.animate(
        [
            {
                transform: "translate(0,0) scale(1)",
                opacity: 1,
            },
            {
                transform: `translate(
                    ${dx * 0.5}px,
                    ${dy * 0.35 - 90}px
                ) scale(.6)`,
                opacity: 0.95,
                offset: 0.55,
            },
            {
                transform: `translate(${dx}px, ${dy}px) scale(.06)`,
                opacity: 0,
            },
        ],
        {
            duration: 900,
            easing: "cubic-bezier(.5,-.2,.35,1)",
        },
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

/* ============================================================
   COMPONENT
============================================================ */

export default function ProductDetail({
    productSlug,
}: ProductDetailProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();

    /* ============================================================
       BASIC STATE
    ============================================================ */

    const [quantity, setQuantity] = useState(1);

    const [isWishlisted, setIsWishlisted] =
        useState(false);

    const [isAddedToCart, setIsAddedToCart] =
        useState(false);

    /*
      IMPORTANT:
      Empty string = everything collapsed
    */
    const [activeTab, setActiveTab] =
        useState("");

    const [activeImage, setActiveImage] =
        useState(0);

    const [
        hoveredSimilar,
        setHoveredSimilar,
    ] = useState<number | null>(null);

    const [hoverPopupData, setHoverPopupData] =
        useState<any>(null);

    const [popupPosition, setPopupPosition] =
        useState({
            x: 0,
            y: 0,
        });

    const [popupQuantity, setPopupQuantity] =
        useState(1);

    const [isWishlistLoading, setIsWishlistLoading] =
        useState(false);

    const [wishlistState, setWishlistState] =
        useState<Record<number, boolean>>({});

    const mainImageBoxRef =
        useRef<HTMLDivElement>(null);

    const sliderRef =
        useRef<HTMLDivElement>(null);

    const [cartItems, setCartItems] =
        useState<CartItem[]>([]);

    /* ============================================================
       COLOR & SIZE STATE
    ============================================================ */

    const [selectedColor, setSelectedColor] =
        useState("Rust");

    const [selectedSize, setSelectedSize] =
        useState("M");

    const colorOptions = [
        {
            name: "Beige",
            value: "#D9C79F",
        },
        {
            name: "Olive",
            value: "#68724A",
        },
        {
            name: "Rust",
            value: "#A65D40",
        },
    ];

    const sizeOptions = [
        "S",
        "M",
        "L",
        "XL",
        "XXL",
    ];

    /* ============================================================
       API
    ============================================================ */

    const {
        data: productData,
        isLoading: isProductLoading,
        error,
    } = useGetProductBySlugQuery(productSlug, {
        skip: !productSlug,
    });

    const {
        data: wishlistData,
        refetch: refetchWishlist,
    } = useGetWishlistQuery();

    const categoryId =
        productData?.data?.category_id ||
        productData?.category_id ||
        null;

    const {
        data: categoryProductsData,
    } = useGetProductsByCategoryQuery(
        categoryId,
        {
            skip: !categoryId,
        },
    );

    const [addToWishlist] =
        useAddToWishlistMutation();

    const [removeFromWishlist] =
        useRemoveFromWishlistMutation();

    const [addToCart] =
        useAddToCartMutation();

    const apiProduct =
        productData?.data ?? productData;

    /* ============================================================
       PRODUCT NORMALIZATION
    ============================================================ */

    const product = apiProduct
        ? {
            id: apiProduct.id,

            name: apiProduct.name,

            slug: apiProduct.slug,

            description:
                apiProduct.description,

            specification:
                apiProduct.specification,

            category:
                apiProduct.category?.name ||
                "Uncategorized",

            categoryId:
                apiProduct.category_id ||
                apiProduct.category?.id,

            productCode:
                apiProduct.product_code,

            retailPrice:
                Number(
                    apiProduct.retail_price || 0,
                ),

            distributorPrice:
                Number(
                    apiProduct.distributor_price || 0,
                ),

            price:
                Number(
                    apiProduct.retail_price || 0,
                ),

            originalPrice:
                Number(
                    apiProduct.distributor_price || 0,
                ) >
                    Number(
                        apiProduct.retail_price || 0,
                    )
                    ? Number(
                        apiProduct.distributor_price,
                    )
                    : null,

            discount:
                Number(
                    apiProduct.distributor_price || 0,
                ) >
                    Number(
                        apiProduct.retail_price || 0,
                    )
                    ? Math.round(
                        ((Number(
                            apiProduct.distributor_price,
                        ) -
                            Number(
                                apiProduct.retail_price,
                            )) /
                            Number(
                                apiProduct.distributor_price,
                            )) *
                        100,
                    )
                    : null,

            image:
                apiProduct.primary_image_url ||
                apiProduct.images?.[0]?.image_url ||
                "/indiekonnect-web/images/placeholder.jpg",

            images:
                apiProduct.images || [],

            rating: 4.8,

            reviews: 214,

            inStock:
                apiProduct.status === "active" &&
                Number(
                    apiProduct.stock_quantity,
                ) > 0,

            stockQuantity:
                Number(
                    apiProduct.stock_quantity || 0,
                ),

            lowStockThreshold:
                Number(
                    apiProduct.low_stock_threshold ||
                    10,
                ),

            isPublished:
                apiProduct.is_published,

            status:
                apiProduct.status,

            isWishlisted:
                apiProduct.is_wishlisted ||
                false,

            taxCategoryId:
                apiProduct.tax_category_id,

            createdAt:
                apiProduct.created_at,

            updatedAt:
                apiProduct.updated_at,
        }
        : null;

    /* ============================================================
       WISHLIST STATE
    ============================================================ */

    useEffect(() => {
        if (
            wishlistData?.data &&
            product?.id
        ) {
            const exists =
                wishlistData.data.some(
                    (item: any) =>
                        item.product_id ===
                        product.id,
                );

            setIsWishlisted(exists);
        }
    }, [
        wishlistData,
        product?.id,
    ]);

    useEffect(() => {
        if (wishlistData?.data) {
            const map: Record<
                number,
                boolean
            > = {};

            wishlistData.data.forEach(
                (item: any) => {
                    map[item.product_id] =
                        true;
                },
            );

            setWishlistState(map);
        }
    }, [wishlistData]);

    /* ============================================================
       SIMILAR PRODUCTS
    ============================================================ */

    const similarProducts =
        Array.isArray(
            categoryProductsData?.data,
        )
            ? categoryProductsData.data
                .slice(0, 12)
                .map((p: any) => ({
                    id: p.id,

                    name: p.name,

                    slug: p.slug,

                    category:
                        p.category?.name ||
                        "Uncategorized",

                    price:
                        Number(
                            p.retail_price || 0,
                        ),

                    originalPrice:
                        Number(
                            p.distributor_price ||
                            0,
                        ) >
                            Number(
                                p.retail_price ||
                                0,
                            )
                            ? Number(
                                p.distributor_price,
                            )
                            : null,

                    discount:
                        Number(
                            p.distributor_price ||
                            0,
                        ) >
                            Number(
                                p.retail_price ||
                                0,
                            )
                            ? Math.round(
                                ((Number(
                                    p.distributor_price,
                                ) -
                                    Number(
                                        p.retail_price,
                                    )) /
                                    Number(
                                        p.distributor_price,
                                    )) *
                                100,
                            )
                            : null,

                    image:
                        p.primary_image_url ||
                        p.images?.find(
                            (img: any) =>
                                img.is_primary,
                        )?.image_url ||
                        p.images?.[0]
                            ?.image_url ||
                        "/indiekonnect-web/images/placeholder.jpg",

                    rating: 4.5,

                    reviews: 120,

                    inStock:
                        (p.status ===
                            "active" ||
                            p.stock_status ===
                            "active") &&
                        Number(
                            p.stock_quantity,
                        ) > 0,

                    stockQuantity:
                        Number(
                            p.stock_quantity ||
                            0,
                        ),
                }))
            : [];

    /* ============================================================
       AUTO SCROLL
    ============================================================ */

    useEffect(() => {
        const slider =
            sliderRef.current;

        if (
            !slider ||
            similarProducts.length === 0
        ) {
            return;
        }

        let scrollAmount = 0;

        const scrollSpeed = 0.8;

        let animationId: number;

        let isPaused = false;

        const autoScroll = () => {
            if (!slider || isPaused) {
                animationId =
                    requestAnimationFrame(
                        autoScroll,
                    );

                return;
            }

            const maxScroll =
                slider.scrollWidth -
                slider.clientWidth;

            if (
                scrollAmount >=
                maxScroll
            ) {
                scrollAmount = 0;

                slider.scrollLeft = 0;
            } else {
                scrollAmount +=
                    scrollSpeed;

                slider.scrollLeft =
                    scrollAmount;
            }

            animationId =
                requestAnimationFrame(
                    autoScroll,
                );
        };

        animationId =
            requestAnimationFrame(
                autoScroll,
            );

        const pause = () => {
            isPaused = true;

            cancelAnimationFrame(
                animationId,
            );
        };

        const resume = () => {
            isPaused = false;

            animationId =
                requestAnimationFrame(
                    autoScroll,
                );
        };

        slider.addEventListener(
            "mouseenter",
            pause,
        );

        slider.addEventListener(
            "mouseleave",
            resume,
        );

        slider.addEventListener(
            "touchstart",
            pause,
        );

        slider.addEventListener(
            "touchend",
            resume,
        );

        return () => {
            cancelAnimationFrame(
                animationId,
            );

            slider.removeEventListener(
                "mouseenter",
                pause,
            );

            slider.removeEventListener(
                "mouseleave",
                resume,
            );

            slider.removeEventListener(
                "touchstart",
                pause,
            );

            slider.removeEventListener(
                "touchend",
                resume,
            );
        };
    }, [similarProducts]);

    /* ============================================================
       QUANTITY
    ============================================================ */

    const handleQuantityChange = (
        type:
            | "increment"
            | "decrement",
    ) => {
        if (type === "increment") {
            setQuantity((prev) =>
                Math.min(
                    prev + 1,
                    Math.min(
                        product?.stockQuantity ||
                        10,
                        10,
                    ),
                ),
            );
        } else {
            setQuantity((prev) =>
                Math.max(
                    prev - 1,
                    1,
                ),
            );
        }
    };

    const handlePopupQuantityChange = (
        type:
            | "increment"
            | "decrement",
    ) => {
        if (type === "increment") {
            setPopupQuantity((prev) =>
                Math.min(prev + 1, 10),
            );
        } else {
            setPopupQuantity((prev) =>
                Math.max(prev - 1, 1),
            );
        }
    };

    /* ============================================================
       WISHLIST
    ============================================================ */

    const handleWishlistToggle =
        async (
            e?: React.MouseEvent<HTMLElement>,
        ) => {
            if (
                !product ||
                isWishlistLoading
            ) {
                return;
            }

            if (e) {
                popHeart(e);
            }

            setIsWishlistLoading(true);

            try {
                if (isWishlisted) {
                    await removeFromWishlist(
                        {
                            product_id:
                                product.id,
                        },
                    ).unwrap();

                    setIsWishlisted(false);

                    dispatch(
                        showToast({
                            message:
                                `${product.name} removed from wishlist`,
                            type: "info",
                        }),
                    );
                } else {
                    await addToWishlist(
                        {
                            product_id:
                                product.id,
                        },
                    ).unwrap();

                    setIsWishlisted(true);

                    dispatch(
                        showToast({
                            message:
                                `${product.name} added to wishlist! ❤️`,
                            type: "success",
                        }),
                    );
                }

                await refetchWishlist();
            } catch (error: any) {
                dispatch(
                    showToast({
                        message:
                            error?.data?.message ||
                            "Failed to update wishlist",
                        type: "error",
                    }),
                );
            } finally {
                setIsWishlistLoading(false);
            }
        };

    const toggleWishlist =
        async (
            productId: number,
        ) => {
            try {
                const exists =
                    wishlistState[
                    productId
                    ] || false;

                if (exists) {
                    await removeFromWishlist(
                        {
                            product_id:
                                productId,
                        },
                    ).unwrap();

                    setWishlistState(
                        (prev) => ({
                            ...prev,
                            [productId]:
                                false,
                        }),
                    );

                    dispatch(
                        showToast({
                            message:
                                "Removed from wishlist",
                            type: "info",
                        }),
                    );
                } else {
                    await addToWishlist(
                        {
                            product_id:
                                productId,
                        },
                    ).unwrap();

                    setWishlistState(
                        (prev) => ({
                            ...prev,
                            [productId]:
                                true,
                        }),
                    );

                    dispatch(
                        showToast({
                            message:
                                "Added to wishlist! ❤️",
                            type: "success",
                        }),
                    );
                }

                await refetchWishlist();
            } catch (error: any) {
                dispatch(
                    showToast({
                        message:
                            error?.data?.message ||
                            "Failed to update wishlist",
                        type: "error",
                    }),
                );
            }
        };

    /* ============================================================
       LOCAL CART
    ============================================================ */

    const addToCartLocal = (
        item: any,
        qty: number = 1,
    ) => {
        setCartItems((prev) => {
            const existing =
                prev.find(
                    (c) =>
                        c.id === item.id,
                );

            if (existing) {
                return prev.map((c) =>
                    c.id === item.id
                        ? {
                            ...c,
                            quantity:
                                Math.min(
                                    c.quantity +
                                    qty,
                                    10,
                                ),
                        }
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
                    originalPrice:
                        item.originalPrice,
                    quantity: qty,
                },
            ];
        });
    };

    /* ============================================================
       ADD TO CART
    ============================================================ */

    const handleAddToCart =
        async (
            e?: React.MouseEvent<HTMLElement>,
        ) => {
            if (
                !product ||
                !product.inStock
            ) {
                return;
            }

            if (e) {
                fireRipple(e);

                flyImageToCart(
                    mainImageBoxRef.current,
                    gallery[
                    activeImage
                    ] ||
                    product.image,
                );
            }

            try {
                /*
                 * Existing backend payload is preserved.
                 * Color and Size are currently UI selections.
                 */
                await addToCart({
                    product_id:
                        product.id,
                    quantity,
                }).unwrap();

                addToCartLocal(
                    product,
                    quantity,
                );

                setIsAddedToCart(true);

                dispatch(
                    showToast({
                        message:
                            `${product.name} added to cart successfully! 🛒`,
                        type: "success",
                    }),
                );

                setTimeout(
                    () =>
                        setIsAddedToCart(
                            false,
                        ),
                    3000,
                );
            } catch (error: any) {
                dispatch(
                    showToast({
                        message:
                            error?.data?.message ||
                            "Failed to add item to cart",
                        type: "error",
                    }),
                );
            }
        };

    /* ============================================================
       BUY NOW
    ============================================================ */

    const handleBuyNow = () => {
        if (
            !product ||
            !product.inStock
        ) {
            return;
        }

        const params =
            new URLSearchParams({
                product_id:
                    String(product.id),

                quantity:
                    String(quantity),
            });

        router.push(
            `/checkout?${params.toString()}`,
        );
    };

    /* ============================================================
       QUICK ADD
    ============================================================ */

    const handleCartIconHover = (
        similar: any,
        event: React.MouseEvent,
    ) => {
        const rect =
            (
                event.currentTarget as HTMLElement
            ).getBoundingClientRect();

        setPopupPosition({
            x:
                rect.left +
                rect.width / 2,

            y: rect.top - 10,
        });

        setHoverPopupData(
            similar,
        );

        setHoveredSimilar(
            similar.id,
        );

        setPopupQuantity(1);
    };

    const handlePopupLeave =
        () => {
            setHoverPopupData(null);

            setHoveredSimilar(null);
        };

    const handlePopupAddToCart =
        async (
            e?: React.MouseEvent<HTMLElement>,
        ) => {
            if (!hoverPopupData) {
                return;
            }

            if (e) {
                fireRipple(e);
            }

            try {
                await addToCart({
                    product_id:
                        hoverPopupData.id,

                    quantity:
                        popupQuantity,
                }).unwrap();

                addToCartLocal(
                    hoverPopupData,
                    popupQuantity,
                );

                dispatch(
                    showToast({
                        message:
                            `${hoverPopupData.name} added to cart! 🛒`,
                        type: "success",
                    }),
                );

                handlePopupLeave();
            } catch (error: any) {
                dispatch(
                    showToast({
                        message:
                            error?.data?.message ||
                            "Failed to add item to cart",
                        type: "error",
                    }),
                );
            }
        };

    /* ============================================================
       LOADING
    ============================================================ */

    if (isProductLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FAF9F7]">
                <Loader
                    width={200}
                    height={200}
                />
            </div>
        );
    }

    /* ============================================================
       ERROR
    ============================================================ */

    if (error || !product) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F7]">
                <div className="mx-auto max-w-md px-4 text-center">
                    <div className="mb-4 text-6xl">
                        🔍
                    </div>

                    <h2 className="mb-3 text-2xl font-bold text-[#071A41]">
                        Product Not Found
                    </h2>

                    <p className="mb-6 text-gray-500">
                        The product you're
                        looking for doesn't
                        exist or may have been
                        removed.
                    </p>

                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <button
                            onClick={() =>
                                router.back()
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D9D4C9] px-6 py-3 font-semibold text-[#071A41] transition hover:bg-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </button>

                        <Link
                            href="/products"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071A41] px-6 py-3 font-semibold text-white transition hover:bg-[#10285C]"
                        >
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    /* ============================================================
       GALLERY
    ============================================================ */

    const gallery =
        product.images &&
            product.images.length > 0
            ? product.images
                .map(
                    (img: any) =>
                        img.image_url ||
                        img.image,
                )
                .filter(Boolean)
            : [product.image];

    /* ============================================================
       RATINGS
    ============================================================ */

    const ratingBreakdown = [
        {
            stars: 5,
            pct: 68,
        },
        {
            stars: 4,
            pct: 20,
        },
        {
            stars: 3,
            pct: 7,
        },
        {
            stars: 2,
            pct: 3,
        },
        {
            stars: 1,
            pct: 2,
        },
    ];

    const renderRatingStars = (
        rating: number,
    ) => {
        const fullStars =
            Math.floor(rating);

        const emptyStars =
            5 - fullStars;

        return (
            "★".repeat(fullStars) +
            "☆".repeat(emptyStars)
        );
    };

    /* ============================================================
       SPECIFICATION
    ============================================================ */

    const parseSpecification = (
        spec: any,
    ) => {
        if (!spec) {
            return null;
        }

        if (typeof spec === "string") {
            try {
                return JSON.parse(spec);
            } catch {
                return null;
            }
        }

        return spec;
    };

    const specData =
        parseSpecification(
            product.specification,
        );

    const specRows: [
        string,
        string | number,
    ][] = specData
            ? (
                Object.entries(
                    specData,
                ) as [string, any][]
            ).map(
                ([key, value]) => [
                    key
                        .replace(
                            /_/g,
                            " ",
                        )
                        .replace(
                            /\b\w/g,
                            (char) =>
                                char.toUpperCase(),
                        ),
                    String(value),
                ],
            )
            : [
                [
                    "Product Type",
                    product.category ||
                    "Uncategorized",
                ],
                [
                    "Product Code",
                    product.productCode ||
                    "N/A",
                ],
                [
                    "Availability",
                    product.inStock
                        ? "In Stock"
                        : "Out of Stock",
                ],
                [
                    "Stock Quantity",
                    product.stockQuantity ||
                    0,
                ],
                [
                    "Rating",
                    `${product.rating} / 5`,
                ],
                [
                    "Warranty",
                    "1 Year Warranty",
                ],
                [
                    "Return Policy",
                    "7 Days Return",
                ],
                [
                    "Assembly",
                    "Minor Assembly Required",
                ],
            ];

    /* ============================================================
       SPEC TABLE
    ============================================================ */

    const renderSpecTable =
        () => (
            <div className="overflow-hidden rounded-xl border border-[#E5E0D7] bg-[#FAF9F7]">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {specRows.map(
                        (
                            [label, value],
                            index,
                        ) => (
                            <div
                                key={
                                    label
                                }
                                className={`flex items-center justify-between gap-5 border-b border-[#E9E5DD] px-4 py-3.5 text-[11px] ${index %
                                    2 ===
                                    0
                                    ? "bg-white"
                                    : "bg-[#FAF9F7]"
                                    }`}
                            >
                                <span className="font-medium text-[#7A8497]">
                                    {
                                        label
                                    }
                                </span>

                                <span className="text-right font-semibold text-[#071A41]">
                                    {
                                        value
                                    }
                                </span>
                            </div>
                        ),
                    )}
                </div>
            </div>
        );

    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <div className="min-h-screen bg-white font-sans text-[#17213F]">

            <Header />

            <main className="mx-auto w-full max-w-[1380px] px-4 pb-16 sm:px-6 lg:px-8 xl:px-10">

                {/* =====================================================
                    BREADCRUMB
                ===================================================== */}

                <nav className="flex items-center gap-2 py-4 text-[10px] text-[#8A92A3] sm:text-[11px]">

                    <Link
                        href="/"
                        className="transition hover:text-[#071A41]"
                    >
                        IndieKonnect
                    </Link>

                    <ChevronRight className="h-3 w-3 text-[#C7BFAF]" />

                    <Link
                        href="/products"
                        className="transition hover:text-[#071A41]"
                    >
                        {product.category ||
                            "Products"}
                    </Link>

                    <ChevronRight className="h-3 w-3 text-[#C7BFAF]" />

                    <span className="max-w-[220px] truncate text-[#071A41]">
                        {product.name}
                    </span>

                </nav>

                {/* =====================================================
                    PRODUCT HERO
                ===================================================== */}

                <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,.92fr)] xl:gap-14">

                    {/* =================================================
                        LEFT PRODUCT GALLERY
                    ================================================= */}

                    <div className="min-w-0">

                        <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-4 sm:grid-cols-[86px_minmax(0,1fr)]">

                            {/* =========================================
                                VERTICAL THUMBNAILS
                            ========================================= */}

                            <div className="hidden max-h-[650px] flex-col gap-3 overflow-y-auto pr-1 sm:flex hide-scrollbar">

                                {gallery.map(
                                    (
                                        img: string,
                                        index: number,
                                    ) => (
                                        <button
                                            key={
                                                index
                                            }
                                            type="button"
                                            onClick={() =>
                                                setActiveImage(
                                                    index,
                                                )
                                            }
                                            className={`group relative h-[76px] w-[76px] flex-shrink-0 overflow-hidden rounded-xl border bg-[#F8F6F1] transition-all sm:h-[82px] sm:w-[82px] ${activeImage ===
                                                index
                                                ? "border-[#C89B3C] ring-2 ring-[#C89B3C]/20"
                                                : "border-[#E5E0D7] hover:border-[#C8A85C]"
                                                }`}
                                        >

                                            <Image
                                                src={
                                                    img ||
                                                    "/indiekonnect-web/images/placeholder.jpg"
                                                }
                                                alt={`${product.name} ${index + 1}`}
                                                fill
                                                sizes="82px"
                                                className="object-cover transition duration-300 group-hover:scale-105"
                                            />

                                            {activeImage ===
                                                index && (
                                                    <div className="absolute inset-0 rounded-xl border-2 border-[#C89B3C]" />
                                                )}

                                        </button>
                                    ),
                                )}

                            </div>

                            {/* =========================================
                                MOBILE THUMBNAILS
                            ========================================= */}

                            <div className="col-span-2 flex gap-2.5 overflow-x-auto pb-1 sm:hidden hide-scrollbar">

                                {gallery.map(
                                    (
                                        img: string,
                                        index: number,
                                    ) => (
                                        <button
                                            key={
                                                index
                                            }
                                            type="button"
                                            onClick={() =>
                                                setActiveImage(
                                                    index,
                                                )
                                            }
                                            className={`relative h-[64px] w-[64px] flex-shrink-0 overflow-hidden rounded-lg border-2 bg-[#F8F6F1] ${activeImage ===
                                                index
                                                ? "border-[#C89B3C]"
                                                : "border-transparent"
                                                }`}
                                        >

                                            <Image
                                                src={
                                                    img ||
                                                    "/indiekonnect-web/images/placeholder.jpg"
                                                }
                                                alt={`${product.name} ${index + 1}`}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />

                                        </button>
                                    ),
                                )}

                            </div>

                            {/* =========================================
                                MAIN IMAGE
                            ========================================= */}

                            <div
                                ref={
                                    mainImageBoxRef
                                }
                                className="relative aspect-square min-w-0 overflow-hidden rounded-[22px] border border-[#E9E4DA] bg-[#F7F4EE]"
                            >

                                <AnimatePresence mode="wait">

                                    <motion.div
                                        key={
                                            activeImage
                                        }
                                        initial={{
                                            opacity: 0,
                                            scale: 0.985,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                        }}
                                        transition={{
                                            duration:
                                                0.25,
                                        }}
                                        className="absolute inset-0"
                                    >

                                        <Image
                                            src={
                                                gallery[
                                                activeImage
                                                ] ||
                                                product.image
                                            }
                                            alt={
                                                product.name
                                            }
                                            fill
                                            priority
                                            sizes="(max-width: 1024px) 100vw, 55vw"
                                            className="object-cover"
                                        />

                                    </motion.div>

                                </AnimatePresence>

                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/10 to-transparent" />

                                {/* Bestseller */}

                                {product.rating >=
                                    4.5 && (
                                        <span className="absolute left-4 top-4 rounded-full bg-[#071A41] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-lg">
                                            Bestseller
                                        </span>
                                    )}

                                {/* Discount */}

                                {product.discount &&
                                    product.discount >
                                    0 &&
                                    product.inStock && (
                                        <span className="absolute bottom-4 left-4 rounded-full border border-[#C89B3C]/30 bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#126B3A] shadow-md backdrop-blur">
                                            {
                                                product.discount
                                            }
                                            % OFF
                                        </span>
                                    )}

                                {/* Wishlist */}

                                <button
                                    type="button"
                                    onClick={
                                        handleWishlistToggle
                                    }
                                    disabled={
                                        isWishlistLoading
                                    }
                                    aria-label="Add to wishlist"
                                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/95 shadow-lg backdrop-blur transition hover:scale-105"
                                >

                                    <Heart
                                        className={`h-[18px] w-[18px] ${isWishlisted
                                            ? "fill-red-500 text-red-500"
                                            : "text-[#071A41]"
                                            }`}
                                    />

                                </button>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        RIGHT PRODUCT INFORMATION
                    ================================================= */}

                    <div className="min-w-0 lg:pt-1">

                        {/* Category */}

                        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#B0832F]">
                            {product.category ||
                                "IndieKonnect Atelier"}
                        </div>

                        {/* Product Name */}

                        <h1
                            className={`${marcellus.className} max-w-[620px] text-[30px] leading-[1.12] text-[#071A41] sm:text-[36px] xl:text-[40px]`}
                        >
                            {
                                product.name
                            }
                        </h1>

                        {/* Rating */}

                        <div className="mt-4 flex items-center gap-2.5">

                            <div className="flex items-center gap-1">

                                {[
                                    ...Array(
                                        5,
                                    ),
                                ].map(
                                    (
                                        _,
                                        index,
                                    ) => (
                                        <Star
                                            key={
                                                index
                                            }
                                            className={`h-[14px] w-[14px] ${index <
                                                Math.floor(
                                                    product.rating,
                                                )
                                                ? "fill-[#C89B3C] text-[#C89B3C]"
                                                : "fill-transparent text-[#C89B3C]"
                                                }`}
                                        />
                                    ),
                                )}

                            </div>

                            <span className="text-[11px] text-[#788296]">
                                {
                                    product.rating
                                }{" "}
                                ·{" "}
                                {product.reviews?.toLocaleString()}{" "}
                                reviews
                            </span>

                        </div>

                        {/* Price */}

                        <div className="mt-6 border-y border-[#E8E3D9] py-5">

                            <div className="flex flex-wrap items-center gap-3">

                                <span className="text-[32px] font-semibold tracking-[-0.03em] text-[#071A41]">
                                    ₹
                                    {product.price.toLocaleString()}
                                </span>

                                {product.originalPrice && (
                                    <span className="text-[14px] text-[#9298A4] line-through">
                                        ₹
                                        {product.originalPrice.toLocaleString()}
                                    </span>
                                )}

                                {product.discount &&
                                    product.discount >
                                    0 && (
                                        <span className="rounded-full bg-[#EDF7F0] px-2.5 py-1 text-[10px] font-bold text-[#16713C]">
                                            {
                                                product.discount
                                            }
                                            % OFF
                                        </span>
                                    )}

                            </div>

                            <p className="mt-1.5 text-[10px] text-[#8790A1]">
                                Inclusive of all
                                taxes · Free
                                shipping over
                                ₹999
                            </p>

                        </div>

                        {/* Product meta */}

                        <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] text-[#697286]">

                            {product.productCode && (
                                <>
                                    <span>
                                        Product
                                        code:{" "}
                                        {
                                            product.productCode
                                        }
                                    </span>

                                    <span className="h-1 w-1 rounded-full bg-[#C89B3C]" />
                                </>
                            )}

                            <span
                                className={
                                    product.inStock
                                        ? "font-medium text-[#16713C]"
                                        : "font-medium text-red-600"
                                }
                            >
                                {product.inStock
                                    ? `${product.stockQuantity} in stock`
                                    : "Currently unavailable"}
                            </span>

                        </div>

                        {/* =================================================
                            COLOR & SIZE
                        ================================================= */}

                        <div className="mt-6 space-y-6">

                            {/* =================================================
                                COLOR
                            ================================================= */}

                            <div>

                                <div className="mb-3 flex items-center justify-between">

                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#667085]">

                                        Color

                                        <span className="ml-1 text-[#071A41]">
                                            –{" "}
                                            {
                                                selectedColor
                                            }
                                        </span>

                                    </span>

                                </div>

                                <div className="flex items-center gap-4">

                                    {colorOptions.map(
                                        (
                                            color,
                                        ) => {
                                            const isSelected =
                                                selectedColor ===
                                                color.name;

                                            return (
                                                <button
                                                    key={
                                                        color.name
                                                    }
                                                    type="button"
                                                    aria-label={`Select ${color.name}`}
                                                    title={
                                                        color.name
                                                    }
                                                    onClick={() =>
                                                        setSelectedColor(
                                                            color.name,
                                                        )
                                                    }
                                                    className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all ${isSelected
                                                        ? "scale-105"
                                                        : "hover:scale-105"
                                                        }`}
                                                >

                                                    <span
                                                        className="h-7 w-7 rounded-full border border-white shadow-sm"
                                                        style={{
                                                            backgroundColor:
                                                                color.value,
                                                        }}
                                                    />

                                                    {isSelected && (
                                                        <span className="absolute inset-[-3px] rounded-full border border-[#C89B3C]" />
                                                    )}

                                                </button>
                                            );
                                        },
                                    )}

                                </div>

                            </div>

                            {/* =================================================
                                SIZE
                            ================================================= */}

                            <div>

                                <div className="mb-3 flex items-center justify-between">

                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#667085]">

                                        Size

                                        <span className="ml-1 text-[#071A41]">
                                            –{" "}
                                            {
                                                selectedSize
                                            }
                                        </span>

                                    </span>

                                    <button
                                        type="button"
                                        className="text-[10px] font-semibold text-[#071A41] underline underline-offset-2 transition hover:text-[#B0832F]"
                                        onClick={() => {
                                            /*
                                             * Add your size guide modal
                                             * here when required.
                                             */
                                        }}
                                    >
                                        Size guide
                                    </button>

                                </div>

                                <div className="flex flex-wrap gap-2">

                                    {sizeOptions.map(
                                        (
                                            size,
                                        ) => {

                                            const isDisabled =
                                                size ===
                                                "XXL";

                                            const isSelected =
                                                selectedSize ===
                                                size;

                                            return (
                                                <button
                                                    key={
                                                        size
                                                    }
                                                    type="button"
                                                    disabled={
                                                        isDisabled
                                                    }
                                                    onClick={() =>
                                                        setSelectedSize(
                                                            size,
                                                        )
                                                    }
                                                    className={`flex h-10 min-w-[42px] items-center justify-center rounded-lg border px-3 text-[11px] font-semibold transition-all ${isSelected
                                                        ? "border-[#071A41] bg-[#071A41] text-white shadow-sm"
                                                        : isDisabled
                                                            ? "cursor-not-allowed border-[#EAE7E1] bg-white text-[#C8C8C8] line-through"
                                                            : "border-[#E5E0D7] bg-white text-[#071A41] hover:border-[#071A41] hover:bg-[#F8F6F1]"
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        },
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                            QUANTITY
                        ================================================= */}

                        <div className="mt-6 flex items-center gap-4">

                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#667085]">
                                Quantity
                            </span>

                            <div className="flex h-10 items-center overflow-hidden rounded-full border border-[#DCD8D0] bg-white">

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuantityChange(
                                            "decrement",
                                        )
                                    }
                                    disabled={
                                        quantity <=
                                        1
                                    }
                                    className="flex h-full w-10 items-center justify-center text-[#071A41] transition hover:bg-[#F7F4EE] disabled:opacity-30"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>

                                <span className="w-9 text-center text-[12px] font-semibold text-[#071A41]">
                                    {
                                        quantity
                                    }
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuantityChange(
                                            "increment",
                                        )
                                    }
                                    disabled={
                                        quantity >=
                                        10 ||
                                        quantity >=
                                        (product.stockQuantity ||
                                            10)
                                    }
                                    className="flex h-full w-10 items-center justify-center text-[#071A41] transition hover:bg-[#F7F4EE] disabled:opacity-30"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>

                            </div>

                        </div>

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                            <motion.button
                                whileTap={{
                                    scale: product.inStock
                                        ? 0.985
                                        : 1,
                                }}
                                onClick={
                                    handleAddToCart
                                }
                                disabled={
                                    !product.inStock
                                }
                                className={`ik-glass flex h-[50px] flex-1 items-center justify-center gap-2 rounded-full px-5 text-[11px] font-bold uppercase tracking-[0.09em] transition ${product.inStock
                                    ? "bg-[#071A41] text-white shadow-lg shadow-[#071A41]/10 hover:bg-[#10285C]"
                                    : "cursor-not-allowed bg-[#E9E9E8] text-[#9CA3AF]"
                                    }`}
                            >

                                {isAddedToCart ? (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        Added
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-4 w-4" />
                                        Add to Cart
                                    </>
                                )}

                            </motion.button>

                            <motion.button
                                whileTap={{
                                    scale: product.inStock
                                        ? 0.985
                                        : 1,
                                }}
                                onClick={(
                                    e,
                                ) => {
                                    fireRipple(
                                        e,
                                    );

                                    handleBuyNow();
                                }}
                                disabled={
                                    !product.inStock
                                }
                                className={`h-[50px] rounded-full border px-7 text-[11px] font-bold uppercase tracking-[0.09em] transition ${product.inStock
                                    ? "border-[#071A41] bg-white text-[#071A41] hover:bg-[#071A41] hover:text-white"
                                    : "cursor-not-allowed border-[#D8D9DD] text-[#A4A8B1]"
                                    }`}
                            >
                                Buy Now
                            </motion.button>

                        </div>

                        {/* =================================================
                            TRUST STRIP
                        ================================================= */}

                        <div className="mt-6 grid grid-cols-3 border-y border-[#E8E3D9] py-4">

                            <div className="flex items-center gap-2 border-r border-[#E8E3D9] pr-2 text-[9px] text-[#687286]">

                                <RotateCcw className="h-3.5 w-3.5 flex-shrink-0 text-[#B0832F]" />

                                30-day returns

                            </div>

                            <div className="flex items-center justify-center gap-2 border-r border-[#E8E3D9] px-2 text-[9px] text-[#687286]">

                                <Shield className="h-3.5 w-3.5 flex-shrink-0 text-[#B0832F]" />

                                Secure checkout

                            </div>

                            <div className="flex items-center justify-end gap-2 pl-2 text-[9px] text-[#687286]">

                                <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-[#B0832F]" />

                                Handmade

                            </div>

                        </div>

                        {/* =================================================
                            COLLAPSIBLE INFORMATION
                        ================================================= */}

                        <div className="mt-6 border-t border-[#E5E0D7]">

                            {/* DESCRIPTION */}

                            <div className="border-b border-[#E5E0D7]">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(
                                            activeTab ===
                                                "description"
                                                ? ""
                                                : "description",
                                        )
                                    }
                                    className="flex w-full items-center justify-between py-[17px] text-left"
                                >

                                    <span className="text-[12px] font-semibold text-[#071A41]">
                                        Description
                                    </span>

                                    {activeTab ===
                                        "description" ? (
                                        <ChevronDown className="h-4 w-4 text-[#B0832F]" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-[#8B94A5]" />
                                    )}

                                </button>

                                <AnimatePresence initial={false}>

                                    {activeTab ===
                                        "description" && (

                                            <motion.div
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                transition={{
                                                    duration:
                                                        0.22,
                                                }}
                                                className="overflow-hidden"
                                            >

                                                <div className="pb-6">

                                                    <p className="text-[12px] leading-6 text-[#69758A]">
                                                        {product.description ||
                                                            "Premium quality product with exceptional design and craftsmanship."}
                                                    </p>

                                                    <div className="mt-5 space-y-3">

                                                        {[
                                                            "Premium quality material",
                                                            "Ergonomic design for maximum comfort",
                                                            "Sturdy construction & finish",
                                                            "Perfect for living room, bedroom or office",
                                                        ].map(
                                                            (
                                                                feature,
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        feature
                                                                    }
                                                                    className="flex items-center gap-2.5 text-[11px] text-[#526076]"
                                                                >

                                                                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-[#C89B3C]" />

                                                                    <span>
                                                                        {
                                                                            feature
                                                                        }
                                                                    </span>

                                                                </div>
                                                            ),
                                                        )}

                                                    </div>

                                                </div>

                                            </motion.div>

                                        )}

                                </AnimatePresence>

                            </div>

                            {/* SPECIFICATIONS */}

                            <div className="border-b border-[#E5E0D7]">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(
                                            activeTab ===
                                                "specifications"
                                                ? ""
                                                : "specifications",
                                        )
                                    }
                                    className="flex w-full items-center justify-between py-[17px] text-left"
                                >

                                    <span className="text-[12px] font-semibold text-[#071A41]">
                                        Specifications
                                    </span>

                                    {activeTab ===
                                        "specifications" ? (
                                        <ChevronDown className="h-4 w-4 text-[#B0832F]" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-[#8B94A5]" />
                                    )}

                                </button>

                                <AnimatePresence initial={false}>

                                    {activeTab ===
                                        "specifications" && (

                                            <motion.div
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                transition={{
                                                    duration:
                                                        0.22,
                                                }}
                                                className="overflow-hidden"
                                            >

                                                <div className="pb-7">

                                                    <div className="mb-2 text-[14px] font-semibold text-[#071A41]">
                                                        Product
                                                        Specifications
                                                    </div>

                                                    <p className="mb-4 text-[10px] text-[#8992A3]">
                                                        Product
                                                        details
                                                        and
                                                        specifications
                                                    </p>

                                                    {renderSpecTable()}

                                                    {/* REVIEWS */}

                                                    <div className="mt-7 border-t border-[#E5E0D7] pt-6">

                                                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                                                            <div>

                                                                <h3 className="text-[15px] font-semibold text-[#071A41]">
                                                                    Customer
                                                                    Reviews
                                                                </h3>

                                                                <p className="mt-1 text-[10px] text-[#8992A3]">
                                                                    Based
                                                                    on{" "}
                                                                    {product.reviews?.toLocaleString() ||
                                                                        0}{" "}
                                                                    reviews
                                                                </p>

                                                            </div>

                                                            <div className="flex items-center gap-2">

                                                                <div className="flex items-center gap-0.5">

                                                                    {[
                                                                        ...Array(
                                                                            5,
                                                                        ),
                                                                    ].map(
                                                                        (
                                                                            _,
                                                                            index,
                                                                        ) => (
                                                                            <Star
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className={`h-3.5 w-3.5 ${index <
                                                                                    Math.floor(
                                                                                        product.rating,
                                                                                    )
                                                                                    ? "fill-[#C89B3C] text-[#C89B3C]"
                                                                                    : "fill-[#ECECEC] text-[#ECECEC]"
                                                                                    }`}
                                                                            />
                                                                        ),
                                                                    )}

                                                                </div>

                                                                <span className="text-[11px] font-semibold text-[#071A41]">
                                                                    {
                                                                        product.rating
                                                                    }{" "}
                                                                    /
                                                                    5
                                                                </span>

                                                            </div>

                                                        </div>

                                                        <div className="mt-6 space-y-3">

                                                            {ratingBreakdown.map(
                                                                (
                                                                    rating,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            rating.stars
                                                                        }
                                                                        className="flex items-center gap-2 text-[10px]"
                                                                    >

                                                                        <span className="w-11 text-[#596275]">
                                                                            {
                                                                                rating.stars
                                                                            }{" "}
                                                                            star
                                                                        </span>

                                                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ECEAE6]">

                                                                            <div
                                                                                className="h-full rounded-full bg-[#C89B3C]"
                                                                                style={{
                                                                                    width: `${rating.pct}%`,
                                                                                }}
                                                                            />

                                                                        </div>

                                                                        <span className="w-8 text-right text-[#8992A3]">
                                                                            {
                                                                                rating.pct
                                                                            }
                                                                            %
                                                                        </span>

                                                                    </div>
                                                                ),
                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                            </motion.div>

                                        )}

                                </AnimatePresence>

                            </div>

                            {/* SHIPPING */}

                            <div className="border-b border-[#E5E0D7]">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(
                                            activeTab ===
                                                "shipping"
                                                ? ""
                                                : "shipping",
                                        )
                                    }
                                    className="flex w-full items-center justify-between py-[17px] text-left"
                                >

                                    <span className="text-[12px] font-semibold text-[#071A41]">
                                        Shipping &
                                        Returns
                                    </span>

                                    {activeTab ===
                                        "shipping" ? (
                                        <ChevronDown className="h-4 w-4 text-[#B0832F]" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-[#8B94A5]" />
                                    )}

                                </button>

                                <AnimatePresence initial={false}>

                                    {activeTab ===
                                        "shipping" && (

                                            <motion.div
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                transition={{
                                                    duration:
                                                        0.22,
                                                }}
                                                className="overflow-hidden"
                                            >

                                                <div className="grid grid-cols-1 gap-3 pb-6 sm:grid-cols-3">

                                                    <div className="rounded-xl border border-[#E5E0D7] bg-[#FAF9F7] p-4 text-center">

                                                        <Truck className="mx-auto h-5 w-5 text-[#C89B3C]" />

                                                        <h3 className="mt-2 text-[11px] font-semibold text-[#071A41]">
                                                            Free
                                                            Shipping
                                                        </h3>

                                                        <p className="mt-1 text-[9px] text-[#697286]">
                                                            On
                                                            orders
                                                            above
                                                            ₹999
                                                        </p>

                                                    </div>

                                                    <div className="rounded-xl border border-[#E5E0D7] bg-[#FAF9F7] p-4 text-center">

                                                        <RotateCcw className="mx-auto h-5 w-5 text-[#C89B3C]" />

                                                        <h3 className="mt-2 text-[11px] font-semibold text-[#071A41]">
                                                            Easy
                                                            Returns
                                                        </h3>

                                                        <p className="mt-1 text-[9px] text-[#697286]">
                                                            7 days
                                                            return
                                                            policy
                                                        </p>

                                                    </div>

                                                    <div className="rounded-xl border border-[#E5E0D7] bg-[#FAF9F7] p-4 text-center">

                                                        <Shield className="mx-auto h-5 w-5 text-[#C89B3C]" />

                                                        <h3 className="mt-2 text-[11px] font-semibold text-[#071A41]">
                                                            Secure
                                                            Checkout
                                                        </h3>

                                                        <p className="mt-1 text-[9px] text-[#697286]">
                                                            Safe
                                                            and
                                                            secure
                                                            payments
                                                        </p>

                                                    </div>

                                                </div>

                                            </motion.div>

                                        )}

                                </AnimatePresence>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    YOU MAY ALSO LIKE
                ===================================================== */}

                {similarProducts.length >
                    0 && (
                        <section className="mt-20">

                            <div className="mb-8 text-center">

                                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#B0832F]">
                                    Curated for you
                                </p>

                                <h2
                                    className={`${marcellus.className} text-2xl text-[#071A41] md:text-3xl`}
                                >
                                    You may also
                                    like
                                </h2>

                                <div className="mx-auto mt-3 h-px w-12 bg-[#C89B3C]" />

                            </div>

                            <div
                                ref={
                                    sliderRef
                                }
                                className="grid grid-cols-2 gap-x-4 gap-y-8 overflow-x-auto pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 hide-scrollbar"
                            >

                                {similarProducts.map(
                                    (
                                        similarProduct,
                                    ) => (
                                        <Link
                                            key={
                                                similarProduct.id
                                            }
                                            href={`/product/${similarProduct.slug}`}
                                            className="group block min-w-0"
                                            onMouseEnter={(
                                                e,
                                            ) =>
                                                handleCartIconHover(
                                                    similarProduct,
                                                    e,
                                                )
                                            }
                                            onMouseLeave={
                                                handlePopupLeave
                                            }
                                        >

                                            <div className="relative aspect-square overflow-hidden rounded-xl border border-[#E8E3D9] bg-[#F7F4EE]">

                                                <Image
                                                    src={
                                                        similarProduct.image ||
                                                        "/indiekonnect-web/images/placeholder.jpg"
                                                    }
                                                    alt={
                                                        similarProduct.name
                                                    }
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 640px) 50vw, 20vw"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={(
                                                        e,
                                                    ) => {

                                                        e.preventDefault();

                                                        e.stopPropagation();

                                                        popHeart(
                                                            e,
                                                        );

                                                        toggleWishlist(
                                                            similarProduct.id,
                                                        );
                                                    }}
                                                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md"
                                                    aria-label="Add to wishlist"
                                                >

                                                    <Heart
                                                        className={`h-4 w-4 ${wishlistState[
                                                            similarProduct
                                                                .id
                                                        ]
                                                            ? "fill-red-500 text-red-500"
                                                            : "text-[#071A41]"
                                                            }`}
                                                    />

                                                </button>

                                                {similarProduct.discount &&
                                                    similarProduct.discount >
                                                    0 && (
                                                        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#071A41] px-2 py-1 text-[8px] font-bold text-white">
                                                            {
                                                                similarProduct.discount
                                                            }
                                                            %
                                                            OFF
                                                        </span>
                                                    )}

                                                {!similarProduct.inStock && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-[#071A41]/20">

                                                        <span className="rounded-full bg-white px-3 py-1 text-[9px] font-semibold text-[#071A41]">
                                                            Out
                                                            of
                                                            Stock
                                                        </span>

                                                    </div>
                                                )}

                                            </div>

                                            <div className="mt-3 text-center">

                                                <h3 className="line-clamp-1 text-[12px] font-medium text-[#343B4A]">
                                                    {
                                                        similarProduct.name
                                                    }
                                                </h3>

                                                <div className="mt-1 flex items-center justify-center gap-2">

                                                    <span className="text-[14px] font-semibold text-[#071A41]">
                                                        ₹
                                                        {similarProduct.price.toLocaleString()}
                                                    </span>

                                                    {similarProduct.originalPrice && (
                                                        <span className="text-[10px] text-[#9AA0AA] line-through">
                                                            ₹
                                                            {similarProduct.originalPrice.toLocaleString()}
                                                        </span>
                                                    )}

                                                </div>

                                                <div className="mt-1 flex items-center justify-center gap-1">

                                                    <span className="text-[10px] tracking-wide text-[#C89B3C]">
                                                        {renderRatingStars(
                                                            similarProduct.rating,
                                                        )}
                                                    </span>

                                                    <span className="text-[9px] text-[#9AA0AA]">
                                                        (
                                                        {similarProduct.reviews ||
                                                            0}
                                                        )
                                                    </span>

                                                </div>

                                            </div>

                                        </Link>
                                    ),
                                )}

                            </div>

                        </section>
                    )}

            </main>

            {/* ============================================================
                QUICK ADD POPUP
            ============================================================ */}

            <AnimatePresence>

                {hoverPopupData && (

                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.85,
                            y: 5,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.85,
                            y: 5,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 25,
                        }}
                        className="fixed z-50 w-80 overflow-hidden rounded-2xl border border-[#E5E0D7] bg-white shadow-2xl"
                        style={{
                            left: `${Math.max(
                                20,
                                Math.min(
                                    popupPosition.x -
                                    160,
                                    window.innerWidth -
                                    340,
                                ),
                            )}px`,
                            top: `${Math.max(
                                20,
                                popupPosition.y -
                                320,
                            )}px`,
                        }}
                        onMouseEnter={() =>
                            setHoveredSimilar(
                                hoverPopupData.id,
                            )
                        }
                        onMouseLeave={
                            handlePopupLeave
                        }
                    >

                        {/* Popup Header */}

                        <div className="border-b border-[#E8E3D9] bg-[#071A41] px-4 py-3">

                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-2">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C89B3C]">

                                        <ShoppingCart className="h-4 w-4 text-[#071A41]" />

                                    </div>

                                    <span className="text-sm font-semibold text-white">
                                        Quick Add
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handlePopupLeave
                                    }
                                    className="text-white/60 transition hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                            </div>

                        </div>

                        {/* Popup Content */}

                        <div className="p-4">

                            <div className="flex gap-3">

                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#F7F4EE]">

                                    <Image
                                        src={
                                            hoverPopupData.image ||
                                            "/indiekonnect-web/images/placeholder.jpg"
                                        }
                                        alt={
                                            hoverPopupData.name
                                        }
                                        fill
                                        className="object-cover"
                                    />

                                </div>

                                <div className="min-w-0 flex-1">

                                    <div className="text-[9px] uppercase tracking-wider text-[#B0832F]">
                                        {
                                            hoverPopupData.category
                                        }
                                    </div>

                                    <h4 className="truncate text-sm font-medium text-[#071A41]">
                                        {
                                            hoverPopupData.name
                                        }
                                    </h4>

                                    <div className="mt-1 flex items-center gap-2">

                                        <span className="font-bold text-[#071A41]">
                                            ₹
                                            {hoverPopupData.price.toLocaleString()}
                                        </span>

                                        {hoverPopupData.originalPrice && (
                                            <span className="text-[10px] text-gray-400 line-through">
                                                ₹
                                                {hoverPopupData.originalPrice.toLocaleString()}
                                            </span>
                                        )}

                                    </div>

                                    <div className="flex items-center gap-1">

                                        <span className="text-[10px] text-[#C89B3C]">
                                            {renderRatingStars(
                                                hoverPopupData.rating,
                                            )}
                                        </span>

                                        <span className="text-[8px] text-gray-400">
                                            (
                                            {
                                                hoverPopupData.reviews
                                            }
                                            )
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* Quantity */}

                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">

                                <span className="text-sm text-gray-500">
                                    Quantity
                                </span>

                                <div className="flex items-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">

                                    <button
                                        type="button"
                                        className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40"
                                        onClick={() =>
                                            handlePopupQuantityChange(
                                                "decrement",
                                            )
                                        }
                                        disabled={
                                            popupQuantity <=
                                            1
                                        }
                                    >
                                        <Minus className="h-3.5 w-3.5 text-gray-600" />
                                    </button>

                                    <span className="w-10 text-center text-sm font-semibold">
                                        {
                                            popupQuantity
                                        }
                                    </span>

                                    <button
                                        type="button"
                                        className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40"
                                        onClick={() =>
                                            handlePopupQuantityChange(
                                                "increment",
                                            )
                                        }
                                        disabled={
                                            popupQuantity >=
                                            10
                                        }
                                    >
                                        <PlusIcon className="h-3.5 w-3.5 text-gray-600" />
                                    </button>

                                </div>

                            </div>

                            {/* Subtotal */}

                            <div className="mt-3 flex items-center justify-between border-t border-gray-100 py-2">

                                <span className="text-sm text-gray-500">
                                    Subtotal
                                </span>

                                <span className="text-lg font-bold text-[#071A41]">
                                    ₹
                                    {(
                                        hoverPopupData.price *
                                        popupQuantity
                                    ).toLocaleString()}
                                </span>

                            </div>

                            {/* Buttons */}

                            <div className="mt-3 flex flex-col gap-2">

                                <button
                                    type="button"
                                    className="ik-glass flex w-full items-center justify-center gap-2 rounded-lg bg-[#C89B3C] py-2.5 text-sm font-semibold text-[#071A41] transition hover:bg-[#B78A2E]"
                                    onClick={
                                        handlePopupAddToCart
                                    }
                                >

                                    <ShoppingCart className="h-4 w-4" />

                                    Add to Cart

                                </button>

                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200"
                                    onClick={
                                        handlePopupLeave
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>

                        <div className="border-t border-gray-100 bg-[#FAF9F7] px-4 py-2 text-center">

                            <span className="text-[10px] text-gray-400">
                                Free shipping on
                                orders above ₹999
                            </span>

                        </div>

                    </motion.div>

                )}

            </AnimatePresence>

            {/* ============================================================
                CUSTOM CSS
            ============================================================ */}

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

                .ik-glass {
                    position: relative;
                    overflow: hidden;
                }

                .ik-glass::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -65%;
                    width: 45%;
                    height: 100%;
                    pointer-events: none;
                    transform: skewX(-18deg);
                    background: linear-gradient(
                        100deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.5) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                }

                .ik-glass:hover::after {
                    animation: ikSheen 0.5s ease-out
                        forwards;
                }

                @keyframes ikSheen {

                    from {
                        left: -65%;
                    }

                    to {
                        left: 120%;
                    }

                }

                .ik-ripple {
                    position: absolute;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: currentColor;
                    opacity: 0.28;
                    pointer-events: none;
                    animation: ikRip 0.7s
                        cubic-bezier(
                            0.2,
                            0.8,
                            0.2,
                            1
                        )
                        forwards;
                }

                @keyframes ikRip {

                    to {
                        transform: scale(15);
                        opacity: 0;
                    }

                }

                .ik-heart-pop {
                    animation: ikHeart 0.55s
                        cubic-bezier(
                            0.2,
                            0.9,
                            0.2,
                            1
                        );
                }

                @keyframes ikHeart {

                    0% {
                        transform: scale(1);
                    }

                    40% {
                        transform: scale(1.5);
                    }

                    70% {
                        transform: scale(0.88);
                    }

                    100% {
                        transform: scale(1);
                    }

                }

                .ik-bump {
                    animation: ikBump 0.5s
                        cubic-bezier(
                            0.2,
                            0.9,
                            0.2,
                            1
                        );
                }

                @keyframes ikBump {

                    0% {
                        transform: scale(1);
                    }

                    45% {
                        transform: scale(1.5);
                    }

                    100% {
                        transform: scale(1);
                    }

                }

                .ik-fly-ghost {
                    position: fixed;
                    z-index: 9997;
                    border-radius: 12px;
                    pointer-events: none;
                    background-size: cover;
                    background-position: center;
                    box-shadow:
                        0 18px 40px
                        rgba(0, 0, 0, 0.25);
                }

                @media (prefers-reduced-motion: reduce) {

                    .ik-glass::after,
                    .ik-ripple,
                    .ik-heart-pop,
                    .ik-bump {
                        display: none;
                        animation: none;
                    }

                }

            `}</style>

            <Footer />

        </div>
    );
}