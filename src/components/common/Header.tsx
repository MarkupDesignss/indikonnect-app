"use client";

import "./premium-header.css";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { IoLocationSharp } from "react-icons/io5";

import { useTokenCheck } from "@/hooks/useTokenCheck";

import {
  getAppType,
  getAppHomeUrl,
  getCustomerDomain,
  getDistributorDomain,
} from "@/lib/appConfig";

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
  UserCircle as UserCircleIcon,
  CheckCircle,
  MapPin,
  LifeBuoy,
  ChevronRight,
  Mic,
  Truck,
  BadgeCheck,
  RotateCcw,
  Headphones,
  ChevronDown,
  Settings,
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
   LOCATION TYPES
========================================================= */

interface LocationInfo {
  state: string | null;
  city: string | null;
  district: string | null;
  postcode: string | null;
  country: string | null;
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
                  Are you sure you want to logout? You'll need to login again to
                  access your account.
                </p>
              </div>

              <div className="mx-6 flex items-start gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#777777]" />

                <p className="text-[12px] leading-relaxed text-[#666666]">
                  Your session will be ended and you'll be redirected to the
                  current application home page.
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
     APP / AUTH
  ========================================================= */

  const { hasToken, appType } = useTokenCheck();

  const currentAppType = typeof window !== "undefined" ? getAppType() : appType;

  const isDistributor = currentAppType === "distributor";

  /* =========================================================
     STATES
  ========================================================= */

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);

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

  /* CATEGORY HOVER */

  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(
    null,
  );

  /* =========================================================
     LOCATION STATES
  ========================================================= */

  const [locationLoading, setLocationLoading] = useState(false);

  const [locationName, setLocationName] = useState<string | null>(null);

  const [locationError, setLocationError] = useState<string | null>(null);

  const [deliveryAvailable, setDeliveryAvailable] = useState(false);

  const [locationCoordinates, setLocationCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  /* =========================================================
     REFS
  ========================================================= */

  const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categoryCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const voiceRecognitionRef = useRef<SpeechRecognitionLike | null>(null);

  /* =========================================================
     API
  ========================================================= */

  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery(
    undefined,
    {
      skip: hasToken !== true,
    },
  );

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
      {
        skip: debouncedSearchQuery.length < 1,
      },
    );

  /* =========================================================
     RESTORE SAVED LOCATION
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedLocation = localStorage.getItem(
        "indiekonnect_delivery_location",
      );

      if (!savedLocation) {
        return;
      }

      const parsed = JSON.parse(savedLocation);

      const savedLatitude = Number(parsed?.latitude);

      const savedLongitude = Number(parsed?.longitude);

      if (
        parsed?.name &&
        Number.isFinite(savedLatitude) &&
        Number.isFinite(savedLongitude)
      ) {
        setLocationName(parsed.name);

        setLocationCoordinates({
          latitude: savedLatitude,
          longitude: savedLongitude,
        });

        setDeliveryAvailable(parsed.deliveryAvailable !== false);
      }
    } catch {
      // Ignore malformed location.
    }
  }, []);

  /* =========================================================
     VOICE SUPPORT
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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
    if (isDistributor) {
      if (isValidPrice(product?.distributor_price)) {
        return (
          product?.distributor_price_formatted ||
          new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(Number(product.distributor_price))
        );
      }

      if (isValidPrice(product?.retail_price)) {
        return (
          product?.retail_price_formatted ||
          new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(Number(product.retail_price))
        );
      }

      return "₹0";
    }

    if (isValidPrice(product?.retail_price)) {
      return (
        product?.retail_price_formatted ||
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(Number(product.retail_price))
      );
    }

    return "₹0";
  };

  const hasSuggestions = productSuggestions.length > 0;

  const isSearching = isProductsLoading && debouncedSearchQuery.length >= 1;

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

  const topFiveCategories = categories.slice(0, 5);

  const allSubcategories = (categoriesData?.subcategories || []).filter(
    (subcategory: any) => subcategory.status === true,
  );

  /* =========================================================
     GET CATEGORY SUBCATEGORIES
  ========================================================= */

  const getCategorySubcategories = (categoryId: number) => {
    if (!categoryId) {
      return [];
    }

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

      icon: UserCircleIcon,

      isSubcategory: true,

      subcategoryId: menSubcategory.id,
    });
  }

  if (womenSubcategory) {
    directSubcategoryMenus.push({
      label: "Women",

      href: `/products?subcategory_ids=${womenSubcategory.id}`,

      icon: UserCircleIcon,

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

    const homeExists = headerMenus.some(
      (menu: any) =>
        menu.status === true && (menu.slug === "home" || menu.title === "Home"),
    );

    if (homeExists) {
      menus.push({
        label: "Home",
        href: "/home",
        icon: Home,
        isCategory: false,
      });
    }

    const shopExists = headerMenus.some(
      (menu: any) =>
        menu.status === true && (menu.slug === "shop" || menu.title === "Shop"),
    );

    if (shopExists) {
      menus.push({
        label: "Shop",
        href: "/products",
        icon: Grid3x3,
        isCategory: false,
      });
    }

    const menMenu = directSubcategoryMenus.find(
      (item: any) => item.label === "Men",
    );

    if (menMenu) {
      menus.push(menMenu);
    }

    const womenMenu = directSubcategoryMenus.find(
      (item: any) => item.label === "Women",
    );

    if (womenMenu) {
      menus.push(womenMenu);
    }

    const newArrivalsExists = headerMenus.some(
      (menu: any) =>
        menu.status === true &&
        (menu.slug === "new-arrivals" || menu.title === "New arrivals"),
    );

    if (newArrivalsExists) {
      menus.push({
        label: "New arrivals",
        href: "/products?new-arrivals=true",
        icon: Tag,
        isCategory: false,
      });
    }

    menus.push(...directCategoryMenus.slice(0, 5));

    menus.push({
      label: "Support",
      href: "/contact",
      icon: LifeBuoy,
      isCategory: false,
      isSupport: true,
    });

    return menus;
  };

  const desktopNavItems = getRoleBasedMenus();

  const mobileNavItems = getRoleBasedMenus();

  /* =========================================================
     CLOSE OVERLAYS
  ========================================================= */

  const closeHeaderOverlays = () => {
    setIsMobileMenuOpen(false);

    setIsAllCategoriesOpen(false);

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

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================================================
     MOBILE DRAWER
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    }

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
     BIGDATACLOUD
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
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();

      const administrative = Array.isArray(json?.localityInfo?.administrative)
        ? json.localityInfo.administrative
        : [];

      const city =
        json?.city ||
        json?.locality ||
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
        state,
        city,
        district,
        postcode,
        country,
      };

      if (
        !result.city &&
        !result.state &&
        !result.district &&
        !result.country
      ) {
        return null;
      }

      return result;
    } catch {
      return null;
    }
  };

  /* =========================================================
     NOMINATIM FALLBACK
  ========================================================= */

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
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();

      const address = json?.address || {};

      const result: LocationInfo = {
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

      if (
        !result.city &&
        !result.state &&
        !result.district &&
        !result.country
      ) {
        return null;
      }

      return result;
    } catch {
      return null;
    }
  };

  /* =========================================================
     LOCATION RESOLVER
  ========================================================= */

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
    ) {
      return bigDataCloudResult;
    }

    return fetchFromNominatim(latitude, longitude);
  };

  /* =========================================================
     LOCATION / DELIVERY
  ========================================================= */

  const handleCheckAvailability = () => {
    if (typeof window === "undefined") {
      return;
    }

    setLocationError(null);

    if (!navigator.geolocation) {
      const message = "Location is not supported by your browser.";

      setLocationError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;

        const longitude = position.coords.longitude;

        setLocationCoordinates({
          latitude,
          longitude,
        });

        try {
          const location = await getLocationFromCoords(latitude, longitude);

          if (!location) {
            throw new Error("Unable to determine place name.");
          }

          const city = location.city || location.district || "";

          const state = location.state || "";

          const district = location.district || "";

          const postcode = location.postcode || "";

          const country = location.country || "";

          let formattedLocation = "";

          if (city && state) {
            formattedLocation = `${city}, ${state}`;
          } else if (city) {
            formattedLocation = city;
          } else if (district && state) {
            formattedLocation = `${district}, ${state}`;
          } else if (state) {
            formattedLocation = state;
          } else if (country) {
            formattedLocation = country;
          } else {
            formattedLocation = "your location";
          }

          const isAvailable = true;

          setLocationName(formattedLocation);

          setDeliveryAvailable(isAvailable);

          localStorage.setItem(
            "indiekonnect_delivery_location",
            JSON.stringify({
              name: formattedLocation,
              city: location.city || "",
              state: location.state || "",
              district: location.district || "",
              postcode: postcode || "",
              country: country || "",
              latitude,
              longitude,
              deliveryAvailable: isAvailable,
              updatedAt: new Date().toISOString(),
            }),
          );

          dispatch(
            showToast({
              message: `📍 Delivery available in ${formattedLocation}`,
              type: "success",
            }),
          );
        } catch {
          setLocationName(null);

          setDeliveryAvailable(false);

          const message =
            "We found your location but could not determine the place name.";

          setLocationError(message);

          dispatch(
            showToast({
              message,
              type: "error",
            }),
          );
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

        dispatch(
          showToast({
            message,
            type: "error",
          }),
        );
      },

      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 15000,
      },
    );
  };

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
      } catch {
        // Ignore.
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

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
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

      if (event.error === "aborted") {
        return;
      }

      let message = "Unable to hear you. Please try again.";

      if (event.error === "not-allowed") {
        message = "Please allow microphone permission for voice search.";
      } else if (event.error === "no-speech") {
        message = "No speech detected. Please try again.";
      } else if (event.error === "audio-capture") {
        message = "No microphone was found on this device.";
      } else if (event.error === "network") {
        message = "Voice search network error. Please try again.";
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

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      try {
        voiceRecognitionRef.current?.stop();
      } catch {
        // Ignore.
      }

      voiceRecognitionRef.current = null;

      if (categoryCloseTimer.current) {
        clearTimeout(categoryCloseTimer.current);
      }

      if (cartCloseTimer.current) {
        clearTimeout(cartCloseTimer.current);
      }

      if (profileCloseTimer.current) {
        clearTimeout(profileCloseTimer.current);
      }

      if (searchCloseTimer.current) {
        clearTimeout(searchCloseTimer.current);
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /* =========================================================
     AUTH / LOGIN HELPERS
  ========================================================= */

  const getLoginPath = () => {
    return currentAppType === "distributor"
      ? "/auth/distributor/login"
      : "/auth/customer/login";
  };

  /*
   * IMPORTANT:
   *
   * router.push() must NOT be used for cross-app navigation.
   *
   * Customer:
   * /indiekonnect-web/
   *
   * Distributor:
   * /indiekonnect-distributor/
   *
   * Because both apps use different basePath values.
   */

  const goToDistributorLogin = () => {
    const distributorLoginUrl = `${getDistributorDomain()}/auth/distributor/login/`;

    window.location.href = distributorLoginUrl;
  };

  const goToCustomerLogin = () => {
    const customerLoginUrl = `${getCustomerDomain()}/auth/customer/login/`;

    window.location.href = customerLoginUrl;
  };

  const goToLogin = () => {
    /*
     * Normal login stays within
     * the current application.
     */
    router.push(getLoginPath());

    closeHeaderOverlays();
  };

  /*
   * Cross-app login helper.
   *
   * Customer app -> Distributor app
   * Distributor app -> Customer app
   */
  const goToOtherAppLogin = () => {
    if (currentAppType === "customer") {
      goToDistributorLogin();
    } else {
      goToCustomerLogin();
    }
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

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

  const goToSubcategory = (subcategory: any) => {
    const params = new URLSearchParams();

    params.append("subcategory_ids", String(subcategory.id));

    router.push(`/products?${params.toString()}`);

    closeHeaderOverlays();
  };

  const goToNewArrivals = () => {
    router.push("/products?new-arrivals=true");

    closeHeaderOverlays();
  };

  /* =========================================================
     WISHLIST
  ========================================================= */

  const goToWishlist = () => {
    if (hasToken !== true) {
      goToLogin();
      return;
    }

    router.push("/wishlist");

    closeHeaderOverlays();
  };

  /* =========================================================
     CART
  ========================================================= */

  const goToCart = () => {
    setIsCartOpen(false);

    if (hasToken !== true) {
      goToLogin();
      return;
    }

    router.push("/cart");

    closeHeaderOverlays();
  };

  /* =========================================================
     TRACK ORDER
  ========================================================= */

  const goToTrackOrder = () => {
    if (hasToken !== true) {
      goToLogin();
      return;
    }

    if (currentAppType === "distributor") {
      router.push("/distributor/order-history/");
    } else {
      router.push("/profile/?tab=orders");
    }

    closeHeaderOverlays();
  };

  /* =========================================================
     DASHBOARD
  ========================================================= */

  const goToDashboard = () => {
    if (hasToken !== true) {
      goToLogin();
      return;
    }

    if (currentAppType === "distributor") {
      router.push("/distributor/dashboard/");
    } else {
      router.push("/profile/");
    }

    closeHeaderOverlays();
  };

  /* =========================================================
     PROFILE
  ========================================================= */

  const goToProfile = () => {
    if (hasToken !== true) {
      setIsProfileOpen(false);

      goToLogin();

      return;
    }

    if (currentAppType === "distributor") {
      router.push("/distributor/dashboard/");
    } else {
      router.push("/profile/");
    }

    setIsProfileOpen(false);

    closeHeaderOverlays();
  };

  /* =========================================================
     PRODUCT DETAIL
  ========================================================= */

  const goToProductDetail = (slug: string) => {
    router.push(`/product/${slug}`);

    setSearchQuery("");

    setDebouncedSearchQuery("");

    closeHeaderOverlays();
  };

  /* =========================================================
     NAVIGATION HANDLER
  ========================================================= */

  const handleNavigation = (item: any) => {
    if (item.isSubcategory) {
      const subcategory = allSubcategories.find(
        (subcategory: any) => subcategory.id === item.subcategoryId,
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

      goToProducts(category?.slug || item.label);

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
     LOGOUT
  ========================================================= */

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
    if (!isLoggingOut) {
      setShowLogoutModal(false);
    }
  };

  /* =========================================================
     CART / PROFILE DROPDOWNS
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
     MOBILE MENU TOGGLE
  ========================================================= */

  const handleMobileMenuToggle = () => {
    setIsSearchOpen(false);

    setIsSearchFocused(false);

    setIsSearchHovered(false);

    setIsSearchExpanded(false);

    setIsMobileMenuOpen((prev) => !prev);

    if (isMobileMenuOpen) {
      setMobileExpandedCategoryId(null);
    }
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
        } catch {
          // Ignore.
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    const params = new URLSearchParams();

    params.append("search", searchQuery.trim());

    if (searchCategory && searchCategory !== "all") {
      params.append("category", searchCategory);
    }

    router.push(`/products?${params.toString()}`);

    setSearchQuery("");

    setDebouncedSearchQuery("");

    closeHeaderOverlays();
  };

  /* =========================================================
     PROFILE MENU
  ========================================================= */

  const getProfileMenuItems = () => {
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
      /*
       * Current app login
       */
      items.push({
        icon: UserCircle,
        label:
          currentAppType === "distributor"
            ? "Distributor Login"
            : "Customer Login",
        onClick: goToLogin,
      });

      /*
       * CROSS APP LOGIN
       *
       * Customer -> Distributor
       * Distributor -> Customer
       */
      items.push({
        icon: ArrowRight,
        label:
          currentAppType === "customer"
            ? "Distributor Login"
            : "Customer Login",
        onClick: goToOtherAppLogin,
      });
    }

    return items;
  };

  const profileMenuItems = getProfileMenuItems();

  const navClass = "premium-header-nav-button";

  return (
    <>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
      <header className="premium-header sticky top-0 z-40 w-full font-lato">
        {!hideAnnouncement && (
          <div className="premium-benefits">
            <div className="premium-shell premium-benefit-inner">
              <div>
                <Truck size={23} />
                <span style={{fontSize:'12px'}}>
                  Free Shipping on Orders Above <strong>₹999</strong>
                </span>
              </div>
              <div>
                <BadgeCheck size={23} />
                <span style={{fontSize:'12px'}}>100% Genuine Products</span>
              </div>
              <div>
                <RotateCcw size={23} />
                <span style={{fontSize:'12px'}}>Easy 7 Days Returns</span>
              </div>
              <div>
                <Headphones size={23} />
                <span style={{fontSize:'12px'}}>Dedicated Customer Support</span>
              </div>
              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={locationLoading}
                className="premium-deliver"
              >
                {locationLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <MapPin size={20} />
                )}
                <span>
                  <small>Deliver to</small>
                  <b>{locationName || "Select location"}</b>
                </span>
                <ChevronDown size={17} />
              </button>
            </div>
          </div>
        )}
        <div className="premium-main">
          <div className="premium-main-left-decor" aria-hidden="true" />
          <div className="premium-main-right-decor" aria-hidden="true" />
          <div className="premium-shell premium-main-content">
            <button
              type="button"
              className="premium-mobile-menu"
              onClick={handleMobileMenuToggle}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
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
              <span style={{fontSize: '8px'}} className="premium-brand-tagline">
                DISCOVER
                <br />
                EXTRAORDINARY
                <br />
                LIVING
              </span>
            </Link>
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
                            src={
                              product?.primary_image_url ||
                              product?.image ||
                              (typeof PlaceholderImage === "string"
                                ? PlaceholderImage
                                : PlaceholderImage.src)
                            }
                            alt=""
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
                        `/products?search=${encodeURIComponent(searchQuery.trim())}`,
                      );
                      closeHeaderOverlays();
                    }}
                  >
                    View all results <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
            <div className="premium-actions">
              <div
                className="premium-action-holder"
                onMouseEnter={openProfileDropdown}
                onMouseLeave={scheduleCloseProfileDropdown}
              >
                <button
                  type="button"
                  className="premium-action"
                  onClick={goToProfile}
                >
                  <UserCircle size={31} />
                  <span style={{ fontSize: "10px" }}>Account</span>
                </button>
                {isProfileOpen && (
                  <div className="premium-popover premium-profile-popover">
                    {hasToken && (
                      <div className="premium-profile-name">
                        Hello, {userName}
                        <small>{userEmail}</small>
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
              <button
                type="button"
                className="premium-action"
                onClick={goToWishlist}
              >
                <span className="premium-icon-wrap">
                  <Heart size={32} />
                  {wishlistCount > 0 && <i>{wishlistCount}</i>}
                </span>
                <span style={{ fontSize: "10px" }}>Wishlist</span>
              </button>
              <div
                className="premium-action-holder"
                onMouseEnter={openCartDropdown}
                onMouseLeave={scheduleCloseCartDropdown}
              >
                <button
                  type="button"
                  className="premium-action"
                  onClick={goToCart}
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
              <button
                type="button"
                className="premium-action"
                onClick={goToTrackOrder}
              >
                <Package size={31} />
                <span style={{ fontSize: "10px" }}>Track Order</span>
              </button>
            </div>
          </div>
        </div>
        {!hideMenu && (
          <nav className="premium-nav">
            <div className="premium-shell premium-nav-inner">
              <div className="premium-nav-category" onMouseLeave={() => setIsAllCategoriesOpen(false)}>
                <button
                  type="button"
                  className="premium-all-categories"
                  onClick={() => setIsAllCategoriesOpen((prev) => !prev)}
                  aria-expanded={isAllCategoriesOpen}
                  aria-haspopup="true"
                >
                  <Menu size={22} /> ALL CATEGORIES
                </button>
                <div className="premium-all-dropdown" style={isAllCategoriesOpen ? { display: "block" } : undefined}>
                  {categories.map((category: any) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        goToProducts(
                          category.slug || category.title || category.name,
                        )
                      }
                    >
                      {category.title || category.name}
                      <ChevronRight size={15} />
                    </button>
                  ))}
                </div>
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
                      className={`${navClass} ${item.label === "Home" ? "premium-nav-active" : ""}`}
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
        )}
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
                  {item.label}
                  {item.isCategory && item.subcategories?.length > 0 && (
                    <ChevronDown size={15} />
                  )}
                </button>
                {item.isCategory &&
                  mobileExpandedCategoryId === item.categoryId &&
                  item.subcategories?.map((sub: any) => (
                    <button
                      className="premium-mobile-sub"
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
