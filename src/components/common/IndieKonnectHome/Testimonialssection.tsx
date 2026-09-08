"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface ReelTestimonial {
  id: number;
  name: string;
  video: string;
  views: string;
}

/* ------------------------------------------------------------------ */
/* Reel Data (real, working sample videos)                            */
/* ------------------------------------------------------------------ */

const REELS: ReelTestimonial[] = [
  {
    id: 1,
    name: "Priya",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    views: "1.4K",
  },
  {
    id: 2,
    name: "Rakesh",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    views: "1.1K",
  },
  {
    id: 3,
    name: "Sunita",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    views: "963",
  },
  {
    id: 4,
    name: "Neha",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    views: "1K",
  },
  {
    id: 5,
    name: "Vikram",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    views: "1.8K",
  },
  {
    id: 6,
    name: "Anil",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    views: "1.2K",
  },
];

/* ------------------------------------------------------------------ */
/* Reel Carousel                                                      */
/* ------------------------------------------------------------------ */

export default function ReelCarousel() {
  const [activeIndex, setActiveIndex] = useState(2);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const previous = () => {
    setActiveIndex((prev) =>
      prev === 0 ? REELS.length - 1 : prev - 1
    );
  };

  const next = () => {
    setActiveIndex((prev) =>
      prev === REELS.length - 1 ? 0 : prev + 1
    );
  };

  // Auto play active video
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeIndex) {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browser autoplay restriction
          });
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeIndex]);

  // Get relative position for 3D carousel effect
  const getPosition = (index: number) => {
    const total = REELS.length;
    let diff = index - activeIndex;
    
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    
    return diff;
  };

  return (
    <section className="relative w-full overflow-hidden bg-white py-10 md:py-16">
      {/* Heading */}
      <h2 className="mb-10 text-center text-[24px] font-medium uppercase tracking-[0.03em] text-[#111] md:text-[30px]">
        Customer Testimonials and Stories
      </h2>

      {/* Left Arrow */}
      <button
        type="button"
        onClick={previous}
        aria-label="Previous video"
        className="absolute left-2 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#ddd] bg-white/90 shadow-md transition hover:bg-white md:left-6"
      >
        <ChevronLeft className="h-5 w-5 text-[#444]" />
      </button>

      {/* Right Arrow */}
      <button
        type="button"
        onClick={next}
        aria-label="Next video"
        className="absolute right-2 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#ddd] bg-white/90 shadow-md transition hover:bg-white md:right-6"
      >
        <ChevronRight className="h-5 w-5 text-[#444]" />
      </button>

   

      {/* Carousel */}
      <div className="relative mx-auto h-[500px] w-full max-w-[1100px] px-4 md:h-[620px] md:px-16">
        {REELS.map((reel, index) => {
          const position = getPosition(index);
          const isCenter = position === 0;
          const isLeft = position === -1;
          const isRight = position === 1;

          // Calculate transforms for 3D carousel
          let transform = "translateX(-50%) scale(0.6)";
          let zIndex = 1;
          let opacity = 0.4;
          let width = "180px";
          let height = "360px";

          if (isCenter) {
            transform = "translateX(-50%) scale(1)";
            zIndex = 20;
            opacity = 1;
            width = "280px";
            height = "520px";
          } else if (isLeft) {
            transform = "translateX(-50%) translateX(-160px) scale(0.8)";
            zIndex = 10;
            opacity = 0.9;
            width = "210px";
            height = "400px";
          } else if (isRight) {
            transform = "translateX(-50%) translateX(160px) scale(0.8)";
            zIndex = 10;
            opacity = 0.9;
            width = "210px";
            height = "400px";
          } else if (position === -2) {
            transform = "translateX(-50%) translateX(-280px) scale(0.65)";
            zIndex = 5;
            opacity = 0.7;
            width = "170px";
            height = "340px";
          } else if (position === 2) {
            transform = "translateX(-50%) translateX(280px) scale(0.65)";
            zIndex = 5;
            opacity = 0.7;
            width = "170px";
            height = "340px";
          }

          return (
            <div
              key={reel.id}
              className="absolute left-1/2 top-1/2 cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 ease-out"
              style={{
                width,
                height,
                transform,
                zIndex,
                opacity,
                pointerEvents: opacity < 0.5 ? "none" : "auto",
                boxShadow: isCenter ? "0 20px 60px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.15)",
              }}
              onClick={() => goToSlide(index)}
            >
              {/* Video */}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={reel.video}
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

              {/* Views Badge */}
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
                <Eye className="h-3.5 w-3.5" />
                {reel.views}
              </div>

              {/* Center Play Button */}
              {isCenter && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-sm transition-transform duration-300 hover:scale-110">
                    <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-base font-semibold text-white drop-shadow-lg">
                  {reel.name}
                </p>
                {isCenter && (
                  <p className="mt-0.5 text-xs text-white/80 drop-shadow-lg">
                    Customer story
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {REELS.map((reel, index) => (
          <button
            key={reel.id}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`Go to video ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "w-8 bg-[#111]"
                : "w-1.5 bg-[#cfcfcf]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}