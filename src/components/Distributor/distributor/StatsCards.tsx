import { Coins, HandCoins, UsersRound } from "lucide-react";

interface StatsCardsProps {
  cashWallet?: number;
  floatingRetailProfit?: number;
  directReferral?: number;
}

const stats = [
  {
    title: "Cash Wallet",
    icon: Coins,
    valueKey: "cashWallet",
    iconBg: "bg-[#e7faef]",
    iconColor: "text-[#10b95d]",
  },
  {
    title: "Floating Retail Profit",
    icon: HandCoins,
    valueKey: "floatingRetailProfit",
    iconBg: "bg-[#fff1df]",
    iconColor: "text-[#ff9d3c]",
  },
  {
    title: "Direct Referral",
    icon: UsersRound,
    valueKey: "directReferral",
    iconBg: "bg-[#eef1ff]",
    iconColor: "text-[#4478ef]",
  },
];

export default function StatsCards({
  cashWallet = 0,
  floatingRetailProfit = 0,
  directReferral = 0,
}: StatsCardsProps) {
  const values: Record<string, number> = {
    cashWallet,
    floatingRetailProfit,
    directReferral,
  };

  return (
    <div className="grid max-w-[640px] grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="h-[72px] rounded-[8px] border border-[#edf0f4] bg-white px-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex h-full items-center gap-4">
              <div
                className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full ${stat.iconBg}`}
              >
                <Icon size={22} className={stat.iconColor} strokeWidth={1.7} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#5a6276] font-sans">
                  {stat.title}
                </p>

                <p className="mt-0.5 text-[18px] font-bold text-[#1a2332] font-sans">
                  {values[stat.valueKey]}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
