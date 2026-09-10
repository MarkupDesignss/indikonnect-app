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
                <div className="absolute right-4 top-4">
                  <button
                    onClick={onClose}
                    className="p-1 text-white/60 transition-colors hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

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
                      <div className="mb-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[#888888]">
                        <Wallet className="h-3 w-3" />
                        Total Earnings
                      </div>

                      <div className="text-[19px] font-semibold text-[#111111]">
                        {formatCurrency(stats.total_amount_mrp || 0)}
                      </div>
                    </div>

                    <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[#888888]">
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
                      <div className="mb-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[#888888]">
                        <ShoppingBagIcon className="h-3 w-3" />
                        Total Orders
                      </div>

                      <div className="text-[19px] font-semibold text-[#111111]">
                        {stats.total_orders || 0}
                      </div>
                    </div>

                    <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[#888888]">
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
                        <div className="text-[9px] font-medium uppercase tracking-wider text-[#888888]">
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
                      className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#111111] py-2.5 text-[11px] font-semibold text-white transition-all duration-200 hover:bg-[#292929]"
                    >
                      View Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={onClose}
                      className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2.5 text-[11px] font-medium text-[#555555] transition-all duration-200 hover:bg-[#FAFAF9]"
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

  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);

  const [expandedMobileCategory, setExpandedMobileCategory] =
    useState<string | null>(null);

  const [isEarningsPopupOpen, setIsEarningsPopupOpen] = useState(false);

  const [userType, setUserType] = useState<string | null>(null);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isDistributor, setIsDistributor] = useState(false);

  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  /* =========================================================
     REFS
  ========================================================= */

  const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profileCloseTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchCloseTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const shopCloseTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  const searchInputRef =
    useRef<HTMLInputElement>(null);

  const debounceTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const shopRef =
    useRef<HTMLDivElement>(null);

  const voiceRecognitionRef =
    useRef<SpeechRecognitionLike | null>(null);

  /* =========================================================
     API
  ========================================================= */

  const {
    data: cartData,
    isLoading: isCartLoading,
  } = useGetCartQuery();

  const {
    data: wishlistData,
  } = useGetWishlistQuery();

  const {
    data: userProfileData,
  } = useGetUserProfileQuery();

  const {
    data: categoriesData,
  } = useGetCategoriesQuery();

  const {
    data: headerData,
  } = useGetHeaderQuery();

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
      skip:
        debouncedSearchQuery.length < 1,
    },
  );

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const authToken =
      localStorage.getItem("auth_token");

    const distributorToken =
      localStorage.getItem("distributor_token");

    const type =
      localStorage.getItem("user_type");

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

    debounceTimerRef.current =
      setTimeout(() => {
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

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  /* =========================================================
     DATA VALUES
  ========================================================= */

  const cartItems =
    cartData?.data?.items || [];

  const cartCount =
    cartData?.data?.total_items || 0;

  const cartSubtotalFormatted =
    cartData?.data?.total_formatted ||
    "0.00";

  const wishlistItems =
    wishlistData?.data || [];

  const wishlistCount =
    wishlistItems.length;

  const productSuggestions =
    productsData?.data || [];

  const hasSuggestions =
    productSuggestions.length > 0;

  const isSearching =
    isProductsLoading &&
    debouncedSearchQuery.length >= 1;

  const userProfile =
    userProfileData?.user;

  const userName =
    userProfile?.full_name || "User";

  const userEmail =
    userProfile?.email || "";

  const userInitial =
    userName.charAt(0).toUpperCase();

  const userProfilePicture =
    userProfileData?.user?.profile_picture ||
    null;

  const categories =
    (categoriesData?.data || []).filter(
      (category: any) =>
        category.status === "active",
    );

  const headerMenus =
    headerData?.data?.menus || [];

  /* =========================================================
     MENU HELPERS
  ========================================================= */

  const getMenuHref = (
    slug: string,
  ) => {
    const hrefMap: {
      [key: string]: string;
    } = {
      home: "/",
      shop: "/products",
      collections: "/collections",
      "new-arrivals":
        "/products?new-arrivals=true",
      "contact-us": "/contact",
      "partner-hub":
        "/partner/dashboard",
      earnings:
        "/profile/?tab=earnings",
      products:
        "/partner/products",
    };

    return (
      hrefMap[slug] ||
      `/${slug}`
    );
  };

  const getMenuIcon = (
    title: string,
  ) => {
    const iconMap: {
      [key: string]: any;
    } = {
      Home,
      Shop: Grid3x3,
      Collections: Package,
      "New arrivals": Tag,
      "Contact us": Phone,
      "Partner Hub": Store,
      Earnings: Crown,
      Products: Package,
    };

    return (
      iconMap[title] || Tag
    );
  };

  const getRoleBasedMenus = () => {
    const baseMenus =
      headerMenus
        .filter(
          (menu: any) =>
            menu.status === true,
        )
        .map(
          (menu: any) => ({
            label: menu.title,
            href: getMenuHref(
              menu.slug,
            ),
            hasDropdown:
              menu.title ===
              "Collections",
          }),
        );

    if (isDistributor) {
      return [
        ...baseMenus,
        {
          label: "Earnings",
          href:
            "/profile/?tab=earnings",
          hasDropdown: false,
        },
      ];
    }

    return baseMenus;
  };

  const mobileNavItems =
    headerMenus
      .filter(
        (menu: any) =>
          menu.status === true,
      )
      .map(
        (menu: any) => ({
          label: menu.title,
          href: getMenuHref(
            menu.slug,
          ),
          icon: getMenuIcon(
            menu.title,
          ),
          hasDropdown:
            menu.title ===
            "Collections",
        }),
      );

  const getMobileNavItems = () => {
    if (isDistributor) {
      return [
        ...mobileNavItems,
        {
          label: "Earnings",
          href:
            "/profile/?tab=earnings",
          icon: Crown,
          hasDropdown: false,
        },
      ];
    }

    return mobileNavItems;
  };

  const desktopNavItems =
    getRoleBasedMenus();

  const mobileNavItemsFinal =
    getMobileNavItems();

  /* =========================================================
     CLOSE HEADER OVERLAYS
  ========================================================= */

  const closeHeaderOverlays =
    () => {
      setIsMobileMenuOpen(false);
      setIsSearchFocused(false);
      setIsSearchHovered(false);
      setIsSearchExpanded(false);
      setIsShopDropdownOpen(false);
      setExpandedMobileCategory(null);

      if (
        searchCloseTimer.current
      ) {
        clearTimeout(
          searchCloseTimer.current,
        );

        searchCloseTimer.current =
          null;
      }
    };

  /* =========================================================
     OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handleClickOutside =
      (event: MouseEvent) => {
        if (
          searchRef.current &&
          !searchRef.current.contains(
            event.target as Node,
          )
        ) {
          setIsSearchFocused(false);
          setIsSearchHovered(false);
          setIsSearchExpanded(false);

          if (
            searchCloseTimer.current
          ) {
            clearTimeout(
              searchCloseTimer.current,
            );

            searchCloseTimer.current =
              null;
          }
        }

        if (
          shopRef.current &&
          !shopRef.current.contains(
            event.target as Node,
          )
        ) {
          setIsShopDropdownOpen(false);

          if (
            shopCloseTimer.current
          ) {
            clearTimeout(
              shopCloseTimer.current,
            );

            shopCloseTimer.current =
              null;
          }
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  /* =========================================================
     VOICE SEARCH
  ========================================================= */

  const handleVoiceSearch =
    () => {
      if (
        typeof window ===
        "undefined"
      )
        return;

      const SpeechRecognition =
        (window as any)
          .SpeechRecognition ||
        (window as any)
          .webkitSpeechRecognition;

      if (!SpeechRecognition) {
        dispatch(
          showToast({
            message:
              "Voice search is not supported in this browser.",
            type: "error",
          }),
        );

        return;
      }

      if (isVoiceSearching) {
        try {
          voiceRecognitionRef.current?.stop();
        } catch (error) {
          console.error(
            "Unable to stop voice recognition:",
            error,
          );
        }

        setIsVoiceSearching(false);

        return;
      }

      const recognition =
        new SpeechRecognition() as SpeechRecognitionLike;

      voiceRecognitionRef.current =
        recognition;

      recognition.lang =
        "en-IN";

      recognition.continuous =
        false;

      recognition.interimResults =
        false;

      recognition.maxAlternatives =
        1;

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

      recognition.onresult = (
        event,
      ) => {
        const transcript =
          event.results?.[0]?.[0]
            ?.transcript?.trim() || "";

        if (transcript) {
          setSearchQuery(
            transcript,
          );

          setDebouncedSearchQuery(
            transcript,
          );

          setIsSearchOpen(true);
          setIsSearchExpanded(true);
          setIsSearchFocused(true);
          setIsSearchHovered(true);

          setTimeout(() => {
            const input =
              searchInputRef.current;

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

      recognition.onerror = (
        event,
      ) => {
        console.error(
          "Voice search error:",
          event.error,
        );

        setIsVoiceSearching(false);

        if (
          event.error ===
          "aborted"
        )
          return;

        let message =
          "Unable to hear you. Please try again.";

        if (
          event.error ===
          "not-allowed"
        ) {
          message =
            "Please allow microphone permission for voice search.";
        } else if (
          event.error ===
          "no-speech"
        ) {
          message =
            "No speech detected. Please try again.";
        } else if (
          event.error ===
          "audio-capture"
        ) {
          message =
            "No microphone was found on this device.";
        } else if (
          event.error ===
          "network"
        ) {
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
        voiceRecognitionRef.current =
          null;
      };

      try {
        recognition.start();
      } catch (error) {
        console.error(
          "Unable to start voice search:",
          error,
        );

        setIsVoiceSearching(false);
        voiceRecognitionRef.current =
          null;

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

      voiceRecognitionRef.current =
        null;
    };
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToHome = () => {
    router.push("/");
    closeHeaderOverlays();
  };

  const goToProducts = (
    category?: string,
  ) => {
    let url = "/products";

    if (
      category &&
      category !== "all"
    ) {
      const params =
        new URLSearchParams();

      params.append(
        "category",
        category,
      );

      url += `?${params.toString()}`;
    }

    router.push(url);
    closeHeaderOverlays();
  };

  const goToNewArrivals = () => {
    router.push(
      "/products?new-arrivals=true",
    );

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

  const goToCollections = () => {
    router.push("/collections");
    closeHeaderOverlays();
  };

  const goToTrackOrder = () => {
    router.push("/track-order");
    closeHeaderOverlays();
  };

  const goToDashboard = () => {
    router.push("/dashboard");
    closeHeaderOverlays();
  };

  const goToPartnerEarnings =
    () => {
      router.push(
        "/profile/?tab=earnings",
      );

      closeHeaderOverlays();
    };

  const goToProfile = () => {
    const distributorToken =
      localStorage.getItem(
        "distributor_token",
      );

    const storedUserType =
      localStorage.getItem(
        "user_type",
      );

    const distributor =
      !!distributorToken &&
      storedUserType ===
        "distributor";

    if (distributor) {
      router.push(
        "/distributor/dashboard/",
      );
    } else {
      router.push("/profile/");
    }

    setIsProfileOpen(false);
    closeHeaderOverlays();
  };

  const goToProductDetail = (
    slug: string,
  ) => {
    router.push(
      `/product/${slug}`,
    );

    setSearchQuery("");
    setDebouncedSearchQuery("");

    closeHeaderOverlays();
  };

  const handleNavigation = (
    href: string,
    label?: string,
  ) => {
    if (
      label === "New arrivals" ||
      href.includes(
        "new-arrivals",
      )
    ) {
      goToNewArrivals();
    } else if (
      label === "Earnings" ||
      href ===
        "/profile/?tab=earnings"
    ) {
      openEarningsPopup();
    } else if (
      href === "/"
    ) {
      goToHome();
    } else if (
      href === "/products"
    ) {
      goToProducts();
    } else if (
      href === "/collections"
    ) {
      goToCollections();
    } else if (
      href === "/track-order"
    ) {
      goToTrackOrder();
    } else if (
      href === "/dashboard"
    ) {
      goToDashboard();
    } else if (
      href ===
      "/partner/dashboard"
    ) {
      goToDashboard();
    } else {
      router.push(href);
      closeHeaderOverlays();
    }
  };

  /* =========================================================
     EARNINGS
  ========================================================= */

  const openEarningsPopup =
    () => {
      if (!isDistributor) return;

      refetchDistributorStats();

      setIsEarningsPopupOpen(
        true,
      );

      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
    };

  const closeEarningsPopup =
    () => {
      setIsEarningsPopupOpen(
        false,
      );
    };

  const goToEarningsDetails =
    () => {
      setIsEarningsPopupOpen(
        false,
      );

      router.push(
        "/profile/?tab=earnings",
      );

      closeHeaderOverlays();
    };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogoutConfirm =
    async () => {
      setIsLoggingOut(true);

      try {
        await logout({
          callApi: true,
          clearReduxState: true,
          clearPersistedState:
            true,

          onSuccess: () => {
            dispatch(
              showToast({
                message:
                  "Successfully logged out! See you soon",
                type: "success",
              }),
            );

            setIsLoggingOut(false);
            setShowLogoutModal(
              false,
            );

            setIsProfileOpen(false);
            setIsMobileMenuOpen(
              false,
            );

            setIsEarningsPopupOpen(
              false,
            );
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
            setShowLogoutModal(
              false,
            );
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
        setShowLogoutModal(
          false,
        );
      }
    };

  const openLogoutModal =
    () => {
      setShowLogoutModal(true);
      setIsProfileOpen(false);
    };

  const closeLogoutModal =
    () => {
      if (!isLoggingOut) {
        setShowLogoutModal(false);
      }
    };

  /* =========================================================
     DROPDOWNS
  ========================================================= */

  const openCartDropdown =
    () => {
      if (
        cartCloseTimer.current
      ) {
        clearTimeout(
          cartCloseTimer.current,
        );
      }

      setIsCartOpen(true);
    };

  const scheduleCloseCartDropdown =
    () => {
      if (
        cartCloseTimer.current
      ) {
        clearTimeout(
          cartCloseTimer.current,
        );
      }

      cartCloseTimer.current =
        setTimeout(() => {
          setIsCartOpen(false);
        }, 200);
    };

  const openProfileDropdown =
    () => {
      if (
        profileCloseTimer.current
      ) {
        clearTimeout(
          profileCloseTimer.current,
        );
      }

      setIsProfileOpen(true);
    };

  const scheduleCloseProfileDropdown =
    () => {
      if (
        profileCloseTimer.current
      ) {
        clearTimeout(
          profileCloseTimer.current,
        );
      }

      profileCloseTimer.current =
        setTimeout(() => {
          setIsProfileOpen(false);
        }, 200);
    };

  const openShopDropdown =
    () => {
      if (
        shopCloseTimer.current
      ) {
        clearTimeout(
          shopCloseTimer.current,
        );
      }

      setIsShopDropdownOpen(
        true,
      );
    };

  const scheduleCloseShopDropdown =
    () => {
      if (
        shopCloseTimer.current
      ) {
        clearTimeout(
          shopCloseTimer.current,
        );
      }

      shopCloseTimer.current =
        setTimeout(() => {
          setIsShopDropdownOpen(
            false,
          );
        }, 300);
    };

  /* =========================================================
     SEARCH
  ========================================================= */

  const openSearchOnHover =
    () => {
      if (
        searchCloseTimer.current
      ) {
        clearTimeout(
          searchCloseTimer.current,
        );

        searchCloseTimer.current =
          null;
      }

      setIsSearchHovered(true);
      setIsSearchExpanded(true);

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    };

  const scheduleCloseSearchOnHover =
    () => {
      if (
        searchCloseTimer.current
      ) {
        clearTimeout(
          searchCloseTimer.current,
        );

        searchCloseTimer.current =
          null;
      }

      if (!isSearchFocused) {
        searchCloseTimer.current =
          setTimeout(() => {
            setIsSearchHovered(
              false,
            );

            setIsSearchExpanded(
              false,
            );

            searchCloseTimer.current =
              null;
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

        setIsVoiceSearching(
          false,
        );
      }

      setIsSearchExpanded(
        false,
      );

      setIsSearchFocused(
        false,
      );

      setIsSearchHovered(
        false,
      );

      setIsSearchOpen(false);

      setSearchQuery("");
      setDebouncedSearchQuery(
        "",
      );

      if (
        searchCloseTimer.current
      ) {
        clearTimeout(
          searchCloseTimer.current,
        );

        searchCloseTimer.current =
          null;
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

    if (!searchQuery.trim())
      return;

    const params =
      new URLSearchParams();

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
    setDebouncedSearchQuery(
      "",
    );

    closeHeaderOverlays();
  };

  /* =========================================================
     PROFILE MENU
  ========================================================= */

  const getProfileMenuItems =
    () => {
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
          onClick:
            openEarningsPopup,
        });
      }

      items.push({
        icon: LogOutIcon,
        label: "Logout",
        onClick:
          openLogoutModal,
        isDanger: true,
      });

      return items;
    };

  const profileMenuItems =
    getProfileMenuItems();

  const earningsStats =
    distributorStats?.data ||
    null;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* MODALS */}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={
          handleLogoutConfirm
        }
        isLoading={isLoggingOut}
      />

      <EarningsPopup
        isOpen={
          isEarningsPopupOpen
        }
        onClose={
          closeEarningsPopup
        }
        onViewDetails={
          goToEarningsDetails
        }
        stats={earningsStats}
        isLoading={
          isDistributorStatsLoading
        }
      />

      {/* =====================================================
          MAIN HEADER WRAPPER
          BLACK BAR + HEADER + NAV
          EVERYTHING STICKY TOGETHER
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
                Cashback via Scratch Card on transaction via
                MobiKwik UPI. T&C Apply*.{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Cashback via Scratch Card on transaction via
                MobiKwik UPI. T&C Apply*.{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Cashback via Scratch Card on transaction via
                MobiKwik UPI. T&C Apply*.{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Cashback via Scratch Card on transaction via
                MobiKwik UPI. T&C Apply*.{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Cashback via Scratch Card on transaction via
                MobiKwik UPI. T&C Apply*.{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Cashback via Scratch Card on transaction via
                MobiKwik UPI. T&C Apply*.{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Cashback via Scratch Card on transaction via
                MobiKwik UPI. T&C Apply*.
              </motion.div>
            </div>
          </div>
        )}

      <div
        className={`sticky top-0 z-40 w-full bg-white font-serif transition-shadow duration-300 ${
          isScrolled
            ? "shadow-[0_6px_24px_rgba(0,0,0,0.09)]"
            : "shadow-sm"
        }`}
      >
    
        {/* ===================================================
            2. MAIN HEADER ROW
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
                onMouseEnter={
                  openSearchOnHover
                }
                onMouseLeave={
                  scheduleCloseSearchOnHover
                }
              >
                <form
                  onSubmit={handleSearch}
                >
                  <div
                    className={`flex h-[40px] w-full items-center rounded-[10px] bg-[#FAFAFA] transition-all duration-200 sm:h-[42px] ${
                      isSearchFocused ||
                      isSearchExpanded
                        ? "bg-white ring-1 ring-[#111111]/10"
                        : "border border-gray-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={
                        toggleSearch
                      }
                      className="flex h-full w-10 shrink-0 items-center justify-center text-[#222222] hover:text-black"
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
                        setSearchQuery(
                          e.target.value,
                        )
                      }
                      onFocus={() => {
                        setIsSearchFocused(
                          true,
                        );

                        setIsSearchHovered(
                          true,
                        );

                        setIsSearchExpanded(
                          true,
                        );

                        if (
                          searchCloseTimer.current
                        ) {
                          clearTimeout(
                            searchCloseTimer.current,
                          );

                          searchCloseTimer.current =
                            null;
                        }
                      }}
                      className="h-full min-w-0 flex-1 bg-transparent pr-2 text-[12px] text-[#1B1B1B] outline-none placeholder:text-[#A6A6A6] sm:text-[13px]"
                    />

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery(
                            "",
                          );

                          setDebouncedSearchQuery(
                            "",
                          );
                        }}
                        className="mr-2 p-1 text-[#8E8E8E] hover:text-[#111111]"
                        aria-label="Clear search"
                      >
                        <X className="h-[14px] w-[14px]" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleVoiceSearch
                      }
                      disabled={
                        !voiceSupported
                      }
                      className={`relative flex h-full w-10 shrink-0 items-center justify-center rounded-r-[10px] transition-all duration-200 ${
                        isVoiceSearching
                          ? "bg-red-50 text-red-500"
                          : voiceSupported
                            ? "text-[#2E2E2E] hover:bg-[#F0F0EE] hover:text-[#111111]"
                            : "cursor-not-allowed text-[#BDBDBD]"
                      }`}
                      aria-label={
                        isVoiceSearching
                          ? "Stop voice search"
                          : "Voice search"
                      }
                    >
                      {isVoiceSearching && (
                        <motion.span
                          className="absolute inset-1 rounded-full border border-red-300"
                          animate={{
                            scale: [
                              1,
                              1.12,
                              1,
                            ],
                            opacity: [
                              0.8,
                              0.25,
                              0.8,
                            ],
                          }}
                          transition={{
                            duration: 1.1,
                            repeat:
                              Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}

                      <motion.div
                        animate={
                          isVoiceSearching
                            ? {
                                scale: [
                                  1,
                                  1.14,
                                  1,
                                ],
                              }
                            : {
                                scale: 1,
                              }
                        }
                        transition={{
                          duration: 0.8,
                          repeat:
                            isVoiceSearching
                              ? Infinity
                              : 0,
                        }}
                      >
                        <Mic
                          className="relative h-[16px] w-[16px]"
                          strokeWidth={
                            isVoiceSearching
                              ? 2.2
                              : 1.7
                          }
                        />
                      </motion.div>
                    </button>
                  </div>
                </form>

                {/* SEARCH SUGGESTIONS */}

                <AnimatePresence>
                  {isSearchExpanded &&
                    (searchQuery.length >=
                      1 ||
                      isSearching) && (
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
                        transition={{
                          duration: 0.15,
                        }}
                        className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[10px] border border-[#E4E4E4] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)]"
                      >
                        {isSearching && (
                          <div className="flex items-center justify-center py-7">
                            <Loader2 className="h-5 w-5 animate-spin text-[#111111]" />

                            <span className="ml-2 text-[12px] text-[#888888]">
                              Searching
                              products...
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
                                  (
                                    product: any,
                                  ) => (
                                    <button
                                      key={
                                        product.id
                                      }
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
                                          alt={
                                            product.name
                                          }
                                          fill
                                          sizes="40px"
                                          className="object-cover"
                                        />
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-[12px] text-[#222222]">
                                          {
                                            product.name
                                          }
                                        </p>

                                        <p className="mt-0.5 text-[11px] font-semibold text-[#111111]">
                                          {product.retail_price_formatted ||
                                            "₹0.00"}
                                        </p>
                                      </div>

                                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#BDBDBD]" />
                                    </button>
                                  ),
                                )}
                              </div>

                              {productSuggestions.length ===
                                5 && (
                                <button
                                  onClick={() => {
                                    const params =
                                      new URLSearchParams();

                                    params.append(
                                      "search",
                                      searchQuery,
                                    );

                                    if (
                                      searchCategory &&
                                      searchCategory !==
                                        "all"
                                    ) {
                                      params.append(
                                        "category",
                                        searchCategory,
                                      );
                                    }

                                    router.push(
                                      `/products?${params.toString()}`,
                                    );

                                    setSearchQuery(
                                      "",
                                    );

                                    setDebouncedSearchQuery(
                                      "",
                                    );

                                    closeHeaderOverlays();
                                  }}
                                  className="mt-2.5 h-9 w-full rounded-[6px] bg-[#111111] text-[11px] font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
                                >
                                  View all products
                                </button>
                              )}
                            </div>
                          )}

                        {!isSearching &&
                          debouncedSearchQuery.length >=
                            1 &&
                          !hasSuggestions && (
                            <div className="px-4 py-9 text-center">
                              <PackageOpen className="mx-auto h-9 w-9 text-[#D8D8D8]" />

                              <p className="mt-3 text-[12px] font-medium text-[#222222]">
                                No products found
                              </p>

                              <p className="mt-1 text-[10px] text-[#8B8B8B]">
                                No products
                                match "
                                {
                                  searchQuery
                                }
                                "
                              </p>
                            </div>
                          )}

                        <div className="flex items-center justify-between border-t border-[#EEEEEE] px-3 py-2 text-[9px] text-[#9A9A9A]">
                          <span>
                            {debouncedSearchQuery.length >=
                            1
                              ? `Showing ${productSuggestions.length} results`
                              : "Start typing to search"}
                          </span>

                          <span>
                            Press Enter to
                            search all
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
                  onMouseEnter={
                    openProfileDropdown
                  }
                  onMouseLeave={
                    scheduleCloseProfileDropdown
                  }
                >
                  <button
                    onClick={
                      goToProfile
                    }
                    className="flex h-[56px] min-w-[66px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626] transition-colors hover:text-black"
                    aria-label="Account"
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
                        transition={{
                          duration: 0.15,
                        }}
                        className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-[8px] border border-[#E4E4E4] bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)]"
                        onMouseEnter={
                          openProfileDropdown
                        }
                        onMouseLeave={
                          scheduleCloseProfileDropdown
                        }
                      >
                        <div className="flex items-center gap-3 border-b border-[#ECECEC] px-5 py-4">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-[14px] font-medium text-white">
                            {userProfilePicture ? (
                              <img
                                src={
                                  userProfilePicture
                                }
                                alt={
                                  userName
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              userInitial
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#171717]">
                              {
                                userName
                              }
                            </p>

                            <p className="truncate text-[10px] text-[#888888]">
                              {
                                userEmail
                              }
                            </p>
                          </div>
                        </div>

                        <div className="py-1">
                          {profileMenuItems.map(
                            (
                              item: any,
                            ) => (
                              <button
                                key={
                                  item.label
                                }
                                onClick={
                                  item.onClick
                                }
                                className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-[12px] transition-colors ${
                                  item.isDanger
                                    ? "mt-1 border-t border-[#EEEEEE] pt-3 text-[#B24C4C] hover:bg-[#FFF7F7]"
                                    : "text-[#4B4B4B] hover:bg-[#FAFAFA]"
                                }`}
                              >
                                <item.icon className="h-4 w-4" />
                                {
                                  item.label
                                }
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
                  onClick={
                    goToWishlist
                  }
                  className="relative flex h-[56px] min-w-[66px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626] transition-colors hover:text-black"
                  aria-label="Wishlist"
                >
                  <span className="relative">
                    <Heart
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.5}
                    />

                    {wishlistCount >
                      0 && (
                      <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#111111] text-[8px] font-semibold text-white">
                        {
                          wishlistCount
                        }
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
                  onMouseEnter={
                    openCartDropdown
                  }
                  onMouseLeave={
                    scheduleCloseCartDropdown
                  }
                >
                  <button
                    onClick={
                      goToCart
                    }
                    className="relative flex h-[56px] min-w-[66px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626] transition-colors hover:text-black"
                    aria-label="Cart"
                  >
                    <span className="relative">
                      <ShoppingBag
                        className="h-[18px] w-[18px]"
                        strokeWidth={1.5}
                      />

                      {cartCount >
                        0 && (
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#111111] text-[8px] font-semibold text-white">
                          {
                            cartCount
                          }
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
                        transition={{
                          duration: 0.15,
                        }}
                        className="absolute right-0 top-full z-50 mt-1 w-[380px] overflow-hidden rounded-[8px] border border-[#E4E4E4] bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)]"
                        onMouseEnter={
                          openCartDropdown
                        }
                        onMouseLeave={
                          scheduleCloseCartDropdown
                        }
                      >
                        <div className="flex items-center justify-between border-b border-[#ECECEC] px-5 py-4">
                          <div>
                            <span className="text-[14px] font-semibold text-[#171717]">
                              Your Cart
                            </span>

                            {cartCount >
                              0 && (
                              <span className="mt-0.5 block text-[11px] text-[#888888]">
                                {
                                  cartCount
                                }{" "}
                                {cartCount ===
                                1
                                  ? "item"
                                  : "items"}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              setIsCartOpen(
                                false,
                              )
                            }
                            className="p-1 text-[#888888] hover:text-[#111111]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {isCartLoading ? (
                          <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-[#111111]" />
                          </div>
                        ) : cartItems.length ===
                          0 ? (
                          <div className="px-6 py-12 text-center">
                            <PackageOpen className="mx-auto h-10 w-10 text-[#D8D8D8]" />

                            <p className="mt-3 text-[13px] font-medium text-[#222222]">
                              Your cart
                              is empty
                            </p>

                            <p className="mt-1 text-[10px] text-[#888888]">
                              Discover
                              our
                              products
                            </p>

                            <button
                              onClick={() => {
                                setIsCartOpen(
                                  false,
                                );

                                goToProducts();
                              }}
                              className="mt-4 h-9 rounded-[6px] bg-[#111111] px-5 text-[11px] font-semibold text-white"
                            >
                              Start
                              Shopping
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="max-h-80 divide-y divide-[#EEEEEE] overflow-y-auto">
                              {cartItems.map(
                                (
                                  item: any,
                                ) => (
                                  <div
                                    key={
                                      item.id
                                    }
                                    className="flex items-center gap-3 px-4 py-3"
                                  >
                                    <Link
                                      href={`/product/${
                                        item
                                          .product
                                          ?.slug ||
                                        item.product_id
                                      }`}
                                      onClick={() =>
                                        setIsCartOpen(
                                          false,
                                        )
                                      }
                                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[6px] border border-[#E8E8E8] bg-[#F4F4F4]"
                                    >
                                      <Image
                                        src={
                                          item.image_url ||
                                          "/indiekonnect-web/images/placeholder.jpg"
                                        }
                                        alt={
                                          item
                                            .product
                                            ?.name ||
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
                                          item
                                            .product
                                            ?.slug ||
                                          item.product_id
                                        }`}
                                        onClick={() =>
                                          setIsCartOpen(
                                            false,
                                          )
                                        }
                                        className="block truncate text-[12px] font-medium text-[#171717]"
                                      >
                                        {
                                          item
                                            .product
                                            ?.name ||
                                          "Product"
                                        }
                                      </Link>

                                      <div className="mt-1 flex items-center gap-2">
                                        <span className="text-[12px] font-semibold text-[#111111]">
                                          ₹
                                          {item.current_unit_price_formatted ||
                                            item.current_unit_price}
                                        </span>

                                        <span className="text-[10px] text-[#999999]">
                                          ×{" "}
                                          {
                                            item.quantity
                                          }
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
                                  ₹
                                  {
                                    cartSubtotalFormatted
                                  }
                                </span>
                              </div>

                              <button
                                onClick={
                                  goToCart
                                }
                                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-[#111111] text-[11px] font-semibold text-white hover:bg-[#292929]"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />

                                View Cart
                              </button>
                            </div>
                          </>
                        )}

                        <div className="border-t border-[#ECECEC] bg-[#FAFAFA] px-5 py-2.5 text-center">
                          <span className="text-[9px] text-[#999999]">
                            Every order
                            supports
                            artisan
                            communities
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* TRACK ORDER */}

                <button
                  onClick={
                    goToTrackOrder
                  }
                  className="flex h-[56px] min-w-[82px] flex-col items-center justify-center gap-1 px-2.5 text-[#262626] transition-colors hover:text-black"
                  aria-label="Track Order"
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
                  onClick={
                    toggleSearch
                  }
                  className="p-2 text-[#222222]"
                  aria-label="Search"
                >
                  <Search className="h-[18px] w-[18px]" />
                </button>

                <button
                  onClick={
                    goToWishlist
                  }
                  className="relative p-2 text-[#222222]"
                  aria-label="Wishlist"
                >
                  <Heart className="h-[18px] w-[18px]" />

                  {wishlistCount >
                    0 && (
                    <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#111111] text-[7px] text-white">
                      {
                        wishlistCount
                      }
                    </span>
                  )}
                </button>

                <button
                  onClick={
                    goToCart
                  }
                  className="relative p-2 text-[#222222]"
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-[18px] w-[18px]" />

                  {cartCount >
                    0 && (
                    <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#111111] text-[7px] text-white">
                      {
                        cartCount
                      }
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
                    aria-label="Toggle menu"
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
            3. MOBILE SEARCH
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
                onSubmit={
                  handleSearch
                }
                className="flex items-center gap-2"
              >
                <div className="flex h-10 flex-1 items-center rounded-[10px] bg-white px-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                  <Search className="h-4 w-4 text-[#8E8E8E]" />

                  <input
                    type="text"
                    placeholder="Search ceramic"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value,
                      )
                    }
                    className="h-full w-full bg-transparent px-2 text-[12px] text-[#222222] outline-none placeholder:text-[#A4A4A4]"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(
                          "",
                        );

                        setDebouncedSearchQuery(
                          "",
                        );
                      }}
                      className="text-[#888888]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleVoiceSearch
                    }
                    disabled={
                      !voiceSupported
                    }
                    className={`relative rounded-full p-1.5 transition-all ${
                      isVoiceSearching
                        ? "bg-red-50 text-red-500"
                        : voiceSupported
                          ? "text-[#555555] hover:bg-[#F1F1F0] hover:text-[#111111]"
                          : "cursor-not-allowed text-[#BDBDBD]"
                    }`}
                    aria-label="Voice search"
                  >
                    {isVoiceSearching && (
                      <motion.span
                        className="absolute inset-0.5 rounded-full border border-red-300"
                        animate={{
                          scale: [
                            1,
                            1.18,
                            1,
                          ],
                          opacity: [
                            1,
                            0.3,
                            1,
                          ],
                        }}
                        transition={{
                          duration: 1,
                          repeat:
                            Infinity,
                        }}
                      />
                    )}

                    <Mic
                      className="relative h-4 w-4"
                      strokeWidth={
                        isVoiceSearching
                          ? 2.2
                          : 1.8
                      }
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  className="h-10 rounded-[10px] bg-[#111111] px-4 text-[11px] font-semibold text-white shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            4. DESKTOP NAVIGATION
            SAME STICKY WRAPPER
        =================================================== */}

        {!hideMenu && (
          <div className="hidden border-t border-b border-[#E5E5E5] bg-white lg:block">
            <div className="mx-auto max-w-[1120px] px-4">
              <nav className="flex h-[49px] items-center justify-center gap-[30px]">
                {desktopNavItems.map(
                  (item: any) => {
                    const isEarningsItem =
                      item.label ===
                      "Earnings";

                    return (
                      <div
                        key={
                          item.label
                        }
                        className="relative flex h-full items-center"
                        ref={
                          item.hasDropdown
                            ? shopRef
                            : null
                        }
                        onMouseEnter={
                          item.hasDropdown
                            ? openShopDropdown
                            : undefined
                        }
                        onMouseLeave={
                          item.hasDropdown
                            ? scheduleCloseShopDropdown
                            : undefined
                        }
                      >
                        <button
                          onClick={() => {
                            if (
                              item.hasDropdown
                            ) {
                              setIsShopDropdownOpen(
                                !isShopDropdownOpen,
                              );
                            } else if (
                              isEarningsItem
                            ) {
                              openEarningsPopup();
                            } else {
                              handleNavigation(
                                item.href,
                                item.label,
                              );
                            }
                          }}
                          className="flex h-full items-center gap-2 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.025em] text-[#242424] transition-colors hover:text-black"
                        >
                          <span>
                            {
                              item.label
                            }
                          </span>

                          {item.hasDropdown && (
                            <ChevronDown
                              className={`ml-1 h-3 w-3 transition-transform ${
                                isShopDropdownOpen
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          )}
                        </button>

                        {/* COLLECTION DROPDOWN */}

                        <AnimatePresence>
                          {item.hasDropdown &&
                            isShopDropdownOpen && (
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  y: -8,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  y: -8,
                                }}
                                transition={{
                                  duration: 0.15,
                                }}
                                className="absolute left-1/2 top-full z-50 mt-0 w-[760px] max-w-[calc(100vw-30px)] -translate-x-1/2 overflow-hidden rounded-[8px] border border-[#E4E4E4] bg-white shadow-[0_20px_55px_rgba(0,0,0,0.13)]"
                                onMouseEnter={
                                  openShopDropdown
                                }
                                onMouseLeave={
                                  scheduleCloseShopDropdown
                                }
                              >
                                <div className="flex items-center justify-between border-b border-[#ECECEC] px-6 py-4">
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#333333]">
                                      Shop by
                                      Category
                                    </p>

                                    <p className="mt-1 text-[10px] text-[#999999]">
                                      Explore
                                      our
                                      collection
                                    </p>
                                  </div>

                                  <button
                                    onClick={() =>
                                      goToProducts()
                                    }
                                    className="flex items-center gap-1 text-[10px] font-medium text-[#222222]"
                                  >
                                    View All
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <div className="p-5">
                                  <div className="grid grid-cols-3 gap-3">

                                    {/* ALL PRODUCTS */}

                                    <button
                                      onClick={() =>
                                        goToProducts()
                                      }
                                      className="group flex items-center gap-3 rounded-[7px] border border-[#E8E8E8] p-3 text-left hover:bg-[#FAFAFA]"
                                    >
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[#F3F3F3]">
                                        <Package className="h-4 w-4 text-[#222222]" />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="text-[12px] font-medium text-[#222222]">
                                          All
                                          Products
                                        </p>

                                        <p className="mt-0.5 truncate text-[9px] text-[#999999]">
                                          Browse
                                          our
                                          entire
                                          collection
                                        </p>
                                      </div>
                                    </button>

                                    {/* NEW ARRIVALS */}

                                    <button
                                      onClick={
                                        goToNewArrivals
                                      }
                                      className="group flex items-center gap-3 rounded-[7px] border border-[#E8E8E8] p-3 text-left hover:bg-[#FAFAFA]"
                                    >
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[#F3F3F3]">
                                        <Tag className="h-4 w-4 text-[#222222]" />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="text-[12px] font-medium text-[#222222]">
                                          New
                                          Arrivals
                                        </p>

                                        <p className="mt-0.5 truncate text-[9px] text-[#999999]">
                                          Discover
                                          latest
                                          products
                                        </p>
                                      </div>
                                    </button>

                                    {/* CATEGORIES */}

                                    <button
                                      onClick={() =>
                                        goToProducts()
                                      }
                                      className="group flex items-center gap-3 rounded-[7px] border border-[#E8E8E8] p-3 text-left hover:bg-[#FAFAFA]"
                                    >
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[#F3F3F3]">
                                        <Grid3x3 className="h-4 w-4 text-[#222222]" />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="text-[12px] font-medium text-[#222222]">
                                          Categories
                                        </p>

                                        <p className="mt-0.5 truncate text-[9px] text-[#999999]">
                                          Explore
                                          by
                                          category
                                        </p>
                                      </div>
                                    </button>
                                  </div>

                                  {categories.length >
                                    0 && (
                                    <div className="mt-4 border-t border-[#EEEEEE] pt-4">
                                      <div className="grid grid-cols-3 gap-1.5">
                                        {categories.map(
                                          (
                                            category: any,
                                          ) => (
                                            <button
                                              key={
                                                category.id
                                              }
                                              onClick={() =>
                                                goToProducts(
                                                  category.slug ||
                                                    category.title,
                                                )
                                              }
                                              className="group flex items-center gap-3 rounded-[6px] p-2.5 text-left hover:bg-[#FAFAFA]"
                                            >
                                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[5px] border border-[#E8E8E8] bg-[#F3F3F3]">
                                                {category.image ? (
                                                  <Image
                                                    src={
                                                      category.image
                                                    }
                                                    alt={
                                                      category.title
                                                    }
                                                    fill
                                                    sizes="40px"
                                                    className="object-cover"
                                                  />
                                                ) : (
                                                  <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-3.5 w-3.5 text-[#8A8A8A]" />
                                                  </div>
                                                )}
                                              </div>

                                              <div className="min-w-0 flex-1">
                                                <p className="truncate text-[11px] font-medium text-[#2B2B2B]">
                                                  {
                                                    category.title
                                                  }
                                                </p>

                                                {category.description && (
                                                  <p className="mt-0.5 truncate text-[9px] text-[#999999]">
                                                    {
                                                      category.description
                                                    }
                                                  </p>
                                                )}
                                              </div>
                                            </button>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="border-t border-[#ECECEC] bg-[#FAFAFA] px-5 py-3.5">
                                  <button
                                    onClick={() =>
                                      goToProducts()
                                    }
                                    className="flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-[#111111] text-[11px] font-semibold text-white hover:bg-[#292929]"
                                  >
                                    View All
                                    Categories
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            )}
                        </AnimatePresence>
                      </div>
                    );
                  },
                )}
              </nav>
            </div>
          </div>
        )}

        {/* ===================================================
            5. MOBILE MENU
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
                        src={
                          userProfilePicture
                        }
                        alt={
                          userName
                        }
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

                {/* NAV ITEMS */}

                <div className="pt-3">
                  {mobileNavItemsFinal.map(
                    (item: any) => {
                      const isEarningsItem =
                        item.label ===
                        "Earnings";

                      return (
                        <div
                          key={
                            item.label
                          }
                        >
                          <button
                            onClick={() => {
                              if (
                                item.hasDropdown
                              ) {
                                setExpandedMobileCategory(
                                  expandedMobileCategory ===
                                    item.label
                                    ? null
                                    : item.label,
                                );

                                return;
                              }

                              if (
                                isEarningsItem
                              ) {
                                openEarningsPopup();

                                return;
                              }

                              if (
                                item.href ===
                                "/"
                              ) {
                                goToHome();

                                return;
                              }

                              if (
                                item.href ===
                                "/products"
                              ) {
                                goToProducts();

                                return;
                              }

                              if (
                                item.href ===
                                "/collections"
                              ) {
                                goToCollections();

                                return;
                              }

                              if (
                                item.href ===
                                "/profile/?tab=earnings"
                              ) {
                                goToPartnerEarnings();

                                return;
                              }

                              if (
                                item.href ===
                                "/track-order"
                              ) {
                                goToTrackOrder();

                                return;
                              }

                              if (
                                item.href ===
                                "/dashboard"
                              ) {
                                goToDashboard();

                                return;
                              }

                              router.push(
                                item.href,
                              );

                              setIsMobileMenuOpen(
                                false,
                              );
                            }}
                            className="flex h-11 w-full items-center justify-between border-b border-[#EEEEEE] px-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-[17px] w-[17px] text-[#777777]" />

                              <span className="text-[12px] font-medium text-[#333333]">
                                {
                                  item.label
                                }
                              </span>
                            </div>

                            {item.hasDropdown ? (
                              <ChevronDown
                                className={`h-4 w-4 text-[#999999] transition-transform ${
                                  expandedMobileCategory ===
                                  item.label
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            ) : (
                              <ArrowRight className="h-4 w-4 text-[#BEBEBE]" />
                            )}
                          </button>

                          {/* MOBILE CATEGORY */}

                          {item.hasDropdown &&
                            expandedMobileCategory ===
                              item.label && (
                              <div className="bg-[#F3F3F3] px-3 py-2">

                                <button
                                  onClick={() => {
                                    goToProducts();

                                    setIsMobileMenuOpen(
                                      false,
                                    );
                                  }}
                                  className="flex h-9 w-full items-center px-3 text-[11px] text-[#444444]"
                                >
                                  All Products
                                </button>

                                <button
                                  onClick={
                                    goToNewArrivals
                                  }
                                  className="flex h-9 w-full items-center px-3 text-[11px] text-[#444444]"
                                >
                                  New Arrivals
                                </button>

                                {categories.map(
                                  (
                                    cat: any,
                                  ) => (
                                    <button
                                      key={
                                        cat.id
                                      }
                                      onClick={() => {
                                        goToProducts(
                                          cat.slug,
                                        );

                                        setIsMobileMenuOpen(
                                          false,
                                        );
                                      }}
                                      className="flex h-9 w-full items-center px-3 text-[11px] text-[#444444]"
                                    >
                                      {
                                        cat.title
                                      }
                                    </button>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      );
                    },
                  )}
                </div>

                {/* PROFILE ACTIONS */}

                <div className="mt-3 flex flex-wrap gap-2 border-t border-[#E5E5E5] pt-4">

                  <button
                    onClick={
                      goToProfile
                    }
                    className="flex h-9 items-center gap-2 rounded-[6px] border border-[#DDDDDD] bg-white px-3 text-[11px] text-[#444444]"
                  >
                    <UserCircle className="h-3.5 w-3.5" />

                    {isDistributor
                      ? "Dashboard"
                      : "My Profile"}
                  </button>

                  {isDistributor && (
                    <button
                      onClick={
                        openEarningsPopup
                      }
                      className="flex h-9 items-center gap-2 rounded-[6px] border border-[#DDDDDD] bg-white px-3 text-[11px] text-[#444444]"
                    >
                      <Crown className="h-3.5 w-3.5" />

                      Earnings
                    </button>
                  )}

                  <button
                    onClick={
                      openLogoutModal
                    }
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