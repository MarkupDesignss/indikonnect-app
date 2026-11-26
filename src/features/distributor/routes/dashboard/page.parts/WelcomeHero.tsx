"use client";

import { Check, UsersRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import type { DashboardUser } from "@/lib/redux/api/distributor/userDashboardApi";
import { formatStatus } from "@/features/distributor/routes/dashboard/page.parts/support";


// --------------------------------------------------
// Welcome hero
// --------------------------------------------------

export function WelcomeHero({
  user,
  distributorId,
  gstValue,
}: {
  user?: DashboardUser;
  distributorId: string;
  gstValue: string;
}) {
  const displayName = user?.name?.trim() || "Distributor";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const [copied, setCopied] = useState(false);
  const cleanId = distributorId.replace(/-001$/, "");
  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(cleanId);
      setCopied(true);
      toast.success("Distributor ID copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy ID. Please copy it manually.");
    }
  };
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative isolate overflow-hidden rounded-[24px] bg-[#172B52] text-white shadow-[0_16px_40px_rgba(23,43,82,.14)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[38px] border-white/[.045]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 right-1/3 h-52 w-52 rounded-full bg-[#6C96EA]/20 blur-3xl"
      />
      <div className="relative grid items-center gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] lg:p-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#DBE8FF]">
            <span className="h-2 w-2 rounded-full bg-[#7BE5B7]" /> Your
            distributor dashboard
          </span>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/15 text-base font-extrabold sm:h-12 sm:w-12 sm:text-lg">
              {initials || "D"}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] text-[#C9D8F4]">Welcome back</p>
              <h1 className="mt-0.5 break-words text-[23px] font-extrabold leading-tight tracking-tight sm:text-[30px]">
                {displayName}
              </h1>
            </div>
          </div>
          <p className="mt-2 text-[13px] leading-6 text-[#D6E2F7] sm:text-[14px]">
            Everything you need in one place. Check your earnings, track your TC
            accounts and manage your coins.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold text-white">
              <ShieldCheck size={14} />{" "}
              {formatStatus(user?.account_type || "distributor")} account
            </span>
            {user?.email && (
              <span className="inline-flex max-w-full items-center rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[11px] text-[#DFE9FC] break-all">
                {user.email}
              </span>
            )}
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold text-[#DFE9FC]">
              <span className="shrink-0">GST:</span>
              <span className="min-w-0 break-all text-white">{gstValue}</span>
            </span>
          </div>
        </div>
        <div className="min-w-0 rounded-[20px] border border-white/20 bg-white/[.11] p-3 backdrop-blur-sm sm:p-3.5">
          <div className="flex items-center justify-between gap-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#CFDDF5]">
              Your BA ID
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <UsersRound size={19} />
            </span>
          </div>
          <p className="dashboard-number mt-2 break-all text-[21px] font-extrabold tracking-tight sm:text-[24px]">
            {cleanId || "Not available"}
          </p>
          <p className="mt-2 text-[11px] leading-5 text-[#CBDCF8]">
            Use this ID for your distributor account and support requests.
          </p>
          <button
            type="button"
            onClick={copyId}
            disabled={!cleanId || cleanId === "N/A"}
            className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-[12px] font-extrabold text-[#203B6C] transition disabled:opacity-50"
          >
            {copied ? <Check size={15} /> : <span aria-hidden="true">⧉</span>}
            {copied ? "Copied!" : "Copy ID"}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
