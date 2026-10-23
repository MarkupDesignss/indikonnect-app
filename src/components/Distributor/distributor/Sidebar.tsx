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
    Clock
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
const BRAND_YELLOW = "#F6B800";

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
                        label: "Pending CV Breakdown",
                        icon: AlertCircle,
                        href: "/distributor/profile/pending-cv-breakdown",
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
    // 👇 NAYA BLOCK: Placements (Pending items ke liye)
    {
        title: "Placements",
        items: [
            {
                label: "Pending Placements",
                icon: Clock, 
                href: "/distributor/pending-placements",
            },
           
        ],
    },
    {
        title: "Finance",
        items: [
            // {
            //     label: "Wallet",
            //     icon: WalletCards,
            //     href: "/distributor/wallet",
            // },
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
            {
                label: "Logout",
                icon: LogOut,
                href: "#",
                action: "logout",
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
                        className="fixed inset-0 z-[100] cursor-default bg-[#071126]/50 backdrop-blur-[3px]"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 14 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center overflow-y-auto p-4"
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="logout-title"
                            className="pointer-events-auto relative my-auto w-full max-w-[400px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgba(14,27,61,0.45)]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            {/* top accent strip */}
                            <div
                                className="h-1.5 w-full"
                                style={{
                                    background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY_LIGHT} 60%, ${BRAND_YELLOW} 100%)`,
                                }}
                            />

                            <div className="px-6 pb-4 pt-7 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF2F2] ring-8 ring-[#FDF2F2]/50">
                                    <LogOut className="h-6 w-6 text-[#B24C4C]" />
                                </div>

                                <h3
                                    id="logout-title"
                                    className="mb-2 text-lg font-bold text-[#0E1B3D]"
                                >
                                    Log out of your account?
                                </h3>

                                <p className="text-sm leading-6 text-[#667085]">
                                    You&apos;ll need to log in again to access
                                    your distributor panel.
                                </p>
                            </div>

                            <div className="mx-6 flex items-start gap-2.5 rounded-xl bg-[#F6F8FB] p-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#98A2B3]" />

                                <p className="text-xs leading-5 text-[#667085]">
                                    Your session will end and you&apos;ll be
                                    redirected to the login page.
                                </p>
                            </div>

                            <div className="mt-6 flex gap-3 px-6 pb-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 rounded-xl border border-[#E4E7EC] bg-white px-3 py-3 text-sm font-semibold text-[#475066] transition-colors hover:bg-[#F6F8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2E63]/40 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Stay logged in
                                </button>

                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0E1B3D]/20 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2E63]/40 disabled:cursor-not-allowed disabled:opacity-70"
                                    style={{
                                        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Logging out...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogOut className="h-4 w-4" />
                                            <span>Log out</span>
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

        window.addEventListener(MOBILE_SIDEBAR_EVENT, handleOpenSidebar);

        return () => {
            window.removeEventListener(MOBILE_SIDEBAR_EVENT, handleOpenSidebar);
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
                (currentPath === normalizePath(item.href) ||
                    currentPath.startsWith(`${normalizePath(item.href)}/`));

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
    // ACTIVE ITEM STYLE (Shadow removed, slightly compact)
    // -------------------------------------------------

    const activeStyle: React.CSSProperties = {
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
        color: "#ffffff",
        // boxShadow removed as requested
    };

    const rowBase =
        "group relative flex h-10 w-full min-w-0 items-center rounded-xl px-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2E63]/40";

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
                        className={`${rowBase} ${
                            parentActive ? "" : "hover:bg-[#F3F5F9]"
                        }`}
                        style={parentActive ? activeStyle : undefined}
                    >
                        {parentActive && (
                            <span
                                className="absolute -left-4 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full"
                                style={{ background: BRAND_YELLOW }}
                            />
                        )}

                        <span
                            className={`relative mr-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                parentActive
                                    ? "bg-white/12"
                                    : "bg-[#F1F4F9] group-hover:bg-white"
                            }`}
                        >
                            <Icon
                                size={15}
                                strokeWidth={1.9}
                                className={
                                    parentActive
                                        ? "text-[#F6B800]"
                                        : "text-[#667085] group-hover:text-[#0E1B3D]"
                                }
                            />
                        </span>

                        <span
                            className={`relative min-w-0 flex-1 truncate text-[13px] font-semibold ${
                                parentActive
                                    ? "text-white"
                                    : "text-[#475066] group-hover:text-[#0E1B3D]"
                            }`}
                        >
                            {item.label}
                        </span>

                        <span
                            className={`relative ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                                parentActive ? "bg-white/10" : "group-hover:bg-white"
                            }`}
                        >
                            <ChevronDown
                                size={13}
                                strokeWidth={2.4}
                                className={`transition-transform duration-300 ${
                                    isOpen ? "rotate-180" : ""
                                } ${
                                    parentActive ? "text-white/80" : "text-[#98A2B3]"
                                }`}
                            />
                        </span>
                    </button>

                    <AnimatePresence initial={false}>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="relative ml-[24px] mt-1 space-y-0.5 pb-1 pl-4">
                                    {/* vertical tree line */}
                                    <span className="absolute bottom-3 left-0 top-0 w-px bg-gradient-to-b from-[#DDE3EC] to-[#DDE3EC]/30" />

                                    {item.children.map((child) => {
                                        const ChildIcon = child.icon;
                                        const childActive = isActive(child.href);

                                        return (
                                            <Link
                                                key={child.label}
                                                href={child.href}
                                                onClick={closeMobileSidebar}
                                                className={`relative flex min-h-[32px] w-full min-w-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2E63]/40 ${
                                                    childActive
                                                        ? "bg-[#EEF1FA] font-semibold text-[#0E1B3D]"
                                                        : "font-medium text-[#667085] hover:bg-[#F6F8FB] hover:text-[#0E1B3D]"
                                                }`}
                                            >
                                                {/* elbow connector */}
                                                <span className="absolute -left-4 top-1/2 h-px w-3 bg-[#DDE3EC]" />

                                                {childActive && (
                                                    <span
                                                        className="absolute -left-[19px] top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full ring-[3px] ring-white"
                                                        style={{ background: BRAND_YELLOW }}
                                                    />
                                                )}

                                                <ChildIcon
                                                    size={13}
                                                    strokeWidth={1.8}
                                                    className={`shrink-0 ${
                                                        childActive
                                                            ? "text-[#1B2E63]"
                                                            : "text-[#98A2B3]"
                                                    }`}
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
                className={`${rowBase} ${active ? "" : "hover:bg-[#F3F5F9]"}`}
                style={active ? activeStyle : undefined}
            >
                {active && (
                    <span
                        className="absolute -left-4 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full"
                        style={{ background: BRAND_YELLOW }}
                    />
                )}

                <span
                    className={`relative mr-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        active
                            ? "bg-white/12"
                            : "bg-[#F1F4F9] group-hover:bg-white"
                    }`}
                >
                    <Icon
                        size={15}
                        strokeWidth={1.9}
                        className={
                            active
                                ? "text-[#F6B800]"
                                : "text-[#667085] group-hover:text-[#0E1B3D]"
                        }
                    />
                </span>

                <span
                    className={`relative min-w-0 flex-1 truncate text-[13px] font-semibold transition-colors ${
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
                    scrollbar-color: transparent transparent;
                    overscroll-behavior: contain;
                    -webkit-overflow-scrolling: touch;
                    /* soft fade at top and bottom so items never look cut off */
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 12px, #000 calc(100% - 28px), transparent 100%);
                    mask-image: linear-gradient(to bottom, transparent 0, #000 12px, #000 calc(100% - 28px), transparent 100%);
                }

                .sb-scroll:hover {
                    scrollbar-color: #dfe4ec transparent;
                }

                .sb-scroll::-webkit-scrollbar {
                    width: 5px;
                }

                .sb-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .sb-scroll::-webkit-scrollbar-thumb {
                    background: transparent;
                    border-radius: 999px;
                }

                .sb-scroll:hover::-webkit-scrollbar-thumb {
                    background: #dfe4ec;
                }

                @media (prefers-reduced-motion: reduce) {
                    #distributor-sidebar,
                    #distributor-sidebar * {
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>

            {/* Desktop spacer — keeps page content clear of the fixed sidebar */}
            <div
                aria-hidden="true"
                className="hidden w-[280px] shrink-0 lg:block"
            />

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

            {/* Sidebar — fixed top to bottom on every screen size */}
            <aside
                id="distributor-sidebar"
                aria-label="Distributor navigation"
                style={{ fontFamily: "'Lato', sans-serif" }}
                className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,300px)] max-w-[300px] flex-col overflow-hidden border-r border-[#E9EDF2] bg-white transition-transform duration-300 ease-in-out lg:z-30 lg:w-[280px] lg:max-w-none lg:translate-x-0 lg:shadow-none ${
                    isMobileOpen
                        ? "translate-x-0 shadow-2xl"
                        : "-translate-x-full shadow-none"
                }`}
            >
                {/* Brand (Top) */}
                <div className="relative shrink-0 px-4 pt-4 lg:pt-5">
                    <div className="relative flex min-w-0 items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#F6F8FC] to-[#EEF2F9] p-3 ring-1 ring-[#E9EDF2]">
                        {/* decorative corner glow */}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-25 blur-2xl"
                            style={{ background: BRAND_YELLOW }}
                        />

                        <Link
                            href="/"
                            onClick={closeMobileSidebar}
                            className="relative flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2E63]/40 rounded-xl"
                        >
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#E9EDF2]">
                                <div className="relative h-8 w-8">
                                    <Image
                                        src={Logo}
                                        alt="IndieKonnect"
                                        fill
                                        priority
                                        sizes="32px"
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            <div className="flex min-w-0 flex-col leading-none">
                                <span className="truncate text-[17px] font-bold tracking-[-0.01em] text-[#0E1B3D]">
                                    IndieKonnect
                                </span>

                                <span className="mt-1.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-2 py-[3px] text-[10.5px] font-semibold text-[#667085] ring-1 ring-[#E4E7EC]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#1F9D6B]" />
                                    Distributor panel
                                </span>
                            </div>
                        </Link>

                        {/* Close button (Mobile only) */}
                        <button
                            type="button"
                            aria-label="Close sidebar"
                            onClick={closeMobileSidebar}
                            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#475066] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2E63]/40 lg:hidden"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Menu — only this part scrolls */}
                <div className="sb-scroll mt-3 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-2">
                    <nav className="space-y-5 pb-10">
                        {menuGroups.map((group) => (
                            <div key={group.title} className="min-w-0">
                                <div className="mb-2 flex items-center gap-2 px-2.5">
                                    <p className="text-[11px] font-bold tracking-[0.02em] text-[#98A2B3]">
                                        {group.title}
                                    </p>
                                    <span className="h-px flex-1 bg-[#EEF1F5]" />
                                </div>

                                <div className="space-y-0.5">
                                    {group.items.map(renderItem)}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Sticky Logout — always pinned at the very bottom */}
                <div className="relative shrink-0 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
                    <div className="mb-3 h-px bg-[#EEF1F5]" />

                    <button
                        type="button"
                        onClick={() => {
                            setShowLogoutModal(true);
                            closeMobileSidebar();
                        }}
                        className="group flex h-10 w-full min-w-0 items-center rounded-xl bg-[#FDF5F5] px-2.5 text-left ring-1 ring-[#F8E1E1] transition-all duration-200 hover:bg-[#FBE9E9] hover:ring-[#F3CDCD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B24C4C]/40"
                    >
                        <span className="mr-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                            <LogOut
                                size={15}
                                strokeWidth={1.9}
                                className="text-[#B24C4C] transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                        </span>

                        <span className="text-[13px] font-semibold text-[#B24C4C]">
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