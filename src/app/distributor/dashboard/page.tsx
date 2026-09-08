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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import StatsCards from "@/components/Distributor/distributor/StatsCards";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Profile",
    icon: UserRound,
    dropdown: true,
  },
  {
    label: "Wallet",
    icon: WalletCards,
    dropdown: true,
  },
  {
    label: "Accounts",
    icon: UsersRound,
  },
  {
    label: "My Referral",
    icon: GitBranch,
  },
  {
    label: "Transactions",
    icon: ReceiptText,
    dropdown: true,
  },
  {
    label: "Order History",
    icon: ReceiptText,
  },
  {
    label: "Binary Tree",
    icon: GitBranch,
  },
  {
    label: "Sponsor Tree",
    icon: UsersRound,
  },
  {
    label: "Commission",
    icon: Percent,
  },
  {
    label: "Downline CV Report",
    icon: BarChart3,
  },
];

const accounts = [
  {
    id: "AIA990011-001",
    rank: "Silver",
    status: "Activated",
  },
  {
    id: "AIA990011-002",
    rank: "Silver",
    status: "Activated",
  },
  {
    id: "AIA990011-003",
    rank: "Silver",
    status: "Activated",
  },
  {
    id: "AIA990011-004",
    rank: "Silver",
    status: "Activated",
  },
  {
    id: "AIA990011-005",
    rank: "Silver",
    status: "Activated",
  },
  {
    id: "AIA990011-006",
    rank: "Silver",
    status: "Activated",
  },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-full w-[280px] shrink-0 flex-col border-r border-[#e9edf2] bg-white">
      <div className="flex-1 overflow-y-auto px-5 pt-6">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-[#e9edf2] pb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3964FE] shadow-md shadow-[#3964FE]/30">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>

          <div>
            <h2 className="text-base font-bold tracking-wide text-[#1a2332]">
              Indie Konnect
            </h2>

            <p className="text-[11px] tracking-wider text-[#8a92a6]">
              DASHBOARD
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-5 space-y-1 pb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const href =
              item.label === "Dashboard"
                ? "/distributor/dashboard"
                : item.label === "Profile"
                  ? "/distributor/profile"
                  : item.label === "Wallet"
                    ? "/distributor/wallet"
                    : item.label === "Accounts"
                      ? "/distributor/accounts"
                      : item.label === "My Referral"
                        ? "/distributor/referral"
                        : item.label === "Transactions"
                          ? "/distributor/transactions"
                          : item.label === "Order History"
                            ? "/distributor/order-history"
                            : item.label === "Binary Tree"
                              ? "/distributor/binary-tree"
                              : item.label === "Sponsor Tree"
                                ? "/distributor/sponsor-tree"
                                : item.label === "Commission"
                                  ? "/distributor/commission"
                                  : item.label === "Downline CV Report"
                                    ? "/distributor/downline-cv"
                                    : "#";

            const isActive =
              item.label === "Dashboard"
                ? pathname === "/distributor/dashboard"
                : item.label === "Profile"
                  ? pathname?.startsWith("/distributor/profile")
                  : item.label === "Wallet"
                    ? pathname?.startsWith("/distributor/wallet")
                    : item.label === "Accounts"
                      ? pathname?.startsWith("/distributor/accounts")
                      : item.label === "My Referral"
                        ? pathname?.startsWith("/distributor/referral")
                        : item.label === "Transactions"
                          ? pathname?.startsWith("/distributor/transactions")
                          : item.label === "Order History"
                            ? pathname?.startsWith("/distributor/order-history")
                            : item.label === "Binary Tree"
                              ? pathname?.startsWith("/distributor/binary-tree")
                              : item.label === "Sponsor Tree"
                                ? pathname?.startsWith(
                                    "/distributor/sponsor-tree",
                                  )
                                : item.label === "Commission"
                                  ? pathname?.startsWith(
                                      "/distributor/commission",
                                    )
                                  : item.label === "Downline CV Report"
                                    ? pathname?.startsWith(
                                        "/distributor/downline-cv",
                                      )
                                    : false;

            return (
              <Link
                key={item.label}
                href={href}
                className={`group relative flex h-12 w-full items-center rounded-xl px-3 text-left transition-all duration-200 ${
                  isActive
                    ? "bg-[#3964FE] text-white shadow-lg shadow-[#3964FE]/30"
                    : "text-[#5a6276] hover:bg-[#f0f4ff] hover:text-[#3964FE]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-lg" />
                )}

                <Icon
                  size={20}
                  strokeWidth={1.7}
                  className={`mr-3 shrink-0 transition-all ${
                    isActive
                      ? "text-white"
                      : "text-[#8a92a6] group-hover:text-[#3964FE]"
                  }`}
                />

                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-white"
                      : "text-[#5a6276] group-hover:text-[#3964FE]"
                  }`}
                >
                  {item.label}
                </span>

                {item.dropdown && (
                  <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className={`ml-auto transition-transform ${
                      isActive
                        ? "text-white"
                        : "text-[#b0b8c8] group-hover:text-[#3964FE]"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User - Fixed at bottom with proper spacing */}
      <div className="shrink-0 px-5 pb-5">
        <div className="rounded-xl border border-[#e9edf2] bg-[#f0f4ff] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3964FE] shadow-md shadow-[#3964FE]/30">
              <UserRound className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#1a2332]">
                Distributor
              </p>

              <p className="text-[11px] text-[#8a92a6]">AIA603525</p>
            </div>

            <div className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function CoinCard({
  color,
  value,
  label,
}: {
  color: "yellow" | "green" | "blue";
  value: number;
  label: string;
}) {
  const styles = {
    yellow: {
      circle: "border-[#ffbf00] bg-[#fff8df]",
      coin: "bg-[#ffbd00]",
      value: "text-[#1f252e]",
    },
    green: {
      circle: "border-[#21b96b] bg-[#e8faef]",
      coin: "bg-[#17b963]",
      value: "text-[#1f252e]",
    },
    blue: {
      circle: "border-[#4a82ed] bg-[#edf3ff]",
      coin: "bg-[#3c78e9]",
      value: "text-[#1f252e]",
    },
  };

  const style = styles[color];

  return (
    <div className="flex h-[100px] flex-1 flex-col items-center justify-center rounded-xl border border-[#edf0f4] bg-white shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`flex h-[32px] w-[32px] items-center justify-center rounded-full border-2 ${style.circle}`}
      >
        <div
          className={`h-[16px] w-[20px] rounded-[50%] border-2 border-white ${style.coin}`}
        />
      </div>

      <p className={`mt-2.5 text-2xl font-bold ${style.value}`}>{value}</p>

      <p className="text-sm text-[#5a6276]">{label}</p>
    </div>
  );
}

function CoinsSection() {
  return (
    <section className="rounded-xl border border-[#edf0f4] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1a2332]">My Coins</h3>

      <div className="mt-4 flex gap-3">
        <CoinCard color="yellow" value={0} label="Yellow Coin" />
        <CoinCard color="green" value={0} label="Green Coin" />
        <CoinCard color="blue" value={3} label="Blue Coin" />
      </div>
    </section>
  );
}

function AccountSummary() {
  return (
    <section className="rounded-xl border border-[#edf0f4] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1a2332]">
        My Account Status
      </h3>

      <div className="mt-4 flex gap-3">
        <div className="flex h-[100px] flex-1 flex-col items-center justify-center rounded-xl border border-[#edf0f4] bg-white shadow-sm hover:shadow-md transition-shadow">
          <p className="text-3xl font-bold text-[#e3aa00]">0</p>
          <p className="mt-1 text-sm text-[#5a6276]">Registered</p>
        </div>

        <div className="flex h-[100px] flex-1 flex-col items-center justify-center rounded-xl border border-[#edf0f4] bg-white shadow-sm hover:shadow-md transition-shadow">
          <p className="text-3xl font-bold text-[#09ac59]">0</p>
          <p className="mt-1 text-sm text-[#5a6276]">Qualified</p>
        </div>

        <div className="flex h-[100px] flex-1 flex-col items-center justify-center rounded-xl border border-[#edf0f4] bg-white shadow-sm hover:shadow-md transition-shadow">
          <p className="text-3xl font-bold text-[#2378e8]">3</p>
          <p className="mt-1 text-sm text-[#5a6276]">Activated</p>
        </div>
      </div>
    </section>
  );
}

function AccountTable() {
  return (
    <section className="rounded-xl border border-[#edf0f4] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1a2332]">
          My Account Status
        </h3>

        <button className="text-sm font-medium text-[#3964FE] hover:text-[#2a4fd8] transition-colors">
          View All →
        </button>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-[#edf0f4] pb-3">
          <span className="text-xs font-semibold uppercase text-[#8a92a6] tracking-wider">
            Account ID
          </span>

          <span className="text-xs font-semibold uppercase text-[#8a92a6] tracking-wider">
            Rank
          </span>

          <span className="text-xs font-semibold uppercase text-[#8a92a6] tracking-wider">
            Status
          </span>
        </div>

        {accounts.map((account, idx) => (
          <div
            key={account.id}
            className={`grid h-12 grid-cols-[1.5fr_1fr_1fr] items-center ${
              idx !== accounts.length - 1 ? "border-b border-[#f0f2f5]" : ""
            }`}
          >
            <span className="text-sm font-medium text-[#1a2332]">
              {account.id}
            </span>

            <span className="text-sm text-[#5a6276]">{account.rank}</span>

            <span className="flex items-center gap-2 text-sm font-medium text-[#09aa57]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#09aa57]"></span>
              {account.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CvFilters() {
  return (
    <div className="mt-5">
      <div className="grid grid-cols-[1.1fr_1.25fr_.4fr_auto] items-end gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5a6276]">
            TC- Account
          </label>

          <button className="flex h-11 w-full items-center justify-between rounded-xl border border-[#e5e9ef] bg-white px-4 text-sm text-[#1a2332] hover:border-[#3964FE] transition-colors focus:ring-2 focus:ring-[#3964FE]/20">
            <span>TC-001</span>
            <ChevronDown size={18} className="text-[#8a92a6]" />
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#5a6276]">
            Week
          </label>

          <button className="flex h-11 w-full items-center justify-between rounded-xl border border-[#e5e9ef] bg-white px-4 text-sm text-[#1a2332] hover:border-[#3964FE] transition-colors focus:ring-2 focus:ring-[#3964FE]/20">
            <span>Week 34 (22 Aug - 28 Aug 2026)</span>
            <ChevronDown size={18} className="text-[#8a92a6]" />
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#5a6276]">
            Year
          </label>

          <button className="flex h-11 w-full items-center justify-between rounded-xl border border-[#e5e9ef] bg-white px-4 text-sm text-[#1a2332] hover:border-[#3964FE] transition-colors focus:ring-2 focus:ring-[#3964FE]/20">
            <span>2026</span>
            <ChevronDown size={18} className="text-[#8a92a6]" />
          </button>
        </div>

        <button className="h-11 min-w-[90px] rounded-xl bg-[#3964FE] px-5 text-sm font-medium text-white shadow-md shadow-[#3964FE]/30 hover:shadow-lg hover:shadow-[#3964FE]/40 transition-all hover:bg-[#2a4fd8]">
          Search
        </button>
      </div>
    </div>
  );
}

// ✅ MAIN COMPONENT WITH FIXED CLIENT-SIDE PROTECTION
export default function DistributorDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Check if running on client side
    if (typeof window === "undefined") return;

    // 🔥 FIX: Get ALL possible token sources
    const distributorToken = localStorage.getItem("distributor_token");
    const authToken = localStorage.getItem("auth_token");
    const userType = localStorage.getItem("user_type");
    const isLoggedIn = localStorage.getItem("is_logged_in");

    // Log everything for debugging
    console.log("🔍 Distributor Dashboard - Auth Check:");
    console.log("  📌 distributor_token:", distributorToken);
    console.log("  📌 auth_token:", authToken);
    console.log("  📌 user_type:", userType);
    console.log("  📌 is_logged_in:", isLoggedIn);
    console.log("  📌 All localStorage keys:", Object.keys(localStorage));

    // 🔥 FIX: Check if user is a distributor (multiple conditions)
    const isDistributor =
      (!!distributorToken && userType === "distributor") ||
      (!!distributorToken && isLoggedIn === "true") ||
      (!!authToken && userType === "distributor");

    console.log("  ✅ isDistributor:", isDistributor);

    // Store debug info
    setDebugInfo({
      distributorToken: !!distributorToken,
      authToken: !!authToken,
      userType: userType,
      isLoggedIn: isLoggedIn,
      isDistributor: isDistributor,
    });

    if (!isDistributor) {
      console.log("❌ Not authorized as distributor, redirecting to profile");
      // Redirect to customer profile
      router.push("/indiekonnect-web/profile/");
    } else {
      console.log("✅ Authorized as distributor, showing dashboard");
      setIsAuthorized(true);
    }

    setIsLoading(false);
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#3964FE] animate-spin" />
          <p className="text-sm text-[#5a6276]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show debug view if not authorized (remove in production)
  if (!isAuthorized && debugInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="max-w-2xl w-full bg-white rounded-xl border border-red-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            ⚠️ Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have distributor access. Debug info:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono overflow-auto">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Home
            </button>
            <button
              onClick={() => {
                // 🔥 Force set distributor token for testing
                localStorage.setItem("distributor_token", "test-token-123");
                localStorage.setItem("user_type", "distributor");
                localStorage.setItem("is_logged_in", "true");
                localStorage.setItem("auth_token", "test-token-123");
                window.location.reload();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🔧 Force Set Distributor
            </button>
            <button
              onClick={() => {
                // Show all localStorage items
                const allItems: any = {};
                Object.keys(localStorage).forEach((key) => {
                  allItems[key] = localStorage.getItem(key);
                });
                alert(JSON.stringify(allItems, null, 2));
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              📋 Show All Storage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authorized (will redirect)
  if (!isAuthorized) {
    return null;
  }

  // ✅ Render dashboard content only for authorized distributors
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full h-full">
        <div className="w-full bg-white">
          <DashboardHeader distributorId="AIA603525" />

          <div className="flex h-[calc(100vh-72px)] relative">
            <Sidebar />

            <div className="min-w-0 flex-1 overflow-y-auto bg-[#fafcff] px-8 pt-6 pb-8">
              <h1 className="text-2xl font-bold text-[#1a2332]">Dashboard</h1>

              <div className="mt-6">
                <StatsCards
                  cashWallet={0}
                  floatingRetailProfit={0}
                  directReferral={0}
                />
              </div>

              <section className="mt-10">
                <h2 className="text-2xl font-bold text-[#1a2332]">
                  CV Counter
                </h2>

                <CvFilters />

                <div className="mt-6 grid grid-cols-[1fr_1fr] gap-5">
                  <div className="space-y-5">
                    <CoinsSection />
                    <AccountSummary />
                  </div>

                  <AccountTable />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
