"use client";

import { useEffect, useState } from "react";
import { Check, Coins, HandCoins, Loader2, X } from "lucide-react";
import { BLACK_BUTTON, CoinType, WalletBalances, fmt, numberOf } from "@/features/distributor/routes/wallet/wallet.parts/support";


export function RedeemModal({
  balances,
  busy,
  onClose,
  onConfirm,
}: {
  balances: WalletBalances;
  busy: boolean;
  onClose: () => void;
  onConfirm: (type: CoinType, amount: number) => Promise<void>;
}) {
  const [type, setType] = useState<CoinType>("yellow_bal");
  const [quantity, setQuantity] = useState("");

  const max = numberOf(balances[type]);
  const amount = Number(quantity);

  const valid =
    quantity.trim() !== "" &&
    Number.isSafeInteger(amount) &&
    amount > 0 &&
    amount <= max;

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };

    document.addEventListener("keydown", listener);

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", listener);
      document.body.style.overflow = original;
    };
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#091631]/70 p-3 backdrop-blur-[5px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-redeem-title"
        className="my-auto max-h-[calc(100dvh-24px)] w-full max-w-[500px] overflow-y-auto rounded-[24px] border border-white/80 bg-white shadow-[0_30px_100px_-24px_rgba(0,0,0,.45)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#EDF0F3] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#FFF6E5] text-[#BD8D28]">
              <HandCoins size={20} />
            </div>

            <div>
              <h2
                id="wallet-redeem-title"
                className="text-[16px] font-bold text-[#202630]"
              >
                Redeem Coins
              </h2>
              <p className="mt-0.5 text-[11px] text-[#8590A0]">
                Redeem eligible Yellow or Blue coins securely
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-[#6D7889] hover:bg-[#F3F5F8] disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && !busy) void onConfirm(type, amount);
          }}
          className="space-y-4 p-5"
        >
          <div>
            <p className="mb-2 text-[11px] font-bold text-[#4E596A]">
              Select coin type
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(["yellow_bal", "blue_bal"] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  disabled={busy}
                  onClick={() => {
                    setType(item);
                    setQuantity("");
                  }}
                  className={`flex items-center justify-between rounded-[11px] border p-3 text-left transition ${
                    type === item
                      ? "border-[#323B4B] bg-[#F6F7F9]"
                      : "border-[#E4E8EF] bg-white hover:border-[#ABB4C2]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#303948]">
                      <Coins
                        size={15}
                        className={
                          item === "yellow_bal"
                            ? "text-[#E4AC19]"
                            : "text-[#2673E7]"
                        }
                      />
                      {item === "yellow_bal" ? "Yellow" : "Blue"}
                    </div>

                    <p className="mt-1 text-[10px] text-[#788396]">
                      {fmt(balances[item])} available
                    </p>
                  </div>

                  <span
                    className={`flex h-[17px] w-[17px] items-center justify-center rounded-full border ${
                      type === item
                        ? "border-black bg-black text-white"
                        : "border-[#C6CCD6]"
                    }`}
                  >
                    {type === item && <Check size={11} />}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label
                htmlFor="redeem-quantity"
                className="text-[11px] font-bold text-[#4E596A]"
              >
                Coins to redeem
              </label>

              <span className="text-[10px] text-[#818B9A]">
                Available: {fmt(max)}
              </span>
            </div>

            <input
              id="redeem-quantity"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value.replace(/\D/g, "").slice(0, 12))
              }
              disabled={busy || max <= 0}
              placeholder="Enter coin quantity"
              className="h-12 w-full rounded-[12px] border border-[#C9D6E6] bg-[#FBFCFF] px-4 text-[15px] font-bold text-[#182D50] outline-none focus:border-[#6185BE] focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
            />

            {quantity && !valid && (
              <p className="mt-1.5 text-[11px] text-[#BD5353]">
                Enter a positive whole number not exceeding your balance.
              </p>
            )}
          </div>

          <p className="rounded-[10px] border border-[#E9EDF2] bg-[#FAFBFC] p-3 text-[11px] leading-5 text-[#758092]">
            Only Yellow and Blue coins are supported by the existing redemption
            API. Green coins remain visible in your wallet.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="h-10 flex-1 rounded-[10px] border border-[#DFE4EA] bg-white text-[12px] font-bold text-[#4B5667] hover:bg-[#F7F8FA]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!valid || busy}
              className={`${BLACK_BUTTON} h-10 flex-1`}
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <HandCoins size={15} />
              )}
              {busy ? "Redeeming..." : "Redeem Coins"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
