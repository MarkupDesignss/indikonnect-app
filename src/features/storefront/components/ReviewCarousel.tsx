"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import { useGetTestimonialsQuery } from "@/lib/redux/api/testimonialApi";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

const TESTIMONIAL_SYNC_EVENT = "indiekonnect:testimonial-sync";
type TestimonialSyncSource = "video" | "text";

function notifyTestimonialChange(id: number, source: TestimonialSyncSource) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(TESTIMONIAL_SYNC_EVENT, { detail: { id, source } })
  );
}

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

    const previousDisplay = element.style.display;
    const previousWebkitLineClamp = element.style.webkitLineClamp;
    const previousOverflow = element.style.overflow;
    const previousHeight = element.style.height;

    element.style.display = "block";
    element.style.webkitLineClamp = "unset";
    element.style.overflow = "visible";
    element.style.height = "auto";

    const fullHeight = element.scrollHeight;

    element.style.display = previousDisplay;
    element.style.webkitLineClamp = previousWebkitLineClamp;
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
      className="relative h-full min-h-[320px] bg-[#fffdfa] px-6 pb-6 pt-8 shadow-[0_5px_25px_rgba(0,0,0,0.04)] md:min-h-[340px] md:px-9 md:pt-9"
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

        <span className="text-[14px] text-[#222]">{review.rating} /10</span>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Name / Date                                                   */}
      {/* ------------------------------------------------------------ */}

      <div className="mb-4 flex items-center justify-between border-b border-[#d5d5d5] pb-3">
        <span className="text-[16px] font-semibold text-[#222]">
          {review.name}
        </span>

        <span className="text-[13px] text-[#777]">{review.date}</span>
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

        {hasMore && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
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

  /* ---------------------------------------------------------------- */
  /* Mobile Carousel State                                            */
  /* ---------------------------------------------------------------- */

  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  const mobileScrollRef = useRef<HTMLDivElement | null>(null);

  const mobileScrollRaf = useRef<number | null>(null);

  const { data, isLoading, isError } = useGetTestimonialsQuery();

  /* ---------------------------------------------------------------- */
  /* API Data                                                         */
  /* ---------------------------------------------------------------- */

  const reviews: TextTestimonial[] = useMemo(
    () =>
      data?.data?.data
        ?.filter((item) => item.is_active)
        ?.sort((a, b) => a.display_order - b.display_order)
        ?.map((item) => ({
          id: item.id,
          name: item.person_name,
          date: new Date(item.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          rating: Number(item.rating),
          message: item.text,
        })) ?? [],
    [data]
  );

  /* ---------------------------------------------------------------- */
  /* Reset index when API data changes                                */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    setIndex(0);
    setMobileActiveIndex(0);

    mobileScrollRef.current?.scrollTo({ left: 0 });
  }, [reviews.length]);

  /* ---------------------------------------------------------------- */
  /* Desktop Pagination                                               */
  /* ---------------------------------------------------------------- */

  const scrollToMobileIndex = useCallback(
    (target: number, behavior: ScrollBehavior = "smooth") => {
      const el = mobileScrollRef.current;
      if (!el) return;
      const child = el.children[target] as HTMLElement | undefined;
      if (!child) return;

      el.scrollTo({
        left: child.offsetLeft - el.offsetLeft,
        behavior,
      });
    },
    []
  );

  // One review per slide ensures the text always belongs to the active video.
  const pageCount = reviews.length;

  const go = (direction: "prev" | "next") => {
    if (pageCount <= 1) return;

    const nextIndex =
      direction === "next"
        ? (index + 1) % pageCount
        : (index - 1 + pageCount) % pageCount;

    setIndex(nextIndex);
    setMobileActiveIndex(nextIndex);
    scrollToMobileIndex(nextIndex, "auto");
    notifyTestimonialChange(reviews[nextIndex].id, "text");
  };

  const visible = reviews.slice(index, index + 1);

  /* ---------------------------------------------------------------- */
  /* Mobile Scroll Handlers                                           */
  /* ---------------------------------------------------------------- */

  const handleMobileScroll = () => {
    if (mobileScrollRaf.current !== null) return;

    mobileScrollRaf.current = window.requestAnimationFrame(() => {
      mobileScrollRaf.current = null;
      const el = mobileScrollRef.current;
      if (!el || reviews.length === 0) return;

      const firstChild = el.firstElementChild as HTMLElement | null;
      const childWidth = firstChild?.clientWidth || 1;
      const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
      const nextIndex = Math.max(
        0,
        Math.min(
          reviews.length - 1,
          Math.round(el.scrollLeft / (childWidth + gap))
        )
      );

      if (nextIndex !== mobileActiveIndex) {
        setMobileActiveIndex(nextIndex);
        setIndex(nextIndex);
        notifyTestimonialChange(reviews[nextIndex].id, "text");
      }
    });
  };

  // Receive the active video ID and show the corresponding written review.
  useEffect(() => {
    const handleVideoChange = (event: Event) => {
      const detail = (event as CustomEvent<{
        id: number;
        source: TestimonialSyncSource;
      }>).detail;

      if (!detail || detail.source !== "video") return;

      const targetIndex = reviews.findIndex((review) => review.id === detail.id);
      if (targetIndex < 0) return;

      setIndex(targetIndex);
      setMobileActiveIndex(targetIndex);
      scrollToMobileIndex(targetIndex, "auto");
    };

    window.addEventListener(TESTIMONIAL_SYNC_EVENT, handleVideoChange);
    return () =>
      window.removeEventListener(TESTIMONIAL_SYNC_EVENT, handleVideoChange);
  }, [reviews, scrollToMobileIndex]);

  useEffect(() => {
    return () => {
      if (mobileScrollRaf.current !== null) {
        window.cancelAnimationFrame(mobileScrollRaf.current);
      }
    };
  }, []);

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
            <p className="text-[14px] text-[#777]">Loading testimonials...</p>
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

        {/* ============================================================ */}
        {/* MOBILE CAROUSEL (dots ke saath)                             */}
        {/* ============================================================ */}

        <div className="relative md:hidden">
          <div
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
            className="
              -mx-4 flex w-[calc(100%+2rem)] gap-3 overflow-x-auto
              snap-x snap-mandatory scroll-smooth px-4
              [-ms-overflow-style:none] [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {reviews.map((review, i) => (
              <div
                key={`${review.id}-${i}`}
                className="w-full shrink-0 snap-center"
              >
                <ReviewCard review={review} index={i} />
              </div>
            ))}
          </div>

          {/* Dots */}

          {reviews.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    scrollToMobileIndex(i);
                    setIndex(i);
                    setMobileActiveIndex(i);
                    scrollToMobileIndex(i, "auto");
                    notifyTestimonialChange(reviews[i].id, "text");
                  }}
                  aria-label={`Go to review ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    mobileActiveIndex === i
                      ? "w-8 bg-black"
                      : "w-1.5 bg-[#bfc2c5]"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* DESKTOP GRID CAROUSEL                                        */}
        {/* ============================================================ */}

        <div className="relative hidden md:block">
          {/* Previous */}
          {pageCount > 1 && (
            <button
              type="button"
              onClick={() => go("prev")}
              aria-label="Previous testimonials"
              className="absolute -left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#eee] bg-white shadow-lg hover:bg-gray-50"
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
              className="absolute -right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#eee] bg-white shadow-lg hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4 text-[#222]" />
            </button>
          )}

          {/* Grid */}
          <div className="mx-auto grid max-w-[760px] grid-cols-1 gap-5">
            {visible.map((review, i) => (
              <ReviewCard
                key={`${review.id}-${index}`}
                review={review}
                index={index + i}
              />
            ))}
          </div>

          {/* Dots */}

          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setMobileActiveIndex(i);
                    notifyTestimonialChange(reviews[i].id, "text");
                  }}
                  aria-label={`Go to review ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-black" : "w-1.5 bg-[#bfc2c5]"
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
