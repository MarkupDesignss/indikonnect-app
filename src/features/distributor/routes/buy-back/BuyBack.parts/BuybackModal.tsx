"use client";

import { useInitiateBuybackMutation } from "@/lib/redux/api/distributor/buybackApi";
import { X, Package, AlertCircle, Check, Loader2, Truck, RotateCcw, ShoppingBag, Home, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { BuybackModalProps, ReturnMethod } from "@/features/distributor/routes/buy-back/BuyBack.parts/support";
import { ModalShell } from "@/features/distributor/routes/buy-back/BuyBack.parts/ModalShell";


export const BuybackModal = ({
  isOpen,
  onClose,
  order,
  onSuccess,
  canBuyback,
}: BuybackModalProps) => {
  const dispatch = useAppDispatch();

  const [initiateBuyback, { isLoading }] = useInitiateBuybackMutation();

  const maxQty = order?.available_for_return || order?.quantity || 1;

  const [quantity, setQuantity] = useState<number>(1);

  const [reason, setReason] = useState("Product is no longer required");

  const [declaresMarketable, setDeclaresMarketable] = useState(false);

  const [declaresUnsold, setDeclaresUnsold] = useState(false);

  const [declaresUnused, setDeclaresUnused] = useState(false);

  const [returnMethod, setReturnMethod] = useState<ReturnMethod>("doorstep");

  const [courierName, setCourierName] = useState("");

  /* ✅ NEW: Tracking ID state */
  const [trackingId, setTrackingId] = useState("");

  const [error, setError] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      const initialQty =
        order.available_for_return && order.available_for_return > 0
          ? order.available_for_return
          : order.quantity || 1;

      setQuantity(initialQty);

      setReason("Product is no longer required");

      setDeclaresMarketable(false);
      setDeclaresUnsold(false);
      setDeclaresUnused(false);

      setReturnMethod("doorstep");
      setCourierName("");
      /* ✅ Reset tracking ID on open */
      setTrackingId("");

      setError("");
      setIsSuccess(false);
    }
  }, [isOpen, order?.line_id]);

  if (!isOpen || !order) {
    return null;
  }

  const atLeastOneDeclaration =
    declaresMarketable || declaresUnsold || declaresUnused;

  const handleSubmit = async () => {
    setError("");

    if (!canBuyback()) {
      setError(
        "The 30-day registration buyback window has expired or the order is not eligible.",
      );
      return;
    }

    if (!order.line_id) {
      setError("Order line ID is missing.");
      return;
    }

    if (!quantity || quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (quantity > maxQty) {
      setError(`Maximum buyback quantity is ${maxQty}.`);
      return;
    }

    if (reason.trim().length < 5) {
      setError("Please provide a valid reason (min 5 characters).");
      return;
    }

    if (!atLeastOneDeclaration) {
      setError("Please tick at least one declaration to proceed.");
      return;
    }

    /* ✅ Courier validation: BOTH courier name + tracking ID required */
    if (returnMethod === "courier" && !courierName.trim()) {
      setError("Please enter the courier name.");
      return;
    }

    if (returnMethod === "courier" && !trackingId.trim()) {
      setError("Please enter the tracking ID.");
      return;
    }

    // Recheck immediately before making the mutation.
    if (!canBuyback()) {
      setError("Buyback is no longer available for this order.");
      return;
    }

    try {
      const payload = {
        items: [
          {
            order_line_id: order.line_id,
            quantity,
            reason: reason.trim(),
          },
        ],
        return_reason: reason.trim(),
        declares_marketable: declaresMarketable,
        declares_unsold: declaresUnsold,
        declares_unused: declaresUnused,

        return_method: returnMethod,

        courier: returnMethod === "courier" ? courierName.trim() : undefined,

        /* ✅ NEW: tracking_id sent only for courier */
        tracking_id: returnMethod === "courier" ? trackingId.trim() : undefined,
      };

      const response = await initiateBuyback(payload).unwrap();

      dispatch(
        showToast({
          message:
            response?.message || "Buyback request submitted successfully!",
          type: "success",
        }),
      );

      await onSuccess?.();

      setIsSuccess(true);

      setTimeout(() => onClose(), 1800);
    } catch (err: any) {
      let errorMessage = "Failed to submit buyback request.";

      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.errors) {
        const msgs = Object.values(err.data.errors).flat();

        errorMessage = (msgs as string[]).join(" ");
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      dispatch(
        showToast({
          message: errorMessage,
          type: "error",
        }),
      );
    }
  };

  /* ✅ Submit enabled only when courier name + tracking ID both filled (courier mode) */
  const canSubmit =
    !isLoading &&
    canBuyback() &&
    quantity >= 1 &&
    quantity <= maxQty &&
    reason.trim().length >= 5 &&
    atLeastOneDeclaration &&
    (returnMethod !== "courier" ||
      (courierName.trim().length > 0 && trackingId.trim().length > 0));

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-lg">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-neutral-100">
            <RotateCcw className="h-4 w-4 text-neutral-900" />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
              Initiate Buy Back
            </h3>

            <p className="mt-0.5 text-[10px] text-[#888888] sm:text-[11px]">
              {order.order_reference}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        {isSuccess ? (
          <motion.div
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="flex min-h-[300px] flex-col items-center justify-center py-10"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#CFE0D4] bg-neutral-100">
              <Check className="h-10 w-10 text-[#3F765A]" />
            </div>

            <h4 className="mt-5 text-[20px] font-semibold text-[#171717]">
              Buyback Requested!
            </h4>

            <p className="mt-2 text-center text-[12px] leading-5 text-[#888888]">
              Your buyback request for {order.product_name} has been submitted.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                {order.primary_image ? (
                  <Image
                    src={order.primary_image}
                    alt={order.product_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-5 w-5 text-[#999999]" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-[#171717]">
                  {order.product_name}
                </p>

                <p className="mt-0.5 text-[10px] text-[#888888]">
                  Ordered: {order.quantity} • Max Buyback:{" "}
                  <span className="font-semibold text-neutral-900">
                    {maxQty}
                  </span>
                </p>

                {order.product_code && (
                  <p className="mt-0.5 text-[9px] text-[#AAAAAA]">
                    Code: {order.product_code}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Quantity to Buy Back <span className="text-[#B24C4C]">*</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))}
                  disabled={isLoading || quantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#D7D7D5] bg-white text-[#555555] transition hover:border-[#BDBDBA] disabled:opacity-40"
                >
                  −
                </button>

                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(e) => {
                    const v = Number(e.target.value);

                    if (!Number.isFinite(v)) {
                      return;
                    }

                    setQuantity(Math.min(maxQty, Math.max(1, v)));
                  }}
                  disabled={isLoading}
                  className="h-9 w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-center text-[13px] font-medium text-[#171717] outline-none focus:border-[#999999]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(maxQty, Number(q) + 1))
                  }
                  disabled={isLoading || quantity >= maxQty}
                  className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#D7D7D5] bg-white text-[#555555] transition hover:border-[#BDBDBA] disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <p className="mt-1 text-[10px] text-[#999999]">
                Maximum {maxQty} allowed
              </p>
            </div>

            {/* Return Method Selection */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Return Method <span className="text-[#B24C4C]">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Doorstep */}
                <button
                  type="button"
                  onClick={() => setReturnMethod("doorstep")}
                  disabled={isLoading}
                  className={`flex flex-col items-start gap-1.5 rounded-[8px] border-2 p-2.5 text-left transition-all ${
                    returnMethod === "doorstep"
                      ? "border-black bg-neutral-50"
                      : "border-[#E4E4E2] bg-white hover:border-[#D7D7D5]"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Home
                      className={`h-4 w-4 ${
                        returnMethod === "doorstep"
                          ? "text-black"
                          : "text-[#999999]"
                      }`}
                    />

                    <div
                      className={`h-3.5 w-3.5 rounded-full border-2 ${
                        returnMethod === "doorstep"
                          ? "border-black bg-black"
                          : "border-[#D7D7D5]"
                      }`}
                    >
                      {returnMethod === "doorstep" && (
                        <div className="m-auto mt-[2px] h-1 w-1 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  <div>
                    <p
                      className={`text-[11px] font-semibold ${
                        returnMethod === "doorstep"
                          ? "text-[#186149]"
                          : "text-[#171717]"
                      }`}
                    >
                      Doorstep
                    </p>

                    <p className="mt-0.5 text-[9.5px] leading-tight text-[#888888]">
                      Pickup from your address
                    </p>
                  </div>
                </button>

                {/* Courier */}
                <button
                  type="button"
                  onClick={() => setReturnMethod("courier")}
                  disabled={isLoading}
                  className={`flex flex-col items-start gap-1.5 rounded-[8px] border-2 p-2.5 text-left transition-all ${
                    returnMethod === "courier"
                      ? "border-black bg-neutral-50"
                      : "border-[#E4E4E2] bg-white hover:border-[#D7D7D5]"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Truck
                      className={`h-4 w-4 ${
                        returnMethod === "courier"
                          ? "text-black"
                          : "text-[#999999]"
                      }`}
                    />

                    <div
                      className={`h-3.5 w-3.5 rounded-full border-2 ${
                        returnMethod === "courier"
                          ? "border-black bg-black"
                          : "border-[#D7D7D5]"
                      }`}
                    >
                      {returnMethod === "courier" && (
                        <div className="m-auto mt-[2px] h-1 w-1 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  <div>
                    <p
                      className={`text-[11px] font-semibold ${
                        returnMethod === "courier"
                          ? "text-[#186149]"
                          : "text-[#171717]"
                      }`}
                    >
                      Courier
                    </p>

                    <p className="mt-0.5 text-[9.5px] leading-tight text-[#888888]">
                      Ship it yourself
                    </p>
                  </div>
                </button>
              </div>

              {/* ✅ Courier Name + Tracking ID (both fields shown for courier) */}
              {returnMethod === "courier" && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="mt-2.5 space-y-2.5"
                >
                  {/* Courier Name */}
                  <div>
                    <label
                      htmlFor="courierName"
                      className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#888888]"
                    >
                      Courier Name <span className="text-[#B24C4C]">*</span>
                    </label>

                    <input
                      id="courierName"
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. Delhivery, BlueDart, DTDC..."
                      disabled={isLoading}
                      className="h-[38px] w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-[12px] text-[#171717] outline-none placeholder:text-[#AAAAAA] disabled:opacity-60 focus:border-neutral-900"
                    />
                  </div>

                  {/* ✅ Tracking ID */}
                  <div>
                    <label
                      htmlFor="trackingId"
                      className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#888888]"
                    >
                      Tracking ID <span className="text-[#B24C4C]">*</span>
                    </label>

                    <input
                      id="trackingId"
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="e.g. 1234567890"
                      disabled={isLoading}
                      className="h-[38px] w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-[12px] text-[#171717] outline-none placeholder:text-[#AAAAAA] disabled:opacity-60 focus:border-neutral-900"
                    />
                  </div>
                </motion.div>
              )}

              {/* Shipping Charge Warning */}
              <div className="mt-2.5 flex items-start gap-2 rounded-[7px] border border-[#FDE68A] bg-[#FFFBEB] p-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B45309]" />

                <p className="text-[10px] leading-4 text-[#92400E]">
                  <span className="font-semibold">Doorstep return:</span> 2×
                  shipping charge deducted
                  <br />
                  <span className="font-semibold">Courier return:</span> 1×
                  shipping charge deducted
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Reason <span className="text-[#B24C4C]">*</span>
              </label>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you requesting this buyback?"
                maxLength={500}
                disabled={isLoading}
                className="min-h-[80px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 py-2.5 text-[12px] leading-5 text-[#171717] outline-none focus:border-[#999999]"
              />

              <p className="mt-1 text-right text-[9.5px] text-[#999999]">
                {reason.trim().length}/500
              </p>
            </div>

            {/* Declarations */}
            <div className="mb-2 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#666666]">
                  Declarations
                </p>

                <span
                  className={`text-[9.5px] font-medium ${
                    atLeastOneDeclaration ? "text-black" : "text-[#B24C4C]"
                  }`}
                >
                  {atLeastOneDeclaration ? "✓ ready" : "tick at least one"}
                </span>
              </div>

              <label className="mb-2.5 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={declaresMarketable}
                  onChange={(e) => setDeclaresMarketable(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-black"
                />

                <span className="text-[11.5px] leading-4 text-[#344054]">
                  I declare the product is{" "}
                  <span className="font-semibold">marketable</span> and in
                  sellable condition.
                </span>
              </label>

              <label className="mb-2.5 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={declaresUnsold}
                  onChange={(e) => setDeclaresUnsold(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-black"
                />

                <span className="text-[11.5px] leading-4 text-[#344054]">
                  I declare the product is{" "}
                  <span className="font-semibold">unsold</span>.
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={declaresUnused}
                  onChange={(e) => setDeclaresUnused(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-black"
                />

                <span className="text-[11.5px] leading-4 text-[#344054]">
                  I declare the product is{" "}
                  <span className="font-semibold">unused</span>.
                </span>
              </label>
            </div>

            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B24C4C]" />

                <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {!isSuccess && (
        <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5 sm:px-6">
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-[10px] border px-5 py-2.5 text-[12px] font-semibold transition-all duration-150 active:scale-[0.99] ${
                canSubmit
                  ? "border-black bg-black text-white shadow-sm hover:bg-neutral-800"
                  : "cursor-not-allowed border-[#D7D7D5] bg-[#F1F1F0] text-[#999999]"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Submit Buy Back
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};
