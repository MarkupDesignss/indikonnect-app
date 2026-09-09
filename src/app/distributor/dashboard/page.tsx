"use client";

import {
  BarChart3,
  ChevronDown,
  GitBranch,
  LayoutDashboard,
  Loader2,
  Percent,
  ReceiptText,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import StatsCards from "@/components/Distributor/distributor/StatsCards";

// ✅ Reusable Sidebar import karein
import Sidebar from "../Sidebar";

// ---- Design tokens (shared across the distributor area) ----
const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
  `}</style>
);

const accounts = [
  { id: "AIA990011-001", rank: "Silver", status: "Activated" },
  { id: "AIA990011-002", rank: "Silver", status: "Activated" },
  { id: "AIA990011-003", rank: "Silver", status: "Activated" },
  { id: "AIA990011-004", rank: "Silver", status: "Activated" },
  { id: "AIA990011-005", rank: "Silver", status: "Activated" },
  { id: "AIA990011-006", rank: "Silver", status: "Activated" },
];

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
    yellow: { circle: "border-[#B8935A]/40 bg-[#f8f1e4]", coin: BRASS },
    green: { circle: "border-[#1f9d6b]/40 bg-[#eaf7f0]", coin: EMERALD },
    blue: { circle: "border-[#3955A6]/40 bg-[#eceffb]", coin: INDIGO },
  };

  const style = styles[color];

  return (
    <div className="flex h-[104px] flex-1 flex-col items-center justify-center rounded-[14px] border border-[#e7e9ee] bg-white transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)]">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${style.circle}`}>
        <div
          className="h-4 w-5 rounded-full ring-2 ring-white"
          style={{ backgroundColor: style.coin }}
        />
      </div>
      <p className="mt-2.5 text-[22px] font-black text-[#101828]">{value}</p>
      <p className="text-[12.5px] font-semibold text-[#667085]">{label}</p>
    </div>
  );
}

function CoinsSection() {
  return (
    <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-5">
      <h3 className="text-[15px] font-bold text-[#101828]">My coins</h3>
      <div className="mt-4 flex gap-3">
        <CoinCard color="yellow" value={0} label="Yellow coin" />
        <CoinCard color="green" value={0} label="Green coin" />
        <CoinCard color="blue" value={3} label="Blue coin" />
      </div>
    </section>
  );
}

function AccountSummary() {
  const stats = [
    { value: 0, label: "Registered", color: BRASS },
    { value: 0, label: "Qualified", color: EMERALD },
    { value: 3, label: "Activated", color: INDIGO },
  ];

  return (
    <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-5">
      <h3 className="text-[15px] font-bold text-[#101828]">My account status</h3>
      <div className="mt-4 flex gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex h-[104px] flex-1 flex-col items-center justify-center rounded-[14px] border border-[#e7e9ee] bg-white transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)]"
          >
            <p className="text-[26px] font-black" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="mt-1 text-[12.5px] font-semibold text-[#667085]">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AccountTable() {
  return (
    <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#101828]">My accounts</h3>
        <button
          className="flex items-center gap-1 text-[13px] font-semibold transition-colors"
          style={{ color: NAVY }}
        >
          View all
          <ChevronDown size={14} className="-rotate-90" />
        </button>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-[#e7e9ee] pb-3">
          <span className="text-[11.5px] font-bold tracking-wide text-[#8a92a6]">Account ID</span>
          <span className="text-[11.5px] font-bold tracking-wide text-[#8a92a6]">Rank</span>
          <span className="text-[11.5px] font-bold tracking-wide text-[#8a92a6]">Status</span>
        </div>

        {accounts.map((account, idx) => (
          <div
            key={account.id}
            className={`grid h-12 grid-cols-[1.5fr_1fr_1fr] items-center ${idx !== accounts.length - 1 ? "border-b border-[#f0f2f5]" : ""
              }`}
          >
            <span className="text-[13px] font-semibold text-[#101828]">{account.id}</span>
            <span className="text-[13px] text-[#667085]">{account.rank}</span>
            <span className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: EMERALD }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: EMERALD }} />
              {account.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CvFilters() {
  const fieldClass =
    "flex h-11 w-full items-center justify-between rounded-[10px] border border-[#e5e9ef] bg-[#f7f8fa] px-4 text-[13.5px] text-[#101828] transition-colors hover:border-[#0E1B3D]/40 focus:border-[#0E1B3D] focus:outline-none focus:ring-2 focus:ring-[#0E1B3D]/10";

  return (
    <div className="mt-5">
      <div className="grid grid-cols-[1.1fr_1.25fr_.4fr_auto] items-end gap-4">
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-[#5a6276]">TC account</label>
          <button className={fieldClass}>
            <span>TC-001</span>
            <ChevronDown size={16} className="text-[#98a2b3]" />
          </button>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-[#5a6276]">Week</label>
          <button className={fieldClass}>
            <span>Week 34 (22 Aug – 28 Aug 2026)</span>
            <ChevronDown size={16} className="text-[#98a2b3]" />
          </button>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-[#5a6276]">Year</label>
          <button className={fieldClass}>
            <span>2026</span>
            <ChevronDown size={16} className="text-[#98a2b3]" />
          </button>
        </div>

        <button
          className="h-11 min-w-[90px] rounded-[10px] px-5 text-[13.5px] font-semibold text-white transition-colors"
          style={{ backgroundColor: NAVY }}
        >
          Search
        </button>
      </div>
    </div>
  );
}

// ---- Main component ----
export default function DistributorDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authDebug, setAuthDebug] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const distributorToken = localStorage.getItem("distributor_token");
    const authToken = localStorage.getItem("auth_token");
    const userType = localStorage.getItem("user_type");
    const isLoggedIn = localStorage.getItem("is_logged_in");

    const isDistributor =
      (!!distributorToken && userType === "distributor") ||
      (!!distributorToken && isLoggedIn === "true") ||
      (!!authToken && userType === "distributor");

    if (!isDistributor) {
      setAuthDebug({ distributorToken: !!distributorToken, authToken: !!authToken, userType, isLoggedIn });
      router.push("/indiekonnect-web/profile/");
    } else {
      setIsAuthorized(true);
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ fontFamily: "'Lato', sans-serif" }} className="flex min-h-screen items-center justify-center bg-white">
        <FontImport />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: NAVY }} />
          <p className="text-[13.5px] font-semibold text-[#667085]">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div
        style={{ fontFamily: "'Lato', sans-serif" }}
        className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-8"
      >
        <FontImport />
        <div className="w-full max-w-[440px] rounded-[16px] border border-[#e7e9ee] bg-white p-7 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <h2 className="text-[17px] font-bold text-[#101828]">You don't have distributor access</h2>
          <p className="mt-2 text-[13.5px] text-[#667085]">
            Sign in with a distributor account to view this dashboard.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-5 h-10 w-full rounded-[10px] text-[13.5px] font-semibold text-white transition-colors"
            style={{ backgroundColor: NAVY }}
          >
            Go to home
          </button>

          {process.env.NODE_ENV === "development" && authDebug && (
            <div className="mt-4 rounded-[10px] bg-[#f7f8fa] p-3 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">
                Dev only — auth debug
              </p>
              <pre className="mt-1 overflow-auto text-[11px] text-[#475066]">
                {JSON.stringify(authDebug, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen w-full bg-white">
      <FontImport />
      <DashboardHeader distributorId="AIA603525" />

      <div className="relative flex h-[calc(100vh-72px)]">
        {/* ✅ Yahan Reusable Sidebar use kiya hai */}
        <Sidebar />

        <div className="min-w-0 flex-1 overflow-y-auto bg-[#f7f8fa] px-8 pb-8 pt-6">
          <h1 className="text-[24px] font-black tracking-[-0.01em] text-[#101828]">Dashboard</h1>

          <div className="mt-6">
            <StatsCards cashWallet={0} floatingRetailProfit={0} directReferral={0} />
          </div>

          <section className="mt-10">
            <h2 className="text-[19px] font-bold text-[#101828]">CV counter</h2>

            <CvFilters />

            <div className="mt-6 grid grid-cols-2 gap-5">
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
  );
}