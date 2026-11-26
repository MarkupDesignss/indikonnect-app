"use client";




export type TabType =
  | "overview"
  | "orders"
  | "wishlist"
  | "address"
  | "settings"
  | "earning"
  | "help"
  | "refund"
  | "suggestions";


export type AnyObject = Record<string, any>;


export const ALLOWED_TABS: TabType[] = [
  "overview",
  "orders",
  "wishlist",
  "address",
  "settings",
  "earning",
  "help",
  "refund",
  "suggestions",
];


export const TAB_LABELS: Record<TabType, string> = {
  overview: "Overview",
  orders: "My Orders",
  wishlist: "Wishlist",
  address: "Manage Address",
  settings: "Account Settings",
  earning: "Earnings",
  help: "Help & Support",
  refund: "Refund Policy",
  suggestions: "Suggestions",
};


export const BRAND_GREEN = "#16281C";


export const CARD =
  "rounded-[18px] border border-[#E8E8E3] bg-white shadow-[0_8px_35px_-22px_rgba(0,0,0,0.35)]";


export const SOFT_CARD =
  "rounded-[18px] border border-[#E8E8E3] bg-[#FCFCFA]";


export const SECTION_TITLE =
  "text-[18px] font-semibold tracking-[-0.02em] text-[#171717]";


export const LABEL =
  "text-[9px] font-semibold uppercase tracking-[0.16em] text-[#979791]";


/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

export const getFirstName = (name?: string) => {
  if (!name) return "Guest";

  return name.trim().split(" ")[0] || "Guest";
};


export const getInitials = (name?: string) => {
  if (!name) return "GU";

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""
    }`.toUpperCase();
};


export const formatCurrency = (value: unknown) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};


export const renderRatingStars = (rating: number) => {
  const value = Math.max(
    0,
    Math.min(5, Math.floor(Number(rating) || 0)),
  );

  return "★".repeat(value) + "☆".repeat(Math.max(0, 5 - value));
};


export const getActivityTime = (timestamp: unknown, createdAt?: string) => {
  if (timestamp) {
    return new Date(Number(timestamp) * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (createdAt) {
    const date = new Date(createdAt);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }

  return "--:--";
};


export const getActivityDate = (timestamp: unknown, createdAt?: string) => {
  if (timestamp) {
    return new Date(Number(timestamp) * 1000).toLocaleDateString(
      "en-IN",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );
  }

  if (createdAt) {
    const date = new Date(createdAt);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  return "";
};


/* ========================================================================= */
/* DASHBOARD SIDEBAR                                                         */
/* ========================================================================= */

export interface DashboardSidebarProps {
  userData: AnyObject;
  stats: AnyObject;
  accountType: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}
