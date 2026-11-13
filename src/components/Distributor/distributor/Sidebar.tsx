"use client";

import {
  AlertCircle,
  ArrowLeftRight,
  BadgePercent,
  CalendarDays,
  ChevronDown,
  Clock,
  GitFork,
  IdCard,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Network,
  ShoppingBag,
  Trophy,
  UserPlus,
  UserRound,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

import Link from "next/link";

import Image from "next/image";

import { usePathname, useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { useDispatch } from "react-redux";

import { useLogout } from "@/lib/hooks/useLogout";

import { showToast } from "@/lib/slices/toastSlice";

import Logo from "../../../../public/indiekonnect-web/images/logo.png";

/**
 * Premium distributor sidebar: navy visual language.
 * Original routes, dropdown behavior, mobile events and logout are preserved.
 */

const MOBILE_SIDEBAR_EVENT = "open-distributor-sidebar";

const INK = "#18283F";

type NavChild = { label: string; icon: LucideIcon; href: string };

type NavItem = {
  label: string;

  icon: LucideIcon;

  href: string;

  dropdown?: boolean;

  toggleOnly?: boolean;

  children?: NavChild[];
};

type NavGroup = {
  title: string;

  items: NavItem[];
};

const menuGroups: NavGroup[] = [
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

        icon: ShoppingBag,

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

        href: "/distributor/profile",

        dropdown: true,

        toggleOnly: true,

        children: [
          {
            label: "Profile overview",

            icon: IdCard,

            href: "/distributor/profile",
          },

          {
            label: "Rank information",

            icon: Trophy,

            href: "/distributor/profile/weekly-commission/",
          },

          {
            label: "Binary tree",

            icon: GitFork,

            href: "/distributor/profile/binary-tree",
          },

          {
            label: "CV Breakdown",

            icon: ListChecks,

            href: "/distributor/profile/pending-cv-breakdown",
          },

          {
            label: "Sponsored",

            icon: Network,

            href: "/distributor/profile/sponsor-tree",
          },
        ],
      },

      {
        label: "My referral",

        icon: UserPlus,

        href: "/distributor/my-referral",
      },

      {
        label: "Downline",

        icon: Network,

        href: "/distributor/downline-cv-report",
      },



      {
        label: "Sales Calendar",

        icon: CalendarDays,

        href: "/distributor/sales-calendar",
      },
    ],
  },

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

  // ACCOUNT SECTION - MOVED ABOVE FINANCE

  {
    title: "Account",

    items: [
      {
        label: "TC Bank",

        icon: Landmark,

        href: "/distributor/TC-Bank",
      },

      // {

      //   label: "My Account",

      //   icon: Settings2,

      //   href: "/distributor/MyAccounts",

      // },
    ],
  },

  // FINANCE SECTION - MOVED TO THE BOTTOM

  {
    title: "Finance",

    items: [

      {
        label: "My Wallet",

        icon: Wallet,

        href: "/distributor/wallet",
      },

    ],
  },
];

function normalizePath(value: string): string {
  const clean = value.replace(/\/{2,}/g, "/").replace(/\/+$/, "");

  return clean || "/";
}

function matchesRoute(pathname: string, href: string): boolean {
  if (!href || href === "#") return false;

  const current = normalizePath(pathname);

  const target = normalizePath(href);

  if (target === "/distributor/dashboard") {
    return current === "/distributor" || current === target;
  }

  // A submenu's Profile overview should not be selected on all profile subpages.

  if (target === "/distributor/profile") {
    return current === target;
  }

  return current === target || current.startsWith(`${target}/`);
}

function LogoutModal({
  open,

  loading,

  onClose,

  onConfirm,
}: {
  open: boolean;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, loading, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"

            aria-label="Close logout confirmation"

            className="fixed inset-0 z-[100] cursor-default bg-[#0B1A35]/60 backdrop-blur-[3px]"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            onClick={() => {
              if (!loading) onClose();
            }}
          />

          <motion.div
            className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-4"

            initial={{ opacity: 0, y: 14, scale: 0.97 }}

            animate={{ opacity: 1, y: 0, scale: 1 }}

            exit={{ opacity: 0, y: 12, scale: 0.98 }}

            transition={{ duration: 0.19, ease: "easeOut" }}
          >
            <section
              role="dialog"

              aria-modal="true"

              aria-labelledby="logout-dialog-title"

              aria-describedby="logout-dialog-description"

              className="pointer-events-auto w-full max-w-[420px] overflow-hidden rounded-[22px] border border-[#E3EAF3] bg-white shadow-[0_24px_90px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-start justify-between px-6 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3FA] text-[#173B74] ring-1 ring-neutral-200">
                  <LogOut size={21} strokeWidth={2} />
                </div>

                <button
                  type="button"

                  onClick={onClose}

                  disabled={loading}

                  aria-label="Close dialog"

                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#9AA9BC] transition hover:bg-[#EEF3FA] hover:text-[#173B74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23529C] disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 pt-4">
                <h2
                  id="logout-dialog-title"

                  className="text-[20px] font-bold tracking-[-0.025em] text-[#1A2A40]"
                >
                  Log out of your account?
                </h2>

                <p
                  id="logout-dialog-description"

                  className="mt-2 text-[13px] leading-[1.8] text-[#74859C]"
                >
                  Your current session will end. You can sign in again whenever
                  you need to access your distributor workspace.
                </p>

                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#E1E9F4] bg-[#F6F9FD] p-3.5">
                  <AlertCircle
                    size={16}

                    className="mt-0.5 shrink-0 text-[#74859C]"
                  />

                  <p className="text-xs leading-[1.65] text-[#536780]">
                    Please save any unsaved work before continuing.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#EAF0F8] px-6 py-5">
                <button
                  type="button"

                  onClick={onClose}

                  disabled={loading}

                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E3EAF3] bg-white px-4 text-[13px] font-semibold text-[#41536B] transition hover:border-neutral-300 hover:bg-[#F6F9FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 disabled:opacity-50"
                >
                  Stay logged in
                </button>

                <button
                  type="button"

                  onClick={onConfirm}

                  disabled={loading}

                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173A75] px-4 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition hover:bg-[#234F96] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23529C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut size={16} />
                  )}

                  {loading ? "Logging out..." : "Log out"}
                </button>
              </div>
            </section>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Sidebar() {
  const pathname = usePathname() || "";

  const router = useRouter();

  const dispatch = useDispatch();

  const { logout } = useLogout();

  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dropdownsForRoute = useMemo(() => {
    return menuGroups

      .flatMap((group) => group.items)

      .filter((item) =>
        item.children?.some((child) => matchesRoute(pathname, child.href)),
      )

      .map((item) => item.label);
  }, [pathname]);

  useEffect(() => {
    if (dropdownsForRoute.length) {
      setOpenDropdowns((current) => [
        ...new Set([...current, ...dropdownsForRoute]),
      ]);
    }
  }, [dropdownsForRoute]);

  useEffect(() => {
    const handleOpen = () => setIsMobileOpen(true);

    window.addEventListener(MOBILE_SIDEBAR_EVENT, handleOpen);

    return () => {
      window.removeEventListener(MOBILE_SIDEBAR_EVENT, handleOpen);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", onEscape);
    };
  }, [isMobileOpen]);

  const closeMobile = () => setIsMobileOpen(false);

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  };

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
            }),
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
            }),
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
        }),
      );

      setIsLoggingOut(false);

      setShowLogoutModal(false);
    }
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;

    const isDropdown = !!item.dropdown && !!item.children?.length;

    const activeChild =
      item.children?.some((child) => matchesRoute(pathname, child.href)) ??
      false;

    const active = matchesRoute(pathname, item.href) || activeChild;

    const expanded = openDropdowns.includes(item.label);

    const commonItem = `group relative flex min-h-[42px] w-full min-w-0 items-center gap-3 rounded-xl px-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 focus-visible:ring-offset-2 ${active
        ? "bg-[#173A75] text-white"
        : "text-[#536780] hover:bg-[#F0F5FC] hover:text-[#194891]"
      }`;

    const content = (
      <>
        <span
          className={`flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-[9px] transition-colors ${active ? "bg-white/20" : "bg-[#F0F4FB] group-hover:bg-white"
            }`}
        >
          <Icon
            size={16}

            strokeWidth={1.9}

            className={
              active
                ? "text-white"
                : "text-[#74859C] group-hover:text-[#173B74]"
            }
          />
        </span>

        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-[-0.005em]">
          {item.label}
        </span>

        {isDropdown && (
          <ChevronDown
            size={15}

            strokeWidth={2}

            aria-hidden="true"

            className={`shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""
              } ${active ? "text-white/80" : "text-[#9AA9BC]"}`}
          />
        )}
      </>
    );

    if (isDropdown) {
      return (
        <div key={item.label} className="min-w-0">
          <button
            type="button"

            aria-expanded={expanded}

            onClick={() => {
              if (!item.toggleOnly && item.href && item.href !== "#") {
                router.push(item.href);
              }

              toggleDropdown(item.label);
            }}

            className={commonItem}
          >
            {content}
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}

                animate={{ height: "auto", opacity: 1 }}

                exit={{ height: 0, opacity: 0 }}

                transition={{ duration: 0.2, ease: "easeInOut" }}

                className="overflow-hidden"
              >
                <div className="relative ml-[25px] mt-1 space-y-0.5 border-l border-[#E1E9F4] pb-1 pl-4">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;

                    const selected = matchesRoute(pathname, child.href);

                    return (
                      <Link
                        key={child.href}

                        href={child.href}

                        onClick={closeMobile}

                        aria-current={selected ? "page" : undefined}

                        className={`group/child relative flex min-h-[36px] w-full min-w-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 ${selected
                            ? "bg-[#ECF3FF] font-bold text-[#194891]"
                            : "font-medium text-[#74859C] hover:bg-[#F6F9FD] hover:text-[#1A2A40]"
                          }`}
                      >
                        {selected && (
                          <span className="absolute -left-[18px] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full border-2 border-white bg-[#275FC1] ring-1 ring-[#275FC1]" />
                        )}

                        <ChildIcon
                          size={14}

                          strokeWidth={1.8}

                          className={`shrink-0 ${selected ? "text-[#17427D]" : "text-[#91A0B8]"
                            }`}
                        />

                        <span className="min-w-0 flex-1 break-words leading-[1.4]">
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

    return (
      <Link
        key={item.href}

        href={item.href}

        onClick={closeMobile}

        aria-current={active ? "page" : undefined}

        className={commonItem}
      >
        {content}
      </Link>
    );
  };

  return (
    <>
      <style>{`

        .ik-sidebar-scroll {

          scrollbar-width: thin;

          scrollbar-color: #d2deef transparent;

          overscroll-behavior: contain;

        }

        .ik-sidebar-scroll::-webkit-scrollbar {

          width: 5px;

        }

        .ik-sidebar-scroll::-webkit-scrollbar-track {

          background: transparent;

        }

        .ik-sidebar-scroll::-webkit-scrollbar-thumb {

          border-radius: 999px;

          background: #d2deef;

        }

        @media (prefers-reduced-motion: reduce) {

          #distributor-sidebar,

          #distributor-sidebar * {

            transition-duration: 0.01ms !important;

            animation-duration: 0.01ms !important;

          }

        }

      `}</style>

      {/* Desktop spacer matches fixed sidebar width. */}

      <div aria-hidden="true" className="hidden w-[280px] shrink-0 lg:block" />

      {/* Mobile drawer backdrop */}

      <AnimatePresence>
        {isMobileOpen && (
          <motion.button
            type="button"

            aria-label="Close navigation menu"

            className="fixed inset-0 z-40 cursor-default bg-[#0B1A35]/55 backdrop-blur-[2px] lg:hidden"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            transition={{ duration: 0.18 }}

            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      <aside
        id="distributor-sidebar"

        aria-label="Distributor navigation"

        style={{
          fontFamily: "'Lato', ui-sans-serif, system-ui, sans-serif",

          color: INK,
        }}

        className={`fixed inset-y-0 left-0 z-50 flex w-[min(88vw,300px)] max-w-[300px] flex-col overflow-hidden border-r border-[#E3EAF3] bg-white transition-transform duration-300 ease-out lg:z-30 lg:w-[280px] lg:max-w-none lg:translate-x-0 lg:shadow-none ${isMobileOpen
            ? "translate-x-0 shadow-[12px_0_50px_rgba(0,0,0,0.18)]"
            : "-translate-x-full shadow-none"
          }`}
      >
        {/* Brand header */}

        <div className="shrink-0 bg-gradient-to-b from-[#F5F9FF] to-white px-4 pb-4 pt-5">
          <div className="flex items-center justify-between gap-2 border-b border-[#EAF0F8] pb-5">
            <button
              onClick={() => {
                closeMobile();

                router.push("/");
              }}

              type="button"

              className="group flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23529C]"
            >
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-[#E1E9F4] bg-[#F6F9FD] p-2">
                <Image
                  src={Logo}

                  alt="IndieKonnect"

                  fill

                  sizes="44px"

                  priority

                  className="object-contain p-1"
                />
              </span>

              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[17px] font-extrabold tracking-[-0.045em] text-[#1A2A40]">
                  IndieKonnect
                </span>

                <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium tracking-[0.04em] text-[#74859C]">
                  <span className="h-[6px] w-[6px] rounded-full bg-emerald-500" />
                  DISTRIBUTOR WORKSPACE
                </span>
              </span>
            </button>

            <button
              type="button"

              aria-label="Close sidebar"

              onClick={closeMobile}

              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E1E9F4] text-[#74859C] transition hover:bg-[#EEF3FA] hover:text-[#173B74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation: independently scrollable */}

        <div className="ik-sidebar-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-6 sm:px-4">
          <nav aria-label="Main menu" className="space-y-5">
            {menuGroups.map((group) => (
              <section key={group.title} className="min-w-0">
                <div className="mb-2 flex items-center gap-2 px-3">
                  <h2 className="shrink-0 text-[10px] font-bold uppercase tracking-[0.11em] text-[#9AA9BC]">
                    {group.title}
                  </h2>

                  <span className="h-px flex-1 bg-[#EEF3FA]" />
                </div>

                <div className="space-y-1">{group.items.map(renderItem)}</div>
              </section>
            ))}
          </nav>
        </div>

        {/* Black primary CTA: always visible */}

        <div className="shrink-0 border-t border-[#EDF1F7] bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-[11px] font-medium text-[#74859C]">
              Account
            </span>

            <span className="rounded-full border border-[#E1E9F4] bg-[#F6F9FD] px-2 py-0.5 text-[10px] font-medium text-[#74859C]">
              Secure session
            </span>
          </div>

          <button
            type="button"

            onClick={() => {
              setShowLogoutModal(true);

              closeMobile();
            }}

            className="group flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#173A75] px-4 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.13)] transition hover:bg-[#234F96] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23529C] focus-visible:ring-offset-2"
          >
            <LogOut
              size={16}

              strokeWidth={2}

              className="transition group-hover:translate-x-0.5"
            />
            Log out
          </button>
        </div>
      </aside>

      <LogoutModal
        open={showLogoutModal}

        loading={isLoggingOut}

        onClose={() => {
          if (!isLoggingOut) {
            setShowLogoutModal(false);
          }
        }}

        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
