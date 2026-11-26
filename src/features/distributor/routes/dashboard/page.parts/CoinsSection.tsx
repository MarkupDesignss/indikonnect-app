"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { IgniteDashboard } from "@/lib/redux/api/distributor/userDashboardApi";
import { useRedeemCoinsMutation } from "@/lib/redux/api/distributor/userDashboardApi";
import { IgniteCoinValues, RedeemPointType, toNumber } from "@/features/distributor/routes/dashboard/page.parts/support";
import { CoinCard } from "@/features/distributor/routes/dashboard/page.parts/CoinCard";
import { RedeemCoinsModal } from "@/features/distributor/routes/dashboard/page.parts/RedeemCoinsModal";


// --------------------------------------------------
// Coins section (redeem opens in a popup)
// --------------------------------------------------

export function CoinsSection({
  ignite,
  onRedeemSuccess,
}: {
  ignite?: IgniteDashboard | null;
  onRedeemSuccess: () => void;
}) {
  const coinValues = ignite as
    (IgniteDashboard & IgniteCoinValues) | null | undefined;

  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  const [selectedRedeemPoint, setSelectedRedeemPoint] =
    useState<RedeemPointType>("yellow_bal");

  const [redeemAmount, setRedeemAmount] = useState("");

  const [redeemCoins, { isLoading: isRedeeming }] = useRedeemCoinsMutation();

  const yellowBalance = toNumber(coinValues?.yellow_bal);
  const blueBalance = toNumber(coinValues?.blue_bal);

  const selectedBalance =
    selectedRedeemPoint === "yellow_bal" ? yellowBalance : blueBalance;

  const handleCloseModal = () => {
    if (isRedeeming) return;
    setIsRedeemModalOpen(false);
    setRedeemAmount("");
  };

  const handleSelectPoint = (point: RedeemPointType) => {
    setSelectedRedeemPoint(point);
    setRedeemAmount("");
  };

  const handleRedeemCoins = async () => {
    if (isRedeeming) return;

    const amountNumber = Number(redeemAmount);

    const isAmountValid =
      redeemAmount.trim() !== "" &&
      Number.isSafeInteger(amountNumber) &&
      amountNumber > 0;

    if (!isAmountValid) {
      toast.error("Please enter a valid number of coins.");
      return;
    }

    if (amountNumber > selectedBalance) {
      toast.error("Redeem amount cannot exceed your available balance.");
      return;
    }

    if (selectedBalance <= 0) {
      toast.error("You do not have enough coins to redeem.");
      return;
    }

    try {
      const response = await redeemCoins({
        coins_to_redeem: amountNumber,
        point_type: selectedRedeemPoint,
      }).unwrap();

      if (response.success === false || response.status === false) {
        toast.error(response.message || "Unable to redeem coins.");
        return;
      }

      toast.success(response.message || "Coins redeemed successfully.");

      setRedeemAmount("");
      setIsRedeemModalOpen(false);

      onRedeemSuccess();
    } catch (error: unknown) {
      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };

      toast.error(
        apiError?.data?.message ||
          apiError?.message ||
          "Failed to redeem coins. Please try again.",
      );
    }
  };

  return (
    <section className="min-w-0 rounded-[20px] border border-[#E2E9F3] bg-white p-3 shadow-[0_6px_22px_rgba(36,55,90,.04)] sm:p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#1D2C46]">
            My coin wallet
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-[#718097]">
            See your coin balance and redeem eligible coins
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <CoinCard
          color="yellow"
          value={coinValues?.yellow_bal ?? 0}
          label="Yellow Coin"
        />
        <CoinCard
          color="green"
          value={coinValues?.green_bal ?? 0}
          label="Green Coin"
        />
        <CoinCard
          color="blue"
          value={coinValues?.blue_bal ?? 0}
          label="Blue Coin"
        />
      </div>

      <RedeemCoinsModal
        isOpen={isRedeemModalOpen}
        yellowBalance={yellowBalance}
        blueBalance={blueBalance}
        selectedRedeemPoint={selectedRedeemPoint}
        redeemAmount={redeemAmount}
        isRedeeming={isRedeeming}
        onClose={handleCloseModal}
        onSelectPoint={handleSelectPoint}
        onAmountChange={setRedeemAmount}
        onRedeem={handleRedeemCoins}
      />
    </section>
  );
}
