"use client";

import { Check, Coins, HandCoins, Loader2, ArrowRight, Info } from "lucide-react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RedeemPointType, formatNumber } from "@/features/distributor/routes/dashboard/page.parts/support";


// --------------------------------------------------
// REDEEM COINS POPUP
// --------------------------------------------------

export function RedeemCoinsModal({
  isOpen,
  yellowBalance,
  blueBalance,
  selectedRedeemPoint,
  redeemAmount,
  isRedeeming,
  onClose,
  onSelectPoint,
  onAmountChange,
  onRedeem,
}: {
  isOpen: boolean;
  yellowBalance: number;
  blueBalance: number;
  selectedRedeemPoint: RedeemPointType;
  redeemAmount: string;
  isRedeeming: boolean;
  onClose: () => void;
  onSelectPoint: (point: RedeemPointType) => void;
  onAmountChange: (value: string) => void;
  onRedeem: () => void;
}) {
  const selectedBalance =
    selectedRedeemPoint === "yellow_bal" ? yellowBalance : blueBalance;

  const amountNumber = Number(redeemAmount);

  const isAmountValid =
    redeemAmount.trim() !== "" &&
    Number.isSafeInteger(amountNumber) &&
    amountNumber > 0;

  const exceedsBalance = isAmountValid && amountNumber > selectedBalance;

  const canRedeem =
    isAmountValid && !exceedsBalance && selectedBalance > 0 && !isRedeeming;

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isRedeeming) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isRedeeming, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[4px]"
          onClick={() => !isRedeeming && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="redeem-coins-title"
            onClick={(e) => e.stopPropagation()}
            className="thin-scroll max-h-[92dvh] w-full max-w-[500px] overflow-y-auto rounded-[22px] border border-[#E8E8E8] bg-white shadow-[0_30px_100px_rgba(0,0,0,.25)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#EBEBEB] px-5 py-5 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-[#F0E5C9] bg-[#FFF9EA] text-[#B78B30]">
                  <HandCoins size={20} />
                </span>

                <div className="min-w-0">
                  <h3
                    id="redeem-coins-title"
                    className="text-[18px] font-bold tracking-[-.035em] text-[#191919]"
                  >
                    Redeem your coins
                  </h3>

                  <p className="mt-1 text-[11px] text-[#888888]">
                    Enter the number of coins you want to redeem manually.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isRedeeming}
                aria-label="Close redeem dialog"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#E9E9E9] text-[#666666] disabled:opacity-50"
              >
                <span className="text-[21px] leading-none">×</span>
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-[11px] font-bold text-[#525D70]">
                  Select coin type
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectPoint("yellow_bal")}
                    disabled={isRedeeming}
                    aria-pressed={selectedRedeemPoint === "yellow_bal"}
                    className={`flex min-w-0 items-center justify-between gap-2 rounded-[12px] border px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      selectedRedeemPoint === "yellow_bal"
                        ? "border-[#DCC58F] bg-[#FFF9EA] shadow-[0_3px_10px_rgba(183,139,48,.07)]"
                        : "border-[#E6E9EF] bg-white"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] ${
                          selectedRedeemPoint === "yellow_bal"
                            ? "bg-[#F4E8C9] text-[#A77B22]"
                            : "bg-[#F4F5F7] text-[#858B96]"
                        }`}
                      >
                        <Coins size={16} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold text-[#30394A]">
                          Yellow coins
                        </span>
                        <span className="mt-0.5 block text-[10px] text-[#8790A0]">
                          {formatNumber(yellowBalance)} available
                        </span>
                      </span>
                    </span>

                    <span
                      className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border ${
                        selectedRedeemPoint === "yellow_bal"
                          ? "border-[#B78B30] bg-[#B78B30] text-white"
                          : "border-[#CCD2DC] bg-white"
                      }`}
                    >
                      {selectedRedeemPoint === "yellow_bal" && (
                        <Check size={11} strokeWidth={3} />
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPoint("blue_bal")}
                    disabled={isRedeeming}
                    aria-pressed={selectedRedeemPoint === "blue_bal"}
                    className={`flex min-w-0 items-center justify-between gap-2 rounded-[12px] border px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      selectedRedeemPoint === "blue_bal"
                        ? "border-[#BFCBF0] bg-[#F0F4FE] shadow-[0_3px_10px_rgba(79,106,192,.07)]"
                        : "border-[#E6E9EF] bg-white"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] ${
                          selectedRedeemPoint === "blue_bal"
                            ? "bg-[#DDE5FA] text-[#4F6AC0]"
                            : "bg-[#F4F5F7] text-[#858B96]"
                        }`}
                      >
                        <Coins size={16} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold text-[#30394A]">
                          Blue coins
                        </span>
                        <span className="mt-0.5 block text-[10px] text-[#8790A0]">
                          {formatNumber(blueBalance)} available
                        </span>
                      </span>
                    </span>

                    <span
                      className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border ${
                        selectedRedeemPoint === "blue_bal"
                          ? "border-[#4F6AC0] bg-[#4F6AC0] text-white"
                          : "border-[#CCD2DC] bg-white"
                      }`}
                    >
                      {selectedRedeemPoint === "blue_bal" && (
                        <Check size={11} strokeWidth={3} />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor="redeem-coins-amount"
                    className="text-[11px] font-bold text-[#525D70]"
                  >
                    Enter coins to redeem
                  </label>

                  <span className="text-[10px] font-semibold text-[#8992A2]">
                    Available: {formatNumber(selectedBalance)}
                  </span>
                </div>

                <div
                  className={`flex h-[47px] items-center gap-2.5 rounded-[12px] border bg-white px-3.5 transition-all focus-within:ring-4 ${
                    exceedsBalance
                      ? "border-[#E7B5B5] focus-within:border-[#CE6464] focus-within:ring-[#CE6464]/10"
                      : "border-[#E2E6ED] focus-within:border-[#7183A3] focus-within:ring-[#7183A3]/10"
                  }`}
                >
                  <Coins
                    size={17}
                    className={
                      selectedRedeemPoint === "yellow_bal"
                        ? "shrink-0 text-[#B78B30]"
                        : "shrink-0 text-[#4F6AC0]"
                    }
                  />

                  <input
                    id="redeem-coins-amount"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    autoFocus
                    placeholder="Enter coin quantity"
                    value={redeemAmount}
                    disabled={isRedeeming || selectedBalance <= 0}
                    onChange={(event) => {
                      const numericValue = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12);

                      onAmountChange(numericValue);
                    }}
                    className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-bold text-[#202A3D] outline-none placeholder:text-[11px] placeholder:font-normal placeholder:text-[#A0A7B3] disabled:cursor-not-allowed"
                  />

                  <span className="shrink-0 text-[10px] font-semibold text-[#929AAA]">
                    Coins
                  </span>
                </div>

                {exceedsBalance ? (
                  <p className="mt-1.5 text-[10px] font-semibold text-[#C34E4E]">
                    Amount cannot exceed your available coin balance.
                  </p>
                ) : (
                  <p className="mt-1.5 text-[10px] text-[#929AAA]">
                    Enter a whole number. Decimal values are not allowed.
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[11px] border border-[#E8EAEF] bg-[#FBFBFC] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <Info size={14} className="shrink-0 text-[#8792A6]" />

                  <p className="text-[10px] leading-4 text-[#7D8798]">
                    Redemption will be processed using your selected coin
                    balance.
                  </p>
                </div>

                <span
                  className={`shrink-0 text-[10px] font-bold ${
                    selectedBalance > 0 ? "text-[#28866B]" : "text-[#B85D5D]"
                  }`}
                >
                  {selectedBalance > 0
                    ? "Balance available"
                    : "Insufficient balance"}
                </span>
              </div>

              <p className="mt-2 text-[9px] leading-4 text-[#A0A6B1]">
                Green coins are displayed in your wallet but are not supported
                by the current redemption API.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isRedeeming}
                  className="inline-flex h-[47px] w-full items-center justify-center rounded-[12px] border border-[#E2E6ED] bg-white px-4 text-[12px] font-bold text-[#4A5568] transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onRedeem}
                  disabled={!canRedeem}
                  className="inline-flex h-[47px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#171717] px-4 text-[12px] font-bold text-white shadow-[0_5px_14px_rgba(0,0,0,.09)] transition-all active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#C9CDD4] disabled:text-white disabled:shadow-none"
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Redeeming...
                    </>
                  ) : (
                    <>
                      <HandCoins size={15} />
                      Redeem Coins
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
