"use client";

import { ExtendedIgnite, formatNumber } from "@/features/distributor/routes/dashboard/page.parts/support";


export function EarnedCoinsAndNetwork({ ignite }: { ignite?: ExtendedIgnite | null }) {
  const left = ignite?.floating_cv_left;
  const right = ignite?.floating_cv_right;
  const paired = ignite?.cv_left;
  const fields = [
    {
      label: "Floating CV • left",
      value: left == null ? "—" : formatNumber(left),
    },
    {
      label: "Floating CV • right",
      value: right == null ? "—" : formatNumber(right),
    },
    {
      label: "Settled CV • left",
      value: ignite?.cv_left == null ? "—" : formatNumber(paired),
    },
    {
      label: "Settled CV • right",
      value: ignite?.cv_right == null ? "—" : formatNumber(ignite.cv_right),
    },
    {
      label: "Total CV • left",
      value:
        ignite?.total_cv_left == null
          ? "—"
          : formatNumber(ignite.total_cv_left),
    },
    {
      label: "Total CV • right",
      value:
        ignite?.total_cv_right == null
          ? "—"
          : formatNumber(ignite.total_cv_right),
    },
    { label: "Strong leg", value: ignite?.strong_leg ?? "—" },
    {
      label: "Total steps",
      value:
        ignite?.total_steps == null ? "—" : formatNumber(ignite.total_steps),
    },
  ];

  // return (
  //   <section className={`${CARD} dashboard-card mt-5 p-4 sm:p-5`}>
  //     <SectionTitle>Earned coins & network</SectionTitle>
  //     <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
  //       {fields.map((item) => (
  //         <DataValue key={item.label} label={item.label} value={item.value} />
  //       ))}
  //     </div>
  //   </section>
  // );
  return null;
}
