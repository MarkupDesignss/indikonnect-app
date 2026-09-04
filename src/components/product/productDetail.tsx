"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Heart,
  Package,
  CreditCard,
  Minus,
  Plus,
  CheckCircle,
  ArrowLeft,
  ShoppingBag,
  ChevronRight,
  X,
  ChevronLeft,
  ArrowRight,
  MessageCircle,
  Send,
  BadgeCheck,
  Loader2,
  Truck,
  RefreshCw,
} from "lucide-react";

import Footer from "../Footer/Footer";
import Header from "../common/Header";
import Loader from "../ui/Spinner/Loader";

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

import { useGetUserProfileQuery } from "../../lib/redux/api/Profile/userApi";

import {
  useAddRatingReviewMutation,
  useGetMyOrdersQuery,
} from "@/lib/redux/api/order/orderApi";

import { Lora } from "next/font/google";

const serif = Lora({
  subsets: ["latin"],
  weight: ["500", "600"],
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

const PLACEHOLDER =
  "/indiekonnect-web/images/placeholder.jpg";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

function fireRipple(
  e: React.MouseEvent<HTMLElement>
) {
  if (prefersReduced()) return;

  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();

  const span = document.createElement("span");

  span.className = "ik-ripple";

  span.style.left = `${e.clientX - rect.left - 7}px`;
  span.style.top = `${e.clientY - rect.top - 7}px`;

  btn.appendChild(span);

  setTimeout(() => {
    span.remove();
  }, 700);
}

function flyImageToCart(
  sourceEl: HTMLElement | null,
  imgSrc: string
) {
  if (prefersReduced() || !sourceEl) return;

  const target = document.querySelector(
    "#cart-icon"
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
        transform: `translate(${dx * 0.5}px, ${
          dy * 0.35 - 90
        }px) scale(.6)`,
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
    }
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

function popHeart(
  e: React.MouseEvent<HTMLElement>
) {
  const el = e.currentTarget;

  el.classList.remove("ik-heart-pop");

  void el.offsetWidth;

  el.classList.add("ik-heart-pop");
}

const getUserAccountType = (
  profileData: any
): "retail" | "distributor" => {
  if (!profileData) {
    return "retail";
  }

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

const getUserId = (
  profileData: any
): string | null => {
  if (!profileData) return null;

  const id =
    profileData?.user?.id ??
    profileData?.data?.user?.id ??
    profileData?.data?.id ??
    profileData?.id ??
    null;

  return id == null ? null : String(id);
};

const parseJsonObject = (
  value: any
): Record<string, any> => {
  if (!value) return {};

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
};

const getVariantImageUrl = (
  variant: any
): string | null => {
  if (!variant) {
    return null;
  }

  if (variant.primary_image_url) {
    return variant.primary_image_url;
  }

  if (
    Array.isArray(variant.images) &&
    variant.images.length > 0
  ) {
    const primary =
      variant.images.find(
        (img: any) =>
          img?.is_primary
      ) ||
      variant.images[0];

    return (
      primary?.image_url ||
      primary?.image ||
      null
    );
  }

  return null;
};

export default function ProductDetail({
  productSlug,
}: ProductDetailProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [quantity, setQuantity] =
    useState(1);

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [
    isAddedToCart,
    setIsAddedToCart,
  ] = useState(false);

  const [activeTab, setActiveTab] =
    useState("details");

  const [activeImage, setActiveImage] =
    useState(0);

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState<
    number | string | null
  >(null);

  const [
    isWishlistLoading,
    setIsWishlistLoading,
  ] = useState(false);

  const [
    wishlistState,
    setWishlistState,
  ] = useState<
    Record<number, boolean>
  >({});

  const mainImageBoxRef =
    useRef<HTMLDivElement>(null);

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [
    isFullscreen,
    setIsFullscreen,
  ] = useState(false);

  const [
    fullscreenImageIndex,
    setFullscreenImageIndex,
  ] = useState(0);

  const [
    selectedVariantAttributes,
    setSelectedVariantAttributes,
  ] = useState<
    Record<string, string>
  >({});

  const [reviewName, setReviewName] =
    useState("");

  const [reviewEmail, setReviewEmail] =
    useState("");

  const [reviewRating, setReviewRating] =
    useState(5);

  const [reviewTitle, setReviewTitle] =
    useState("");

  const [
    reviewImages,
    setReviewImages,
  ] = useState<File[]>([]);

  const [
    isSubmittingReview,
    setIsSubmittingReview,
  ] = useState(false);

  const [
    isZoomed,
    setIsZoomed,
  ] = useState(false);

  const [
    zoomPosition,
    setZoomPosition,
  ] = useState({
    x: 0,
    y: 0,
  });

  /*
   * ============================
   * API
   * ============================
   */

  const {
    data: productData,
    isLoading:
      isProductLoading,
    error,
    refetch: refetchProduct,
  } =
    useGetProductBySlugQuery(
      productSlug,
      {
        skip: !productSlug,
      }
    );

  const {
    data: wishlistData,
    refetch: refetchWishlist,
  } =
    useGetWishlistQuery();

  const {
    data: userProfileData,
  } =
    useGetUserProfileQuery();

  const userAccountType =
    getUserAccountType(
      userProfileData
    );

  const currentUserId =
    getUserId(userProfileData);

  const {
    data: myOrdersData,
    isLoading:
      isOrdersLoading,
    refetch: refetchOrders,
  } =
    useGetMyOrdersQuery();

  const categoryId =
    productData?.data
      ?.category_id ??
    productData?.category_id ??
    null;

  const {
    data: categoryProductsData,
  } =
    useGetProductsByCategoryQuery(
      categoryId,
      {
        skip: !categoryId,
      }
    );

  const [
    addToWishlist,
  ] = useAddToWishlistMutation();

  const [
    removeFromWishlist,
  ] =
    useRemoveFromWishlistMutation();

  const [
    addToCart,
  ] = useAddToCartMutation();

  const [
    addRatingReview,
  ] =
    useAddRatingReviewMutation();

  const apiProduct =
    productData?.data ??
    productData;

  /*
   * ============================
   * PRODUCT
   * ============================
   */

  const reviewsSummary =
    apiProduct?.reviews
      ?.summary ??
    apiProduct?.reviews_summary ??
    null;

  const reviewsList: any[] =
    Array.isArray(
      apiProduct?.reviews?.data
    )
      ? apiProduct.reviews.data
      : [];

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
          apiProduct.category
            ?.name ||
          "Uncategorized",

        categoryId:
          apiProduct.category_id ||
          apiProduct.category?.id,

        productCode:
          apiProduct.product_code,

        retailMrp: Number(
          apiProduct.retail_mrp || 0
        ),

        distributorMrp: Number(
          apiProduct.distributor_mrp ||
            0
        ),

        retailPrice: Number(
          apiProduct.retail_price ||
            0
        ),

        distributorPrice: Number(
          apiProduct.distributor_price ||
            0
        ),

        price:
          userAccountType ===
          "distributor"
            ? Number(
                apiProduct.distributor_price ||
                  0
              )
            : Number(
                apiProduct.retail_price ||
                  0
              ),

        mrp:
          userAccountType ===
          "distributor"
            ? Number(
                apiProduct.distributor_mrp ||
                  0
              )
            : Number(
                apiProduct.retail_mrp ||
                  0
              ),

        originalPrice:
          userAccountType ===
          "distributor"
            ? Number(
                apiProduct.distributor_mrp ||
                  0
              )
            : Number(
                apiProduct.retail_mrp ||
                  0
              ),

        discount:
          userAccountType ===
          "distributor"
            ? Number(
                apiProduct.distributor_mrp ||
                  0
              ) > 0 &&
              Number(
                apiProduct.distributor_price ||
                  0
              ) > 0
              ? Math.round(
                  ((Number(
                    apiProduct.distributor_mrp
                  ) -
                    Number(
                      apiProduct.distributor_price
                    )) /
                    Number(
                      apiProduct.distributor_mrp
                    )) *
                    100
                )
              : null
            : Number(
                  apiProduct.retail_mrp ||
                    0
                ) > 0 &&
                Number(
                  apiProduct.retail_price ||
                    0
                ) > 0
              ? Math.round(
                  ((Number(
                    apiProduct.retail_mrp
                  ) -
                    Number(
                      apiProduct.retail_price
                    )) /
                    Number(
                      apiProduct.retail_mrp
                    )) *
                    100
                )
              : null,

        image:
          apiProduct.primary_image_url ||
          apiProduct.images?.[0]
            ?.image_url ||
          PLACEHOLDER,

        images:
          apiProduct.images || [],

        rating: Number(
          reviewsSummary
            ?.average_rating || 0
        ),

        reviews: Number(
          reviewsSummary
            ?.total_reviews || 0
        ),

        inStock:
          (apiProduct.status ===
            "active" ||
            apiProduct.stock_status ===
              "active") &&
          Number(
            apiProduct.stock_quantity
          ) > 0,

        stockQuantity: Number(
          apiProduct.stock_quantity ||
            0
        ),

        lowStockThreshold:
          Number(
            apiProduct.low_stock_threshold ||
              10
          ),
      }
    : null;

  /*
   * ============================
   * PRODUCT GALLERY
   * ============================
   */

  const productGallery = useMemo(() => {
    if (!product) {
      return [];
    }

    const images =
      Array.isArray(
        product.images
      )
        ? product.images
            .map(
              (img: any) =>
                img?.image_url ||
                img?.image
            )
            .filter(Boolean)
        : [];

    return Array.from(
      new Set([
        product.image,
        ...images,
      ])
    );
  }, [product]);

  /*
   * ============================
   * VARIANTS
   * ============================
   */

  const variantEntries =
    useMemo(() => {
      if (
        !Array.isArray(
          apiProduct?.variants
        )
      ) {
        return [];
      }

      return apiProduct.variants
        .filter(
          (variant: any) =>
            variant?.is_active !==
              false
        )
        .map(
          (variant: any) => ({
            ...variant,

            parsedAttributes:
              parseJsonObject(
                variant?.attributes
              ),
          })
        );
    }, [
      apiProduct?.variants,
    ]);

  const hasVariants =
    variantEntries.length > 0;

  const apiAvailableAttributes =
    parseJsonObject(
      apiProduct?.available_attributes
    );

  const variantAttributeOptions =
    useMemo(() => {
      const result: Record<
        string,
        string[]
      > = {};

      Object.entries(
        apiAvailableAttributes
      ).forEach(
        ([
          key,
          values,
        ]) => {
          if (
            Array.isArray(values)
          ) {
            result[key] =
              values
                .map((value) =>
                  String(value)
                )
                .filter(Boolean);
          }
        }
      );

      if (
        Object.keys(result)
          .length === 0
      ) {
        variantEntries.forEach(
          (variant: any) => {
            const attrs =
              variant?.parsedAttributes ||
              {};

            Object.entries(
              attrs
            ).forEach(
              ([
                key,
                value,
              ]) => {
                if (!result[key]) {
                  result[key] =
                    [];
                }

                const stringValue =
                  String(value);

                if (
                  stringValue &&
                  !result[
                    key
                  ].includes(
                    stringValue
                  )
                ) {
                  result[
                    key
                  ].push(
                    stringValue
                  );
                }
              }
            );
          }
        );
      }

      return result;
    }, [
      apiAvailableAttributes,
      variantEntries,
    ]);

  /*
   * ============================
   * MAIN + VARIANT OPTIONS
   * ============================
   */

  const displayVariants =
    useMemo(() => {
      if (!product) {
        return [];
      }

      const mainProduct = {
        id: "main-product",

        isMainProduct: true,

        name: product.name,

        primary_image_url:
          product.image,

        images:
          productGallery.map(
            (
              image: string,
              index: number
            ) => ({
              id: `main-${index}`,

              image_url: image,

              is_primary:
                index === 0,
            })
          ),

        parsedAttributes: {},

        attributes: {},
      };

      return [
        mainProduct,
        ...variantEntries,
      ];
    }, [
      product,
      productGallery,
      variantEntries,
    ]);

  /*
   * ============================
   * SELECTED VARIANT
   * ============================
   */

  const isMainProductSelected =
    selectedVariantId === null;

  const selectedVariant =
    useMemo(() => {
      if (
        isMainProductSelected
      ) {
        return null;
      }

      return (
        variantEntries.find(
          (variant: any) =>
            String(
              variant.id
            ) ===
            String(
              selectedVariantId
            )
        ) || null
      );
    }, [
      isMainProductSelected,
      selectedVariantId,
      variantEntries,
    ]);

  const selectedVariantImage =
    selectedVariant
      ? getVariantImageUrl(
          selectedVariant
        )
      : null;

  /*
   * ============================
   * CURRENT GALLERY
   * ============================
   */

  const gallery = useMemo(() => {
    if (!product) {
      return [];
    }

    if (
      !isMainProductSelected &&
      selectedVariantImage
    ) {
      return [
        selectedVariantImage,
      ];
    }

    return productGallery;
  }, [
    product,
    isMainProductSelected,
    selectedVariantImage,
    productGallery,
  ]);

  useEffect(() => {
    setActiveImage(0);
  }, [
    selectedVariantId,
  ]);

  useEffect(() => {
    if (!product) return;

    setSelectedVariantId(null);
    setSelectedVariantAttributes(
      {}
    );
    setActiveImage(0);
  }, [product?.id]);

  /*
   * ============================
   * SELECT MAIN
   * ============================
   */

  const handleSelectMainProduct =
    () => {
      setSelectedVariantId(
        null
      );

      setSelectedVariantAttributes(
        {}
      );

      setActiveImage(0);
    };

  /*
   * ============================
   * SELECT VARIANT
   * ============================
   */

  const handleSelectVariant = (
    variant: any
  ) => {
    if (
      variant?.isMainProduct ||
      variant?.id === "main-product"
    ) {
      handleSelectMainProduct();

      return;
    }

    setSelectedVariantId(
      variant.id
    );

    const attrs =
      variant?.parsedAttributes ||
      parseJsonObject(
        variant?.attributes
      );

    setSelectedVariantAttributes({
      ...attrs,
    });

    setActiveImage(0);
  };

  /*
   * ============================
   * ATTRIBUTE SELECT
   * ============================
   */

  const handleAttributeSelect = (
    attributeKey: string,
    value: string
  ) => {
    const nextAttributes =
      {
        ...selectedVariantAttributes,
        [attributeKey]: value,
      };

    setSelectedVariantAttributes(
      nextAttributes
    );

    const matchingVariant =
      variantEntries.find(
        (variant: any) => {
          const attrs =
            variant?.parsedAttributes ||
            {};

          return Object.entries(
            nextAttributes
          ).every(
            ([
              key,
              selectedValue,
            ]) =>
              String(
                attrs?.[key] ??
                  ""
              ) ===
              String(
                selectedValue
              )
          );
        }
      );

    if (matchingVariant) {
      setSelectedVariantId(
        matchingVariant.id
      );

      setActiveImage(0);
    }
  };

  /*
   * ============================
   * WISHLIST
   * ============================
   */

  useEffect(() => {
    if (
      wishlistData?.data &&
      product?.id
    ) {
      const exists =
        wishlistData.data.some(
          (item: any) =>
            String(
              item.product_id
            ) ===
            String(product.id)
        );

      setIsWishlisted(exists);
    }
  }, [
    wishlistData,
    product?.id,
  ]);

  useEffect(() => {
    if (
      !wishlistData?.data
    ) {
      return;
    }

    const map: Record<
      number,
      boolean
    > = {};

    wishlistData.data.forEach(
      (item: any) => {
        map[
          item.product_id
        ] = true;
      }
    );

    setWishlistState(map);
  }, [
    wishlistData,
  ]);

  const handleWishlistToggle =
    async (
      e?: React.MouseEvent<HTMLElement>
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

      setIsWishlistLoading(
        true
      );

      try {
        if (
          isWishlisted
        ) {
          await removeFromWishlist(
            {
              product_id:
                product.id,
            }
          ).unwrap();

          setIsWishlisted(
            false
          );

          dispatch(
            showToast({
              message: `${product.name} removed from wishlist`,
              type: "info",
            })
          );
        } else {
          await addToWishlist({
            product_id:
              product.id,
          }).unwrap();

          setIsWishlisted(
            true
          );

          dispatch(
            showToast({
              message: `${product.name} added to wishlist! ❤️`,
              type: "success",
            })
          );
        }

        await refetchWishlist();
      } catch (
        error: any
      ) {
        dispatch(
          showToast({
            message:
              error?.data
                ?.message ||
              "Failed to update wishlist",
            type: "error",
          })
        );
      } finally {
        setIsWishlistLoading(
          false
        );
      }
    };

  const toggleWishlist =
    async (
      productId: number
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
            }
          ).unwrap();

          setWishlistState(
            (prev) => ({
              ...prev,
              [productId]:
                false,
            })
          );

          dispatch(
            showToast({
              message:
                "Removed from wishlist",
              type: "info",
            })
          );
        } else {
          await addToWishlist({
            product_id:
              productId,
          }).unwrap();

          setWishlistState(
            (prev) => ({
              ...prev,
              [productId]:
                true,
            })
          );

          dispatch(
            showToast({
              message:
                "Added to wishlist! ❤️",
              type: "success",
            })
          );
        }

        await refetchWishlist();
      } catch (
        error: any
      ) {
        dispatch(
          showToast({
            message:
              error?.data
                ?.message ||
              "Failed to update wishlist",
            type: "error",
          })
        );
      }
    };

  /*
   * ============================
   * CART
   * ============================
   */

  const addToCartLocal = (
    item: any,
    qty = 1
  ) => {
    setCartItems((prev) => {
      const existing =
        prev.find(
          (c) =>
            c.id === item.id
        );

      if (existing) {
        return prev.map(
          (c) =>
            c.id === item.id
              ? {
                  ...c,
                  quantity:
                    Math.min(
                      c.quantity +
                        qty,
                      10
                    ),
                }
              : c
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

  const handleAddToCart =
    async (
      e?: React.MouseEvent<HTMLElement>
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
            product.image
        );
      }

      try {
        const payload: any =
          {
            product_id:
              product.id,
            quantity,
          };

        if (
          !isMainProductSelected &&
          selectedVariant?.id
        ) {
          payload.variant_id =
            selectedVariant.id;
        }

        await addToCart(
          payload
        ).unwrap();

        addToCartLocal(
          product,
          quantity
        );

        setIsAddedToCart(
          true
        );

        dispatch(
          showToast({
            message: `${product.name} added to cart successfully! 🛒`,
            type: "success",
          })
        );

        setTimeout(() => {
          setIsAddedToCart(
            false
          );
        }, 3000);
      } catch (
        error: any
      ) {
        dispatch(
          showToast({
            message:
              error?.data
                ?.message ||
              "Failed to add item to cart",
            type: "error",
          })
        );
      }
    };

  /*
   * ============================
   * BUY NOW
   * ============================
   */

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

    if (
      !isMainProductSelected &&
      selectedVariant?.id
    ) {
      params.set(
        "variant_id",
        String(
          selectedVariant.id
        )
      );
    }

    router.push(
      `/checkout?${params.toString()}`
    );
  };

  /*
   * ============================
   * QUANTITY
   * ============================
   */

  const handleQuantityChange =
    (
      type:
        | "increment"
        | "decrement"
    ) => {
      if (
        type ===
        "increment"
      ) {
        setQuantity(
          (prev) =>
            Math.min(
              prev + 1,
              Math.min(
                product?.stockQuantity ||
                  10,
                10
              )
            )
        );
      } else {
        setQuantity(
          (prev) =>
            Math.max(
              prev - 1,
              1
            )
        );
      }
    };

  /*
   * ============================
   * FULLSCREEN
   * ============================
   */

  const openFullscreen = (
    index: number
  ) => {
    setFullscreenImageIndex(
      index
    );

    setIsFullscreen(true);

    document.body.style.overflow =
      "hidden";
  };

  const closeFullscreen =
    () => {
      setIsFullscreen(
        false
      );

      document.body.style.overflow =
        "";
    };

  const nextFullscreenImage =
    (
      e: React.MouseEvent
    ) => {
      e.stopPropagation();

      setFullscreenImageIndex(
        (prev) =>
          prev ===
          gallery.length - 1
            ? 0
            : prev + 1
      );
    };

  const prevFullscreenImage =
    (
      e: React.MouseEvent
    ) => {
      e.stopPropagation();

      setFullscreenImageIndex(
        (prev) =>
          prev === 0
            ? gallery.length - 1
            : prev - 1
      );
    };

  /*
   * ============================
   * KEYBOARD
   * ============================
   */

  useEffect(() => {
    const handler = (
      e: KeyboardEvent
    ) => {
      if (!isFullscreen)
        return;

      if (
        e.key ===
        "Escape"
      ) {
        closeFullscreen();
      }

      if (
        e.key ===
        "ArrowLeft"
      ) {
        setFullscreenImageIndex(
          (prev) =>
            prev === 0
              ? gallery.length -
                1
              : prev - 1
        );
      }

      if (
        e.key ===
        "ArrowRight"
      ) {
        setFullscreenImageIndex(
          (prev) =>
            prev ===
            gallery.length - 1
              ? 0
              : prev + 1
        );
      }
    };

    document.addEventListener(
      "keydown",
      handler
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handler
      );
    };
  }, [
    isFullscreen,
    gallery.length,
  ]);

  /*
   * ============================
   * ZOOM
   * ============================
   */

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!isZoomed) return;

    const rect =
      e.currentTarget.getBoundingClientRect();

    const x = Math.min(
      100,
      Math.max(
        0,
        ((e.clientX -
          rect.left) /
          rect.width) *
          100
      )
    );

    const y = Math.min(
      100,
      Math.max(
        0,
        ((e.clientY -
          rect.top) /
          rect.height) *
          100
      )
    );

    setZoomPosition({
      x,
      y,
    });
  };

  /*
   * ============================
   * REVIEW
   * ============================
   */

  const hasUserReviewed =
    useMemo(() => {
      if (!currentUserId)
        return false;

      return reviewsList.some(
        (review: any) =>
          String(
            review?.user?.id ??
              ""
          ) ===
          String(
            currentUserId
          )
      );
    }, [
      reviewsList,
      currentUserId,
    ]);

  const reviewableOrderLine =
    useMemo(() => {
      if (
        !apiProduct?.id ||
        !Array.isArray(
          myOrdersData?.data
        )
      ) {
        return null;
      }

      const lines: any[] =
        [];

      const collectLine =
        (
          item: any,
          parent: any = null
        ) => {
          if (
            !item ||
            typeof item !==
              "object"
          ) {
            return;
          }

          const lineId =
            item?.line_id ??
            item?.order_line_id ??
            item?.id ??
            null;

          const productId =
            item?.product_id ??
            item?.product?.id ??
            null;

          const orderId =
            item?.order_id ??
            item?.order?.id ??
            parent?.order_id ??
            parent?.id ??
            null;

          if (
            lineId != null &&
            productId != null &&
            orderId != null
          ) {
            lines.push({
              ...item,
              line_id:
                lineId,
              order_line_id:
                lineId,
              product_id:
                productId,
              order_id:
                orderId,
              order_status:
                item?.order_status ??
                parent?.order_status ??
                null,
              delivery_status:
                item?.delivery_status ??
                parent?.delivery_status ??
                null,
            });
          }

          const nested =
            item?.order_lines ??
            item?.orderLines ??
            item?.lines ??
            item?.items ??
            null;

          if (
            Array.isArray(
              nested
            )
          ) {
            nested.forEach(
              (
                child: any
              ) =>
                collectLine(
                  child,
                  item
                )
            );
          }
        };

      myOrdersData.data.forEach(
        (item: any) =>
          collectLine(item)
      );

      const matching =
        lines.filter(
          (line) =>
            String(
              line.product_id
            ) ===
            String(
              apiProduct.id
            )
        );

      const delivered =
        matching.find(
          (line) =>
            String(
              line.delivery_status ??
                line.order_status ??
                ""
            ).toLowerCase() ===
              "delivered"
        );

      return (
        delivered ||
        matching[0] ||
        null
      );
    }, [
      myOrdersData,
      apiProduct?.id,
    ]);

  const canReview =
    Boolean(
      currentUserId &&
        reviewableOrderLine
    );

  const handleReviewSubmit =
    async (
      e: React.FormEvent<HTMLFormElement>
    ) => {
      e.preventDefault();

      if (
        !reviewTitle.trim()
      ) {
        dispatch(
          showToast({
            message:
              "Please write your review.",
            type: "error",
          })
        );

        return;
      }

      if (
        !product ||
        !currentUserId ||
        !reviewableOrderLine
      ) {
        return;
      }

      setIsSubmittingReview(
        true
      );

      try {
        const payload = {
          rating:
            Number(
              reviewRating
            ),

          review_text:
            reviewTitle.trim(),

          order_id:
            Number(
              reviewableOrderLine.order_id
            ),

          order_line_id:
            Number(
              reviewableOrderLine.line_id
            ),

          product_id:
            Number(
              reviewableOrderLine.product_id ||
                product.id
            ),

          images:
            reviewImages,
        };

        const result =
          await addRatingReview(
            payload
          ).unwrap();

        dispatch(
          showToast({
            message:
              result?.message ||
              "Review submitted successfully.",
            type: "success",
          })
        );

        setReviewName("");
        setReviewEmail("");
        setReviewTitle("");
        setReviewRating(5);
        setReviewImages([]);

        await refetchProduct();
        await refetchOrders();
      } catch (
        error: any
      ) {
        dispatch(
          showToast({
            message:
              error?.data
                ?.message ||
              "Failed to submit review.",
            type: "error",
          })
        );
      } finally {
        setIsSubmittingReview(
          false
        );
      }
    };

  const handleReviewImageUpload =
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (
        !e.target.files
      ) {
        return;
      }

      const files =
        Array.from(
          e.target.files
        );

      setReviewImages(
        (prev) => [
          ...prev,
          ...files.slice(
            0,
            5 -
              prev.length
          ),
        ]
      );

      e.target.value = "";
    };

  const removeReviewImage =
    (
      index: number
    ) => {
      setReviewImages(
        (prev) =>
          prev.filter(
            (_, i) =>
              i !==
              index
          )
      );
    };

  /*
   * ============================
   * RELATED PRODUCTS
   * ============================
   */

  const similarProducts =
    Array.isArray(
      categoryProductsData?.data
    )
      ? categoryProductsData.data
          .filter(
            (p: any) =>
              String(
                p.id
              ) !==
              String(
                product?.id
              )
          )
          .slice(0, 10)
          .map(
            (p: any) => {
              const distributor =
                userAccountType ===
                "distributor";

              const price =
                distributor
                  ? Number(
                      p.distributor_price ||
                        0
                    )
                  : Number(
                      p.retail_price ||
                        0
                    );

              const mrp =
                distributor
                  ? Number(
                      p.distributor_mrp ||
                        0
                    )
                  : Number(
                      p.retail_mrp ||
                        0
                    );

              return {
                id: p.id,

                name:
                  p.name,

                slug:
                  p.slug,

                category:
                  p.category?.name ||
                  "Uncategorized",

                price,

                originalPrice:
                  mrp,

                discount:
                  mrp > 0 &&
                  price > 0
                    ? Math.round(
                        ((mrp -
                          price) /
                          mrp) *
                          100
                      )
                    : null,

                image:
                  p.primary_image_url ||
                  p.images?.find(
                    (img: any) =>
                      img?.is_primary
                  )?.image_url ||
                  p.images?.[0]
                    ?.image_url ||
                  PLACEHOLDER,

                rating:
                  p.reviews
                    ?.summary
                    ?.average_rating ??
                  0,

                reviews:
                  p.reviews
                    ?.summary
                    ?.total_reviews ??
                  0,

                inStock:
                  Number(
                    p.stock_quantity ||
                      0
                  ) > 0,
              };
            }
          )
      : [];

  /*
   * ============================
   * LOADING / ERROR
   * ============================
   */

  if (
    isProductLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader
          width={200}
          height={200}
        />
      </div>
    );
  }

  if (
    error ||
    !product
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="max-w-md px-4 text-center">
          <div className="mb-4 text-6xl">
            🔍
          </div>

          <h2 className="mb-3 text-2xl font-bold">
            Product Not Found
          </h2>

          <p className="mb-6 text-sm text-[#777]">
            The product you're
            looking for doesn't
            exist or has been
            removed.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() =>
                router.back()
              }
              className="rounded-full border px-5 py-2.5 text-sm font-semibold"
            >
              Go Back
            </button>

            <Link
              href="/products"
              className="rounded-full bg-[#111] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================
   * SPECIFICATIONS
   * ============================
   */

  const specification =
    parseJsonObject(
      product.specification
    );

  const specRows =
    Object.keys(
      specification
    ).length > 0
      ? Object.entries(
          specification
        ).map(
          ([
            key,
            value,
          ]) => [
            key
              .replace(
                /_/g,
                " "
              )
              .replace(
                /\b\w/g,
                (char) =>
                  char.toUpperCase()
              ),

            String(value),
          ]
        )
      : [
          [
            "Product Type",
            product.category,
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
            product.stockQuantity,
          ],
          [
            "UOM",
            apiProduct?.uom ||
              "NOS",
          ],
          [
            "HSN Code",
            apiProduct?.hsn_code ||
              "N/A",
          ],
          [
            "Warranty",
            "1 Year",
          ],
          [
            "Return Policy",
            "7 Days",
          ],
        ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#171717]">
      <Header />

      <main className="mx-auto w-full max-w-[1440px] px-3 py-3 sm:px-5 sm:py-4 lg:px-7 xl:px-10">

        {/* ========================= */}
        {/* BREADCRUMB */}
        {/* ========================= */}

        <nav className="mb-3 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[11px] text-[#8A8A8A] sm:text-[12px]">
          <Link
            href="/"
            className="transition hover:text-[#111]"
          >
            Home
          </Link>

          <ChevronRight className="h-3 w-3 flex-shrink-0 text-[#CFCFCF]" />

          <Link
            href="/products"
            className="transition hover:text-[#111]"
          >
            Products
          </Link>

          <ChevronRight className="h-3 w-3 flex-shrink-0 text-[#CFCFCF]" />

          <span className="font-medium text-[#555]">
            {product.category}
          </span>

          <ChevronRight className="h-3 w-3 flex-shrink-0 text-[#CFCFCF]" />

          <span className="max-w-[180px] truncate font-medium text-[#111]">
            {product.name}
          </span>
        </nav>

        {/* ========================= */}
        {/* HERO */}
        {/* ========================= */}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.92fr_1.08fr] xl:gap-5">

          {/* ========================= */}
          {/* IMAGE AREA */}
          {/* ========================= */}

          <div className="flex min-w-0 gap-2.5">

            {/* THUMBNAILS */}

            <div className="flex w-[62px] flex-shrink-0 flex-col gap-2 sm:w-[72px] lg:w-[76px]">
              {gallery.map(
                (
                  img,
                  index
                ) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() =>
                      setActiveImage(
                        index
                      )
                    }
                    className={`relative h-[62px] w-[62px] overflow-hidden rounded-[7px] border-2 bg-white transition sm:h-[70px] sm:w-[70px] lg:h-[74px] lg:w-[74px] ${
                      activeImage ===
                      index
                        ? "border-[#111]"
                        : "border-[#E4E4E4] hover:border-[#999]"
                    }`}
                  >
                    <Image
                      src={
                        img ||
                        PLACEHOLDER
                      }
                      alt={`${product.name} ${
                        index + 1
                      }`}
                      fill
                      sizes="74px"
                      className="object-cover transition duration-300 hover:scale-105"
                    />
                  </button>
                )
              )}
            </div>

            {/* MAIN IMAGE */}

            <div className="min-w-0 flex-1">
              <div
                ref={
                  mainImageBoxRef
                }
                className="relative h-[400px] w-full cursor-crosshair overflow-hidden rounded-[8px] bg-[#EEEEEE] sm:h-[460px] lg:h-[500px] xl:h-[540px]"
                onClick={() =>
                  openFullscreen(
                    activeImage
                  )
                }
                onMouseMove={
                  handleMouseMove
                }
                onMouseEnter={() =>
                  setIsZoomed(
                    true
                  )
                }
                onMouseLeave={() =>
                  setIsZoomed(
                    false
                  )
                }
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedVariantId}-${gallery[activeImage]}`}
                    initial={{
                      opacity: 0.25,
                      scale: 1.01,
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
                        0.28,
                    }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={
                        gallery[
                          activeImage
                        ] ||
                        product.image ||
                        PLACEHOLDER
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

                {isZoomed && (
                  <div
                    className="pointer-events-none absolute h-[100px] w-[100px] rounded-lg border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.18)]"
                    style={{
                      left: `${zoomPosition.x}%`,
                      top: `${zoomPosition.y}%`,
                      transform:
                        "translate(-50%, -50%)",
                    }}
                  />
                )}

                {product.discount &&
                  product.discount >
                    0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#111] px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white">
                      {product.discount}% OFF
                    </span>
                  )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();

                    handleWishlistToggle(
                      e
                    );
                  }}
                  disabled={
                    isWishlistLoading
                  }
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isWishlisted
                        ? "fill-[#111] text-[#111]"
                        : "text-[#111]"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ========================= */}
          {/* PRODUCT DETAILS */}
          {/* ========================= */}

          <div className="rounded-[8px] bg-white p-5 sm:p-6 lg:p-7">

            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999]">
              {product.category}
            </div>

            <h1 className="mt-1 text-[21px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#171717] sm:text-[23px]">
              {product.name}
            </h1>

            {/* Rating */}

            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(
                  (n) => (
                    <Star
                      key={
                        n
                      }
                      className={`h-3.5 w-3.5 ${
                        n <=
                        Math.floor(
                          product.rating
                        )
                          ? "fill-[#F6BE16] text-[#F6BE16]"
                          : "fill-[#F6BE16]/15 text-[#F6BE16]"
                      }`}
                    />
                  )
                )}
              </div>

              <span className="text-[12px] font-semibold text-[#333]">
                {product.rating.toFixed(
                  1
                )}{" "}
                ★
              </span>

              <span className="text-[11px] text-[#888]">
                {product.reviews}{" "}
                Ratings
              </span>
            </div>

            {/* Price */}

            <div className="mt-3 flex items-end gap-2.5">
              <span className="text-[26px] font-bold tracking-[-0.02em] text-[#111]">
                ₹
                {product.price.toLocaleString()}
              </span>

              {product.mrp >
                product.price && (
                <>
                  <span className="pb-0.5 text-[15px] text-[#A7A7A7] line-through">
                    ₹
                    {product.mrp.toLocaleString()}
                  </span>

                  <span className="text-[12px] font-semibold text-[#E25858]">
                    (
                    {
                      product.discount
                    }
                    % OFF)
                  </span>
                </>
              )}
            </div>

            <p className="mt-0.5 text-[11px] text-[#777]">
              inclusive of all
              taxes
            </p>

            {/* ========================= */}
            {/* ATTRIBUTES */}
            {/* ========================= */}

            {hasVariants &&
              Object.entries(
                variantAttributeOptions
              ).length >
                0 && (
                <div className="mt-5 border-t border-[#E8E8E8] pt-4">

                  {Object.entries(
                    variantAttributeOptions
                  ).map(
                    ([
                      attributeKey,
                      values,
                    ]) => {

                      if (
                        attributeKey.toLowerCase() ===
                          "color1" ||
                        attributeKey.toLowerCase() ===
                          "color"
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={
                            attributeKey
                          }
                          className="mb-4"
                        >
                          <p className="mb-2 text-[11px] font-semibold text-[#222]">
                            {attributeKey
                              .replace(
                                /_/g,
                                " "
                              )
                              .replace(
                                /\b\w/g,
                                (
                                  char
                                ) =>
                                  char.toUpperCase()
                              )}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {values.map(
                              (
                                value
                              ) => {
                                const selected =
                                  selectedVariantAttributes[
                                    attributeKey
                                  ] ===
                                  value;

                                return (
                                  <button
                                    key={`${attributeKey}-${value}`}
                                    type="button"
                                    onClick={() =>
                                      handleAttributeSelect(
                                        attributeKey,
                                        value
                                      )
                                    }
                                    className={`rounded-full border px-4 py-1.5 text-[11px] font-semibold transition ${
                                      selected
                                        ? "border-[#111] bg-[#111] text-white"
                                        : "border-[#D7D7D7] bg-white text-[#222] hover:border-[#111]"
                                    }`}
                                  >
                                    {
                                      value
                                    }
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}

                  {/* ========================= */}
                  {/* MORE COLORS */}
                  {/* ========================= */}

                  <div className="mt-2">

                    <div className="mb-2.5 flex items-center gap-2">
                      <p className="text-[11px] font-semibold text-[#222]">
                        More Colors
                      </p>

                      <span className="text-[9px] text-[#999]">
                        {
                          displayVariants.length
                        }{" "}
                        options
                      </span>
                    </div>

                    <div className="flex flex-wrap items-start gap-3">

                      {displayVariants.map(
                        (
                          variant: any
                        ) => {
                          const isMain =
                            variant?.isMainProduct ===
                            true;

                          const image =
                            isMain
                              ? product.image
                              : getVariantImageUrl(
                                  variant
                                );

                          if (!image) {
                            return null;
                          }

                          const isSelected =
                            isMain
                              ? isMainProductSelected
                              : String(
                                  selectedVariantId
                                ) ===
                                String(
                                  variant.id
                                );

                          const colorName =
                            variant
                              ?.parsedAttributes
                              ?.color1 ||
                            variant
                              ?.parsedAttributes
                              ?.color ||
                            variant
                              ?.parsedAttributes
                              ?.Color ||
                            "";

                          return (
                            <div
                              key={
                                isMain
                                  ? "main-product"
                                  : variant.id
                              }
                              className="flex w-[60px] flex-col items-center"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectVariant(
                                    variant
                                  )
                                }
                                className={`relative h-[58px] w-[58px] overflow-hidden rounded-[8px] border-2 bg-white transition ${
                                  isSelected
                                    ? "border-[#111] ring-1 ring-[#111]"
                                    : "border-[#E3E3E3] hover:border-[#999]"
                                }`}
                                aria-label={
                                  colorName ||
                                  product.name
                                }
                              >
                                <Image
                                  src={
                                    image
                                  }
                                  alt={
                                    colorName ||
                                    product.name
                                  }
                                  fill
                                  sizes="58px"
                                  className="object-cover transition duration-300 hover:scale-105"
                                />
                              </button>

                              {!isMain &&
                                colorName && (
                                  <span
                                    className={`mt-1 max-w-[60px] truncate text-center text-[9px] font-medium ${
                                      isSelected
                                        ? "text-[#111]"
                                        : "text-[#888]"
                                    }`}
                                    title={
                                      colorName
                                    }
                                  >
                                    {
                                      colorName
                                    }
                                  </span>
                                )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Selected variant */}

            {!isMainProductSelected &&
              selectedVariant && (
                <div className="mt-3 rounded-[7px] bg-[#F8F8F8] px-3 py-2">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#777]">
                    {selectedVariant
                      ?.sku && (
                      <span>
                        SKU:
                        <span className="ml-1 font-semibold text-[#111]">
                          {
                            selectedVariant.sku
                          }
                        </span>
                      </span>
                    )}

                    {Object.entries(
                      selectedVariantAttributes
                    ).map(
                      ([
                        key,
                        value,
                      ]) => (
                        <span
                          key={
                            key
                          }
                        >
                          {key}:
                          <span className="ml-1 font-semibold text-[#111]">
                            {
                              value
                            }
                          </span>
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* ========================= */}
            {/* ACTION BUTTONS */}
            {/* ========================= */}

            <div className="mt-5 flex items-center gap-2 border-t border-[#E8E8E8] pt-4">

              <motion.button
                whileTap={{
                  scale:
                    product.inStock
                      ? 0.98
                      : 1,
                }}
                onClick={
                  handleBuyNow
                }
                disabled={
                  !product.inStock
                }
                className={`flex h-[46px] flex-1 items-center justify-center rounded-[4px] text-[12px] font-bold uppercase tracking-wide ${
                  product.inStock
                    ? "bg-[#111] text-white hover:bg-[#252525]"
                    : "bg-[#ECECEC] text-[#AAA]"
                }`}
              >
                BUY NOW
              </motion.button>

              <motion.button
                whileTap={{
                  scale:
                    product.inStock
                      ? 0.98
                      : 1,
                }}
                onClick={
                  handleAddToCart
                }
                disabled={
                  !product.inStock
                }
                className={`flex h-[46px] flex-1 items-center justify-center gap-1.5 rounded-[4px] border-2 text-[12px] font-semibold uppercase tracking-wide ${
                  product.inStock
                    ? "border-[#111] bg-white text-[#111] hover:bg-[#111] hover:text-white"
                    : "border-[#D8D8D8] text-[#AAA]"
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
                    ADD TO BAG
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={(e) =>
                  handleWishlistToggle(
                    e
                  )
                }
                className={`flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[4px] border-2 ${
                  isWishlisted
                    ? "border-[#111] bg-[#111] text-white"
                    : "border-[#D7D7D7] bg-white text-[#111]"
                }`}
              >
                <Heart
                  className={`h-[18px] w-[18px] ${
                    isWishlisted
                      ? "fill-white"
                      : ""
                  }`}
                />
              </button>
            </div>

            {/* ========================= */}
            {/* DELIVERY */}
            {/* ========================= */}

            <div className="mt-4 border-t border-[#E8E8E8] pt-4">
              <div className="flex items-center gap-2 text-[11px]">
                <Truck className="h-4 w-4 text-[#666]" />

                <span className="font-medium">
                  Get it by
                </span>

                <span className="font-semibold text-[#111]">
                  Wed, Sep 09
                </span>

                <span className="text-[#888]">
                  - 201309
                </span>
              </div>

              <div className="mt-1.5 text-[11px] text-[#777]">
                Seller:{" "}
                <span className="font-semibold text-[#222]">
                  Supercom Net
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-[#666]">
                <span>
                  <span className="font-bold text-[#4CAF50]">
                    ✓
                  </span>{" "}
                  Pay on delivery
                </span>

                <span>
                  <span className="font-bold text-[#4CAF50]">
                    ✓
                  </span>{" "}
                  Easy 7 days return
                </span>

                <span>
                  <span className="font-bold text-[#4CAF50]">
                    ✓
                  </span>{" "}
                  100% Original
                </span>
              </div>
            </div>

            {/* ========================= */}
            {/* QUICK INFO */}
            {/* ========================= */}

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#E8E8E8] pt-4">
              {[
                {
                  icon: Package,
                  label:
                    "Free Shipping",
                  sub: "on ₹999+",
                },
                {
                  icon: CreditCard,
                  label:
                    "Secure Payment",
                  sub: "100% secure",
                },
                {
                  icon: RefreshCw,
                  label:
                    "Easy Returns",
                  sub: "7 days",
                },
              ].map(
                ({
                  icon:
                    Icon,
                  label,
                  sub,
                }) => (
                  <div
                    key={
                      label
                    }
                    className="text-center"
                  >
                    <Icon className="mx-auto h-4 w-4 text-[#222]" />

                    <p className="mt-1 text-[9px] font-semibold text-[#222]">
                      {
                        label
                      }
                    </p>

                    <p className="text-[8px] text-[#999]">
                      {sub}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Offer */}

            <div className="mt-4 border-t border-[#E8E8E8] pt-3">
              <p className="text-[10px] font-semibold text-[#222]">
                BEST OFFERS
              </p>

              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#777]">
                <span className="rounded-full border border-[#E2E2E2] px-2 py-0.5 text-[8px] font-semibold">
                  BANK OFFER
                </span>

                10% off on HDFC Bank
                Cards
              </div>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* CONTENT TABS */}
        {/* ========================= */}

        <section className="mt-7 rounded-[8px] bg-white p-5 sm:p-6 lg:p-7">

          <div className="flex items-center gap-7 overflow-x-auto border-b border-[#E7E7E7]">
            {[
              [
                "details",
                "Details",
              ],
              [
                "reviews",
                "Reviews",
              ],
              [
                "discussion",
                "Discussion",
              ],
            ].map(
              ([
                key,
                label,
              ]) => (
                <button
                  key={
                    key
                  }
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      key
                    )
                  }
                  className={`relative pb-3 text-[12px] font-semibold transition ${
                    activeTab ===
                    key
                      ? "text-[#111]"
                      : "text-[#999] hover:text-[#333]"
                  }`}
                >
                  {label}

                  {key ===
                    "reviews" && (
                    <span className="ml-1 text-[9px]">
                      (
                      {
                        product.reviews
                      }
                      )
                    </span>
                  )}

                  {activeTab ===
                    key && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#111]" />
                  )}
                </button>
              )
            )}
          </div>

          <AnimatePresence mode="wait">

            {/* DETAILS */}

            {activeTab ===
              "details" && (
              <motion.div
                key="details"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                className="grid gap-7 pt-6 lg:grid-cols-[1fr_240px]"
              >
                <div>
                  <p className="whitespace-pre-wrap text-[13px] leading-7 text-[#5D5D5D]">
                    {product.description ||
                      "Premium quality product with exceptional design and craftsmanship."}
                  </p>

                  <div className="mt-6 overflow-hidden rounded-[7px] border border-[#E6E6E6]">
                    <div className="border-b border-[#E6E6E6] bg-[#FAFAFA] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide">
                      Specifications
                    </div>

                    <div className="grid md:grid-cols-2">
                      {specRows
                        .slice(
                          0,
                          8
                        )
                        .map(
                          (
                            [
                              label,
                              value,
                            ],
                            index
                          ) => (
                            <div
                              key={
                                label
                              }
                              className={`flex justify-between gap-4 border-b border-[#EFEFEF] px-4 py-2.5 text-[10px] ${
                                index %
                                  2 ===
                                0
                                  ? "bg-white"
                                  : "bg-[#FCFCFC]"
                              }`}
                            >
                              <span className="text-[#888]">
                                {
                                  label
                                }
                              </span>

                              <span className="text-right font-semibold text-[#2A2A2A]">
                                {
                                  value
                                }
                              </span>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>

                <aside className="self-start rounded-[10px] bg-[#F3F3F3] p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#888]">
                    IndieKonnect
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Premium
                    Collection
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-[#777]">
                    Discover more
                    products from
                    our collection.
                  </p>

                  <button className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#777] px-3.5 py-1.5 text-[10px] font-semibold">
                    View
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </aside>
              </motion.div>
            )}

            {/* REVIEWS */}

            {activeTab ===
              "reviews" && (
              <motion.div
                key="reviews"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                className="grid gap-7 pt-6 lg:grid-cols-[1fr_270px]"
              >
                <div>
                  {!currentUserId ? (
                    <div className="border-b border-[#E5E5E5] pb-5 text-[11px] text-[#777]">
                      <Link
                        href="/login"
                        className="font-semibold text-[#111] underline"
                      >
                        Sign in
                      </Link>{" "}
                      to leave a
                      review.
                    </div>
                  ) : canReview ? (
                    <div className="border-b border-[#E5E5E5] pb-6">
                      <h3 className="text-sm font-semibold">
                        {hasUserReviewed
                          ? "Write Another Review"
                          : "Add Review"}
                      </h3>

                      <form
                        onSubmit={
                          handleReviewSubmit
                        }
                        className="mt-4 grid gap-3 md:grid-cols-2"
                      >
                        <input
                          value={
                            reviewName
                          }
                          onChange={(e) =>
                            setReviewName(
                              e
                                .target
                                .value
                            )
                          }
                          placeholder="Name"
                          className="h-10 rounded-[6px] border border-[#D8D8D8] px-3 text-sm outline-none focus:border-[#111]"
                        />

                        <input
                          type="email"
                          value={
                            reviewEmail
                          }
                          onChange={(e) =>
                            setReviewEmail(
                              e
                                .target
                                .value
                            )
                          }
                          placeholder="Email"
                          className="h-10 rounded-[6px] border border-[#D8D8D8] px-3 text-sm outline-none focus:border-[#111]"
                        />

                        <div className="flex items-center gap-1 md:col-span-2">
                          <span className="mr-2 text-xs text-[#777]">
                            Rating:
                          </span>

                          {[1, 2, 3, 4, 5].map(
                            (
                              star
                            ) => (
                              <button
                                type="button"
                                key={
                                  star
                                }
                                onClick={() =>
                                  setReviewRating(
                                    star
                                  )
                                }
                              >
                                <Star
                                  className={`h-5 w-5 ${
                                    star <=
                                    reviewRating
                                      ? "fill-[#F6BE16] text-[#F6BE16]"
                                      : "text-[#CCC]"
                                  }`}
                                />
                              </button>
                            )
                          )}
                        </div>

                        <textarea
                          value={
                            reviewTitle
                          }
                          onChange={(e) =>
                            setReviewTitle(
                              e
                                .target
                                .value
                            )
                          }
                          rows={4}
                          placeholder="Write your review..."
                          className="resize-none rounded-[6px] border border-[#D8D8D8] p-3 text-sm outline-none focus:border-[#111] md:col-span-2"
                          required
                        />

                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Add Photos
                          </label>

                          <label className="inline-flex cursor-pointer rounded-full border border-[#D8D8D8] px-4 py-2 text-[10px] font-semibold hover:border-[#111]">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={
                                handleReviewImageUpload
                              }
                              className="hidden"
                            />

                            Upload
                            Images
                          </label>

                          <span className="ml-2 text-[10px] text-[#999]">
                            {
                              reviewImages.length
                            }
                            /5
                          </span>

                          {reviewImages.length >
                            0 && (
                            <div className="mt-2 flex gap-2">
                              {reviewImages.map(
                                (
                                  file,
                                  index
                                ) => (
                                  <div
                                    key={`${file.name}-${index}`}
                                    className="relative h-14 w-14 overflow-hidden rounded-[6px] border"
                                  >
                                    <Image
                                      src={URL.createObjectURL(
                                        file
                                      )}
                                      alt="review"
                                      fill
                                      className="object-cover"
                                    />

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeReviewImage(
                                          index
                                        )
                                      }
                                      className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={
                            isSubmittingReview
                          }
                          className="inline-flex h-10 w-fit items-center gap-1.5 rounded-full bg-[#111] px-5 text-[11px] font-semibold text-white disabled:opacity-50"
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
                  ) : null}

                  <div className="pt-6">
                    <h3 className="text-sm font-semibold">
                      All Reviews
                    </h3>

                    {reviewsList.length ===
                    0 ? (
                      <p className="mt-4 text-xs text-[#999]">
                        No reviews yet.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-5">
                        {reviewsList.map(
                          (
                            review: any
                          ) => (
                            <div
                              key={
                                review.id
                              }
                              className="flex gap-3 border-b border-[#F0F0F0] pb-4"
                            >
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEE] text-[10px] font-bold">
                                {review
                                  .user
                                  ?.profile_picture ? (
                                  <Image
                                    src={
                                      review
                                        .user
                                        .profile_picture
                                    }
                                    alt=""
                                    width={
                                      32
                                    }
                                    height={
                                      32
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  "U"
                                )}
                              </div>

                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-semibold">
                                    {
                                      review
                                        .user
                                        ?.full_name
                                    }
                                  </span>

                                  {review.is_verified_purchase && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-[#E8F5EE] px-1.5 py-0.5 text-[8px] font-medium text-[#3E8E5A]">
                                      <BadgeCheck className="h-3 w-3" />
                                      Verified
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map(
                                    (
                                      n
                                    ) => (
                                      <Star
                                        key={
                                          n
                                        }
                                        className={`h-3 w-3 ${
                                          n <=
                                          Number(
                                            review.rating
                                          )
                                            ? "fill-[#F6BE16] text-[#F6BE16]"
                                            : "text-[#DADADA]"
                                        }`}
                                      />
                                    )
                                  )}
                                </div>

                                <p className="mt-1 text-xs leading-relaxed text-[#333]">
                                  {
                                    review.review_text
                                  }
                                </p>

                                {Array.isArray(
                                  review.images
                                ) &&
                                  review.images.length >
                                    0 && (
                                    <div className="mt-2 flex gap-2">
                                      {review.images.map(
                                        (
                                          img: any,
                                          index: number
                                        ) => (
                                          <div
                                            key={
                                              img.id ||
                                              index
                                            }
                                            className="relative h-14 w-14 overflow-hidden rounded-[6px] border"
                                          >
                                            <Image
                                              src={
                                                img.image_url
                                              }
                                              alt=""
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Review summary */}

                <aside className="h-fit rounded-[10px] border border-[#E5E5E5] p-5 text-center">
                  <div className="text-3xl font-semibold">
                    {product.rating.toFixed(
                      1
                    )}
                  </div>

                  <div className="mt-1 text-xs text-[#777]">
                    out of 5
                  </div>

                  <div className="mt-2 flex justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(
                      (n) => (
                        <Star
                          key={
                            n
                          }
                          className={`h-4 w-4 ${
                            n <=
                            Math.round(
                              product.rating
                            )
                              ? "fill-[#F6BE16] text-[#F6BE16]"
                              : "text-[#DADADA]"
                          }`}
                        />
                      )
                    )}
                  </div>

                  <p className="mt-2 text-xs text-[#777]">
                    {
                      product.reviews
                    }{" "}
                    reviews
                  </p>

                  {reviewsSummary
                    ?.rating_distribution && (
                    <div className="mt-4 space-y-1.5 text-left">
                      {[5, 4, 3, 2, 1].map(
                        (star) => {
                          const count =
                            Number(
                              reviewsSummary
                                .rating_distribution?.[
                                star
                              ] || 0
                            );

                          const pct =
                            product.reviews >
                            0
                              ? Math.round(
                                  (count /
                                    product.reviews) *
                                    100
                                )
                              : 0;

                          return (
                            <div
                              key={
                                star
                              }
                              className="flex items-center gap-2 text-[9px] text-[#777]"
                            >
                              <span className="w-5">
                                {
                                  star
                                }★
                              </span>

                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EDEDED]">
                                <div
                                  className="h-full rounded-full bg-[#F6BE16]"
                                  style={{
                                    width: `${pct}%`,
                                  }}
                                />
                              </div>

                              <span className="w-5 text-right">
                                {
                                  count
                                }
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </aside>
              </motion.div>
            )}

            {/* DISCUSSION */}

            {activeTab ===
              "discussion" && (
              <motion.div
                key="discussion"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                className="grid gap-6 pt-6 lg:grid-cols-[1fr_270px]"
              >
                <div className="rounded-[9px] border border-[#E5E5E5] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F1F1]">
                      <MessageCircle className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">
                        Have a question?
                      </h3>

                      <p className="mt-0.5 text-[11px] text-[#777]">
                        Ask about size,
                        fit, delivery or
                        styling.
                      </p>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Write your question..."
                    className="mt-4 w-full resize-none rounded-[7px] border border-[#DDD] p-3 text-sm outline-none focus:border-[#111]"
                  />

                  <button className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#111] px-5 py-2 text-[11px] font-semibold text-white">
                    Post
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <aside className="self-start rounded-[9px] bg-[#F3F3F3] p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#888]">
                    Need help?
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    24 × 7 Support
                  </h3>

                  <p className="mt-1 text-[10px] text-[#777]">
                    Our team is here
                    to help you.
                  </p>

                  <button className="mt-3 rounded-full border border-[#888] px-4 py-1.5 text-[10px] font-semibold">
                    Contact
                  </button>
                </aside>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ========================= */}
        {/* RELATED PRODUCTS - FIXED POSITION */}
        {/* ========================= */}

        {similarProducts.length > 0 && (
          <section className="mt-7 rounded-[8px] bg-white p-5 sm:p-6 lg:p-7">
            <div className="mb-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#999]">
                You may also like
              </p>

              <h2
                className={`${serif.className} mt-1 text-2xl text-[#171717]`}
              >
                Related pieces
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {similarProducts.map(
                (
                  item,
                  index
                ) => (
                  <motion.div
                    key={
                      item.id
                    }
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration:
                        0.4,
                      delay:
                        (index %
                          5) *
                        0.04,
                    }}
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[0.8] overflow-hidden rounded-[8px] bg-[#F3F3F3]">
                        <Image
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          fill
                          className="object-cover transition duration-700 group-hover:scale-105"
                          sizes="20vw"
                        />

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            popHeart(
                              e
                            );

                            toggleWishlist(
                              item.id
                            );
                          }}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white"
                        >
                          <Heart
                            className={`h-3.5 w-3.5 ${
                              wishlistState[
                                item.id
                              ]
                                ? "fill-[#111] text-[#111]"
                                : "text-[#111]"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="pt-2.5">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#999]">
                          {
                            item.category
                          }
                        </p>

                        <h3 className="mt-0.5 truncate text-[12px] font-medium text-[#222]">
                          {
                            item.name
                          }
                        </h3>

                        <div className="mt-1 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-[#F6BE16] text-[#F6BE16]" />

                          <span className="text-[9px] text-[#888]">
                            {item.rating.toFixed(
                              1
                            )}{" "}
                            (
                            {
                              item.reviews
                            }
                            )
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[12px] font-semibold">
                            ₹
                            {item.price.toLocaleString()}
                          </span>

                          {item.originalPrice >
                            item.price && (
                            <span className="text-[9px] text-[#AAA] line-through">
                              ₹
                              {item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          </section>
        )}
      </main>

      {/* ========================= */}
      {/* MOBILE STICKY */}
      {/* ========================= */}

      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#E5E5E5] bg-white/95 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-10 items-center rounded-full bg-[#111] text-white">
            <button
              onClick={() =>
                handleQuantityChange(
                  "decrement"
                )
              }
              disabled={
                quantity <=
                1
              }
              className="flex h-10 w-8 items-center justify-center disabled:opacity-30"
            >
              <Minus className="h-3 w-3" />
            </button>

            <span className="w-4 text-center text-xs font-semibold">
              {
                quantity
              }
            </span>

            <button
              onClick={() =>
                handleQuantityChange(
                  "increment"
                )
              }
              disabled={
                quantity >=
                  10 ||
                quantity >=
                  (product.stockQuantity ||
                    10)
              }
              className="flex h-10 w-8 items-center justify-center disabled:opacity-30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={
              handleBuyNow
            }
            disabled={
              !product.inStock
            }
            className="flex h-10 flex-1 items-center justify-center rounded-[4px] bg-[#111] text-[10px] font-bold uppercase text-white disabled:bg-[#EAEAEA] disabled:text-[#AAA]"
          >
            Buy
          </button>

          <button
            onClick={
              handleAddToCart
            }
            disabled={
              !product.inStock
            }
            className="flex h-10 flex-1 items-center justify-center gap-1 rounded-[4px] border border-[#111] text-[10px] font-bold uppercase text-[#111]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {isAddedToCart
              ? "Added"
              : "Add"}
          </button>
        </div>
      </div>

      {/* ========================= */}
      {/* FULLSCREEN */}
      {/* ========================= */}

      <AnimatePresence>
        {isFullscreen &&
          gallery.length >
            0 && (
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
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
              onClick={
                closeFullscreen
              }
            >
              <button
                onClick={
                  closeFullscreen
                }
                className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/60">
                {
                  fullscreenImageIndex +
                    1
                }{" "}
                /{" "}
                {
                  gallery.length
                }
              </div>

              <div
                className="relative h-[80vh] w-[90vw] max-w-5xl"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <Image
                  src={
                    gallery[
                      fullscreenImageIndex
                    ] ||
                    product.image
                  }
                  alt={
                    product.name
                  }
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>

              {gallery.length >
                1 && (
                <>
                  <button
                    onClick={
                      prevFullscreenImage
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    onClick={
                      nextFullscreenImage
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 flex max-w-[85vw] -translate-x-1/2 gap-1.5 overflow-x-auto">
                {gallery.map(
                  (
                    img,
                    index
                  ) => (
                    <button
                      key={
                        index
                      }
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        setFullscreenImageIndex(
                          index
                        );
                      }}
                      className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border-2 ${
                        fullscreenImageIndex ===
                        index
                          ? "border-white"
                          : "border-transparent opacity-50"
                      }`}
                    >
                      <Image
                        src={
                          img ||
                          PLACEHOLDER
                        }
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      <Footer />

      <style jsx global>{`
        .ik-ripple {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: currentColor;
          opacity: 0.28;
          pointer-events: none;
          animation: ikRipple
            0.7s
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            )
            forwards;
        }

        @keyframes ikRipple {
          to {
            transform: scale(15);
            opacity: 0;
          }
        }

        .ik-heart-pop {
          animation: ikHeart
            0.55s
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
            transform: scale(1.45);
          }

          70% {
            transform: scale(0.9);
          }

          100% {
            transform: scale(1);
          }
        }

        .ik-bump {
          animation: ikBump
            0.5s
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
            transform: scale(1.45);
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
              rgba(
                0,
                0,
                0,
                0.25
              );
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
    </div>
  );
}