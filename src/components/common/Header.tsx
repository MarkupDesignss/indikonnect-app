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
  Sparkles,
  Phone,
  Store,
  Crown,
  Wallet,
  TrendingUp,
  ShoppingBag as ShoppingBagIcon,
  Award,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Logo from "../../../public/indiekonnect-web/images/logo.png";
import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "../../lib/slices/toastSlice";
import { useGetCartQuery } from "@/lib/redux/api/cartApi";
import { useGetWishlistQuery } from "@/lib/redux/api/Wishlist/wishlistApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useGetDistributorStatsQuery, useGetHeaderQuery } from "@/lib/redux/api/headerApi";


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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
              {/* Header */}
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

              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 className="w-7 h-7 text-[#111111] animate-spin" />
                </div>
              ) : stats ? (
                <div className="p-5 space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Total Earnings */}
                    <div className="bg-[#FAFAF9] rounded-[7px] p-3.5 border border-[#E4E4E2]">
                      <div className="flex items-center gap-1.5 text-[#888888] text-[9px] font-medium uppercase tracking-wider mb-1">
                        <Wallet className="w-3 h-3" />
                        Total Earnings
                      </div>
                      <div className="text-[19px] font-semibold text-[#111111]">
                        {formatCurrency(stats.total_amount_mrp || 0)}
                      </div>
                    </div>

                    {/* Total Savings */}
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

                  {/* Order Stats */}
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

                  {/* Member Info */}
                  <div className="bg-[#FAFAF9] rounded-[7px] p-3.5 border border-[#E4E4E2]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[9px] text-[#888888] font-medium uppercase tracking-wider">
                          Partner Since
                        </div>
                        <div className="text-[12px] font-medium text-[#171717] mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-[#555555]" />
                          {stats.joined_at ? new Date(stats.joined_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : 'N/A'}
                        </div>
                      </div>
                      <div className="px-2.5 py-1 bg-[#F1F1F0] rounded-full">
                        <span className="text-[9px] font-semibold text-[#555555] uppercase tracking-wider">
                          {stats.account_type || 'Partner'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
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
                  <p className="text-[#171717] text-[13px] font-medium">No earnings data available</p>
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

export default function Header({ hideAnnouncement = false }: { hideAnnouncement?: boolean }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { logout } = useLogout();

  // State
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

  // Earnings Popup State
  const [isEarningsPopupOpen, setIsEarningsPopupOpen] = useState(false);

  // User role detection
  const [userType, setUserType] = useState<string | null>(null);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isDistributor, setIsDistributor] = useState(false);

  const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shopCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  // API Queries
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();
  const { data: wishlistData, isLoading: isWishlistLoading } =
    useGetWishlistQuery();
  const { data: userProfileData } = useGetUserProfileQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: headerData, isLoading: isHeaderLoading } = useGetHeaderQuery();

  // Distributor Stats Query
  const {
    data: distributorStats,
    isLoading: isDistributorStatsLoading,
    refetch: refetchDistributorStats
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

  // Detect user role from localStorage
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

  // Debounce search query
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
  const categories = categoriesData?.data || [];
  const headerMenus = headerData?.data?.menus || [];

  // Modified: Only add "Earnings" for distributors, everything else same as customer
  const getRoleBasedMenus = () => {
    const baseMenus = headerMenus.map((menu: any) => ({
      label: menu.title,
      href: getMenuHref(menu.slug),
      hasDropdown: menu.title === "Collections",
    }));

    // For distributors: add just one extra item - "Earnings"
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

    // For customers: return base menus only
    return baseMenus;
  };

  // Map API menus to navigation items with icons and href
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

  // Updated href map with proper routes
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

  // Navigation handler for all menu items
  const handleNavigation = (href: string, label?: string) => {
    // Handle New Arrivals specifically
    if (label === "New arrivals" || href.includes("new-arrivals")) {
      router.push("/products?new-arrivals=true");
    } else if (label === "Earnings" || href === "/profile/?tab=earnings") {
      // Open Earnings Popup instead of navigating
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

    // Close all dropdowns
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

  // Earnings Popup Handlers
  const openEarningsPopup = () => {
    if (isDistributor) {
      // Refetch stats when opening
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

  const mobileNavItems = headerMenus.map((menu: any) => ({
    label: menu.title,
    href: getMenuHref(menu.slug),
    icon: getMenuIcon(menu.title),
    hasDropdown: menu.title === "Collections",
  }));

  // Modified: For mobile, add "Earnings" if distributor
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

  // Desktop nav items - role based (only Earnings extra for distributors)
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

  // Logout Handler
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
      setIsSearchExpanded(false);
      setIsSearchFocused(false);
      setIsSearchHovered(false);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      if (searchCloseTimer.current) {
        clearTimeout(searchCloseTimer.current);
        searchCloseTimer.current = null;
      }
    } else {
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

  // New Arrivals handler
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

  const goToProfile = () => {
    router.push("/profile");
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

  // Profile menu items based on role
  const getProfileMenuItems = () => {
    const items = [
      { icon: UserCircle, label: "My Profile", onClick: goToProfile },
    ];

    // Only add Earnings for distributors
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

  // Get role badge
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

  // Get earnings stats for popup
  const earningsStats = distributorStats?.data || null;

  return (
    <>
      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />

      {/* Earnings Popup */}
      <EarningsPopup
        isOpen={isEarningsPopupOpen}
        onClose={closeEarningsPopup}
        onViewDetails={goToEarningsDetails}
        stats={earningsStats}
        isLoading={isDistributorStatsLoading}
      />

      {/* Announcement strip - Hidden on mobile */}
      {!hideAnnouncement && (
        <div className="hidden sm:flex items-center justify-center gap-3 bg-[#111111] text-white/80 text-[10px] tracking-[0.16em] uppercase py-2.5 px-4 font-sans">
          <span>Handcrafted across India</span>
          <span className="text-white/30">·</span>
          <span>Free shipping over ₹999</span>
          <span className="text-white/30">·</span>
          <span>Every piece made by hand</span>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 bg-white font-sans transition-all duration-300 border-b ${isScrolled ? "border-[#E4E4E2] shadow-[0_2px_10px_-6px_rgba(0,0,0,0.08)]" : "border-[#E4E4E2]"
          }`}
      >
        <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-[68px] sm:h-[84px]">
            <Link
              href="/"
              className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0"
              onClick={goToHome}
            >
              {/* Logo */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <Image
                  src={Logo}
                  alt="Indie Konnect Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col leading-none">
                <span className="text-[18px] sm:text-[21px] font-semibold tracking-[-0.01em] text-[#111111]">
                  Indie<span className="text-[#111111]">Konnect</span>
                </span>

                <span className="hidden sm:block text-[9px] tracking-[0.24em] uppercase text-[#888888] mt-1">
                  Artisan Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Role Based */}
            <nav className="hidden lg:flex items-center gap-9">
              {desktopNavItems.map((item: any) => {
                const isEarningsItem = item.label === "Earnings";

                return (
                  <div
                    key={item.label}
                    className="relative"
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
                      className={`flex items-center gap-1 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors duration-200 ${isEarningsItem
                        ? "text-[#111111] hover:text-[#555555]"
                        : "text-[#333333] hover:text-[#111111]"
                        }`}
                    >
                      {isEarningsItem && <Crown className="w-3.5 h-3.5" />}
                      <span>{item.label}</span>
                      {item.hasDropdown && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${isShopDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                      )}
                    </button>

                    {/* Shop Dropdown */}
                    <AnimatePresence>
                      {item.hasDropdown && isShopDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="absolute left-1/2 top-full mt-4 -translate-x-1/2 w-[760px] max-w-[calc(100vw-32px)] bg-white rounded-[8px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.16)] border border-[#E4E4E2] overflow-hidden z-50"
                          onMouseEnter={openShopDropdown}
                          onMouseLeave={scheduleCloseShopDropdown}
                        >
                          {/* Header */}
                          <div className="px-6 pt-5 pb-4 border-b border-[#E6E6E4]">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#555555]">
                                  <Grid3x3 className="w-3.5 h-3.5" />
                                  Shop by Category
                                </div>

                                <p className="mt-1 text-[11px] text-[#999999]">
                                  Explore our collection
                                </p>
                              </div>

                              <button
                                onClick={() => goToProducts()}
                                className="flex items-center gap-1.5 text-[11px] font-medium text-[#111111] hover:text-[#555555] transition-colors"
                              >
                                View All
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Main Content */}
                          <div className="p-5">

                            {/* Top Three Cards */}
                            <div className="grid grid-cols-3 gap-3">

                              {/* All Products */}
                              <button
                                onClick={() => goToProducts()}
                                className="group flex items-center gap-3 p-3 rounded-[7px] border border-[#E4E4E2] hover:border-[#CFCFCC] hover:bg-[#FAFAF9] transition-all duration-200 text-left"
                              >
                                <div className="w-10 h-10 rounded-[6px] bg-[#F1F1F0] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E9E9E7] transition-colors">
                                  <Package className="w-4 h-4 text-[#111111]" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <span className="block font-medium text-[12px] text-[#171717]">
                                    All Products
                                  </span>

                                  <p className="mt-0.5 text-[9px] text-[#999999] truncate">
                                    Browse our entire collection
                                  </p>
                                </div>

                                <ArrowRight className="w-3.5 h-3.5 text-[#CCCCCC] group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                              </button>

                              {/* New Arrivals */}
                              <button
                                onClick={goToNewArrivals}
                                className="group flex items-center gap-3 p-3 rounded-[7px] border border-[#E4E4E2] hover:border-[#CFCFCC] hover:bg-[#FAFAF9] transition-all duration-200 text-left"
                              >
                                <div className="w-10 h-10 rounded-[6px] bg-[#F1F1F0] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E9E9E7] transition-colors">
                                  <Tag className="w-4 h-4 text-[#111111]" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <span className="block font-medium text-[12px] text-[#171717]">
                                    New Arrivals
                                  </span>

                                  <p className="mt-0.5 text-[9px] text-[#999999] truncate">
                                    Discover our latest products
                                  </p>
                                </div>

                                <ArrowRight className="w-3.5 h-3.5 text-[#CCCCCC] group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                              </button>

                              {/* Categories */}
                              <button
                                onClick={() => goToProducts()}
                                className="group flex items-center gap-3 p-3 rounded-[7px] bg-[#FAFAF9] border border-[#E4E4E2] hover:border-[#CFCFCC] hover:bg-white transition-all duration-200 text-left w-full"
                              >
                                <div className="w-10 h-10 rounded-[6px] bg-[#F1F1F0] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E9E9E7] transition-colors">
                                  <Grid3x3 className="w-4 h-4 text-[#111111]" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <span className="block font-medium text-[12px] text-[#171717]">
                                    Categories
                                  </span>

                                  <p className="mt-0.5 text-[9px] text-[#999999] truncate">
                                    Explore by category
                                  </p>
                                </div>

                                {/* Categories Arrow */}
                                <ArrowRight
                                  className="
                w-3.5 h-3.5
                text-[#CCCCCC]
                group-hover:text-[#111111]
                group-hover:translate-x-0.5
                transition-all
                flex-shrink-0
              "
                                />
                              </button>
                            </div>

                            {/* Category Grid */}
                            {categories.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-[#E6E6E4]">

                                <div className="grid grid-cols-3 gap-2">

                                  {categories.map((category: any) => (
                                    <button
                                      key={category.id}
                                      onClick={() =>
                                        goToProducts(
                                          category.slug || category.title
                                        )
                                      }
                                      className="group flex items-center gap-3 p-2.5 rounded-[6px] hover:bg-[#FAFAF9] transition-all duration-150 text-left"
                                    >
                                      {/* Category Image */}
                                      <div className="relative w-11 h-11 rounded-[6px] overflow-hidden flex-shrink-0 bg-[#F1F1F0] border border-[#E4E4E2]">

                                        {category.image ? (
                                          <Image
                                            src={category.image}
                                            alt={category.title}
                                            fill
                                            sizes="48px"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-3.5 h-3.5 text-[#888888]" />
                                          </div>
                                        )}

                                      </div>

                                      {/* Category Content */}
                                      <div className="flex-1 min-w-0">

                                        <span className="block font-medium text-[12px] text-[#171717] truncate">
                                          {category.title}
                                        </span>

                                        {category.description && (
                                          <p className="mt-0.5 text-[9px] text-[#999999] truncate">
                                            {category.description}
                                          </p>
                                        )}

                                      </div>

                                      {/* Category Arrow */}
                                      <ArrowRight
                                        className="
                      w-3.5 h-3.5
                      text-[#CCCCCC]
                      group-hover:text-[#111111]
                      group-hover:translate-x-0.5
                      transition-all
                      flex-shrink-0
                    "
                                      />

                                    </button>
                                  ))}

                                </div>
                              </div>
                            )}
                          </div>

                          {/* Bottom CTA */}
                          <div className="px-5 py-4 border-t border-[#E6E6E4] bg-[#FAFAF9]">

                            <button
                              onClick={() => {
                                goToProducts();
                              }}
                              className="
            w-full
            py-2.5
            bg-[#111111]
            text-white
            rounded-[6px]
            text-[12px]
            font-medium
            hover:bg-[#292929]
            transition-colors
            duration-200
            flex
            items-center
            justify-center
            gap-2
          "
                            >
                              View All Categories

                              <ArrowRight className="w-4 h-4" />
                            </button>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Right Actions - Responsive */}
            <div className="flex items-center gap-1 sm:gap-1.5">

              {/* Search - Desktop with Hover & Click */}
              <div
                ref={searchRef}
                className="relative hidden md:block"
                onMouseEnter={openSearchOnHover}
                onMouseLeave={scheduleCloseSearchOnHover}
              >
                <form onSubmit={handleSearch}>
                  <div
                    className={`flex items-center bg-transparent transition-all duration-300 ${isSearchExpanded ? "w-64" : "w-9"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={toggleSearch}
                      className="flex items-center justify-center w-9 h-9 flex-shrink-0 text-[#111111] hover:text-[#555555] transition-colors"
                    >
                      <Search className="w-[18px] h-[18px]" />
                    </button>

                    <AnimatePresence>
                      {isSearchExpanded && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "auto", opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center flex-1 overflow-hidden border-b border-[#111111]"
                        >
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search handmade treasures..."
                            className="bg-transparent text-[13px] py-2 px-2 outline-none text-[#171717] placeholder-[#999999] w-full min-w-[180px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                              setIsSearchFocused(true);
                              setIsSearchHovered(true);
                              if (searchCloseTimer.current) {
                                clearTimeout(searchCloseTimer.current);
                                searchCloseTimer.current = null;
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                if (!isSearchHovered) {
                                  setIsSearchFocused(false);
                                  setIsSearchExpanded(false);
                                }
                              }, 300);
                            }}
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery("");
                                setDebouncedSearchQuery("");
                              }}
                              className="text-[#999999] hover:text-[#111111] mr-1 p-0.5 flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>

                {/* Search Dropdown - with Loading State */}
                <AnimatePresence>
                  {isSearchExpanded &&
                    (searchQuery.length >= 1 || isSearching) && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-4 w-[420px] bg-white rounded-[8px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)] border border-[#E4E4E2] overflow-hidden z-50"
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
                            }, 500);
                          }
                        }}
                      >
                        {/* Loading State */}
                        {isSearching && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 text-[#111111] animate-spin" />
                            <span className="ml-3 text-[12px] text-[#888888]">
                              Searching products...
                            </span>
                          </div>
                        )}

                        {/* Product Suggestions */}
                        {!isSearching && hasSuggestions && (
                          <>
                            <div className="px-4 py-3 border-b border-[#E6E6E4]">
                              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#171717] mb-2">
                                <Package className="w-3.5 h-3.5" />
                                Products ({productSuggestions.length})
                              </div>
                              <div className="space-y-1">
                                {productSuggestions.map((product: any) => (
                                  <button
                                    key={product.id}
                                    onClick={() =>
                                      goToProductDetail(product.slug)
                                    }
                                    className="w-full text-left px-3 py-2.5 hover:bg-[#FAFAF9] rounded-[6px] transition-colors duration-150 flex items-center gap-3 group"
                                  >
                                    <div className="relative w-11 h-11 rounded-[6px] overflow-hidden flex-shrink-0 bg-[#F1F1F0] border border-[#E4E4E2]">
                                      <Image
                                        src={
                                          product.primary_image_url ||
                                          "/indiekonnect-web/images/placeholder.jpg"
                                        }
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-[12px] text-[#171717] truncate">
                                          {product.name}
                                        </span>
                                        <span className="text-[9px] text-[#999999] bg-[#F1F1F0] px-2 py-0.5 rounded-full truncate max-w-[80px]">
                                          {product.category?.name ||
                                            "Uncategorized"}
                                        </span>
                                      </div>
                                      <span className="text-[12px] font-semibold text-[#111111]">
                                        {product.retail_price_formatted ||
                                          "₹0.00"}
                                      </span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#CCCCCC] group-hover:text-[#111111] transition-colors flex-shrink-0" />
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* View All Button */}
                            {productSuggestions.length === 5 && (
                              <div className="px-4 py-3 border-t border-[#E6E6E4]">
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
                                    router.push(
                                      `/products?${params.toString()}`,
                                    );
                                    setIsSearchExpanded(false);
                                    setIsSearchFocused(false);
                                    setIsSearchHovered(false);
                                    setSearchQuery("");
                                    setDebouncedSearchQuery("");
                                    if (searchCloseTimer.current) {
                                      clearTimeout(searchCloseTimer.current);
                                      searchCloseTimer.current = null;
                                    }
                                  }}
                                  className="w-full py-2.5 bg-[#111111] text-white rounded-[6px] text-[12px] font-medium hover:bg-[#292929] transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                  View All Products
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {/* No Products Found */}
                        {!isSearching &&
                          debouncedSearchQuery.length >= 1 &&
                          !hasSuggestions && (
                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                              <PackageOpen className="w-12 h-12 text-[#E4E4E2] mb-4" />
                              <p className="text-[#171717] text-[13px] font-medium">
                                No products found
                              </p>
                              <p className="text-[11px] text-[#888888] mt-1">
                                We couldn't find any products matching "
                                {searchQuery}"
                              </p>
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
                                  if (searchCloseTimer.current) {
                                    clearTimeout(searchCloseTimer.current);
                                    searchCloseTimer.current = null;
                                  }
                                }}
                                className="mt-4 px-5 py-2.5 bg-[#111111] text-white rounded-[6px] text-[11px] font-semibold hover:bg-[#292929] transition-colors"
                              >
                                Browse All Products
                              </button>
                            </div>
                          )}

                        <div className="px-4 py-2.5 border-t border-[#E6E6E4] flex items-center justify-between">
                          <span className="text-[9px] text-[#999999]">
                            {debouncedSearchQuery.length >= 1
                              ? `Showing ${productSuggestions.length} results`
                              : "Start typing to search"}
                          </span>
                          <span className="text-[9px] text-[#999999]">
                            Press Enter to search all
                          </span>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>

              {/* Mobile Search Toggle */}
              <button
                className="md:hidden p-2 sm:p-2.5 text-[#111111] hover:text-[#555555] transition-colors"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen)
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Wishlist - Show for both customers and distributors */}
              <button
                onClick={goToWishlist}
                className="p-2 sm:p-2.5 text-[#111111] hover:text-[#555555] transition-all duration-200 relative"
                aria-label="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#111111] text-white text-[8px] sm:text-[9px] rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center font-semibold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <div
                className="relative"
                onMouseEnter={openCartDropdown}
                onMouseLeave={scheduleCloseCartDropdown}
              >
                <button
                  onClick={goToCart}
                  className="p-2 sm:p-2.5 text-[#111111] hover:text-[#555555] transition-colors relative"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-[18px] h-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-[#111111] text-white text-[8px] sm:text-[9px] rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center font-semibold">
                      {cartCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isCartOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-4 w-96 bg-white rounded-[8px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)] border border-[#E4E4E2] overflow-hidden z-50"
                      onMouseEnter={openCartDropdown}
                      onMouseLeave={scheduleCloseCartDropdown}
                    >
                      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6E6E4]">
                        <div>
                          <span className="text-[#171717] text-[14px] font-semibold">
                            Your Cart
                          </span>
                          {cartCount > 0 && (
                            <span className="text-[11px] text-[#888888] block">
                              {cartCount} {cartCount === 1 ? "item" : "items"}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="text-[#888888] hover:text-[#111111] transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {isCartLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-7 h-7 text-[#111111] animate-spin" />
                        </div>
                      ) : cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <PackageOpen className="w-12 h-12 text-[#E4E4E2] mb-4" />
                          <p className="text-[#171717] text-[13px] font-medium">
                            Your cart is empty
                          </p>
                          <p className="text-[11px] text-[#888888] mt-1">
                            Discover handcrafted treasures
                          </p>
                          <button
                            onClick={() => {
                              setIsCartOpen(false);
                              goToProducts();
                            }}
                            className="mt-4 px-5 py-2.5 bg-[#111111] text-white rounded-[6px] text-[11px] font-semibold hover:bg-[#292929] transition-colors"
                          >
                            Start Shopping
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-80 overflow-y-auto divide-y divide-[#EEEEEC]">
                            {cartItems.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAF9] transition-colors duration-150 group"
                              >
                                <Link
                                  href={`/product/${item.product?.slug || item.product_id}`}
                                  onClick={() => setIsCartOpen(false)}
                                  className="relative w-14 h-14 rounded-[6px] overflow-hidden flex-shrink-0 bg-[#F1F1F0] border border-[#E4E4E2]"
                                >
                                  <Image
                                    src={
                                      item.image_url ||
                                      "/indiekonnect-web/images/placeholder.jpg"
                                    }
                                    alt={item.product?.name || "Product"}
                                    fill
                                    className="object-cover"
                                  />
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/product/${item.product?.slug || item.product_id}`}
                                    onClick={() => setIsCartOpen(false)}
                                    className="text-[12px] font-medium text-[#171717] truncate block hover:text-[#555555] transition-colors"
                                  >
                                    {item.product?.name || "Product"}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[12px] font-semibold text-[#111111]">
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

                          <div className="border-t border-[#E6E6E4] px-5 py-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] text-[#888888]">
                                Subtotal
                              </span>
                              <span className="text-[16px] font-semibold text-[#111111]">
                                ₹{cartSubtotalFormatted}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#999999]">
                              <Truck className="w-3.5 h-3.5" />
                              Free shipping on orders above ₹999
                            </div>
                            <div className="flex gap-2.5">
                              <button
                                onClick={goToCart}
                                className="flex-1 py-2.5 bg-[#111111] text-white rounded-[6px] text-[12px] font-semibold hover:bg-[#292929] transition-colors flex items-center justify-center gap-2"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                View Cart
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="px-5 py-2.5 bg-[#FAFAF9] border-t border-[#E6E6E4] text-center">
                        <span className="text-[9px] text-[#999999] flex items-center justify-center gap-2">
                          <Package className="w-3 h-3" />
                          Every order supports artisan communities
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div
                className="relative hidden sm:block"
                onMouseEnter={openProfileDropdown}
                onMouseLeave={scheduleCloseProfileDropdown}
              >
                <button
                  className="flex items-center gap-2 pl-2 ml-1"
                  aria-label="Profile"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium overflow-hidden bg-[#111111] text-white"
                  >
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

                  <span className="text-[12px] font-medium hidden sm:block truncate max-w-[80px] text-[#171717]">
                    {userName?.split(" ")[0]}
                  </span>

                  {isDistributor && (
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-[#555555] bg-[#F1F1F0] px-1.5 py-0.5 rounded-full">
                      Partner
                    </span>
                  )}

                  <ChevronDown className="w-3.5 h-3.5 text-[#999999]" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-4 w-64 bg-white rounded-[8px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)] border border-[#E4E4E2] overflow-hidden z-50"
                      onMouseEnter={openProfileDropdown}
                      onMouseLeave={scheduleCloseProfileDropdown}
                    >
                      <div className="px-5 py-4 border-b border-[#E6E6E4] flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-medium overflow-hidden bg-[#111111] text-white"
                        >
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
                        <div>
                          <p className="text-[#171717] text-[13px] font-semibold truncate max-w-[140px] flex items-center gap-2">
                            {userName}
                            {isDistributor && (
                              <span className="text-[8px] font-semibold uppercase tracking-wider text-[#555555] bg-[#F1F1F0] px-1.5 py-0.5 rounded-full">
                                Partner
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-[#888888] truncate max-w-[140px]">
                            {userEmail}
                          </p>
                        </div>
                      </div>

                      <div className="py-1.5">
                        {profileMenuItems.map((item) => (
                          <button
                            key={item.label}
                            onClick={item.onClick}
                            className={`flex items-center gap-3 w-full px-5 py-2.5 text-[12px] transition-colors duration-150 ${item.isDanger
                              ? "text-[#B24C4C] hover:bg-[#FDF2F2] border-t border-[#E6E6E4] mt-1 pt-3"
                              : "text-[#555555] hover:bg-[#FAFAF9] hover:text-[#171717]"
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

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 sm:p-2.5 text-[#111111] hover:text-[#555555] transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:w-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[#E4E4E2] bg-[#FAFAF9] px-3 sm:px-4 py-3 sm:py-4"
            >
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div className="flex-1 flex items-center bg-white rounded-full border border-[#E4E4E2] px-3 sm:px-4 focus-within:border-[#999999]">
                  <Search className="w-4 h-4 text-[#999999]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search handmade treasures..."
                    className="bg-transparent text-[13px] py-2.5 px-2 sm:px-3 w-full outline-none text-[#171717] placeholder-[#999999]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setDebouncedSearchQuery("");
                      }}
                      className="text-[#999999] hover:text-[#111111]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2.5 bg-[#111111] text-white rounded-full text-[12px] font-medium hover:bg-[#292929] transition-colors whitespace-nowrap"
                >
                  Search
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {categories.slice(0, 4).map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSearchCategory(cat.slug);
                      const params = new URLSearchParams();
                      if (cat.slug && cat.slug !== "all") {
                        params.append("category", cat.slug);
                      }
                      router.push(`/products?${params.toString()}`);
                      setIsSearchOpen(false);
                    }}
                    className="px-2.5 sm:px-3 py-1.5 bg-white rounded-full text-[11px] text-[#555555] hover:text-[#111111] transition-colors border border-[#E4E4E2] hover:border-[#BDBDBA]"
                  >
                    {cat.title}
                  </button>
                ))}
                {categories.length > 4 && (
                  <button
                    onClick={() => {
                      goToProducts();
                      setIsSearchOpen(false);
                    }}
                    className="px-2.5 sm:px-3 py-1.5 bg-[#F1F1F0] rounded-full text-[11px] text-[#555555] hover:text-[#111111] transition-colors border border-[#E4E4E2] hover:border-[#BDBDBA]"
                  >
                    +{categories.length - 4} more
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden border-t border-[#E4E4E2] bg-[#FAFAF9] overflow-hidden max-h-[80vh] overflow-y-auto"
            >
              <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-1">
                {/* User Profile Section */}
                <div className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-[#E4E4E2]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-medium bg-[#111111] text-white">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#171717] text-[13px] font-semibold truncate max-w-[180px] flex items-center gap-2">
                      {userName}
                      {isDistributor && (
                        <span className="text-[8px] font-semibold uppercase tracking-wider text-[#555555] bg-[#F1F1F0] px-1.5 py-0.5 rounded-full">
                          Partner
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#888888] truncate max-w-[180px]">
                      {userEmail}
                    </p>
                  </div>
                </div>

                {/* Navigation Items - Using mobileNavItemsFinal */}
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
                          } else if (isEarningsItem) {
                            openEarningsPopup();
                          } else if (item.href === "/") {
                            goToHome();
                          } else if (item.href === "/products") {
                            goToProducts();
                          } else if (item.href === "/collections") {
                            goToCollections();
                          } else if (item.href === "/profile/?tab=earnings") {
                            goToPartnerEarnings();
                          } else if (item.href === "/track-order") {
                            goToTrackOrder();
                          } else if (item.href === "/dashboard") {
                            goToDashboard();
                          } else {
                            router.push(item.href);
                            setIsMobileMenuOpen(false);
                          }
                        }}
                        className={`flex items-center justify-between w-full transition-colors duration-150 py-3 px-3 rounded-[6px] hover:bg-white border-b border-[#EEEEEC] ${isEarningsItem
                          ? "text-[#111111]"
                          : "text-[#555555] hover:text-[#171717]"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon
                            className={`w-5 h-5 ${isEarningsItem
                              ? "text-[#111111]"
                              : "text-[#999999]"
                              }`}
                          />
                          <span className="font-medium">{item.label}</span>
                          {isEarningsItem && (
                            <span className="text-[8px] font-semibold uppercase text-[#555555] bg-[#F1F1F0] px-1.5 py-0.5 rounded-full">
                              Partner
                            </span>
                          )}
                        </div>
                        {item.hasDropdown && (
                          <ChevronDown
                            className={`w-4 h-4 text-[#999999] transition-transform duration-200 ${expandedMobileCategory === item.label
                              ? "rotate-180"
                              : ""
                              }`}
                          />
                        )}
                        {!item.hasDropdown && (
                          <ArrowRight className="w-4 h-4 text-[#CCCCCC]" />
                        )}
                      </button>

                      {/* Mobile Category Dropdown */}
                      {item.hasDropdown &&
                        expandedMobileCategory === item.label && (
                          <div className="pl-9 pr-3 py-2 space-y-1 bg-[#F5F5F4] rounded-b-[6px]">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#171717] px-3 py-1">
                              Categories
                            </div>
                            <button
                              onClick={() => {
                                goToProducts();
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-[12px] text-[#555555] hover:text-[#171717] hover:bg-white rounded-[6px] transition-colors flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                              All Products
                            </button>
                            {/* New Arrivals in mobile dropdown */}
                            <button
                              onClick={goToNewArrivals}
                              className="w-full text-left px-3 py-2 text-[12px] text-[#171717] hover:bg-white rounded-[6px] transition-colors flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                              New Arrivals
                            </button>
                            {categories.map((cat: any) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  goToProducts(cat.slug);
                                  setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-[12px] text-[#555555] hover:text-[#171717] hover:bg-white rounded-[6px] transition-colors flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                                {cat.title}
                              </button>
                            ))}
                            {categories.length > 5 && (
                              <button
                                onClick={() => {
                                  goToProducts();
                                  setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-[12px] text-[#171717] hover:bg-white rounded-[6px] transition-colors font-medium"
                              >
                                View All Categories →
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  );
                })}

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#E4E4E2] mt-3">
                  <button
                    onClick={goToWishlist}
                    className="flex items-center gap-2 text-[12px] text-[#555555] hover:text-[#171717] transition-colors px-3 sm:px-4 py-2 rounded-[6px] hover:bg-white"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="bg-[#111111] text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={goToCart}
                    className="flex items-center gap-2 text-[12px] text-[#555555] hover:text-[#171717] transition-colors px-3 sm:px-4 py-2 rounded-[6px] hover:bg-white"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="bg-[#111111] text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={goToTrackOrder}
                    className="flex items-center gap-2 text-[12px] text-[#555555] hover:text-[#171717] transition-colors px-3 sm:px-4 py-2 rounded-[6px] hover:bg-white"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Order</span>
                  </button>
                  <button
                    onClick={openLogoutModal}
                    className="flex items-center gap-2 text-[12px] text-[#B24C4C] transition-colors px-3 sm:px-4 py-2 rounded-[6px] hover:bg-[#FDF2F2]"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    <span>Logout</span>
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