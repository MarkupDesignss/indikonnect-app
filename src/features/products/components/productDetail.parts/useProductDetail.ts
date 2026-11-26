"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGetProductBySlugQuery, useGetProductsByCategoryQuery, useNotifyProductMutation, useCheckProductStockMutation } from "@/lib/redux/api/productApi";
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from "@/lib/redux/api/Wishlist/wishlistApi";
import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import { useAddRatingReviewMutation, useGetMyOrdersQuery } from "@/lib/redux/api/order/orderApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { getAppType } from "@/lib/appConfig";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { ProductDetailProps, fireRipple, flyImageToCart, getUserAccountType, getUserId, parseJsonObject, popHeart } from "@/features/products/components/productDetail.parts/support";
import { useProductModel } from "./useProductModel";
import { useProductVariants } from "./useProductVariants";
import { useRelatedProducts } from "./useRelatedProducts";
import { useProductMedia } from "./useProductMedia";

export function useProductDetail({ productSlug }: ProductDetailProps) {
const router = useRouter();

const pathname = usePathname();

const activeProductSlug = productSlug;

const [lastLoadedProduct, setLastLoadedProduct] = useState<any>(null);

const dispatch = useAppDispatch();

const { hasToken, appType } = useTokenCheck();

const currentAppType = typeof window !== "undefined" ? getAppType() : appType;

const isDistributorApp = currentAppType === "distributor";

useEffect(() => {
    if (!productSlug) {
      dispatch(
        showToast({
          message: "Invalid product URL",
          type: "error",
        }),
      );

      router.push("/products");
    }
  }, [productSlug, router, dispatch]);

const [quantity, setQuantity] = useState(1);

const [isWishlisted, setIsWishlisted] = useState(false);

const [isAddedToCart, setIsAddedToCart] = useState(false);
  const cartFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (cartFeedbackTimer.current !== null) clearTimeout(cartFeedbackTimer.current);
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

const [isBuyingNow, setIsBuyingNow] = useState(false);

const [showAllThumbnails, setShowAllThumbnails] = useState(false);

const MAX_VISIBLE_THUMBS = 5;

const [notifyProduct, { isLoading: isNotifyLoading }] =
    useNotifyProductMutation();

const [activeTab, setActiveTab] = useState("details");

const [activeImage, setActiveImage] = useState(0);

const [selectedVariantId, setSelectedVariantId] = useState<
    number | string | null
  >(null);

const [isWishlistLoading, setIsWishlistLoading] = useState(false);

const [wishlistState, setWishlistState] = useState<Record<number, boolean>>(
    {},
  );

const mainImageBoxRef = useRef<HTMLDivElement>(null);

const detailsSectionRef = useRef<HTMLElement>(null);

const [selectedVariantAttributes, setSelectedVariantAttributes] = useState<
    Record<string, string>
  >({});

const [reviewName, setReviewName] = useState("");

const [reviewEmail, setReviewEmail] = useState("");

const [reviewRating, setReviewRating] = useState(5);

const [reviewTitle, setReviewTitle] = useState("");

const [reviewImages, setReviewImages] = useState<File[]>([]);

const [isSubmittingReview, setIsSubmittingReview] = useState(false);

const [showRelatedSheet, setShowRelatedSheet] = useState(false);

const [showManufacturingInfo, setShowManufacturingInfo] = useState(false);

const [relatedSortOption, setRelatedSortOption] = useState<
    "recommended" | "price_asc" | "price_desc" | "newest"
  >("recommended");

const getLoginPath = () => {
    return currentAppType === "distributor"
      ? "/auth/distributor/login"
      : "/auth/customer/login";
  };

const buildProductPath = (slug: string): string => {
    const safeSlug = String(slug || "").trim();

    if (!safeSlug) return "/products";

    const current = pathname || "";

    const match = current.match(/^(.*\/product)\/[^/]+\/?$/);

    const base = match ? match[1] : "/product";

    return `${base}/${encodeURIComponent(safeSlug)}`;
  };

const {
    data: productData,
    isLoading: isProductLoading,
    error,
    refetch: refetchProduct,
  } = useGetProductBySlugQuery(activeProductSlug, {
    skip: !activeProductSlug,
  });

useEffect(() => {
    if (error && !lastLoadedProduct) {
      dispatch(
        showToast({
          message: "Product not found",
          type: "error",
        }),
      );

      router.push("/products");
    }
  }, [error, router, dispatch, lastLoadedProduct]);

useEffect(() => {
    if (error && lastLoadedProduct) {
      dispatch(
        showToast({
          message: "Could not load that color. Please try again.",
          type: "error",
        }),
      );
    }
  }, [error, dispatch, lastLoadedProduct]);

const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery(
    undefined,
    {
      skip: hasToken !== true,
    },
  );

const { data: userProfileData } = useGetUserProfileQuery(undefined, {
    skip: hasToken !== true,
  });

const userAccountType = useMemo(() => {
    if (userProfileData) {
      return getUserAccountType(userProfileData);
    }

    return currentAppType === "distributor" ? "distributor" : "retail";
  }, [userProfileData, currentAppType]);

const currentUserId = getUserId(userProfileData);

const {
    data: myOrdersData,
    refetch: refetchOrders,
  } = useGetMyOrdersQuery(undefined, {
    skip: hasToken !== true,
  });

const productPayload = productData as (typeof productData & { data?: typeof productData });
const categoryId =
    productPayload?.data?.category_id ?? productPayload?.category_id ?? null;

const { data: categoryProductsData } = useGetProductsByCategoryQuery(
    categoryId,
    {
      skip: !categoryId,
    },
  );

const [addToWishlist] = useAddToWishlistMutation();

const [removeFromWishlist] = useRemoveFromWishlistMutation();

const [addToCart] = useAddToCartMutation();

const [addRatingReview] = useAddRatingReviewMutation();

const [checkProductStock] = useCheckProductStockMutation();

const incomingProduct = productPayload?.data ?? productPayload;

if (incomingProduct?.id && incomingProduct !== lastLoadedProduct) {
    setLastLoadedProduct(incomingProduct);
  }

const apiProduct = incomingProduct?.id
    ? incomingProduct
    : lastLoadedProduct;

const {
    isCombo,
    comboItems,
    manufacturingInfo,
    reviewsSummary,
    reviewsList,
    product,
    productGallery,
    comboTotals,
  } = useProductModel(apiProduct, userAccountType);

const {
    variantEntries,
    hasVariants,
    variantAttributeOptions,
    displayVariants,
    isMainProductSelected,
    selectedVariant,
    selectedAllowsPurchaseWithoutStock,
    mainPurchaseAvailable,
    gallery,
  } = useProductVariants(apiProduct, product, productGallery, selectedVariantId);

useEffect(() => {
    setActiveImage(0);
  }, [selectedVariantId]);

useEffect(() => {
    if (!product) return;

    setSelectedVariantId(null);
    setSelectedVariantAttributes({});
    setActiveImage(0);
  }, [product?.id]);

const handleSelectMainProduct = () => {
    if (product?.slug && product.slug !== activeProductSlug) {
      router.replace(buildProductPath(product.slug), {
        scroll: false,
      });
    }

    setSelectedVariantId(null);
    setSelectedVariantAttributes({});
    setActiveImage(0);
  };

const handleSelectVariant = (variant: any) => {
    if (variant?.isMainProduct || variant?.id === "main-product") {
      handleSelectMainProduct();
      return;
    }

    if (
      variant?.slug &&
      String(variant?.product_id ?? variant?.id) !== String(product?.id)
    ) {
      setSelectedVariantId(variant.id);

      setSelectedVariantAttributes(
        variant?.parsedAttributes || parseJsonObject(variant?.attributes),
      );

      setActiveImage(0);
      setQuantity(1);

      if (variant.slug !== activeProductSlug) {
        router.replace(buildProductPath(variant.slug), {
          scroll: false,
        });
      }

      return;
    }

    setSelectedVariantId(variant.id);

    const attrs =
      variant?.parsedAttributes || parseJsonObject(variant?.attributes);

    setSelectedVariantAttributes({
      ...attrs,
    });

    setActiveImage(0);
  };

const handleAttributeSelect = (attributeKey: string, value: string) => {
    const nextAttributes = {
      ...selectedVariantAttributes,
      [attributeKey]: value,
    };

    setSelectedVariantAttributes(nextAttributes);

    const matchingVariant = variantEntries.find((variant: any) => {
      const attrs = variant?.parsedAttributes || {};

      return Object.entries(nextAttributes).every(
        ([key, selectedValue]) =>
          String(attrs?.[key] ?? "") === String(selectedValue),
      );
    });

    if (matchingVariant) {
      setSelectedVariantId(matchingVariant.id);
      setActiveImage(0);
    }
  };

useEffect(() => {
    if (hasToken !== true) {
      setIsWishlisted(false);
      setWishlistState({});
      return;
    }

    if (wishlistData?.data && product?.id) {
      const exists = wishlistData.data.some(
        (item: any) => String(item.product_id) === String(product.id),
      );

      setIsWishlisted(exists);
    }
  }, [wishlistData, product?.id, hasToken]);

useEffect(() => {
    if (hasToken !== true || !wishlistData?.data) return;

    const map: Record<number, boolean> = {};

    wishlistData.data.forEach((item: any) => {
      map[item.product_id] = true;
    });

    setWishlistState(map);
  }, [wishlistData, hasToken]);

const handleWishlistToggle = async (e?: React.MouseEvent<HTMLElement>) => {
    if (!product || isWishlistLoading) return;

    if (hasToken !== true) {
      router.push(getLoginPath());
      return;
    }

    if (e) popHeart(e);

    setIsWishlistLoading(true);

    try {
      if (isWishlisted) {
        await removeFromWishlist({
          product_id: product.id,
        }).unwrap();

        setIsWishlisted(false);

        dispatch(
          showToast({
            message: `${product.name} removed from wishlist`,
            type: "info",
          }),
        );
      } else {
        await addToWishlist({
          product_id: product.id,
        }).unwrap();

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
    if (hasToken !== true) {
      router.push(getLoginPath());
      return;
    }

    try {
      const exists = wishlistState[productId] || false;

      if (exists) {
        await removeFromWishlist({
          product_id: productId,
        }).unwrap();

        setWishlistState((prev) => ({
          ...prev,
          [productId]: false,
        }));

        dispatch(
          showToast({
            message: "Removed from wishlist",
            type: "info",
          }),
        );
      } else {
        await addToWishlist({
          product_id: productId,
        }).unwrap();

        setWishlistState((prev) => ({
          ...prev,
          [productId]: true,
        }));

        dispatch(
          showToast({
            message: "Added to wishlist! ❤️",
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
    }
  };

const checkFreshStock = async (
    productIdToCheck: number,
    qty: number,
    purchaseWithoutStock = false,
  ): Promise<boolean> => {
    const id = Number(productIdToCheck);
    const quantityToCheck = Number(qty);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isInteger(quantityToCheck) ||
      quantityToCheck <= 0
    ) {
      throw new Error(
        "Invalid product or quantity. Please refresh and try again.",
      );
    }

    // Whitelisted products may be purchased regardless of inventory.
    // Skip ONLY the stock check; the cart/order API remains authoritative.
    if (purchaseWithoutStock) return true;

    let result;

    try {
      result = await checkProductStock({
        product_id: id,
        quantity: quantityToCheck,
      }).unwrap();
    } catch (error: any) {
      throw new Error(
        error?.data?.message || "Unable to verify live stock. Please retry.",
      );
    }

    const stock = result?.data;

    if (
      result?.success !== true ||
      Number(stock?.product_id) !== id ||
      typeof stock?.available !== "boolean" ||
      !Number.isFinite(stock?.stock_quantity) ||
      stock.stock_quantity < 0
    ) {
      throw new Error("Invalid stock API response. Please retry.");
    }

    if (!stock.available || stock.stock_quantity < quantityToCheck) {
      throw new Error(
        "This product is currently out of stock or the requested quantity is unavailable.",
      );
    }

    return true;
  };

const handleAddToCart = async (e?: React.MouseEvent<HTMLElement>) => {
    if (!product || !mainPurchaseAvailable) return;

    if (hasToken !== true) {
      router.push(getLoginPath());
      return;
    }

    if (e) {
      fireRipple(e);

      flyImageToCart(
        mainImageBoxRef.current,
        gallery[activeImage] || product.image,
      );
    }

    try {
      await checkFreshStock(
        Number(product.id),
        quantity,
        selectedAllowsPurchaseWithoutStock,
      );

      const payload: any = {
        product_id: product.id,
        quantity,
      };

      await addToCart(payload).unwrap();

      setIsAddedToCart(true);

      dispatch(
        showToast({
          message: `${product.name} added to cart successfully! 🛒`,
          type: "success",
        }),
      );

      if (mountedRef.current) {
        if (cartFeedbackTimer.current !== null) clearTimeout(cartFeedbackTimer.current);
        cartFeedbackTimer.current = setTimeout(() => {
          cartFeedbackTimer.current = null;
          setIsAddedToCart(false);
        }, 3000);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to add item to cart",
          type: "error",
        }),
      );
    }
  };

const handleReadMore = () => {
    setActiveTab("details");

    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = null;
      detailsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

const handleViewComboDetails = () => {
    setActiveTab("combo");

    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = null;
      detailsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

const handleSelectComboImage = (imageUrl: string) => {
    const index = gallery.indexOf(imageUrl);

    if (index >= 0) {
      setActiveImage(index);
    }
  };

const handleBuyNow = async () => {
    if (!product || !mainPurchaseAvailable || isBuyingNow) return;

    if (hasToken !== true) {
      router.push(getLoginPath());
      return;
    }

    const productId = Number(product.id);

    const selectedVariantProductId = Number(
      selectedVariant?.product_id ?? selectedVariant?.id,
    );

    const variantId =
      !isMainProductSelected &&
      selectedVariant &&
      selectedVariantProductId === productId
        ? (selectedVariant.product_variant_id ?? selectedVariant.variant_id)
        : undefined;

    if (!Number.isFinite(productId) || productId <= 0) {
      dispatch(
        showToast({
          message: "Invalid product selected",
          type: "error",
        }),
      );
      return;
    }

    const purchaseQty = Math.max(1, Math.floor(Number(quantity) || 1));

    setIsBuyingNow(true);

    try {
      await checkFreshStock(
        productId,
        purchaseQty,
        selectedAllowsPurchaseWithoutStock,
      );

      const params = new URLSearchParams({
        checkout_type: "buy_now",
        product_id: String(productId),
        quantity: String(purchaseQty),
      });

      if (variantId != null) {
        params.set("variant_id", String(variantId));
      }

      router.push(`/checkout?${params.toString()}`);
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to process your order",
          type: "error",
        }),
      );
    } finally {
      setIsBuyingNow(false);
    }
  };

const handleNotifySubmit = async () => {
    if (!product || isNotifyLoading) return;

    if (hasToken !== true) {
      router.push(getLoginPath());
      return;
    }

    try {
      const result = await notifyProduct({
        product_id: Number(product.id),
      }).unwrap();

      dispatch(
        showToast({
          message:
            result?.message ||
            `We'll notify you when ${product.name} is back in stock!`,
          type: "success",
        }),
      );
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to request notification.",
          type: "error",
        }),
      );
    }
  };

const {
    isFullscreen,
    fullscreenImageIndex,
    setFullscreenImageIndex,
    openFullscreen,
    closeFullscreen,
    nextFullscreenImage,
    prevFullscreenImage,
    isReviewViewerOpen,
    reviewViewerImages,
    reviewViewerIndex,
    setReviewViewerIndex,
    openReviewViewer,
    closeReviewViewer,
    nextReviewViewerImage,
    prevReviewViewerImage,
  } = useProductMedia(gallery);

const hasUserReviewed = useMemo(() => {
    if (!currentUserId) return false;

    return reviewsList.some(
      (review: any) => String(review?.user?.id ?? "") === String(currentUserId),
    );
  }, [reviewsList, currentUserId]);

const reviewableOrderLine = useMemo(() => {
    if (!apiProduct?.id || !Array.isArray(myOrdersData?.data)) {
      return null;
    }

    const lines: any[] = [];

    const collectLine = (item: any, parent: any = null) => {
      if (!item || typeof item !== "object") return;

      const lineId = item?.line_id ?? item?.order_line_id ?? item?.id ?? null;

      const productId = item?.product_id ?? item?.product?.id ?? null;

      const orderId =
        item?.order_id ??
        item?.order?.id ??
        parent?.order_id ??
        parent?.id ??
        null;

      if (lineId != null && productId != null && orderId != null) {
        lines.push({
          ...item,
          line_id: lineId,
          order_line_id: lineId,
          product_id: productId,
          order_id: orderId,
          order_status: item?.order_status ?? parent?.order_status ?? null,
          delivery_status:
            item?.delivery_status ?? parent?.delivery_status ?? null,
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

    myOrdersData.data.forEach((item: any) => collectLine(item));

    const matching = lines.filter(
      (line) => String(line.product_id) === String(apiProduct.id),
    );

    const delivered = matching.find(
      (line) =>
        String(
          line.delivery_status ?? line.order_status ?? "",
        ).toLowerCase() === "delivered",
    );

    return delivered || matching[0] || null;
  }, [myOrdersData, apiProduct?.id]);

const canReview = Boolean(currentUserId && reviewableOrderLine);

const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!reviewTitle.trim()) {
      dispatch(
        showToast({
          message: "Please write your review.",
          type: "error",
        }),
      );

      return;
    }

    if (!product || !currentUserId || !reviewableOrderLine) {
      return;
    }

    setIsSubmittingReview(true);

    try {
      const payload = {
        rating: Number(reviewRating),
        review_text: reviewTitle.trim(),
        order_id: Number(reviewableOrderLine.order_id),
        order_line_id: Number(reviewableOrderLine.line_id),
        product_id: Number(reviewableOrderLine.product_id || product.id),
        images: reviewImages,
      };

      const result = await addRatingReview(payload).unwrap();

      dispatch(
        showToast({
          message: result?.message || "Review submitted successfully.",
          type: "success",
        }),
      );

      setReviewName("");
      setReviewEmail("");
      setReviewTitle("");
      setReviewRating(5);
      setReviewImages([]);

      await refetchProduct();
      await refetchOrders();
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to submit review.",
          type: "error",
        }),
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    setReviewImages((prev) => [...prev, ...files.slice(0, 5 - prev.length)]);

    e.target.value = "";
  };

const removeReviewImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

const { similarProducts, sortedSimilarProducts, visibleSimilarProducts } = useRelatedProducts(categoryProductsData, product?.id, userAccountType, relatedSortOption);

const [relatedBusyId, setRelatedBusyId] = useState<string | null>(null);

const addRelatedToCart = async (
    item: (typeof similarProducts)[number],
    buyNow: boolean,
  ) => {
    if (hasToken !== true) {
      router.push(getLoginPath());
      return;
    }

    if (!item.inStock || relatedBusyId !== null) return;

    setRelatedBusyId(String(item.id));

    try {
      await checkFreshStock(
        Number(item.id),
        1,
        Boolean(item.allowedWithoutStock),
      );

      await addToCart({
        product_id: item.id,
        quantity: 1,
      }).unwrap();

      if (buyNow) {
        setShowRelatedSheet(false);

        router.push(
          `/checkout?${new URLSearchParams({
            product_id: String(item.id),
            quantity: "1",
          }).toString()}`,
        );
      } else {
        dispatch(
          showToast({
            message: `${item.name} added to cart successfully`,
            type: "success",
          }),
        );
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Could not add this product",
          type: "error",
        }),
      );
    } finally {
      setRelatedBusyId(null);
    }
  };

useEffect(() => {
    if (!isProductLoading && !product && !error) {
      dispatch(
        showToast({
          message: "Product not found",
          type: "error",
        }),
      );

      router.push("/products");
    }
  }, [isProductLoading, product, error, router, dispatch]);

return {
    product,
    gallery,
    MAX_VISIBLE_THUMBS,
    setShowAllThumbnails,
    setActiveImage,
    activeImage,
    mainImageBoxRef,
    openFullscreen,
    selectedVariantId,
    isCombo,
    comboItems,
    handleWishlistToggle,
    isWishlistLoading,
    isWishlisted,
    setShowRelatedSheet,
    isDistributorApp,
    userAccountType,
    quantity,
    handleReadMore,
    handleViewComboDetails,
    handleSelectComboImage,
    comboTotals,
    hasVariants,
    variantAttributeOptions,
    selectedVariantAttributes,
    handleAttributeSelect,
    displayVariants,
    isMainProductSelected,
    handleSelectVariant,
    selectedVariant,
    mainPurchaseAvailable,
    handleBuyNow,
    isBuyingNow,
    handleAddToCart,
    isAddedToCart,
    handleNotifySubmit,
    isNotifyLoading,
    activeProductSlug,
    apiProduct,
    manufacturingInfo,
    setShowManufacturingInfo,
    detailsSectionRef,
    setActiveTab,
    activeTab,
    router,
    buildProductPath,
    currentUserId,
    getLoginPath,
    canReview,
    hasUserReviewed,
    handleReviewSubmit,
    reviewName,
    setReviewName,
    reviewEmail,
    setReviewEmail,
    setReviewRating,
    reviewRating,
    reviewTitle,
    setReviewTitle,
    handleReviewImageUpload,
    reviewImages,
    removeReviewImage,
    isSubmittingReview,
    reviewsList,
    openReviewViewer,
    reviewsSummary,
    similarProducts,
    relatedSortOption,
    setRelatedSortOption,
    visibleSimilarProducts,
    toggleWishlist,
    wishlistState,
    relatedBusyId,
    addRelatedToCart,
    isFullscreen,
    closeFullscreen,
    fullscreenImageIndex,
    prevFullscreenImage,
    nextFullscreenImage,
    setFullscreenImageIndex,
    isReviewViewerOpen,
    reviewViewerImages,
    closeReviewViewer,
    reviewViewerIndex,
    prevReviewViewerImage,
    nextReviewViewerImage,
    setReviewViewerIndex,
    showManufacturingInfo,
    showAllThumbnails,
    showRelatedSheet,
    sortedSimilarProducts,
    isProductLoading,
  };
}

export type ProductDetailModel = ReturnType<typeof useProductDetail>;
export type ProductDetailViewModel = Omit<ProductDetailModel, 'product'> & { product: NonNullable<ProductDetailModel['product']>; specification: ReturnType<typeof parseJsonObject>; specRows: (string | number)[][]; contentTabs: [string, string][]; showBAPricing: boolean };
