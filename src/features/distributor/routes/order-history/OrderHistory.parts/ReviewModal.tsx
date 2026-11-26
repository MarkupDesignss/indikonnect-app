"use client";

import { useObjectUrlRegistry } from "@/hooks/useObjectUrlRegistry";

import { X, Star, Package, AlertCircle, Check, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ModalShell, ReviewModalProps } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";


export const ReviewModal = ({
  isOpen,
  onClose,
  order,
  onSubmit,
  isLoading,
}: ReviewModalProps) => {
  const { createObjectUrl, revokeObjectUrl } = useObjectUrlRegistry();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) {
      imagePreviews.forEach((url) => revokeObjectUrl(url));

      setRating(0);
      setHoverRating(0);
      setReviewText("");
      setImages([]);
      setImagePreviews([]);
      setError("");
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);

      return () => clearTimeout(timer);
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
      return;
    }

    const oversized = files.filter((file) => file.size > 5 * 1024 * 1024);

    if (oversized.length > 0) {
      setError("Some files exceed the 5MB limit.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const invalid = files.filter((file) => !validTypes.includes(file.type));

    if (invalid.length > 0) {
      setError("Only JPG, PNG, GIF, and WEBP formats are allowed.");
      return;
    }

    const previews = files.map((file) => createObjectUrl(file));

    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...previews]);

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

    if (rating === 0) {
      return setError("Please select a rating.");
    }

    if (reviewText.trim().length < 10) {
      return setError("Review must be at least 10 characters.");
    }

    if (!order?.line_id) {
      return setError("Order line ID is missing.");
    }

    if (!order?.product_id) {
      return setError("Product ID is missing.");
    }

    if (!order?.order_id) {
      return setError("Order ID is missing.");
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        order_id: order.order_id,
        order_line_id: order.line_id,
        product_id: order.product_id,
        rating,
        review_text: reviewText.trim(),
        review: reviewText.trim(),
        images,
        order_reference: order.order_reference,
        product_name: order.product_name,
      });

      setIsSuccess(true);

      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || "Failed to submit review.",
      );

      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (value: number) =>
    ({
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent!",
    })[value] || "";

  if (!isOpen) {
    return null;
  }

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-xl">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#F7F7F6]">
              <Star className="h-4 w-4 fill-[#111111] text-[#111111]" />
            </div>

            <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
              Write a Review
            </h3>
          </div>

          <p className="mt-1 text-[10px] text-black sm:text-[11px]">
            Order: {order?.order_reference || `#${order?.order_id}`}
            {order?.line_id && (
              <span className="ml-1 text-[#AAAAAA]">
                • Item #{order.line_id}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex min-h-[360px] flex-col items-center justify-center py-10"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#CFE0D4] bg-[#F1F7F3]">
              <Check className="h-10 w-10 text-[#3F765A]" />
            </div>

            <h4 className="mt-5 text-[22px] font-semibold text-[#171717]">
              Thank You!
            </h4>

            <p className="mt-2 text-center text-[12px] leading-5 text-black">
              Your review for {order?.product_name} has been submitted
              successfully.
            </p>
          </motion.div>
        ) : (
          <>
            {order && (
              <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
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

                  <p className="mt-0.5 text-[10px] text-black">
                    Qty: {order.quantity}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-black">
                Rating <span className="text-[#B24C4C]">*</span>
              </label>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    disabled={isSubmitting}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-[5px] p-1"
                  >
                    <Star
                      className={`h-8 w-8 sm:h-9 sm:w-9 ${star <= (hoverRating || rating)
                        ? "fill-[#171717] text-[#171717]"
                        : "fill-[#F1F1F0] text-[#D7D7D5]"
                        }`}
                    />
                  </motion.button>
                ))}
              </div>

              <p className="mt-1 text-[11px] font-medium text-[#171717]">
                {rating > 0 ? (
                  getRatingLabel(rating)
                ) : (
                  <span className="text-[#999999]">Select a rating</span>
                )}
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-black">
                Your Review <span className="text-[#B24C4C]">*</span>
              </label>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  maxLength={500}
                  disabled={isSubmitting}
                  className="min-h-[110px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-3 pr-16 text-[12px] text-[#171717] outline-none placeholder:text-[#999999] focus:border-[#999999]"
                />

                <div className="absolute bottom-3 right-3 text-[10px] text-[#999999]">
                  {reviewText.length}/500
                </div>
              </div>
            </div>

            <div className="mb-2">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-black">
                Add Photos{" "}
                <span className="text-[10px] font-normal normal-case text-[#999999]">
                  (Optional)
                </span>
              </label>

              {imagePreviews.length > 0 ? (
                <div className="mb-2.5 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                  <AnimatePresence>
                    {imagePreviews.map((preview, index) => (
                      <motion.div
                        key={`${preview}-${index}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="group relative"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]">
                          <img
                            src={preview}
                            alt={`Review ${index + 1}`}
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={isSubmitting}
                            className="absolute right-1 top-1 rounded-[5px] bg-[#B24C4C] p-1.5 text-white opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {imagePreviews.length < 5 && (
                    <label className="flex aspect-square cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9]">
                      <span className="text-[18px] text-black">+</span>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        multiple
                        onChange={handleImageUpload}
                        disabled={isSubmitting}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ) : (
                <label className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[7px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] px-4 py-5">
                  <span className="text-[24px] text-black">📷</span>

                  <p className="text-[11px] font-medium text-[#171717]">
                    Click to upload photos
                  </p>

                  <p className="text-[9px] text-[#999999]">
                    Max 5 images • 5MB each
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />

                <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
              </div>
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
              disabled={isSubmitting || isLoading}
              className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                isLoading ||
                rating === 0 ||
                reviewText.trim().length < 10
              }
              className={`flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[11px] font-medium ${isSubmitting ||
                isLoading ||
                rating === 0 ||
                reviewText.trim().length < 10
                ? "cursor-not-allowed border-[#D7D7D5] bg-[#F1F1F0] text-[#999999]"
                : "border-[#111111] bg-[#111111] text-white hover:bg-[#292929]"
                }`}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};
