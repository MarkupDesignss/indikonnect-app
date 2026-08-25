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
    IndianRupee,
    BarChart3,
} from "lucide-react";
import { useLogout } from "@/lib/hooks/useLogout";
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
            >
                <div className="h-1 w-full bg-gradient-to-r from-[#C9A227] via-[#92403F] to-[#C9A227] bg-[length:200%_100%] animate-gradient" />

                <div className="p-6 text-center">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#92403F]/10 to-[#C9A227]/10 rounded-full flex items-center justify-center mb-4">
                        <LogOut className="w-10 h-10 text-[#92403F]" />
                    </div>
                    <h3 className="text-2xl font-serif text-[#2B2420] mb-2">
                        Logout Confirmation
                    </h3>
                    <p className="text-sm text-[#8a7f6e] leading-relaxed">
                        Are you sure you want to logout? You'll need to login again to access your account.
                    </p>

                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/50 flex items-start gap-3 text-left">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                            Your session will be ended and you'll be redirected to the login page.
                        </p>
                    </div>
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

                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#C9A227]/20 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#C9A227]/20 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#C9A227]/20 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#C9A227]/20 rounded-br-2xl" />
            </motion.div>
        </motion.div>
    );
};

export default function ProfileSidebar({
    name,
    email,
    rating,
    activeTab,
    onTabChange,
    accountType = "Standard",
    earningsData
}: ProfileSidebarProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { logout } = useLogout();

    const { data: profileData, isLoading: profileLoading } =
        useGetUserProfileQuery({});

    const userProfile = profileData?.user;

    const profileImage = userProfile?.profile_picture;
    const profileName = userProfile?.full_name || name;
    const profileEmail = userProfile?.email || email;

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const { data: ordersData, isLoading: ordersLoading } = useGetMyOrdersQuery({});
    const orderCount = ordersData?.data?.length || 0;

    const { data: wishlistData, isLoading: wishlistLoading } = useGetWishlistQuery({});
    const wishlistCount = wishlistData?.data?.items?.length || wishlistData?.data?.length || 0;

    const isDistributor = accountType?.toLowerCase() === "distributor";

    // Navigation items
    const navItems = [
        { icon: User, label: "Overview", tab: "overview" },
        { icon: Package, label: "My Orders", tab: "orders", badge: "0" },
        { icon: Heart, label: "Wishlist", tab: "wishlist", badge: "0" },
        { icon: MapPin, label: "Manage Address", tab: "address" },
        { icon: Settings, label: "Account Settings", tab: "settings" },
    ];

    // Add Earnings tab for distributors
    const distributorNavItems = [
        { icon: User, label: "Overview", tab: "overview" },
        { icon: BarChart3, label: "Earnings", tab: "earning" },
        { icon: Package, label: "My Orders", tab: "orders", badge: "0" },
        { icon: Heart, label: "Wishlist", tab: "wishlist", badge: "0" },
        { icon: MapPin, label: "Manage Address", tab: "address" },
        { icon: Settings, label: "Account Settings", tab: "settings" },
    ];

    const finalNavItems = isDistributor ? distributorNavItems : navItems;

    // Update badges when data changes
    const [updatedNavItems, setUpdatedNavItems] = useState(finalNavItems);

    useEffect(() => {
        const itemsToUpdate = isDistributor ? distributorNavItems : navItems;
        setUpdatedNavItems(prevItems =>
            itemsToUpdate.map(item => {
                if (item.tab === "orders") {
                    return { ...item, badge: ordersLoading ? "..." : String(orderCount) };
                }
                if (item.tab === "wishlist") {
                    return { ...item, badge: wishlistLoading ? "..." : String(wishlistCount) };
                }
                return item;
            })
        );
    }, [orderCount, wishlistCount, ordersLoading, wishlistLoading, isDistributor]);

    const handleNavigation = (tab: string) => {
        onTabChange(tab);
    };

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

    // Format currency
    const formatCurrency = (amount: number = 0) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <>
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={closeLogoutModal}
                onConfirm={handleLogoutConfirm}
                isLoading={isLoggingOut}
            />

            <div className="bg-white rounded-2xl shadow-[0_8px_40px_-12px_rgba(43,36,32,0.15)] border border-[#E7DBC0]/40 overflow-hidden sticky top-24 transition-all duration-300 hover:shadow-[0_12px_48px_-12px_rgba(43,36,32,0.25)]">

                <div className="h-1 w-full bg-gradient-to-r from-[#C9A227] via-[#92403F] to-[#C9A227] bg-[length:200%_100%] animate-gradient" />

                {/* Profile Card */}
                <div className="p-6 text-center border-b border-[#EFE6D3] bg-gradient-to-b from-[#FBF6EC]/50 to-transparent relative">
                    {/* Yellow Border Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#F7B407] to-transparent" />

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative w-24 h-24 mx-auto mb-4"
                    >
                        <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden border-2 border-[#F7B407]/30">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={profileName}
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "";
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                    <span className="text-3xl font-serif font-semibold text-white uppercase">
                                        {profileName?.charAt(0) || "U"}
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Online Status */}
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                    </motion.div>

                    <h3 className="font-serif text-[20px] tracking-[0.02em] text-[#2B2420] capitalize">
                        {profileName}
                    </h3>

                    <p
                        className="text-sm text-[#8a7f6e] font-light tracking-wide"
                        style={{ fontFamily: "Jost, sans-serif" }}
                    >
                        {profileEmail}
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-3 mt-3"
                    >
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FDCB00]/10 rounded-full border border-[#FDCB00]/20">
                            <Star className="w-3.5 h-3.5 fill-[#FDCB00] text-[#FDCB00]" />
                            <span
                                className="text-sm font-medium text-[#2B2420]"
                                style={{ fontFamily: "Jost, sans-serif" }}
                            >
                                {rating}
                            </span>
                            <span
                                className="text-xs text-[#8a7f6e]"
                                style={{ fontFamily: "Jost, sans-serif" }}
                            >
                                (4.8k)
                            </span>
                        </div>

                        <div className="w-px h-6 bg-[#E7DBC0]" />

                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#92403F]/5 rounded-full border border-[#92403F]/10">
                            <Crown className="w-3.5 h-3.5 text-[#C9A227]" />
                            <span
                                className="text-xs font-medium text-[#92403F]"
                                style={{ fontFamily: "Jost, sans-serif" }}
                            >
                                {accountType}
                            </span>
                        </div>
                    </motion.div>

                    {/* Earnings Section for Distributors */}
                    {isDistributor && earningsData && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mt-4 p-4 bg-gradient-to-r from-[#C9A227]/5 to-[#92403F]/5 rounded-xl border border-[#C9A227]/20"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                    <p className="text-[10px] text-[#8a7f6e] uppercase tracking-wider" style={{ fontFamily: "Jost, sans-serif" }}>
                                        Total Earnings
                                    </p>
                                    <p className="text-lg font-bold text-[#2B2420]">
                                        {formatCurrency(earningsData?.total_earnings || 0)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-[#8a7f6e] uppercase tracking-wider" style={{ fontFamily: "Jost, sans-serif" }}>
                                        Total Points
                                    </p>
                                    <p className="text-lg font-bold text-[#C9A227]">
                                        {earningsData?.total_points || 0}
                                    </p>
                                </div>
                                <div className="text-center col-span-2 pt-2 border-t border-[#E7DBC0]/50">
                                    <p className="text-[10px] text-[#8a7f6e] uppercase tracking-wider" style={{ fontFamily: "Jost, sans-serif" }}>
                                        Current Rank
                                    </p>
                                    <p className="text-sm font-semibold text-[#92403F] flex items-center justify-center gap-1">
                                        <Crown className="w-3.5 h-3.5 text-[#C9A227]" />
                                        {earningsData?.rank || "Standard"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {updatedNavItems.map((item) => (
                        <motion.button
                            key={item.label}
                            whileHover={{ x: 6 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleNavigation(item.tab)}
                            className={`group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 ${activeTab === item.tab
                                    ? "bg-gradient-to-r from-[#FDCB00]/10 to-transparent text-[#1a1a2e] font-semibold border border-[#FDCB00]/20 shadow-sm"
                                    : "text-[#5C534A] hover:bg-[#FBF6EC] hover:text-[#2B2420]"
                                }`}
                            style={{ fontFamily: 'Jost, sans-serif' }}
                        >
                            {activeTab === item.tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#C9A227] to-[#92403F] rounded-r-full"
                                />
                            )}

                            <div className={`p-1.5 rounded-lg transition-all duration-200 ${activeTab === item.tab
                                    ? "bg-[#FDCB00]/20 text-[#C9A227]"
                                    : "bg-transparent text-[#8a7f6e] group-hover:bg-[#E7DBC0]/30"
                                }`}>
                                <item.icon className={`w-4 h-4 ${activeTab === item.tab ? "text-[#C9A227]" : ""
                                    }`} />
                            </div>

                            <span className="flex-1 text-left font-medium tracking-wide">
                                {item.label}
                            </span>

                            {item.badge && (
                                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full min-w-[20px] text-center ${activeTab === item.tab
                                        ? "bg-[#92403F] text-white"
                                        : "bg-[#E7DBC0] text-[#5C534A] group-hover:bg-[#C9A227] group-hover:text-white"
                                    } transition-all duration-200`}
                                    style={{ fontFamily: 'Jost, sans-serif' }}>
                                    {item.badge}
                                </span>
                            )}

                            <ChevronRight className={`w-3.5 h-3.5 transition-all duration-200 ${activeTab === item.tab
                                    ? "text-[#C9A227] opacity-100"
                                    : "text-[#d9cfba] opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                                }`} />
                        </motion.button>
                    ))}

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#EFE6D3]"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-3 bg-white text-[10px] uppercase tracking-widest text-[#a89c86] font-medium" style={{ fontFamily: 'Jost, sans-serif' }}>
                                Account
                            </span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ x: 6 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleLogoutClick}
                        className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-[#92403F] hover:bg-red-50 transition-all duration-200"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        <div className="p-1.5 rounded-lg bg-red-50 text-[#92403F] group-hover:bg-red-100 transition-all duration-200">
                            <LogOut className="w-4 h-4" />
                        </div>
                        <span className="font-medium tracking-wide">Log Out</span>
                        <div className="flex-1" />
                        <div className="w-6 h-6 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-all duration-200">
                            <ChevronRight className="w-3.5 h-3.5 text-[#92403F]/50 group-hover:text-[#92403F] transition-all duration-200" />
                        </div>
                    </motion.button>

                    <div className="mt-4 p-3 bg-gradient-to-r from-[#1a1a2e]/5 to-[#92403F]/5 rounded-xl border border-[#C9A227]/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#C9A227]/10 rounded-lg">
                                <Gift className="w-3.5 h-3.5 text-[#C9A227]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-medium text-[#2B2420] tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    ✨ Premium Benefits
                                </p>
                                <p className="text-[9px] text-[#8a7f6e] tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    {isDistributor ? 'Exclusive distributor rewards & offers' : 'Unlock exclusive rewards & offers'}
                                </p>
                            </div>
                            <button className="text-[10px] font-semibold text-[#C9A227] hover:text-[#92403F] transition-colors" style={{ fontFamily: 'Jost, sans-serif' }}>
                                {isDistributor ? 'View Details' : 'Upgrade'}
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent" />
            </div>
        </>
    );
}