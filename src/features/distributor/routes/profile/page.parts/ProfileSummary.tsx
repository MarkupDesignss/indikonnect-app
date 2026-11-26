"use client";

import { ShieldCheck } from "lucide-react";
import { EMERALD, NAVY, sectionClass } from "@/features/distributor/routes/profile/page.parts/support";


export function ProfileSummary({ user }: { user: any }) {
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .filter(Boolean)
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className={sectionClass}>
      <div className="mb-5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#4770AE]">
        <ShieldCheck size={13} className="text-[#161616]" />
        Account overview
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border-2 border-white shadow-[0_0_0_1px_#E5E5E7] sm:h-[52px] sm:w-[52px]"
          style={{ backgroundColor: NAVY }}
        >
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[14px] font-bold text-white">{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-words text-[16px] font-extrabold leading-6 tracking-[-0.02em] text-[#172B4D] sm:text-[17px]">
            {user?.full_name?.toUpperCase() || "—"}
          </p>
          <p className="break-all text-[11px] leading-4 text-[#8A8E97] sm:truncate sm:text-[11.5px]">
            {user?.email || "—"}
          </p>
        </div>

        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: user?.is_active ? EMERALD : "#98a2b3",
          }}
          title={user?.is_active ? "Active" : "Inactive"}
        />
      </div>

      <div className="mt-6 space-y-0 divide-y divide-[#EAF0F7] border-t border-[#EAF0F7]">
        <div className="py-3.5 first:pt-4 last:pb-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#71819A] sm:text-[12px]">
            Account ID
          </p>
          <p className="mt-1 break-all text-[14px] font-bold text-[#253858]">
            {user?.distributor_id || "—"}
          </p>
        </div>

        <div className="py-3.5 first:pt-4 last:pb-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#71819A] sm:text-[12px]">
            Account Type
          </p>
          <p className="mt-1 break-words text-[12px] font-semibold capitalize text-[#4B4D56] sm:text-[13px]">
            {user?.account_type || "—"}
          </p>
        </div>

        <div className="py-3.5 first:pt-4 last:pb-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#71819A] sm:text-[12px]">
            Status
          </p>
          <p
            className="mt-1 flex items-center gap-2 break-words text-[12px] font-semibold sm:text-[13px]"
            style={{ color: user?.is_active ? EMERALD : "#98a2b3" }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor: user?.is_active ? EMERALD : "#98a2b3",
              }}
            />
            <span>
              {user?.distributor_status ||
                (user?.is_active ? "Active" : "Inactive")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
