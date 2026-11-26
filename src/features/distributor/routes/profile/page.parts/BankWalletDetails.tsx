"use client";

import { EMERALD, SectionHeader, sectionClass } from "@/features/distributor/routes/profile/page.parts/support";


export function BankWalletDetails({ user }: { user: any }) {
  const bankProfile = user?.distributor_profile ?? user?.business_profile;

  const maskedAccount = user?.account_last4
    ? `XXXX XXXX ${user.account_last4}`
    : "—";

  const rows: {
    label: string;
    value: string;
    capitalize?: boolean;
  }[] = [
    {
      label: "Bank Name",
      value: bankProfile?.bank_name || "—",
    },
    {
      label: "Account Holder Name",
      value: bankProfile?.bank_holder_name || "—",
      capitalize: true,
    },
    {
      label: "Account Number",
      value: maskedAccount,
    },
    {
      label: "Account Type",
      value: bankProfile?.account_type || "—",
      capitalize: true,
    },
    {
      label: "IFSC Code",
      value: bankProfile?.bank_ifsc || "—",
    },
    {
      label: "Branch Name",
      value: bankProfile?.branch_name || "—",
    },
  ];

  const bankVerified = !!bankProfile?.bank_verified;

  return (
    <section className={sectionClass}>
      <SectionHeader title="Bank / Wallet Details" />

      <div
        className="mb-4 flex min-w-0 items-start gap-2 rounded-[12px] px-3 py-2.5"
        style={{
          backgroundColor: bankVerified ? "#eaf7f0" : "#f8f1e4",
        }}
      >
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: bankVerified ? EMERALD : "#B8935A",
          }}
        />
        <p
          className="break-words text-[11px] font-semibold leading-4 sm:text-[11.5px]"
          style={{
            color: bankVerified ? EMERALD : "#B8935A",
          }}
        >
          {bankVerified ? "Bank account verified" : "Bank verification pending"}
        </p>
      </div>

      <dl className="divide-y divide-[#F0F0F2]">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0 py-3 first:pt-0 last:pb-0">
            <dt className="mb-1 text-[10.5px] font-medium text-[#8A8E97]">
              {row.label}
            </dt>
            <dd
              className={`break-words text-[14px] font-bold leading-6 text-[#253858] ${
                row.capitalize ? "capitalize" : ""
              }`}
              title={row.value}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
