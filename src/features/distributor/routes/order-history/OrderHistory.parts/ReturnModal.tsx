"use client";

import { useObjectUrlRegistry } from "@/hooks/useObjectUrlRegistry";

import { X, RotateCcw, AlertCircle, Loader2, Truck, Clock, Camera, Home, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModalShell, OrderLinesPreview, ReturnMethod, ReturnModalProps, formatDate, isReturnWindowOpen, parseDate } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";
import { readCaughtMessage } from "@/lib/utils/readCaughtMessage";



export const ReturnModal = ({
  isOpen,
  onClose,
  lines,
  reference,
  onSubmit,
  isUploading,
}: ReturnModalProps) => {
  const { createObjectUrl, revokeObjectUrl } = useObjectUrlRegistry();
  const [reason, setReason] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [returnMethod, setReturnMethod] = useState<ReturnMethod>("doorstep");
  const [courierName, setCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setImages([]);
      setImagePreviews([]);
      setReturnMethod("doorstep");
      setCourierName("");
      setTrackingId("");
      setError("");
      setIsSubmitting(false);
    } else {
      imagePreviews.forEach((url) => revokeObjectUrl(url));

      setImagePreviews([]);
      setImages([]);
    }
  }, [isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setError("");

    if (!files.length) {
      return;
    }

    if (files.length + images.length > 5) {
      setError("You can upload maximum 5 images.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const oversized = files.filter((file) => file.size > 5 * 1024 * 1024);

    if (oversized.length > 0) {
      setError("Some files exceed the 5MB limit.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const invalid = files.filter((file) => !validTypes.includes(file.type));

    if (invalid.length > 0) {
      setError("Only JPG, PNG, GIF, and WEBP formats are allowed.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const newPreviews = files.map((file) => createObjectUrl(file));

    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const preview = imagePreviews[index];

    if (preview) {
      revokeObjectUrl(preview);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");

    if (!lines.length) {
      return setError("No returnable items in this order.");
    }

    if (reason.trim().length < 10) {
      return setError("Please provide a valid reason (min 10 characters).");
    }

    if (returnMethod === "courier" && !courierName.trim()) {
      return setError("Please enter the courier name.");
    }

    if (returnMethod === "courier" && !trackingId.trim()) {
      return setError("Please enter the tracking ID.");
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        reason: reason.trim(),
        images,
        return_method: returnMethod,
        courier: returnMethod === "courier" ? courierName.trim() : undefined,
        tracking_id: returnMethod === "courier" ? trackingId.trim() : undefined,
      });

      onClose();
    } catch (err: unknown) {
      setError(
        readCaughtMessage(err, "data", "message") ||
        readCaughtMessage(err, "message") ||
        "Failed to submit return request.",
      );

      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  // earliest closing return window among all products
  const till = lines
    .map((l) => l.timeline?.return_applicable_till)
    .filter((v): v is string => !!v)
    .sort(
      (a, b) =>
        (parseDate(a)?.getTime() ?? 0) - (parseDate(b)?.getTime() ?? 0),
    )[0];

  const windowOpen = !!till && isReturnWindowOpen(till);

  const reasonLength = reason.trim().length;

  const canSubmit =
    !isSubmitting &&
    !isUploading &&
    reasonLength >= 10 &&
    lines.length > 0 &&
    (returnMethod !== "courier" ||
      (courierName.trim().length > 0 && trackingId.trim().length > 0));

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FFF7ED]">
            <RotateCcw className="h-4 w-4 text-[#EA580C]" />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#171717]">
              Return Order
            </h3>

            <p className="mt-0.5 text-[9.5px] text-[#999999]">
              Order {reference} • {lines.length} item
              {lines.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting || isUploading}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3.5">
        <OrderLinesPreview lines={lines} />

        {till && (
          <div
            className={`mb-3 flex items-center gap-1.5 rounded-[6px] border px-3 py-2 text-[10px] font-medium ${windowOpen
              ? "border-[#CFE0D4] bg-[#F1F7F3] text-[#3F765A]"
              : "border-[#F0CFCF] bg-[#FDF2F2] text-[#B24C4C]"
              }`}
          >
            <Clock size={12} />

            <span>
              {windowOpen ? "Return window closes on" : "Return window closed on"}{" "}
              <span className="font-semibold">{formatDate(till)}</span>
            </span>
          </div>
        )}

        {/* RETURN METHOD SELECTION */}
        <div className="mb-3">
          <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-black">
            Return Method <span className="text-[#B24C4C]">*</span>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {/* DOORSTEP */}
            <button
              type="button"
              onClick={() => setReturnMethod("doorstep")}
              disabled={isSubmitting || isUploading}
              className={`flex flex-col items-start gap-1.5 rounded-[8px] border-2 p-2.5 text-left transition-all ${returnMethod === "doorstep"
                ? "border-[#EA580C] bg-[#FFF7ED]"
                : "border-[#E4E4E2] bg-white hover:border-[#D7D7D5]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div className="flex w-full items-center justify-between">
                <Home
                  className={`h-4 w-4 ${returnMethod === "doorstep"
                    ? "text-[#EA580C]"
                    : "text-[#999999]"
                    }`}
                />

                <div
                  className={`h-3.5 w-3.5 rounded-full border-2 ${returnMethod === "doorstep"
                    ? "border-[#EA580C] bg-[#EA580C]"
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
                  className={`text-[11px] font-semibold ${returnMethod === "doorstep"
                    ? "text-[#C2410C]"
                    : "text-[#171717]"
                    }`}
                >
                  Doorstep
                </p>

                <p className="mt-0.5 text-[9.5px] leading-tight text-black">
                  Pickup from your address
                </p>
              </div>
            </button>

            {/* COURIER */}
            <button
              type="button"
              onClick={() => setReturnMethod("courier")}
              disabled={isSubmitting || isUploading}
              className={`flex flex-col items-start gap-1.5 rounded-[8px] border-2 p-2.5 text-left transition-all ${returnMethod === "courier"
                ? "border-[#EA580C] bg-[#FFF7ED]"
                : "border-[#E4E4E2] bg-white hover:border-[#D7D7D5]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div className="flex w-full items-center justify-between">
                <Truck
                  className={`h-4 w-4 ${returnMethod === "courier"
                    ? "text-[#EA580C]"
                    : "text-[#999999]"
                    }`}
                />

                <div
                  className={`h-3.5 w-3.5 rounded-full border-2 ${returnMethod === "courier"
                    ? "border-[#EA580C] bg-[#EA580C]"
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
                  className={`text-[11px] font-semibold ${returnMethod === "courier"
                    ? "text-[#C2410C]"
                    : "text-[#171717]"
                    }`}
                >
                  Courier
                </p>

                <p className="mt-0.5 text-[9.5px] leading-tight text-black">
                  Ship it yourself
                </p>
              </div>
            </button>
          </div>

          {/* COURIER NAME + TRACKING ID (conditional) */}
          {returnMethod === "courier" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2.5 space-y-2.5"
            >
              <div>
                <label
                  htmlFor="courierName"
                  className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-black"
                >
                  Courier Name <span className="text-[#B24C4C]">*</span>
                </label>

                <input
                  id="courierName"
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Delhivery, BlueDart, DTDC..."
                  disabled={isSubmitting || isUploading}
                  className="h-[38px] w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-[12px] text-[#171717] outline-none placeholder:text-[#AAAAAA] disabled:opacity-60 focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label
                  htmlFor="trackingId"
                  className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-black"
                >
                  Tracking ID <span className="text-[#B24C4C]">*</span>
                </label>

                <input
                  id="trackingId"
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. 1234567890"
                  disabled={isSubmitting || isUploading}
                  className="h-[38px] w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-[12px] text-[#171717] outline-none placeholder:text-[#AAAAAA] disabled:opacity-60 focus:border-[#EA580C]"
                />
              </div>
            </motion.div>
          )}

          {/* SHIPPING CHARGE WARNING */}
          <div className="mt-2.5 flex items-start gap-2 rounded-[7px] border border-[#FDE68A] bg-[#FFFBEB] p-2.5">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B45309]" />

            <p className="text-[10px] leading-4 text-[#92400E]">
              <span className="font-semibold">Doorstep return:</span> 2×
              shipping charge deducted
              <br />
              <span className="font-semibold">Courier return:</span> 1× shipping
              charge deducted
            </p>
          </div>
        </div>

        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="block text-[10.5px] font-medium uppercase tracking-[0.08em] text-black">
              Reason for Return <span className="text-[#B24C4C]">*</span>
            </label>

            <span
              className={`shrink-0 text-[9px] font-medium ${reasonLength >= 10 ? "text-[#3F765A]" : "text-[#999999]"
                }`}
            >
              {reasonLength}/10 min
            </span>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please describe why you want to return this order..."
            maxLength={500}
            disabled={isSubmitting || isUploading}
            className="h-[82px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 py-2.5 text-[12px] leading-5 text-black outline-none placeholder:text-[#AAAAAA] disabled:opacity-60"
          />
        </div>

        <div className="mb-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-[10.5px] font-medium uppercase tracking-[0.08em] text-black">
              Attach Images{" "}
              <span className="text-[10px] font-normal normal-case text-[#999999]">
                (Optional)
              </span>
            </label>

            <span className="text-[9px] text-[#999999]">{images.length}/5</span>
          </div>

          {imagePreviews.length > 0 ? (
            <div className="grid grid-cols-5 gap-2">
              <AnimatePresence initial={false}>
                {imagePreviews.map((preview, index) => (
                  <motion.div
                    key={`${preview}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]">
                      <img
                        src={preview}
                        alt={`Return image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={isSubmitting || isUploading}
                        className="absolute right-1 top-1 rounded-[5px] bg-[#B24C4C] p-1 text-white opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {imagePreviews.length < 5 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[6px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9]">
                  <Camera className="h-5 w-5 text-[#777777]" />

                  <span className="mt-1 text-[9px] font-medium text-[#777777]">
                    Add
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isSubmitting || isUploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <label className="group flex cursor-pointer items-center gap-3 rounded-[7px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-[#FFF7ED]">
                <Camera className="h-5 w-5 text-[#EA580C]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-[#171717]">
                  Click to upload photos
                </p>

                <p className="mt-0.5 text-[9px] text-[#999999]">
                  JPG, PNG, or others • Max 5MB each • Up to 5 images
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageUpload}
                disabled={isSubmitting || isUploading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] px-3 py-2"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B24C4C]" />

            <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
          </motion.div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[11px] font-medium ${canSubmit
              ? "border-[#EA580C] bg-[#EA580C] text-white hover:bg-[#C2410C]"
              : "cursor-not-allowed border-[#D7D7D5] bg-[#F1F1F0] text-[#999999]"
              }`}
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                Submit Return
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
