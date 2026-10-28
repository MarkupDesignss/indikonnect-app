"use client";

import "./premium-header.css";

import { Suspense, useState, useEffect, useRef } from "react";
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
  UserCircle as UserCircleIcon,
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
   SPEECH / LOCATION TYPES
========================================================= */

interface SpeechRecognitionEventLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
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
   SCROLL CONFIG (hysteresis for no flicker)
========================================================= */

const SCROLL_COLLAPSE_AT = 80;
const SCROLL_EXPAND_AT = 10;

const NAV_COLLAPSE_AT = 260;
const NAV_EXPAND_AT = 140;

/* Initial header height — must match HeaderSkeleton */
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
            onClick={(e) => e.stopPropagation()}
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

  /* APP / AUTH */
  const { hasToken, appType } = useTokenCheck();

  const currentAppType = (() => {
    if (typeof window === "undefined") return appType;
    const websitePath = window.location.pathname.toLowerCase();
    if (websitePath.startsWith("/indiekonnect-distributor"))
      return "distributor";
    if (websitePath.startsWith("/indiekonnect-web")) return "customer";
    return getAppType();
  })();

  const isDistributor = currentAppType === "distributor";

  /* STATES */
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  /* Desktop "ALL CATEGORIES" dropdown (portal based, always on top) */
  const [isAllDropdownOpen, setIsAllDropdownOpen] = useState(false);
  const [allDropdownPos, setAllDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 260 });
  const [mobileExpandedCategoryId, setMobileExpandedCategoryId] = useState<
    number | null
  >(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
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
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(
    null,
  );

  /* SCROLL STATE */
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(INITIAL_HEADER_HEIGHT);

  /* LOCATION STATES */
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
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

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
  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery(
      {
        search:
          debouncedSearchQuery.length >= 1 ? debouncedSearchQuery : undefined,
        limit: 5,
      },
      { skip: debouncedSearchQuery.length < 1 },
    );

  /* SMOOTH SCROLL LISTENER (rAF + hysteresis) */
  useEffect(() => {
    if (typeof window === "undefined") return;

    lastScrollY.current = window.scrollY || 0;

    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled((prev) =>
        prev ? y > SCROLL_EXPAND_AT : y > SCROLL_COLLAPSE_AT,
      );

      setIsNavCollapsed((prev) =>
        prev ? y > NAV_EXPAND_AT : y > NAV_COLLAPSE_AT,
      );
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

  /* Measure header height → page ko spacer dena taaki content shift na ho */
  useEffect(() => {
    if (typeof window === "undefined" || !headerRef.current) return;
    const el = headerRef.current;

    const setMeasuredHeight = () => {
      const h = el.getBoundingClientRect().height;
      // Ignore transient 0 values (e.g. before CSS loads)
      if (h > 0) setHeaderHeight(h);
    };

    const ro = new ResizeObserver(() => {
      setMeasuredHeight();
    });
    ro.observe(el);
    setMeasuredHeight();
    return () => ro.disconnect();
  }, []);

  /* Collapse hote hi khule hue dropdowns band */
  useEffect(() => {
    if (isScrolled) {
      setIsAllCategoriesOpen(false);
      setHoveredCategoryId(null);
    }
  }, [isScrolled]);

  /* Nav collapse hone par desktop All Categories dropdown band */
  useEffect(() => {
    if (isNavCollapsed) setIsAllDropdownOpen(false);
  }, [isNavCollapsed]);

  /* ALL CATEGORIES DROPDOWN: position, outside click, escape, resize */
  useEffect(() => {
    if (!isAllDropdownOpen) return;

    const updatePosition = () => {
      const btn = allCategoriesBtnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setAllDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 260),
      });
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

  /* RESTORE SAVED LOCATION */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedLocation = localStorage.getItem(
        "indiekonnect_delivery_location",
      );
      if (!savedLocation) return;
      const parsed = JSON.parse(savedLocation);
      const savedLatitude = Number(parsed?.latitude);
      const savedLongitude = Number(parsed?.longitude);
      if (
        parsed?.name &&
        Number.isFinite(savedLatitude) &&
        Number.isFinite(savedLongitude)
      ) {
        if (
          String(parsed?.state || "")
            .trim()
            .toLowerCase() === "telangana"
        ) {
          setLocationName(null);
          setDeliveryAvailable(false);
          localStorage.removeItem("indiekonnect_delivery_location");
          return;
        }
        setLocationName(parsed.locality || parsed.name);
        setLocationCoordinates({
          latitude: savedLatitude,
          longitude: savedLongitude,
        });
        setDeliveryAvailable(parsed.deliveryAvailable !== false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* VOICE SUPPORT */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  /* SEARCH DEBOUNCE */
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
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

  const getProductSearchImage = (product: any): string => {
    const fallback =
      typeof PlaceholderImage === "string"
        ? PlaceholderImage
        : PlaceholderImage.src;
    const images = Array.isArray(product?.images) ? product.images : [];
    const primaryImage =
      images.find(
        (image: any) =>
          image?.is_primary === true ||
          image?.is_primary === 1 ||
          image?.is_primary === "1",
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
    return (
      candidates.find(
        (v): v is string => typeof v === "string" && v.trim().length > 0,
      ) || fallback
    );
  };

  const isValidPrice = (value: any) =>
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0;

  const formatProductPrice = (product: any) => {
    const fmt = (v: any) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(v));

    if (isDistributor) {
      if (isValidPrice(product?.distributor_price))
        return (
          product?.distributor_price_formatted || fmt(product.distributor_price)
        );
      if (isValidPrice(product?.retail_price))
        return product?.retail_price_formatted || fmt(product.retail_price);
      return "₹0";
    }
    if (isValidPrice(product?.retail_price))
      return product?.retail_price_formatted || fmt(product.retail_price);
    return "₹0";
  };

  const hasSuggestions = productSuggestions.length > 0;
  const isSearching = isProductsLoading && debouncedSearchQuery.length >= 1;
  const userProfile = userProfileData?.user;

  const categories = (categoriesData?.data || []).filter(
    (c: any) => c.status === "active",
  );
  const headerMenus = headerData?.data?.menus || [];
  const topFiveCategories = categories.slice(0, 5);
  const allSubcategories = (categoriesData?.subcategories || []).filter(
    (s: any) => s.status === true,
  );

  const getCategorySubcategories = (categoryId: number) => {
    if (!categoryId) return [];
    const category = categories.find(
      (i: any) => Number(i.id) === Number(categoryId),
    );
    const name = String(category?.title || category?.name || "")
      .trim()
      .toLowerCase();
    const isAllWatch = name === "all watch" || name === "all watches";
    return allSubcategories.filter((s: any) => {
      if (Number(s?.category_id) !== Number(categoryId)) return false;
      if (isAllWatch) {
        const n = String(s?.title || s?.name || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");
        if (["for him", "for her"].includes(n)) return false;
      }
      return true;
    });
  };

  const getSubcategoryType = (s: any) => {
    const n = String(s?.name || "")
      .trim()
      .toLowerCase();
    if (
      n.includes("for her") ||
      n === "woman" ||
      n === "women" ||
      n.includes("women") ||
      n.includes("girl")
    )
      return "women";
    if (
      n.includes("for him") ||
      n === "man" ||
      n === "men" ||
      n.includes("men") ||
      n.includes("boy")
    )
      return "men";
    return null;
  };

  const menSubcategory =
    allSubcategories.find((s: any) => {
      const t = getSubcategoryType(s);
      return (
        t === "men" &&
        String(s.name || "")
          .toLowerCase()
          .includes("for him")
      );
    }) || allSubcategories.find((s: any) => getSubcategoryType(s) === "men");

  const womenSubcategory =
    allSubcategories.find((s: any) => {
      const t = getSubcategoryType(s);
      return (
        t === "women" &&
        String(s.name || "")
          .toLowerCase()
          .includes("for her")
      );
    }) || allSubcategories.find((s: any) => getSubcategoryType(s) === "women");

  const directCategoryMenus = topFiveCategories.map((c: any) => ({
    label: c.title,
    href: `/products?category=${encodeURIComponent(c.slug || c.title)}`,
    icon: Grid3x3,
    isCategory: true,
    categoryId: c.id,
    subcategories: getCategorySubcategories(c.id),
  }));

  const directSubcategoryMenus: any[] = [];
  if (menSubcategory)
    directSubcategoryMenus.push({
      label: "Men",
      href: `/products?subcategory_ids=${menSubcategory.id}&nav=men`,
      icon: UserCircleIcon,
      isSubcategory: true,
      subcategoryId: menSubcategory.id,
    });
  if (womenSubcategory)
    directSubcategoryMenus.push({
      label: "Women",
      href: `/products?subcategory_ids=${womenSubcategory.id}&nav=women`,
      icon: UserCircleIcon,
      isSubcategory: true,
      subcategoryId: womenSubcategory.id,
    });

  /* CATEGORY HOVER */
  const handleCategoryMouseEnter = (id: number) => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
      categoryCloseTimer.current = null;
    }
    setHoveredCategoryId(id);
  };
  const handleCategoryMouseLeave = () => {
    if (categoryCloseTimer.current) clearTimeout(categoryCloseTimer.current);
    categoryCloseTimer.current = setTimeout(
      () => setHoveredCategoryId(null),
      150,
    );
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
    categoryCloseTimer.current = setTimeout(
      () => setHoveredCategoryId(null),
      150,
    );
  };

  /* ROLE BASED MENUS */
  const getRoleBasedMenus = () => {
    const menus: any[] = [];
    if (
      headerMenus.some(
        (m: any) =>
          m.status === true && (m.slug === "home" || m.title === "Home"),
      )
    )
      menus.push({ label: "Home", href: "/home", icon: Home });
    if (
      headerMenus.some(
        (m: any) =>
          m.status === true && (m.slug === "shop" || m.title === "Shop"),
      )
    )
      menus.push({ label: "Shop", href: "/products", icon: Grid3x3 });

    const menMenu = directSubcategoryMenus.find((i: any) => i.label === "Men");
    if (menMenu) menus.push(menMenu);
    const womenMenu = directSubcategoryMenus.find(
      (i: any) => i.label === "Women",
    );
    if (womenMenu) menus.push(womenMenu);

    if (
      headerMenus.some(
        (m: any) =>
          m.status === true &&
          (m.slug === "new-arrivals" || m.title === "New arrivals"),
      )
    )
      menus.push({
        label: "New arrivals",
        href: "/products?new-arrivals=true",
        icon: Tag,
      });

    menus.push(...directCategoryMenus.slice(0, 5));
    menus.push({
      label: "Support",
      href: "/contact",
      icon: LifeBuoy,
      isSupport: true,
    });
    return menus;
  };

  const desktopNavItems = getRoleBasedMenus();
  const mobileNavItems = getRoleBasedMenus();

  /* CLOSE OVERLAYS */
  const closeHeaderOverlays = () => {
    setIsMobileMenuOpen(false);
    setIsAllCategoriesOpen(false);
    setIsAllDropdownOpen(false);
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

  /* OUTSIDE CLICK */
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* MOBILE DRAWER */
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

  /* LOCATION FETCHERS */
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
        json?.locality ||
        json?.city ||
        json?.principalArea ||
        administrative.find(
          (item: any) =>
            item?.name &&
            (item?.description?.toLowerCase()?.includes("city") ||
              item?.description?.toLowerCase()?.includes("town")),
        )?.name ||
        null;
      const state =
        json?.principalSubdivision ||
        json?.principalSubdivisionCode?.replace(/^IN-/i, "")?.trim() ||
        administrative.find(
          (item: any) =>
            item?.name &&
            (item?.description?.toLowerCase()?.includes("state") ||
              item?.description?.toLowerCase()?.includes("province")),
        )?.name ||
        null;
      const district =
        json?.county ||
        json?.district ||
        administrative.find(
          (item: any) =>
            item?.name &&
            (item?.description?.toLowerCase()?.includes("district") ||
              item?.description?.toLowerCase()?.includes("county")),
        )?.name ||
        null;
      const postcode =
        json?.postcode || json?.postCode || json?.postalCode || null;
      const country = json?.countryName || json?.countryCode || null;
      const result: LocationInfo = {
        locality: json?.locality || null,
        state,
        city,
        district,
        postcode,
        country,
      };
      if (!result.city && !result.state && !result.district && !result.country)
        return null;
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
        "&format=jsonv2" +
        "&accept-language=en" +
        "&zoom=14" +
        "&addressdetails=1";
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
          address?.suburb ||
          address?.neighbourhood ||
          address?.quarter ||
          address?.city_district ||
          address?.town ||
          address?.city ||
          null,
        state: address?.state || address?.state_district || null,
        city:
          address?.city ||
          address?.town ||
          address?.village ||
          address?.municipality ||
          address?.suburb ||
          address?.county ||
          null,
        district: address?.state_district || address?.county || null,
        postcode: address?.postcode || null,
        country: address?.country || null,
      };
      if (!result.city && !result.state && !result.district && !result.country)
        return null;
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
      (bigDataCloudResult.city ||
        bigDataCloudResult.state ||
        bigDataCloudResult.district)
    )
      return bigDataCloudResult;
    return fetchFromNominatim(latitude, longitude);
  };

  /* LOCATION / DELIVERY */
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
          const city =
            location.locality || location.city || location.district || "";
          const state = location.state || "";
          const district = location.district || "";
          const postcode = location.postcode || "";
          const country = location.country || "";
          if (state.trim().toLowerCase() === "telangana") {
            setLocationName(null);
            setDeliveryAvailable(false);
            localStorage.removeItem("indiekonnect_delivery_location");
            setLocationError("Delivery is currently unavailable in Telangana.");
            dispatch(
              showToast({
                message: "Sorry, delivery is not available in Telangana.",
                type: "error",
              }),
            );
            return;
          }
          const formattedLocation = city || state || country || "Your location";
          setLocationName(formattedLocation);
          setDeliveryAvailable(false);
          localStorage.setItem(
            "indiekonnect_delivery_location",
            JSON.stringify({
              name: formattedLocation,
              locality: location.locality || "",
              city: location.city || "",
              state: location.state || "",
              district: location.district || "",
              postcode: postcode || "",
              country: country || "",
              latitude,
              longitude,
              deliveryAvailable: false,
              updatedAt: new Date().toISOString(),
            }),
          );
          dispatch(
            showToast({
              message: `Location set to ${formattedLocation}. Delivery eligibility is subject to confirmation.`,
              type: "success",
            }),
          );
        } catch {
          setLocationName(null);
          setDeliveryAvailable(false);
          const message =
            "We found your location but could not determine the place name.";
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
            message =
              "Location permission was denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message =
              "Your location is currently unavailable. Please try again.";
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

  /* VOICE SEARCH */
  const handleVoiceSearch = () => {
    if (typeof window === "undefined") return;
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
      } catch {
        /* ignore */
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
            input.setSelectionRange(transcript.length, transcript.length);
          }
        }, 50);
      }
    };
    recognition.onerror = (event) => {
      setIsVoiceSearching(false);
      if (event.error === "aborted") return;
      let message = "Unable to hear you. Please try again.";
      if (event.error === "not-allowed")
        message = "Please allow microphone permission for voice search.";
      else if (event.error === "no-speech")
        message = "No speech detected. Please try again.";
      else if (event.error === "audio-capture")
        message = "No microphone was found on this device.";
      else if (event.error === "network")
        message = "Voice search network error. Please try again.";
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
      dispatch(
        showToast({
          message: "Unable to start voice search. Please try again.",
          type: "error",
        }),
      );
    }
  };

  /* CLEANUP */
  useEffect(() => {
    return () => {
      try {
        voiceRecognitionRef.current?.stop();
      } catch {
        /* ignore */
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
      if (hasToken === true) {
        refetchCart();
      }
    };
    window.addEventListener("cart:refresh", handleCartRefresh);
    return () => {
      window.removeEventListener("cart:refresh", handleCartRefresh);
    };
  }, [hasToken, refetchCart]);

  /* AUTH / LOGIN */
  const getLoginPath = () =>
    currentAppType === "distributor"
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
      params.append("category", category);
      url += `?${params.toString()}`;
    }
    router.push(url);
    closeHeaderOverlays();
  };
  const goToSubcategory = (sub: any) => {
    const params = new URLSearchParams();
    params.append("subcategory_ids", String(sub.id));
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
    router.push("/checkout");
    closeHeaderOverlays();
  };
  const goToTrackOrder = () => {
    if (hasToken !== true) return goToLogin();
    if (currentAppType === "distributor")
      router.push("/distributor/order-history/");
    else router.push("/profile/?tab=orders");
    closeHeaderOverlays();
  };
  const goToProfile = () => {
    if (hasToken !== true) {
      setIsProfileOpen(false);
      return goToLogin();
    }
    if (currentAppType === "distributor")
      router.push("/distributor/dashboard/");
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

  const handleNavigation = (item: any) => {
    if (item.isSubcategory) {
      const navSource = String(item.label || "")
        .trim()
        .toLowerCase();
      const params = new URLSearchParams();
      params.set("subcategory_ids", String(item.subcategoryId));
      if (navSource === "men" || navSource === "women")
        params.set("nav", navSource);
      router.push(`/products?${params.toString()}`);
      closeHeaderOverlays();
      return;
    }
    if (item.isCategory) {
      const category = categories.find(
        (cat: any) => cat.id === item.categoryId,
      );
      return goToProducts(category?.slug || item.label);
    }
    if (item.label === "Home") return goToHome();
    if (item.label === "Shop") return goToProducts();
    if (item.label === "New arrivals") return goToNewArrivals();
    if (item.label === "Support") {
      router.push("/contact");
      closeHeaderOverlays();
      return;
    }
    router.push(item.href);
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
          dispatch(
            showToast({
              message: "Successfully logged out! See you soon",
              type: "success",
            }),
          );
          setIsLoggingOut(false);
          setShowLogoutModal(false);
          setIsProfileOpen(false);
          setIsMobileMenuOpen(false);
        },
        onError: () => {
          dispatch(
            showToast({
              message: "Logout failed. Please try again.",
              type: "error",
            }),
          );
          setIsLoggingOut(false);
          setShowLogoutModal(false);
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(
        showToast({
          message: "Something went wrong. Please try again.",
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
    setIsMobileMenuOpen((prev) => !prev);
    if (isMobileMenuOpen) setMobileExpandedCategoryId(null);
  };

  /* SEARCH */
  const toggleSearch = () => {
    if (isSearchExpanded) {
      if (isVoiceSearching) {
        try {
          voiceRecognitionRef.current?.stop();
        } catch {
          /* ignore */
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    params.append("search", searchQuery.trim());
    if (searchCategory && searchCategory !== "all")
      params.append("category", searchCategory);
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
        label:
          currentAppType === "distributor"
            ? "Distributor Login"
            : "Customer Login",
        onClick: goToLogin,
      });
    }
    return items;
  })();

  const navClass = "premium-header-nav-button";

  /* ACTIVE NAV LOGIC */
  const activeSubcategoryIds = searchParams
    .getAll("subcategory_ids")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const currentPath = (pathname || "/").replace(/\/+$/, "") || "/";
  const isProductsRoute = currentPath === "/products";
  const activeCategoryParam = (searchParams.get("category") || "")
    .trim()
    .toLowerCase();
  const selectedSubcategories = allSubcategories.filter((sub: any) =>
    activeSubcategoryIds.includes(String(sub.id)),
  );
  const activeNavSource = (searchParams.get("nav") || "").toLowerCase();
  const isSubmenuActive = (sub: any): boolean =>
    isProductsRoute &&
    activeNavSource !== "women" &&
    activeNavSource !== "men" &&
    activeSubcategoryIds.includes(String(sub.id));
  const isParentCategoryActive = (item: any): boolean => {
    if (
      !item.isCategory ||
      !isProductsRoute ||
      activeNavSource === "women" ||
      activeNavSource === "men"
    )
      return false;
    const matchingCategory = categories.find(
      (category: any) => String(category.id) === String(item.categoryId),
    );
    const categoryLabels = [
      item.label,
      matchingCategory?.slug,
      matchingCategory?.title,
      matchingCategory?.name,
      String(item.categoryId),
    ]
      .filter(Boolean)
      .map((v) => String(v).trim().toLowerCase());
    if (activeCategoryParam && categoryLabels.includes(activeCategoryParam))
      return true;
    return (
      selectedSubcategories.some(
        (sub: any) =>
          String(sub.category_id ?? sub.category?.id ?? "") ===
          String(item.categoryId),
      ) || (item.subcategories || []).some((sub: any) => isSubmenuActive(sub))
    );
  };
  const isNavItemActive = (item: any): boolean => {
    const label = String(item.label || "")
      .trim()
      .toLowerCase();
    if (label === "home") return currentPath === "/" || currentPath === "/home";
    if (label === "support") return currentPath === "/contact";
    if (label === "new arrivals")
      return isProductsRoute && searchParams.get("new-arrivals") === "true";
    if (item.isSubcategory)
      return (
        isProductsRoute &&
        activeNavSource === label &&
        activeSubcategoryIds.includes(String(item.subcategoryId))
      );
    if (item.isCategory) return isParentCategoryActive(item);
    if (label === "shop")
      return (
        isProductsRoute &&
        !activeCategoryParam &&
        !activeSubcategoryIds.length &&
        searchParams.get("new-arrivals") !== "true"
      );
    const hrefPath = String(item.href || "")
      .split("?")[0]
      .replace(/\/+$/, "");
    return !!hrefPath && currentPath === hrefPath;
  };

  return (
    <>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />

      {/* ALL CATEGORIES DROPDOWN — portal to <body>, so it is never clipped
          by header overflow and always renders above every other element */}
      {isAllDropdownOpen &&
        typeof document !== "undefined" &&
        createPortal(
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
              zIndex: 2147483000,
              background: "#ffffff",
              border: "1px solid #E4E4E2",
              borderRadius: 8,
              boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
              padding: "6px 0",
            }}
          >
            {categories.length === 0 && (
              <p
                style={{
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "#777777",
                }}
              >
                No categories available
              </p>
            )}
            {categories.map((category: any) => (
              <button
                key={category.id}
                type="button"
                role="menuitem"
                onClick={() =>
                  goToProducts(category.slug || category.title || category.name)
                }
                className="flex w-full items-center justify-between gap-6 px-4 py-2.5 text-left text-[13px] font-medium text-[#222222] transition-colors duration-150 hover:bg-[#F4F4F3]"
              >
                {category.title || category.name}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>,
          document.body,
        )}

      {/* Spacer to prevent layout shift — ALWAYS renders with a valid height
          (initial height matches HeaderSkeleton / default header size) */}
      <div
        style={{ height: headerHeight }}
        aria-hidden="true"
        className="premium-header-spacer"
      />

      <header
        ref={headerRef}
        className={`premium-header premium-header-fixed font-lato ${
          isScrolled ? "premium-header-compact" : ""
        }`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          willChange: "transform",
        }}
      >
        {/* ── TOP ANNOUNCEMENT STRIP (scroll par hide) ── */}
        {!hideAnnouncement && (
          <div
            className={`premium-header-announcement-wrap ${isScrolled ? "is-collapsed" : ""}`}
            aria-hidden={isScrolled}
          >
            <div className="premium-benefits premium-benefits-refreshed">
              <div
                className="premium-benefits-marquee"
                aria-label="Store benefits"
              >
                <div className="premium-benefits-track">
                  {[0, 1].map((copy) => (
                    <div
                      className="premium-benefits-group"
                      key={copy}
                      aria-hidden={copy === 1}
                    >
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
              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={locationLoading}
                className="premium-deliver premium-deliver-refreshed"
                title={locationError || "Detect delivery location"}
                tabIndex={isScrolled ? -1 : 0}
              >
                {locationLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <MapPin size={16} />
                )}
                <span>
                  <small>DELIVER TO</small>
                  <b>{locationName || "Select location"}</b>
                </span>
                <ChevronDown size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ── MAIN ROW (hamesha visible) ── */}
        <div className="premium-main">
          <div className="premium-shell premium-main-content">
            {/* LEFT: Brand Logo */}
            <Link
              href="/home"
              onClick={(e) => {
                e.preventDefault();
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
              <span
                style={{ fontSize: "8px" } }
                className="premium-brand-tagline"
              >
                CONNECT
                <br />
                BEYOND
                <br />
                BOUNDARIES
              </span>
            </Link>

            {/* DESKTOP SEARCH (mobile par hidden) */}
            <div className="premium-search-wrap" ref={searchRef}>
              <form onSubmit={handleSearch} className="premium-search-form">
                <button type="submit" aria-label="Search products">
                  <Search size={26} />
                </button>
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Searching...
                    </p>
                  )}
                  {!isSearching &&
                    (Array.isArray(productSuggestions)
                      ? productSuggestions
                      : []
                    )
                      .slice(0, 5)
                      .map((product: any) => (
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
                              const fallback =
                                typeof PlaceholderImage === "string"
                                  ? PlaceholderImage
                                  : PlaceholderImage.src;
                              if (
                                event.currentTarget.getAttribute("src") !==
                                fallback
                              ) {
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
                    type="submit"
                    onClick={() => {
                      router.push(
                        `/products?search=${encodeURIComponent(
                          searchQuery.trim(),
                        )}`,
                      );
                      closeHeaderOverlays();
                    }}
                  >
                    View all results <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Actions & Mobile Menu */}
            <div className="premium-actions">
              {/* ACCOUNT / PROFILE */}
              <div
                className="premium-action-holder"
                onMouseEnter={openProfileDropdown}
                onMouseLeave={scheduleCloseProfileDropdown}
              >
                <button
                  type="button"
                  className="premium-action"
                  onClick={goToProfile}
                  aria-label="Account"
                >
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

              {/* TRACK ORDER (Mobile par hide) */}
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
              <button
                type="button"
                className="premium-action"
                onClick={goToWishlist}
                aria-label="Wishlist"
              >
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
                <button
                  type="button"
                  className="premium-action"
                  onClick={goToCart}
                  aria-label="Cart"
                >
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
                        {cartItems
                          .slice(0, 3)
                          .map((item: any, index: number) => (
                            <div
                              className="premium-cart-item"
                              key={item.id || index}
                            >
                              <img
                                src={
                                  item.image_url ||
                                  (typeof PlaceholderImage === "string"
                                    ? PlaceholderImage
                                    : PlaceholderImage.src)
                                }
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
                    <button
                      className="premium-cart-link"
                      type="button"
                      onClick={goToCart}
                    >
                      View Cart <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* MOBILE MENU TOGGLE (SABSE LAST RIGHT ME) */}
              <button
                type="button"
                className="premium-mobile-menu"
                onClick={handleMobileMenuToggle}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* ── NAV BAR (scroll par hide) ── */}
        {!hideMenu && (
          <div
            className={`premium-header-nav-wrap ${isNavCollapsed ? "is-collapsed" : ""}`}
            aria-hidden={isNavCollapsed}
          >
            <nav className="premium-nav">
              <div className="premium-shell premium-nav-inner">
                <div className="premium-nav-category">
                  <button
                    ref={allCategoriesBtnRef}
                    type="button"
                    className="premium-all-categories"
                    onClick={() => setIsAllDropdownOpen((prev) => !prev)}
                    aria-expanded={isAllDropdownOpen}
                    aria-haspopup="true"
                    tabIndex={isNavCollapsed ? -1 : 0}
                  >
                    <Menu size={22} /> ALL CATEGORIES
                  </button>
                </div>
                <span className="premium-nav-separator" />
                <div className="premium-nav-links">
                  {desktopNavItems.map((item: any, index: number) => (
                    <div
                      className="premium-nav-link-wrap"
                      key={`${item.label}-${index}`}
                      onMouseEnter={() =>
                        item.isCategory &&
                        handleCategoryMouseEnter(item.categoryId)
                      }
                      onMouseLeave={handleCategoryMouseLeave}
                    >
                      <button
                        type="button"
                        onClick={() => handleNavigation(item)}
                        aria-current={isNavItemActive(item) ? "page" : undefined}
                        tabIndex={isNavCollapsed ? -1 : 0}
                        className={`${navClass} ${
                          isNavItemActive(item) ? "premium-nav-active" : ""
                        }`}
                      >
                        {item.label}
                      </button>
                      {item.isCategory &&
                        hoveredCategoryId === item.categoryId &&
                        item.subcategories?.length > 0 && (
                          <div
                            className="premium-category-submenu"
                            onMouseEnter={() =>
                              handleCategoryPopupEnter(item.categoryId)
                            }
                            onMouseLeave={handleCategoryPopupLeave}
                          >
                            {item.subcategories.map((sub: any) => (
                              <button
                                type="button"
                                key={sub.id}
                                className={
                                  isSubmenuActive(sub)
                                    ? "premium-submenu-active"
                                    : ""
                                }
                                aria-current={
                                  isSubmenuActive(sub) ? "page" : undefined
                                }
                                onClick={() => goToSubcategory(sub)}
                              >
                                {sub.title || sub.name}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}

        {/* ── MOBILE DRAWER ── */}
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
              onClick={() => setIsAllCategoriesOpen((prev) => !prev)}
              aria-expanded={isAllCategoriesOpen}
            >
              All Categories <ChevronDown size={15} />
            </button>
            {isAllCategoriesOpen &&
              categories.map((category: any) => (
                <button
                  className="premium-mobile-sub"
                  key={`all-category-${category.id}`}
                  type="button"
                  onClick={() =>
                    goToProducts(category.slug || category.title || category.name)
                  }
                >
                  {category.title || category.name}
                </button>
              ))}
            {mobileNavItems.map((item: any, index: number) => (
              <div key={`${item.label}-${index}`}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.isCategory && item.subcategories?.length) {
                      setMobileExpandedCategoryId(
                        mobileExpandedCategoryId === item.categoryId
                          ? null
                          : item.categoryId,
                      );
                    } else {
                      handleNavigation(item);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                >
                  <span
                    className={
                      isNavItemActive(item)
                        ? "premium-mobile-parent-active"
                        : ""
                    }
                  >
                    {item.label}
                  </span>
                  {item.isCategory && item.subcategories?.length > 0 && (
                    <ChevronDown size={15} />
                  )}
                </button>
                {item.isCategory &&
                  (mobileExpandedCategoryId === item.categoryId ||
                    isParentCategoryActive(item)) &&
                  item.subcategories?.map((sub: any) => (
                    <button
                      className={`premium-mobile-sub ${
                        isSubmenuActive(sub) ? "premium-submenu-active" : ""
                      }`}
                      aria-current={isSubmenuActive(sub) ? "page" : undefined}
                      key={sub.id}
                      onClick={() => {
                        goToSubcategory(sub);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {sub.title || sub.name}
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
   DEFAULT EXPORT — Suspense wrapper
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