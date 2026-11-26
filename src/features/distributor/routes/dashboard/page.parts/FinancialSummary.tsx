"use client";

import { CARD, DataValue, ExtendedIgnite, SectionTitle, formatNumber } from "@/features/distributor/routes/dashboard/page.parts/support";


export function FinancialSummary({ ignite }: { ignite?: ExtendedIgnite | null }) {
  const vals = [
    // {
    //   label: "Cash balance (USD units)",
    //   value:
    //     ignite?.cash_bal == null ? "—" : `$${formatNumber(ignite.cash_bal)}`,
    // },
    {
      label: "Cash balance (INR)",
      value:
        ignite?.cash_bal_inr == null
          ? "—"
          : `₹${formatNumber(ignite.cash_bal_inr)}`,
    },
    // {
    //   label: "Exchange rate",
    //   value:
    //     ignite?.exchange_rate == null
    //       ? "—"
    //       : formatNumber(ignite.exchange_rate),
    // },
    {
      label: "Retail profit ",
      value:
        ignite?.retail_profit_usd == null
          ? "—"
          : `₹${formatNumber(ignite.retail_profit_usd)}`,
    },
    {
      label: "Weekly pairing (INR)",
      value:
        ignite?.weekly_pairing_usd == null
          ? "—"
          : `₹${formatNumber(ignite.weekly_pairing_usd)}`,
    },
  ];

  return (
    <section className={`${CARD} dashboard-card mt-5 p-4 sm:p-5`}>
      <SectionTitle>Financial summary</SectionTitle>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {vals.map((item) => (
          <DataValue key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
}
