"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Star,
  X,
  Plus,
  Camera,
  Trash2,
  Send,
  AlertCircle,
  Check,
  Package,
} from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any; // This is actually a line item now
  onSubmit: (reviewData: any) => Promise<void>;
}

const ReviewModal = ({
  isOpen,
  onClose,
  order,
  onSubmit,
}: ReviewModalProps) => {
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
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));

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

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    setError("");

    if (!files.length) return;

    if (files.length + images.length > 5) {
      setError("You can upload maximum 5 images.");
      return;
    }

    const oversizedFiles = files.filter(
      (file) => file.size > 5 * 1024 * 1024,
    );

    if (oversizedFiles.length > 0) {
      setError("Some files exceed the 5MB limit.");
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      setError("Only JPG, PNG, GIF, and WEBP formats are allowed.");
      return;
    }

    const newPreviews = files.map((file) =>
      URL.createObjectURL(file),
    );

    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const preview = imagePreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files || []);

    if (!files.length || !fileInputRef.current) return;

    const dt = new DataTransfer();

    files.forEach((file) => {
      dt.items.add(file);
    });

    fileInputRef.current.files = dt.files;

    fileInputRef.current.dispatchEvent(
      new Event("change", { bubbles: true }),
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    setError("");

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    if (reviewText.trim().length < 10) {
      setError("Review must be at least 10 characters.");
      return;
    }

    // Check for line item fields (individual product)
    if (!order?.line_id) {
      setError("Order line ID is missing.");
      return;
    }

    if (!order?.product_id) {
      setError("Product ID is missing.");
      return;
    }

    if (!order?.order_id) {
      setError("Order ID is missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        // Send both order_id and line_id for the API
        order_id: order.order_id,
        order_line_id: order.line_id, // This is the key field for individual line items
        product_id: order.product_id,
        rating,
        review_text: reviewText.trim(),
        review: reviewText.trim(),
        images,
        order_reference: order.order_reference,
        product_name: order.product_name,
      };

      await onSubmit(reviewData);

      setIsSuccess(true);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(
        err?.data?.message ||
          err?.message ||
          "Failed to submit review. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (value: number) => {
    const labels = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent!",
    };

    return labels[value as keyof typeof labels] || "";
  };

  const charCount = reviewText.length;
  const minChars = 10;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-3 backdrop-blur-[2px] sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.98,
            y: 12,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.98,
            y: 12,
          }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white font-sans shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
        >
          {/* HEADER */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] bg-white px-5 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#F7F7F6]">
                  <Star className="h-4 w-4 fill-[#111111] text-[#111111]" />
                </div>

                <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
                  Write a Review
                </h3>
              </div>

              <p className="mt-1 text-[10px] text-[#888888] sm:text-[11px]">
                Order:{" "}
                {order?.order_reference ||
                  `#${order?.order_id || "N/A"}`}
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
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* CONTENT */}
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

                <p className="mt-2 text-center text-[12px] leading-5 text-[#888888]">
                  Your review for {order?.product_name || "this product"} has been submitted successfully.
                  <br />
                  It will help other customers make better decisions.
                </p>
              </motion.div>
            ) : (
              <>
                {/* PRODUCT INFO - Shows individual line item */}
                {order && (
                  <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                      {order.primary_image ? (
                        <Image
                          src={order.primary_image}
                          alt={
                            order.product_name || "Product"
                          }
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
                        {order.product_name ||
                          "Unknown Product"}
                      </p>

                      {order.quantity && (
                        <p className="mt-0.5 text-[10px] text-[#888888]">
                          Qty: {order.quantity}
                        </p>
                      )}

                      {order.product_code && (
                        <p className="mt-0.5 text-[9px] text-[#AAAAAA]">
                          Product Code: {order.product_code}
                        </p>
                      )}

                      {order.line_id && (
                        <p className="mt-0.5 text-[9px] text-[#AAAAAA]">
                          Line ID: {order.line_id}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* RATING */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                    Rating{" "}
                    <span className="text-[#B24C4C]">*</span>
                  </label>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          disabled={isSubmitting}
                          onMouseEnter={() =>
                            setHoverRating(star)
                          }
                          onMouseLeave={() =>
                            setHoverRating(0)
                          }
                          onClick={() => setRating(star)}
                          whileTap={{ scale: 0.9 }}
                          className="rounded-[5px] p-1 transition-transform hover:scale-105 focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 sm:h-9 sm:w-9 ${
                              star <=
                              (hoverRating || rating)
                                ? "fill-[#171717] text-[#171717]"
                                : "fill-[#F1F1F0] text-[#D7D7D5]"
                            } transition-colors duration-150`}
                          />
                        </motion.button>
                      ))}
                    </div>

                    <p className="min-h-[18px] text-[11px] font-medium text-[#171717] sm:text-[12px]">
                      {rating > 0 ? (
                        <span className="text-[#171717]">
                          {getRatingLabel(rating)}
                        </span>
                      ) : (
                        <span className="text-[#999999]">
                          Select a rating
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* REVIEW TEXT */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                    Your Review{" "}
                    <span className="text-[#B24C4C]">*</span>
                  </label>

                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={reviewText}
                      onChange={(e) => {
                        setReviewText(e.target.value);

                        if (
                          error &&
                          e.target.value.trim().length >=
                            minChars
                        ) {
                          setError("");
                        }
                      }}
                      placeholder="Share your experience with this product..."
                      maxLength={500}
                      disabled={isSubmitting}
                      className={`min-h-[110px] w-full resize-none rounded-[7px] border bg-[#FAFAF9] px-3.5 py-3 pr-16 text-[12px] text-[#171717] outline-none transition-all placeholder:text-[#999999] focus:ring-1 ${
                        error &&
                        reviewText.length < minChars &&
                        reviewText.length > 0
                          ? "border-[#E9BABA] focus:border-[#B24C4C] focus:ring-[#B24C4C]/10"
                          : "border-[#D7D7D5] focus:border-[#999999] focus:ring-black/5"
                      }`}
                    />

                    <div className="absolute bottom-3 right-3 text-[10px] text-[#999999]">
                      {charCount}/500
                    </div>
                  </div>

                  {charCount > 0 && charCount < minChars && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-[#B24C4C]">
                      <AlertCircle className="h-3 w-3" />
                      Minimum {minChars} characters required (
                      {minChars - charCount} remaining)
                    </p>
                  )}

                  {charCount >= minChars && charCount < 20 && (
                    <p className="mt-1 text-[10px] text-[#3F765A]">
                      ✓ Good start! Add more details if you'd
                      like.
                    </p>
                  )}
                </div>

                {/* PHOTOS */}
                <div className="mb-2">
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                    Add Photos{" "}
                    <span className="text-[10px] font-normal normal-case tracking-normal text-[#999999]">
                      (Optional)
                    </span>
                  </label>

                  {/* IMAGE GRID */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-2.5 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                      <AnimatePresence>
                        {imagePreviews.map(
                          (preview, index) => (
                            <motion.div
                              key={`${preview}-${index}`}
                              initial={{
                                scale: 0.8,
                                opacity: 0,
                              }}
                              animate={{
                                scale: 1,
                                opacity: 1,
                              }}
                              exit={{
                                scale: 0.8,
                                opacity: 0,
                              }}
                              className="group relative"
                            >
                              <div className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]">
                                <img
                                  src={preview}
                                  alt={`Review image ${
                                    index + 1
                                  }`}
                                  className="h-full w-full object-cover"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeImage(index)
                                  }
                                  disabled={
                                    isSubmitting
                                  }
                                  className="absolute right-1 top-1 rounded-[5px] bg-[#B24C4C] p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </motion.div>
                          ),
                        )}
                      </AnimatePresence>

                      {imagePreviews.length < 5 && (
                        <label className="flex aspect-square cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] transition-colors hover:border-[#999999] hover:bg-[#F5F5F4]">
                          <div className="text-center">
                            <Plus className="mx-auto h-5 w-5 text-[#888888]" />
                            <span className="text-[10px] text-[#777777]">
                              Add
                            </span>
                          </div>

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
                  )}

                  {/* UPLOAD AREA */}
                  {imagePreviews.length === 0 && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <label className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[7px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] px-4 py-5 transition-colors hover:border-[#999999] hover:bg-[#F5F5F4]">
                        <Camera className="h-7 w-7 text-[#888888] transition-colors group-hover:text-[#171717]" />

                        <div className="text-center">
                          <p className="text-[11px] font-medium text-[#171717]">
                            Click or drag & drop to upload
                            photos
                          </p>

                          <p className="mt-1 text-[9px] text-[#999999]">
                            Max 5 images • 5MB each • JPG, PNG,
                            GIF, WEBP
                          </p>
                        </div>

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
                    </div>
                  )}
                </div>

                {/* ERROR */}
                {error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3"
                  >
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />

                    <p className="text-[10px] leading-4 text-[#B24C4C]">
                      {error}
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* FOOTER */}
          {!isSuccess && (
            <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5 sm:px-6">
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    rating === 0 ||
                    reviewText.trim().length < minChars
                  }
                  className={`flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[11px] font-medium transition ${
                    isSubmitting ||
                    rating === 0 ||
                    reviewText.trim().length < minChars
                      ? "cursor-not-allowed border-[#D7D7D5] bg-[#F1F1F0] text-[#999999]"
                      : "border-[#111111] bg-[#111111] text-white hover:bg-[#292929]"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#999999] border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;