"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import {
    User,
    Package,
    Heart,
    Settings,
    LogOut,
    Star,
    Crown,
    ChevronRight,
    Gift,
    Loader2,
    AlertCircle,
    MapPin,
    BarChart3,
} from "lucide-react";

import { useLogout } from "@/lib/hooks/useLogout";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { showToast } from "../../lib/slices/toastSlice";

import { useGetMyOrdersQuery } from "@/lib/redux/api/order/orderApi";
import { useGetWishlistQuery } from "@/lib/redux/api/Wishlist/wishlistApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/Profile/userApi";

interface ProfileSidebarProps {
    name: string;
    email: string;
    rating: number;
    activeTab: string;
    onTabChange: (tab: string) => void;
    accountType?: string;
    earningsData?: {
        total_earnings?: number;
        total_commission?: number;
        total_bonus?: number;
        total_points?: number;
        rank?: string;
    };
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <div className="h-1 w-full bg-gradient-to-r from-[#C9A227] via-[#92403F] to-[#C9A227] bg-[length:200%_100%] animate-gradient" />

                <div className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#92403F]/10 to-[#C9A227]/10">
                        <LogOut className="h-10 w-10 text-[#92403F]" />
                    </div>

                    <h3 className="mb-2 font-serif text-2xl text-[#2B2420]">
                        Logout Confirmation
                    </h3>

                    <p className="text-sm leading-relaxed text-[#8a7f6e]">
                        Are you sure you want to logout? You'll need to login again to
                        access your account.
                    </p>

                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200/50 bg-amber-50 p-3 text-left">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />

                        <p className="text-xs text-amber-800">
                            Your session will be ended and you'll be redirected to the login
                            page.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 border-t border-[#EFE6D3] bg-[#FBF6EC] px-6 py-5">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-xl border border-[#E7DBC0] bg-white px-4 py-3 font-medium text-[#5C534A] transition-all duration-200 hover:bg-[#F1E9D9] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#92403F] to-[#7a3635] px-4 py-3 font-medium text-white shadow-lg shadow-[#92403F]/20 transition-all duration-200 hover:from-[#7a3635] hover:to-[#662c2b] disabled:cursor-not-allowed disabled:opacity-70"
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

                <div className="absolute left-0 top-0 h-12 w-12 rounded-tl-2xl border-l-2 border-t-2 border-[#C9A227]/20" />
                <div className="absolute right-0 top-0 h-12 w-12 rounded-tr-2xl border-r-2 border-t-2 border-[#C9A227]/20" />
                <div className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-b-2 border-l-2 border-[#C9A227]/20" />
                <div className="absolute bottom-0 right-0 h-12 w-12 rounded-br-2xl border-b-2 border-r-2 border-[#C9A227]/20" />
            </motion.div>
        </motion.div>
    );
};

/* =========================================================
   PROFILE SIDEBAR
========================================================= */

export default function ProfileSidebar({
    name,
    email,
    rating,
    activeTab,
    onTabChange,
    accountType = "Standard",
    earningsData,
}: ProfileSidebarProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { logout } = useLogout();

    /* =========================================================
       TOKEN CHECK
    ========================================================= */

    const { hasToken } = useTokenCheck();

    /* =========================================================
       PROFILE API
       
       Guest user:
       skip=true
       
       Logged-in user:
       API runs normally
    ========================================================= */

    const {
        data: profileData,
        isLoading: profileLoading,
    } = useGetUserProfileQuery(undefined, {
        skip: hasToken !== true,
    });

    const userProfile = profileData?.user;

    const profileImage = userProfile?.profile_picture;

    const profileName = userProfile?.full_name || name;

    const profileEmail = userProfile?.email || email;

    /* =========================================================
       STATES
    ========================================================= */

    const [showLogoutModal, setShowLogoutModal] =
        useState(false);

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    /* =========================================================
       ORDERS API
       
       Guest user:
       skip=true
    ========================================================= */

    const {
        data: ordersData,
        isLoading: ordersLoading,
    } = useGetMyOrdersQuery(undefined, {
        skip: hasToken !== true,
    });

    const orderCount =
        ordersData?.data?.length || 0;

    /* =========================================================
       WISHLIST API
       
       Guest user:
       skip=true
    ========================================================= */

    const {
        data: wishlistData,
        isLoading: wishlistLoading,
    } = useGetWishlistQuery(undefined, {
        skip: hasToken !== true,
    });

    const wishlistCount =
        wishlistData?.data?.items?.length ||
        wishlistData?.data?.length ||
        0;

    /* =========================================================
       ACCOUNT TYPE
    ========================================================= */

    const isDistributor =
        accountType?.toLowerCase() === "distributor";

    /* =========================================================
       NAVIGATION ITEMS
    ========================================================= */

    const navItems = [
        {
            icon: User,
            label: "Overview",
            tab: "overview",
        },
        {
            icon: Package,
            label: "My Orders",
            tab: "orders",
            badge: "0",
        },
        {
            icon: Heart,
            label: "Wishlist",
            tab: "wishlist",
            badge: "0",
        },
        {
            icon: MapPin,
            label: "Manage Address",
            tab: "address",
        },
        {
            icon: Settings,
            label: "Account Settings",
            tab: "settings",
        },
    ];

    /* =========================================================
       DISTRIBUTOR NAVIGATION
    ========================================================= */

    const distributorNavItems = [
        {
            icon: User,
            label: "Overview",
            tab: "overview",
        },
        {
            icon: BarChart3,
            label: "Earnings",
            tab: "earning",
        },
        {
            icon: Package,
            label: "My Orders",
            tab: "orders",
            badge: "0",
        },
        {
            icon: Heart,
            label: "Wishlist",
            tab: "wishlist",
            badge: "0",
        },
        {
            icon: MapPin,
            label: "Manage Address",
            tab: "address",
        },
        {
            icon: Settings,
            label: "Account Settings",
            tab: "settings",
        },
    ];

    const finalNavItems = isDistributor
        ? distributorNavItems
        : navItems;

    /* =========================================================
       UPDATED NAV ITEMS
    ========================================================= */

    const [updatedNavItems, setUpdatedNavItems] =
        useState(finalNavItems);

    useEffect(() => {
        const itemsToUpdate = isDistributor
            ? distributorNavItems
            : navItems;

        setUpdatedNavItems(
            itemsToUpdate.map((item) => {
                if (item.tab === "orders") {
                    return {
                        ...item,
                        badge:
                            hasToken !== true
                                ? "0"
                                : ordersLoading
                                    ? "..."
                                    : String(orderCount),
                    };
                }

                if (item.tab === "wishlist") {
                    return {
                        ...item,
                        badge:
                            hasToken !== true
                                ? "0"
                                : wishlistLoading
                                    ? "..."
                                    : String(wishlistCount),
                    };
                }

                return item;
            }),
        );
    }, [
        orderCount,
        wishlistCount,
        ordersLoading,
        wishlistLoading,
        isDistributor,
        hasToken,
    ]);

    /* =========================================================
       TAB NAVIGATION
    ========================================================= */

    const handleNavigation = (tab: string) => {
        onTabChange(tab);
    };

    /* =========================================================
       LOGOUT
    ========================================================= */

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const closeLogoutModal = () => {
        if (!isLoggingOut) {
            setShowLogoutModal(false);
        }
    };

    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true);

        try {
            await logout({
                redirectTo: "/",
                callApi: true,
                clearReduxState: true,
                clearPersistedState: true,

                onSuccess: () => {
                    dispatch(
                        showToast({
                            message:
                                "Successfully logged out! See you soon 👋",
                            type: "success",
                        }),
                    );

                    setIsLoggingOut(false);
                    setShowLogoutModal(false);
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
        } catch {
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

    /* =========================================================
       FORMAT CURRENCY
    ========================================================= */

    const formatCurrency = (
        amount: number = 0,
    ) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

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

            <div className="sticky top-24 overflow-hidden rounded-2xl border border-[#E7DBC0]/40 bg-white shadow-[0_8px_40px_-12px_rgba(43,36,32,0.15)] transition-all duration-300 hover:shadow-[0_12px_48px_-12px_rgba(43,36,32,0.25)]">
                <div className="h-1 w-full bg-gradient-to-r from-[#C9A227] via-[#92403F] to-[#C9A227] bg-[length:200%_100%] animate-gradient" />

                {/* ===================================================
            PROFILE CARD
        =================================================== */}

                <div className="relative border-b border-[#EFE6D3] bg-gradient-to-b from-[#FBF6EC]/50 to-transparent p-6 text-center">
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#F7B407] to-transparent" />

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative mx-auto mb-4 h-24 w-24"
                    >
                        <div className="h-full w-full overflow-hidden rounded-full border-2 border-[#F7B407]/30 bg-white p-[2px]">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={profileName}
                                    className="h-full w-full rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-black">
                                    <span className="font-serif text-3xl font-semibold uppercase text-white">
                                        {profileName?.charAt(0) || "U"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ONLINE STATUS */}
                        <div className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-400 shadow-md">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        </div>
                    </motion.div>

                    <h3 className="font-serif text-[20px] tracking-[0.02em] capitalize text-[#2B2420]">
                        {profileName}
                    </h3>

                    <p
                        className="text-sm font-light tracking-wide text-[#8a7f6e]"
                        style={{ fontFamily: "Jost, sans-serif" }}
                    >
                        {profileEmail}
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center justify-center gap-3"
                    >
                        <div className="flex items-center gap-1.5 rounded-full border border-[#FDCB00]/20 bg-[#FDCB00]/10 px-3 py-1.5">
                            <Star className="h-3.5 w-3.5 fill-[#FDCB00] text-[#FDCB00]" />

                            <span
                                className="text-sm font-medium text-[#2B2420]"
                                style={{
                                    fontFamily: "Jost, sans-serif",
                                }}
                            >
                                {rating}
                            </span>

                            <span
                                className="text-xs text-[#8a7f6e]"
                                style={{
                                    fontFamily: "Jost, sans-serif",
                                }}
                            >
                                (4.8k)
                            </span>
                        </div>

                        <div className="h-6 w-px bg-[#E7DBC0]" />

                        <div className="flex items-center gap-1.5 rounded-full border border-[#92403F]/10 bg-[#92403F]/5 px-3 py-1.5">
                            <Crown className="h-3.5 w-3.5 text-[#C9A227]" />

                            <span
                                className="text-xs font-medium text-[#92403F]"
                                style={{
                                    fontFamily: "Jost, sans-serif",
                                }}
                            >
                                {accountType}
                            </span>
                        </div>
                    </motion.div>

                    {/* =================================================
              DISTRIBUTOR EARNINGS
          ================================================= */}

                    {isDistributor &&
                        earningsData && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay: 0.1,
                                }}
                                className="mt-4 rounded-xl border border-[#C9A227]/20 bg-gradient-to-r from-[#C9A227]/5 to-[#92403F]/5 p-4"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center">
                                        <p
                                            className="text-[10px] uppercase tracking-wider text-[#8a7f6e]"
                                            style={{
                                                fontFamily:
                                                    "Jost, sans-serif",
                                            }}
                                        >
                                            Total Earnings
                                        </p>

                                        <p className="text-lg font-bold text-[#2B2420]">
                                            {formatCurrency(
                                                earningsData?.total_earnings ||
                                                0,
                                            )}
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <p
                                            className="text-[10px] uppercase tracking-wider text-[#8a7f6e]"
                                            style={{
                                                fontFamily:
                                                    "Jost, sans-serif",
                                            }}
                                        >
                                            Total Points
                                        </p>

                                        <p className="text-lg font-bold text-[#C9A227]">
                                            {earningsData?.total_points ||
                                                0}
                                        </p>
                                    </div>

                                    <div className="col-span-2 border-t border-[#E7DBC0]/50 pt-2 text-center">
                                        <p
                                            className="text-[10px] uppercase tracking-wider text-[#8a7f6e]"
                                            style={{
                                                fontFamily:
                                                    "Jost, sans-serif",
                                            }}
                                        >
                                            Current Rank
                                        </p>

                                        <p className="flex items-center justify-center gap-1 text-sm font-semibold text-[#92403F]">
                                            <Crown className="h-3.5 w-3.5 text-[#C9A227]" />

                                            {earningsData?.rank ||
                                                "Standard"}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                </div>

                {/* ===================================================
            NAVIGATION
        =================================================== */}

                <nav className="space-y-1 p-3">
                    {updatedNavItems.map((item) => (
                        <motion.button
                            key={item.label}
                            whileHover={{ x: 6 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() =>
                                handleNavigation(item.tab)
                            }
                            className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${activeTab === item.tab
                                    ? "border border-[#FDCB00]/20 bg-gradient-to-r from-[#FDCB00]/10 to-transparent font-semibold text-[#1a1a2e] shadow-sm"
                                    : "text-[#5C534A] hover:bg-[#FBF6EC] hover:text-[#2B2420]"
                                }`}
                            style={{
                                fontFamily: "Jost, sans-serif",
                            }}
                        >
                            {activeTab === item.tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#C9A227] to-[#92403F]"
                                />
                            )}

                            <div
                                className={`rounded-lg p-1.5 transition-all duration-200 ${activeTab === item.tab
                                        ? "bg-[#FDCB00]/20 text-[#C9A227]"
                                        : "bg-transparent text-[#8a7f6e] group-hover:bg-[#E7DBC0]/30"
                                    }`}
                            >
                                <item.icon
                                    className={`h-4 w-4 ${activeTab === item.tab
                                            ? "text-[#C9A227]"
                                            : ""
                                        }`}
                                />
                            </div>

                            <span className="flex-1 text-left font-medium tracking-wide">
                                {item.label}
                            </span>

                            {item.badge && (
                                <span
                                    className={`min-w-[20px] rounded-full px-2 py-0.5 text-center text-[10px] font-semibold transition-all duration-200 ${activeTab === item.tab
                                            ? "bg-[#92403F] text-white"
                                            : "bg-[#E7DBC0] text-[#5C534A] group-hover:bg-[#C9A227] group-hover:text-white"
                                        }`}
                                    style={{
                                        fontFamily: "Jost, sans-serif",
                                    }}
                                >
                                    {item.badge}
                                </span>
                            )}

                            <ChevronRight
                                className={`h-3.5 w-3.5 transition-all duration-200 ${activeTab === item.tab
                                        ? "text-[#C9A227] opacity-100"
                                        : "text-[#d9cfba] opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                                    }`}
                            />
                        </motion.button>
                    ))}

                    {/* =================================================
              ACCOUNT DIVIDER
          ================================================= */}

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#EFE6D3]" />
                        </div>

                        <div className="relative flex justify-center">
                            <span
                                className="bg-white px-3 text-[10px] font-medium uppercase tracking-widest text-[#a89c86]"
                                style={{
                                    fontFamily: "Jost, sans-serif",
                                }}
                            >
                                Account
                            </span>
                        </div>
                    </div>

                    {/* =================================================
              LOGOUT
          ================================================= */}

                    <motion.button
                        whileHover={{ x: 6 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleLogoutClick}
                        className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#92403F] transition-all duration-200 hover:bg-red-50"
                        style={{
                            fontFamily: "Jost, sans-serif",
                        }}
                    >
                        <div className="rounded-lg bg-red-50 p-1.5 text-[#92403F] transition-all duration-200 group-hover:bg-red-100">
                            <LogOut className="h-4 w-4" />
                        </div>

                        <span className="font-medium tracking-wide">
                            Log Out
                        </span>

                        <div className="flex-1" />

                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 transition-all duration-200 group-hover:bg-red-100">
                            <ChevronRight className="h-3.5 w-3.5 text-[#92403F]/50 transition-all duration-200 group-hover:text-[#92403F]" />
                        </div>
                    </motion.button>

                    {/* =================================================
              PREMIUM BENEFITS
          ================================================= */}

                    <div className="mt-4 rounded-xl border border-[#C9A227]/10 bg-gradient-to-r from-[#1a1a2e]/5 to-[#92403F]/5 p-3">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#C9A227]/10 p-1.5">
                                <Gift className="h-3.5 w-3.5 text-[#C9A227]" />
                            </div>

                            <div className="flex-1">
                                <p
                                    className="text-[10px] font-medium tracking-wide text-[#2B2420]"
                                    style={{
                                        fontFamily: "Jost, sans-serif",
                                    }}
                                >
                                    ✨ Premium Benefits
                                </p>

                                <p
                                    className="text-[9px] tracking-wide text-[#8a7f6e]"
                                    style={{
                                        fontFamily: "Jost, sans-serif",
                                    }}
                                >
                                    {isDistributor
                                        ? "Exclusive distributor rewards & offers"
                                        : "Unlock exclusive rewards & offers"}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="text-[10px] font-semibold text-[#C9A227] transition-colors hover:text-[#92403F]"
                                style={{
                                    fontFamily: "Jost, sans-serif",
                                }}
                            >
                                {isDistributor
                                    ? "View Details"
                                    : "Upgrade"}
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent" />
            </div>
        </>
    );
}