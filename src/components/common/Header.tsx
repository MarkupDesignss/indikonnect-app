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
  Trash2,
  PackageOpen,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
  LayoutDashboard,
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
  Users,
  TrendingUp,
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
              <div className="relative px-6 pt-8 pb-4 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#29293F]/10 to-[#F7B407]/10 rounded-full flex items-center justify-center mb-4">
                  <LogOutIcon className="w-10 h-10 text-[#29293F]" />
                </div>
                <h3 className="text-2xl font-serif text-[#2B2420] mb-2">
                  Logout Confirmation
                </h3>
                <p className="text-[#8a7f6e] text-sm leading-relaxed">
                  Are you sure you want to logout? You'll need to login again to
                  access your account.
                </p>
              </div>
              <div className="mx-6 p-3 bg-amber-50 rounded-xl border border-amber-200/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Your session will be ended and you'll be redirected to the
                  login page.
                </p>
              </div>
              <div className="px-6 py-5 bg-[#FBF6EC] border-t border-[#EFE6D3] flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-white text-[#5C534A] rounded-xl font-medium hover:bg-[#F1E9D9] transition-all duration-200 border border-[#E7DBC0] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#29293F] to-[#1f1f30] text-white rounded-xl font-medium hover:from-[#1f1f30] hover:to-[#151521] transition-all duration-200 shadow-lg shadow-[#29293F]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </>
                  )}
                </button>
              </div>
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#29293F]/20 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#29293F]/20 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#29293F]/20 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#29293F]/20 rounded-br-2xl" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function Header() {
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

  // Get user profile data
  const userProfile = userProfileData?.user;
  const userName = userProfile?.full_name || "User";
  const userEmail = userProfile?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const userProfilePicture = userProfileData?.user?.profile_picture || null;

  // Get categories
  const categories = categoriesData?.data || [];

  // Get header menus from API
  const headerMenus = headerData?.data?.menus || [];

  // Get role-specific menu items
  const getRoleBasedMenus = () => {
    const baseMenus = headerMenus.map((menu: any) => ({
      label: menu.title,
      href: getMenuHref(menu.slug),
      hasDropdown: menu.title === "Collections",
    }));

    if (isDistributor) {
      return [
        ...baseMenus,
        {
          label: "Partner Hub",
          href: "/partner/dashboard",
          hasDropdown: false,
        },
        { label: "Earnings", href: "/partner/earnings", hasDropdown: false },
        { label: "Products", href: "/partner/products", hasDropdown: false },
      ];
    }

    return baseMenus;
  };

  // Map API menus to navigation items with icons and href
  const getMenuIcon = (title: string) => {
    const iconMap: { [key: string]: any } = {
      Home: Home,
      Shop: Grid3x3,
      Collections: Package,
      "New arrivals": Sparkles,
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
      "new-arrivals": "/new-arrivals",
      "contact-us": "/contact",
      "partner-hub": "/partner/dashboard",
      earnings: "/partner/earnings",
      products: "/partner/products",
    };
    return hrefMap[slug] || `/${slug}`;
  };

  const mobileNavItems = headerMenus.map((menu: any) => ({
    label: menu.title,
    href: getMenuHref(menu.slug),
    icon: getMenuIcon(menu.title),
    hasDropdown: menu.title === "Collections",
  }));

  // Desktop nav items - role based
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

  const goToPartnerHub = () => {
    router.push("/partner/dashboard");
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
    router.push("/partner/earnings");
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

  const goToPartnerProducts = () => {
    router.push("/partner/products");
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

    if (isDistributor) {
      items.push(
        { icon: Store, label: "Partner Hub", onClick: goToPartnerHub },
        { icon: Crown, label: "Earnings", onClick: goToPartnerEarnings },
        { icon: Package, label: "My Products", onClick: goToPartnerProducts },
      );
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
        color: "#F7B407",
        bg: "rgba(247, 180, 7, 0.12)",
        icon: Store,
      };
    }
    if (isCustomer) {
      return {
        label: "Customer",
        color: "#29293F",
        bg: "rgba(41, 41, 63, 0.08)",
        icon: UserCircle,
      };
    }
    return null;
  };

  const roleBadge = getRoleBadge();
  const profileMenuItems = getProfileMenuItems();

  return (
    <>
      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />

      {/* Announcement strip - Hidden on mobile */}
      <div className="hidden sm:flex items-center justify-center gap-3 bg-gradient-to-r from-[#29293F] via-[#1f1f30] to-[#29293F] text-[#F7B407] text-[10px] tracking-[0.18em] uppercase py-2.5 px-4 border-b border-[#F7B407]/20 shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
        <span>Handcrafted across India</span>
        <span className="text-[#F7B407]/50">·</span>
        <span>Free shipping over ₹999</span>
        <span className="text-[#F7B407]/50">·</span>
        <span>Every piece made by hand</span>
      </div>

      <header
        className={`sticky top-0 z-40 bg-[linear-gradient(180deg,rgba(255,253,248,0.98),rgba(251,246,236,0.97))] backdrop-blur-xl transition-all duration-300 ${isScrolled
          ? "shadow-[0_14px_45px_-18px_rgba(41,41,63,0.25)] border-b border-[#F7B407]/40"
          : "border-b border-[#E7DBC0]/70 shadow-[0_4px_20px_-12px_rgba(41,41,63,0.12)]"
          }`}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-[68px] sm:h-[78px]">
            <Link
              href="/"
              className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0 group"
              onClick={goToHome}
            >
              {/* Logo */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={Logo}
                  alt="Indie Konnect Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col leading-none">
                <span className="font-serif text-[18px] sm:text-[21px] font-medium tracking-[0.025em] text-[#29293F]">
                  Indie
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#29293F] via-[#F7B407] to-[#29293F]">
                    Konnect
                  </span>
                </span>

                <span className="hidden sm:block text-[9px] tracking-[0.25em] uppercase text-[#F7B407] mt-1 font-semibold">
                  Curated Artisan Marketplace
                </span>
              </div>
            </Link>
            {/* Desktop Navigation - Role Based */}
            <nav className="hidden lg:flex items-center gap-0.5 text-[12px] xl:text-[13px] font-medium bg-white/55 border border-[#F7B407]/30 rounded-full px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              {desktopNavItems.map((item: any) => {
                const isPartnerItem =
                  item.label === "Partner Hub" ||
                  item.label === "Earnings" ||
                  item.label === "Products";

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
                    <Link
                      href={item.href}
                      className={`relative px-3.5 xl:px-4 py-2 transition-all duration-200 group flex items-center gap-1 rounded-full ${isPartnerItem
                        ? "text-[#F7B407] hover:text-[#d49e06] hover:bg-[#F7B407]/10"
                        : "text-[#5C534A] hover:text-[#29293F] hover:bg-[#29293F]/5"
                        }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.hasDropdown) {
                          setIsShopDropdownOpen(!isShopDropdownOpen);
                        } else if (item.href === "/") goToHome();
                        else if (item.href === "/products") goToProducts();
                        else if (item.href === "/collections")
                          goToCollections();
                        else if (item.href === "/new-arrivals")
                          router.push("/new-arrivals");
                        else if (item.href === "/track-order") goToTrackOrder();
                        else if (item.href === "/dashboard") goToDashboard();
                        else if (item.href === "/partner/dashboard")
                          goToPartnerHub();
                        else if (item.href === "/partner/earnings")
                          goToPartnerEarnings();
                        else if (item.href === "/partner/products")
                          goToPartnerProducts();
                        else router.push(item.href);
                      }}
                    >
                      {isPartnerItem && <Store className="w-3.5 h-3.5 mr-1" />}
                      <span className="tracking-wide">{item.label}</span>
                      {item.hasDropdown && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${isShopDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                      )}
                      <span
                        className={`absolute left-4 right-4 -bottom-[1px] h-[1.5px] rounded-full ${isPartnerItem
                          ? "bg-[#F7B407]"
                          : "bg-gradient-to-r from-transparent via-[#F7B407] to-transparent"
                          } scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-200`}
                      />
                    </Link>

                    {/* Shop Dropdown */}
                    <AnimatePresence>
                      {item.hasDropdown && isShopDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(41,41,63,0.2)] border border-[#F7B407]/30 overflow-hidden z-50"
                          onMouseEnter={openShopDropdown}
                          onMouseLeave={scheduleCloseShopDropdown}
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#F7B407] mb-3">
                              <Grid3x3 className="w-3.5 h-3.5" />
                              Shop by Category
                            </div>
                            <div className="space-y-1">
                              {/* All Products */}
                              <button
                                onClick={() => goToProducts()}
                                className="w-full text-left px-3 py-2.5 hover:bg-[#F7B407]/5 rounded-lg transition-colors duration-150 flex items-center gap-3 group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#F7B407]/10 flex items-center justify-center flex-shrink-0">
                                  <Package className="w-4 h-4 text-[#29293F]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-sm text-[#2B2420] group-hover:text-[#29293F] transition-colors">
                                    All Products
                                  </span>
                                  <p className="text-[10px] text-[#a89c86] truncate">
                                    Browse our entire collection
                                  </p>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-[#d9cfba] group-hover:text-[#F7B407] transition-colors" />
                              </button>

                              {categories.map((category: any) => (
                                <button
                                  key={category.id}
                                  onClick={() =>
                                    goToProducts(
                                      category.slug || category.title,
                                    )
                                  }
                                  className="w-full text-left px-3 py-2.5 hover:bg-[#F7B407]/5 rounded-lg transition-colors duration-150 flex items-center gap-3 group"
                                >
                                  <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[#F1E9D9] border border-[#E7DBC0]">
                                    {category.image && (
                                      <Image
                                        src={category.image}
                                        alt={category.title}
                                        fill
                                        className="object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium text-sm text-[#2B2420] group-hover:text-[#29293F] transition-colors">
                                      {category.title}
                                    </span>
                                    {category.description && (
                                      <p className="text-[10px] text-[#a89c86] truncate">
                                        {category.description}
                                      </p>
                                    )}
                                  </div>
                                  <ArrowRight className="w-3.5 h-3.5 text-[#d9cfba] group-hover:text-[#F7B407] transition-colors" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="px-4 py-3 border-t border-[#EFE6D3] bg-[#FBF6EC]">
                            <button
                              onClick={() => {
                                goToProducts();
                              }}
                              className="w-full py-2 bg-[#29293F] text-white rounded-lg text-sm font-medium hover:bg-[#F7B407] hover:text-[#29293F] transition-colors flex items-center justify-center gap-2"
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
              {/* Role Badge - Desktop */}
              {roleBadge && (
                <div
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full mr-1 bg-white/70 backdrop-blur-sm shadow-[0_2px_10px_rgba(41,41,63,0.08)]"
                  style={{
                    background: roleBadge.bg,
                    border: `1px solid ${roleBadge.color}44`,
                  }}
                >
                  <roleBadge.icon
                    className="w-3 h-3"
                    style={{ color: roleBadge.color }}
                  />
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider"
                    style={{ color: roleBadge.color }}
                  >
                    {roleBadge.label}
                  </span>
                </div>
              )}

              {/* Search - Desktop with Hover & Click */}
              <div
                ref={searchRef}
                className="relative hidden md:block"
                onMouseEnter={openSearchOnHover}
                onMouseLeave={scheduleCloseSearchOnHover}
              >
                <form onSubmit={handleSearch}>
                  <div
                    className={`flex items-center bg-white/85 backdrop-blur-sm rounded-full border transition-all duration-300 shadow-[0_2px_12px_rgba(41,41,63,0.08)] ${isSearchExpanded
                      ? "border-[#F7B407] shadow-[0_4px_16px_rgba(247,180,7,0.2)]"
                      : "border-[#E7DBC0] hover:border-[#F7B407]/50"
                      } ${isSearchExpanded ? "w-72" : "w-11"}`}
                  >
                    <button
                      type="button"
                      onClick={toggleSearch}
                      className="flex items-center justify-center w-11 h-11 flex-shrink-0"
                    >
                      <Search
                        className={`w-4 h-4 transition-colors duration-200 ${isSearchExpanded ? "text-[#F7B407]" : "text-[#a89c86]"
                          }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isSearchExpanded && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "auto", opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center flex-1 overflow-hidden"
                        >
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search handmade treasures..."
                            className="bg-transparent text-[13px] py-2.5 px-2 outline-none text-[#29293F] placeholder-[#a89c86] w-full min-w-[180px]"
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
                              className="text-[#a89c86] hover:text-[#F7B407] mr-3 p-0.5 flex-shrink-0"
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
                        className="absolute right-0 top-full mt-3 w-[450px] bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(41,41,63,0.2)] border border-[#F7B407]/30 overflow-hidden z-50"
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
                            <Loader2 className="w-6 h-6 text-[#F7B407] animate-spin" />
                            <span className="ml-3 text-sm text-[#8a7f6e]">
                              Searching products...
                            </span>
                          </div>
                        )}

                        {/* Product Suggestions */}
                        {!isSearching && hasSuggestions && (
                          <>
                            <div className="px-4 py-3 border-b border-[#EFE6D3]">
                              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#29293F] mb-2">
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
                                    className="w-full text-left px-3 py-2.5 hover:bg-[#F7B407]/5 rounded-lg transition-colors duration-150 flex items-center gap-3 group"
                                  >
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#F1E9D9] border border-[#E7DBC0]">
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
                                        <span className="font-medium text-sm text-[#2B2420] group-hover:text-[#29293F] transition-colors truncate">
                                          {product.name}
                                        </span>
                                        <span className="text-[10px] text-[#a89c86] bg-[#F1E9D9] px-2 py-0.5 rounded-full truncate max-w-[80px]">
                                          {product.category?.name ||
                                            "Uncategorized"}
                                        </span>
                                      </div>
                                      <span className="text-sm font-semibold text-[#29293F]">
                                        {product.retail_price_formatted ||
                                          "₹0.00"}
                                      </span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#d9cfba] group-hover:text-[#F7B407] transition-colors flex-shrink-0" />
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* View All Button */}
                            {productSuggestions.length === 5 && (
                              <div className="px-4 py-3 border-t border-[#EFE6D3]">
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
                                  className="w-full py-2.5 bg-gradient-to-r from-[#29293F] to-[#1f1f30] text-white rounded-lg text-sm font-medium hover:from-[#F7B407] hover:to-[#d49e06] hover:text-[#29293F] transition-all duration-200 flex items-center justify-center gap-2"
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
                              <PackageOpen className="w-14 h-14 text-[#E7DBC0] mb-4" />
                              <p className="text-black text-[#29293F] font-serif">
                                No products found
                              </p>
                              <p className="text-sm text-[#a89c86] mt-1">
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
                                className="mt-4 px-6 py-2.5 bg-[#29293F] text-white rounded-full text-sm font-medium hover:bg-[#F7B407] hover:text-[#29293F] transition-colors"
                              >
                                Browse All Products
                              </button>
                            </div>
                          )}

                        <div className="px-4 py-2.5 border-t border-[#EFE6D3] flex items-center justify-between">
                          <span className="text-[10px] text-[#a89c86]">
                            {debouncedSearchQuery.length >= 1
                              ? `Showing ${productSuggestions.length} results`
                              : "Start typing to search"}
                          </span>
                          <span className="text-[10px] text-[#a89c86]">
                            Press Enter to search all
                          </span>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>

              {/* Mobile Search Toggle */}
              <button
                className="md:hidden p-2 sm:p-2.5 text-[#5C534A] hover:text-[#29293F] transition-colors rounded-full hover:bg-[#F7B407]/10"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen)
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist - Only show for customers */}
              {!isDistributor && (
                <button
                  onClick={goToWishlist}
                  className="p-2.5 sm:p-3 text-[#5C534A] hover:text-[#29293F] transition-all duration-200 rounded-full hover:bg-white hover:shadow-[0_4px_14px_rgba(41,41,63,0.12)] relative"
                  aria-label="Wishlist"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-0 bg-[#F7B407] text-[#29293F] text-[8px] sm:text-[9px] rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center font-semibold">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {/* Cart */}
              <div
                className="relative"
                onMouseEnter={openCartDropdown}
                onMouseLeave={scheduleCloseCartDropdown}
              >
                <button
                  onClick={goToCart}
                  className="p-2 sm:p-2.5 text-[#5C534A] hover:text-[#29293F] transition-colors rounded-full hover:bg-[#F7B407]/10 relative"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-[#F7B407] text-[#29293F] text-[8px] sm:text-[9px] rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center font-semibold">
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
                      className="absolute right-0 top-full mt-3 w-96 bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(41,41,63,0.2)] border border-[#F7B407]/30 overflow-hidden z-50"
                      onMouseEnter={openCartDropdown}
                      onMouseLeave={scheduleCloseCartDropdown}
                    >
                      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFE6D3]">
                        <div>
                          <span className="font-serif text-[#29293F] text-[15px]">
                            Your Cart
                          </span>
                          {cartCount > 0 && (
                            <span className="text-xs text-[#a89c86] block">
                              {cartCount} {cartCount === 1 ? "item" : "items"}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="text-[#a89c86] hover:text-[#29293F] transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {isCartLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 text-[#F7B407] animate-spin" />
                        </div>
                      ) : cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <PackageOpen className="w-14 h-14 text-[#E7DBC0] mb-4" />
                          <p className="text-black text-[#29293F] font-serif">
                            Your cart is empty
                          </p>
                          <p className="text-sm text-[#a89c86] mt-1">
                            Discover handcrafted treasures
                          </p>
                          <button
                            onClick={() => {
                              setIsCartOpen(false);
                              goToProducts();
                            }}
                            className="mt-4 px-6 py-2.5 bg-[#29293F] text-white rounded-full text-sm font-medium hover:bg-[#F7B407] hover:text-[#29293F] transition-colors"
                          >
                            Start Shopping
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-80 overflow-y-auto divide-y divide-[#F1E9D9]">
                            {cartItems.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FBF6EC] transition-colors duration-150 group"
                              >
                                <Link
                                  href={`/product/${item.product?.slug || item.product_id}`}
                                  onClick={() => setIsCartOpen(false)}
                                  className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#F1E9D9] border border-[#E7DBC0]"
                                >
                                  <Image
                                    src={
                                      item.product?.primary_image ||
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
                                    className="text-sm font-medium text-[#2B2420] truncate block hover:text-[#29293F] transition-colors"
                                  >
                                    {item.product?.name || "Product"}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-sm font-semibold text-[#29293F]">
                                      ₹
                                      {item.current_unit_price_formatted ||
                                        item.current_unit_price}
                                    </span>
                                    <span className="text-xs text-[#a89c86]">
                                      × {item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    // Handle remove from cart
                                  }}
                                  className="p-2 text-[#a89c86] hover:text-[#29293F] rounded-full transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-[#EFE6D3] px-5 py-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#8a7f6e]">
                                Subtotal
                              </span>
                              <span className="text-lg font-serif text-[#29293F]">
                                ₹{cartSubtotalFormatted}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#a89c86]">
                              <Truck className="w-3.5 h-3.5" />
                              Free shipping on orders above ₹999
                            </div>
                            <div className="flex gap-2.5">
                              <button
                                onClick={() => {
                                  // Handle clear cart
                                }}
                                className="flex-1 py-2.5 bg-white text-[#5C534A] rounded-lg text-sm font-medium hover:bg-[#F1E9D9] transition-colors border border-[#E7DBC0]"
                              >
                                Clear
                              </button>
                              <button
                                onClick={goToCart}
                                className="flex-1 py-2.5 bg-[#29293F] text-white rounded-lg text-sm font-semibold hover:bg-[#F7B407] hover:text-[#29293F] transition-colors flex items-center justify-center gap-2"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                View Cart
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="px-5 py-2.5 bg-[#FBF6EC] border-t border-[#EFE6D3] text-center">
                        <span className="text-[10px] text-[#a89c86] flex items-center justify-center gap-2">
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
                  className={`flex items-center gap-2 p-1.5 pr-2.5 transition-all duration-200 rounded-full shadow-[0_3px_14px_rgba(41,41,63,0.08)] border ${isDistributor
                    ? "bg-gradient-to-r from-[#F7B407]/10 to-[#F7B407]/5 hover:from-[#F7B407]/20 hover:to-[#F7B407]/10 border-[#F7B407]/40"
                    : "bg-white/75 hover:bg-white border-[#E7DBC0]"
                    }`}
                  aria-label="Profile"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm overflow-hidden ${isDistributor
                      ? "bg-gradient-to-br from-[#F7B407] to-[#d49e06] text-[#29293F] shadow-[0_3px_10px_rgba(247,180,7,0.25)]"
                      : "bg-gradient-to-br from-[#29293F] to-[#1f1f30] text-white shadow-[0_3px_10px_rgba(41,41,63,0.18)]"
                      }`}
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

                  <span className="text-[13px] font-medium hidden sm:block truncate max-w-[80px] text-[#29293F]">
                    {userName?.split(" ")[0]}
                  </span>

                  {isDistributor && (
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-[#F7B407] bg-[#F7B407]/10 px-1.5 py-0.5 rounded">
                      Partner
                    </span>
                  )}

                  <ChevronDown className="w-3.5 h-3.5 text-[#a89c86]" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(41,41,63,0.2)] border border-[#F7B407]/30 overflow-hidden z-50"
                      onMouseEnter={openProfileDropdown}
                      onMouseLeave={scheduleCloseProfileDropdown}
                    >
                      <div
                        className={`px-5 py-4 border-b border-[#EFE6D3] flex items-center gap-3 ${isDistributor ? "bg-[#F7B407]/5" : ""
                          }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-serif text-lg overflow-hidden ${isDistributor
                            ? "bg-[#F7B407] text-[#29293F]"
                            : "bg-[#29293F] text-white"
                            }`}
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
                          <p className="font-serif text-[#29293F] text-[15px] truncate max-w-[140px] flex items-center gap-2">
                            {userName}
                            {isDistributor && (
                              <span className="text-[8px] font-semibold uppercase tracking-wider text-[#F7B407] bg-[#F7B407]/15 px-1.5 py-0.5 rounded">
                                Partner
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#a89c86] truncate max-w-[140px]">
                            {userEmail}
                          </p>
                        </div>
                      </div>

                      <div className="py-1.5">
                        {profileMenuItems.map((item) => (
                          <button
                            key={item.label}
                            onClick={item.onClick}
                            className={`flex items-center gap-3 w-full px-5 py-2.5 text-sm transition-colors duration-150 ${item.isDanger
                              ? "text-[#29293F] hover:bg-red-50 hover:text-[#F7B407] border-t border-[#EFE6D3] mt-1 pt-3"
                              : "text-[#5C534A] hover:bg-[#F7B407]/5 hover:text-[#29293F]"
                              }`}
                          >
                            <item.icon
                              className={`w-4 h-4 ${item.isDanger ? "text-[#29293F]" : ""
                                }`}
                            />
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
                className="lg:hidden p-2 sm:p-2.5 text-[#5C534A] hover:text-[#29293F] transition-colors rounded-full hover:bg-[#F7B407]/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
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
              className="md:hidden border-t border-[#F7B407]/30 bg-[linear-gradient(180deg,#FBF7EF,#F7F0E3)] px-3 sm:px-4 py-3 sm:py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
            >
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div className="flex-1 flex items-center bg-white rounded-full border border-[#F7B407]/30 px-3 sm:px-4 focus-within:border-[#F7B407] focus-within:shadow-[0_0_0_2px_rgba(247,180,7,0.1)]">
                  <Search className="w-4 h-4 text-[#a89c86]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search handmade treasures..."
                    className="bg-transparent text-sm py-2.5 px-2 sm:px-3 w-full outline-none text-[#29293F] placeholder-[#a89c86]"
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
                      className="text-[#a89c86] hover:text-[#29293F]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2.5 bg-[#29293F] text-white rounded-full text-sm font-medium hover:bg-[#F7B407] hover:text-[#29293F] transition-colors whitespace-nowrap"
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
                    className="px-2.5 sm:px-3 py-1.5 bg-white rounded-full text-xs text-[#5C534A] hover:text-[#29293F] transition-colors border border-[#E7DBC0] hover:border-[#F7B407]"
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
                    className="px-2.5 sm:px-3 py-1.5 bg-[#F1E9D9] rounded-full text-xs text-[#5C534A] hover:text-[#29293F] transition-colors border border-[#E7DBC0] hover:border-[#F7B407]"
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
              className="lg:hidden border-t border-[#F7B407]/30 bg-[linear-gradient(180deg,#FBF7EF,#F5ECDF)] overflow-hidden max-h-[80vh] overflow-y-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            >
              <div className="container mx-auto px-3 sm:px-4 py-4 space-y-1">
                {/* User Profile Section */}
                <div
                  className={`flex items-center gap-3 sm:gap-4 pb-4 border-b border-[#EFE6D3] ${isDistributor ? "bg-[#F7B407]/5 -mx-3 px-3 rounded-lg" : ""
                    }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-serif text-lg ${isDistributor
                      ? "bg-[#F7B407] text-[#29293F]"
                      : "bg-[#29293F] text-white"
                      }`}
                  >
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[#29293F] text-[15px] truncate max-w-[180px] flex items-center gap-2">
                      {userName}
                      {isDistributor && (
                        <span className="text-[8px] font-semibold uppercase tracking-wider text-[#F7B407] bg-[#F7B407]/15 px-1.5 py-0.5 rounded">
                          Partner
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#a89c86] truncate max-w-[180px]">
                      {userEmail}
                    </p>
                  </div>
                </div>

                {/* Navigation Items */}
                {mobileNavItems.map((item: any) => {
                  const isPartnerItem =
                    item.label === "Partner Hub" ||
                    item.label === "Earnings" ||
                    item.label === "Products";

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
                          } else if (item.href === "/") goToHome();
                          else if (item.href === "/products") goToProducts();
                          else if (item.href === "/collections")
                            goToCollections();
                          else if (item.href === "/new-arrivals")
                            router.push("/new-arrivals");
                          else if (item.href === "/track-order")
                            goToTrackOrder();
                          else if (item.href === "/dashboard") goToDashboard();
                          else if (item.href === "/partner/dashboard")
                            goToPartnerHub();
                          else if (item.href === "/partner/earnings")
                            goToPartnerEarnings();
                          else if (item.href === "/partner/products")
                            goToPartnerProducts();
                          else router.push(item.href);
                        }}
                        className={`flex items-center justify-between w-full transition-colors duration-150 py-3 px-3 rounded-lg hover:bg-white border-b border-[#F5EEDD] ${isPartnerItem
                          ? "text-[#F7B407] hover:text-[#d49e06]"
                          : "text-[#5C534A] hover:text-[#29293F]"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon
                            className={`w-5 h-5 ${isPartnerItem
                              ? "text-[#F7B407]"
                              : "text-[#a89c86]"
                              }`}
                          />
                          <span className="font-medium">{item.label}</span>
                          {isPartnerItem && (
                            <span className="text-[8px] font-semibold uppercase text-[#F7B407] bg-[#F7B407]/10 px-1.5 py-0.5 rounded">
                              Partner
                            </span>
                          )}
                        </div>
                        {item.hasDropdown && (
                          <ChevronDown
                            className={`w-4 h-4 text-[#a89c86] transition-transform duration-200 ${expandedMobileCategory === item.label
                              ? "rotate-180"
                              : ""
                              }`}
                          />
                        )}
                        {!item.hasDropdown && (
                          <ArrowRight
                            className={`w-4 h-4 ${isPartnerItem
                              ? "text-[#F7B407]"
                              : "text-[#d9cfba]"
                              }`}
                          />
                        )}
                      </button>

                      {/* Mobile Category Dropdown */}
                      {item.hasDropdown &&
                        expandedMobileCategory === item.label && (
                          <div className="pl-9 pr-3 py-2 space-y-1 bg-[#F8F3EA] rounded-b-lg">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#29293F] px-3 py-1">
                              Categories
                            </div>
                            <button
                              onClick={() => {
                                goToProducts();
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-[#5C534A] hover:text-[#29293F] hover:bg-white rounded-lg transition-colors flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F7B407]" />
                              All Products
                            </button>
                            {categories.map((cat: any) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  goToProducts(cat.slug);
                                  setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-[#5C534A] hover:text-[#29293F] hover:bg-white rounded-lg transition-colors flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F7B407]" />
                                {cat.title}
                              </button>
                            ))}
                            {categories.length > 5 && (
                              <button
                                onClick={() => {
                                  goToProducts();
                                  setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-[#29293F] hover:text-[#F7B407] hover:bg-white rounded-lg transition-colors font-medium"
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
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#EFE6D3] mt-3">
                  {!isDistributor && (
                    <button
                      onClick={goToWishlist}
                      className="flex items-center gap-2 text-sm text-[#5C534A] hover:text-[#29293F] transition-colors px-3 sm:px-4 py-2 rounded-lg hover:bg-white"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="bg-[#F7B407] text-[#29293F] text-[10px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                          {wishlistCount}
                        </span>
                      )}
                    </button>
                  )}
                  <button
                    onClick={goToCart}
                    className="flex items-center gap-2 text-sm text-[#5C534A] hover:text-[#29293F] transition-colors px-3 sm:px-4 py-2 rounded-lg hover:bg-white"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="bg-[#F7B407] text-[#29293F] text-[10px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={goToTrackOrder}
                    className="flex items-center gap-2 text-sm text-[#5C534A] hover:text-[#29293F] transition-colors px-3 sm:px-4 py-2 rounded-lg hover:bg-white"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Order</span>
                  </button>
                  <button
                    onClick={openLogoutModal}
                    className="flex items-center gap-2 text-sm text-[#29293F] hover:text-[#F7B407] transition-colors px-3 sm:px-4 py-2 rounded-lg hover:bg-red-50"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hairline accent */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#F7B407] to-transparent shadow-[0_1px_3px_rgba(247,180,7,0.18)]" />
      </header>
    </>
  );
}
