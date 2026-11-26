"use client";

import type { IgniteDashboard } from "@/lib/redux/api/distributor/userDashboardApi";
import { useGetMyAccountsQuery } from "@/lib/redux/api/distributor/userDashboardApi";
import { trackList, trackObj } from "@/features/distributor/routes/dashboard/page.parts/support";
import { CoinsSection } from "@/features/distributor/routes/dashboard/page.parts/CoinsSection";


// --------------------------------------------------
// Screenshot-style account summary beside the coin cards.
// --------------------------------------------------
export function CoinsAndAccountStatusOverview({
  ignite,
  onRedeemSuccess,
}: {
  ignite?: IgniteDashboard | null;
  onRedeemSuccess: () => void;
}) {
  const accountQuery = useGetMyAccountsQuery();
  const source = trackObj(accountQuery.data);
  const payload = trackObj(source.data);
  const accountArray = [
    source.data,
    payload.accounts,
    payload.items,
    payload.records,
    source.accounts,
    source.records,
    trackObj(payload.data).accounts,
  ].find(Array.isArray);
  const seen = new Set<string>();
  const accounts = trackList(accountArray).flatMap((item) => {
    const accountId = String(item.ba_id ?? item.account_id ?? "").trim();
    if (!accountId || seen.has(accountId)) return [];
    seen.add(accountId);
    return [
      {
        accountId,
        rank: String(item.rank_name ?? item.rank ?? item.rank_no ?? "—"),
        status: String(item.status ?? item.membership_status ?? "—"),
      },
    ];
  });
  const counts = { registered: 0, qualified: 0, activated: 0 };
  for (const item of accounts) {
    const status = item.status.toLowerCase().replace(/[_-]/g, " ");
    if (status.includes("activ") && !status.includes("inactiv"))
      counts.activated += 1;
    else if (status.includes("qualif")) counts.qualified += 1;
    else if (status.includes("register") || status.includes("pending"))
      counts.registered += 1;
  }
  const isWaiting = accountQuery.isLoading && !accountQuery.data;
  return (
    <section
      id="accounts"
      aria-label="Coin wallet and account status"
      className="mt-3 scroll-mt-3"
    >
      <div className="mb-2">
        <h2 className="text-[19px] font-extrabold tracking-tight text-[#1D2C46] sm:text-[22px]">
          Coins & account status
        </h2>
        <p className="mt-1 text-[12px] text-[#66758D] sm:text-[13px]">
          Redeem eligible coins and check your account status.
        </p>
      </div>
      <div className="min-w-0">
        <div className="min-w-0">
          <CoinsSection ignite={ignite} onRedeemSuccess={onRedeemSuccess} />
        </div>
        {/* <div className="min-w-0 rounded-[20px] border border-[#E2E9F3] bg-white p-3 shadow-[0_6px_22px_rgba(36,55,90,.04)] sm:p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF3FF] text-[#3768C6]">
              <BarChart3 size={19} />
            </span>
            <div>
              <h3 className="text-[16px] font-extrabold text-[#1D2C46]">
                Account status summary
              </h3>
              <p className="mt-0.5 text-[11px] text-[#718097]">
                How many accounts are at each stage
              </p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              {
                label: "Registered",
                count: counts.registered,
                tone: "#B8821D",
                bg: "#FFF6E5",
              },
              {
                label: "Qualified",
                count: counts.qualified,
                tone: "#18845B",
                bg: "#ECF9F2",
              },
              {
                label: "Activated",
                count: counts.activated,
                tone: "#2867BF",
                bg: "#EDF4FF",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="min-w-0 rounded-[15px] border border-[#E7ECF3] px-2 py-4 text-center"
                style={{ backgroundColor: item.bg }}
              >
                <p
                  className="dashboard-number text-[29px] font-extrabold leading-tight sm:text-[34px]"
                  style={{ color: item.tone }}
                >
                  {isWaiting ? "—" : item.count}
                </p>
                <p className="mt-1 text-[11px] font-bold text-[#43516B] sm:text-[12px]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          {accountQuery.isError && (
            <p className="mt-2 text-[12px] font-medium text-[#B42318]">
              Unable to load account statuses. Please refresh.
            </p>
          )}
        </div> */}
      </div>
    </section>
  );
}
