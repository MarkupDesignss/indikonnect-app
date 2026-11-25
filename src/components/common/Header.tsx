"use client";

import "./premium-header.css";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { getAppType } from "@/lib/appConfig";

import {
  Heart,
  ShoppingBag,
  Menu,
  X,
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
  MapPin,
  LifeBuoy,
  ChevronRight,
  Mic,
  BadgeCheck,
  Headphones,
  ChevronDown,
} from "lucide-react";

import Logo from "../../../public/indiekonnect-web/images/logo.png";
import PlaceholderImage from "../../../public/indiekonnect-web/images/placeholder.jpg";

import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "../../lib/slices/toastSlice";

import { useGetCartQuery } from "@/lib/redux/api/cartApi";
import { useGetWishlistQuery } from "@/lib/redux/api/Wishlist/wishlistApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useGetHeaderQuery } from "@/lib/redux/api/headerApi";

/* =========================================================
   FESTIVE MODE
   Keep false to use the standard header. The festive classes
   and decorative elements remain available when enabled.
========================================================= */

const DIWALI_MODE = false;

const IK_FIREWORKS = [
  { x: "7%", y: "51%", color: "#ffd995", delay: "-1.5s" },
  { x: "94%", y: "44%", color: "#ffc6af", delay: "-4.3s" },
  { x: "24%", y: "41%", color: "#ffd995", delay: "-6.1s" },
  { x: "78%", y: "52%", color: "#ffe8bb", delay: "-3.0s" },
];

const IK_GLINTS = [
  ["2%", "28%", "-2.2s"],
  ["15%", "68%", "-1.3s"],
  ["30%", "18%", "-2.8s"],
  ["43%", "76%", "-0.6s"],
  ["56%", "23%", "-1.8s"],
  ["69%", "67%", "-3.1s"],
  ["85%", "16%", "-2.6s"],
  ["98%", "77%", "-0.4s"],
];

function FestiveCrackers() {
  return (
    <div className="ik-cracker-layer" aria-hidden="true">
      {IK_FIREWORKS.map((firework, i) => (
        <span
          key={`firework-${i}`}
          className="ik-cracker-burst"
          style={
            {
              left: firework.x,
              top: firework.y,
              "--ik-fire-color": firework.color,
              "--ik-fire-delay": firework.delay,
            } as React.CSSProperties
          }
        >
          <span className="ik-cracker-trail" />
          <span className="ik-cracker-burst-ring" />
          <span className="ik-cracker-burst-core" />
          {Array.from({ length: 12 }, (_, ray) => (
            <i
              key={ray}
              className="ik-cracker-ray"
              style={{ "--ik-angle": `${ray * 30}deg` } as React.CSSProperties}
            />
          ))}
        </span>
      ))}

      {IK_GLINTS.map(([x, y, delay], i) => (
        <span
          className="ik-cracker-glint"
          key={`glint-${i}`}
          style={
            {
              "--ik-glint-x": x,
              "--ik-glint-y": y,
              "--ik-glint-delay": delay,
              "--ik-glint-time": `${2.8 + (i % 3) * 0.6}s`,
            } as React.CSSProperties
          }
        />
      ))}
      <span className="ik-cracker-lightline" />
    </div>
  );
}

function FestiveDiyaMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path
        d="M18 5.3c-3.9 4.5-3.5 7.6-.3 9.1 3.4-1.3 3.8-4.6.3-9.1Z"
        fill="#F7D69B"
      />
      <path
        d="M17.8 10.6c-1.7 2.2-1.4 3.6.1 4.5 1.8-.9 1.9-2.6-.1-4.5Z"
        fill="#EAA763"
      />
      <path
        d="M7 19.2h22c-.9 7.2-5 10.9-11 10.9S7.9 26.4 7 19.2Z"
        stroke="#F1CC88"
        strokeWidth="1.6"
      />
      <path
        d="M5.3 18.8c4.2 2.1 21.3 2.1 25.4 0"
        stroke="#F1CC88"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13 25.3c3.3 1.7 6.7 1.7 10 0"
        stroke="#F1CC88"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M9.5 32.3h17"
        stroke="#F1CC88"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   SPEECH / LOCATION TYPES
========================================================= */

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
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

interface LocationInfo {
  locality: string | null;
  state: string | null;
  city: string | null;
  district: string | null;
  postcode: string | null;
  country: string | null;
}

/* =========================================================
   SCROLL CONFIG
========================================================= */

const SCROLL_COLLAPSE_AT = 80;
const SCROLL_EXPAND_AT = 10;
const NAV_COLLAPSE_AT = 260;
const NAV_EXPAND_AT = 140;
const INITIAL_HEADER_HEIGHT = 112;

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
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-lato"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-[10px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
              <div className="relative px-6 pb-5 pt-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F1F0]">
                  <LogOutIcon className="h-7 w-7 text-[#111111]" />
                </div>
                <h3 className="mb-2 text-[20px] font-semibold text-[#171717]">
                  Logout Confirmation
                </h3>
                <p className="text-[13px] leading-relaxed text-[#888888]">
                  Are you sure you want to logout? You&apos;ll need to login
                  again to access your account.
                </p>
              </div>
              <div className="mx-6 flex items-start gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#777777]" />
                <p className="text-[12px] leading-relaxed text-[#666666]">
                  Your session will be ended and you&apos;ll be redirected to
                  the current application home page.
                </p>
              </div>
              <div className="flex gap-3 border-t border-[#E6E6E4] bg-white px-6 py-5">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-[7px] border border-[#D7D7D5] bg-white px-4 py-3 text-[12px] font-medium text-[#555555] transition-all duration-200 hover:bg-[#FAFAF9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[7px] bg-[#111111] px-4 py-3 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
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
   EMPTY CART DRAWER
========================================================= */

const EmptyCartDrawer = ({
  isOpen,
  onClose,
  onContinueShopping,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContinueShopping: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="empty-cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[2000] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            key="empty-cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            className="fixed right-0 top-0 z-[2001] flex h-full w-full max-w-[420px] flex-col border-l border-[#E4E4E2] bg-white font-lato shadow-[-18px_0_60px_rgba(0,0,0,0.14)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E6E6E4] px-6 py-5">
              <h3 className="text-[18px] font-semibold text-[#171717]">
                Your Cart
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4E4E2] bg-white text-[#111111] transition-all duration-200 hover:bg-[#F4F4F3]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#F1F1F0]">
                <ShoppingBag className="h-10 w-10 text-[#111111]" />
              </div>
              <h4 className="mb-2 text-[20px] font-semibold text-[#171717]">
                Your cart is empty
              </h4>
              <p className="text-[13px] leading-relaxed text-[#888888]">
                Looks like you haven&apos;t added anything yet. Please continue
                shopping to discover our latest collections.
              </p>
            </div>
            <div className="flex flex-col gap-3 border-t border-[#E6E6E4] bg-white px-6 py-5">
              <button
                type="button"
                onClick={onContinueShopping}
                className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-[#111111] px-4 py-3 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#292929]"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-[7px] border border-[#D7D7D5] bg-white px-4 py-3 text-[12px] font-medium text-[#555555] transition-all duration-200 hover:bg-[#FAFAF9]"
              >
                Cancel
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* =========================================================
   HEADER INNER
========================================================= */

function HeaderInner({
  hideAnnouncement = false,
  hideMenu = false,
}: {
  hideAnnouncement?: boolean;
  hideMenu?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { logout } = useLogout();
  const { hasToken, appType } = useTokenCheck();

  const currentAppType = (() => {
    if (typeof window === "undefined") return appType;
    const websitePath = window.location.pathname.toLowerCase();
    if (websitePath.startsWith("/indiekonnect-distributor")) return "distributor";
    if (websitePath.startsWith("/indiekonnect-web")) return "customer";
    return getAppType();
  })();

  const isDistributor = currentAppType === "distributor";

  /* STATES */
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const [isAllDropdownOpen, setIsAllDropdownOpen] = useState(false);
  const [allDropdownPos, setAllDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 260,
  });
  const [comboDropdownPos, setComboDropdownPos] = useState({
    top: 0,
    left: 0,
  });
  const [mobileExpandedCategoryId, setMobileExpandedCategoryId] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isEmptyCartDrawerOpen, setIsEmptyCartDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // -1 is reserved for the Combo menu. Real category IDs are positive.
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(INITIAL_HEADER_HEIGHT);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  /* REFS */
  const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const allCategoriesBtnRef = useRef<HTMLButtonElement>(null);
  const allDropdownRef = useRef<HTMLDivElement>(null);
  const comboWrapRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  const updateComboPosition = () => {
    const anchor = comboWrapRef.current;
    if (!anchor || typeof window === "undefined") return;

    const rect = anchor.getBoundingClientRect();
    const dropdownWidth = 280;
    const left = Math.max(
      8,
      Math.min(rect.left, window.innerWidth - dropdownWidth - 8),
    );

    setComboDropdownPos({
      top: rect.bottom,
      left,
    });
  };

  /* API */
  const { data: cartData, refetch: refetchCart } = useGetCartQuery(undefined, {
    skip: hasToken !== true,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: hasToken !== true,
  });

  const { data: userProfileData } = useGetUserProfileQuery(undefined, {
    skip: hasToken !== true,
  });

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: headerData } = useGetHeaderQuery();

  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery(
    {
      is_published: 1,
      search: debouncedSearchQuery.trim().length >= 1
        ? debouncedSearchQuery.trim()
        : undefined,
      per_page: 5,
      page: 1,
    },
    { skip: debouncedSearchQuery.trim().length < 1 },
  );

  /* SCROLL LISTENER */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled((previous) => previous ? y > SCROLL_EXPAND_AT : y > SCROLL_COLLAPSE_AT);
      setIsNavCollapsed((previous) => previous ? y > NAV_EXPAND_AT : y > NAV_COLLAPSE_AT);
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* MEASURE HEADER HEIGHT */
  useEffect(() => {
    if (typeof window === "undefined" || !headerRef.current) return;
    const element = headerRef.current;

    const measure = () => {
      const height = element.getBoundingClientRect().height;
      if (height > 0) setHeaderHeight(height);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);

  /* CLOSE NAV DROPDOWNS WHEN HEADER COLLAPSES */
  useEffect(() => {
    if (isScrolled) {
      setIsAllCategoriesOpen(false);
      setHoveredCategoryId(null);
    }
  }, [isScrolled]);

  useEffect(() => {
    if (isNavCollapsed) setIsAllDropdownOpen(false);
  }, [isNavCollapsed]);

  /* ALL CATEGORIES PORTAL POSITION / OUTSIDE CLICK */
  useEffect(() => {
    if (!isAllDropdownOpen) return;

    const updatePosition = () => {
      const button = allCategoriesBtnRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const width = Math.max(rect.width, 260);
      const left = Math.min(rect.left, Math.max(8, window.innerWidth - width - 8));
      setAllDropdownPos({ top: rect.bottom + 6, left, width });
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (allDropdownRef.current?.contains(target)) return;
      if (allCategoriesBtnRef.current?.contains(target)) return;
      setIsAllDropdownOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAllDropdownOpen(false);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAllDropdownOpen]);

  /* COMBO DROPDOWN PORTAL POSITION */
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      hoveredCategoryId !== -1 ||
      isNavCollapsed ||
      comboCategories.length === 0
    ) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (categoryCloseTimer.current) {
          clearTimeout(categoryCloseTimer.current);
          categoryCloseTimer.current = null;
        }
        setHoveredCategoryId(null);
      }
    };

    updateComboPosition();
    window.addEventListener("resize", updateComboPosition);
    window.addEventListener("scroll", updateComboPosition, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updateComboPosition);
      window.removeEventListener("scroll", updateComboPosition);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [hoveredCategoryId, isNavCollapsed]);

  /* EMPTY CART DRAWER BODY LOCK */
  useEffect(() => {
    if (typeof window === "undefined" || !isEmptyCartDrawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsEmptyCartDrawerOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEmptyCartDrawerOpen]);

  /* RESTORE SAVED LOCATION */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("indiekonnect_delivery_location");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      const latitude = Number(parsed?.latitude);
      const longitude = Number(parsed?.longitude);

      if (parsed?.name && Number.isFinite(latitude) && Number.isFinite(longitude)) {
        if (String(parsed?.state || "").trim().toLowerCase() === "telangana") {
          setLocationName(null);
          setDeliveryAvailable(false);
          localStorage.removeItem("indiekonnect_delivery_location");
          return;
        }

        setLocationName(parsed.locality || parsed.name);
        setLocationCoordinates({ latitude, longitude });
        setDeliveryAvailable(parsed.deliveryAvailable !== false);
      }
    } catch {
      // Ignore malformed saved location.
    }
  }, []);

  /* VOICE SUPPORT */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  /* SEARCH DEBOUNCE */
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  /* DATA */
  const cartItems = cartData?.data?.items || [];
  const cartCount = cartData?.data?.total_items || 0;
  const cartSubtotalFormatted = cartData?.data?.total_formatted || "0.00";
  const wishlistItems = wishlistData?.data || [];
  const wishlistCount = wishlistItems.length;
  const productSuggestions = productsData?.data || [];
  const isCartEmpty = !!cartData && cartItems.length === 0 && cartCount === 0;
  const userProfile = userProfileData?.user;
  const isSearching = isProductsLoading && debouncedSearchQuery.trim().length >= 1;
  const hasSuggestions = productSuggestions.length > 0;

  const getProductSearchImage = (product: any): string => {
    const fallback = typeof PlaceholderImage === "string" ? PlaceholderImage : PlaceholderImage.src;
    const images = Array.isArray(product?.images) ? product.images : [];
    const primaryImage = images.find((image: any) =>
      image?.is_primary === true || image?.is_primary === 1 || image?.is_primary === "1"
    ) || images[0];

    const candidates = [
      primaryImage?.url,
      primaryImage?.image_url,
      primaryImage?.image,
      primaryImage?.path,
      product?.primary_image_url,
      product?.image_url,
      product?.image,
    ];

    return candidates.find((value): value is string =>
      typeof value === "string" && value.trim().length > 0
    ) || fallback;
  };

  const isValidPrice = (value: any) =>
    value !== null && value !== undefined && value !== "" &&
    Number.isFinite(Number(value)) && Number(value) > 0;

  const formatProductPrice = (product: any) => {
    const format = (value: any) => new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value));

    if (isDistributor) {
      if (isValidPrice(product?.distributor_price)) {
        return product?.distributor_price_formatted || format(product.distributor_price);
      }
      if (isValidPrice(product?.retail_price)) {
        return product?.retail_price_formatted || format(product.retail_price);
      }
      return "₹0";
    }

    if (isValidPrice(product?.retail_price)) {
      return product?.retail_price_formatted || format(product.retail_price);
    }
    return "₹0";
  };

  /* =========================================================
     CATEGORY GROUPING

     Every active category whose name contains '&' goes into
     Combo. All remaining active categories are direct links.
     Single categories intentionally have no arrows/submenus.
  ========================================================= */

  const categories = (categoriesData?.data || []).filter(
    (category: any) => category.status === "active",
  );

  const headerMenus = headerData?.data?.menus || [];

  const isComboCategory = (category: any) =>
    String(category?.title || category?.name || "").includes("&");

  const comboCategories = categories.filter(isComboCategory);
  const singleCategories = categories.filter((category: any) => !isComboCategory(category));

  const comboMenuItem = {
    label: "Combo",
    href: "#",
    isCombo: true,
    comboCategories,
  };

  const directCategoryMenus = singleCategories.map((category: any) => ({
    label: category.title || category.name,
    href: `/products?category=${encodeURIComponent(category.slug || category.title || category.name)}`,
    isCategory: true,
    categoryId: category.id,
  }));

  /* CATEGORY HOVER TIMER HELPERS */
  const handleCategoryMouseEnter = (id: number) => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
      categoryCloseTimer.current = null;
    }
    if (id === -1) updateComboPosition();
    setHoveredCategoryId(id);
  };

  const handleCategoryMouseLeave = () => {
    if (categoryCloseTimer.current) clearTimeout(categoryCloseTimer.current);
    categoryCloseTimer.current = setTimeout(() => setHoveredCategoryId(null), 180);
  };

  const handleCategoryPopupEnter = (id: number) => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
      categoryCloseTimer.current = null;
    }
    setHoveredCategoryId(id);
  };

  const handleCategoryPopupLeave = () => {
    if (categoryCloseTimer.current) clearTimeout(categoryCloseTimer.current);
    categoryCloseTimer.current = setTimeout(() => setHoveredCategoryId(null), 180);
  };

  /* ROLE BASED MENUS */
  const getRoleBasedMenus = () => {
    const menus: any[] = [];

    if (headerMenus.some((menu: any) =>
      menu.status === true && (menu.slug === "home" || menu.title === "Home")
    )) {
      menus.push({ label: "Home", href: "/home" });
    }

    if (headerMenus.some((menu: any) =>
      menu.status === true && (menu.slug === "shop" || menu.title === "Shop")
    )) {
      menus.push({ label: "Shop", href: "/products" });
    }

    if (headerMenus.some((menu: any) =>
      menu.status === true && (menu.slug === "new-arrivals" || menu.title === "New arrivals")
    )) {
      menus.push({ label: "New arrivals", href: "/products?new-arrivals=true" });
    }

    if (comboCategories.length > 0) menus.push(comboMenuItem);

    // No slice(0, 5): All Watches and every remaining category are visible.
    menus.push(...directCategoryMenus);

    menus.push({ label: "Support", href: "/contact", isSupport: true });
    return menus;
  };

  const desktopNavItems = getRoleBasedMenus();
  const mobileNavItems = getRoleBasedMenus();

  /* CLOSE HEADER OVERLAYS */
  const closeHeaderOverlays = () => {
    setIsMobileMenuOpen(false);
    setIsAllCategoriesOpen(false);
    setIsAllDropdownOpen(false);
    setIsEmptyCartDrawerOpen(false);
    setMobileExpandedCategoryId(null);
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

  /* SEARCH OUTSIDE CLICK */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* MOBILE DRAWER SCROLL LOCK */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setMobileExpandedCategoryId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  /* =========================================================
     LOCATION LOOKUP
  ========================================================= */

  const fetchFromBigDataCloud = async (
    latitude: number,
    longitude: number,
  ): Promise<LocationInfo | null> => {
    try {
      const url =
        "https://api.bigdatacloud.net/data/reverse-geocode-client" +
        `?latitude=${encodeURIComponent(latitude)}` +
        `&longitude=${encodeURIComponent(longitude)}` +
        "&localityLanguage=en";

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) return null;
      const json = await response.json();
      const administrative = Array.isArray(json?.localityInfo?.administrative)
        ? json.localityInfo.administrative
        : [];

      const city =
        json?.locality || json?.city || json?.principalArea ||
        administrative.find((item: any) =>
          item?.name && (
            item?.description?.toLowerCase()?.includes("city") ||
            item?.description?.toLowerCase()?.includes("town")
          )
        )?.name || null;

      const state =
        json?.principalSubdivision ||
        json?.principalSubdivisionCode?.replace(/^IN-/i, "")?.trim() ||
        administrative.find((item: any) =>
          item?.name && (
            item?.description?.toLowerCase()?.includes("state") ||
            item?.description?.toLowerCase()?.includes("province")
          )
        )?.name || null;

      const district =
        json?.county || json?.district ||
        administrative.find((item: any) =>
          item?.name && (
            item?.description?.toLowerCase()?.includes("district") ||
            item?.description?.toLowerCase()?.includes("county")
          )
        )?.name || null;

      const result: LocationInfo = {
        locality: json?.locality || null,
        state,
        city,
        district,
        postcode: json?.postcode || json?.postCode || json?.postalCode || null,
        country: json?.countryName || json?.countryCode || null,
      };

      if (!result.city && !result.state && !result.district && !result.country) return null;
      return result;
    } catch {
      return null;
    }
  };

  const fetchFromNominatim = async (
    latitude: number,
    longitude: number,
  ): Promise<LocationInfo | null> => {
    try {
      const url =
        "https://nominatim.openstreetmap.org/reverse" +
        `?lat=${encodeURIComponent(latitude)}` +
        `&lon=${encodeURIComponent(longitude)}` +
        "&format=jsonv2&accept-language=en&zoom=14&addressdetails=1";

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) return null;
      const json = await response.json();
      const address = json?.address || {};

      const result: LocationInfo = {
        locality:
          address?.suburb || address?.neighbourhood || address?.quarter ||
          address?.city_district || address?.town || address?.city || null,
        state: address?.state || address?.state_district || null,
        city:
          address?.city || address?.town || address?.village ||
          address?.municipality || address?.suburb || address?.county || null,
        district: address?.state_district || address?.county || null,
        postcode: address?.postcode || null,
        country: address?.country || null,
      };

      if (!result.city && !result.state && !result.district && !result.country) return null;
      return result;
    } catch {
      return null;
    }
  };

  const getLocationFromCoords = async (
    latitude: number,
    longitude: number,
  ): Promise<LocationInfo | null> => {
    const bigDataCloudResult = await fetchFromBigDataCloud(latitude, longitude);
    if (
      bigDataCloudResult &&
      (bigDataCloudResult.city || bigDataCloudResult.state || bigDataCloudResult.district)
    ) {
      return bigDataCloudResult;
    }
    return fetchFromNominatim(latitude, longitude);
  };

  const handleCheckAvailability = () => {
    if (typeof window === "undefined") return;
    setLocationError(null);

    if (!navigator.geolocation) {
      const message = "Location is not supported by your browser.";
      setLocationError(message);
      dispatch(showToast({ message, type: "error" }));
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLocationCoordinates({ latitude, longitude });

        try {
          const location = await getLocationFromCoords(latitude, longitude);
          if (!location) throw new Error("Unable to determine place name.");

          const city = location.locality || location.city || location.district || "";
          const state = location.state || "";
          const postcode = location.postcode || "";
          const country = location.country || "";

          if (state.trim().toLowerCase() === "telangana") {
            setLocationName(null);
            setDeliveryAvailable(false);
            localStorage.removeItem("indiekonnect_delivery_location");
            setLocationError("Delivery is currently unavailable in Telangana.");
            dispatch(showToast({
              message: "Sorry, delivery is not available in Telangana.",
              type: "error",
            }));
            return;
          }

          const formattedLocation = city || state || country || "Your location";
          setLocationName(formattedLocation);
          setDeliveryAvailable(false);

          localStorage.setItem("indiekonnect_delivery_location", JSON.stringify({
            name: formattedLocation,
            locality: location.locality || "",
            city: location.city || "",
            state: location.state || "",
            district: location.district || "",
            postcode,
            country,
            latitude,
            longitude,
            deliveryAvailable: false,
            updatedAt: new Date().toISOString(),
          }));

          dispatch(showToast({
            message: `Location set to ${formattedLocation}. Delivery eligibility is subject to confirmation.`,
            type: "success",
          }));
        } catch {
          setLocationName(null);
          setDeliveryAvailable(false);
          const message = "We found your location but could not determine the place name.";
          setLocationError(message);
          dispatch(showToast({ message, type: "error" }));
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        let message = "Unable to detect your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission was denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Your location is currently unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out. Please try again.";
            break;
          default:
            message = "Unable to detect your location. Please try again.";
        }

        setLocationError(message);
        dispatch(showToast({ message, type: "error" }));
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 },
    );
  };

  /* =========================================================
     VOICE SEARCH
  ========================================================= */

  const handleVoiceSearch = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      dispatch(showToast({
        message: "Voice search is not supported in this browser.",
        type: "error",
      }));
      return;
    }

    if (isVoiceSearching) {
      try {
        voiceRecognitionRef.current?.stop();
      } catch {
        // Ignore stop errors.
      }
      setIsVoiceSearching(false);
      return;
    }

    const recognition = new SpeechRecognition() as SpeechRecognitionLike;
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
      setTimeout(() => searchInputRef.current?.focus(), 50);
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!transcript) return;

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
          input.setSelectionRange(transcript.length, transcript.length);
        }
      }, 50);
    };

    recognition.onerror = (event) => {
      setIsVoiceSearching(false);
      if (event.error === "aborted") return;

      let message = "Unable to hear you. Please try again.";
      if (event.error === "not-allowed") message = "Please allow microphone permission for voice search.";
      else if (event.error === "no-speech") message = "No speech detected. Please try again.";
      else if (event.error === "audio-capture") message = "No microphone was found on this device.";
      else if (event.error === "network") message = "Voice search network error. Please try again.";

      dispatch(showToast({ message, type: "error" }));
    };

    recognition.onend = () => {
      setIsVoiceSearching(false);
      voiceRecognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      setIsVoiceSearching(false);
      voiceRecognitionRef.current = null;
      dispatch(showToast({
        message: "Unable to start voice search. Please try again.",
        type: "error",
      }));
    }
  };

  /* CLEANUP */
  useEffect(() => {
    return () => {
      try {
        voiceRecognitionRef.current?.stop();
      } catch {
        // Ignore cleanup errors.
      }
      voiceRecognitionRef.current = null;
      if (categoryCloseTimer.current) clearTimeout(categoryCloseTimer.current);
      if (cartCloseTimer.current) clearTimeout(cartCloseTimer.current);
      if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
      if (searchCloseTimer.current) clearTimeout(searchCloseTimer.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  /* CART REFRESH LISTENER */
  useEffect(() => {
    const handleCartRefresh = () => {
      if (hasToken === true) refetchCart();
    };
    window.addEventListener("cart:refresh", handleCartRefresh);
    return () => window.removeEventListener("cart:refresh", handleCartRefresh);
  }, [hasToken, refetchCart]);

  /* AUTH / LOGIN */
  const getLoginPath = () => currentAppType === "distributor"
    ? "/auth/distributor/login"
    : "/auth/customer/login";

  const goToLogin = () => {
    router.push(getLoginPath());
    closeHeaderOverlays();
  };

  /* NAVIGATION */
  const goToHome = () => {
    router.push("/home");
    closeHeaderOverlays();
  };

  const goToProducts = (category?: string) => {
    let url = "/products";
    if (category && category !== "all") {
      const params = new URLSearchParams();
      params.set("category", category);
      url += `?${params.toString()}`;
    }
    router.push(url);
    closeHeaderOverlays();
  };

  /**
   * Main Combo navigation:
   * Select every active category whose name contains "&" and send
   * the complete comma-separated list to the Products page.
   *
   * Example:
   * /products?category=WATCH+%26+DINNERWARE%2CJEWELERY+%26+DINNERWARE
   */
  const goToAllComboCategories = () => {
    const categoryNames = Array.from(
      new Set(
        comboCategories
          .map((category: any) =>
            String(category?.title || category?.name || "").trim(),
          )
          .filter((name: string) => name.length > 0),
      ),
    );

    if (!categoryNames.length) {
      dispatch(
        showToast({
          message: "No combo categories are available.",
          type: "error",
        }),
      );
      return;
    }

    const params = new URLSearchParams();
    params.set("category", categoryNames.join(","));

    router.push(`/products?${params.toString()}`);
    closeHeaderOverlays();
  };

  const goToSubcategory = (subcategory: any) => {
    const params = new URLSearchParams();
    params.append("subcategory_ids", String(subcategory.id));
    params.set("nav", "category");
    router.push(`/products?${params.toString()}`);
    closeHeaderOverlays();
  };

  const goToNewArrivals = () => {
    router.push("/products?new-arrivals=true");
    closeHeaderOverlays();
  };

  const goToWishlist = () => {
    if (hasToken !== true) return goToLogin();
    router.push("/wishlist");
    closeHeaderOverlays();
  };

  const goToCart = () => {
    setIsCartOpen(false);
    if (hasToken !== true) return goToLogin();
    if (isCartEmpty) {
      setIsMobileMenuOpen(false);
      setIsEmptyCartDrawerOpen(true);
      return;
    }
    router.push("/cart");
    closeHeaderOverlays();
  };

  const closeEmptyCartDrawer = () => setIsEmptyCartDrawerOpen(false);

  const handleContinueShopping = () => {
    setIsEmptyCartDrawerOpen(false);
    router.push("/products");
    closeHeaderOverlays();
  };

  const goToTrackOrder = () => {
    if (hasToken !== true) return goToLogin();
    if (currentAppType === "distributor") router.push("/distributor/order-history/");
    else router.push("/profile/?tab=orders");
    closeHeaderOverlays();
  };

  const goToProfile = () => {
    if (hasToken !== true) {
      setIsProfileOpen(false);
      return goToLogin();
    }
    if (currentAppType === "distributor") router.push("/distributor/dashboard/");
    else router.push("/profile/");
    setIsProfileOpen(false);
    closeHeaderOverlays();
  };

  const goToProductDetail = (slug: string) => {
    router.push(`/product/${slug}`);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    closeHeaderOverlays();
  };

  /* =========================================================
     NAVIGATION HANDLER
     Combo toggles its dropdown. All single categories navigate.
  ========================================================= */

  const handleNavigation = (item: any) => {
    // Clicking the main Combo item selects all combo categories.
    // Hovering the item still opens the individual-category dropdown.
    if (item.isCombo) {
      goToAllComboCategories();
      return;
    }

    if (item.isSubcategory) {
      const navSource = String(item.label || "").trim().toLowerCase();
      const params = new URLSearchParams();
      params.set("subcategory_ids", String(item.subcategoryId));
      if (navSource === "men" || navSource === "women") params.set("nav", navSource);
      router.push(`/products?${params.toString()}`);
      closeHeaderOverlays();
      return;
    }

    if (item.isCategory) {
      const category = categories.find((cat: any) => String(cat.id) === String(item.categoryId));
      goToProducts(category?.slug || category?.title || category?.name || item.label);
      return;
    }

    if (item.label === "Home") return goToHome();
    if (item.label === "Shop") return goToProducts();
    if (item.label === "New arrivals") return goToNewArrivals();

    if (item.label === "Support") {
      router.push("/contact");
      closeHeaderOverlays();
      return;
    }

    if (item.href && item.href !== "#") router.push(item.href);
    closeHeaderOverlays();
  };

  /* LOGOUT */
  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout({
        callApi: true,
        clearReduxState: true,
        clearPersistedState: true,
        redirectTo: "/",
        onSuccess: () => {
          dispatch(showToast({ message: "Successfully logged out! See you soon", type: "success" }));
          setIsLoggingOut(false);
          setShowLogoutModal(false);
          setIsProfileOpen(false);
          setIsMobileMenuOpen(false);
        },
        onError: () => {
          dispatch(showToast({ message: "Logout failed. Please try again.", type: "error" }));
          setIsLoggingOut(false);
          setShowLogoutModal(false);
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(showToast({ message: "Something went wrong. Please try again.", type: "error" }));
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
    setIsProfileOpen(false);
  };

  const closeLogoutModal = () => {
    if (!isLoggingOut) setShowLogoutModal(false);
  };

  /* CART / PROFILE DROPDOWNS */
  const openCartDropdown = () => {
    if (cartCloseTimer.current) clearTimeout(cartCloseTimer.current);
    setIsCartOpen(true);
  };

  const scheduleCloseCartDropdown = () => {
    if (cartCloseTimer.current) clearTimeout(cartCloseTimer.current);
    cartCloseTimer.current = setTimeout(() => setIsCartOpen(false), 200);
  };

  const openProfileDropdown = () => {
    if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
    setIsProfileOpen(true);
  };

  const scheduleCloseProfileDropdown = () => {
    if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
    profileCloseTimer.current = setTimeout(() => setIsProfileOpen(false), 200);
  };

  /* MOBILE MENU */
  const handleMobileMenuToggle = () => {
    setIsSearchOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsMobileMenuOpen((previous) => !previous);
    if (isMobileMenuOpen) setMobileExpandedCategoryId(null);
  };

  /* SEARCH */
  const toggleSearch = () => {
    if (isSearchExpanded) {
      if (isVoiceSearching) {
        try {
          voiceRecognitionRef.current?.stop();
        } catch {
          // Ignore stop errors.
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
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams();
    params.append("search", searchQuery.trim());
    if (searchCategory && searchCategory !== "all") params.append("category", searchCategory);

    router.push(`/products?${params.toString()}`);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    closeHeaderOverlays();
  };

  /* PROFILE MENU */
  const profileMenuItems = (() => {
    const items: any[] = [];
    if (hasToken === true) {
      items.push({
        icon: UserCircle,
        label: isDistributor ? "Dashboard" : "My Profile",
        onClick: goToProfile,
      });
      items.push({
        icon: LogOutIcon,
        label: "Logout",
        onClick: openLogoutModal,
        isDanger: true,
      });
    } else {
      items.push({
        icon: UserCircle,
        label: currentAppType === "distributor" ? "Distributor Login" : "Customer Login",
        onClick: goToLogin,
      });
    }
    return items;
  })();

  /* =========================================================
     ACTIVE NAV LOGIC
  ========================================================= */

  const activeSubcategoryIds = searchParams
    .getAll("subcategory_ids")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  const currentPath = (pathname || "/").replace(/\/+$/, "") || "/";
  const isProductsRoute = currentPath === "/products";
  const activeCategoryParam = (searchParams.get("category") || "").trim().toLowerCase();
  // The Combo link sends multiple category names in one comma-separated value.
  const activeCategoryValues = activeCategoryParam
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const activeNavSource = (searchParams.get("nav") || "").toLowerCase();

  const selectedSubcategories = (categoriesData?.subcategories || []).filter(
    (subcategory: any) => activeSubcategoryIds.includes(String(subcategory.id)),
  );

  const isParentCategoryActive = (item: any): boolean => {
    if (!item.isCategory || !isProductsRoute || activeNavSource === "women" || activeNavSource === "men") {
      return false;
    }

    const category = categories.find((entry: any) => String(entry.id) === String(item.categoryId));
    const labels = [item.label, category?.slug, category?.title, category?.name, String(item.categoryId)]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase());

    if (activeCategoryParam && labels.includes(activeCategoryParam)) return true;

    return selectedSubcategories.some((subcategory: any) =>
      String(subcategory.category_id ?? subcategory.category?.id ?? "") === String(item.categoryId)
    );
  };

  const isComboActive = (item: any): boolean => {
    if (!item.isCombo || !isProductsRoute) return false;

    return (item.comboCategories || []).some((category: any) => {
      const labels = [
        category.slug,
        category.title,
        category.name,
        String(category.id),
      ]
        .filter(Boolean)
        .map((value: any) => String(value).trim().toLowerCase());

      // Supports both a single combo category and the full comma-separated
      // category list created by clicking the main Combo navigation item.
      const categoryMatched = activeCategoryValues.some((activeValue) =>
        labels.includes(activeValue),
      );

      const subcategoryMatched = selectedSubcategories.some(
        (subcategory: any) =>
          String(
            subcategory.category_id ?? subcategory.category?.id ?? "",
          ) === String(category.id),
      );

      return categoryMatched || subcategoryMatched;
    });
  };

  const isNavItemActive = (item: any): boolean => {
    const label = String(item.label || "").trim().toLowerCase();

    if (label === "home") return currentPath === "/" || currentPath === "/home";
    if (label === "support") return currentPath === "/contact";
    if (label === "new arrivals") return isProductsRoute && searchParams.get("new-arrivals") === "true";
    if (item.isCombo) return isComboActive(item);
    if (item.isCategory) return isParentCategoryActive(item);

    if (label === "shop") {
      return isProductsRoute &&
        !activeCategoryParam &&
        !activeSubcategoryIds.length &&
        searchParams.get("new-arrivals") !== "true";
    }

    const hrefPath = String(item.href || "").split("?")[0].replace(/\/+$/, "");
    return !!hrefPath && currentPath === hrefPath;
  };

  const navClass = "premium-header-nav-button";

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

      <EmptyCartDrawer
        isOpen={isEmptyCartDrawerOpen}
        onClose={closeEmptyCartDrawer}
        onContinueShopping={handleContinueShopping}
      />

      {/* ALL CATEGORIES PORTAL */}
      {isAllDropdownOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={allDropdownRef}
          role="menu"
          aria-label="All categories"
          className="font-lato"
          style={{
            position: "fixed",
            top: allDropdownPos.top,
            left: allDropdownPos.left,
            minWidth: allDropdownPos.width,
            maxHeight: `calc(100vh - ${allDropdownPos.top + 16}px)`,
            overflowY: "auto",
            zIndex: 2147483646,
            background: "#ffffff",
            border: "1px solid #E4E4E2",
            borderRadius: 8,
            boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
            padding: "6px 0",
          }}
        >
          {categories.length === 0 && (
            <p style={{ padding: "12px 16px", fontSize: 13, color: "#777777" }}>
              No categories available
            </p>
          )}
          {categories.map((category: any) => (
            <button
              key={category.id}
              type="button"
              role="menuitem"
              onClick={() => goToProducts(category.slug || category.title || category.name)}
              className="flex w-full items-center justify-between gap-6 px-4 py-2.5 text-left text-[13px] font-medium text-[#222222] transition-colors duration-150 hover:bg-[#F4F4F3]"
            >
              {category.title || category.name}
              <ChevronRight size={15} />
            </button>
          ))}
        </div>,
        document.body,
      )}

      {/* COMBO CATEGORY DROPDOWN PORTAL */}
      {hoveredCategoryId === -1 &&
        comboCategories.length > 0 &&
        !isNavCollapsed &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="font-lato"
            onMouseEnter={() => handleCategoryPopupEnter(-1)}
            onMouseLeave={handleCategoryPopupLeave}
            style={{
              position: "fixed",
              top: comboDropdownPos.top,
              left: comboDropdownPos.left,
              minWidth: 280,
              maxWidth: "min(360px, calc(100vw - 16px))",
              paddingTop: 6,
              zIndex: 2147483647,
              overflow: "visible",
              pointerEvents: "auto",
            }}
          >
            <div
              className="premium-category-submenu premium-combo-submenu"
              role="menu"
              aria-label="Combo categories"
              style={{
                width: "100%",
                maxHeight: "min(70vh, 450px)",
                overflowX: "hidden",
                overflowY: "auto",
                padding: "6px 0",
                background: "#ffffff",
                border: "1px solid #E4E4E2",
                borderRadius: 8,
                boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
              }}
            >
              {comboCategories.map((category: any) => (
                <button
                  key={category.id}
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    goToProducts(
                      category.slug || category.title || category.name,
                    )
                  }
                  className="premium-combo-dropdown-item"
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 16px",
                    border: "none",
                    background: "transparent",
                    color: "#333333",
                    fontSize: 13,
                    fontWeight: 500,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span>{category.title || category.name}</span>
                  <ChevronRight size={15} className="flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}

      {/* SPACER */}
      <div
        style={{ height: headerHeight }}
        aria-hidden="true"
        className="premium-header-spacer"
      />

      <header
        ref={headerRef}
        className={`premium-header premium-header-fixed font-lato ${isScrolled ? "premium-header-compact" : ""} ${DIWALI_MODE ? "premium-header--festive" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2147483000,
          willChange: "transform",
        }}
      >
        {/* TOP ANNOUNCEMENT */}
        {!hideAnnouncement && (
          <div
            className={`premium-header-announcement-wrap ${isScrolled ? "is-collapsed" : ""}`}
            aria-hidden={isScrolled}
            style={{ position: "relative" }}
          >
            <div className={`premium-benefits premium-benefits-refreshed ${DIWALI_MODE ? "ik-festive-benefits" : ""}`}>
              {DIWALI_MODE && <FestiveCrackers />}

              {DIWALI_MODE ? (
                <div className="ik-festive-hero">
                  <span className="ik-festive-diya" aria-hidden="true">
                    <FestiveDiyaMark />
                  </span>
                  <div className="ik-festive-copy">
                    <strong className="ik-festive-title">Diwali Dhamaka</strong>
                    <span className="ik-festive-divider" aria-hidden="true" />
                    <span className="ik-festive-subtitle">
                      Festive finds. Sparkling celebrations. Only at IndieKonnect.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="premium-benefits-marquee" aria-label="Store benefits">
                  <div className="premium-benefits-track">
                    {[0, 1].map((copy) => (
                      <div className="premium-benefits-group" key={copy} aria-hidden={copy === 1}>
                        <span className="premium-benefit-item">
                          <Grid3x3 size={15} /> Explore premium collections
                        </span>
                        <span className="premium-benefit-item">
                          <BadgeCheck size={15} /> 100% genuine products
                        </span>
                        <span className="premium-benefit-item">
                          <Tag size={15} /> Discover new arrivals
                        </span>
                        <span className="premium-benefit-item">
                          <Headphones size={15} /> Dedicated customer support
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={locationLoading}
                className={`premium-deliver premium-deliver-refreshed ${DIWALI_MODE ? "ik-festive-deliver" : ""}`}
                title={locationError || "Detect delivery location"}
                tabIndex={isScrolled ? -1 : 0}
              >
                {locationLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                <span>
                  <small>DELIVER TO</small>
                  <b>{locationName || "Select location"}</b>
                </span>
                <ChevronDown size={13} />
              </button>
            </div>
          </div>
        )}

        {/* MAIN ROW */}
        <div className="premium-main">
          <div className="premium-shell premium-main-content">
            <Link
              href="/home"
              onClick={(event) => {
                event.preventDefault();
                goToHome();
              }}
              className="premium-brand"
              aria-label="IndieKonnect home"
            >
              <Image
                src={Logo}
                alt="IndieKonnect"
                width={88}
                height={106}
                priority
                className="premium-brand-logo"
              />
              <span className="premium-brand-divider" />
              <span style={{ fontSize: "8px" }} className="premium-brand-tagline">
                CONNECT<br />BEYOND<br />BOUNDARIES
              </span>
            </Link>

            {/* DESKTOP SEARCH */}
            <div className="premium-search-wrap" ref={searchRef} style={{ position: "relative" }}>
              <form onSubmit={handleSearch} className="premium-search-form">
                <button type="submit" aria-label="Search products">
                  <Search size={26} />
                </button>
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setIsSearchExpanded(true);
                  }}
                  placeholder="Search for products, brands, collections..."
                  aria-label="Search products"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearchQuery("");
                    }}
                    aria-label="Clear search"
                  >
                    <X size={17} />
                  </button>
                )}
                <span className="premium-search-divider" />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  disabled={!voiceSupported}
                  aria-label="Voice search"
                  className={isVoiceSearching ? "premium-mic-on" : ""}
                >
                  <Mic size={25} />
                </button>
              </form>

              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div className="premium-suggestions">
                  {isSearching && (
                    <p className="premium-suggestion-message">
                      <Loader2 size={16} className="animate-spin" /> Searching...
                    </p>
                  )}

                  {!isSearching && productSuggestions.slice(0, 5).map((product: any) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => goToProductDetail(product.slug)}
                    >
                      <img
                        src={getProductSearchImage(product)}
                        alt={product.name || "Product"}
                        loading="lazy"
                        onError={(event) => {
                          const fallback = typeof PlaceholderImage === "string"
                            ? PlaceholderImage
                            : PlaceholderImage.src;
                          if (event.currentTarget.getAttribute("src") !== fallback) {
                            event.currentTarget.src = fallback;
                          }
                        }}
                      />
                      <span>
                        <b>{product.name}</b>
                        <small>{formatProductPrice(product)}</small>
                      </span>
                      <ArrowRight size={16} />
                    </button>
                  ))}

                  {!isSearching && !hasSuggestions && (
                    <p className="premium-suggestion-message">
                      No matching products. Press Enter to search.
                    </p>
                  )}

                  <button
                    className="premium-see-all"
                    type="button"
                    onClick={() => {
                      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                      closeHeaderOverlays();
                    }}
                  >
                    View all results <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="premium-actions">
              {/* ACCOUNT */}
              <div
                className="premium-action-holder"
                onMouseEnter={openProfileDropdown}
                onMouseLeave={scheduleCloseProfileDropdown}
              >
                <button type="button" className="premium-action" onClick={goToProfile} aria-label="Account">
                  <UserCircle size={31} />
                  <span style={{ fontSize: "10px" }}>Account</span>
                </button>

                {isProfileOpen && (
                  <div className="premium-popover premium-profile-popover">
                    {hasToken && (
                      <div className="premium-profile-name">
                        Hello, {userProfile?.full_name || "User"}
                        <small>{userProfile?.email || ""}</small>
                      </div>
                    )}
                    {profileMenuItems.map((item: any, index: number) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setIsProfileOpen(false);
                        }}
                      >
                        <item.icon size={17} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TRACK ORDER */}
              <button
                type="button"
                className="premium-action premium-track-desktop"
                onClick={goToTrackOrder}
                aria-label="Track order"
              >
                <Package size={31} />
                <span style={{ fontSize: "10px" }}>Track</span>
              </button>

              {/* WISHLIST */}
              <button type="button" className="premium-action" onClick={goToWishlist} aria-label="Wishlist">
                <span className="premium-icon-wrap">
                  <Heart size={32} />
                  {wishlistCount > 0 && <i>{wishlistCount}</i>}
                </span>
                <span style={{ fontSize: "10px" }}>Wishlist</span>
              </button>

              {/* CART */}
              <div
                className="premium-action-holder"
                onMouseEnter={openCartDropdown}
                onMouseLeave={scheduleCloseCartDropdown}
              >
                <button type="button" className="premium-action" onClick={goToCart} aria-label="Cart">
                  <span className="premium-icon-wrap">
                    <ShoppingBag size={31} />
                    {cartCount > 0 && <i>{cartCount}</i>}
                  </span>
                  <span style={{ fontSize: "10px" }}>Cart</span>
                </button>

                {isCartOpen && (
                  <div className="premium-popover premium-cart-popover">
                    <b>Your Cart ({cartCount})</b>
                    {cartItems.length === 0 ? (
                      <p>Your shopping bag is empty.</p>
                    ) : (
                      <>
                        {cartItems.slice(0, 3).map((item: any, index: number) => (
                          <div className="premium-cart-item" key={item.id || index}>
                            <img
                              src={item.image_url || (typeof PlaceholderImage === "string" ? PlaceholderImage : PlaceholderImage.src)}
                              alt=""
                            />
                            <span>
                              {item.product?.name || "Product"}
                              <small>Qty: {item.quantity}</small>
                            </span>
                          </div>
                        ))}
                        <p>Subtotal: ₹{cartSubtotalFormatted}</p>
                      </>
                    )}
                    <button className="premium-cart-link" type="button" onClick={goToCart}>
                      View Cart <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* MOBILE MENU */}
              <button
                type="button"
                className="premium-mobile-menu"
                onClick={handleMobileMenuToggle}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}
        {!hideMenu && (
          <div
            className={`premium-header-nav-wrap ${isNavCollapsed ? "is-collapsed" : ""}`}
            aria-hidden={isNavCollapsed}
          >
            <nav className="premium-nav">
              <div
                className="premium-shell premium-nav-inner"
                style={{ justifyContent: "center", gap: "12px" }}
              >
                <div className="premium-nav-category" style={{ flex: "0 0 auto", margin: 0 }}>
                  <button
                    ref={allCategoriesBtnRef}
                    type="button"
                    className="premium-all-categories"
                    onClick={() => setIsAllDropdownOpen((previous) => !previous)}
                    aria-expanded={isAllDropdownOpen}
                    aria-haspopup="true"
                    tabIndex={isNavCollapsed ? -1 : 0}
                  >
                    <Menu size={22} /> ALL CATEGORIES
                  </button>
                </div>

                <span className="premium-nav-separator" style={{ flex: "0 0 1px", margin: "0 2px" }} />

                <div
                  className="premium-nav-links"
                  style={{
                    display: "flex",
                    flex: "0 1 auto",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    columnGap: "clamp(14px, 1.5vw, 24px)",
                    width: "auto",
                    minWidth: 0,
                  }}
                >
                  {desktopNavItems.map((item: any, index: number) => (
                    <div
                      ref={item.isCombo ? comboWrapRef : undefined}
                      className={`premium-nav-link-wrap ${item.isCombo ? "premium-combo-nav-item" : ""}`}
                      key={`${item.label}-${index}`}
                      onMouseEnter={() => {
                        if (item.isCombo) handleCategoryMouseEnter(-1);
                      }}
                      onMouseLeave={() => {
                        if (item.isCombo) handleCategoryMouseLeave();
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleNavigation(item)}
                        aria-current={isNavItemActive(item) ? "page" : undefined}
                        aria-haspopup={item.isCombo ? "true" : undefined}
                        aria-expanded={item.isCombo ? hoveredCategoryId === -1 : undefined}
                        tabIndex={isNavCollapsed ? -1 : 0}
                        className={`${navClass} ${isNavItemActive(item) ? "premium-nav-active" : ""}`}
                      >
                        {item.label}

                        {/* ONLY COMBO HAS A DROPDOWN ICON */}
                        {item.isCombo && (
                          <ChevronDown
                            size={15}
                            className="premium-combo-arrow"
                            style={{
                              transform: hoveredCategoryId === -1 ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          />
                        )}
                      </button>

                    </div>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}

        {/* =================================================
            MOBILE DRAWER
        ================================================= */}
        {isMobileMenuOpen && (
          <div className="premium-mobile-drawer">
            <button
              type="button"
              className="premium-mobile-location"
              onClick={handleCheckAvailability}
            >
              <MapPin size={18} />
              {locationName || "Choose delivery location"}
            </button>

            <button
              type="button"
              onClick={() => setIsAllCategoriesOpen((previous) => !previous)}
              aria-expanded={isAllCategoriesOpen}
            >
              All Categories <ChevronDown size={15} />
            </button>

            {isAllCategoriesOpen && categories.map((category: any) => (
              <button
                className="premium-mobile-sub"
                key={`all-category-${category.id}`}
                type="button"
                onClick={() => goToProducts(category.slug || category.title || category.name)}
              >
                {category.title || category.name}
              </button>
            ))}

            {mobileNavItems.map((item: any, index: number) => (
              <div key={`${item.label}-${index}`}>
                <button
                  type="button"
                  onClick={() => {
                    // On mobile there is no hover interaction, so tapping
                    // Combo follows the same all-combo navigation action.
                    // Individual categories remain available in All Categories.
                    handleNavigation(item);
                    setIsMobileMenuOpen(false);
                    setMobileExpandedCategoryId(null);
                  }}
                >
                  <span className={isNavItemActive(item) ? "premium-mobile-parent-active" : ""}>
                    {item.label}
                  </span>

                  {/* ONLY COMBO HAS MOBILE DROPDOWN ICON */}
                  {item.isCombo && (
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${mobileExpandedCategoryId === -1 ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {item.isCombo && mobileExpandedCategoryId === -1 && item.comboCategories?.map((category: any) => (
                  <button
                    key={`mobile-combo-${category.id}`}
                    type="button"
                    className="premium-mobile-sub"
                    onClick={() => {
                      goToProducts(category.slug || category.title || category.name);
                      setIsMobileMenuOpen(false);
                      setMobileExpandedCategoryId(null);
                    }}
                  >
                    {category.title || category.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

/* =========================================================
   DEFAULT EXPORT — SUSPENSE WRAPPER
========================================================= */

function HeaderSkeleton() {
  return (
    <header
      style={{
        height: INITIAL_HEADER_HEIGHT,
        background: "#fff",
        borderBottom: "1px solid #EAEAEA",
      }}
      aria-hidden="true"
    />
  );
}

export default function Header(props: {
  hideAnnouncement?: boolean;
  hideMenu?: boolean;
  showSidebarMenu?: boolean;
  onSidebarMenuClick?: () => void;
}) {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderInner
        hideAnnouncement={props.hideAnnouncement}
        hideMenu={props.hideMenu}
      />
    </Suspense>
  );
}
