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
  ChevronDown,
  LogOut,
  UserCircle,
  Search,
  Grid3x3,
  ArrowRight,
  Truck,
  Package,
  LogOut as LogOutIcon,
  AlertCircle,
  Loader2,
  Home,
  Tag,
  Phone,
  Store,
  Crown,
  Wallet,
  TrendingUp,
  ShoppingBag as ShoppingBagIcon,
  Award,
  Calendar,
  ChevronRight,
  Shield,
  Users,
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
import {
  useGetDistributorStatsQuery,
  useGetHeaderQuery,
} from "@/lib/redux/api/headerApi";

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

// Logout Modal Component
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
            className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-[8px] shadow-[0_18px_60px_rgba(0,0,0,0.14)] max-w-md w-full overflow-hidden relative border border-[#E4E4E2]">
              <div className="relative px-6 pt-7 pb-4 text-center">
                <div className="w-14 h-14 mx-auto bg-[#F1F1F0] rounded-full flex items-center justify-center mb-4">
                  <LogOutIcon className="w-6 h-6 text-[#111111]" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#171717] mb-1.5">
                  Logout Confirmation
                </h3>
                <p className="text-[#888888] text-[12px] leading-relaxed">
                  Are you sure you want to logout? You'll need to login again to
                  access your account.
                </p>
              </div>
              <div className="mx-6 p-3 bg-[#FAFAF9] rounded-[6px] border border-[#E4E4E2] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#777777] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#666666]">
                  Your session will be ended and you'll be redirected to the
                  login page.
                </p>
              </div>
              <div className="px-6 py-4 bg-white border-t border-[#E6E6E4] flex gap-2.5">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-white text-[#555555] rounded-[6px] text-[11px] font-medium hover:bg-[#FAFAF9] transition-all duration-200 border border-[#D7D7D5] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-[#111111] text-white rounded-[6px] text-[11px] font-semibold hover:bg-[#292929] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
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

// Earnings Popup Component
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
            className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex items-center justify-center z-[100] p-4 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-[8px] shadow-[0_18px_60px_rgba(0,0,0,0.14)] max-w-md w-full overflow-hidden relative border border-[#E4E4E2]">
              <div className="relative bg-[#111111] px-6 pt-7 pb-6">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[7px] bg-white/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[16px] text-white font-semibold">
                      Partner Earnings
                    </h3>
                    <p className="text-white/70 text-[11px]">
                      Your performance overview
                    </p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 className="w-7 h-7 text-[#111111] animate-spin" />
                </div>
              ) : stats ? (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#FAFAF9] rounded-[7px] p-3.5 border border-[#E4E4E2]">
                      <div className="flex items-center gap-1.5 text-[#888888] text-[9px] font-medium uppercase tracking-wider mb-1">
                        <Wallet className="w-3 h-3" />
                        Total Earnings
                      </div>
                      <div className="text-[19px] font-semibold text-[#111111]">
                        {formatCurrency(stats.total_amount_mrp || 0)}
                      </div>
                    </div>

                    <div className="bg-[#FAFAF9] rounded-[7px] p-3.5 border border-[#E4E4E2]">
                      <div className="flex items-center gap-1.5 text-[#888888] text-[9px] font-medium uppercase tracking-wider mb-1">
                        <TrendingUp className="w-3 h-3" />
                        Total Savings
                      </div>
                      <div className="text-[19px] font-semibold text-[#111111]">
                        {formatCurrency(stats.total_savings || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#FAFAF9] rounded-[7px] p-3.5 border border-[#E4E4E2]">
                      <div className="flex items-center gap-1.5 text-[#888888] text-[9px] font-medium uppercase tracking-wider mb-1">
                        <ShoppingBagIcon className="w-3 h-3" />
                        Total Orders
                      </div>
                      <div className="text-[19px] font-semibold text-[#111111]">
                        {stats.total_orders || 0}
                      </div>
                    </div>

                    <div className="bg-[#FAFAF9] rounded-[7px] p-3.5 border border-[#E4E4E2]">
                      <div className="flex items-center gap-1.5 text-[#888888] text-[9px] font-medium uppercase tracking-wider mb-1">
                        <Award className="w-3 h-3" />
                        Coins Earned
                      </div>
                      <div className="text-[19px] font-semibold text-[#111111]">
                        {stats.total_coins_earned || 0}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FAFAF9] rounded-[7px] p-3.5 border border-[#E4E4E2]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[9px] text-[#888888] font-medium uppercase tracking-wider">
                          Partner Since
                        </div>
                        <div className="text-[12px] font-medium text-[#171717] mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-[#555555]" />
                          {stats.joined_at
                            ? new Date(stats.joined_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "N/A"}
                        </div>
                      </div>
                      <div className="px-2.5 py-1 bg-[#F1F1F0] rounded-full">
                        <span className="text-[9px] font-semibold text-[#555555] uppercase tracking-wider">
                          {stats.account_type || "Partner"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={onViewDetails}
                      className="flex-1 py-2.5 bg-[#111111] text-white rounded-[6px] text-[11px] font-semibold hover:bg-[#292929] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      View Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onClose}
                      className="py-2.5 px-4 bg-white text-[#555555] rounded-[6px] text-[11px] font-medium hover:bg-[#FAFAF9] transition-all duration-200 border border-[#D7D7D5]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#F1F1F0] flex items-center justify-center mb-4">
                    <PackageOpen className="w-6 h-6 text-[#999999]" />
                  </div>
                  <p className="text-[#171717] text-[13px] font-medium">
                    No earnings data available
                  </p>
                  <p className="text-[11px] text-[#888888] mt-1">
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
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<
    string | null
  >(null);
  const [isEarningsPopupOpen, setIsEarningsPopupOpen] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isDistributor, setIsDistributor] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shopCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const voiceRecognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();
  const { data: wishlistData, isLoading: isWishlistLoading } =
    useGetWishlistQuery();
  const { data: userProfileData } = useGetUserProfileQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: headerData, isLoading: isHeaderLoading } = useGetHeaderQuery();

  const {
    data: distributorStats,
    isLoading: isDistributorStatsLoading,
    refetch: refetchDistributorStats,
  } = useGetDistributorStatsQuery(undefined, {
    skip: !isDistributor,
  });

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

  // Login handlers
  const handleCustomerLogin = () => {
    router.push("/auth/customer/login");
  };

  const handleDistributorLogin = () => {
    router.push("/auth/distributor/login");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authToken = localStorage.getItem("auth_token");
      const distributorToken = localStorage.getItem("distributor_token");
      const type = localStorage.getItem("user_type");

      setUserType(type);
      setIsCustomer(!!authToken);
      setIsDistributor(!!distributorToken);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    setVoiceSupported(!!SpeechRecognition);
  }, []);

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

  const cartItems = cartData?.data?.items || [];
  const cartCount = cartData?.data?.total_items || 0;
  const cartSubtotalFormatted = cartData?.data?.total_formatted || "0.00";

  const wishlistItems = wishlistData?.data || [];
  const wishlistCount = wishlistItems.length;

  const productSuggestions = productsData?.data || [];
  const hasSuggestions = productSuggestions.length > 0;
  const isSearching = isProductsLoading && debouncedSearchQuery.length >= 1;

  const userProfile = userProfileData?.user;
  const userName = userProfile?.full_name || "User";
  const userEmail = userProfile?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const userProfilePicture = userProfileData?.user?.profile_picture || null;
  const categories = (categoriesData?.data || []).filter(
    (category: any) => category.status === "active",
  );
  const headerMenus = headerData?.data?.menus || [];

  const getRoleBasedMenus = () => {
    const baseMenus = headerMenus
      .filter((menu: any) => menu.status === true)
      .map((menu: any) => ({
        label: menu.title,
        href: getMenuHref(menu.slug),
        hasDropdown: menu.title === "Collections",
      }));

    if (isDistributor) {
      return [
        ...baseMenus,
        {
          label: "Earnings",
          href: "/profile/?tab=earnings",
          hasDropdown: false,
        },
      ];
    }

    return baseMenus;
  };

  const getMenuIcon = (title: string) => {
    const iconMap: { [key: string]: any } = {
      Home: Home,
      Shop: Grid3x3,
      Collections: Package,
      "New arrivals": Tag,
      "Contact us": Phone,
      "Partner Hub": Store,
      Earnings: Crown,
      Products: Package,
    };
    return iconMap[title] || Tag;
  };

  const getMenuHref = (slug: string) => {
    const hrefMap: { [key: string]: string } = {
      home: "/",
      shop: "/products",
      collections: "/collections",
      "new-arrivals": "/products?new-arrivals=true",
      "contact-us": "/contact",
      "partner-hub": "/partner/dashboard",
      earnings: "/profile/?tab=earnings",
      products: "/partner/products",
    };
    return hrefMap[slug] || `/${slug}`;
  };

  const handleNavigation = (href: string, label?: string) => {
    if (label === "New arrivals" || href.includes("new-arrivals")) {
      router.push("/products?new-arrivals=true");
    } else if (label === "Earnings" || href === "/profile/?tab=earnings") {
      openEarningsPopup();
    } else if (href === "/") {
      goToHome();
    } else if (href === "/products") {
      goToProducts();
    } else if (href === "/collections") {
      goToCollections();
    } else if (href === "/track-order") {
      goToTrackOrder();
    } else if (href === "/dashboard") {
      goToDashboard();
    } else if (href === "/partner/dashboard") {
      goToDashboard();
    } else {
      router.push(href);
    }

    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    setExpandedMobileCategory(null);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const openEarningsPopup = () => {
    if (isDistributor) {
      refetchDistributorStats();
      setIsEarningsPopupOpen(true);
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const closeEarningsPopup = () => {
    setIsEarningsPopupOpen(false);
  };

  const goToEarningsDetails = () => {
    setIsEarningsPopupOpen(false);
    router.push("/profile/?tab=earnings");
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const mobileNavItems = headerMenus
    .filter((menu: any) => menu.status === true)
    .map((menu: any) => ({
      label: menu.title,
      href: getMenuHref(menu.slug),
      icon: getMenuIcon(menu.title),
      hasDropdown: menu.title === "Collections",
    }));

  const getMobileNavItems = () => {
    if (isDistributor) {
      return [
        ...mobileNavItems,
        {
          label: "Earnings",
          href: "/profile/?tab=earnings",
          icon: Crown,
          hasDropdown: false,
        },
      ];
    }
    return mobileNavItems;
  };

  const desktopNavItems = getRoleBasedMenus();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      if (shopRef.current && !shopRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
        if (shopCloseTimer.current) {
          clearTimeout(shopCloseTimer.current);
          shopCloseTimer.current = null;
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";

      if (transcript) {
        // Voice search ONLY fills the input.
        // No navigation happens here.
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

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      console.error("Voice search error:", event.error);
      setIsVoiceSearching(false);

      if (event.error === "aborted") return;

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

  useEffect(() => {
    return () => {
      try {
        voiceRecognitionRef.current?.stop();
      } catch (error) {
        console.error("Voice recognition cleanup error:", error);
      }
      voiceRecognitionRef.current = null;
    };
  }, []);

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
          setIsEarningsPopupOpen(false);
        },
        onError: (error) => {
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

  const openShopDropdown = () => {
    if (shopCloseTimer.current) clearTimeout(shopCloseTimer.current);
    setIsShopDropdownOpen(true);
  };

  const scheduleCloseShopDropdown = () => {
    if (shopCloseTimer.current) clearTimeout(shopCloseTimer.current);
    shopCloseTimer.current = setTimeout(
      () => setIsShopDropdownOpen(false),
      300,
    );
  };

  const openSearchOnHover = () => {
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
    setIsSearchHovered(true);
    setIsSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
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
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const goToWishlist = () => {
    router.push("/wishlist");
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const goToCart = () => {
    router.push("/cart");
    setIsCartOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const goToHome = () => {
    router.push("/");
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const goToProducts = (category?: string) => {
    let url = "/products";
    if (category && category !== "all") {
      const params = new URLSearchParams();
      params.append("category", category);
      url += `?${params.toString()}`;
    }
    router.push(url);
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    setExpandedMobileCategory(null);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const goToNewArrivals = () => {
    router.push("/products?new-arrivals=true");
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    setExpandedMobileCategory(null);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  // Updated goToProfile function - routes based on user type
  const goToProfile = () => {
    // Check if user is distributor
    const distributorToken = localStorage.getItem("distributor_token");
    const userType = localStorage.getItem("user_type");
    const isDistributor = !!distributorToken && userType === "distributor";

    if (isDistributor) {
      // Distributor goes to dashboard
      router.push("/distributor/dashboard/");
    } else {
      // Customer goes to profile
      router.push("/profile/");
    }

    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const goToCollections = () => {
    router.push("/collections");
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const goToTrackOrder = () => {
    router.push("/track-order");
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const goToPartnerEarnings = () => {
    router.push("/profile/?tab=earnings");
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const goToProductDetail = (slug: string) => {
    router.push(`/product/${slug}`);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsShopDropdownOpen(false);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append("search", searchQuery.trim());
      if (searchCategory && searchCategory !== "all") {
        params.append("category", searchCategory);
      }
      router.push(`/products?${params.toString()}`);
      setIsSearchFocused(false);
      setIsSearchHovered(false);
      setIsSearchExpanded(false);
      setIsShopDropdownOpen(false);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      if (searchCloseTimer.current) {
        clearTimeout(searchCloseTimer.current);
        searchCloseTimer.current = null;
      }
    }
  };

  const getProfileMenuItems = () => {
    const items = [
      {
        icon: UserCircle,
        label: "My Profile",
        onClick: goToProfile,
      },
    ];

    // Only show Earnings for distributors
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

  const getRoleBadge = () => {
    if (isDistributor) {
      return {
        label: "Partner",
        color: "#111111",
        bg: "rgba(17, 17, 17, 0.06)",
        icon: Store,
      };
    }
    if (isCustomer) {
      return {
        label: "Customer",
        color: "#111111",
        bg: "rgba(17, 17, 17, 0.06)",
        icon: UserCircle,
      };
    }
    return null;
  };

  const roleBadge = getRoleBadge();
  const profileMenuItems = getProfileMenuItems();
  const mobileNavItemsFinal = getMobileNavItems();
  const earningsStats = distributorStats?.data || null;

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

      {/* ---------------------------------------------------------
          PREMIUM E-COMMERCE HEADER
          Layout:
          1. Slim announcement bar
          2. Main row: logo / large search / account actions
          3. Bottom navigation
         --------------------------------------------------------- */}

      {!hideAnnouncement && (
        <div className="h-[24px] bg-[#111111] text-white flex items-center overflow-hidden">
          <div className="w-full whitespace-nowrap px-4 text-[9px] sm:text-[10px] tracking-[0.015em] font-medium overflow-hidden text-ellipsis">
            Cashback via Scratch Card on transaction via MobiKwik UPI. T&C
            Apply*.
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 bg-white font-sans border-b border-[#E5E5E5] transition-shadow duration-300 ${
          isScrolled ? "shadow-[0_3px_14px_rgba(0,0,0,0.07)]" : ""
        }`}
      >
        {/* MAIN HEADER ROW */}
        <div className="w-full border-b border-[#ECECEC]">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="h-[74px] lg:h-[82px] flex items-center gap-5 lg:gap-7">
              {/* Logo */}
              <Link
                href="/"
                onClick={goToHome}
                className="shrink-0 flex items-center"
                aria-label="Home"
              >
                <div className="relative w-[104px] h-[42px] sm:w-[116px] sm:h-[46px]">
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

              {/* Desktop Search */}
              <div
                ref={searchRef}
                className="relative hidden md:block flex-1 max-w-[800px] mx-auto"
                onMouseEnter={openSearchOnHover}
                onMouseLeave={scheduleCloseSearchOnHover}
              >
                <form onSubmit={handleSearch}>
                  <div
                    className={`h-[38px] sm:h-[40px] w-full flex items-center rounded-[7px] border transition-all duration-200 ${
                      isSearchFocused || isSearchExpanded
                        ? "border-[#111111] shadow-[0_0_0_2px_rgba(17,17,17,0.04)]"
                        : "border-[#DDDDDD]"
                    } bg-white`}
                  >
                    <button
                      type="button"
                      onClick={toggleSearch}
                      className="w-10 h-full shrink-0 flex items-center justify-center text-[#222222] hover:text-[#000000]"
                      aria-label="Search"
                    >
                      <Search className="w-[16px] h-[16px]" strokeWidth={1.7} />
                    </button>

                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search ceramic"
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
                      className="min-w-0 flex-1 h-full bg-transparent outline-none text-[12px] sm:text-[13px] text-[#1B1B1B] placeholder:text-[#A6A6A6] pr-2"
                    />

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setDebouncedSearchQuery("");
                        }}
                        className="mr-2 p-1 text-[#8E8E8E] hover:text-[#111111]"
                        aria-label="Clear search"
                      >
                        <X className="w-[14px] h-[14px]" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleVoiceSearch}
                      disabled={!voiceSupported}
                      className={`relative w-10 h-full shrink-0 flex items-center justify-center transition-all duration-200 ${
                        isVoiceSearching
                          ? "text-red-500 bg-red-50"
                          : voiceSupported
                            ? "text-[#2E2E2E] hover:text-[#111111] hover:bg-[#F5F5F3]"
                            : "text-[#BDBDBD] cursor-not-allowed"
                      }`}
                      aria-label={
                        isVoiceSearching ? "Stop voice search" : "Voice search"
                      }
                      title={
                        !voiceSupported
                          ? "Voice search is not supported in this browser"
                          : isVoiceSearching
                            ? "Stop listening"
                            : "Search by voice"
                      }
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
                            ease: "easeInOut",
                          }}
                        />
                      )}

                      <motion.div
                        animate={
                          isVoiceSearching
                            ? { scale: [1, 1.14, 1] }
                            : { scale: 1 }
                        }
                        transition={{
                          duration: 0.8,
                          repeat: isVoiceSearching ? Infinity : 0,
                        }}
                      >
                        <Mic
                          className="relative w-[16px] h-[16px]"
                          strokeWidth={isVoiceSearching ? 2.2 : 1.7}
                        />
                      </motion.div>
                    </button>
                  </div>
                </form>

                {/* Search suggestions */}
                <AnimatePresence>
                  {isSearchExpanded &&
                    (searchQuery.length >= 1 || isSearching) && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[8px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] border border-[#E3E3E3] overflow-hidden z-50"
                        onMouseEnter={() => {
                          if (searchCloseTimer.current) {
                            clearTimeout(searchCloseTimer.current);
                            searchCloseTimer.current = null;
                          }
                          setIsSearchHovered(true);
                        }}
                        onMouseLeave={() => {
                          if (!isSearchFocused) {
                            searchCloseTimer.current = setTimeout(() => {
                              setIsSearchHovered(false);
                              setIsSearchExpanded(false);
                              searchCloseTimer.current = null;
                            }, 300);
                          }
                        }}
                      >
                        {isSearching && (
                          <div className="py-7 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-[#111111]" />
                            <span className="ml-2 text-[12px] text-[#888888]">
                              Searching products...
                            </span>
                          </div>
                        )}

                        {!isSearching && hasSuggestions && (
                          <div className="p-3">
                            <div className="px-2 pb-2 text-[9px] uppercase tracking-[0.14em] font-semibold text-[#777777]">
                              Products
                            </div>

                            <div className="space-y-1">
                              {productSuggestions.map((product: any) => (
                                <button
                                  key={product.id}
                                  onClick={() =>
                                    goToProductDetail(product.slug)
                                  }
                                  className="w-full flex items-center gap-3 rounded-[6px] px-2.5 py-2 hover:bg-[#F8F8F8] text-left"
                                >
                                  <div className="relative w-10 h-10 rounded-[5px] overflow-hidden bg-[#F3F3F3] shrink-0">
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
                                    <p className="text-[12px] text-[#222222] truncate">
                                      {product.name}
                                    </p>
                                    <p className="text-[11px] font-semibold text-[#111111] mt-0.5">
                                      {product.retail_price_formatted ||
                                        "₹0.00"}
                                    </p>
                                  </div>

                                  <ArrowRight className="w-3.5 h-3.5 text-[#BDBDBD] shrink-0" />
                                </button>
                              ))}
                            </div>

                            {productSuggestions.length === 5 && (
                              <button
                                onClick={() => {
                                  const params = new URLSearchParams();
                                  params.append("search", searchQuery);
                                  if (
                                    searchCategory &&
                                    searchCategory !== "all"
                                  ) {
                                    params.append("category", searchCategory);
                                  }

                                  router.push(`/products?${params.toString()}`);
                                  setIsSearchExpanded(false);
                                  setIsSearchFocused(false);
                                  setIsSearchHovered(false);
                                  setSearchQuery("");
                                  setDebouncedSearchQuery("");
                                }}
                                className="mt-2.5 w-full h-9 rounded-[6px] bg-[#111111] text-white text-[11px] font-semibold hover:bg-[#2A2A2A] transition-colors"
                              >
                                View all products
                              </button>
                            )}
                          </div>
                        )}

                        {!isSearching &&
                          debouncedSearchQuery.length >= 1 &&
                          !hasSuggestions && (
                            <div className="py-9 px-4 text-center">
                              <PackageOpen className="mx-auto w-9 h-9 text-[#D8D8D8]" />
                              <p className="mt-3 text-[12px] font-medium text-[#222222]">
                                No products found
                              </p>
                              <p className="mt-1 text-[10px] text-[#8B8B8B]">
                                No products match "{searchQuery}"
                              </p>
                            </div>
                          )}

                        <div className="border-t border-[#EEEEEE] px-3 py-2 flex items-center justify-between text-[9px] text-[#9A9A9A]">
                          <span>
                            {debouncedSearchQuery.length >= 1
                              ? `Showing ${productSuggestions.length} results`
                              : "Start typing to search"}
                          </span>
                          <span>Press Enter to search all</span>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>

              {/* Right Actions */}
              <div className="hidden sm:flex items-center shrink-0">
                {/* Account */}
                <div
                  className="relative"
                  onMouseEnter={openProfileDropdown}
                  onMouseLeave={scheduleCloseProfileDropdown}
                >
                  <button
                    onClick={goToProfile}
                    className="min-w-[66px] px-2.5 h-[56px] flex flex-col items-center justify-center gap-1 text-[#262626] hover:text-black transition-colors"
                    aria-label="Account"
                  >
                    <UserCircle
                      className="w-[18px] h-[18px]"
                      strokeWidth={1.5}
                    />
                    <span className="text-[10px] leading-none">Account</span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1 w-64 bg-white rounded-[8px] border border-[#E4E4E4] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)] overflow-hidden z-50"
                        onMouseEnter={openProfileDropdown}
                        onMouseLeave={scheduleCloseProfileDropdown}
                      >
                        <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center overflow-hidden text-[14px] font-medium">
                            {userProfilePicture ? (
                              <img
                                src={userProfilePicture}
                                alt={userName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              userInitial
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#171717] truncate">
                              {userName}
                            </p>
                            <p className="text-[10px] text-[#888888] truncate">
                              {userEmail}
                            </p>
                          </div>
                        </div>

                        <div className="py-1">
                          {profileMenuItems.map((item) => (
                            <button
                              key={item.label}
                              onClick={item.onClick}
                              className={`w-full px-5 py-2.5 flex items-center gap-3 text-left text-[12px] transition-colors ${
                                item.isDanger
                                  ? "text-[#B24C4C] border-t border-[#EEEEEE] mt-1 pt-3 hover:bg-[#FFF7F7]"
                                  : "text-[#4B4B4B] hover:bg-[#FAFAFA]"
                              }`}
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Wishlist */}
                <button
                  onClick={goToWishlist}
                  className="min-w-[66px] px-2.5 h-[56px] flex flex-col items-center justify-center gap-1 text-[#262626] hover:text-black transition-colors relative"
                  aria-label="Wishlist"
                >
                  <span className="relative">
                    <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#111111] text-white text-[8px] flex items-center justify-center font-semibold">
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] leading-none">Wishlist</span>
                </button>

                {/* Cart */}
                <div
                  className="relative"
                  onMouseEnter={openCartDropdown}
                  onMouseLeave={scheduleCloseCartDropdown}
                >
                  <button
                    onClick={goToCart}
                    className="min-w-[66px] px-2.5 h-[56px] flex flex-col items-center justify-center gap-1 text-[#262626] hover:text-black transition-colors relative"
                    aria-label="Cart"
                  >
                    <span className="relative">
                      <ShoppingBag
                        className="w-[18px] h-[18px]"
                        strokeWidth={1.5}
                      />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#111111] text-white text-[8px] flex items-center justify-center font-semibold">
                          {cartCount}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] leading-none">Cart</span>
                  </button>

                  <AnimatePresence>
                    {isCartOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1 w-[380px] bg-white rounded-[8px] border border-[#E4E4E4] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)] overflow-hidden z-50"
                        onMouseEnter={openCartDropdown}
                        onMouseLeave={scheduleCloseCartDropdown}
                      >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ECECEC]">
                          <div>
                            <span className="text-[14px] font-semibold text-[#171717]">
                              Your Cart
                            </span>
                            {cartCount > 0 && (
                              <span className="block mt-0.5 text-[11px] text-[#888888]">
                                {cartCount} {cartCount === 1 ? "item" : "items"}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-1 text-[#888888] hover:text-[#111111]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {isCartLoading ? (
                          <div className="py-12 flex justify-center">
                            <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
                          </div>
                        ) : cartItems.length === 0 ? (
                          <div className="py-12 px-6 text-center">
                            <PackageOpen className="mx-auto w-10 h-10 text-[#D8D8D8]" />
                            <p className="mt-3 text-[13px] font-medium text-[#222222]">
                              Your cart is empty
                            </p>
                            <p className="mt-1 text-[10px] text-[#888888]">
                              Discover our products
                            </p>
                            <button
                              onClick={() => {
                                setIsCartOpen(false);
                                goToProducts();
                              }}
                              className="mt-4 px-5 h-9 rounded-[6px] bg-[#111111] text-white text-[11px] font-semibold"
                            >
                              Start Shopping
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="max-h-80 overflow-y-auto divide-y divide-[#EEEEEE]">
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
                                    className="relative w-12 h-12 rounded-[6px] overflow-hidden bg-[#F4F4F4] border border-[#E8E8E8] shrink-0"
                                  >
                                    <Image
                                      src={
                                        item.image_url ||
                                        "/indiekonnect-web/images/placeholder.jpg"
                                      }
                                      alt={item.product?.name || "Product"}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  </Link>
                                  <div className="min-w-0 flex-1">
                                    <Link
                                      href={`/product/${
                                        item.product?.slug || item.product_id
                                      }`}
                                      onClick={() => setIsCartOpen(false)}
                                      className="block truncate text-[12px] font-medium text-[#171717]"
                                    >
                                      {item.product?.name || "Product"}
                                    </Link>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[12px] font-semibold text-[#111111]">
                                        ₹
                                        {item.current_unit_price_formatted ||
                                          item.current_unit_price}
                                      </span>
                                      <span className="text-[10px] text-[#999999]">
                                        × {item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
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
                                className="mt-3 w-full h-10 bg-[#111111] text-white rounded-[6px] text-[11px] font-semibold flex items-center justify-center gap-2 hover:bg-[#292929]"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                View Cart
                              </button>
                            </div>
                          </>
                        )}

                        <div className="px-5 py-2.5 bg-[#FAFAFA] border-t border-[#ECECEC] text-center">
                          <span className="text-[9px] text-[#999999]">
                            Every order supports artisan communities
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Track Order */}
                <button
                  onClick={goToTrackOrder}
                  className="min-w-[82px] px-2.5 h-[56px] flex flex-col items-center justify-center gap-1 text-[#262626] hover:text-black transition-colors"
                  aria-label="Track Order"
                >
                  <Package className="w-[18px] h-[18px]" strokeWidth={1.45} />
                  <span className="text-[10px] leading-none whitespace-nowrap">
                    Track Order
                  </span>
                </button>
              </div>

              {/* Mobile actions */}
              <div className="flex sm:hidden items-center gap-1 ml-auto">
                <button
                  onClick={toggleSearch}
                  className="p-2 text-[#222222]"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>

                <button
                  onClick={goToWishlist}
                  className="p-2 text-[#222222] relative"
                  aria-label="Wishlist"
                >
                  <Heart className="w-[18px] h-[18px]" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#111111] text-white text-[7px] flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={goToCart}
                  className="p-2 text-[#222222] relative"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-[18px] h-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#111111] text-white text-[7px] flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                {!hideMenu && (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-[#222222]"
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP NAVIGATION */}
        {!hideMenu && (
          <div className="hidden lg:block bg-white">
            <div className="mx-auto max-w-[1120px] px-4">
              <nav className="h-[49px] flex items-center justify-center gap-[30px]">
                {desktopNavItems.map((item: any) => {
                  const isEarningsItem = item.label === "Earnings";

                  return (
                    <div
                      key={item.label}
                      className="relative h-full flex items-center"
                      ref={item.hasDropdown ? shopRef : null}
                      onMouseEnter={
                        item.hasDropdown ? openShopDropdown : undefined
                      }
                      onMouseLeave={
                        item.hasDropdown ? scheduleCloseShopDropdown : undefined
                      }
                    >
                      <button
                        onClick={() => {
                          if (item.hasDropdown) {
                            setIsShopDropdownOpen(!isShopDropdownOpen);
                          } else if (isEarningsItem) {
                            openEarningsPopup();
                          } else {
                            handleNavigation(item.href, item.label);
                          }
                        }}
                        className="h-full flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.025em] text-[#242424] hover:text-[#000000] transition-colors whitespace-nowrap"
                      >
                        <span>{item.label}</span>
                        {item.hasDropdown && (
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              isShopDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      {/* Shop dropdown */}
                      <AnimatePresence>
                        {item.hasDropdown && isShopDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-[760px] max-w-[calc(100vw-30px)] rounded-[8px] bg-white border border-[#E4E4E4] shadow-[0_20px_55px_rgba(0,0,0,0.13)] overflow-hidden z-50"
                            onMouseEnter={openShopDropdown}
                            onMouseLeave={scheduleCloseShopDropdown}
                          >
                            <div className="px-6 py-4 border-b border-[#ECECEC] flex items-center justify-between">
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#333333]">
                                  Shop by Category
                                </p>
                                <p className="mt-1 text-[10px] text-[#999999]">
                                  Explore our collection
                                </p>
                              </div>
                              <button
                                onClick={() => goToProducts()}
                                className="text-[10px] font-medium text-[#222222] flex items-center gap-1"
                              >
                                View All
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="p-5">
                              <div className="grid grid-cols-3 gap-3">
                                <button
                                  onClick={() => goToProducts()}
                                  className="group p-3 rounded-[7px] border border-[#E8E8E8] hover:bg-[#FAFAFA] text-left flex items-center gap-3"
                                >
                                  <div className="w-10 h-10 rounded-[6px] bg-[#F3F3F3] flex items-center justify-center shrink-0">
                                    <Package className="w-4 h-4 text-[#222222]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[12px] font-medium text-[#222222]">
                                      All Products
                                    </p>
                                    <p className="text-[9px] text-[#999999] mt-0.5 truncate">
                                      Browse our entire collection
                                    </p>
                                  </div>
                                </button>

                                <button
                                  onClick={goToNewArrivals}
                                  className="group p-3 rounded-[7px] border border-[#E8E8E8] hover:bg-[#FAFAFA] text-left flex items-center gap-3"
                                >
                                  <div className="w-10 h-10 rounded-[6px] bg-[#F3F3F3] flex items-center justify-center shrink-0">
                                    <Tag className="w-4 h-4 text-[#222222]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[12px] font-medium text-[#222222]">
                                      New Arrivals
                                    </p>
                                    <p className="text-[9px] text-[#999999] mt-0.5 truncate">
                                      Discover latest products
                                    </p>
                                  </div>
                                </button>

                                <button
                                  onClick={() => goToProducts()}
                                  className="group p-3 rounded-[7px] border border-[#E8E8E8] hover:bg-[#FAFAFA] text-left flex items-center gap-3"
                                >
                                  <div className="w-10 h-10 rounded-[6px] bg-[#F3F3F3] flex items-center justify-center shrink-0">
                                    <Grid3x3 className="w-4 h-4 text-[#222222]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[12px] font-medium text-[#222222]">
                                      Categories
                                    </p>
                                    <p className="text-[9px] text-[#999999] mt-0.5 truncate">
                                      Explore by category
                                    </p>
                                  </div>
                                </button>
                              </div>

                              {categories.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[#EEEEEE]">
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {categories.map((category: any) => (
                                      <button
                                        key={category.id}
                                        onClick={() =>
                                          goToProducts(
                                            category.slug || category.title,
                                          )
                                        }
                                        className="group flex items-center gap-3 p-2.5 rounded-[6px] hover:bg-[#FAFAFA] text-left"
                                      >
                                        <div className="relative w-10 h-10 rounded-[5px] overflow-hidden bg-[#F3F3F3] border border-[#E8E8E8] shrink-0">
                                          {category.image ? (
                                            <Image
                                              src={category.image}
                                              alt={category.title}
                                              fill
                                              sizes="40px"
                                              className="object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <Package className="w-3.5 h-3.5 text-[#8A8A8A]" />
                                            </div>
                                          )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <p className="text-[11px] font-medium text-[#2B2B2B] truncate">
                                            {category.title}
                                          </p>
                                          {category.description && (
                                            <p className="text-[9px] text-[#999999] truncate mt-0.5">
                                              {category.description}
                                            </p>
                                          )}
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="px-5 py-3.5 border-t border-[#ECECEC] bg-[#FAFAFA]">
                              <button
                                onClick={() => goToProducts()}
                                className="w-full h-9 rounded-[6px] bg-[#111111] text-white text-[11px] font-semibold flex items-center justify-center gap-2 hover:bg-[#292929]"
                              >
                                View All Categories
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* MOBILE SEARCH */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-t border-[#ECECEC] bg-[#FAFAFA] px-4 py-3 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="flex-1 h-10 flex items-center border border-[#DDDDDD] rounded-[7px] bg-white px-2.5">
                  <Search className="w-4 h-4 text-[#8E8E8E]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search ceramic"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full bg-transparent outline-none text-[12px] px-2 text-[#222222] placeholder:text-[#A4A4A4]"
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
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    disabled={!voiceSupported}
                    className={`relative p-1.5 rounded-full transition-all ${
                      isVoiceSearching
                        ? "text-red-500 bg-red-50"
                        : voiceSupported
                          ? "text-[#555555] hover:text-[#111111] hover:bg-[#F1F1F0]"
                          : "text-[#BDBDBD] cursor-not-allowed"
                    }`}
                    aria-label="Voice search"
                    title={
                      !voiceSupported
                        ? "Voice search is not supported in this browser"
                        : "Search by voice"
                    }
                  >
                    {isVoiceSearching && (
                      <motion.span
                        className="absolute inset-0.5 rounded-full border border-red-300"
                        animate={{
                          scale: [1, 1.18, 1],
                          opacity: [1, 0.3, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      />
                    )}
                    <Mic
                      className="relative w-4 h-4"
                      strokeWidth={isVoiceSearching ? 2.2 : 1.8}
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  className="h-10 px-4 bg-[#111111] text-white rounded-[7px] text-[11px] font-semibold"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-[#ECECEC] bg-[#FAFAFA] max-h-[78vh] overflow-y-auto"
            >
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5E5]">
                  <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center text-[14px] font-medium overflow-hidden">
                    {userProfilePicture ? (
                      <img
                        src={userProfilePicture}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#222222] truncate">
                      {userName}
                    </p>
                    <p className="text-[10px] text-[#888888] truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  {mobileNavItemsFinal.map((item: any) => {
                    const isEarningsItem = item.label === "Earnings";

                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => {
                            if (item.hasDropdown) {
                              setExpandedMobileCategory(
                                expandedMobileCategory === item.label
                                  ? null
                                  : item.label,
                              );
                              return;
                            }

                            if (isEarningsItem) {
                              openEarningsPopup();
                              return;
                            }

                            if (item.href === "/") return goToHome();
                            if (item.href === "/products")
                              return goToProducts();
                            if (item.href === "/collections")
                              return goToCollections();
                            if (item.href === "/profile/?tab=earnings")
                              return goToPartnerEarnings();
                            if (item.href === "/track-order")
                              return goToTrackOrder();
                            if (item.href === "/dashboard")
                              return goToDashboard();

                            router.push(item.href);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full h-11 px-3 flex items-center justify-between border-b border-[#EEEEEE] text-left"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="w-[17px] h-[17px] text-[#777777]" />
                            <span className="text-[12px] font-medium text-[#333333]">
                              {item.label}
                            </span>
                          </div>

                          {item.hasDropdown ? (
                            <ChevronDown
                              className={`w-4 h-4 text-[#999999] ${
                                expandedMobileCategory === item.label
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          ) : (
                            <ArrowRight className="w-4 h-4 text-[#BEBEBE]" />
                          )}
                        </button>

                        {item.hasDropdown &&
                          expandedMobileCategory === item.label && (
                            <div className="px-3 py-2 bg-[#F3F3F3]">
                              <button
                                onClick={() => {
                                  goToProducts();
                                  setIsMobileMenuOpen(false);
                                }}
                                className="w-full h-9 px-3 flex items-center text-[11px] text-[#444444]"
                              >
                                All Products
                              </button>

                              <button
                                onClick={goToNewArrivals}
                                className="w-full h-9 px-3 flex items-center text-[11px] text-[#444444]"
                              >
                                New Arrivals
                              </button>

                              {categories.map((cat: any) => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    goToProducts(cat.slug);
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className="w-full h-9 px-3 flex items-center text-[11px] text-[#444444]"
                                >
                                  {cat.title}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 mt-3 border-t border-[#E5E5E5] flex flex-wrap gap-2">
                  <button
                    onClick={goToProfile}
                    className="h-9 px-3 rounded-[6px] border border-[#DDDDDD] bg-white text-[11px] text-[#444444] flex items-center gap-2"
                  >
                    <UserCircle className="w-3.5 h-3.5" />
                    {isDistributor ? "Dashboard" : "My Profile"}
                  </button>

                  {isDistributor && (
                    <button
                      onClick={openEarningsPopup}
                      className="h-9 px-3 rounded-[6px] border border-[#DDDDDD] bg-white text-[11px] text-[#444444] flex items-center gap-2"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      Earnings
                    </button>
                  )}

                  <button
                    onClick={openLogoutModal}
                    className="h-9 px-3 rounded-[6px] border border-[#F0D5D5] bg-[#FFF8F8] text-[11px] text-[#B24C4C] flex items-center gap-2"
                  >
                    <LogOutIcon className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
