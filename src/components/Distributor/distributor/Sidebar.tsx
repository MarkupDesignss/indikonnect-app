"use client";

import {
    BarChart2,
    Calendar,
    Award,
    CheckCircle2,
    ChevronDown,
    FileText,
    History,
    LayoutDashboard,
    Loader2,
    LogOut,
    AlertCircle,
    Network,
    Percent,
    ReceiptText,
    Repeat2,
    Share2,
    ShieldCheck,
    TrendingUp,
    UserRound,
    WalletCards,
    IndianRupeeIcon,
    X,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "@/lib/slices/toastSlice";

import Logo from "../../../../public/indiekonnect-web/images/logo.png";

// =====================================================
// DESIGN TOKENS
// =====================================================

const NAVY = "#0E1B3D";
const NAVY_LIGHT = "#1B2E63";

const MOBILE_SIDEBAR_EVENT = "open-distributor-sidebar";

type IconType = React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
}>;

type MenuItem = {
    label: string;
    icon: IconType;
    href: string;
    dropdown?: boolean;
    toggleOnly?: boolean;
    children?: {
        label: string;
        icon: IconType;
        href: string;
    }[];
};

type MenuGroup = {
    title: string;
    items: MenuItem[];
};

// =====================================================
// MENU ITEMS
// =====================================================

const menuGroups: MenuGroup[] = [
    {
        title: "Overview",
        items: [
            {
                label: "Dashboard",
                icon: LayoutDashboard,
                href: "/distributor/dashboard",
            },
            {
                label: "Orders",
                icon: History,
                href: "/distributor/order-history",
            },
        ],
    },
    {
        title: "Network",
        items: [
            {
                label: "Profile",
                icon: UserRound,
                dropdown: true,
                href: "/distributor/profile",
                toggleOnly: true,
                children: [
                    {
                        label: "Profile overview",
                        icon: UserRound,
                        href: "/distributor/profile",
                    },
                    {
                        label: "CV tracking stats",
                        icon: TrendingUp,
                        href: "/distributor/profile/weekly-commission/",
                    },
                    {
                        label: "Weekly CV date",
                        icon: Calendar,
                        href: "/distributor/profile/weekly-cv-date",
                    },
                    {
                        label: "Binary tree",
                        icon: Network,
                        href: "/distributor/profile/binary-tree",
                    },
                    {
                        label: "Rank information",
                        icon: Award,
                        href: "/distributor/profile/rank-information",
                    },
                    {
                        label: "CV allocation",
                        icon: IndianRupeeIcon,
                        href: "/distributor/profile/cv-allocation",
                    },
                    {
                        label: "Sponsored",
                        icon: Share2,
                        href: "/distributor/profile/sponsor-tree",
                    },
                ],
            },
            {
                label: "My referral",
                icon: Share2,
                href: "/distributor/my-referral",
            },
            {
                label: "Downline CV report",
                icon: BarChart2,
                href: "/distributor/downline-cv-report",
            },
        ],
    },
    {
        title: "Finance",
        items: [
            {
                label: "Wallet",
                icon: WalletCards,
                href: "/distributor/wallet",
            },
            {
                label: "Transactions",
                icon: ReceiptText,
                href: "/distributor/transactions",
            },
            {
                label: "Commission",
                icon: Percent,
                href: "/distributor/commissions",
            },
            {
                label: "Buy Back",
                icon: Repeat2,
                href: "/distributor/buy-back",
            },
        ],
    },
    {
        title: "Account",
        items: [
            {
                label: "KYC setting",
                icon: ShieldCheck,
                dropdown: true,
                href: "/distributor/kyc",
                toggleOnly: true,
                children: [
                    {
                        label: "KYC status",
                        icon: CheckCircle2,
                        href: "/distributor/kyc/status",
                    },
                    {
                        label: "Bank details",
                        icon: WalletCards,
                        href: "/distributor/kyc/bank-details",
                    },
                    {
                        label: "Document upload",
                        icon: FileText,
                        href: "/distributor/kyc/document-upload",
                    },
                ],
            },
        ],
    },
];

// =====================================================
// LOGOUT MODAL
// =====================================================

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
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.button
                        type="button"
                        aria-label="Close logout confirmation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] cursor-default bg-black/40 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.97,
                            y: 12,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.97,
                            y: 12,
                        }}
                        className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center overflow-y-auto p-4"
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="logout-title"
                            className="pointer-events-auto relative my-auto w-full max-w-[400px] overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-2xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="px-5 pb-4 pt-6 text-center sm:px-6">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F1F0]">
                                    <LogOut className="h-6 w-6 text-[#111111]" />
                                </div>

                                <h3
                                    id="logout-title"
                                    className="mb-2 text-lg font-semibold text-[#171717]"
                                >
                                    Logout Confirmation
                                </h3>

                                <p className="text-sm leading-6 text-[#777777]">
                                    Are you sure you want to logout? You&apos;ll need
                                    to login again to access your account.
                                </p>
                            </div>

                            <div className="mx-4 flex items-start gap-2.5 rounded-lg border border-[#E4E4E2] bg-[#FAFAF9] p-3 sm:mx-6">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#777777]" />

                                <p className="text-xs leading-5 text-[#666666]">
                                    Your session will be ended and you&apos;ll be
                                    redirected to the login page.
                                </p>
                            </div>

                            <div className="mt-5 flex gap-3 border-t border-[#E6E6E4] px-4 py-4 sm:px-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 rounded-lg border border-[#D7D7D5] bg-white px-3 py-3 text-sm font-medium text-[#555555] transition-colors hover:bg-[#F7F7F6] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#111111] px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Logging out...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
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

// =====================================================
// SIDEBAR
// =====================================================

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const { logout } = useLogout();

    const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const allItems = menuGroups.flatMap((group) => group.items);

    const normalizePath = (path: string) => {
        const normalized = path.replace(/\/+/g, "/").replace(/\/+$/, "");
        return normalized || "/";
    };

    // -------------------------------------------------
    // ROUTE ACTIVE STATE
    // -------------------------------------------------

    const isActive = (href: string) => {
        if (!href || href === "#") return false;

        const currentPath = normalizePath(pathname || "");
        const targetPath = normalizePath(href);

        if (targetPath === "/distributor/dashboard") {
            return (
                currentPath === "/distributor" ||
                currentPath === "/distributor/dashboard"
            );
        }

        if (targetPath === "/distributor/profile") {
            return currentPath === "/distributor/profile";
        }

        return (
            currentPath === targetPath ||
            currentPath.startsWith(`${targetPath}/`)
        );
    };

    const isParentActive = (item: MenuItem) => {
        if (item.href && item.href !== "#" && isActive(item.href)) {
            return true;
        }

        if (item.children) {
            return item.children.some((child) => isActive(child.href));
        }

        return false;
    };

    // -------------------------------------------------
    // MOBILE DRAWER CONTROLS
    // -------------------------------------------------

    const closeMobileSidebar = () => {
        setIsMobileOpen(false);
    };

    useEffect(() => {
        const handleOpenSidebar = () => {
            setIsMobileOpen(true);
        };

        window.addEventListener(
            MOBILE_SIDEBAR_EVENT,
            handleOpenSidebar
        );

        return () => {
            window.removeEventListener(
                MOBILE_SIDEBAR_EVENT,
                handleOpenSidebar
            );
        };
    }, []);

    // Close the mobile sidebar after navigating to another page.
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Prevent background scrolling while mobile sidebar is open.
    useEffect(() => {
        if (!isMobileOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isMobileOpen]);

    // -------------------------------------------------
    // AUTO-OPEN ACTIVE DROPDOWN
    // -------------------------------------------------

    useEffect(() => {
        const currentPath = normalizePath(pathname || "");
        const toOpen: string[] = [];

        allItems.forEach((item) => {
            if (!item.children) return;

            const childIsActive = item.children.some((child) => {
                const childPath = normalizePath(child.href);

                return (
                    currentPath === childPath ||
                    currentPath.startsWith(`${childPath}/`)
                );
            });

            const parentIsActive =
                !!item.href &&
                item.href !== "#" &&
                (
                    currentPath === normalizePath(item.href) ||
                    currentPath.startsWith(
                        `${normalizePath(item.href)}/`
                    )
                );

            if (childIsActive || parentIsActive) {
                toOpen.push(item.label);
            }
        });

        if (toOpen.length > 0) {
            setOpenDropdowns((previous) =>
                Array.from(new Set([...previous, ...toOpen]))
            );
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const toggleDropdown = (label: string) => {
        setOpenDropdowns((previous) =>
            previous.includes(label)
                ? previous.filter((item) => item !== label)
                : [...previous, label]
        );
    };

    // -------------------------------------------------
    // LOGOUT
    // -------------------------------------------------

    const handleLogoutConfirm = async () => {
        if (isLoggingOut) return;

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
                        })
                    );

                    setIsLoggingOut(false);
                    setShowLogoutModal(false);
                    setIsMobileOpen(false);

                    router.push("/indiekonnect-web/login/");
                },

                onError: () => {
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
        } catch {
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

    // -------------------------------------------------
    // ACTIVE ITEM STYLE
    // -------------------------------------------------

    const activeStyle: React.CSSProperties = {
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
        color: "#ffffff",
    };

    // -------------------------------------------------
    // RENDER MENU ITEM
    // -------------------------------------------------

    const renderItem = (item: MenuItem) => {
        const Icon = item.icon;

        // DROPDOWN ITEM
        if (item.dropdown && item.children) {
            const parentActive = isParentActive(item);
            const isOpen = openDropdowns.includes(item.label);

            return (
                <div key={item.label} className="min-w-0">
                    <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => {
                            if (
                                !item.toggleOnly &&
                                item.href &&
                                item.href !== "#"
                            ) {
                                router.push(item.href);
                            }

                            toggleDropdown(item.label);
                        }}
                        className="group relative flex h-11 w-full min-w-0 items-center rounded-xl px-3 text-left transition-colors duration-200"
                        style={parentActive ? activeStyle : undefined}
                    >
                        {!parentActive && (
                            <span className="pointer-events-none absolute inset-0 rounded-xl bg-[#F2F4F7] opacity-0 transition-opacity group-hover:opacity-100" />
                        )}

                        <span
                            className={`relative mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                parentActive
                                    ? "bg-white/15"
                                    : "bg-[#F2F4F7] group-hover:bg-white"
                            }`}
                        >
                            <Icon
                                size={17}
                                strokeWidth={1.9}
                                className={
                                    parentActive
                                        ? "text-white"
                                        : "text-[#667085] group-hover:text-[#0E1B3D]"
                                }
                            />
                        </span>

                        <span
                            className={`relative min-w-0 flex-1 truncate text-[13.5px] font-semibold ${
                                parentActive
                                    ? "text-white"
                                    : "text-[#475066] group-hover:text-[#0E1B3D]"
                            }`}
                        >
                            {item.label}
                        </span>

                        <ChevronDown
                            size={15}
                            strokeWidth={2.2}
                            className={`relative ml-2 shrink-0 transition-transform duration-300 ${
                                isOpen ? "rotate-180" : ""
                            } ${
                                parentActive
                                    ? "text-white/80"
                                    : "text-[#A0A8B8]"
                            }`}
                        />
                    </button>

                    <AnimatePresence initial={false}>
                        {isOpen && (
                            <motion.div
                                initial={{
                                    height: 0,
                                    opacity: 0,
                                }}
                                animate={{
                                    height: "auto",
                                    opacity: 1,
                                }}
                                exit={{
                                    height: 0,
                                    opacity: 0,
                                }}
                                transition={{
                                    duration: 0.22,
                                    ease: "easeInOut",
                                }}
                                className="overflow-hidden"
                            >
                                <div className="ml-[27px] mt-1 space-y-0.5 border-l-2 border-[#E9EDF2] pb-1 pl-3">
                                    {item.children.map((child) => {
                                        const ChildIcon = child.icon;
                                        const childActive = isActive(child.href);

                                        return (
                                            <Link
                                                key={child.label}
                                                href={child.href}
                                                onClick={closeMobileSidebar}
                                                className={`relative flex min-h-9 w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors ${
                                                    childActive
                                                        ? "bg-[#EEF1FA] font-semibold text-[#0E1B3D]"
                                                        : "font-medium text-[#667085] hover:bg-[#F7F8FA] hover:text-[#0E1B3D]"
                                                }`}
                                            >
                                                {childActive && (
                                                    <span className="absolute -left-[14px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#1F9D6B] ring-2 ring-white" />
                                                )}

                                                <ChildIcon
                                                    size={14}
                                                    strokeWidth={1.8}
                                                    className="shrink-0"
                                                />

                                                <span className="min-w-0 flex-1 break-words">
                                                    {child.label}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        // NORMAL LINK
        const active = isActive(item.href);

        return (
            <Link
                key={item.label}
                href={item.href}
                onClick={closeMobileSidebar}
                className="group relative flex h-11 w-full min-w-0 items-center rounded-xl px-3 text-left transition-colors duration-200"
                style={active ? activeStyle : undefined}
            >
                {!active && (
                    <span className="pointer-events-none absolute inset-0 rounded-xl bg-[#F2F4F7] opacity-0 transition-opacity group-hover:opacity-100" />
                )}

                <span
                    className={`relative mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        active
                            ? "bg-white/15"
                            : "bg-[#F2F4F7] group-hover:bg-white"
                    }`}
                >
                    <Icon
                        size={17}
                        strokeWidth={1.9}
                        className={
                            active
                                ? "text-white"
                                : "text-[#667085] group-hover:text-[#0E1B3D]"
                        }
                    />
                </span>

                <span
                    className={`relative min-w-0 flex-1 truncate text-[13.5px] font-semibold transition-colors ${
                        active
                            ? "text-white"
                            : "text-[#475066] group-hover:text-[#0E1B3D]"
                    }`}
                >
                    {item.label}
                </span>
            </Link>
        );
    };

    // -------------------------------------------------
    // SIDEBAR UI
    // -------------------------------------------------

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

                .sb-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #e4e7ec transparent;
                    overscroll-behavior: contain;
                }

                .sb-scroll::-webkit-scrollbar {
                    width: 5px;
                }

                .sb-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .sb-scroll::-webkit-scrollbar-thumb {
                    background: #e4e7ec;
                    border-radius: 999px;
                }

                .sb-scroll::-webkit-scrollbar-thumb:hover {
                    background: #cfd4dc;
                }
            `}</style>

            {/* Mobile drawer backdrop */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.button
                        type="button"
                        aria-label="Close navigation menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeMobileSidebar}
                        className="fixed inset-0 z-40 cursor-default bg-[#071126]/50 backdrop-blur-[2px] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar / Mobile Drawer */}
            <aside
                id="distributor-sidebar"
                aria-label="Distributor navigation"
                style={{ fontFamily: "'Lato', sans-serif" }}
                className={`fixed left-0 top-0 z-50 flex h-dvh w-[min(84vw,300px)] max-w-[300px] shrink-0 flex-col border-r border-[#E9EDF2] bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-[280px] lg:max-w-none lg:translate-x-0 lg:shadow-none ${
                    isMobileOpen
                        ? "translate-x-0 shadow-2xl"
                        : "-translate-x-full shadow-none"
                }`}
            >
                {/* Brand (Top) */}
                <div className="shrink-0 px-5 pt-5 lg:pt-6">
                    <div className="flex min-w-0 items-center justify-between border-b border-[#E9EDF2] pb-5">
                        <Link
                            href="/"
                            onClick={closeMobileSidebar}
                            className="flex min-w-0 items-center gap-3"
                        >
                            <div className="relative h-10 w-10 shrink-0">
                                <Image
                                    src={Logo}
                                    alt="IndieKonnect"
                                    fill
                                    priority
                                    sizes="40px"
                                    className="object-contain"
                                />
                            </div>

                            <div className="flex min-w-0 flex-col leading-none">
                                <span className="truncate text-[18px] font-semibold tracking-[-0.01em] text-[#111111]">
                                    IndieKonnect
                                </span>

                                <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
                                    Distributor Panel
                                </span>
                            </div>
                        </Link>
                        
                        {/* Close button (Mobile only) */}
                        <button
                            type="button"
                            aria-label="Close sidebar"
                            onClick={closeMobileSidebar}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#475066] transition-colors hover:bg-[#F2F4F7] lg:hidden"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Menu */}
                <div className="sb-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-5">
                    <nav className="space-y-5 pb-5">
                        {menuGroups.map((group) => (
                            <div key={group.title} className="min-w-0">
                                <p className="mb-2 px-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#A0A8B8]">
                                    {group.title}
                                </p>

                                <div className="space-y-1">
                                    {group.items.map(renderItem)}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Logout pinned at the bottom */}
                <div className="shrink-0 border-t border-[#EEF0F4] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:py-4">
                    <button
                        type="button"
                        onClick={() => {
                            setShowLogoutModal(true);
                            closeMobileSidebar();
                        }}
                        className="group relative flex h-11 w-full items-center rounded-xl px-3 text-left transition-colors duration-200 hover:bg-[#FDF2F2]"
                    >
                        <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FDF2F2] transition-colors group-hover:bg-white">
                            <LogOut
                                size={17}
                                strokeWidth={1.9}
                                className="text-[#B24C4C]"
                            />
                        </span>

                        <span className="text-[13.5px] font-semibold text-[#B24C4C]">
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Logout confirmation */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => {
                    if (!isLoggingOut) {
                        setShowLogoutModal(false);
                    }
                }}
                onConfirm={handleLogoutConfirm}
                isLoading={isLoggingOut}
            />
        </>
    );
}