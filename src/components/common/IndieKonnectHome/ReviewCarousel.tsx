"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MessageCircle,
} from "lucide-react";

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
/* Text Reviews                                                       */
/* ------------------------------------------------------------------ */

const REVIEWS: TextTestimonial[] = [
  {
    id: 1,
    name: "Meenakshi",
    date: "30 Oct, 2025",
    rating: 10,
    message:
      "I had a very good experience with Titans service. The staff was polite, helpful, and professional. They handled my concern quickly and made sure I was satisfied with the result. Really appreciate the quality service and customer support. Keep up the good work!",
  },
  {
    id: 2,
    name: "Amit",
    date: "24 Oct, 2025",
    rating: 10,
    message:
      "I had a great experience at the watch service centre. The staff was polite, knowledgeable, and very helpful. They quickly checked my watch and provided excellent service. The repair was done perfectly and on time. I'm really satisfied with their professionalism and quality of work. Highly recommended!",
  },
  {
    id: 3,
    name: "Rohan",
    date: "18 Oct, 2025",
    rating: 9,
    message:
      "Smooth process from start to finish. The team kept me updated at every step and delivered exactly what was promised. Will definitely be coming back for future needs.",
  },
];

/* ------------------------------------------------------------------ */
/* Written Testimonials                                               */
/* ------------------------------------------------------------------ */

export default function ReviewCarousel() {
  const [index, setIndex] = useState(0);
  const perPage = 2;
  const pageCount = Math.ceil(REVIEWS.length / perPage);

  const go = (direction: "prev" | "next") => {
    setIndex((prev) => {
      if (direction === "next") {
        return (prev + 1) % pageCount;
      }
      return (prev - 1 + pageCount) % pageCount;
    });
  };

  const visible = REVIEWS.slice(index * perPage, index * perPage + perPage);
  const padded = visible.length < perPage
    ? [...visible, ...REVIEWS.slice(0, perPage - visible.length)]
    : visible;

  return (
    <section className="relative w-full bg-[#FBF7F1] px-4 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1170px]">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[28px] font-medium uppercase tracking-[0.01em] text-[#222] md:text-[38px]">
            Testimonials
          </h2>
          <a
            href="#"
            className="pb-0.5 text-[12px] font-medium uppercase tracking-[0.06em] text-[#222] underline underline-offset-8 hover:opacity-70"
          >
            See more
          </a>
        </div>

        {/* Cards */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={() => go("prev")}
            className="absolute -left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#eee] bg-white shadow-lg hover:bg-gray-50 md:flex"
          >
            <ChevronLeft className="h-5 w-5 text-[#222]" />
          </button>

          <button
            type="button"
            onClick={() => go("next")}
            className="absolute -right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#eee] bg-white shadow-lg hover:bg-gray-50 md:flex"
          >
            <ChevronRight className="h-5 w-5 text-[#222]" />
          </button>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {padded.map((review, i) => (
              <div
                key={`${review.id}-${i}`}
                className="relative min-h-[280px] bg-[#fffdfa] px-6 pb-6 pt-10 shadow-[0_5px_25px_rgba(0,0,0,0.04)] md:px-10 md:pt-12"
              >
                {/* Decorative Bars */}
                <div className="absolute left-0 top-0 flex gap-2">
                  <span className="block h-[50px] w-4 -skew-x-[24deg] bg-[#E0A13A] md:h-[65px] md:w-[16px]" />
                  <span className="block h-[50px] w-4 -skew-x-[24deg] bg-[#E0A13A] md:h-[65px] md:w-[16px]" />
                </div>

                {/* Rating */}
                <div className="mb-4 flex items-center justify-end gap-1.5">
                  <Star className="h-4 w-4 fill-[#248328] text-[#248328]" />
                  <span className="text-[14px] text-[#222]">
                    {review.rating} /10
                  </span>
                </div>

                {/* Name / Date */}
                <div className="mb-4 flex items-center justify-between border-b border-[#d5d5d5] pb-3">
                  <span className="text-[16px] font-semibold text-[#222]">
                    {review.name}
                  </span>
                  <span className="text-[13px] text-[#777]">
                    {review.date}
                  </span>
                </div>

                {/* Message */}
                <p className="text-[15px] leading-[1.8] text-[#333] md:text-[16px]">
                  {review.message}
                </p>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to review ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-black" : "w-1.5 bg-[#bfc2c5]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button
        type="button"
        aria-label="Chat with us"
        className="fixed bottom-5 right-5 z-50 hidden h-12 w-12 items-center justify-center rounded-full bg-[#05070a] text-white shadow-xl hover:bg-[#1a1a1a] md:flex"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </section>
  );
}