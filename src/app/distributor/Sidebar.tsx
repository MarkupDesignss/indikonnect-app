"use client";

import {
    BarChart3,
    ChevronDown,
    GitBranch,
    LayoutDashboard,
    Percent,
    ReceiptText,
    UserRound,
    UsersRound,
    WalletCards,
    User,
    Calendar,
    Award,
    Network,
    Share2,
    BadgeDollarSign,
    Fingerprint,
    CheckCircle2,
    LogOut,
    AlertCircle,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "@/lib/slices/toastSlice";

// ---- Logo Import ----
import Logo from "../../../public/indiekonnect-web/images/logo.png"; // ✅ Apna logo import karein

// ---- Design tokens (shared across the distributor area) ----
const NAVY = "#0E1B3D";
const EMERALD = "#1f9d6b";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/distributor/dashboard" },
    {
        label: "Profile",
        icon: UserRound,
        dropdown: true,
        href: "/distributor/profile",
        children: [
            { label: "Weekly commission", icon: User, href: "/distributor/profile/weekly-commission" },
            { label: "Weekly CV date", icon: Calendar, href: "/distributor/profile/weekly-cv-date" },
            { label: "Rank information", icon: Award, href: "/distributor/profile/rank-information" },
            { label: "Binary tree", icon: Network, href: "/distributor/profile/binary-tree" },
            { label: "CV allocation", icon: BadgeDollarSign, href: "/distributor/profile/cv-allocation" },
            { label: "Sponsored", icon: Share2, href: "/distributor/profile/sponsor-tree" },
        ],
    },
    { label: "Wallet", icon: WalletCards, href: "/distributor/wallet" },
    {
        label: "KYC setting",
        icon: Fingerprint,
        dropdown: true,
        href: "/distributor/kyc",
        children: [
            { label: "Document upload", icon: Fingerprint, href: "/distributor/kyc/document-upload" },
            { label: "Bank details", icon: WalletCards, href: "/distributor/kyc/bank-details" },
            { label: "KYC status", icon: CheckCircle2, href: "/distributor/kyc/status" },
        ],
    },
    { label: "Accounts", icon: UsersRound, href: "/distributor/accounts" },
    { label: "My referral", icon: GitBranch, href: "/distributor/my-referral" },
    { label: "Transactions", icon: ReceiptText, href: "/distributor/transactions" },
    { label: "Order history", icon: ReceiptText, href: "/distributor/order-history" },
    { label: "Binary tree", icon: GitBranch, href: "/distributor/binary-tree" },
    { label: "Commission", icon: Percent, href: "/distributor/commissions" },
    { label: "Downline CV report", icon: BarChart3, href: "/distributor/downline-cv-report" },
    { label: "Logout", icon: LogOut, href: "#", isLogoutAction: true },
];

// ✅ Logout Modal Component
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
                        className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-[100]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 12 }}
                        className="fixed inset-0 flex items-center justify-center z-[100] p-4 font-sans"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white rounded-[8px] shadow-[0_18px_60px_rgba(0,0,0,0.14)] max-w-md w-full overflow-hidden relative border border-[#E4E4E2]">
                            <div className="relative px-6 pt-7 pb-4 text-center">
                                <div className="w-14 h-14 mx-auto bg-[#F1F1F0] rounded-full flex items-center justify-center mb-4">
                                    <LogOut className="w-6 h-6 text-[#111111]" />
                                </div>
                                <h3 className="text-[18px] font-semibold text-[#171717] mb-1.5">
                                    Logout Confirmation
                                </h3>
                                <p className="text-[#888888] text-[12px] leading-relaxed">
                                    Are you sure you want to logout? You'll need to login again to access your account.
                                </p>
                            </div>
                            <div className="mx-6 p-3 bg-[#FAFAF9] rounded-[6px] border border-[#E4E4E2] flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 text-[#777777] flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-[#666666]">
                                    Your session will be ended and you'll be redirected to the login page.
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

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const { logout } = useLogout();

    const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Auto-open the dropdown containing the active route
    useEffect(() => {
        const updatedDropdowns: string[] = [];

        menuItems.forEach((item) => {
            if (item.children) {
                const isChildActive = item.children.some(
                    (child) =>
                        pathname === child.href || pathname?.startsWith(child.href + "/"),
                );
                if (isChildActive) updatedDropdowns.push(item.label);
            }
        });

        if (updatedDropdowns.length > 0) {
            setOpenDropdowns((prev) =>
                Array.from(new Set([...prev, ...updatedDropdowns])),
            );
        }
    }, [pathname]);

    const toggleDropdown = (label: string) => {
        setOpenDropdowns((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label],
        );
    };

    const isActive = (href: string) => {
        // ✅ FIX: Check if href is undefined or "#" before calling .replace()
        if (!href || href === "#") return false;

        const currentPath = (pathname || "").replace(/\/+$/, "");
        const targetPath = href.replace(/\/+$/, "");

        if (targetPath === "/distributor/dashboard") {
            return (
                currentPath === "/distributor" ||
                currentPath === "/distributor/dashboard"
            );
        }

        return (
            currentPath === targetPath || currentPath?.startsWith(targetPath + "/")
        );
    };

    const isParentActive = (item: (typeof menuItems)[number]) => {
        if (item.href !== "#" && isActive(item.href)) return true;
        if (item.children)
            return item.children.some((child) => isActive(child.href));
        return false;
    };

    // ✅ Logout Handle Function
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
                    router.push("/indiekonnect-web/login/");
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
    };

    const closeLogoutModal = () => {
        if (!isLoggingOut) {
            setShowLogoutModal(false);
        }
    };

    return (
        <>
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={closeLogoutModal}
                onConfirm={handleLogoutConfirm}
                isLoading={isLoggingOut}
            />

            <aside
                style={{ fontFamily: "'Lato', sans-serif" }}
                className="sticky top-0 relative flex h-screen w-[280px] shrink-0 flex-col border-r border-[#e9edf2] bg-white"
            >
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        `}</style>

                {/* ✅ Brand with Logo - Redirect to Main Website */}
                <div className="shrink-0 px-5 pt-6">
                    <Link
                        href="/"
                        className="flex items-center gap-3 border-b border-[#e9edf2] pb-6"
                        onClick={() => {
                            setIsMobileMenuOpen(false); // (Agar ye state hai toh)
                            setIsSearchExpanded(false);
                        }}
                    >
                        <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                                src={Logo}
                                alt="Indie Konnect"
                                fill
                                priority
                                className="object-contain"
                            />
                        </div>

                        <div className="flex flex-col leading-none">
                            <span className="text-[18px] font-semibold tracking-[-0.01em] text-[#111111]">
                                Indie<span className="text-[#111111]">Konnect</span>
                            </span>
                            <p className="text-[11px] font-semibold text-[#98a2b3] mt-0.5">
                                Dashboard
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Menu */}
                <div className="flex-1 overflow-y-auto px-5">
                    <nav className="mt-4 space-y-0.5 pb-4">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            const parentActive = isParentActive(item);
                            const isOpen = openDropdowns.includes(item.label);

                            // ✅ Logout button handle karna
                            if (item.isLogoutAction) {
                                return (
                                    <button
                                        key={item.label}
                                        onClick={openLogoutModal}
                                        className="group relative flex h-11 w-full items-center rounded-[10px] px-3 text-left transition-all duration-150"
                                        style={{
                                            color: "#B24C4C",
                                        }}
                                    >
                                        <span className="pointer-events-none absolute inset-0 rounded-[10px] bg-[#FDF2F2] opacity-0 transition-opacity group-hover:opacity-100" />
                                        <Icon
                                            size={18}
                                            strokeWidth={1.8}
                                            className="relative mr-3 shrink-0 text-[#B24C4C]"
                                        />
                                        <span className="relative text-[13.5px] font-semibold text-[#B24C4C]">
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            }

                            return (
                                <div key={item.label}>
                                    {item.dropdown && item.children ? (
                                        <>
                                            <button
                                                onClick={() => toggleDropdown(item.label)}
                                                className="group relative flex h-11 w-full items-center rounded-[10px] px-3 text-left transition-all duration-150"
                                                style={
                                                    parentActive
                                                        ? {
                                                            backgroundColor: NAVY,
                                                            color: "white",
                                                            boxShadow: `0 8px 20px -8px ${NAVY}66`,
                                                        }
                                                        : undefined
                                                }
                                            >
                                                {!parentActive && (
                                                    <span className="pointer-events-none absolute inset-0 rounded-[10px] bg-[#f2f4f7] opacity-0 transition-opacity group-hover:opacity-100" />
                                                )}
                                                {parentActive && (
                                                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white/90" />
                                                )}

                                                <Icon
                                                    size={18}
                                                    strokeWidth={1.8}
                                                    className={`relative mr-3 shrink-0 ${parentActive
                                                            ? "text-white"
                                                            : "text-[#98a2b3] group-hover:text-[#0E1B3D]"
                                                        }`}
                                                />
                                                <span
                                                    className={`relative text-[13.5px] font-semibold ${parentActive
                                                            ? "text-white"
                                                            : "text-[#475066] group-hover:text-[#0E1B3D]"
                                                        }`}
                                                >
                                                    {item.label}
                                                </span>
                                                <ChevronDown
                                                    size={15}
                                                    strokeWidth={2.2}
                                                    className={`relative ml-auto transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                                                        } ${parentActive ? "text-white/80" : "text-[#c1c6d0]"
                                                        }`}
                                                />
                                            </button>

                                            <div
                                                className={`grid overflow-hidden transition-all duration-200 ${isOpen
                                                        ? "grid-rows-[1fr] opacity-100"
                                                        : "grid-rows-[0fr] opacity-0"
                                                    }`}
                                            >
                                                <div className="ml-[26px] min-h-0 space-y-0.5 border-l border-[#e9edf2] pl-4 pt-1">
                                                    {item.children.map((child) => {
                                                        const ChildIcon = child.icon;
                                                        const childActive = isActive(child.href);
                                                        return (
                                                            <Link
                                                                key={child.label}
                                                                href={child.href}
                                                                className={`flex h-9 items-center gap-2 rounded-[8px] px-2.5 text-[12.5px] font-medium transition-colors ${childActive
                                                                        ? "bg-[#eef0f7] text-[#0E1B3D]"
                                                                        : "text-[#667085] hover:bg-[#f7f8fa] hover:text-[#0E1B3D]"
                                                                    }`}
                                                            >
                                                                <ChildIcon size={14} strokeWidth={1.8} />
                                                                <span>{child.label}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="group relative flex h-11 w-full items-center rounded-[10px] px-3 text-left transition-all duration-150"
                                            style={
                                                active
                                                    ? {
                                                        backgroundColor: NAVY,
                                                        color: "white",
                                                        boxShadow: `0 8px 20px -8px ${NAVY}66`,
                                                    }
                                                    : undefined
                                            }
                                        >
                                            {!active && (
                                                <span className="pointer-events-none absolute inset-0 rounded-[10px] bg-[#f2f4f7] opacity-0 transition-opacity group-hover:opacity-100" />
                                            )}
                                            {active && (
                                                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white/90" />
                                            )}

                                            <Icon
                                                size={18}
                                                strokeWidth={1.8}
                                                className={`relative mr-3 shrink-0 ${active
                                                        ? "text-white"
                                                        : "text-[#98a2b3] group-hover:text-[#0E1B3D]"
                                                    }`}
                                            />
                                            <span
                                                className={`relative text-[13.5px] font-semibold ${active
                                                        ? "text-white"
                                                        : "text-[#475066] group-hover:text-[#0E1B3D]"
                                                    }`}
                                            >
                                                {item.label}
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* User - Ab ye bhi dikhega, lekin logout menu me hai */}
                <div className="shrink-0 px-5 pb-5">
                    <div className="rounded-[12px] border border-[#e9edf2] bg-[#f7f8fa] p-3.5">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-full"
                                style={{ backgroundColor: NAVY }}
                            >
                                <UserRound className="h-4.5 w-4.5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13.5px] font-bold text-[#101828]">
                                    Distributor
                                </p>
                                <p className="text-[11px] text-[#98a2b3]">AIA603525</p>
                            </div>
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: EMERALD }}
                            />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}