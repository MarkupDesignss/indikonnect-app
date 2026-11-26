"use client";

import { Star } from "lucide-react";
import { formatDate, getInitials } from "@/features/orders/screens/order.parts/support";


/* ============================================================
   REVIEW DISPLAY
============================================================ */

export function ReviewDisplay({ reviews }: { reviews: any[] }) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-[10px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                <span className="text-[11px] font-semibold">
                  {getInitials(review.user_name || "User")}
                </span>
              </div>

              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-[#171717]">
                  {review.user_name || "Anonymous User"}
                </p>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating
                            ? "fill-[#171717] text-[#171717]"
                            : "fill-[#E4E4E2] text-[#E4E4E2]"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[9px] text-[#888888]">
                    • {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {review.is_verified && (
              <span className="shrink-0 rounded-full bg-[#F1F7F3] px-2 py-0.5 text-[8px] font-medium text-[#3F765A]">
                Verified
              </span>
            )}
          </div>

          {review.title && (
            <p className="mt-2 text-[12px] font-medium text-[#171717]">
              {review.title}
            </p>
          )}

          {review.review_text && (
            <p className="mt-0.5 text-[11px] leading-5 text-[#555555]">
              {review.review_text}
            </p>
          )}

          {review.images && review.images.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {review.images.map((img: any, idx: number) => (
                <div
                  key={idx}
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[5px] border border-[#E4E4E2] bg-white"
                >
                  <img
                    src={img.image_url || img.image_path}
                    alt={`Review image ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
