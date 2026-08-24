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
  ChevronLeft,
} from "lucide-react";
import Footer from "../Footer/Footer";
import { useGetProductBySlugQuery, useGetProductsByCategoryQuery } from "@/lib/redux/api/productApi";
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from "@/lib/redux/api/Wishlist/wishlistApi";
import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "../../lib/slices/toastSlice";
import Header from "../common/Header";
import { Marcellus } from "next/font/google";
import Loader from "../ui/Spinner/Loader";
import { useGetUserProfileQuery } from "@/lib/redux/api/Profile/userApi";

const marcellus = Marcellus({ subsets: ["latin"], weight: "400" });

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

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

function flyImageToCart(sourceEl: HTMLElement | null, imgSrc: string) {
  if (prefersReduced() || !sourceEl) return;
  const target = document.querySelector("#cart-icon") as HTMLElement | null;
  const a = sourceEl.getBoundingClientRect();
  const b = target
    ? target.getBoundingClientRect()
    : ({ left: window.innerWidth - 60, top: 20, width: 24, height: 24 } as DOMRect);
  const ghost = document.createElement("div");
  ghost.className = "ik-fly-ghost";
  ghost.style.left = `${a.left}px`;
  ghost.style.top = `${a.top}px`;
  ghost.style.width = `${a.width}px`;
  ghost.style.height = `${a.height}px`;
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
    { duration: 900, easing: "cubic-bezier(.5,-.2,.35,1)" }
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

const getUserAccountType = (profileData: any): "retail" | "distributor" => {
  if (!profileData) return "retail";
  const accountType =
    profileData?.user?.account_type ||
    profileData?.account_type ||
    profileData?.data?.account_type ||
    profileData?.data?.user?.account_type;
  if (accountType === "distributor" || accountType === "Distributor" || accountType === "DISTRIBUTOR") {
    return "distributor";
  }
  return "retail";
};

export default function ProductDetail({ productSlug }: ProductDetailProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // State
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [activeImage, setActiveImage] = useState(0);
  const [hoveredSimilar, setHoveredSimilar] = useState<number | null>(null);
  const [hoverPopupData, setHoverPopupData] = useState<any>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupQuantity, setPopupQuantity] = useState(1);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [wishlistState, setWishlistState] = useState<Record<number, boolean>>({});
  const mainImageBoxRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Rust");
  const [selectedSize, setSelectedSize] = useState("M");

  const colorOptions = [
    { name: "Beige", value: "#D9C79F" },
    { name: "Olive", value: "#68724A" },
    { name: "Rust", value: "#A65D40" },
  ];
  const sizeOptions = ["S", "M", "L", "XL", "XXL"];

  // API
  const { data: productData, isLoading: isProductLoading, error } = useGetProductBySlugQuery(productSlug, {
    skip: !productSlug,
  });
  const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery();
  const { data: userProfileData } = useGetUserProfileQuery();
  const userAccountType = getUserAccountType(userProfileData);
  const categoryId = productData?.data?.category_id || productData?.category_id || null;
  const { data: categoryProductsData } = useGetProductsByCategoryQuery(categoryId, { skip: !categoryId });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  const apiProduct = productData?.data ?? productData;

  // Normalize product
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
        retailMrp: Number(apiProduct.retail_mrp || 0),
        distributorMrp: Number(apiProduct.distributor_mrp || 0),
        retailPrice: Number(apiProduct.retail_price || 0),
        distributorPrice: Number(apiProduct.distributor_price || 0),
        price: userAccountType === "distributor"
          ? Number(apiProduct.distributor_price || 0)
          : Number(apiProduct.retail_price || 0),
        mrp: userAccountType === "distributor"
          ? Number(apiProduct.distributor_mrp || 0)
          : Number(apiProduct.retail_mrp || 0),
        originalPrice: userAccountType === "distributor"
          ? Number(apiProduct.distributor_mrp || 0)
          : Number(apiProduct.retail_mrp || 0),
        discount: userAccountType === "distributor"
          ? Number(apiProduct.distributor_mrp || 0) > 0 && Number(apiProduct.distributor_price || 0) > 0
            ? Math.round(((Number(apiProduct.distributor_mrp) - Number(apiProduct.distributor_price)) / Number(apiProduct.distributor_mrp)) * 100)
            : null
          : Number(apiProduct.retail_mrp || 0) > 0 && Number(apiProduct.retail_price || 0) > 0
            ? Math.round(((Number(apiProduct.retail_mrp) - Number(apiProduct.retail_price)) / Number(apiProduct.retail_mrp)) * 100)
            : null,
        image: apiProduct.primary_image_url || apiProduct.images?.[0]?.image_url || "/indiekonnect-web/images/placeholder.jpg",
        images: apiProduct.images || [],
        rating: apiProduct.reviews_summary?.average_rating || 0,
        reviews: apiProduct.reviews_summary?.total_reviews || 0,
        inStock: (apiProduct.stock_status === "active" || apiProduct.status === "active") && Number(apiProduct.stock_quantity) > 0,
        stockQuantity: Number(apiProduct.stock_quantity || 0),
        lowStockThreshold: Number(apiProduct.low_stock_threshold || 10),
        isPublished: apiProduct.is_published,
        status: apiProduct.stock_status || apiProduct.status,
        isWishlisted: apiProduct.is_wishlisted || false,
        taxCategoryId: apiProduct.tax_category_id,
        createdAt: apiProduct.created_at,
        updatedAt: apiProduct.updated_at,
        isDealOfTheDay: apiProduct.is_deal_of_the_day || false,
        isActiveDeal: apiProduct.is_active_deal || false,
        dealStartsAt: apiProduct.deal_of_the_day_starts_at,
        dealEndsAt: apiProduct.deal_of_the_day_ends_at,
      }
    : null;

  // Wishlist sync
  useEffect(() => {
    if (wishlistData?.data && product?.id) {
      const exists = wishlistData.data.some((item: any) => item.product_id === product.id);
      setIsWishlisted(exists);
    }
  }, [wishlistData, product?.id]);

  useEffect(() => {
    if (wishlistData?.data) {
      const map: Record<number, boolean> = {};
      wishlistData.data.forEach((item: any) => { map[item.product_id] = true; });
      setWishlistState(map);
    }
  }, [wishlistData]);

  // Similar products
  const similarProducts = Array.isArray(categoryProductsData?.data)
    ? categoryProductsData.data.slice(0, 12).map((p: any) => {
        const isDistributor = userAccountType === "distributor";
        const price = isDistributor ? Number(p.distributor_price || 0) : Number(p.retail_price || 0);
        const mrp = isDistributor ? Number(p.distributor_mrp || 0) : Number(p.retail_mrp || 0);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category?.name || "Uncategorized",
          price,
          originalPrice: mrp,
          discount: mrp > 0 && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : null,
          image: p.primary_image_url || p.images?.find((img: any) => img.is_primary)?.image_url || p.images?.[0]?.image_url || "/indiekonnect-web/images/placeholder.jpg",
          rating: p.reviews_summary?.average_rating || 4.5,
          reviews: p.reviews_summary?.total_reviews || 0,
          inStock: (p.stock_status === "active" || p.status === "active") && Number(p.stock_quantity) > 0,
          stockQuantity: Number(p.stock_quantity || 0),
        };
      })
    : [];

  // Quantity handlers
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

  // Wishlist handlers
  const handleWishlistToggle = async (e?: React.MouseEvent<HTMLElement>) => {
    if (!product || isWishlistLoading) return;
    if (e) popHeart(e);
    setIsWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist({ product_id: product.id }).unwrap();
        setIsWishlisted(false);
        dispatch(showToast({ message: `${product.name} removed from wishlist`, type: "info" }));
      } else {
        await addToWishlist({ product_id: product.id }).unwrap();
        setIsWishlisted(true);
        dispatch(showToast({ message: `${product.name} added to wishlist! ❤️`, type: "success" }));
      }
      await refetchWishlist();
    } catch (error: any) {
      dispatch(showToast({ message: error?.data?.message || "Failed to update wishlist", type: "error" }));
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const toggleWishlist = async (productId: number) => {
    try {
      const exists = wishlistState[productId] || false;
      if (exists) {
        await removeFromWishlist({ product_id: productId }).unwrap();
        setWishlistState((prev) => ({ ...prev, [productId]: false }));
        dispatch(showToast({ message: "Removed from wishlist", type: "info" }));
      } else {
        await addToWishlist({ product_id: productId }).unwrap();
        setWishlistState((prev) => ({ ...prev, [productId]: true }));
        dispatch(showToast({ message: "Added to wishlist! ❤️", type: "success" }));
      }
      await refetchWishlist();
    } catch (error: any) {
      dispatch(showToast({ message: error?.data?.message || "Failed to update wishlist", type: "error" }));
    }
  };

  // Local cart
  const addToCartLocal = (item: any, qty: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: Math.min(c.quantity + qty, 10) } : c
        );
      }
      return [...prev, { id: item.id, name: item.name, image: item.image, price: item.price, originalPrice: item.originalPrice, quantity: qty }];
    });
  };

  // Add to cart
  const handleAddToCart = async (e?: React.MouseEvent<HTMLElement>) => {
    if (!product || !product.inStock) return;
    if (e) {
      fireRipple(e);
      flyImageToCart(mainImageBoxRef.current, gallery[activeImage] || product.image);
    }
    try {
      await addToCart({ product_id: product.id, quantity }).unwrap();
      addToCartLocal(product, quantity);
      setIsAddedToCart(true);
      dispatch(showToast({ message: `${product.name} added to cart successfully! 🛒`, type: "success" }));
      setTimeout(() => setIsAddedToCart(false), 3000);
    } catch (error: any) {
      dispatch(showToast({ message: error?.data?.message || "Failed to add item to cart", type: "error" }));
    }
  };

  // Buy now
  const handleBuyNow = () => {
    if (!product || !product.inStock) return;
    const params = new URLSearchParams({ product_id: String(product.id), quantity: String(quantity) });
    router.push(`/checkout?${params.toString()}`);
  };

  // Quick add
  const handleCartIconHover = (similar: any, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setPopupPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
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
      await addToCart({ product_id: hoverPopupData.id, quantity: popupQuantity }).unwrap();
      addToCartLocal(hoverPopupData, popupQuantity);
      dispatch(showToast({ message: `${hoverPopupData.name} added to cart! 🛒`, type: "success" }));
      handlePopupLeave();
    } catch (error: any) {
      dispatch(showToast({ message: error?.data?.message || "Failed to add item to cart", type: "error" }));
    }
  };

  // Fullscreen
  const openFullscreen = (index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = "";
  };

  const prevFullscreenImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreenImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const nextFullscreenImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreenImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isFullscreen) return;
    if (e.key === "Escape") closeFullscreen();
    else if (e.key === "ArrowLeft") setFullscreenImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
    else if (e.key === "ArrowRight") setFullscreenImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Loading
  if (isProductLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F7]">
        <Loader width={200} height={200} />
      </div>
    );
  }

  // Error
  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F7]">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h2 className="mb-3 text-2xl font-bold text-[#071A41]">Product Not Found</h2>
          <p className="mb-6 text-gray-500">The product you're looking for doesn't exist or may have been removed.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => router.back()} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D9D4C9] px-6 py-3 font-semibold text-[#071A41] transition hover:bg-white">
              <ArrowLeft className="h-4 w-4" /> Go Back
            </button>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071A41] px-6 py-3 font-semibold text-white transition hover:bg-[#10285C]">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Gallery
  const gallery = product.images && product.images.length > 0
    ? product.images.map((img: any) => img.image_url || img.image).filter(Boolean)
    : [product.image];

  // Rating breakdown
  const getRatingBreakdown = () => {
    if (!product.reviews || product.reviews === 0) {
      return [{ stars: 5, pct: 0 }, { stars: 4, pct: 0 }, { stars: 3, pct: 0 }, { stars: 2, pct: 0 }, { stars: 1, pct: 0 }];
    }
    if (product.rating && product.reviews > 0) {
      const basePct = Math.round((product.rating / 5) * 100);
      const star5Pct = Math.min(basePct + 10, 85);
      const star4Pct = Math.max(5, Math.round((product.rating / 5) * 15));
      const star3Pct = Math.max(2, Math.round((product.rating / 5) * 5));
      const star2Pct = Math.max(1, Math.round((product.rating / 5) * 3));
      const star1Pct = 100 - star5Pct - star4Pct - star3Pct - star2Pct;
      return [
        { stars: 5, pct: Math.max(star5Pct, 0) },
        { stars: 4, pct: Math.max(star4Pct, 0) },
        { stars: 3, pct: Math.max(star3Pct, 0) },
        { stars: 2, pct: Math.max(star2Pct, 0) },
        { stars: 1, pct: Math.max(star1Pct, 0) },
      ];
    }
    return [{ stars: 5, pct: 68 }, { stars: 4, pct: 20 }, { stars: 3, pct: 7 }, { stars: 2, pct: 3 }, { stars: 1, pct: 2 }];
  };

  const ratingBreakdown = getRatingBreakdown();

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let stars = "";
    stars += "★".repeat(fullStars);
    if (hasHalfStar) stars += "★";
    stars += "☆".repeat(emptyStars);
    return stars;
  };

  // Specification
  const parseSpecification = (spec: any) => {
    if (!spec) return null;
    if (typeof spec === "string") {
      try { return JSON.parse(spec); } catch { return null; }
    }
    return spec;
  };

  const specData = parseSpecification(product.specification);
  const specRows: [string, string | number][] = specData
    ? (Object.entries(specData) as [string, any][]).map(([key, value]) => [
        key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
        String(value),
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

  const renderSpecTable = () => (
    <div className="overflow-hidden rounded-xl border border-[#E5E0D7] bg-[#FAF9F7]">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {specRows.map(([label, value], index) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-5 border-b border-[#E9E5DD] px-4 py-3.5 text-[11px] ${
              index % 2 === 0 ? "bg-white" : "bg-[#FAF9F7]"
            }`}
          >
            <span className="font-medium text-[#7A8497]">{label}</span>
            <span className="text-right font-semibold text-[#071A41]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Toggle handler for accordion
  const toggleTab = (tab: string) => {
    if (activeTab === tab) {
      setActiveTab("");
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#17213F]">
      <Header />

      <main className="mx-auto w-full max-w-[1380px] px-3 pb-28 sm:px-6 sm:pb-16 lg:px-8 xl:px-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-2.5 text-[9px] text-[#8A92A3] sm:gap-2 sm:py-3.5 sm:text-[11px] hide-scrollbar">
          <Link href="/" className="flex-shrink-0 transition hover:text-[#071A41]">IndieKonnect</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0 text-[#C7BFAF]" />
          <Link href="/products" className="flex-shrink-0 transition hover:text-[#071A41]">{product.category || "Products"}</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0 text-[#C7BFAF]" />
          <span className="min-w-0 truncate text-[#071A41]">{product.name}</span>
        </nav>

        {/* Product Hero */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,.92fr)] lg:items-start lg:gap-7 xl:gap-12">
          {/* Left Gallery - Sticky with proper positioning */}
          <div className="min-w-0 lg:sticky lg:top-[80px] lg:self-start">
            <div className="flex flex-col gap-2.5 sm:gap-3.5 lg:grid lg:grid-cols-[65px_minmax(0,1fr)] xl:grid-cols-[75px_minmax(0,1fr)]">
              {/* Desktop Thumbnails */}
              <div className="hidden max-h-[480px] flex-col gap-2 overflow-y-auto pr-1 lg:flex hide-scrollbar">
                {gallery.map((img: string, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`group relative h-[65px] w-[65px] flex-shrink-0 overflow-hidden rounded-xl border bg-[#F8F6F1] transition-all xl:h-[72px] xl:w-[72px] ${
                      activeImage === index
                        ? "border-[#C89B3C] ring-2 ring-[#C89B3C]/20"
                        : "border-[#E5E0D7] hover:border-[#C8A85C]"
                    }`}
                  >
                    <Image
                      src={img || "/indiekonnect-web/images/placeholder.jpg"}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="72px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    {activeImage === index && <div className="absolute inset-0 rounded-xl border-2 border-[#C89B3C]" />}
                  </button>
                ))}
              </div>

              {/* Mobile Thumbnails */}
              <div className="order-1 flex w-full gap-2 overflow-x-auto pb-1 lg:hidden hide-scrollbar">
                {gallery.map((img: string, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`relative h-[55px] w-[55px] flex-shrink-0 overflow-hidden rounded-xl border-2 bg-[#F8F6F1] sm:h-[65px] sm:w-[65px] ${
                      activeImage === index
                        ? "border-[#C89B3C] ring-1 ring-[#C89B3C]/20"
                        : "border-[#E8E3D9]"
                    }`}
                  >
                    <Image
                      src={img || "/indiekonnect-web/images/placeholder.jpg"}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="65px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image - slightly smaller */}
              <div
                ref={mainImageBoxRef}
                className="order-2 relative mx-auto aspect-square w-full min-w-0 max-w-[540px] cursor-zoom-in overflow-hidden rounded-[16px] border border-[#E9E4DA] bg-[#F7F4EE] sm:rounded-[20px] lg:order-none lg:mx-0 lg:max-w-none"
                onClick={() => openFullscreen(activeImage)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={gallery[activeImage] || product.image}
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-1 text-[7px] text-white backdrop-blur-sm sm:bottom-3 sm:text-[8px]">
                  Tap to zoom
                </div>

                {product.rating >= 4.5 && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#071A41] px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.15em] text-white shadow-lg sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[8px]">
                    Bestseller
                  </span>
                )}

                {product.discount && product.discount > 0 && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-[#071A41]/80 px-2 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[9px]">
                    {product.discount}% OFF
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleWishlistToggle(e); }}
                  disabled={isWishlistLoading}
                  aria-label="Add to wishlist"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/95 shadow-lg backdrop-blur transition hover:scale-105 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
                >
                  <Heart className={`h-[14px] w-[14px] sm:h-[17px] sm:w-[17px] ${isWishlisted ? "fill-red-500 text-red-500" : "text-[#071A41]"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Product Info */}
          <div className="min-w-0">
            <div className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-[#B0832F] sm:mb-2.5 sm:text-[9px]">
              {product.category || "IndieKonnect Atelier"}
            </div>

            {/* Product name - one line with ellipsis */}
            <h1 className={`${marcellus.className} max-w-[620px] text-[24px] leading-[1.15] text-[#071A41] truncate sm:text-[30px] xl:text-[34px]`}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-2.5 sm:gap-2.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-[13px] w-[13px] sm:h-[14px] sm:w-[14px] ${
                      index < Math.floor(product.rating)
                        ? "fill-[#C89B3C] text-[#C89B3C]"
                        : index === Math.floor(product.rating) && product.rating % 1 >= 0.5
                        ? "fill-[#C89B3C] text-[#C89B3C]"
                        : "fill-transparent text-[#C89B3C]"
                    }`}
                    style={{
                      clipPath: index === Math.floor(product.rating) && product.rating % 1 >= 0.5
                        ? "inset(0 50% 0 0)"
                        : undefined,
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-black sm:text-[12px]">
                {product.rating.toFixed(1)} · {product.reviews?.toLocaleString() || 0} reviews
              </span>
              {userAccountType === "distributor" && (
                <span className="rounded-full bg-[#E8F4FD] px-2 py-0.5 text-[7px] font-bold text-[#0A5C8A] sm:ml-0.5 sm:text-[8px]">
                  Distributor
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mt-3 border-y border-[#E8E3D9] py-3 sm:mt-4 sm:py-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <span className="text-[24px] font-semibold tracking-[-0.03em] text-[#071A41] sm:text-[28px]">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.mrp > 0 && product.mrp > product.price && (
                  <>
                    <span className="text-[11px] text-[#9298A4] line-through sm:text-[12px]">
                      MRP: ₹{product.mrp.toLocaleString()}
                    </span>
                    {product.discount && product.discount > 0 && (
                      <span className="rounded-full bg-[#EDF7F0] px-2 py-0.5 text-[8px] font-bold text-[#16713C] sm:px-2.5 sm:py-1 sm:text-[9px]">
                        {product.discount}% OFF
                      </span>
                    )}
                  </>
                )}
                {product.isDealOfTheDay && product.isActiveDeal && (
                  <span className="rounded-full bg-[#FF6B35] px-2 py-0.5 text-[7px] font-bold text-white animate-pulse sm:px-2.5 sm:py-1 sm:text-[8px]">
                    🔥 Deal
                  </span>
                )}
              </div>
              <p className="mt-1 text-[10px] text-black/80 sm:text-[11px]">
                Inclusive of all taxes · Free shipping over ₹999
              </p>
            </div>

            {/* Product Meta */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[8px] text-[#697286] sm:mt-2.5 sm:text-[9px]">
              {product.productCode && (
                <>
                  <span>Product code: {product.productCode}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-[#C89B3C]" />
                </>
              )}
              <span className={product.inStock ? "font-medium text-[#16713C]" : "font-medium text-red-600"}>
                {product.inStock ? `${product.stockQuantity} in stock` : "Currently unavailable"}
              </span>
            </div>

            {/* Color & Size */}
            <div className="mt-3 space-y-3.5 sm:mt-4 sm:space-y-4.5">
              {/* Color */}
              <div>
                <div className="mb-2 flex items-center justify-between sm:mb-2.5">
                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#667085] sm:text-[9px]">
                    Color <span className="ml-1 text-[#071A41]">– {selectedColor}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {colorOptions.map((color) => {
                    const isSelected = selectedColor === color.name;
                    return (
                      <button
                        key={color.name}
                        type="button"
                        aria-label={`Select ${color.name}`}
                        title={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all sm:h-8 sm:w-8 ${
                          isSelected ? "scale-105" : "hover:scale-105"
                        }`}
                      >
                        <span
                          className="h-6 w-6 rounded-full border border-white shadow-sm sm:h-7 sm:w-7"
                          style={{ backgroundColor: color.value }}
                        />
                        {isSelected && <span className="absolute inset-[-2px] rounded-full border border-[#C89B3C]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size */}
              <div>
                <div className="mb-2 flex items-center justify-between sm:mb-2.5">
                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#667085] sm:text-[9px]">
                    Size <span className="ml-1 text-[#071A41]">– {selectedSize}</span>
                  </span>
                  <button type="button" className="text-[8px] font-semibold text-[#071A41] underline underline-offset-2 transition hover:text-[#B0832F] sm:text-[9px]">
                    Size guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sizeOptions.map((size) => {
                    const isDisabled = size === "XXL";
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedSize(size)}
                        className={`flex h-8 min-w-[34px] items-center justify-center rounded-lg border px-2.5 text-[9px] font-semibold transition-all sm:h-9 sm:min-w-[38px] sm:px-3 sm:text-[10px] ${
                          isSelected
                            ? "border-[#071A41] bg-[#071A41] text-white shadow-sm"
                            : isDisabled
                            ? "cursor-not-allowed border-[#EAE7E1] bg-white text-[#C8C8C8] line-through"
                            : "border-[#E5E0D7] bg-white text-[#071A41] hover:border-[#071A41] hover:bg-[#F8F6F1]"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Desktop Quantity + Actions - Hidden on mobile, visible on desktop */}
            <div className="mt-3.5 hidden flex-col gap-2.5 sm:flex sm:mt-4.5">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#667085] sm:text-[10px]">Quantity</span>
                <div className="flex h-8 items-center overflow-hidden rounded-full border border-[#DCD8D0] bg-white sm:h-9">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quantity <= 1}
                    className="flex h-full w-8 items-center justify-center text-[#071A41] transition hover:bg-[#F7F4EE] disabled:opacity-30 sm:w-9"
                  >
                    <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                  <span className="w-7 text-center text-[11px] font-semibold text-[#071A41] sm:w-8 sm:text-[12px]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("increment")}
                    disabled={quantity >= 10 || quantity >= (product.stockQuantity || 10)}
                    className="flex h-full w-8 items-center justify-center text-[#071A41] transition hover:bg-[#F7F4EE] disabled:opacity-30 sm:w-9"
                  >
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons - Desktop only */}
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <motion.button
                  whileTap={{ scale: product.inStock ? 0.985 : 1 }}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`ik-glass flex h-[42px] flex-1 items-center justify-center gap-2 rounded-full px-4 text-[10px] font-bold uppercase tracking-[0.08em] transition sm:h-[46px] sm:text-[11px] ${
                    product.inStock
                      ? "bg-[#071A41] text-white shadow-lg shadow-[#071A41]/10 hover:bg-[#10285C]"
                      : "cursor-not-allowed bg-[#E9E9E8] text-[#9CA3AF]"
                  }`}
                >
                  {isAddedToCart ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Add to Cart
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileTap={{ scale: product.inStock ? 0.985 : 1 }}
                  onClick={(e) => { fireRipple(e); handleBuyNow(); }}
                  disabled={!product.inStock}
                  className={`flex h-[42px] flex-1 items-center justify-center rounded-full border px-4 text-[10px] font-bold uppercase tracking-[0.08em] transition sm:h-[46px] sm:text-[11px] ${
                    product.inStock
                      ? "border-[#071A41] bg-white text-[#071A41] hover:bg-[#071A41] hover:text-white"
                      : "cursor-not-allowed border-[#D8D9DD] text-[#A4A8B1]"
                  }`}
                >
                  Buy Now
                </motion.button>
              </div>
            </div>

            {/* Trust Strip */}
            <div className="mt-4 grid grid-cols-1 gap-2 py-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-2.5 sm:py-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-[#E8E3D9] bg-white px-3 py-2 shadow-sm transition hover:shadow-md">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#C89B3C]/20 to-[#C89B3C]/5 sm:h-8 sm:w-8">
                  <RotateCcw className="h-3.5 w-3.5 text-[#C89B3C] sm:h-4 sm:w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-[#071A41] sm:text-[10px]">30-Day Returns</p>
                  <p className="text-[7px] text-[#8790A1] sm:text-[8px]">Hassle-free returns</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#E8E3D9] bg-white px-3 py-2 shadow-sm transition hover:shadow-md">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#C89B3C]/20 to-[#C89B3C]/5 sm:h-8 sm:w-8">
                  <Shield className="h-3.5 w-3.5 text-[#C89B3C] sm:h-4 sm:w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-[#071A41] sm:text-[10px]">Secure Checkout</p>
                  <p className="text-[7px] text-[#8790A1] sm:text-[8px]">Protected payments</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#E8E3D9] bg-white px-3 py-2 shadow-sm transition hover:shadow-md">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#C89B3C]/20 to-[#C89B3C]/5 sm:h-8 sm:w-8">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#C89B3C] sm:h-4 sm:w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-[#071A41] sm:text-[10px]">Quality Crafted</p>
                  <p className="text-[7px] text-[#8790A1] sm:text-[8px]">Handmade with love</p>
                </div>
              </div>
            </div>

            {/* Collapsible Accordion */}
            <div className="mt-2.5 border-t border-[#E5E0D7] sm:mt-3.5">
              {/* Description - Open by default */}
              <div className="border-b border-[#E5E0D7]">
                <button
                  type="button"
                  onClick={() => toggleTab("description")}
                  className="flex w-full items-center justify-between py-3 text-left sm:py-3.5"
                >
                  <span className="text-[10px] font-semibold text-[#071A41] sm:text-[11px]">Description</span>
                  {activeTab === "description" ? (
                    <ChevronDown className="h-3.5 w-3.5 text-[#B0832F] sm:h-4 sm:w-4" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-[#8B94A5] sm:h-4 sm:w-4" />
                  )}
                </button>
                <AnimatePresence initial>
                  {activeTab === "description" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4.5">
                        <p className="whitespace-pre-wrap text-[10px] leading-5 text-[#69758A] sm:text-[11px] sm:leading-6">
                          {product.description || "Premium quality product with exceptional design and craftsmanship."}
                        </p>
                        <div className="mt-3.5 space-y-2.5">
                          {["Premium quality material", "Ergonomic design for maximum comfort", "Sturdy construction & finish", "Perfect for living room, bedroom or office"].map((feature) => (
                            <div key={feature} className="flex items-center gap-2.5 text-[9px] text-[#526076] sm:text-[10px]">
                              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-[#C89B3C] sm:h-4 sm:w-4" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Specifications - Closed by default */}
              <div className="border-b border-[#E5E0D7]">
                <button
                  type="button"
                  onClick={() => toggleTab("specifications")}
                  className="flex w-full items-center justify-between py-3 text-left sm:py-3.5"
                >
                  <span className="text-[10px] font-semibold text-[#071A41] sm:text-[11px]">Specifications</span>
                  {activeTab === "specifications" ? (
                    <ChevronDown className="h-3.5 w-3.5 text-[#B0832F] sm:h-4 sm:w-4" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-[#8B94A5] sm:h-4 sm:w-4" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {activeTab === "specifications" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5.5">
                        <div className="mb-2 text-[11px] font-semibold text-[#071A41] sm:text-[13px]">Product Specifications</div>
                        <p className="mb-3.5 text-[8px] text-[#8992A3] sm:text-[9px]">Product details and specifications</p>
                        {renderSpecTable()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping & Returns - Closed by default */}
              <div className="border-b border-[#E5E0D7]">
                <button
                  type="button"
                  onClick={() => toggleTab("shipping")}
                  className="flex w-full items-center justify-between py-3 text-left sm:py-3.5"
                >
                  <span className="text-[10px] font-semibold text-[#071A41] sm:text-[11px]">Shipping & Returns</span>
                  {activeTab === "shipping" ? (
                    <ChevronDown className="h-3.5 w-3.5 text-[#B0832F] sm:h-4 sm:w-4" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-[#8B94A5] sm:h-4 sm:w-4" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {activeTab === "shipping" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-2.5 pb-5 sm:grid-cols-3 sm:gap-3">
                        <div className="rounded-xl border border-[#E5E0D7] bg-[#FAF9F7] p-3.5 text-center sm:p-4">
                          <Truck className="mx-auto h-4 w-4 text-[#C89B3C] sm:h-5 sm:w-5" />
                          <h3 className="mt-1.5 text-[10px] font-semibold text-[#071A41] sm:text-[11px]">Free Shipping</h3>
                          <p className="mt-0.5 text-[8px] text-[#697286] sm:text-[9px]">On orders above ₹999</p>
                        </div>
                        <div className="rounded-xl border border-[#E5E0D7] bg-[#FAF9F7] p-3.5 text-center sm:p-4">
                          <RotateCcw className="mx-auto h-4 w-4 text-[#C89B3C] sm:h-5 sm:w-5" />
                          <h3 className="mt-1.5 text-[10px] font-semibold text-[#071A41] sm:text-[11px]">Easy Returns</h3>
                          <p className="mt-0.5 text-[8px] text-[#697286] sm:text-[9px]">7 days return policy</p>
                        </div>
                        <div className="rounded-xl border border-[#E5E0D7] bg-[#FAF9F7] p-3.5 text-center sm:p-4">
                          <Shield className="mx-auto h-4 w-4 text-[#C89B3C] sm:h-5 sm:w-5" />
                          <h3 className="mt-1.5 text-[10px] font-semibold text-[#071A41] sm:text-[11px]">Secure Checkout</h3>
                          <p className="mt-0.5 text-[8px] text-[#697286] sm:text-[9px]">Safe and secure payments</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reviews - Closed by default */}
              <div className="border-b border-[#E5E0D7]">
                <button
                  type="button"
                  onClick={() => toggleTab("reviews")}
                  className="flex w-full items-center justify-between py-3 text-left sm:py-3.5"
                >
                  <span className="text-[10px] font-semibold text-[#071A41] sm:text-[11px]">
                    Reviews ({product.reviews?.toLocaleString() || 0})
                  </span>
                  {activeTab === "reviews" ? (
                    <ChevronDown className="h-3.5 w-3.5 text-[#B0832F] sm:h-4 sm:w-4" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-[#8B94A5] sm:h-4 sm:w-4" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {activeTab === "reviews" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5.5">
                        {product.reviews > 0 ? (
                          <>
                            <div className="flex flex-col justify-between gap-3.5 sm:flex-row sm:items-center">
                              <div>
                                <h3 className="text-[12px] font-semibold text-[#071A41] sm:text-[14px]">Customer Reviews</h3>
                                <p className="mt-0.5 text-[8px] text-[#8992A3] sm:text-[9px]">Based on {product.reviews} reviews</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, index) => (
                                    <Star
                                      key={index}
                                      className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                                        index < Math.floor(product.rating)
                                          ? "fill-[#C89B3C] text-[#C89B3C]"
                                          : "fill-[#ECECEC] text-[#ECECEC]"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[9px] font-semibold text-[#071A41] sm:text-[10px]">
                                  {product.rating.toFixed(1)} / 5
                                </span>
                              </div>
                            </div>
                            {ratingBreakdown.some((r) => r.pct > 0) && (
                              <div className="mt-4.5 space-y-2.5">
                                {ratingBreakdown.map((rating) => rating.pct > 0 && (
                                  <div key={rating.stars} className="flex items-center gap-2 text-[9px] sm:text-[10px]">
                                    <span className="w-10 text-[#596275] sm:w-11">{rating.stars} star</span>
                                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#ECEAE6] sm:h-1.5">
                                      <div
                                        className="h-full rounded-full bg-[#C89B3C] transition-all duration-500"
                                        style={{ width: `${rating.pct}%` }}
                                      />
                                    </div>
                                    <span className="w-7 text-right text-[#8992A3] sm:w-8">{rating.pct}%</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-4.5 space-y-3.5">
                              <div className="rounded-xl border border-[#E5E0D7] bg-white p-3.5 sm:p-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                                          i < Math.floor(product.rating)
                                            ? "fill-[#C89B3C] text-[#C89B3C]"
                                            : "fill-[#ECECEC] text-[#ECECEC]"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[9px] text-[#8992A3] sm:text-[10px]">Verified Purchase</span>
                                </div>
                                <p className="mt-1.5 text-[10px] text-[#69758A] sm:text-[11px]">
                                  Great product! Highly recommend. Quality is excellent and exactly as described.
                                </p>
                                <p className="mt-0.5 text-[8px] text-[#8992A3] sm:text-[9px]">- Customer</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col justify-between gap-3.5 sm:flex-row sm:items-center">
                              <div>
                                <h3 className="text-[12px] font-semibold text-[#071A41] sm:text-[14px]">Customer Reviews</h3>
                                <p className="mt-0.5 text-[8px] text-[#8992A3] sm:text-[9px]">Based on 0 reviews</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, index) => (
                                    <Star key={index} className="h-3 w-3 fill-[#ECECEC] text-[#ECECEC] sm:h-3.5 sm:w-3.5" />
                                  ))}
                                </div>
                                <span className="text-[10px] font-semibold text-[#071A41] sm:text-[11px]">0.0 / 5</span>
                              </div>
                            </div>
                            <div className="mt-4.5 space-y-2.5">
                              {[5, 4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="flex items-center gap-2 text-[9px] sm:text-[10px]">
                                  <span className="w-10 text-[#596275] sm:w-11">{rating} star</span>
                                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#ECEAE6] sm:h-1.5">
                                    <div className="h-full rounded-full bg-[#C89B3C]" style={{ width: "0%" }} />
                                  </div>
                                  <span className="w-7 text-right text-[#8992A3] sm:w-8">0%</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {similarProducts.length > 0 && (
          <section className="mt-10 sm:mt-12 lg:mt-16">
            <div className="mb-5 text-center sm:mb-6">
              <p className="mb-1 text-[7px] font-bold uppercase tracking-[0.25em] text-[#B0832F] sm:text-[8px]">Curated for you</p>
              <h2 className={`${marcellus.className} text-xl text-[#071A41] md:text-2xl`}>You may also like</h2>
              <div className="mx-auto mt-2 h-px w-10 bg-[#C89B3C]" />
            </div>
            <div ref={sliderRef} className="grid grid-cols-2 gap-x-2.5 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-x-3.5 sm:gap-y-6">
              {similarProducts.map((similarProduct) => (
                <Link
                  key={similarProduct.id}
                  href={`/product/${similarProduct.slug}`}
                  className="group block min-w-0"
                  onMouseEnter={(e) => handleCartIconHover(similarProduct, e)}
                  onMouseLeave={handlePopupLeave}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-[#E8E3D9] bg-[#F7F4EE]">
                    <Image
                      src={similarProduct.image || "/indiekonnect-web/images/placeholder.jpg"}
                      alt={similarProduct.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); popHeart(e); toggleWishlist(similarProduct.id); }}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 shadow-md sm:h-7 sm:w-7"
                      aria-label="Add to wishlist"
                    >
                      <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${wishlistState[similarProduct.id] ? "fill-red-500 text-red-500" : "text-[#071A41]"}`} />
                    </button>
                    {similarProduct.discount && similarProduct.discount > 0 && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-[#071A41] px-1.5 py-0.5 text-[6px] font-bold text-white sm:px-2 sm:py-1 sm:text-[7px]">
                        {similarProduct.discount}% OFF
                      </span>
                    )}
                    {!similarProduct.inStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#071A41]/20">
                        <span className="rounded-full bg-white px-2 py-0.5 text-[7px] font-semibold text-[#071A41] sm:px-3 sm:py-1 sm:text-[8px]">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-center sm:mt-2.5">
                    <h3 className="line-clamp-1 text-[10px] font-medium text-[#343B4A] sm:text-[11px]">{similarProduct.name}</h3>
                    <div className="mt-0.5 flex items-center justify-center gap-1.5 sm:mt-1">
                      <span className="text-[11px] font-semibold text-[#071A41] sm:text-[13px]">₹{similarProduct.price.toLocaleString()}</span>
                      {similarProduct.originalPrice > 0 && similarProduct.originalPrice > similarProduct.price && (
                        <span className="text-[8px] text-[#9AA0AA] line-through sm:text-[9px]">₹{similarProduct.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center justify-center gap-0.5 sm:mt-1">
                      <span className="text-[8px] tracking-wide text-[#C89B3C] sm:text-[9px]">{renderRatingStars(similarProduct.rating)}</span>
                      <span className="text-[7px] text-[#9AA0AA] sm:text-[8px]">({similarProduct.reviews || 0})</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Sticky Bar - Only visible on mobile, hidden on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#E5E0D7] bg-white/95 px-2.5 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(7,26,65,0.08)] backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-1.5">
          <div className="flex h-[40px] flex-shrink-0 items-center overflow-hidden rounded-full border border-[#DCD8D0] bg-white">
            <button
              type="button"
              onClick={() => handleQuantityChange("decrement")}
              disabled={quantity <= 1}
              className="flex h-full w-7 items-center justify-center text-[#071A41] disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="h-2.5 w-2.5" />
            </button>
            <span className="w-5 text-center text-[10px] font-semibold text-[#071A41]">{quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange("increment")}
              disabled={quantity >= 10 || quantity >= (product.stockQuantity || 10)}
              className="flex h-full w-7 items-center justify-center text-[#071A41] disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="h-2.5 w-2.5" />
            </button>
          </div>

          <motion.button
            whileTap={{ scale: product.inStock ? 0.97 : 1 }}
            onClick={(e) => { fireRipple(e); handleAddToCart(e); }}
            disabled={!product.inStock}
            className={`ik-glass flex h-[40px] min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2.5 text-[8px] font-bold uppercase tracking-[0.05em] ${
              product.inStock
                ? "bg-[#071A41] text-white shadow-lg shadow-[#071A41]/10"
                : "cursor-not-allowed bg-[#E9E9E8] text-[#9CA3AF]"
            }`}
          >
            {isAddedToCart ? (
              <>
                <CheckCircle className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Add to Cart</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: product.inStock ? 0.97 : 1 }}
            onClick={(e) => { fireRipple(e); handleBuyNow(); }}
            disabled={!product.inStock}
            className={`flex h-[40px] flex-1 items-center justify-center rounded-full border px-2.5 text-[8px] font-bold uppercase tracking-[0.05em] ${
              product.inStock
                ? "border-[#071A41] bg-white text-[#071A41]"
                : "cursor-not-allowed border-[#D8D9DD] text-[#A4A8B1]"
            }`}
          >
            Buy Now
          </motion.button>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {isFullscreen && gallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
            onClick={closeFullscreen}
          >
            <button
              type="button"
              onClick={closeFullscreen}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              aria-label="Close fullscreen"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="absolute left-1/2 top-4 -translate-x-1/2 text-sm text-white/60">
              {fullscreenImageIndex + 1} / {gallery.length}
            </div>
            <div className="relative h-[80vh] w-[90vw] max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <Image
                src={gallery[fullscreenImageIndex] || product.image}
                alt={product.name}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
            <button
              type="button"
              onClick={prevFullscreenImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              type="button"
              onClick={nextFullscreenImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex max-w-[80vw] -translate-x-1/2 gap-2 overflow-x-auto px-4">
              {gallery.map((img: string, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFullscreenImageIndex(index); }}
                  className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border-2 transition ${
                    index === fullscreenImageIndex ? "border-[#C89B3C]" : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image src={img || "/indiekonnect-web/images/placeholder.jpg"} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (max-width: 639px) {
          html { scroll-behavior: smooth; }
          body { overflow-x: hidden; }
        }
      `}</style>

      <style jsx global>{`
        .ik-glass { position: relative; overflow: hidden; }
        .ik-glass::after {
          content: "";
          position: absolute;
          top: 0;
          left: -65%;
          width: 45%;
          height: 100%;
          pointer-events: none;
          transform: skewX(-18deg);
          background: linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
        }
        .ik-glass:hover::after { animation: ikSheen 0.5s ease-out forwards; }
        @keyframes ikSheen { from { left: -65%; } to { left: 120%; } }
        .ik-ripple {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.28;
          pointer-events: none;
          animation: ikRip 0.7s cubic-bezier(0.2,0.8,0.2,1) forwards;
        }
        @keyframes ikRip { to { transform: scale(15); opacity: 0; } }
        .ik-heart-pop { animation: ikHeart 0.55s cubic-bezier(0.2,0.9,0.2,1); }
        @keyframes ikHeart { 0% { transform: scale(1); } 40% { transform: scale(1.5); } 70% { transform: scale(0.88); } 100% { transform: scale(1); } }
        .ik-bump { animation: ikBump 0.5s cubic-bezier(0.2,0.9,0.2,1); }
        @keyframes ikBump { 0% { transform: scale(1); } 45% { transform: scale(1.5); } 100% { transform: scale(1); } }
        .ik-fly-ghost {
          position: fixed;
          z-index: 9997;
          border-radius: 12px;
          pointer-events: none;
          background-size: cover;
          background-position: center;
          box-shadow: 0 18px 40px rgba(0,0,0,0.25);
        }
        @media (max-width: 639px) { .ik-fly-ghost { border-radius: 10px; } }
        @media (prefers-reduced-motion: reduce) {
          .ik-glass::after, .ik-ripple, .ik-heart-pop, .ik-bump { display: none; animation: none; }
        }
      `}</style>

      <Footer />
    </div>
  );
}