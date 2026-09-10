"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import {
  Heart,
  ShoppingBag,
  Menu,
  X,
  ShoppingCart,
  PackageOpen,
  LogOut,
  UserCircle,
  Search,
  Grid3x3,
  ArrowRight,
  Package,
  LogOut as LogOutIcon,
  AlertCircle,
  Loader2,
  Home,
  Tag,
  Crown,
  Wallet,
  TrendingUp,
  ShoppingBag as ShoppingBagIcon,
  Award,
  Calendar,
  ChevronRight,
  Mic,
  LifeBuoy,
} from "lucide-react";

import Logo from "../../../public/indiekonnect-web/images/logo.png";

import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "../../lib/slices/toastSlice";

import { useGetCartQuery } from "@/lib/redux/api/cartApi";
import { useGetWishlistQuery } from "@/lib/redux/api/Wishlist/wishlistApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";

import {
  useGetDistributorStatsQuery,
  useGetHeaderQuery,
} from "@/lib/redux/api/headerApi";

/* =========================================================
   SPEECH TYPES
========================================================= */

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;

  start: () => void;
  stop: () => void;
  abort?: () => void;

  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

/* =========================================================
   LOGOUT MODAL
========================================================= */

const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.98,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
              y: 12,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-serif"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
              <div className="relative px-6 pb-4 pt-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F1F0]">
                  <LogOutIcon className="h-6 w-6 text-[#111111]" />
                </div>

                <h3 className="mb-1.5 text-[18px] font-semibold text-[#171717]">
                  Logout Confirmation
                </h3>

                <p className="text-[12px] leading-relaxed text-[#888888]">
                  Are you sure you want to logout? You'll need to login again
                  to access your account.
                </p>
              </div>

              <div className="mx-6 flex items-start gap-2.5 rounded-[6px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#777777]" />

                <p className="text-[11px] text-[#666666]">
                  Your session will be ended and you'll be redirected to the
                  login page.
                </p>
              </div>

              <div className="flex gap-2.5 border-t border-[#E6E6E4] bg-white px-6 py-4">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2.5 text-[11px] font-medium text-[#555555] transition-all duration-200 hover:bg-[#FAFAF9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#111111] px-4 py-2.5 text-[11px] font-semibold text-white transition-all duration-200 hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* =========================================================
   EARNINGS POPUP
========================================================= */

const EarningsPopup = ({
  isOpen,
  onClose,
  onViewDetails,
  stats,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  stats: any;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.98,
              y: 16,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
              y: 16,
            }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-serif"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
              <div className="relative bg-[#111111] px-6 pb-6 pt-7">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-1 text-white/60 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[7px] bg-white/10">
                    <Crown className="h-5 w-5 text-white" />
                  </div>

                  <div>
                    <h3 className="text-[16px] font-semibold text-white">
                      Partner Earnings
                    </h3>

                    <p className="text-[11px] text-white/70">
                      Your performance overview
                    </p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 className="h-7 w-7 animate-spin text-[#111111]" />
                </div>
              ) : stats ? (
                <div className="space-y-4 p-5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[#888888]">
                        <Wallet className="h-3 w-3" />
                        Total Earnings
                      </div>

                      <div className="text-[19px] font-semibold text-[#111111]">
                        {formatCurrency(stats.total_amount_mrp || 0)}
                      </div>
                    </div>

                    <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[#888888]">
                        <TrendingUp className="h-3 w-3" />
                        Total Savings
                      </div>

                      <div className="text-[19px] font-semibold text-[#111111]">
                        {formatCurrency(stats.total_savings || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[#888888]">
                        <ShoppingBagIcon className="h-3 w-3" />
                        Total Orders
                      </div>

                      <div className="text-[19px] font-semibold text-[#111111]">
                        {stats.total_orders || 0}
                      </div>
                    </div>

                    <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[#888888]">
                        <Award className="h-3 w-3" />
                        Coins Earned
                      </div>

                      <div className="text-[19px] font-semibold text-[#111111]">
                        {stats.total_coins_earned || 0}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#888888]">
                          Partner Since
                        </div>

                        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-[#171717]">
                          <Calendar className="h-3 w-3 text-[#555555]" />

                          {stats.joined_at
                            ? new Date(
                                stats.joined_at,
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </div>

                      <div className="rounded-full bg-[#F1F1F0] px-2.5 py-1">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-[#555555]">
                          {stats.account_type || "Partner"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={onViewDetails}
                      className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#111111] py-2.5 text-[11px] font-semibold text-white hover:bg-[#292929]"
                    >
                      View Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={onClose}
                      className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2.5 text-[11px] font-medium text-[#555555]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F1F0]">
                    <PackageOpen className="h-6 w-6 text-[#999999]" />
                  </div>

                  <p className="text-[13px] font-medium text-[#171717]">
                    No earnings data available
                  </p>

                  <p className="mt-1 text-[11px] text-[#888888]">
                    Start selling to see your earnings
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* =========================================================
   HEADER
========================================================= */

export default function Header({
  hideAnnouncement = false,
  hideMenu = false,
  showSidebarMenu = false,
  onSidebarMenuClick,
}: {
  hideAnnouncement?: boolean;
  hideMenu?: boolean;
  showSidebarMenu?: boolean;
  onSidebarMenuClick?: () => void;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { logout } = useLogout();

  /* =========================================================
     STATES
  ========================================================= */

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isEarningsPopupOpen, setIsEarningsPopupOpen] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isDistributor, setIsDistributor] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  /* CATEGORY HOVER */
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(
    null,
  );

  /* =========================================================
     REFS
  ========================================================= */

  const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categoryCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const voiceRecognitionRef = useRef<SpeechRecognitionLike | null>(null);

  /* =========================================================
     API
  ========================================================= */

  const {
    data: cartData,
    isLoading: isCartLoading,
  } = useGetCartQuery();

  const { data: wishlistData } = useGetWishlistQuery();

  const { data: userProfileData } = useGetUserProfileQuery();

  const { data: categoriesData } = useGetCategoriesQuery();

  const { data: headerData } = useGetHeaderQuery();

  const {
    data: distributorStats,
    isLoading: isDistributorStatsLoading,
    refetch: refetchDistributorStats,
  } = useGetDistributorStatsQuery(undefined, {
    skip: !isDistributor,
  });

  const {
    data: productsData,
    isLoading: isProductsLoading,
  } = useGetProductsQuery(
    {
      search:
        debouncedSearchQuery.length >= 1
          ? debouncedSearchQuery
          : undefined,
      limit: 5,
    },
    {
      skip: debouncedSearchQuery.length < 1,
    },
  );

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const authToken = localStorage.getItem("auth_token");

    const distributorToken = localStorage.getItem("distributor_token");

    const type = localStorage.getItem("user_type");

    setUserType(type);
    setIsCustomer(!!authToken);
    setIsDistributor(!!distributorToken);
  }, []);

  /* =========================================================
     VOICE SUPPORT
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    setVoiceSupported(!!SpeechRecognition);
  }, []);

  /* =========================================================
     SEARCH DEBOUNCE
  ========================================================= */

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  /* =========================================================
     SCROLL
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     DATA
  ========================================================= */

  const cartItems = cartData?.data?.items || [];

  const cartCount = cartData?.data?.total_items || 0;

  const cartSubtotalFormatted = cartData?.data?.total_formatted || "0.00";

  const wishlistItems = wishlistData?.data || [];

  const wishlistCount = wishlistItems.length;

  const productSuggestions = productsData?.data || [];

  /* =========================================================
     PRICE HELPERS
  ========================================================= */

  const isValidPrice = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return false;
    }

    const numericValue = Number(value);

    return Number.isFinite(numericValue) && numericValue > 0;
  };

  const formatProductPrice = (product: any) => {
    /*
      CUSTOMER
      -> retail price

      DISTRIBUTOR
      -> distributor price

      DISTRIBUTOR PRICE 0/null
      -> fallback to retail price
    */

    if (isDistributor) {
      if (isValidPrice(product?.distributor_price)) {
        return product?.distributor_price_formatted
          ? product.distributor_price_formatted
          : new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(Number(product.distributor_price));
      }

      if (isValidPrice(product?.retail_price)) {
        return product?.retail_price_formatted
          ? product.retail_price_formatted
          : new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(Number(product.retail_price));
      }

      return "₹0";
    }

    if (isValidPrice(product?.retail_price)) {
      return product?.retail_price_formatted
        ? product.retail_price_formatted
        : new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(Number(product.retail_price));
    }

    return "₹0";
  };

  const hasSuggestions = productSuggestions.length > 0;

  const isSearching =
    isProductsLoading && debouncedSearchQuery.length >= 1;

  const userProfile = userProfileData?.user;

  const userName = userProfile?.full_name || "User";

  const userEmail = userProfile?.email || "";

  const userInitial = userName.charAt(0).toUpperCase();

  const userProfilePicture = userProfileData?.user?.profile_picture || null;

  /* =========================================================
     ACTIVE CATEGORIES
  ========================================================= */

  const categories = (categoriesData?.data || []).filter(
    (category: any) => category.status === "active",
  );

  const headerMenus = headerData?.data?.menus || [];

  /* =========================================================
     TOP 5 CATEGORIES
  ========================================================= */

  const topFiveCategories = categories.slice(0, 5);

  /* =========================================================
     ACTIVE SUBCATEGORIES
  ========================================================= */

  const allSubcategories = (categoriesData?.subcategories || []).filter(
    (subcategory: any) => subcategory.status === true,
  );

  /* =========================================================
     GET CATEGORY SUBCATEGORIES
  ========================================================= */

  const getCategorySubcategories = (categoryId: number) => {
    if (!categoryId) return [];

    return allSubcategories.filter(
      (subcategory: any) =>
        Number(subcategory?.category_id) === Number(categoryId),
    );
  };

  /* =========================================================
     MEN / WOMEN
  ========================================================= */

  const getSubcategoryType = (subcategory: any) => {
    const name = String(subcategory?.name || "")
      .trim()
      .toLowerCase();

    if (
      name.includes("for her") ||
      name === "woman" ||
      name === "women" ||
      name.includes("women") ||
      name.includes("girl")
    ) {
      return "women";
    }

    if (
      name.includes("for him") ||
      name === "man" ||
      name === "men" ||
      name.includes("men") ||
      name.includes("boy")
    ) {
      return "men";
    }

    return null;
  };

  const menSubcategory =
    allSubcategories.find((subcategory: any) => {
      const type = getSubcategoryType(subcategory);

      return (
        type === "men" &&
        String(subcategory.name || "")
          .toLowerCase()
          .includes("for him")
      );
    }) ||
    allSubcategories.find(
      (subcategory: any) => getSubcategoryType(subcategory) === "men",
    );

  const womenSubcategory =
    allSubcategories.find((subcategory: any) => {
      const type = getSubcategoryType(subcategory);

      return (
        type === "women" &&
        String(subcategory.name || "")
          .toLowerCase()
          .includes("for her")
      );
    }) ||
    allSubcategories.find(
      (subcategory: any) => getSubcategoryType(subcategory) === "women",
    );

  /* =========================================================
     MENU HELPERS
  ========================================================= */

  const getMenuHref = (slug: string) => {
    const hrefMap: {
      [key: string]: string;
    } = {
      home: "/",
      shop: "/products",
      "new-arrivals": "/products?new-arrivals=true",
      "contact-us": "/contact",
      support: "/contact",
      "partner-hub": "/partner/dashboard",
      earnings: "/profile/?tab=earnings",
      products: "/partner/products",
    };

    return hrefMap[slug] || `/${slug}`;
  };

  /* =========================================================
     DIRECT CATEGORY MENUS
  ========================================================= */

  const directCategoryMenus = topFiveCategories.map((category: any) => ({
    label: category.title,

    href: `/products?category=${encodeURIComponent(
      category.slug || category.title,
    )}`,

    icon: Grid3x3,

    isCategory: true,

    categoryId: category.id,

    subcategories: getCategorySubcategories(category.id),
  }));

  /* =========================================================
     MEN / WOMEN NAVIGATION
  ========================================================= */

  const directSubcategoryMenus: any[] = [];

  if (menSubcategory) {
    directSubcategoryMenus.push({
      label: "Men",
      href: `/products?subcategory_ids=${menSubcategory.id}`,
      icon: UserCircle,
      isSubcategory: true,
      subcategoryId: menSubcategory.id,
    });
  }

  if (womenSubcategory) {
    directSubcategoryMenus.push({
      label: "Women",
      href: `/products?subcategory_ids=${womenSubcategory.id}`,
      icon: UserCircle,
      isSubcategory: true,
      subcategoryId: womenSubcategory.id,
    });
  }

  /* =========================================================
     CATEGORY HOVER HANDLERS
  ========================================================= */

  const handleCategoryMouseEnter = (categoryId: number) => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);

      categoryCloseTimer.current = null;
    }

    setHoveredCategoryId(categoryId);
  };

  const handleCategoryMouseLeave = () => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
    }

    categoryCloseTimer.current = setTimeout(() => {
      setHoveredCategoryId(null);
    }, 150);
  };

  const handleCategoryPopupEnter = (categoryId: number) => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);

      categoryCloseTimer.current = null;
    }

    setHoveredCategoryId(categoryId);
  };

  const handleCategoryPopupLeave = () => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
    }

    categoryCloseTimer.current = setTimeout(() => {
      setHoveredCategoryId(null);
    }, 150);
  };

  /* =========================================================
     ROLE BASED MENUS
  ========================================================= */

  const getRoleBasedMenus = () => {
    const menus: any[] = [];

    /* HOME */

    const homeExists = headerMenus.some(
      (menu: any) =>
        menu.status === true &&
        (menu.slug === "home" || menu.title === "Home"),
    );

    if (homeExists) {
      menus.push({
        label: "Home",
        href: "/",
        icon: Home,
        isCategory: false,
      });
    }

    /* SHOP */

    const shopExists = headerMenus.some(
      (menu: any) =>
        menu.status === true &&
        (menu.slug === "shop" || menu.title === "Shop"),
    );

    if (shopExists) {
      menus.push({
        label: "Shop",
        href: "/products",
        icon: Grid3x3,
        isCategory: false,
      });
    }

    /* MEN */

    const menMenu = directSubcategoryMenus.find(
      (item: any) => item.label === "Men",
    );

    if (menMenu) {
      menus.push(menMenu);
    }

    /* WOMEN */

    const womenMenu = directSubcategoryMenus.find(
      (item: any) => item.label === "Women",
    );

    if (womenMenu) {
      menus.push(womenMenu);
    }

    /* NEW ARRIVALS */

    const newArrivalsExists = headerMenus.some(
      (menu: any) =>
        menu.status === true &&
        (menu.slug === "new-arrivals" ||
          menu.title === "New arrivals"),
    );

    if (newArrivalsExists) {
      menus.push({
        label: "New arrivals",
        href: "/products?new-arrivals=true",
        icon: Tag,
        isCategory: false,
      });
    }

    /* MAX 5 CATEGORIES */

    const maximumFiveCategories = directCategoryMenus.slice(0, 5);

    menus.push(...maximumFiveCategories);

    /* SUPPORT */

    menus.push({
      label: "Support",
      href: "/contact",
      icon: LifeBuoy,
      isCategory: false,
      isSupport: true,
    });

    /* EARNINGS LAST */

    if (isDistributor) {
      menus.push({
        label: "Earnings",
        href: "/profile/?tab=earnings",
        icon: Crown,
        isCategory: false,
        isEarnings: true,
      });
    }

    return menus;
  };

  const desktopNavItems = getRoleBasedMenus();

  const mobileNavItems = getRoleBasedMenus();

  /* =========================================================
     CLOSE OVERLAYS
  ========================================================= */

  const closeHeaderOverlays = () => {
    setIsMobileMenuOpen(false);

    setIsSearchFocused(false);

    setIsSearchHovered(false);

    setIsSearchExpanded(false);

    setHoveredCategoryId(null);

    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);

      searchCloseTimer.current = null;
    }

    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);

      categoryCloseTimer.current = null;
    }
  };

  /* =========================================================
     OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
        setIsSearchHovered(false);
        setIsSearchExpanded(false);

        if (searchCloseTimer.current) {
          clearTimeout(searchCloseTimer.current);

          searchCloseTimer.current = null;
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================================================
     VOICE SEARCH
  ========================================================= */

  const handleVoiceSearch = () => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      dispatch(
        showToast({
          message: "Voice search is not supported in this browser.",
          type: "error",
        }),
      );

      return;
    }

    if (isVoiceSearching) {
      try {
        voiceRecognitionRef.current?.stop();
      } catch (error) {
        console.error("Unable to stop voice recognition:", error);
      }

      setIsVoiceSearching(false);
      return;
    }

    const recognition =
      new SpeechRecognition() as SpeechRecognitionLike;

    voiceRecognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsVoiceSearching(true);
      setIsSearchOpen(true);
      setIsSearchFocused(true);
      setIsSearchHovered(true);
      setIsSearchExpanded(true);

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript?.trim() || "";

      if (transcript) {
        setSearchQuery(transcript);
        setDebouncedSearchQuery(transcript);

        setIsSearchOpen(true);
        setIsSearchExpanded(true);
        setIsSearchFocused(true);
        setIsSearchHovered(true);

        setTimeout(() => {
          const input = searchInputRef.current;

          if (input) {
            input.focus();

            input.setSelectionRange(
              transcript.length,
              transcript.length,
            );
          }
        }, 50);
      }
    };

    recognition.onerror = (event) => {
      console.error("Voice search error:", event.error);

      setIsVoiceSearching(false);

      if (event.error === "aborted") {
        return;
      }

      let message = "Unable to hear you. Please try again.";

      if (event.error === "not-allowed") {
        message =
          "Please allow microphone permission for voice search.";
      } else if (event.error === "no-speech") {
        message = "No speech detected. Please try again.";
      } else if (event.error === "audio-capture") {
        message = "No microphone was found on this device.";
      } else if (event.error === "network") {
        message =
          "Voice search network error. Please try again.";
      }

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );
    };

    recognition.onend = () => {
      setIsVoiceSearching(false);

      voiceRecognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Unable to start voice search:", error);

      setIsVoiceSearching(false);

      voiceRecognitionRef.current = null;

      dispatch(
        showToast({
          message:
            "Unable to start voice search. Please try again.",
          type: "error",
        }),
      );
    }
  };

  useEffect(() => {
    return () => {
      try {
        voiceRecognitionRef.current?.stop();
      } catch (error) {
        console.error(
          "Voice recognition cleanup error:",
          error,
        );
      }

      voiceRecognitionRef.current = null;

      if (categoryCloseTimer.current) {
        clearTimeout(categoryCloseTimer.current);
      }
    };
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToHome = () => {
    router.push("/");
    closeHeaderOverlays();
  };

  const goToProducts = (category?: string) => {
    let url = "/products";

    if (category && category !== "all") {
      const params = new URLSearchParams();

      params.append("category", category);

      url += `?${params.toString()}`;
    }

    router.push(url);

    closeHeaderOverlays();
  };

  const goToSubcategory = (subcategory: any) => {
    const params = new URLSearchParams();

    params.append(
      "subcategory_ids",
      String(subcategory.id),
    );

    router.push(`/products?${params.toString()}`);

    closeHeaderOverlays();
  };

  const goToNewArrivals = () => {
    router.push("/products?new-arrivals=true");

    closeHeaderOverlays();
  };

  const goToWishlist = () => {
    router.push("/wishlist");

    closeHeaderOverlays();
  };

  const goToCart = () => {
    router.push("/cart");

    setIsCartOpen(false);

    closeHeaderOverlays();
  };

  const goToTrackOrder = () => {
    router.push("/profile/?tab=orders");

    closeHeaderOverlays();
  };

  const goToDashboard = () => {
    router.push("/dashboard");

    closeHeaderOverlays();
  };

  const goToProfile = () => {
    const distributorToken = localStorage.getItem(
      "distributor_token",
    );

    const storedUserType = localStorage.getItem(
      "user_type",
    );

    const distributor =
      !!distributorToken &&
      storedUserType === "distributor";

    if (distributor) {
      router.push("/distributor/dashboard/");
    } else {
      router.push("/profile/");
    }

    setIsProfileOpen(false);

    closeHeaderOverlays();
  };

  const goToProductDetail = (slug: string) => {
    router.push(`/product/${slug}`);

    setSearchQuery("");

    setDebouncedSearchQuery("");

    closeHeaderOverlays();
  };

  const handleNavigation = (item: any) => {
    if (item.isEarnings) {
      openEarningsPopup();
      return;
    }

    if (item.isSubcategory) {
      const subcategory = allSubcategories.find(
        (subcategory: any) =>
          subcategory.id === item.subcategoryId,
      );

      if (subcategory) {
        goToSubcategory(subcategory);
      }

      return;
    }

    if (item.isCategory) {
      const category = categories.find(
        (cat: any) => cat.id === item.categoryId,
      );

      goToProducts(
        category?.slug || item.label,
      );

      return;
    }

    if (item.label === "Home") {
      goToHome();
      return;
    }

    if (item.label === "Shop") {
      goToProducts();
      return;
    }

    if (item.label === "New arrivals") {
      goToNewArrivals();
      return;
    }

    if (item.label === "Support") {
      router.push("/contact");

      closeHeaderOverlays();

      return;
    }

    router.push(item.href);

    closeHeaderOverlays();
  };

  /* =========================================================
     EARNINGS
  ========================================================= */

  const openEarningsPopup = () => {
    if (!isDistributor) {
      return;
    }

    refetchDistributorStats();

    setIsEarningsPopupOpen(true);

    setIsProfileOpen(false);

    setIsMobileMenuOpen(false);

    setHoveredCategoryId(null);
  };

  const closeEarningsPopup = () => {
    setIsEarningsPopupOpen(false);
  };

  const goToEarningsDetails = () => {
    setIsEarningsPopupOpen(false);

    router.push("/profile/?tab=earnings");

    closeHeaderOverlays();
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);

    try {
      await logout({
        callApi: true,
        clearReduxState: true,
        clearPersistedState: true,

        onSuccess: () => {
          dispatch(
            showToast({
              message:
                "Successfully logged out! See you soon",
              type: "success",
            }),
          );

          setIsLoggingOut(false);

          setShowLogoutModal(false);

          setIsProfileOpen(false);

          setIsMobileMenuOpen(false);

          setIsEarningsPopupOpen(false);
        },

        onError: () => {
          dispatch(
            showToast({
              message:
                "Logout failed. Please try again.",
              type: "error",
            }),
          );

          setIsLoggingOut(false);

          setShowLogoutModal(false);
        },
      });
    } catch (error) {
      dispatch(
        showToast({
          message:
            "Something went wrong. Please try again.",
          type: "error",
        }),
      );

      setIsLoggingOut(false);

      setShowLogoutModal(false);
    }
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);

    setIsProfileOpen(false);
  };

  const closeLogoutModal = () => {
    if (!isLoggingOut) {
      setShowLogoutModal(false);
    }
  };

  /* =========================================================
     CART / PROFILE
  ========================================================= */

  const openCartDropdown = () => {
    if (cartCloseTimer.current) {
      clearTimeout(cartCloseTimer.current);
    }

    setIsCartOpen(true);
  };

  const scheduleCloseCartDropdown = () => {
    if (cartCloseTimer.current) {
      clearTimeout(cartCloseTimer.current);
    }

    cartCloseTimer.current = setTimeout(() => {
      setIsCartOpen(false);
    }, 200);
  };

  const openProfileDropdown = () => {
    if (profileCloseTimer.current) {
      clearTimeout(profileCloseTimer.current);
    }

    setIsProfileOpen(true);
  };

  const scheduleCloseProfileDropdown = () => {
    if (profileCloseTimer.current) {
      clearTimeout(profileCloseTimer.current);
    }

    profileCloseTimer.current = setTimeout(() => {
      setIsProfileOpen(false);
    }, 200);
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const openSearchOnHover = () => {
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);

      searchCloseTimer.current = null;
    }

    setIsSearchHovered(true);

    setIsSearchExpanded(true);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const scheduleCloseSearchOnHover = () => {
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);

      searchCloseTimer.current = null;
    }

    if (!isSearchFocused) {
      searchCloseTimer.current = setTimeout(() => {
        setIsSearchHovered(false);

        setIsSearchExpanded(false);

        searchCloseTimer.current = null;
      }, 500);
    }
  };

  const toggleSearch = () => {
    if (isSearchExpanded) {
      if (isVoiceSearching) {
        try {
          voiceRecognitionRef.current?.stop();
        } catch (error) {
          console.error(
            "Unable to stop voice search:",
            error,
          );
        }

        setIsVoiceSearching(false);
      }

      setIsSearchExpanded(false);

      setIsSearchFocused(false);

      setIsSearchHovered(false);

      setIsSearchOpen(false);

      setSearchQuery("");

      setDebouncedSearchQuery("");

      if (searchCloseTimer.current) {
        clearTimeout(searchCloseTimer.current);

        searchCloseTimer.current = null;
      }
    } else {
      setIsSearchOpen(true);

      setIsSearchExpanded(true);

      setIsSearchFocused(true);

      setIsSearchHovered(true);

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const handleSearch = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    const params = new URLSearchParams();

    params.append(
      "search",
      searchQuery.trim(),
    );

    if (
      searchCategory &&
      searchCategory !== "all"
    ) {
      params.append(
        "category",
        searchCategory,
      );
    }

    router.push(
      `/products?${params.toString()}`,
    );

    setSearchQuery("");

    setDebouncedSearchQuery("");

    closeHeaderOverlays();
  };

  /* =========================================================
     PROFILE MENU
  ========================================================= */

  const getProfileMenuItems = () => {
    const items: any[] = [
      {
        icon: UserCircle,
        label: "My Profile",
        onClick: goToProfile,
      },
    ];

    if (isDistributor) {
      items.push({
        icon: Crown,
        label: "Earnings",
        onClick: openEarningsPopup,
      });
    }

    items.push({
      icon: LogOutIcon,
      label: "Logout",
      onClick: openLogoutModal,
      isDanger: true,
    });

    return items;
  };

  const profileMenuItems = getProfileMenuItems();

  const earningsStats =
    distributorStats?.data || null;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />

      <EarningsPopup
        isOpen={isEarningsPopupOpen}
        onClose={closeEarningsPopup}
        onViewDetails={goToEarningsDetails}
        stats={earningsStats}
        isLoading={isDistributorStatsLoading}
      />

      {/* =====================================================
          ANNOUNCEMENT
      ===================================================== */}

      {!hideAnnouncement && (
        <div className="h-[30px] overflow-hidden bg-[#111111] text-white">
          <div className="flex h-full w-max items-center">
            <motion.div
              className="whitespace-nowrap px-4 text-[9px] font-medium tracking-[0.02em] sm:text-[10px]"
              animate={{
                x: ["0%", "-50%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              Cashback via Scratch Card on transaction via MobiKwik UPI. T&C
              Apply*. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              Cashback via Scratch Card on transaction via MobiKwik UPI. T&C
              Apply*. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              Cashback via Scratch Card on transaction via MobiKwik UPI. T&C
              Apply*. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              Cashback via Scratch Card on transaction via MobiKwik UPI. T&C
              Apply*. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              Cashback via Scratch Card on transaction via MobiKwik UPI. T&C
              Apply*.
            </motion.div>
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN STICKY HEADER
      ===================================================== */}

      <div
        className={`sticky top-0 z-40 w-full bg-white font-serif transition-shadow duration-300 ${
          isScrolled
            ? "shadow-[0_6px_24px_rgba(0,0,0,0.09)]"
            : "shadow-sm"
        }`}
      >
        {/* ===================================================
            MAIN HEADER ROW
        =================================================== */}

        <div className="w-full border-b border-[#ECECEC] bg-white">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex h-[74px] items-center gap-5 lg:h-[76px] lg:gap-7">
              {/* LOGO */}

              <Link
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  goToHome();
                }}
                className="flex shrink-0 items-center"
                aria-label="Home"
              >
                <div className="relative h-[46px] w-[104px] sm:h-[58px] sm:w-[116px]">
                  <Image
                    src={Logo}
                    alt="IndieKonnect"
                    fill
                    priority
                    sizes="116px"
                    className="object-contain object-left"
                  />
                </div>
              </Link>

              {/* DESKTOP SEARCH */}

              <div
                ref={searchRef}
                className="relative mx-auto hidden max-w-[800px] flex-1 md:block"
                onMouseEnter={openSearchOnHover}
                onMouseLeave={scheduleCloseSearchOnHover}
              >
                <form onSubmit={handleSearch}>
                  <div
                    className={`flex h-[40px] w-full items-center rounded-[10px] bg-[#FAFAFA] transition-all duration-200 sm:h-[42px] ${
                      isSearchFocused || isSearchExpanded
                        ? "bg-white ring-1 ring-[#111111]/10"
                        : "border border-gray-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={toggleSearch}
                      className="flex h-full w-10 shrink-0 items-center justify-center text-[#222222]"
                      aria-label="Search"
                    >
                      <Search
                        className="h-[16px] w-[16px]"
                        strokeWidth={1.7}
                      />
                    </button>

                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search ceramic"
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      onFocus={() => {
                        setIsSearchFocused(true);
                        setIsSearchHovered(true);
                        setIsSearchExpanded(true);

                        if (searchCloseTimer.current) {
                          clearTimeout(searchCloseTimer.current);

                          searchCloseTimer.current = null;
                        }
                      }}
                      className="h-full min-w-0 flex-1 bg-transparent pr-2 text-[12px] text-[#1B1B1B] outline-none placeholder:text-[#A6A6A6] sm:text-[13px]"
                    />

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setDebouncedSearchQuery("");
                        }}
                        className="mr-2 p-1 text-[#8E8E8E]"
                      >
                        <X className="h-[14px] w-[14px]" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleVoiceSearch}
                      disabled={!voiceSupported}
                      className={`relative flex h-full w-10 shrink-0 items-center justify-center rounded-r-[10px] ${
                        isVoiceSearching
                          ? "bg-red-50 text-red-500"
                          : voiceSupported
                            ? "text-[#2E2E2E] hover:bg-[#F0F0EE]"
                            : "cursor-not-allowed text-[#BDBDBD]"
                      }`}
                      aria-label="Voice search"
                    >
                      {isVoiceSearching && (
                        <motion.span
                          className="absolute inset-1 rounded-full border border-red-300"
                          animate={{
                            scale: [1, 1.12, 1],
                            opacity: [0.8, 0.25, 0.8],
                          }}
                          transition={{
                            duration: 1.1,
                            repeat: Infinity,
                          }}
                        />
                      )}

                      <Mic
                        className="relative h-[16px] w-[16px]"
                        strokeWidth={
                          isVoiceSearching ? 2.2 : 1.7
                        }
                      />
                    </button>
                  </div>
                </form>

                {/* SEARCH SUGGESTIONS */}

                <AnimatePresence>
                  {isSearchExpanded &&
                    searchQuery.length >= 1 && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -6,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -6,
                        }}
                        className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[10px] border border-[#E4E4E4] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)]"
                      >
                        {isSearching && (
                          <div className="flex items-center justify-center py-7">
                            <Loader2 className="h-5 w-5 animate-spin text-[#111111]" />

                            <span className="ml-2 text-[12px] text-[#888888]">
                              Searching products...
                            </span>
                          </div>
                        )}

                        {!isSearching &&
                          hasSuggestions && (
                            <div className="p-3">
                              <div className="px-2 pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#777777]">
                                Products
                              </div>

                              <div className="space-y-1">
                                {productSuggestions.map(
                                  (product: any) => (
                                    <button
                                      key={product.id}
                                      onClick={() =>
                                        goToProductDetail(
                                          product.slug,
                                        )
                                      }
                                      className="flex w-full items-center gap-3 rounded-[6px] px-2.5 py-2 text-left hover:bg-[#F8F8F8]"
                                    >
                                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[5px] bg-[#F3F3F3]">
                                        <Image
                                          src={
                                            product.primary_image_url ||
                                            "/indiekonnect-web/images/placeholder.jpg"
                                          }
                                          alt={product.name}
                                          fill
                                          sizes="40px"
                                          className="object-cover"
                                        />
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-[12px] text-[#222222]">
                                          {product.name}
                                        </p>

                                        {/* ACCOUNT TYPE BASED PRICE */}
                                        <p className="mt-0.5 text-[11px] font-semibold text-[#111111]">
                                          {formatProductPrice(product)}
                                        </p>
                                      </div>

                                      <ArrowRight className="h-3.5 w-3.5 text-[#BDBDBD]" />
                                    </button>
                                  ),
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  const params =
                                    new URLSearchParams();

                                  params.append(
                                    "search",
                                    searchQuery,
                                  );

                                  router.push(
                                    `/products?${params.toString()}`,
                                  );

                                  setSearchQuery("");

                                  setDebouncedSearchQuery("");

                                  closeHeaderOverlays();
                                }}
                                className="mt-2.5 h-9 w-full rounded-[6px] bg-[#111111] text-[11px] font-semibold text-white"
                              >
                                View all products
                              </button>
                            </div>
                          )}

                        {!isSearching &&
                          debouncedSearchQuery.length >= 1 &&
                          !hasSuggestions && (
                            <div className="px-4 py-9 text-center">
                              <PackageOpen className="mx-auto h-9 w-9 text-[#D8D8D8]" />

                              <p className="mt-3 text-[12px] font-medium text-[#222222]">
                                No products found
                              </p>

                              <p className="mt-1 text-[10px] text-[#8B8B8B]">
                                No products match "
                                {searchQuery}"
                              </p>
                            </div>
                          )}

                        <div className="flex items-center justify-between border-t border-[#EEEEEE] px-3 py-2 text-[9px] text-[#9A9A9A]">
                          <span>
                            Showing {productSuggestions.length} results
                          </span>

                          <span>
                            Press Enter to search all
                          </span>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>

              {/* RIGHT ACTIONS */}

              <div className="hidden shrink-0 items-center sm:flex">
                {/* ACCOUNT */}

                <div
                  className="relative"
                  onMouseEnter={openProfileDropdown}
                  onMouseLeave={scheduleCloseProfileDropdown}
                >
                  <button
                    onClick={goToProfile}
                    className="flex h-[56px] min-w-[66px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626]"
                  >
                    <UserCircle
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.5}
                    />

                    <span className="text-[10px] leading-none">
                      Account
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -6,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -6,
                        }}
                        className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-[8px] border border-[#E4E4E4] bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)]"
                        onMouseEnter={openProfileDropdown}
                        onMouseLeave={scheduleCloseProfileDropdown}
                      >
                        <div className="flex items-center gap-3 border-b border-[#ECECEC] px-5 py-4">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-[14px] font-medium text-white">
                            {userProfilePicture ? (
                              <img
                                src={userProfilePicture}
                                alt={userName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              userInitial
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#171717]">
                              {userName}
                            </p>

                            <p className="truncate text-[10px] text-[#888888]">
                              {userEmail}
                            </p>
                          </div>
                        </div>

                        <div className="py-1">
                          {profileMenuItems.map(
                            (item: any) => (
                              <button
                                key={item.label}
                                onClick={item.onClick}
                                className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-[12px] ${
                                  item.isDanger
                                    ? "mt-1 border-t border-[#EEEEEE] pt-3 text-[#B24C4C]"
                                    : "text-[#4B4B4B] hover:bg-[#FAFAFA]"
                                }`}
                              >
                                <item.icon className="h-4 w-4" />

                                {item.label}
                              </button>
                            ),
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* WISHLIST */}

                <button
                  onClick={goToWishlist}
                  className="relative flex h-[56px] min-w-[66px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626]"
                >
                  <span className="relative">
                    <Heart
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.5}
                    />

                    {wishlistCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#111111] text-[8px] font-semibold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </span>

                  <span className="text-[10px] leading-none">
                    Wishlist
                  </span>
                </button>

                {/* CART */}

                <div
                  className="relative"
                  onMouseEnter={openCartDropdown}
                  onMouseLeave={scheduleCloseCartDropdown}
                >
                  <button
                    onClick={goToCart}
                    className="relative flex h-[56px] min-w-[66px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626]"
                  >
                    <span className="relative">
                      <ShoppingBag
                        className="h-[18px] w-[18px]"
                        strokeWidth={1.5}
                      />

                      {cartCount > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#111111] text-[8px] font-semibold text-white">
                          {cartCount}
                        </span>
                      )}
                    </span>

                    <span className="text-[10px] leading-none">
                      Cart
                    </span>
                  </button>

                  <AnimatePresence>
                    {isCartOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -6,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -6,
                        }}
                        className="absolute right-0 top-full z-50 mt-1 w-[380px] overflow-hidden rounded-[8px] border border-[#E4E4E4] bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)]"
                        onMouseEnter={openCartDropdown}
                        onMouseLeave={scheduleCloseCartDropdown}
                      >
                        <div className="flex items-center justify-between border-b border-[#ECECEC] px-5 py-4">
                          <div>
                            <span className="text-[14px] font-semibold text-[#171717]">
                              Your Cart
                            </span>

                            {cartCount > 0 && (
                              <span className="mt-0.5 block text-[11px] text-[#888888]">
                                {cartCount}{" "}
                                {cartCount === 1
                                  ? "item"
                                  : "items"}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              setIsCartOpen(false)
                            }
                            className="p-1 text-[#888888]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {isCartLoading ? (
                          <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-[#111111]" />
                          </div>
                        ) : cartItems.length === 0 ? (
                          <div className="px-6 py-12 text-center">
                            <PackageOpen className="mx-auto h-10 w-10 text-[#D8D8D8]" />

                            <p className="mt-3 text-[13px] font-medium text-[#222222]">
                              Your cart is empty
                            </p>

                            <button
                              onClick={() => {
                                setIsCartOpen(false);

                                goToProducts();
                              }}
                              className="mt-4 h-9 rounded-[6px] bg-[#111111] px-5 text-[11px] font-semibold text-white"
                            >
                              Start Shopping
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="max-h-80 divide-y divide-[#EEEEEE] overflow-y-auto">
                              {cartItems.map(
                                (item: any) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-3 px-4 py-3"
                                  >
                                    <Link
                                      href={`/product/${
                                        item.product?.slug ||
                                        item.product_id
                                      }`}
                                      onClick={() =>
                                        setIsCartOpen(false)
                                      }
                                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[6px] border border-[#E8E8E8] bg-[#F4F4F4]"
                                    >
                                      <Image
                                        src={
                                          item.image_url ||
                                          "/indiekonnect-web/images/placeholder.jpg"
                                        }
                                        alt={
                                          item.product?.name ||
                                          "Product"
                                        }
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                      />
                                    </Link>

                                    <div className="min-w-0 flex-1">
                                      <Link
                                        href={`/product/${
                                          item.product?.slug ||
                                          item.product_id
                                        }`}
                                        onClick={() =>
                                          setIsCartOpen(false)
                                        }
                                        className="block truncate text-[12px] font-medium text-[#171717]"
                                      >
                                        {item.product?.name}
                                      </Link>

                                      <div className="mt-1 flex items-center gap-2">
                                        <span className="text-[12px] font-semibold text-[#111111]">
                                          ₹
                                          {item.current_unit_price_formatted ||
                                            item.current_unit_price}
                                        </span>

                                        <span className="text-[10px] text-[#999999]">
                                          ×{" "}
                                          {item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>

                            <div className="border-t border-[#ECECEC] px-5 py-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-[#888888]">
                                  Subtotal
                                </span>

                                <span className="text-[15px] font-semibold text-[#111111]">
                                  ₹{cartSubtotalFormatted}
                                </span>
                              </div>

                              <button
                                onClick={goToCart}
                                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-[#111111] text-[11px] font-semibold text-white"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                View Cart
                              </button>
                            </div>
                          </>
                        )}

                        <div className="border-t border-[#ECECEC] bg-[#FAFAFA] px-5 py-2.5 text-center">
                          <span className="text-[9px] text-[#999999]">
                            Every order supports artisan communities
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* TRACK ORDER */}

                <button
                  onClick={goToTrackOrder}
                  className="flex h-[56px] min-w-[82px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626]"
                >
                  <Package
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.45}
                  />

                  <span className="whitespace-nowrap text-[10px] leading-none">
                    Track Order
                  </span>
                </button>
              </div>

              {/* MOBILE ACTIONS */}

              <div className="ml-auto flex items-center gap-1 sm:hidden">
                <button
                  onClick={toggleSearch}
                  className="p-2 text-[#222222]"
                >
                  <Search className="h-[18px] w-[18px]" />
                </button>

                <button
                  onClick={goToWishlist}
                  className="relative p-2 text-[#222222]"
                >
                  <Heart className="h-[18px] w-[18px]" />

                  {wishlistCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#111111] text-[7px] text-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={goToCart}
                  className="relative p-2 text-[#222222]"
                >
                  <ShoppingBag className="h-[18px] w-[18px]" />

                  {cartCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#111111] text-[7px] text-white">
                      {cartCount}
                    </span>
                  )}
                </button>

                {!hideMenu && (
                  <button
                    onClick={() =>
                      setIsMobileMenuOpen(
                        !isMobileMenuOpen,
                      )
                    }
                    className="p-2 text-[#222222]"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            MOBILE SEARCH
        =================================================== */}

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden border-t border-[#ECECEC] bg-[#FAFAFA] px-4 py-3 sm:hidden"
            >
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2"
              >
                <div className="flex h-10 flex-1 items-center rounded-[10px] bg-white px-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                  <Search className="h-4 w-4 text-[#8E8E8E]" />

                  <input
                    type="text"
                    placeholder="Search ceramic"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="h-full w-full bg-transparent px-2 text-[12px] text-[#222222] outline-none"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setDebouncedSearchQuery("");
                      }}
                      className="text-[#888888]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    disabled={!voiceSupported}
                    className="rounded-full p-1.5 text-[#555555]"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  className="h-10 rounded-[10px] bg-[#111111] px-4 text-[11px] font-semibold text-white"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            DESKTOP NAVIGATION
        =================================================== */}

        {!hideMenu && (
          <div className="hidden border-t border-b border-[#E5E5E5] bg-white lg:block">
            <div className="mx-auto max-w-[1280px] px-4">
              <nav className="flex min-h-[49px] items-center justify-center gap-[28px] overflow-visible whitespace-nowrap">
                {desktopNavItems.map(
                  (item: any) => {
                    /* CATEGORY ITEM */

                    if (item.isCategory) {
                      const categorySubcategories =
                        getCategorySubcategories(
                          item.categoryId,
                        );

                      const hasSubcategories =
                        categorySubcategories.length > 0;

                      return (
                        <div
                          key={`category-wrapper-${item.categoryId}`}
                          className="relative h-[49px] shrink-0"
                          onMouseEnter={() => {
                            if (hasSubcategories) {
                              handleCategoryMouseEnter(
                                item.categoryId,
                              );
                            }
                          }}
                          onMouseLeave={() => {
                            if (hasSubcategories) {
                              handleCategoryMouseLeave();
                            }
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleNavigation(item)
                            }
                            className="group flex h-[49px] shrink-0 items-center border-b-2 border-transparent text-[11px] font-medium uppercase tracking-[0.025em] text-[#333333] transition-all duration-200 hover:border-[#111111] hover:text-black"
                          >
                            <span>{item.label}</span>

                            {hasSubcategories && (
                              <ChevronRight
                                className="ml-1 h-3 w-3 rotate-90 opacity-45 transition-all duration-200 group-hover:opacity-80"
                                strokeWidth={1.8}
                              />
                            )}
                          </button>

                          {/* SUBCATEGORY POPUP */}

                          <AnimatePresence>
                            {hoveredCategoryId ===
                              item.categoryId &&
                              hasSubcategories && (
                                <motion.div
                                  initial={{
                                    opacity: 0,
                                    y: 8,
                                    scale: 0.98,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                  }}
                                  exit={{
                                    opacity: 0,
                                    y: 8,
                                    scale: 0.98,
                                  }}
                                  transition={{
                                    duration: 0.18,
                                    ease: [
                                      0.16,
                                      1,
                                      0.3,
                                      1,
                                    ],
                                  }}
                                  onMouseEnter={() =>
                                    handleCategoryPopupEnter(
                                      item.categoryId,
                                    )
                                  }
                                  onMouseLeave={
                                    handleCategoryPopupLeave
                                  }
                                  className="absolute left-1/2 top-[49px] z-[90] w-[270px] -translate-x-1/2 overflow-hidden rounded-[10px] border border-[#E4E4E4] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.14)]"
                                >
                                  <div className="absolute -top-[5px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-[#E4E4E4] bg-white" />

                                  <div className="relative border-b border-[#EEEEEE] bg-[#FAFAF9] px-4 py-3">
                                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#A0A0A0]">
                                      Explore
                                    </p>

                                    <div className="mt-0.5 flex items-center justify-between gap-2">
                                      <p className="truncate text-[12px] font-semibold text-[#171717]">
                                        {item.label}
                                      </p>

                                      <span className="shrink-0 rounded-full bg-[#EFEFED] px-2 py-0.5 text-[8px] font-medium text-[#777777]">
                                        {
                                          categorySubcategories.length
                                        }
                                      </span>
                                    </div>
                                  </div>

                                  <div className="max-h-[310px] overflow-y-auto p-2 scrollbar-hide">
                                    {categorySubcategories.map(
                                      (subcategory: any) => (
                                        <button
                                          key={subcategory.id}
                                          type="button"
                                          onClick={() =>
                                            goToSubcategory(
                                              subcategory,
                                            )
                                          }
                                          className="group flex w-full items-center gap-3 rounded-[7px] px-3 py-2.5 text-left transition-all duration-200 hover:bg-[#F6F6F4]"
                                        >
                                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F1F1EF] text-[#707070] transition-colors duration-200 group-hover:bg-[#111111] group-hover:text-white">
                                            <Grid3x3 className="h-3.5 w-3.5" />
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-[11px] font-medium text-[#353535] transition-colors group-hover:text-[#111111]">
                                              {subcategory.name}
                                            </p>

                                            {subcategory.category_title && (
                                              <p className="mt-0.5 truncate text-[8px] text-[#A0A0A0]">
                                                {
                                                  subcategory.category_title
                                                }
                                              </p>
                                            )}
                                          </div>

                                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#BDBDBD] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#222222]" />
                                        </button>
                                      ),
                                    )}
                                  </div>

                                  <div className="border-t border-[#EEEEEE] bg-white p-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleNavigation(
                                          item,
                                        )
                                      }
                                      className="flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-[#111111] text-[10px] font-semibold text-white transition-all duration-200 hover:bg-[#292929]"
                                    >
                                      View All {item.label}

                                      <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    /* NORMAL ITEM */

                    return (
                      <button
                        key={
                          item.isSubcategory
                            ? `subcategory-${item.subcategoryId}`
                            : item.label
                        }
                        type="button"
                        onClick={() =>
                          handleNavigation(item)
                        }
                        className="group flex h-[49px] shrink-0 items-center border-b-2 border-transparent text-[11px] font-medium uppercase tracking-[0.025em] text-[#242424] transition-all duration-200 hover:border-[#111111] hover:text-black"
                      >
                        <span>{item.label}</span>
                      </button>
                    );
                  },
                )}
              </nav>
            </div>
          </div>
        )}

        {/* ===================================================
            MOBILE MENU
        =================================================== */}

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              className="max-h-[78vh] overflow-y-auto border-t border-[#ECECEC] bg-[#FAFAFA] lg:hidden"
            >
              <div className="px-4 py-4">
                {/* USER */}

                <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-[14px] font-medium text-white">
                    {userProfilePicture ? (
                      <img
                        src={userProfilePicture}
                        alt={userName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      userInitial
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#222222]">
                      {userName}
                    </p>

                    <p className="truncate text-[10px] text-[#888888]">
                      {userEmail}
                    </p>
                  </div>
                </div>

                {/* MOBILE NAV */}

                <div className="pt-3">
                  {mobileNavItems.map(
                    (item: any) => (
                      <div
                        key={
                          item.isCategory
                            ? `mobile-category-${item.categoryId}`
                            : item.isSubcategory
                              ? `mobile-subcategory-${item.subcategoryId}`
                              : `mobile-${item.label}`
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleNavigation(item)
                          }
                          className="flex min-h-[44px] w-full items-center justify-between border-b border-[#EEEEEE] px-3 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-[17px] w-[17px] text-[#777777]" />

                            <span className="text-[12px] font-medium text-[#333333]">
                              {item.label}
                            </span>
                          </div>

                          <ArrowRight className="h-4 w-4 text-[#BEBEBE]" />
                        </button>
                      </div>
                    ),
                  )}
                </div>

                {/* PROFILE ACTIONS */}

                <div className="mt-3 flex flex-wrap gap-2 border-t border-[#E5E5E5] pt-4">
                  <button
                    onClick={goToProfile}
                    className="flex h-9 items-center gap-2 rounded-[6px] border border-[#DDDDDD] bg-white px-3 text-[11px] text-[#444444]"
                  >
                    <UserCircle className="h-3.5 w-3.5" />

                    {isDistributor
                      ? "Dashboard"
                      : "My Profile"}
                  </button>

                  {isDistributor && (
                    <button
                      onClick={openEarningsPopup}
                      className="flex h-9 items-center gap-2 rounded-[6px] border border-[#DDDDDD] bg-white px-3 text-[11px] text-[#444444]"
                    >
                      <Crown className="h-3.5 w-3.5" />

                      Earnings
                    </button>
                  )}

                  <button
                    onClick={openLogoutModal}
                    className="flex h-9 items-center gap-2 rounded-[6px] border border-[#F0D5D5] bg-[#FFF8F8] px-3 text-[11px] text-[#B24C4C]"
                  >
                    <LogOutIcon className="h-3.5 w-3.5" />

                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}