"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import Logo from "../../../public/images/logo.png";
import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "../../lib/slices/toastSlice";
import { useGetCartQuery } from "@/lib/redux/api/cartApi";
import { useGetWishlistQuery } from "@/lib/redux/api/Wishlist/wishlistApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";

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
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#92403F]/10 to-[#C9A227]/10 rounded-full flex items-center justify-center mb-4">
                  <LogOutIcon className="w-10 h-10 text-[#92403F]" />
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#92403F] to-[#7a3635] text-white rounded-xl font-medium hover:from-[#7a3635] hover:to-[#662c2b] transition-all duration-200 shadow-lg shadow-[#92403F]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#C9A227]/20 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#C9A227]/20 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#C9A227]/20 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#C9A227]/20 rounded-br-2xl" />
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
  
  const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // API Queries
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();
  console.log(cartData)
  const { data: wishlistData, isLoading: isWishlistLoading } = useGetWishlistQuery();
  
  // Get products for search suggestions with debounced search query
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery(
    { 
      search: debouncedSearchQuery.length >= 2 ? debouncedSearchQuery : undefined,
      limit: 5 
    },
    { skip: debouncedSearchQuery.length < 2 }
  );

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce delay

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
  const isSearching = isProductsLoading && debouncedSearchQuery.length >= 2;

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout Handler
  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout({
        redirectTo: "/login",
        callApi: true,
        clearReduxState: true,
        clearPersistedState: true,
        onSuccess: () => {
          dispatch(
            showToast({
              message: "Successfully logged out! See you soon 👋",
              type: "success",
            })
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
            })
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
        })
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
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
  };
  
  const goToProducts = () => {
    router.push("/products");
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
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
      router.push(
        `/products?search=${encodeURIComponent(searchQuery)}&category=${searchCategory}`
      );
      setIsSearchFocused(false);
      setIsSearchHovered(false);
      setIsSearchExpanded(false);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      if (searchCloseTimer.current) {
        clearTimeout(searchCloseTimer.current);
        searchCloseTimer.current = null;
      }
    }
  };

  const handleCategorySelect = (category: string) => {
    setSearchCategory(category);
    if (searchQuery.trim()) {
      router.push(
        `/products?search=${encodeURIComponent(searchQuery)}&category=${category}`
      );
      setIsSearchFocused(false);
      setIsSearchHovered(false);
      setIsSearchExpanded(false);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      if (searchCloseTimer.current) {
        clearTimeout(searchCloseTimer.current);
        searchCloseTimer.current = null;
      }
    }
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "Collections", href: "/collections" },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Track Order", href: "/track-order" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  const profileMenuItems = [
    { icon: UserCircle, label: "My Profile", onClick: goToProfile },
    { icon: LayoutDashboard, label: "Dashboard", onClick: goToDashboard },
    { icon: Settings, label: "Settings", onClick: goToProfile },
    {
      icon: LogOutIcon,
      label: "Logout",
      onClick: openLogoutModal,
      isDanger: true,
    },
  ];

  return (
    <>
      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />

      {/* Announcement strip */}
      <div className="hidden sm:flex items-center justify-center gap-3 bg-[#2B2420] text-[#E9DCB8] text-[11px] tracking-[0.12em] uppercase py-2 px-4 border-b border-[#C9A227]/20">
        <span>Handcrafted across India</span>
        <span className="text-[#C9A227]/50">·</span>
        <span>Free shipping over ₹999</span>
        <span className="text-[#C9A227]/50">·</span>
        <span>Every piece made by hand</span>
      </div>

      <header
        className={`bg-[#FBF6EC]/98 backdrop-blur-md sticky top-0 z-40 transition-shadow duration-300 ${
          isScrolled
            ? "shadow-[0_4px_20px_-8px_rgba(43,36,32,0.2)] border-b border-[#E7DBC0]"
            : "border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 flex-shrink-0"
              onClick={goToHome}
            >
              <div className="relative w-9 h-9 rounded-full bg-[#F1E9D9] p-1 border border-[#E7DBC0]">
                <Image
                  src={Logo}
                  alt="Logo"
                  fill
                  className="object-contain p-1.5"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-[20px] tracking-[0.02em] text-[#2B2420]">
                  Indie<span className="text-[#92403F]">Konnect</span>
                </span>
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#a89c86] mt-1">
                  Artisan Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative px-4 py-2 text-[#5C534A] hover:text-[#2B2420] transition-colors duration-200 group"
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.href === "/") goToHome();
                    else if (item.href === "/products") goToProducts();
                    else if (item.href === "/collections") goToCollections();
                    else if (item.href === "/new-arrivals")
                      router.push("/new-arrivals");
                    else if (item.href === "/track-order") goToTrackOrder();
                    else if (item.href === "/dashboard") goToDashboard();
                    else router.push(item.href);
                  }}
                >
                  <span className="tracking-wide">{item.label}</span>
                  <span className="absolute left-4 right-4 -bottom-[1px] h-[1.5px] bg-[#C9A227] scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-200" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search - Desktop with Hover & Click */}
              <div
                ref={searchRef}
                className="relative hidden md:block"
                onMouseEnter={openSearchOnHover}
                onMouseLeave={scheduleCloseSearchOnHover}
              >
                <form onSubmit={handleSearch}>
                  <div
                    className={`flex items-center bg-white rounded-full border transition-all duration-300 ${
                      isSearchExpanded
                        ? "border-[#C9A227] shadow-md"
                        : "border-[#E7DBC0] hover:border-[#C9A227]/50"
                    } ${isSearchExpanded ? "w-72" : "w-11"}`}
                  >
                    <button
                      type="button"
                      onClick={toggleSearch}
                      className="flex items-center justify-center w-11 h-11 flex-shrink-0"
                    >
                      <Search
                        className={`w-4 h-4 transition-colors duration-200 ${
                          isSearchExpanded ? "text-[#C9A227]" : "text-[#a89c86]"
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
                            className="bg-transparent text-[13px] py-2.5 px-2 outline-none text-[#2B2420] placeholder-[#a89c86] w-full min-w-[180px]"
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
                              className="text-[#a89c86] hover:text-[#92403F] mr-3 p-0.5 flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>

                {/* Search Dropdown */}
                <AnimatePresence>
                  {isSearchExpanded && (searchQuery.length >= 2 || isSearching) && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-3 w-[450px] bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(43,36,32,0.25)] border border-[#E7DBC0] overflow-hidden z-50"
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
                          <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
                          <span className="ml-3 text-sm text-[#8a7f6e]">Searching products...</span>
                        </div>
                      )}

                      {/* Product Suggestions */}
                      {!isSearching && hasSuggestions && (
                        <>
                          <div className="px-4 py-3 border-b border-[#EFE6D3]">
                            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#a89c86] mb-2">
                              <Package className="w-3.5 h-3.5" />
                              Products ({productSuggestions.length})
                            </div>
                            <div className="space-y-1">
                              {productSuggestions.map((product: any) => (
                                <button
                                  key={product.id}
                                  onClick={() => goToProductDetail(product.slug)}
                                  className="w-full text-left px-3 py-2.5 hover:bg-[#FBF6EC] rounded-lg transition-colors duration-150 flex items-center gap-3 group"
                                >
                                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#F1E9D9] border border-[#E7DBC0]">
                                    <Image
                                      src={product.primary_image_url || "/images/placeholder.jpg"}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm text-[#2B2420] group-hover:text-[#92403F] transition-colors truncate">
                                        {product.name}
                                      </span>
                                      <span className="text-[10px] text-[#a89c86] bg-[#F1E9D9] px-2 py-0.5 rounded-full truncate max-w-[80px]">
                                        {product.category?.name || "Uncategorized"}
                                      </span>
                                    </div>
                                    <span className="text-sm font-semibold text-[#2B2420]">
                                      {product.retail_price_formatted || "₹0.00"}
                                    </span>
                                  </div>
                                  <ArrowRight className="w-3.5 h-3.5 text-[#d9cfba] group-hover:text-[#C9A227] transition-colors flex-shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* View All Button */}
                          <div className="px-4 py-3 border-t border-[#EFE6D3]">
                            <button
                              onClick={() => {
                                router.push(`/products?search=${encodeURIComponent(searchQuery)}&category=${searchCategory}`);
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
                              className="w-full py-2.5 bg-gradient-to-r from-[#2B2420] to-[#3d322b] text-white rounded-lg text-sm font-medium hover:from-[#92403F] hover:to-[#7a3635] transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              View All Products
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}

                      {/* No Products Found */}
                      {!isSearching && debouncedSearchQuery.length >= 2 && !hasSuggestions && (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                          <PackageOpen className="w-14 h-14 text-[#E7DBC0] mb-4" />
                          <p className="text-base text-[#2B2420] font-serif">No products found</p>
                          <p className="text-sm text-[#a89c86] mt-1">
                            We couldn't find any products matching "{searchQuery}"
                          </p>
                          <button
                            onClick={() => {
                              router.push(`/products?search=${encodeURIComponent(searchQuery)}&category=${searchCategory}`);
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
                            className="mt-4 px-6 py-2.5 bg-[#2B2420] text-white rounded-full text-sm font-medium hover:bg-[#92403F] transition-colors"
                          >
                            Browse All Products
                          </button>
                        </div>
                      )}

                      <div className="px-4 py-2.5 border-t border-[#EFE6D3] flex items-center justify-between">
                        <span className="text-[10px] text-[#a89c86]">
                          {debouncedSearchQuery.length >= 2 ? `Showing ${productSuggestions.length} results` : "Type at least 2 characters to search"}
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
                className="md:hidden p-2.5 text-[#5C534A] hover:text-[#2B2420] transition-colors rounded-full hover:bg-[#F1E9D9]"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen)
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button
                onClick={goToWishlist}
                className="p-2.5 text-[#5C534A] hover:text-[#92403F] transition-colors rounded-full hover:bg-[#F1E9D9] relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#92403F] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-semibold ring-2 ring-[#FBF6EC]">
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
                  className="p-2.5 text-[#5C534A] hover:text-[#92403F] transition-colors rounded-full hover:bg-[#F1E9D9] relative"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#C9A227] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-semibold ring-2 ring-[#FBF6EC]">
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
                      className="absolute right-0 top-full mt-3 w-96 bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(43,36,32,0.25)] border border-[#E7DBC0] overflow-hidden z-50"
                      onMouseEnter={openCartDropdown}
                      onMouseLeave={scheduleCloseCartDropdown}
                    >
                      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFE6D3]">
                        <div>
                          <span className="font-serif text-[#2B2420] text-[15px]">
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
                          className="text-[#a89c86] hover:text-[#2B2420] transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {isCartLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
                        </div>
                      ) : cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <PackageOpen className="w-14 h-14 text-[#E7DBC0] mb-4" />
                          <p className="text-base text-[#5C534A] font-serif">
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
                            className="mt-4 px-6 py-2.5 bg-[#2B2420] text-white rounded-full text-sm font-medium hover:bg-[#3d322b] transition-colors"
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
                                      item.product?.primary_image || "/images/placeholder.jpg"
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
                                    className="text-sm font-medium text-[#2B2420] truncate block hover:text-[#92403F] transition-colors"
                                  >
                                    {item.product?.name || "Product"}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-sm font-semibold text-[#2B2420]">
                                      ₹{item.current_unit_price_formatted || item.current_unit_price}
                                    </span>
                                    <span className="text-xs text-[#a89c86]">
                                      × {item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    // Handle remove from cart
                                    // You can implement this with a mutation
                                  }}
                                  className="p-2 text-[#a89c86] hover:text-[#92403F] rounded-full transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
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
                              <span className="text-lg font-serif text-[#2B2420]">
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
                                  // You can implement this with a mutation
                                }}
                                className="flex-1 py-2.5 bg-white text-[#5C534A] rounded-lg text-sm font-medium hover:bg-[#F1E9D9] transition-colors border border-[#E7DBC0]"
                              >
                                Clear
                              </button>
                              <button
                                onClick={goToCart}
                                className="flex-1 py-2.5 bg-[#2B2420] text-white rounded-lg text-sm font-semibold hover:bg-[#92403F] transition-colors flex items-center justify-center gap-2"
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
                className="relative"
                onMouseEnter={openProfileDropdown}
                onMouseLeave={scheduleCloseProfileDropdown}
              >
                <button
                  className="flex items-center gap-2 p-1 pr-2 text-[#5C534A] hover:text-[#2B2420] transition-colors rounded-full hover:bg-[#F1E9D9]"
                  aria-label="Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2B2420] flex items-center justify-center text-[#F3E6C4] font-serif text-sm">
                    P
                  </div>
                  <span className="text-[13px] font-medium hidden sm:block">
                    Priya
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#a89c86]" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-3 w-60 bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(43,36,32,0.25)] border border-[#E7DBC0] overflow-hidden z-50"
                      onMouseEnter={openProfileDropdown}
                      onMouseLeave={scheduleCloseProfileDropdown}
                    >
                      <div className="px-5 py-4 border-b border-[#EFE6D3] flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#2B2420] flex items-center justify-center text-[#F3E6C4] font-serif text-lg">
                          P
                        </div>
                        <div>
                          <p className="font-serif text-[#2B2420] text-[15px]">
                            Priya Sharma
                          </p>
                          <p className="text-xs text-[#a89c86]">
                            priya@email.com
                          </p>
                        </div>
                      </div>

                      <div className="py-1.5">
                        {profileMenuItems.map((item) => (
                          <button
                            key={item.label}
                            onClick={item.onClick}
                            className={`flex items-center gap-3 w-full px-5 py-2.5 text-sm transition-colors duration-150 ${
                              item.isDanger
                                ? "text-[#92403F] hover:bg-red-50 hover:text-[#7a3635] border-t border-[#EFE6D3] mt-1 pt-3"
                                : "text-[#5C534A] hover:bg-[#FBF6EC] hover:text-[#2B2420]"
                            }`}
                          >
                            <item.icon
                              className={`w-4 h-4 ${
                                item.isDanger ? "text-[#92403F]" : ""
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
                className="lg:hidden p-2.5 text-[#5C534A] hover:text-[#2B2420] transition-colors rounded-full hover:bg-[#F1E9D9]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
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
              className="md:hidden border-t border-[#EFE6D3] bg-[#FBF6EC] px-4 py-4"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <div className="flex-1 flex items-center bg-white rounded-full border border-[#E7DBC0] px-4">
                  <Search className="w-4 h-4 text-[#a89c86]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search handmade treasures..."
                    className="bg-transparent text-sm py-2.5 px-3 w-full outline-none text-[#2B2420] placeholder-[#a89c86]"
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
                      className="text-[#a89c86] hover:text-[#92403F]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2B2420] text-white rounded-full text-sm font-medium hover:bg-[#92403F] transition-colors whitespace-nowrap"
                >
                  Search
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.slice(0, 4).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSearchCategory(cat.name);
                      router.push(
                        `/products?category=${encodeURIComponent(cat.name)}`
                      );
                      setIsSearchOpen(false);
                    }}
                    className="px-3 py-1.5 bg-white rounded-full text-xs text-[#5C534A] hover:text-[#2B2420] transition-colors border border-[#E7DBC0]"
                  >
                    {cat.name}
                  </button>
                ))}
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
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-[#EFE6D3] bg-[#FBF6EC] overflow-hidden"
            >
              <div className="container mx-auto px-4 py-5 space-y-1">
                <div className="flex items-center gap-4 pb-4 border-b border-[#EFE6D3]">
                  <div className="w-11 h-11 rounded-full bg-[#2B2420] flex items-center justify-center text-[#F3E6C4] font-serif text-lg">
                    P
                  </div>
                  <div>
                    <p className="font-serif text-[#2B2420] text-[15px]">
                      Priya Sharma
                    </p>
                    <p className="text-xs text-[#a89c86]">priya@email.com</p>
                  </div>
                </div>

                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between text-[#5C534A] hover:text-[#2B2420] transition-colors duration-150 py-3 px-3 rounded-lg hover:bg-white border-b border-[#F5EEDD]"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.href === "/") goToHome();
                      else if (item.href === "/products") goToProducts();
                      else if (item.href === "/collections") goToCollections();
                      else if (item.href === "/new-arrivals")
                        router.push("/new-arrivals");
                      else if (item.href === "/track-order") goToTrackOrder();
                      else if (item.href === "/dashboard") goToDashboard();
                      else router.push(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span className="font-medium">{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-[#d9cfba]" />
                  </Link>
                ))}

                <div className="flex items-center gap-3 pt-4 flex-wrap border-t border-[#EFE6D3] mt-3">
                  <button
                    onClick={goToWishlist}
                    className="flex items-center gap-2 text-sm text-[#5C534A] hover:text-[#92403F] transition-colors px-4 py-2 rounded-lg hover:bg-white"
                  >
                    <Heart className="w-4 h-4" />
                    Wishlist ({wishlistCount})
                  </button>
                  <button
                    onClick={goToCart}
                    className="flex items-center gap-2 text-sm text-[#5C534A] hover:text-[#92403F] transition-colors px-4 py-2 rounded-lg hover:bg-white"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Cart ({cartCount})
                  </button>
                  <button
                    onClick={openLogoutModal}
                    className="flex items-center gap-2 text-sm text-[#92403F] hover:text-[#7a3635] transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hairline accent */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent" />
      </header>
    </>
  );
}