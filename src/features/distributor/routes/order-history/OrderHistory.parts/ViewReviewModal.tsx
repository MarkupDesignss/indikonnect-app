"use client";

import { X, Star, Package } from "lucide-react";
import Image from "next/image";
import { ModalShell, ViewReviewModalProps } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";


export const ViewReviewModal = ({ isOpen, onClose, order }: ViewReviewModalProps) => {
  if (!isOpen || !order) {
    return null;
  }

  const existingReview = order.product_reviews?.find(
    (review: any) =>
      review.order_line_id === order.line_id ||
      review.order_id === order.order_id ||
      review.product_id === order.product_id,
  );

  const rating = existingReview?.rating || 0;

  const reviewText =
    existingReview?.review_text ||
    existingReview?.review ||
    "No review text provided.";

  const reviewImages: string[] =
    existingReview?.image_urls ||
    existingReview?.images?.map?.((img: any) => img.image_url || img.url) ||
    [];

  const getRatingLabel = (value: number) =>
    ({
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent!",
    })[value] || "";

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-xl">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#F8F1E4]">
              <Star className="h-4 w-4 fill-[#B8935A] text-[#B8935A]" />
            </div>

            <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
              Your Review
            </h3>
          </div>

          <p className="mt-1 text-[10px] text-black sm:text-[11px]">
            Order: {order.order_reference}
            {order.line_id && (
              <span className="ml-1 text-[#AAAAAA]">
                • Item #{order.line_id}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
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

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-black">
            Rating
          </label>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 sm:h-9 sm:w-9 ${star <= rating
                  ? "fill-[#B8935A] text-[#B8935A]"
                  : "fill-[#F1F1F0] text-[#D7D7D5]"
                  }`}
              />
            ))}
          </div>

          <p className="mt-1 text-[11px] font-medium text-[#171717]">
            {rating > 0 ? getRatingLabel(rating) : "No rating"}
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-black">
            Your Review
          </label>

          <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
            <p className="whitespace-pre-wrap text-[12px] leading-5 text-[#171717]">
              {reviewText}
            </p>
          </div>
        </div>

        {reviewImages.length > 0 && (
          <div className="mb-2">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-black">
              Photos
            </label>

            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
              {reviewImages.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]"
                >
                  <img
                    src={url}
                    alt={`Review ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5 sm:px-6">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666]"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
