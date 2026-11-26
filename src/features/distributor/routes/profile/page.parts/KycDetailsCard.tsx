"use client";

import { DetailRow, cardClass, maskLast, maskPhone } from "@/features/distributor/routes/profile/page.parts/support";


export function KycDetailsCard({
  user,
  status,
}: {
  user: any;
  status: { label: string; color: string };
}) {
  const details = [
    {
      label: "Application ID",
      value: `KYC${String(user.id).padStart(10, "0")}`,
    },
    {
      label: "Full name",
      value: user.full_name || "—",
      capitalize: true,
    },
    {
      label: "Aadhaar number",
      value: maskLast(user.aadhaar_last4),
    },
    {
      label: "Mobile number",
      value: maskPhone(user.phone),
    },
    {
      label: "PAN number",
      value: maskLast(user.pan_last4),
    },
  ];

  return (
    <div className={cardClass}>
      <h3 className="break-words text-[15px] font-bold text-[#101828] sm:text-[16px]">
        KYC details
      </h3>

      <div className="mt-4 space-y-3 border-b border-[#e7e9ee] pb-4 sm:space-y-3.5">
        {details.map((item) => (
          <DetailRow
            key={item.label}
            label={item.label}
            value={item.value}
            capitalize={item.capitalize}
          />
        ))}
      </div>

      <div className="mt-4">
        <DetailRow
          label="KYC status"
          value={status.label}
          valueColor={status.color}
        />
      </div>
    </div>
  );
}
