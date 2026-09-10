
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

import { useGetTestimonialsQuery } from "@/lib/redux/api/testimonialApi";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface TextTestimonial {
  id: number;
  name: string;
  date: string;
  rating: number;
  message: string;
}

/* ------------------------------------------------------------------ */
/* Review Card                                                        */
/* ------------------------------------------------------------------ */

interface ReviewCardProps {
  review: TextTestimonial;
  index: number;
}

function ReviewCard({ review, index }: ReviewCardProps) {
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const checkOverflow = () => {
    const element = messageRef.current;

    if (!element) return;

    const computedStyle = window.getComputedStyle(element);
    const lineHeight = parseFloat(computedStyle.lineHeight);

    if (!lineHeight || Number.isNaN(lineHeight)) {
      setHasMore(false);
      return;
    }

    const maxHeight = lineHeight * 5;

    // Save current styles
    const previousDisplay = element.style.display;
    const previousWebkitLineClamp =
      element.style.webkitLineClamp;
    const previousOverflow = element.style.overflow;
    const previousHeight = element.style.height;

    // Temporarily remove clamp to check actual height
    element.style.display = "block";
    element.style.webkitLineClamp = "unset";
    element.style.overflow = "visible";
    element.style.height = "auto";

    const fullHeight = element.scrollHeight;

    // Restore styles
    element.style.display = previousDisplay;
    element.style.webkitLineClamp =
      previousWebkitLineClamp;
    element.style.overflow = previousOverflow;
    element.style.height = previousHeight;

    setHasMore(fullHeight > maxHeight + 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkOverflow();
    }, 0);

    const handleResize = () => {
      checkOverflow();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [review.message]);

  return (
    <div
      key={`${review.id}-${index}`}
      className="relative min-h-[320px] bg-[#fffdfa] px-6 pb-6 pt-8 shadow-[0_5px_25px_rgba(0,0,0,0.04)] md:min-h-[340px] md:px-9 md:pt-9"
    >
      {/* ------------------------------------------------------------ */}
      {/* Decorative Bars                                               */}
      {/* ------------------------------------------------------------ */}

      <div className="absolute left-0 top-0 flex gap-[6px]">
        <span className="block h-10 w-3 -skew-x-[24deg] bg-[#E0A13A] md:h-[46px] md:w-[13px]" />
        <span className="block h-10 w-3 -skew-x-[24deg] bg-[#E0A13A] md:h-[46px] md:w-[13px]" />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Rating                                                        */}
      {/* ------------------------------------------------------------ */}

      <div className="mb-3 flex items-center justify-end gap-1.5">
        <Star className="h-4 w-4 fill-[#248328] text-[#248328]" />

        <span className="text-[14px] text-[#222]">
          {review.rating} /10
        </span>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Name / Date                                                   */}
      {/* ------------------------------------------------------------ */}

      <div className="mb-4 flex items-center justify-between border-b border-[#d5d5d5] pb-3">
        <span className="text-[16px] font-semibold text-[#222]">
          {review.name}
        </span>

        <span className="text-[13px] text-[#777]">
          {review.date}
        </span>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Message                                                       */}
      {/* ------------------------------------------------------------ */}

      <div>
        <p
          ref={messageRef}
          className={`text-[15px] leading-[1.7] text-[#333] md:text-[15.5px] ${
            !isExpanded ? "line-clamp-5" : ""
          }`}
        >
          {review.message}
        </p>

        {/* See More only if text exceeds 5 lines */}
        {hasMore && (
          <button
            type="button"
            onClick={() =>
              setIsExpanded((prev) => !prev)
            }
            className="mt-2 text-[13px] font-semibold text-[#222] underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            {isExpanded ? "See less" : "See more"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Carousel                                                      */
/* ------------------------------------------------------------------ */

export default function ReviewCarousel() {
  const [index, setIndex] = useState(0);

  const { data, isLoading, isError } =
    useGetTestimonialsQuery();

  /* ---------------------------------------------------------------- */
  /* API Data                                                         */
  /* ---------------------------------------------------------------- */

  const reviews: TextTestimonial[] =
    data?.data?.data
      ?.filter((item) => item.is_active)
      ?.sort(
        (a, b) =>
          a.display_order - b.display_order
      )
      ?.map((item) => ({
        id: item.id,
        name: item.person_name,
        date: new Date(item.created_at).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),
        rating: Number(item.rating),
        message: item.text,
      })) ?? [];

  /* ---------------------------------------------------------------- */
  /* Reset index when API data changes                                */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    setIndex(0);
  }, [reviews.length]);

  /* ---------------------------------------------------------------- */
  /* Pagination                                                       */
  /* ---------------------------------------------------------------- */

  const perPage = 2;

  const pageCount =
    reviews.length > 0
      ? Math.ceil(reviews.length / perPage)
      : 0;

  const go = (direction: "prev" | "next") => {
    if (pageCount <= 1) return;

    setIndex((prev) => {
      if (direction === "next") {
        return (prev + 1) % pageCount;
      }

      return (
        (prev - 1 + pageCount) % pageCount
      );
    });
  };

  const visible = reviews.slice(
    index * perPage,
    index * perPage + perPage
  );

  const padded =
    visible.length < perPage
      ? [
          ...visible,
          ...reviews.slice(
            0,
            perPage - visible.length
          ),
        ]
      : visible;

  /* ---------------------------------------------------------------- */
  /* Loading                                                          */
  /* ---------------------------------------------------------------- */

  if (isLoading) {
    return (
      <section className="relative w-full bg-[#FBF7F1] px-4 py-12 font-serif md:px-10 md:py-16">
        <div className="mx-auto max-w-[1170px]">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-[26px] font-medium uppercase tracking-[0.01em] text-[#222] md:text-[34px]">
              Testimonials
            </h2>
          </div>

          <div className="flex min-h-[320px] items-center justify-center">
            <p className="text-[14px] text-[#777]">
              Loading testimonials...
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Error                                                            */
  /* ---------------------------------------------------------------- */

  if (isError) {
    return (
      <section className="relative w-full bg-[#FBF7F1] px-4 py-12 font-serif md:px-10 md:py-16">
        <div className="mx-auto max-w-[1170px]">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-[26px] font-medium uppercase tracking-[0.01em] text-[#222] md:text-[34px]">
              Testimonials
            </h2>
          </div>

          <div className="flex min-h-[320px] items-center justify-center">
            <p className="text-[14px] text-red-500">
              Failed to load testimonials.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Empty                                                            */
  /* ---------------------------------------------------------------- */

  if (reviews.length === 0) {
    return (
      <section className="relative w-full bg-[#FBF7F1] px-4 py-12 font-serif md:px-10 md:py-16">
        <div className="mx-auto max-w-[1170px]">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-[26px] font-medium uppercase tracking-[0.01em] text-[#222] md:text-[34px]">
              Testimonials
            </h2>
          </div>

          <div className="flex min-h-[320px] items-center justify-center">
            <p className="text-[14px] text-[#777]">
              No testimonials available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Main UI                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <section className="relative w-full bg-[#FBF7F1] px-4 py-12 font-serif md:px-10 md:py-16">
      <div className="mx-auto max-w-[1170px]">
  
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[26px] font-medium uppercase tracking-[0.01em] text-[#222] md:text-[34px]">
            Testimonials
          </h2>
        </div>
        <div className="relative">
          {/* Previous */}
          {pageCount > 1 && (
            <button
              type="button"
              onClick={() => go("prev")}
              aria-label="Previous testimonials"
              className="absolute -left-3 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#eee] bg-white shadow-lg hover:bg-gray-50 md:flex"
            >
              <ChevronLeft className="h-4 w-4 text-[#222]" />
            </button>
          )}

          {/* Next */}
          {pageCount > 1 && (
            <button
              type="button"
              onClick={() => go("next")}
              aria-label="Next testimonials"
              className="absolute -right-3 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#eee] bg-white shadow-lg hover:bg-gray-50 md:flex"
            >
              <ChevronRight className="h-4 w-4 text-[#222]" />
            </button>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {padded.map((review, i) => (
              <ReviewCard
                key={`${review.id}-${i}`}
                review={review}
                index={i}
              />
            ))}
          </div>

          {/* -------------------------------------------------------- */}
          {/* Dots                                                       */}
          {/* -------------------------------------------------------- */}

          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({
                length: pageCount,
              }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to review ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-8 bg-black"
                      : "w-1.5 bg-[#bfc2c5]"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
