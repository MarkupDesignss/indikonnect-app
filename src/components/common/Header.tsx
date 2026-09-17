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
  UserCircle as UserCircleIcon,
  CheckCircle,
  MapPin,
  LifeBuoy,
  ChevronRight,
  Mic,
} from "lucide-react";

import Logo from "../../../public/indiekonnect-web/images/logo.png";

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
                  login page.
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

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

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

  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();

  const { data: wishlistData } = useGetWishlistQuery();

  const { data: userProfileData } = useGetUserProfileQuery();

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
     RESTORE SAVED LOCATION
  ========================================================= */

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
        setLocationName(parsed.name);

        setLocationCoordinates({
          latitude: savedLatitude,
          longitude: savedLongitude,
        });

        setDeliveryAvailable(parsed.deliveryAvailable !== false);
      }
    } catch (error) {
      console.error("Unable to restore saved location:", error);
    }
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

    /* HOME */

    const homeExists = headerMenus.some(
      (menu: any) =>
        menu.status === true && (menu.slug === "home" || menu.title === "Home"),
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

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================================================
     BIGDATACLOUD REVERSE GEOCODING
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
        console.error("BigDataCloud HTTP error:", response.status);

        return null;
      }

      const json = await response.json();

      console.log("✅ BigDataCloud response:", json);

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

      console.log("📍 Parsed BigDataCloud location:", result);

      if (
        !result.city &&
        !result.state &&
        !result.district &&
        !result.country
      ) {
        return null;
      }

      return result;
    } catch (error) {
      console.error("❌ BigDataCloud reverse geocoding failed:", error);

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
        console.error("Nominatim HTTP error:", response.status);

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

      console.log("📍 Nominatim fallback:", result);

      if (
        !result.city &&
        !result.state &&
        !result.district &&
        !result.country
      ) {
        return null;
      }

      return result;
    } catch (error) {
      console.error("❌ Nominatim reverse geocoding failed:", error);

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
      console.log("✅ Location resolved using BigDataCloud");

      return bigDataCloudResult;
    }

    console.warn(
      "⚠ BigDataCloud could not resolve location. Trying Nominatim...",
    );

    const nominatimResult = await fetchFromNominatim(latitude, longitude);

    if (nominatimResult) {
      console.log("✅ Location resolved using Nominatim");

      return nominatimResult;
    }

    return null;
  };

  /* =========================================================
     LOCATION / DELIVERY AVAILABILITY
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

        console.log("📍 Current coordinates:", {
          latitude,
          longitude,
        });

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

          /*
              Preferred display:

              City, State
              Example:
              New Delhi, Delhi
              Gurugram, Haryana
              Noida, Uttar Pradesh

              If city is unavailable:
              District, State

              If state is unavailable:
              Country
            */

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

          /*
              IMPORTANT:

              Here we know that the current location
              was successfully detected and reverse
              geocoded.

              Replace this with your real delivery
              serviceability API when you have it.
            */

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

              country: location.country || "",

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

          console.log("✅ Final detected location:", {
            latitude,
            longitude,
            city: location.city,
            state: location.state,
            district: location.district,
            postcode,
            country,
            formattedLocation,
          });
        } catch (error) {
          console.error("❌ Location name detection error:", error);

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
        console.error("❌ Geolocation error:", error);

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
      } catch (error) {
        console.error("Unable to stop voice recognition:", error);
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
      console.error("Voice search error:", event.error);

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
    } catch (error) {
      console.error("Unable to start voice search:", error);

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
      } catch (error) {
        console.error("Voice recognition cleanup error:", error);
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

    params.append("subcategory_ids", String(subcategory.id));

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
    const distributorToken = localStorage.getItem("distributor_token");

    const storedUserType = localStorage.getItem("user_type");

    const distributor = !!distributorToken && storedUserType === "distributor";

    if (distributor) {
      router.push("/distributor/order-history/");
    } else {
      router.push("/profile/?tab=orders");
    }

    closeHeaderOverlays();
  };

  const goToDashboard = () => {
    router.push("/dashboard");

    closeHeaderOverlays();
  };

  const goToProfile = () => {
    const distributorToken = localStorage.getItem("distributor_token");

    const storedUserType = localStorage.getItem("user_type");

    const distributor = !!distributorToken && storedUserType === "distributor";

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
          console.error("Unable to stop voice search:", error);
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
    const items: any[] = [
      {
        icon: UserCircle,

        label: "My Profile",

        onClick: goToProfile,
      },
    ];

    items.push({
      icon: LogOutIcon,

      label: "Logout",

      onClick: openLogoutModal,

      isDanger: true,
    });

    return items;
  };

  const profileMenuItems = getProfileMenuItems();

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

      {/* =====================================================
          MAIN STICKY HEADER
      ===================================================== */}

      <div className="sticky top-0 z-40 w-full border-t border-[#111111] bg-white font-lato">
        {/* ===================================================
            MAIN HEADER ROW
        =================================================== */}

        <div className="w-full border-b border-[#ECECEC] bg-white">
          <div className="mx-auto h-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid h-[78px] grid-cols-[128px_minmax(0,700px)_300px] items-center justify-center gap-5 lg:gap-7">
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
                <div className="relative h-[48px] w-[126px]">
                  <Image
                    src={Logo}
                    alt="IndieKonnect"
                    fill
                    priority
                    sizes="122px"
                    className="object-contain object-left"
                  />
                </div>
              </Link>

              {/* DESKTOP SEARCH */}

              <div
                ref={searchRef}
                className="relative min-w-0 md:block"
                onMouseEnter={openSearchOnHover}
                onMouseLeave={scheduleCloseSearchOnHover}
              >
                <form onSubmit={handleSearch}>
                  <div
                    className={`flex h-[42px] w-full items-center rounded-[8px] border border-[#DEDEDE] bg-white transition-all duration-200 ${
                      isSearchFocused || isSearchExpanded
                        ? "border-[#CFCFCF] shadow-[0_1px_7px_rgba(0,0,0,0.06)]"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={toggleSearch}
                      className="flex h-full w-[44px] shrink-0 items-center justify-center text-[#222222]"
                      aria-label="Search"
                    >
                      <Search className="h-[18px] w-[18px]" strokeWidth={1.7} />
                    </button>

                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search metal stainless"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        setIsSearchFocused(true);

                        setIsSearchHovered(true);

                        setIsSearchExpanded(true);

                        if (searchCloseTimer.current) {
                          clearTimeout(searchCloseTimer.current);

                          searchCloseTimer.current = null;
                        }
                      }}
                      className="h-full min-w-0 flex-1 bg-transparent pr-2 text-[13px] text-[#1B1B1B] outline-none placeholder:text-[#A3A6AE] sm:text-[14px]"
                    />

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");

                          setDebouncedSearchQuery("");
                        }}
                        className="mr-2 p-1.5 text-[#8E8E8E]"
                      >
                        <X className="h-[16px] w-[16px]" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleVoiceSearch}
                      disabled={!voiceSupported}
                      className={`relative flex h-full w-[44px] shrink-0 items-center justify-center rounded-r-[10px] ${
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
                        className="relative h-[18px] w-[18px]"
                        strokeWidth={isVoiceSearching ? 2.2 : 1.7}
                      />
                    </button>
                  </div>
                </form>

                {/* SEARCH SUGGESTIONS */}

                <AnimatePresence>
                  {isSearchExpanded && searchQuery.length >= 1 && (
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
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-[#111111]" />

                          <span className="ml-2 text-[13px] text-[#888888]">
                            Searching products...
                          </span>
                        </div>
                      )}

                      {!isSearching && hasSuggestions && (
                        <div className="p-3.5">
                          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777777]">
                            Products
                          </div>

                          <div className="space-y-1">
                            {productSuggestions.map((product: any) => (
                              <button
                                key={product.id}
                                onClick={() => goToProductDetail(product.slug)}
                                className="flex w-full items-center gap-3 rounded-[7px] px-2.5 py-2.5 text-left hover:bg-[#F8F8F8]"
                              >
                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[6px] bg-[#F3F3F3]">
                                  <Image
                                    src={
                                      product.primary_image_url ||
                                      "/indiekonnect-web/images/placeholder.jpg"
                                    }
                                    alt={product.name}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[13px] text-[#222222]">
                                    {product.name}
                                  </p>

                                  <p className="mt-0.5 text-[12px] font-semibold text-[#111111]">
                                    {formatProductPrice(product)}
                                  </p>
                                </div>

                                <ArrowRight className="h-4 w-4 text-[#BDBDBD]" />
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => {
                              const params = new URLSearchParams();

                              params.append("search", searchQuery);

                              router.push(`/products?${params.toString()}`);

                              setSearchQuery("");

                              setDebouncedSearchQuery("");

                              closeHeaderOverlays();
                            }}
                            className="mt-3 h-10 w-full rounded-[7px] bg-[#111111] text-[12px] font-semibold text-white"
                          >
                            View all products
                          </button>
                        </div>
                      )}

                      {!isSearching &&
                        debouncedSearchQuery.length >= 1 &&
                        !hasSuggestions && (
                          <div className="px-4 py-10 text-center">
                            <PackageOpen className="mx-auto h-10 w-10 text-[#D8D8D8]" />

                            <p className="mt-3 text-[13px] font-medium text-[#222222]">
                              No products found
                            </p>

                            <p className="mt-1 text-[11px] text-[#8B8B8B]">
                              No products match "{searchQuery}"
                            </p>
                          </div>
                        )}

                      <div className="flex items-center justify-between border-t border-[#EEEEEE] px-3 py-2.5 text-[10px] text-[#9A9A9A]">
                        <span>Showing {productSuggestions.length} results</span>

                        <span>Press Enter to search all</span>
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
                    className="flex h-[60px] min-w-[72px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626]"
                  >
                    <UserCircle
                      className="h-[21px] w-[21px]"
                      strokeWidth={1.5}
                    />

                    <span className="text-[11px] leading-none">Account</span>
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
                        className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-[9px] border border-[#E4E4E4] bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)]"
                        onMouseEnter={openProfileDropdown}
                        onMouseLeave={scheduleCloseProfileDropdown}
                      >
                        <div className="flex items-center gap-3 border-b border-[#ECECEC] px-5 py-4">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-[15px] font-medium text-white">
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
                            <p className="truncate text-[14px] font-semibold text-[#171717]">
                              {userName}
                            </p>

                            <p className="truncate text-[11px] text-[#888888]">
                              {userEmail}
                            </p>
                          </div>
                        </div>

                        <div className="py-1.5">
                          {profileMenuItems.map((item: any) => (
                            <button
                              key={item.label}
                              onClick={item.onClick}
                              className={`flex w-full items-center gap-3 px-5 py-3 text-left text-[13px] ${
                                item.isDanger
                                  ? "mt-1 border-t border-[#EEEEEE] pt-3.5 text-[#B24C4C]"
                                  : "text-[#4B4B4B] hover:bg-[#FAFAFA]"
                              }`}
                            >
                              <item.icon className="h-[18px] w-[18px]" />

                              {item.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* WISHLIST */}

                <button
                  onClick={goToWishlist}
                  className="relative flex h-[60px] min-w-[72px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626]"
                >
                  <span className="relative">
                    <Heart className="h-[21px] w-[21px]" strokeWidth={1.5} />

                    {wishlistCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#111111] text-[9px] font-semibold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </span>

                  <span className="text-[11px] leading-none">Wishlist</span>
                </button>

                {/* CART */}

                <div
                  className="relative"
                  onMouseEnter={openCartDropdown}
                  onMouseLeave={scheduleCloseCartDropdown}
                >
                  <button
                    onClick={goToCart}
                    className="relative flex h-[60px] min-w-[72px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626]"
                  >
                    <span className="relative">
                      <ShoppingBag
                        className="h-[21px] w-[21px]"
                        strokeWidth={1.5}
                      />

                      {cartCount > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#111111] text-[9px] font-semibold text-white">
                          {cartCount}
                        </span>
                      )}
                    </span>

                    <span className="text-[11px] leading-none">Cart</span>
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
                        className="absolute right-0 top-full z-50 mt-1 w-[390px] overflow-hidden rounded-[9px] border border-[#E4E4E4] bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)]"
                        onMouseEnter={openCartDropdown}
                        onMouseLeave={scheduleCloseCartDropdown}
                      >
                        <div className="flex items-center justify-between border-b border-[#ECECEC] px-5 py-4">
                          <div>
                            <span className="text-[15px] font-semibold text-[#171717]">
                              Your Cart
                            </span>

                            {cartCount > 0 && (
                              <span className="mt-0.5 block text-[12px] text-[#888888]">
                                {cartCount} {cartCount === 1 ? "item" : "items"}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-1 text-[#888888]"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {isCartLoading ? (
                          <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-[#111111]" />
                          </div>
                        ) : cartItems.length === 0 ? (
                          <div className="px-6 py-12 text-center">
                            <PackageOpen className="mx-auto h-11 w-11 text-[#D8D8D8]" />

                            <p className="mt-3 text-[14px] font-medium text-[#222222]">
                              Your cart is empty
                            </p>

                            <button
                              onClick={() => {
                                setIsCartOpen(false);

                                goToProducts();
                              }}
                              className="mt-4 h-10 rounded-[7px] bg-[#111111] px-5 text-[12px] font-semibold text-white"
                            >
                              Start Shopping
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="max-h-80 divide-y divide-[#EEEEEE] overflow-y-auto">
                              {cartItems.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 px-4 py-3"
                                >
                                  <Link
                                    href={`/product/${
                                      item.product?.slug || item.product_id
                                    }`}
                                    onClick={() => setIsCartOpen(false)}
                                    className="relative h-13 w-13 shrink-0 overflow-hidden rounded-[6px] border border-[#E8E8E8] bg-[#F4F4F4]"
                                  >
                                    <Image
                                      src={
                                        item.image_url ||
                                        "/indiekonnect-web/images/placeholder.jpg"
                                      }
                                      alt={item.product?.name || "Product"}
                                      fill
                                      sizes="52px"
                                      className="object-cover"
                                    />
                                  </Link>

                                  <div className="min-w-0 flex-1">
                                    <Link
                                      href={`/product/${
                                        item.product?.slug || item.product_id
                                      }`}
                                      onClick={() => setIsCartOpen(false)}
                                      className="block truncate text-[13px] font-medium text-[#171717]"
                                    >
                                      {item.product?.name}
                                    </Link>

                                    <div className="mt-1 flex items-center gap-2">
                                      <span className="text-[13px] font-semibold text-[#111111]">
                                        ₹
                                        {item.current_unit_price_formatted ||
                                          item.current_unit_price}
                                      </span>

                                      <span className="text-[11px] text-[#999999]">
                                        × {item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-[#ECECEC] px-5 py-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] text-[#888888]">
                                  Subtotal
                                </span>

                                <span className="text-[16px] font-semibold text-[#111111]">
                                  ₹{cartSubtotalFormatted}
                                </span>
                              </div>

                              <button
                                onClick={goToCart}
                                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[7px] bg-[#111111] text-[12px] font-semibold text-white"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                View Cart
                              </button>
                            </div>
                          </>
                        )}

                        <div className="border-t border-[#ECECEC] bg-[#FAFAFA] px-5 py-3 text-center">
                          <span className="text-[10px] text-[#999999]">
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
                  className="flex h-[60px] min-w-[88px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626]"
                >
                  <Package className="h-[21px] w-[21px]" strokeWidth={1.45} />

                  <span className="whitespace-nowrap text-[11px] leading-none">
                    Track Order
                  </span>
                </button>
              </div>

              {/* MOBILE ACTIONS */}

              <div className="ml-auto flex items-center gap-0.5 sm:hidden">
                <button onClick={toggleSearch} className="p-2.5 text-[#222222]">
                  <Search className="h-[20px] w-[20px]" />
                </button>

                <button
                  onClick={goToWishlist}
                  className="relative p-2.5 text-[#222222]"
                >
                  <Heart className="h-[20px] w-[20px]" />

                  {wishlistCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[#111111] text-[8px] text-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={goToCart}
                  className="relative p-2.5 text-[#222222]"
                >
                  <ShoppingBag className="h-[20px] w-[20px]" />

                  {cartCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[#111111] text-[8px] text-white">
                      {cartCount}
                    </span>
                  )}
                </button>

                {!hideMenu && (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2.5 text-[#222222]"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-[22px] w-[22px]" />
                    ) : (
                      <Menu className="h-[22px] w-[22px]" />
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
              className="overflow-hidden border-t border-[#ECECEC] bg-[#FAFAFA] px-4 py-3.5 sm:hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="flex h-11 flex-1 items-center rounded-[10px] bg-white px-3 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                  <Search className="h-[18px] w-[18px] text-[#8E8E8E]" />

                  <input
                    type="text"
                    placeholder="Search metal stainless"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-full w-full bg-transparent px-2.5 text-[13px] text-[#222222] outline-none"
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
                      <X className="h-[18px] w-[18px]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    disabled={!voiceSupported}
                    className="rounded-full p-1.5 text-[#555555]"
                  >
                    <Mic className="h-[18px] w-[18px]" />
                  </button>
                </div>

                <button
                  type="submit"
                  className="h-11 rounded-[10px] bg-[#111111] px-4.5 text-[12px] font-semibold text-white"
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
          <div className="hidden h-[52px] border-b border-[#E6E6E6] bg-white lg:block">
            <div className="mx-auto max-w-[1280px] px-4">
              <nav className="flex h-full items-center justify-center gap-[28px] overflow-visible whitespace-nowrap xl:gap-[34px]">
                {desktopNavItems.map((item: any) => {
                  /* CATEGORY ITEM */

                  if (item.isCategory) {
                    const categorySubcategories = getCategorySubcategories(
                      item.categoryId,
                    );

                    const hasSubcategories = categorySubcategories.length > 0;

                    return (
                      <div
                        key={`category-wrapper-${item.categoryId}`}
                        className="relative h-full shrink-0"
                        onMouseEnter={() => {
                          if (hasSubcategories) {
                            handleCategoryMouseEnter(item.categoryId);
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
                          onClick={() => handleNavigation(item)}
                          className="group flex h-full min-h-[52px] shrink-0 items-center justify-center py-0 leading-none text-[12px] font-normal uppercase tracking-[0.01em] text-[#2C2C2C] transition-colors duration-150 hover:text-black xl:text-[13px]"
                        >
                          <span>{item.label}</span>

                          {hasSubcategories && (
                            <ChevronRight
                              className="hidden"
                              strokeWidth={1.8}
                            />
                          )}
                        </button>

                        {/* SUBCATEGORY POPUP */}

                        <AnimatePresence>
                          {hoveredCategoryId === item.categoryId &&
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
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                onMouseEnter={() =>
                                  handleCategoryPopupEnter(item.categoryId)
                                }
                                onMouseLeave={handleCategoryPopupLeave}
                                className="absolute left-1/2 top-[53px] z-[90] w-[280px] -translate-x-1/2 overflow-hidden rounded-[10px] border border-[#E4E4E4] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.14)]"
                              >
                                <div className="absolute -top-[5px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-[#E4E4E4] bg-white" />

                                <div className="relative border-b border-[#EEEEEE] bg-[#FAFAF9] px-4 py-3.5">
                                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#A0A0A0]">
                                    Explore
                                  </p>

                                  <div className="mt-1 flex items-center justify-between gap-2">
                                    <p className="truncate text-[13px] font-semibold text-[#171717]">
                                      {item.label}
                                    </p>

                                    <span className="shrink-0 rounded-full bg-[#EFEFED] px-2.5 py-0.5 text-[9px] font-medium text-[#777777]">
                                      {categorySubcategories.length}
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
                                          goToSubcategory(subcategory)
                                        }
                                        className="group flex w-full items-center gap-3 rounded-[7px] px-3 py-3 text-left transition-all duration-200 hover:bg-[#F6F6F4]"
                                      >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F1EF] text-[#707070] transition-colors duration-200 group-hover:bg-[#111111] group-hover:text-white">
                                          <Grid3x3 className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-[12px] font-medium text-[#353535] transition-colors group-hover:text-[#111111]">
                                            {subcategory.name}
                                          </p>

                                          {subcategory.category_title && (
                                            <p className="mt-0.5 truncate text-[9px] text-[#A0A0A0]">
                                              {subcategory.category_title}
                                            </p>
                                          )}
                                        </div>

                                        <ArrowRight className="h-4 w-4 shrink-0 text-[#BDBDBD] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#222222]" />
                                      </button>
                                    ),
                                  )}
                                </div>

                                <div className="border-t border-[#EEEEEE] bg-white p-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleNavigation(item)}
                                    className="flex h-10 w-full items-center justify-center gap-2 rounded-[7px] bg-[#111111] text-[11px] font-semibold text-white transition-all duration-200 hover:bg-[#292929]"
                                  >
                                    View All {item.label}
                                    <ArrowRight className="h-4 w-4" />
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
                      onClick={() => handleNavigation(item)}
                      className="group flex h-full min-h-[52px] shrink-0 items-center justify-center py-0 leading-none text-[12px] font-normal uppercase tracking-[0.01em] text-[#2C2C2C] transition-colors duration-150 hover:text-black xl:text-[13px]"
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* ===================================================
            AVAILABILITY STRIP
        =================================================== */}

        <div className="min-h-[46px] border-b border-[#EBECEE] bg-[#F7F8F9]">
          <div className="flex min-h-[46px] items-center justify-center px-4">
            <button
              type="button"
              onClick={handleCheckAvailability}
              disabled={locationLoading}
              className="group inline-flex min-h-[46px] items-center justify-center gap-[10px] whitespace-nowrap text-[#202020] transition-opacity duration-200 disabled:cursor-wait disabled:opacity-70"
            >
              {locationLoading ? (
                <>
                  <Loader2
                    className="h-[19px] w-[19px] shrink-0 animate-spin text-[#111111]"
                    strokeWidth={1.7}
                  />

                  <span className="text-[13px] font-medium leading-none sm:text-[14px]">
                    Detecting your location...
                  </span>
                </>
              ) : locationName && deliveryAvailable ? (
                <>
                  <span className="relative flex h-[20px] w-[20px] items-center justify-center">
                    <MapPin
                      className="h-[20px] w-[20px] shrink-0 text-[#111111]"
                      fill="currentColor"
                      strokeWidth={1.4}
                    />

                    <CheckCircle
                      className="absolute -right-[6px] -top-[5px] h-[11px] w-[11px] fill-white text-[#111111]"
                      strokeWidth={2.4}
                    />
                  </span>

                  <span className="inline-flex items-center text-[13px] font-semibold leading-none tracking-[0.005em] sm:text-[14px]">
                    Delivery available in {locationName}
                  </span>

                  <ArrowRight
                    className="h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                    strokeWidth={1.6}
                  />
                </>
              ) : locationName && !deliveryAvailable ? (
                <>
                  <MapPin
                    className="h-[20px] w-[20px] shrink-0 text-[#777777]"
                    strokeWidth={1.4}
                  />

                  <span className="inline-flex items-center text-[13px] font-medium leading-none tracking-[0.005em] sm:text-[14px]">
                    Delivery unavailable in {locationName}
                  </span>

                  <ArrowRight
                    className="h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                    strokeWidth={1.6}
                  />
                </>
              ) : (
                <>
                  <MapPin
                    className="h-[20px] w-[20px] shrink-0 text-[#111111]"
                    fill="currentColor"
                    strokeWidth={1.4}
                  />

                  <span className="inline-flex items-center text-[13px] font-medium leading-none tracking-[0.005em] sm:text-[14px]">
                    Check availability by location
                  </span>

                  <ArrowRight
                    className="h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                    strokeWidth={1.6}
                  />
                </>
              )}
            </button>
          </div>
        </div>

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
              <div className="px-4 py-5">
                {/* USER */}

                <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-5">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-[15px] font-medium text-white">
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
                    <p className="truncate text-[14px] font-semibold text-[#222222]">
                      {userName}
                    </p>

                    <p className="truncate text-[11px] text-[#888888]">
                      {userEmail}
                    </p>
                  </div>
                </div>

                {/* MOBILE NAV */}

                <div className="pt-3">
                  {mobileNavItems.map((item: any) => (
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
                        onClick={() => handleNavigation(item)}
                        className="flex min-h-[50px] w-full items-center justify-between border-b border-[#EEEEEE] px-3 text-left"
                      >
                        <div className="flex items-center gap-3.5">
                          <item.icon className="h-[19px] w-[19px] text-[#777777]" />

                          <span className="text-[13px] font-medium text-[#333333]">
                            {item.label}
                          </span>
                        </div>

                        <ArrowRight className="h-[18px] w-[18px] text-[#BEBEBE]" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* LOCATION */}

                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={locationLoading}
                  className="mt-4 flex min-h-[48px] w-full items-center gap-3 rounded-[8px] border border-[#E1E1E1] bg-white px-3.5 text-left disabled:opacity-70"
                >
                  {locationLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#111111]" />
                  ) : locationName ? (
                    <CheckCircle className="h-5 w-5 text-[#111111]" />
                  ) : (
                    <MapPin className="h-5 w-5 text-[#111111]" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-[#777777]">
                      {locationLoading
                        ? "Detecting location"
                        : locationName
                          ? "Delivery location"
                          : "Check delivery availability"}
                    </p>

                    <p className="truncate text-[13px] font-semibold text-[#222222]">
                      {locationLoading
                        ? "Please wait..."
                        : locationName
                          ? `Delivery available in ${locationName}`
                          : "Use my current location"}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-[#999999]" />
                </button>

                {/* PROFILE ACTIONS */}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E5E5E5] pt-5">
                  <button
                    onClick={goToProfile}
                    className="flex h-10 items-center gap-2 rounded-[7px] border border-[#DDDDDD] bg-white px-3.5 text-[12px] text-[#444444]"
                  >
                    <UserCircle className="h-4 w-4" />

                    {isDistributor ? "Dashboard" : "My Profile"}
                  </button>

                  <button
                    onClick={openLogoutModal}
                    className="flex h-10 items-center gap-2 rounded-[7px] border border-[#F0D5D5] bg-[#FFF8F8] px-3.5 text-[12px] text-[#B24C4C]"
                  >
                    <LogOutIcon className="h-4 w-4" />
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
