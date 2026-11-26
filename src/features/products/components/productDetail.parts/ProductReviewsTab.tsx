"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ObjectUrlImage } from "@/components/ui/ObjectUrlImage";
import Link from "next/link";
import { Star, Send, Loader2, BadgeCheck } from "lucide-react";
import type { ProductDetailViewModel } from './useProductDetail';


export default function ProductReviewsTab({
  currentUserId,
  getLoginPath,
  canReview,
  hasUserReviewed,
  handleReviewSubmit,
  reviewName,
  setReviewName,
  reviewEmail,
  setReviewEmail,
  setReviewRating,
  reviewRating,
  reviewTitle,
  setReviewTitle,
  handleReviewImageUpload,
  reviewImages,
  removeReviewImage,
  isSubmittingReview,
  reviewsList,
  openReviewViewer,
  product,
  reviewsSummary,
}: Pick<ProductDetailViewModel, 
  "currentUserId"
  | "getLoginPath"
  | "canReview"
  | "hasUserReviewed"
  | "handleReviewSubmit"
  | "reviewName"
  | "setReviewName"
  | "reviewEmail"
  | "setReviewEmail"
  | "setReviewRating"
  | "reviewRating"
  | "reviewTitle"
  | "setReviewTitle"
  | "handleReviewImageUpload"
  | "reviewImages"
  | "removeReviewImage"
  | "isSubmittingReview"
  | "reviewsList"
  | "openReviewViewer"
  | "product"
  | "reviewsSummary"
>) {
  return (
<motion.div
                key="reviews"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                className="grid gap-7 pt-6 lg:grid-cols-[1fr_270px]"
              >
                <div>
                  {!currentUserId ? (
                    <div className="border-b border-[#E5E5E5] pb-5 text-[11px] text-[#777]">
                      <Link
                        href={getLoginPath()}
                        className="font-semibold text-[#111] underline"
                      >
                        Sign in
                      </Link>{" "}
                      to leave a review.
                    </div>
                  ) : canReview ? (
                    <div className="border-b border-[#E5E5E5] pb-6">
                      <h3 className="text-sm font-semibold">
                        {hasUserReviewed
                          ? "Write Another Review"
                          : "Add Review"}
                      </h3>

                      <form
                        onSubmit={handleReviewSubmit}
                        className="mt-4 grid gap-3 md:grid-cols-2"
                      >
                        <input
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="Name"
                          className="h-10 rounded-[6px] border border-[#D8D8D8] px-3 text-sm outline-none focus:border-[#111]"
                        />

                        <input
                          type="email"
                          value={reviewEmail}
                          onChange={(e) => setReviewEmail(e.target.value)}
                          placeholder="Email"
                          className="h-10 rounded-[6px] border border-[#D8D8D8] px-3 text-sm outline-none focus:border-[#111]"
                        />

                        <div className="flex items-center gap-1 md:col-span-2">
                          <span className="mr-2 text-xs text-[#777]">
                            Rating:
                          </span>

                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewRating(star)}
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  star <= reviewRating
                                    ? "fill-[#188447] text-[#188447]"
                                    : "text-[#D1D5DB]"
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          rows={4}
                          placeholder="Write your review..."
                          className="resize-none rounded-[6px] border border-[#D8D8D8] p-3 text-sm outline-none focus:border-[#111] md:col-span-2"
                          required
                        />

                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Add Photos
                          </label>

                          <label className="inline-flex cursor-pointer rounded-full border border-[#D8D8D8] px-4 py-2 text-[10px] font-semibold hover:border-[#111]">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleReviewImageUpload}
                              className="hidden"
                            />
                            Upload Images
                          </label>

                          <span className="ml-2 text-[10px] text-[#999]">
                            {reviewImages.length}/5
                          </span>

                          {reviewImages.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {reviewImages.map((file, index) => (
                                <div
                                  key={`${file.name}-${index}`}
                                  className="relative h-14 w-14 overflow-hidden rounded-[6px] border"
                                >
                                  <ObjectUrlImage
                                    file={file}
                                    alt="review"
                                    fill
                                    className="object-cover"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => removeReviewImage(index)}
                                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="inline-flex h-10 w-fit items-center gap-1.5 rounded-full bg-[#111] px-5 text-[11px] font-semibold text-white disabled:opacity-50"
                        >
                          {isSubmittingReview ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" />
                              Submit Review
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  ) : null}

                  {/* ALL REVIEWS */}
                  <div className="pt-6">
                    <h3 className="text-sm font-semibold">All Reviews</h3>

                    {reviewsList.length === 0 ? (
                      <p className="mt-4 text-xs text-[#999]">
                        No reviews yet.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-5">
                        {reviewsList.map((review: any) => {
                          const reviewImageUrls = Array.isArray(review.images)
                            ? review.images
                                .map((img: any) => img?.image_url)
                                .filter(Boolean)
                            : [];

                          const visibleReviewImages = reviewImageUrls.slice(
                            0,
                            5,
                          );

                          const extraReviewImageCount = Math.max(
                            reviewImageUrls.length - 5,
                            0,
                          );

                          return (
                            <div
                              key={review.id}
                              className="flex gap-3 border-b border-[#F0F0F0] pb-4"
                            >
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEE] text-[10px] font-bold">
                                {review.user?.profile_picture ? (
                                  <Image
                                    src={review.user.profile_picture}
                                    alt=""
                                    width={32}
                                    height={32}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  "U"
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-semibold">
                                    {review.user?.full_name}
                                  </span>

                                  {review.is_verified_purchase && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-[#E8F5EE] px-1.5 py-0.5 text-[8px] font-medium text-[#3E8E5A]">
                                      <BadgeCheck className="h-3 w-3" />
                                      Verified
                                    </span>
                                  )}
                                </div>

                                {/* REVIEW STARS - GREEN */}
                                {Number(review.rating) > 0 && (
                                  <div className="mt-1 flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                      <Star
                                        key={n}
                                        className={`h-3 w-3 ${
                                          n <= Number(review.rating)
                                            ? "fill-[#188447] text-[#188447]"
                                            : "text-[#D1D5DB]"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}

                                <p className="mt-1 text-xs leading-relaxed text-[#333]">
                                  {review.review_text}
                                </p>

                                {visibleReviewImages.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {visibleReviewImages.map((img, index) => (
                                      <button
                                        key={`${img}-${index}`}
                                        type="button"
                                        onClick={() =>
                                          openReviewViewer(
                                            reviewImageUrls,
                                            index,
                                          )
                                        }
                                        className="group relative h-16 w-16 overflow-hidden rounded-[6px] border border-[#DDD] bg-[#F5F5F5]"
                                      >
                                        <Image
                                          src={img}
                                          alt=""
                                          fill
                                          className="object-cover transition duration-300 group-hover:scale-105"
                                          sizes="64px"
                                        />

                                        <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                                      </button>
                                    ))}

                                    {extraReviewImageCount > 0 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openReviewViewer(reviewImageUrls, 5)
                                        }
                                        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-[6px] border border-[#DDD] bg-[#111] text-white transition hover:bg-[#222]"
                                      >
                                        <div className="text-center">
                                          <div className="text-[15px] font-bold leading-none">
                                            +{extraReviewImageCount}
                                          </div>

                                          <div className="mt-1 text-[8px] font-semibold uppercase tracking-wide">
                                            View All
                                          </div>
                                        </div>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* REVIEW SUMMARY */}
                {product.rating > 0 ? (
                  <aside className="h-fit rounded-[10px] border border-[#E5E5E5] p-5 text-center">
                    <div className="text-3xl font-semibold">
                      {product.rating.toFixed(1)}
                    </div>

                    <div className="mt-1 text-xs text-[#777]">out of 5</div>

                    <div className="mt-2 flex justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-4 w-4 ${
                            n <= Math.round(product.rating)
                              ? "fill-[#188447] text-[#188447]"
                              : "text-[#D1D5DB]"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="mt-2 text-xs text-[#777]">
                      {product.reviews}{" "}
                      {product.reviews === 1 ? "review" : "reviews"}
                    </p>

                    {reviewsSummary?.rating_distribution && (
                      <div className="mt-4 space-y-1.5 text-left">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = Number(
                            reviewsSummary.rating_distribution?.[star] || 0,
                          );

                          const pct =
                            product.reviews > 0
                              ? Math.round((count / product.reviews) * 100)
                              : 0;

                          return (
                            <div
                              key={star}
                              className="flex items-center gap-2 text-[9px] text-[#777]"
                            >
                              <span className="w-5">{star}★</span>

                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EDEDED]">
                                <div
                                  className="h-full rounded-full bg-[#188447]"
                                  style={{
                                    width: `${pct}%`,
                                  }}
                                />
                              </div>

                              <span className="w-5 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </aside>
                ) : (
                  <aside className="h-fit rounded-[10px] border border-[#E5E5E5] p-5 text-center">
                    <p className="text-xs text-[#777]">No ratings yet</p>

                    <p className="mt-1 text-[10px] text-[#999]">
                      Be the first to review this product
                    </p>
                  </aside>
                )}
              </motion.div>
  );
}
