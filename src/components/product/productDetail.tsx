"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Heart,
  Package,
  CreditCard,
  Headphones,
  Minus,
  Plus,
  CheckCircle,
  ArrowLeft,
  ShoppingBag,
  ChevronRight,
  ChevronDown,
  X,
  ChevronLeft,
  ArrowRight,
  MessageCircle,
  ThumbsUp,
  Send,
  ZoomIn,
  BadgeCheck,
  Loader2,
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
import Loader from "../ui/Spinner/Loader";
import { useGetUserProfileQuery } from "@/lib/redux/api/Profile/userApi";
import { Lora } from "next/font/google";
import {
  useAddRatingReviewMutation,
  useGetMyOrdersQuery,
} from "@/lib/redux/api/order/orderApi";

const serif = Lora({ subsets: ["latin"], weight: ["500", "600"] });

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

function flyImageToCart(sourceEl: HTMLElement | null, imgSrc: string) {
  if (prefersReduced() || !sourceEl) return;
  const target = document.querySelector("#cart-icon") as HTMLElement | null;
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
  const dx = b.left - a.left + b.width / 2 - a.width / 2;
  const dy = b.top - a.top + b.height / 2 - a.height / 2;
  const anim = ghost.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.35 - 90}px) scale(.6)`,
        opacity: 0.95,
        offset: 0.55,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(.06)`, opacity: 0 },
    ],
    { duration: 900, easing: "cubic-bezier(.5,-.2,.35,1)" },
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
  if (
    accountType === "distributor" ||
    accountType === "Distributor" ||
    accountType === "DISTRIBUTOR"
  ) {
    return "distributor";
  }
  return "retail";
};

const getUserId = (profileData: any): string | null => {
  if (!profileData) return null;

  const id =
    profileData?.user?.id ??
    profileData?.data?.user?.id ??
    profileData?.data?.id ??
    profileData?.id ??
    null;

  return id == null ? null : String(id);
};

export default function ProductDetail({ productSlug }: ProductDetailProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // State
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [wishlistState, setWishlistState] = useState<Record<number, boolean>>(
    {},
  );
  const mainImageBoxRef = useRef<HTMLDivElement>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [selectedVariantAttributes, setSelectedVariantAttributes] = useState<Record<string, string>>({});
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // API
  const {
    data: productData,
    isLoading: isProductLoading,
    error,
    refetch: refetchProduct,
  } = useGetProductBySlugQuery(productSlug, {
    skip: !productSlug,
  });
  const { data: wishlistData, refetch: refetchWishlist } =
    useGetWishlistQuery();
  const { data: userProfileData } = useGetUserProfileQuery();
  const userAccountType = getUserAccountType(userProfileData);
  const currentUserId = getUserId(userProfileData);

  // The review API requires a real order_id and order_line_id.
  // Fetch the current user's orders and select an eligible line for this product.
  const {
    data: myOrdersData,
    isLoading: isOrdersLoading,
  } = useGetMyOrdersQuery();

  const categoryId =
    productData?.data?.category_id || productData?.category_id || null;
  const { data: categoryProductsData } = useGetProductsByCategoryQuery(
    categoryId,
    { skip: !categoryId },
  );
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();
  const [addRatingReview] = useAddRatingReviewMutation();

  const apiProduct = productData?.data ?? productData;

  // Reviews come from the API as { summary: {...}, data: [...] }.
  // Fall back to the legacy `reviews_summary` shape if that's what the API returns.
  const reviewsSummary =
    apiProduct?.reviews?.summary ?? apiProduct?.reviews_summary ?? null;
  const reviewsList: any[] = Array.isArray(apiProduct?.reviews?.data)
    ? apiProduct.reviews.data
    : [];

  // Existing review is only informational. It must NOT hide the Add Review form.
  const myReview = useMemo(() => {
    if (currentUserId == null) return null;

    return (
      reviewsList.find(
        (review: any) =>
          String(review?.user?.id ?? "") === String(currentUserId),
      ) ?? null
    );
  }, [reviewsList, currentUserId]);

  // Find a valid order line for this exact product.
  // The backend rejects order_line_id = 0 and requires order_id.
  const reviewableOrderLine = useMemo(() => {
    if (!apiProduct?.id) return null;

    const source = myOrdersData?.data;
    if (!Array.isArray(source)) return null;

    const lines: any[] = [];

    const collectLine = (item: any, parentOrder: any = null) => {
      if (!item || typeof item !== "object") return;

      const lineId = item?.line_id ?? item?.order_line_id ?? item?.id ?? null;
      const productId = item?.product_id ?? item?.product?.id ?? null;
      const orderId =
        item?.order_id ??
        item?.order?.id ??
        parentOrder?.order_id ??
        parentOrder?.id ??
        null;

      if (lineId != null && productId != null && orderId != null) {
        const nestedReview = item?.product_reviews ?? item?.reviews ?? [];
        const hasNestedReview = Array.isArray(nestedReview) && nestedReview.length > 0;

        lines.push({
          ...item,
          line_id: lineId,
          order_line_id: lineId,
          product_id: productId,
          order_id: orderId,
          order_status: item?.order_status ?? parentOrder?.order_status ?? null,
          delivery_status: item?.delivery_status ?? parentOrder?.delivery_status ?? null,
          is_reviewed: item?.is_reviewed ?? parentOrder?.is_reviewed ?? hasNestedReview,
        });
      }

      const nested =
        item?.order_lines ??
        item?.orderLines ??
        item?.lines ??
        item?.items ??
        null;

      if (Array.isArray(nested)) {
        nested.forEach((child: any) => collectLine(child, item));
      }
    };

    source.forEach((item: any) => collectLine(item));

    const matching = lines.filter(
      (line: any) => String(line.product_id) === String(apiProduct.id),
    );

    const isReviewed = (line: any) =>
      line?.is_reviewed === true ||
      line?.is_reviewed === 1 ||
      String(line?.is_reviewed).toLowerCase() === "true";

    const isDelivered = (line: any) =>
      String(line?.delivery_status ?? line?.order_status ?? "").toLowerCase() ===
      "delivered";

    // Best case: delivered + not reviewed.
    const deliveredUnreviewed = matching.find(
      (line) => isDelivered(line) && !isReviewed(line),
    );
    if (deliveredUnreviewed) return deliveredUnreviewed;

    // Some APIs do not expose delivery_status at line level, so use any unreviewed purchase.
    const unreviewed = matching.find((line) => !isReviewed(line));
    if (unreviewed) return unreviewed;

    // Important: do NOT fall back to the already-reviewed line. The backend will reject it.
    return null;
  }, [myOrdersData, apiProduct?.id]);

  // Only real, saved variants should drive the color/size UI.
  const hasVariants =
    Array.isArray(apiProduct?.variants) && apiProduct.variants.length > 0;

  const parseJsonObject = (value: any): Record<string, any> => {
    if (!value) return {};
    if (typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch {
        return {};
      }
    }
    return {};
  };

  const apiAvailableAttributes = parseJsonObject(apiProduct?.available_attributes);

  const variantAttributeOptions = useMemo(() => {
    const result: Record<string, string[]> = {};

    Object.entries(apiAvailableAttributes).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        result[key] = values.map((value) => String(value)).filter(Boolean);
      }
    });

    if (Object.keys(result).length === 0 && Array.isArray(apiProduct?.variants)) {
      apiProduct.variants.forEach((variant: any) => {
        const attrs = parseJsonObject(variant?.attributes);
        Object.entries(attrs).forEach(([key, value]) => {
          if (!result[key]) result[key] = [];
          const stringValue = String(value);
          if (stringValue && !result[key].includes(stringValue)) {
            result[key].push(stringValue);
          }
        });
      });
    }

    return result;
  }, [apiProduct?.available_attributes, apiProduct?.variants]);

  const variantEntries = useMemo(() => {
    if (!Array.isArray(apiProduct?.variants)) return [];

    return apiProduct.variants.map((variant: any) => ({
      ...variant,
      parsedAttributes: parseJsonObject(variant?.attributes),
    }));
  }, [apiProduct?.variants]);

  const selectedVariant = useMemo(() => {
    if (!variantEntries.length) return null;

    const selectedKeys = Object.keys(selectedVariantAttributes);
    if (!selectedKeys.length) return variantEntries[0];

    return (
      variantEntries.find((variant: any) =>
        selectedKeys.every(
          (key) =>
            String(variant?.parsedAttributes?.[key] ?? "") ===
            String(selectedVariantAttributes[key]),
        ),
      ) ?? null
    );
  }, [variantEntries, selectedVariantAttributes]);

  useEffect(() => {
    if (!Object.keys(variantAttributeOptions).length) return;

    setSelectedVariantAttributes((current) => {
      const next = { ...current };

      Object.entries(variantAttributeOptions).forEach(([key, values]) => {
        if ((!next[key] || !values.includes(next[key])) && values.length > 0) {
          next[key] = values[0];
        }
      });

      return next;
    });
  }, [variantAttributeOptions]);

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
      price:
        userAccountType === "distributor"
          ? Number(apiProduct.distributor_price || 0)
          : Number(apiProduct.retail_price || 0),
      mrp:
        userAccountType === "distributor"
          ? Number(apiProduct.distributor_mrp || 0)
          : Number(apiProduct.retail_mrp || 0),
      originalPrice:
        userAccountType === "distributor"
          ? Number(apiProduct.distributor_mrp || 0)
          : Number(apiProduct.retail_mrp || 0),
      discount:
        userAccountType === "distributor"
          ? Number(apiProduct.distributor_mrp || 0) > 0 &&
            Number(apiProduct.distributor_price || 0) > 0
            ? Math.round(
              ((Number(apiProduct.distributor_mrp) -
                Number(apiProduct.distributor_price)) /
                Number(apiProduct.distributor_mrp)) *
              100,
            )
            : null
          : Number(apiProduct.retail_mrp || 0) > 0 &&
            Number(apiProduct.retail_price || 0) > 0
            ? Math.round(
              ((Number(apiProduct.retail_mrp) -
                Number(apiProduct.retail_price)) /
                Number(apiProduct.retail_mrp)) *
              100,
            )
            : null,
      image:
        apiProduct.primary_image_url ||
        apiProduct.images?.[0]?.image_url ||
        "/indiekonnect-web/images/placeholder.jpg",
      images: apiProduct.images || [],
      rating: Number(reviewsSummary?.average_rating || 0),
      reviews: Number(reviewsSummary?.total_reviews || 0),
      inStock:
        (apiProduct.stock_status === "active" ||
          apiProduct.status === "active") &&
        Number(apiProduct.stock_quantity) > 0,
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
      const exists = wishlistData.data.some(
        (item: any) => item.product_id === product.id,
      );
      setIsWishlisted(exists);
    }
  }, [wishlistData, product?.id]);

  useEffect(() => {
    if (wishlistData?.data) {
      const map: Record<number, boolean> = {};
      wishlistData.data.forEach((item: any) => {
        map[item.product_id] = true;
      });
      setWishlistState(map);
    }
  }, [wishlistData]);

  // Similar products
  const similarProducts = Array.isArray(categoryProductsData?.data)
    ? categoryProductsData.data.slice(0, 12).map((p: any) => {
      const isDistributor = userAccountType === "distributor";
      const price = isDistributor
        ? Number(p.distributor_price || 0)
        : Number(p.retail_price || 0);
      const mrp = isDistributor
        ? Number(p.distributor_mrp || 0)
        : Number(p.retail_mrp || 0);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category?.name || "Uncategorized",
        price,
        originalPrice: mrp,
        discount:
          mrp > 0 && price > 0
            ? Math.round(((mrp - price) / mrp) * 100)
            : null,
        image:
          p.primary_image_url ||
          p.images?.find((img: any) => img.is_primary)?.image_url ||
          p.images?.[0]?.image_url ||
          "/indiekonnect-web/images/placeholder.jpg",
        rating: p.reviews?.summary?.average_rating ?? p.reviews_summary?.average_rating ?? 4.5,
        reviews: p.reviews?.summary?.total_reviews ?? p.reviews_summary?.total_reviews ?? 0,
        inStock:
          (p.stock_status === "active" || p.status === "active") &&
          Number(p.stock_quantity) > 0,
        stockQuantity: Number(p.stock_quantity || 0),
      };
    })
    : [];

  // =====================================================
  // HANDLE REVIEW SUBMIT WITH API INTEGRATION
  // =====================================================
  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!reviewName.trim() || !reviewEmail.trim() || !reviewTitle.trim()) {
      dispatch(
        showToast({
          message: "Please complete all required review fields.",
          type: "error",
        }),
      );
      return;
    }

    if (!product) {
      dispatch(
        showToast({
          message: "Product information is missing.",
          type: "error",
        }),
      );
      return;
    }

    setIsSubmittingReview(true);

    try {
      // The backend requires a valid order_id and order_line_id.
      if (reviewableOrderLine?.order_id == null) {
        dispatch(
          showToast({
            message: isOrdersLoading
              ? "Loading your order information. Please try again."
              : "No valid order was found for this product. Please review it from a delivered order.",
            type: "error",
          }),
        );
        return;
      }

      if (reviewableOrderLine?.line_id == null) {
        dispatch(
          showToast({
            message: "Valid order line not found for this product.",
            type: "error",
          }),
        );
        return;
      }

      const reviewData = {
        rating: Number(reviewRating),
        review_text: reviewTitle.trim(),
        order_id: Number(reviewableOrderLine.order_id),
        order_line_id: Number(reviewableOrderLine.line_id),
        product_id: Number(reviewableOrderLine.product_id || product.id),
        images: reviewImages,
      };

      console.log("Submitting review payload:", {
        order_id: reviewData.order_id,
        order_line_id: reviewData.order_line_id,
        product_id: reviewData.product_id,
      });

      // Call the API
      const result = await addRatingReview(reviewData).unwrap();
      
      // Keep the Add Review form available after a successful submission.
      setReviewSubmitted(false);
      dispatch(
        showToast({
          message: result?.message || "Thank you! Your review has been submitted successfully.",
          type: "success",
        }),
      );

      // Reset form
      setReviewName("");
      setReviewEmail("");
      setReviewTitle("");
      setReviewRating(5);
      setReviewImages([]);
      
      // Refetch product to get updated reviews
      await refetchProduct();

    } catch (error: any) {
      let errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to submit review. Please try again.";

      if (error?.data?.errors) {
        const validationMessages = Object.values(error.data.errors)
          .flat()
          .filter(Boolean)
          .map(String);

        if (validationMessages.length > 0) {
          errorMessage = validationMessages.join(" ");
        }
      }

      dispatch(
        showToast({
          message: errorMessage,
          type: "error",
        }),
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // =====================================================
  // HANDLE IMAGE UPLOAD FOR REVIEW
  // =====================================================
  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Limit to 5 images max
      const validFiles = files.slice(0, 5);
      setReviewImages((prev) => [...prev, ...validFiles]);
    }
  };

  const removeReviewImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) =>
        Math.min(prev + 1, Math.min(product?.stockQuantity || 10, 10)),
      );
    } else {
      setQuantity((prev) => Math.max(prev - 1, 1));
    }
  };

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
          }),
        );
      } else {
        await addToWishlist({ product_id: product.id }).unwrap();
        setIsWishlisted(true);
        dispatch(
          showToast({
            message: `${product.name} added to wishlist! ❤️`,
            type: "success",
          }),
        );
      }
      await refetchWishlist();
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to update wishlist",
          type: "error",
        }),
      );
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
        dispatch(
          showToast({ message: "Added to wishlist! ❤️", type: "success" }),
        );
      }
      await refetchWishlist();
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to update wishlist",
          type: "error",
        }),
      );
    }
  };

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

  const handleAddToCart = async (e?: React.MouseEvent<HTMLElement>) => {
    if (!product || !product.inStock) return;
    if (e) {
      fireRipple(e);
      flyImageToCart(
        mainImageBoxRef.current,
        gallery[activeImage] || product.image,
      );
    }
    try {
      await addToCart({ product_id: product.id, quantity }).unwrap();
      addToCartLocal(product, quantity);
      setIsAddedToCart(true);
      dispatch(
        showToast({
          message: `${product.name} added to cart successfully! 🛒`,
          type: "success",
        }),
      );
      setTimeout(() => setIsAddedToCart(false), 3000);
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to add item to cart",
          type: "error",
        }),
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
    setFullscreenImageIndex((prev) =>
      prev === 0 ? gallery.length - 1 : prev - 1,
    );
  };

  const nextFullscreenImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreenImageIndex((prev) =>
      prev === gallery.length - 1 ? 0 : prev + 1,
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isFullscreen) return;
    if (e.key === "Escape") closeFullscreen();
    else if (e.key === "ArrowLeft")
      setFullscreenImageIndex((prev) =>
        prev === 0 ? gallery.length - 1 : prev - 1,
      );
    else if (e.key === "ArrowRight")
      setFullscreenImageIndex((prev) =>
        prev === gallery.length - 1 ? 0 : prev + 1,
      );
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Zoom handlers — computes the lens position AND a matching, non-blurred
  // magnified preview so hovering the image gives a genuinely useful zoom.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);

  if (isProductLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader width={200} height={200} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h2 className="mb-3 text-2xl font-bold text-[#111111]">
            Product Not Found
          </h2>
          <p className="mb-6 text-base text-[#8A8A8A]">
            The product you're looking for doesn't exist or may have been
            removed.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D7D7D7] px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#FAFAFA]"
            >
              <ArrowLeft className="h-4 w-4" /> Go Back
            </button>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#292929]"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gallery =
    product.images && product.images.length > 0
      ? product.images
        .map((img: any) => img.image_url || img.image)
        .filter(Boolean)
      : [product.image];

  const parseSpecification = (spec: any) => {
    if (!spec) return null;
    if (typeof spec === "string") {
      try {
        return JSON.parse(spec);
      } catch {
        return null;
      }
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

  const activeImageSrc = gallery[activeImage] || product.image;

  return (
    <div className="min-h-screen bg-white font-sans text-[#171717]">
      <Header />

      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10 xl:px-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-6 text-[12px] text-[#8A8A8A]">
          <Link href="/" className="hover:text-[#111111]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#D0D0D0]" />
          <Link href="/products" className="hover:text-[#111111]">
            Products
          </Link>
          <ChevronRight className="h-3 w-3 text-[#D0D0D0]" />
          <span className="font-medium text-[#111111]">{product.category}</span>
          <ChevronRight className="h-3 w-3 text-[#D0D0D0]" />
          <span className="max-w-[160px] truncate font-medium text-[#111111]">
            {product.name}
          </span>
        </nav>

        {/* HERO */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[80px_1fr_0.9fr] lg:gap-5 xl:gap-7">
          {/* Thumbnails — vertical strip, desktop */}
          <div className="hide-scrollbar hidden max-h-[560px] flex-col gap-2 overflow-y-auto lg:flex">
            {gallery.map((img: string, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`relative h-[70px] w-[70px] flex-shrink-0 overflow-hidden rounded-[8px] border-2 transition ${activeImage === index
                  ? "border-[#111111]"
                  : "border-[#E5E5E5] hover:border-[#B8B8B8]"
                  }`}
              >
                <Image
                  src={img || "/indiekonnect-web/images/placeholder.jpg"}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover transition duration-300 hover:scale-105"
                  sizes="70px"
                />
              </button>
            ))}
          </div>

          {/* Main image + zoom */}
          <div className="flex min-w-0 flex-col gap-3">
            <div
              ref={mainImageBoxRef}
              className="group relative h-[420px] w-full cursor-crosshair overflow-hidden rounded-[14px] bg-[#F7F7F7] sm:h-[480px] lg:h-[560px]"
              onClick={() => openFullscreen(activeImage)}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0.2, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImageSrc}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Sampled-area outline on the image itself — shows exactly what the lens is showing */}
              {isZoomed && (
                <div
                  className="pointer-events-none absolute h-[110px] w-[110px] rounded-[8px] border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
                  style={{
                    left: `${zoomPosition.x}%`,
                    top: `${zoomPosition.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}

              {/* Zoom indicator */}
              <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-3.5 w-3.5" />
                Hover to zoom
              </div>

              <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717] shadow-sm">
                {product.category || "Blazer"}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWishlistToggle(e);
                }}
                disabled={isWishlistLoading}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105"
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`h-[17px] w-[17px] ${isWishlisted ? "fill-[#111111] text-[#111111]" : "text-[#171717]"}`}
                />
              </button>
              {product.discount && product.discount > 0 && (
                <span className="absolute bottom-4 left-4 rounded-full bg-[#111111] px-3 py-1.5 text-[10px] font-semibold tracking-wide text-white shadow-sm">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails — horizontal, mobile/tablet */}
            <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {gallery.map((img: string, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`relative h-[64px] w-[64px] flex-shrink-0 overflow-hidden rounded-[8px] border-2 transition ${activeImage === index
                    ? "border-[#111111]"
                    : "border-[#E5E5E5] hover:border-[#B8B8B8]"
                    }`}
                >
                  <Image
                    src={img || "/indiekonnect-web/images/placeholder.jpg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover transition duration-300 hover:scale-105"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Zoom preview panel — appears next to the image on large screens only */}
          <div className="min-w-0 pt-0">
            <AnimatePresence>
              {isZoomed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="relative mb-4 hidden aspect-square w-full overflow-hidden rounded-[14px] border border-[#E5E5E5] bg-[#F7F7F7] shadow-[0_10px_28px_-14px_rgba(0,0,0,0.25)] xl:block"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${activeImageSrc})`,
                      backgroundSize: "230%",
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8F8F8F]">
              {product.category || "Blazer"}
            </div>
            <h1
              className={`${serif.className} text-[26px] leading-[1.2] tracking-[-0.01em] text-[#171717] sm:text-[32px] xl:text-[36px]`}
            >
              {product.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-3.5 w-3.5 ${index < Math.floor(product.rating)
                      ? "fill-[#F6BE16] text-[#F6BE16]"
                      : "fill-[#F6BE16]/20 text-[#F6BE16]"
                      }`}
                  />
                ))}
              </div>
              <span className="text-[12px] text-[#6F6F6F]">
                {product.rating.toFixed(1)} ·{" "}
                {product.reviews?.toLocaleString() || 0} reviews
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3 pb-3">
              <span
                className={`${serif.className} text-[30px] font-semibold tracking-[-0.02em] text-[#111111] sm:text-[34px]`}
              >
                ₹{product.price.toLocaleString()}
              </span>
              {product.mrp > product.price && (
                <span className="pb-1 text-base text-[#A7A7A7] line-through">
                  ₹{product.mrp.toLocaleString()}
                </span>
              )}
            </div>

            {/* SKU / Stock — kept right beside the price so it's visible at a glance */}
            <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 border-b border-[#E5E5E5] pb-4 text-[11px] text-[#777]">
              <span>
                <span className="font-semibold text-[#222]">SKU:</span>{" "}
                {product.productCode || "N/A"}
              </span>
              <span>
                <span className="font-semibold text-[#222]">Stock:</span>{" "}
                {product.inStock ? `${product.stockQuantity}` : "Unavailable"}
              </span>
            </div>

            {/* Product variants from API */}
            {hasVariants && Object.keys(variantAttributeOptions).length > 0 && (
              <div className="border-b border-[#E5E5E5] py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-[#222]">
                    Variants
                  </p>
                  {selectedVariant && (
                    <span className="text-[10px] text-[#777]">
                      SKU: {selectedVariant?.sku || "N/A"}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {Object.entries(variantAttributeOptions).map(([attributeKey, values]) => (
                    <div key={attributeKey}>
                      <p className="mb-1.5 text-[12px] font-semibold text-[#222]">
                        {attributeKey
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                        {selectedVariantAttributes[attributeKey] ? (
                          <span className="ml-1 font-normal text-[#666]">
                            {selectedVariantAttributes[attributeKey]}
                          </span>
                        ) : null}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => {
                          const selected =
                            selectedVariantAttributes[attributeKey] === value;

                          const available = variantEntries.some((variant: any) => {
                            const matchesCurrentSelections = Object.entries(
                              selectedVariantAttributes,
                            ).every(([key, selectedValue]) => {
                              if (key === attributeKey) return true;
                              return String(variant?.parsedAttributes?.[key] ?? "") ===
                                String(selectedValue);
                            });

                            return (
                              matchesCurrentSelections &&
                              String(variant?.parsedAttributes?.[attributeKey] ?? "") ===
                                String(value)
                            );
                          });

                          return (
                            <button
                              key={`${attributeKey}-${value}`}
                              type="button"
                              disabled={!available}
                              onClick={() =>
                                setSelectedVariantAttributes((prev) => ({
                                  ...prev,
                                  [attributeKey]: value,
                                }))
                              }
                              className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                                selected
                                  ? "border-[#111111] bg-[#111111] text-white"
                                  : !available
                                    ? "border-[#E5E5E5] text-[#C0C0C0] line-through"
                                    : "border-[#D7D7D7] text-[#222] hover:border-[#111111]"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedVariant && (
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-[8px] bg-[#FAFAFA] p-3 text-[10px] text-[#777] sm:grid-cols-4">
                    <div>
                      <span className="block text-[#999]">Retail</span>
                      <span className="font-semibold text-[#222]">
                        ₹{Number(selectedVariant.retail_price || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#999]">Distributor</span>
                      <span className="font-semibold text-[#222]">
                        ₹{Number(selectedVariant.distributor_price || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#999]">Stock</span>
                      <span className="font-semibold text-[#222]">
                        {Number(selectedVariant.stock_quantity || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#999]">Status</span>
                      <span className="font-semibold text-[#222]">
                        {selectedVariant.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="border-b border-[#E5E5E5] py-4">
              <p className="mb-1.5 text-[12px] font-semibold text-[#222]">Quantity</p>
              <div className="inline-flex h-10 items-center rounded-full bg-[#111111] text-white">
                <button
                  type="button"
                  onClick={() => handleQuantityChange("decrement")}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center disabled:opacity-30"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange("increment")}
                  disabled={
                    quantity >= 10 ||
                    quantity >= (product.stockQuantity || 10)
                  }
                  className="flex h-10 w-10 items-center justify-center disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 py-4">
              <motion.button
                whileTap={{ scale: product.inStock ? 0.985 : 1 }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold uppercase tracking-[0.06em] transition ${product.inStock
                  ? "border-2 border-[#111111] bg-white text-[#111111] hover:bg-[#111111] hover:text-white"
                  : "cursor-not-allowed border-2 border-[#D8D8D8] text-[#A5A5A5]"
                  }`}
              >
                {isAddedToCart ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: product.inStock ? 0.985 : 1 }}
                onClick={(e) => {
                  fireRipple(e);
                  handleBuyNow();
                }}
                disabled={!product.inStock}
                className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold uppercase tracking-[0.06em] transition ${product.inStock
                  ? "bg-[#111111] text-white shadow-sm hover:bg-[#292929]"
                  : "cursor-not-allowed bg-[#ECECEC] text-[#A6A6A6]"
                  }`}
              >
                Buy Now
              </motion.button>
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-3 gap-3 border-t border-[#E5E5E5] pt-4">
              {[
                { icon: Package, label: "Free Shipping", sub: "₹999+" },
                { icon: CreditCard, label: "Flexible Payment", sub: "Secure" },
                { icon: Headphones, label: "24×7 Support", sub: "Online" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center"
                >
                  <Icon className="h-4 w-4 text-[#1B1B1B]" strokeWidth={1.5} />
                  <p className="mt-1 text-[10px] font-semibold leading-tight">
                    {label}
                  </p>
                  <p className="text-[10px] text-[#858585]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TABS */}
        <section className="mt-12 sm:mt-16">
          <div className="flex items-center gap-6 overflow-x-auto border-b border-[#E5E5E5] text-sm sm:gap-8">
            {[
              ["details", "Details"],
              ["reviews", "Reviews"],
              ["discussion", "Discussion"],
            ].map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative pb-3 text-sm font-medium transition ${activeTab === tab ? "text-[#171717]" : "text-[#A2A2A2] hover:text-[#4C4C4C]"
                  }`}
              >
                {label}
                {tab === "reviews" && (
                  <span className="ml-1 align-top text-[10px]">
                    ({product.reviews || 0})
                  </span>
                )}
                {activeTab === tab && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#171717]" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="grid grid-cols-1 gap-8 pt-7 lg:grid-cols-[1fr_260px]"
              >
                <div>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[#5C5C5C]">
                    {product.description ||
                      "Premium quality product with exceptional design and craftsmanship."}
                  </p>
                  <div className="mt-7 overflow-hidden rounded-[8px] border border-[#E5E5E5]">
                    <div className="border-b border-[#E5E5E5] bg-[#FBFBFB] px-4 py-2.5 text-xs font-semibold">
                      Specifications
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      {specRows.slice(0, 8).map(([label, value], index) => (
                        <div
                          key={label}
                          className={`flex items-center justify-between gap-4 border-b border-[#EDEDED] px-4 py-2.5 text-xs ${index % 2 === 0 ? "bg-white" : "bg-[#FCFCFC]"
                            }`}
                        >
                          <span className="text-[#858585]">{label}</span>
                          <span className="text-right font-semibold text-[#272727]">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <aside className="self-start rounded-[12px] bg-[#F3F3F3] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A7A7A]">
                    IndieKonnect
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-tight">
                    20% Off
                  </h3>
                  <div className="mt-3 flex gap-2">
                    {["PUMA", "amazon", "slack", "NIKE"].map((brand) => (
                      <div
                        key={brand}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[7px] font-bold text-[#454545]"
                      >
                        {brand}
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#727272] px-4 py-1.5 text-xs font-medium hover:bg-white">
                    View <ArrowRight className="h-3 w-3" />
                  </button>
                </aside>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="grid grid-cols-1 gap-8 pt-7 lg:grid-cols-[1fr_280px]"
              >
                <div>
                  {/* Add Review stays available for every logged-in user.
                      Existing reviews are shown below and do not hide this form. */}
                  {currentUserId && (
                    <div className="border-b border-[#E5E5E5] pb-7">
                      <h2 className="text-base font-semibold">Add Review</h2>
                      {myReview && (
                        <p className="mt-1 text-[11px] text-[#888]">
                          Your previous review is shown below. A new submission uses
                          a separate eligible order line from your orders.
                        </p>
                      )}

                      {!isOrdersLoading && !reviewableOrderLine && (
                        <p className="mt-2 rounded-[6px] bg-[#FFF7ED] px-3 py-2 text-[11px] text-[#9A5B00]">
                          No unreviewed order line was found for this product.
                          The review API requires a valid order and order line.
                        </p>
                      )}

                      <form
                        onSubmit={handleReviewSubmit}
                        className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2"
                      >
                        <input
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="Name*"
                          className="h-10 w-full rounded-[6px] border border-[#D9D9D9] px-3 text-sm outline-none focus:border-[#111]"
                          required
                        />
                        <input
                          type="email"
                          value={reviewEmail}
                          onChange={(e) => setReviewEmail(e.target.value)}
                          placeholder="Email*"
                          className="h-10 w-full rounded-[6px] border border-[#D9D9D9] px-3 text-sm outline-none focus:border-[#111]"
                          required
                        />
                        <div className="flex items-center gap-1 md:col-span-2">
                          <span className="text-sm text-[#777] mr-2">Rating:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-5 w-5 transition-colors ${star <= reviewRating
                                  ? "fill-[#F6BE16] text-[#F6BE16]"
                                  : "fill-transparent text-[#BEBEBE] hover:text-[#F6BE16]/50"
                                  }`}
                              />
                            </button>
                          ))}
                          <span className="text-sm text-[#777] ml-2">
                            {reviewRating} / 5
                          </span>
                        </div>
                        <textarea
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Write your review here...*"
                          rows={4}
                          className="w-full resize-none rounded-[6px] border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#111] md:col-span-2"
                          required
                        />
                        
                        {/* Image Upload for Review */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-[#555] mb-1.5">
                            Add Photos (Optional)
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-[#D9D9D9] px-4 py-2 text-xs font-medium text-[#555] hover:border-[#111] hover:bg-[#FAFAFA] transition">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleReviewImageUpload}
                                className="hidden"
                              />
                              Upload Images
                            </label>
                            <span className="text-[10px] text-[#999]">
                              Max 5 images
                            </span>
                          </div>
                          
                          {/* Preview uploaded images */}
                          {reviewImages.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {reviewImages.map((file, index) => (
                                <div key={index} className="relative h-16 w-16 rounded-[6px] border border-[#E5E5E5] overflow-hidden group">
                                  <Image
                                    src={URL.createObjectURL(file)}
                                    alt={`Review image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeReviewImage(index)}
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition shadow-sm"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingReview || isOrdersLoading || !reviewableOrderLine}
                          className="inline-flex w-fit h-10 items-center gap-1.5 rounded-full bg-[#111111] px-6 text-xs font-semibold text-white hover:bg-[#292929] transition disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                        >
                          {isSubmittingReview ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" />
                              Submit Review
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {!currentUserId && (
                    <div className="border-b border-[#E5E5E5] pb-5 text-xs text-[#777]">
                      <Link href="/login" className="text-[#111] font-semibold underline hover:no-underline">
                        Sign in
                      </Link> to leave a review.
                    </div>
                  )}

                  <div className="pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">All Reviews</h3>
                      <button className="flex items-center gap-1 rounded-full border border-[#E0E0E0] px-3 py-1 text-[10px] text-[#4A4A4A] hover:bg-[#FAFAFA]">
                        Sort <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>

                    {reviewsList.length === 0 ? (
                      <p className="mt-4 text-xs text-[#999]">
                        No reviews yet. Be the first to review this product.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-5">
                        {reviewsList.map((review: any) => (
                          <div key={review.id} className="flex gap-3 border-b border-[#F5F5F5] pb-4 last:border-0">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EFEFEF] text-[10px] font-bold text-[#555]">
                              {review.user?.profile_picture ? (
                                <Image
                                  src={review.user.profile_picture}
                                  alt={review.user?.full_name || "Reviewer"}
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                review.user?.full_name?.[0]?.toUpperCase() || "U"
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-semibold text-[#171717]">
                                  {review.user?.full_name || "Anonymous"}
                                </span>
                                {review.is_verified_purchase && (
                                  <span className="flex items-center gap-0.5 text-[9px] font-medium text-[#3E8E5A] bg-[#E8F5EE] px-1.5 py-0.5 rounded-full">
                                    <BadgeCheck className="h-3 w-3" /> Verified
                                  </span>
                                )}
                                <span className="text-[10px] text-[#999]">
                                  {review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : ''}
                                </span>
                              </div>
                              <div className="flex gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < Number(review.rating || 0)
                                      ? "fill-[#F6BE16] text-[#F6BE16]"
                                      : "fill-transparent text-[#DADADA]"
                                      }`}
                                  />
                                ))}
                              </div>
                              <p className="mt-1 text-xs text-[#303030] leading-relaxed">
                                {review.review_text}
                              </p>
                              {Array.isArray(review.images) &&
                                review.images.length > 0 && (
                                  <div className="mt-2 flex gap-1.5 flex-wrap">
                                    {review.images.map((img: any, idx: number) => (
                                      <div
                                        key={img.id || idx}
                                        className="relative h-14 w-14 overflow-hidden rounded-[6px] border border-[#E5E5E5] hover:border-[#111] transition cursor-pointer"
                                      >
                                        <Image
                                          src={img.image_url || img}
                                          alt={`Review ${idx + 1}`}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              <div className="mt-1.5 flex items-center gap-4 text-[10px] text-[#999]">
                                <button className="hover:text-[#333] transition">
                                  Reply
                                </button>
                                <button className="flex items-center gap-0.5 hover:text-[#333] transition">
                                  <ThumbsUp className="h-3 w-3" /> 0
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-[12px] border border-[#E5E5E5] p-5 text-center">
                    <div className="text-3xl font-semibold text-[#171717]">
                      {product.rating.toFixed(1)}
                    </div>
                    <div className="mt-0.5 text-xs text-[#777]">out of 5</div>
                    <div className="mt-2 flex justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-4 w-4 ${n <= Math.round(product.rating)
                            ? "fill-[#F6BE16] text-[#F6BE16]"
                            : "fill-transparent text-[#DADADA]"
                            }`}
                        />
                      ))}
                    </div>
                    <div className="mt-2 text-xs font-medium text-[#6B6B6B]">
                      {product.reviews || 0} reviews
                    </div>
                    {reviewsSummary?.rating_distribution && (
                      <div className="mt-4 space-y-1 text-left">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count =
                            Number(
                              reviewsSummary.rating_distribution?.[star] || 0,
                            );
                          const pct =
                            product.reviews > 0
                              ? Math.round((count / product.reviews) * 100)
                              : 0;
                          return (
                            <div
                              key={star}
                              className="flex items-center gap-2 text-[10px] text-[#777]"
                            >
                              <span className="w-6">{star}★</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EDEDED]">
                                <div
                                  className="h-full rounded-full bg-[#F6BE16]"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-5 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="rounded-[12px] bg-[#F1F1F1] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#767676]">
                      Top brands
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">20% Off</h3>
                    <div className="mt-3 flex gap-2">
                      {["PUMA", "amazon", "slack"].map((brand) => (
                        <div
                          key={brand}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[7px] font-bold text-[#454545]"
                        >
                          {brand}
                        </div>
                      ))}
                    </div>
                    <button className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#777] px-4 py-1.5 text-xs font-medium hover:bg-white">
                      View <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </aside>
              </motion.div>
            )}

            {activeTab === "discussion" && (
              <motion.div
                key="discussion"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="grid grid-cols-1 gap-6 pt-7 lg:grid-cols-[1fr_280px]"
              >
                <div className="rounded-[10px] border border-[#E5E5E5] p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F1F1F1]">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">
                        Have a question?
                      </h3>
                      <p className="text-xs text-[#777]">
                        Ask about sizing, fit, delivery or styling.
                      </p>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Write your question..."
                    className="mt-4 w-full resize-none rounded-[6px] border border-[#DBDBDB] p-3 text-sm outline-none focus:border-[#111]"
                  />
                  <button className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-5 py-2 text-xs font-semibold text-white hover:bg-[#292929]">
                    Post <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <aside className="self-start rounded-[10px] bg-[#F4F4F4] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#888]">
                    Need help?
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">24 × 7 Support</h3>
                  <p className="mt-1 text-xs text-[#777]">
                    Our team is here to help you.
                  </p>
                  <button className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#8C8C8C] px-4 py-1.5 text-xs font-medium hover:bg-white">
                    Contact <ArrowRight className="h-3 w-3" />
                  </button>
                </aside>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Related Products */}
        {similarProducts.length > 0 && (
          <section className="mt-14 border-t border-[#EFEFEF] pt-10 sm:mt-20 sm:pt-14">
            <div className="mb-7 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A9A9A]">
                  You may also like
                </p>
                <h2
                  className={`${serif.className} mt-1 text-2xl text-[#171717] sm:text-[28px]`}
                >
                  Related pieces
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
              {similarProducts.slice(0, 10).map((similarProduct, i) => (
                <motion.div
                  key={similarProduct.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: (i % 5) * 0.05 }}
                >
                  <Link
                    href={`/product/${similarProduct.slug}`}
                    className="group relative block"
                  >
                    <div className="relative aspect-[0.8] overflow-hidden rounded-[16px] bg-[#F4F4F4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_40px_-16px_rgba(0,0,0,0.18)]">
                      <Image
                        src={
                          similarProduct.image ||
                          "/indiekonnect-web/images/placeholder.jpg"
                        }
                        alt={similarProduct.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          popHeart(e);
                          toggleWishlist(similarProduct.id);
                        }}
                        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:scale-110"
                        aria-label="Toggle wishlist"
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${wishlistState[similarProduct.id]
                            ? "fill-[#111111] text-[#111111]"
                            : "text-[#111111]"
                            }`}
                        />
                      </button>
                      {similarProduct.discount > 0 && (
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#111111] px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white">
                          {similarProduct.discount}% OFF
                        </span>
                      )}

                      <div className="absolute inset-x-2.5 bottom-2.5 translate-y-3 opacity-0 transition-all duration-400 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCartLocal(similarProduct, 1);
                            dispatch(
                              showToast({
                                message: `${similarProduct.name} added to cart! 🛒`,
                                type: "success",
                              }),
                            );
                          }}
                          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white/95 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#111111] shadow-md backdrop-blur-sm transition hover:bg-[#111111] hover:text-white"
                        >
                          <ShoppingBag className="h-3 w-3" /> Quick add
                        </button>
                      </div>
                    </div>

                    <div className="pt-3">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#A6A6A6]">
                        {similarProduct.category}
                      </p>
                      <h3 className="mt-0.5 truncate text-[13px] font-medium text-[#1C1C1C] transition-colors group-hover:text-[#111111]">
                        {similarProduct.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-[#F6BE16] text-[#F6BE16]" />
                        <span className="text-[10px] text-[#8A8A8A]">
                          {similarProduct.rating?.toFixed?.(1) ??
                            similarProduct.rating}{" "}
                          ({similarProduct.reviews || 0})
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#111111]">
                          ₹{similarProduct.price.toLocaleString()}
                        </span>
                        {similarProduct.originalPrice >
                          similarProduct.price && (
                            <span className="text-[10px] text-[#B5B5B5] line-through">
                              ₹{similarProduct.originalPrice.toLocaleString()}
                            </span>
                          )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#E5E5E5] bg-white/95 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-10 items-center rounded-full bg-[#111111] text-white">
            <button
              onClick={() => handleQuantityChange("decrement")}
              disabled={quantity <= 1}
              className="flex h-10 w-8 items-center justify-center disabled:opacity-30"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-4 text-center text-xs font-semibold">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange("increment")}
              disabled={
                quantity >= 10 || quantity >= (product.stockQuantity || 10)
              }
              className="flex h-10 w-8 items-center justify-center disabled:opacity-30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex h-10 flex-1 items-center justify-center gap-1 rounded-full text-[10px] font-semibold uppercase ${product.inStock ? "bg-[#111111] text-white" : "bg-[#ECECEC] text-[#A5A5A5]"
              }`}
          >
            {isAddedToCart ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" />
            )}
            {isAddedToCart ? "Added" : "Add"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className={`flex h-10 flex-1 items-center justify-center rounded-full border text-[10px] font-semibold uppercase ${product.inStock ? "border-[#111111] bg-white text-[#111111]" : "border-[#D8D8D8] text-[#A5A5A5]"
              }`}
          >
            Buy
          </button>
        </div>
      </div>

      {/* Fullscreen */}
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
              onClick={closeFullscreen}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute left-1/2 top-4 -translate-x-1/2 text-xs text-white/60">
              {fullscreenImageIndex + 1} / {gallery.length}
            </div>
            <div
              className="relative h-[80vh] w-[90vw] max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={gallery[fullscreenImageIndex] || product.image}
                alt={product.name}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
            <button
              onClick={prevFullscreenImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextFullscreenImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex max-w-[80vw] -translate-x-1/2 gap-1.5 overflow-x-auto px-3">
              {gallery.map((img: string, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImageIndex(index);
                  }}
                  className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border-2 transition ${index === fullscreenImageIndex ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                >
                  <Image
                    src={img || "/indiekonnect-web/images/placeholder.jpg"}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
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
        .ik-ripple {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.28;
          pointer-events: none;
          animation: ikRip 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes ikRip {
          to {
            transform: scale(15);
            opacity: 0;
          }
        }
        .ik-heart-pop {
          animation: ikHeart 0.55s cubic-bezier(0.2, 0.9, 0.2, 1);
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
          animation: ikBump 0.5s cubic-bezier(0.2, 0.9, 0.2, 1);
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
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
        }
        @media (prefers-reduced-motion: reduce) {
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