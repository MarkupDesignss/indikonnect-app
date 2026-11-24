"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

const CIRCLE_SIZE = 54;
const CIRCLE_RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function ScrollToTop() {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Keep route navigation at the top of the new page.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const updateScrollState = () => {
      if (rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;

        const scrollTop = Math.max(
          window.scrollY || document.documentElement.scrollTop || 0,
          0
        );
        const documentHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body?.scrollHeight || 0
        );
        const scrollableHeight = Math.max(
          documentHeight - window.innerHeight,
          0
        );

        const progress =
          scrollableHeight > 0
            ? Math.min(Math.max(scrollTop / scrollableHeight, 0), 1)
            : 0;

        setScrollProgress(progress);
        setIsVisible(scrollTop > 120 && scrollableHeight > 0);
      });
    };

    // Calculate once after mount/route change, then track scrolling and resizing.
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [pathname]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - scrollProgress);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label={`Scroll to top, ${Math.round(scrollProgress * 100)} percent page progress`}
      title="Back to top"
      className={`fixed bottom-5 right-5 z-[9999] flex h-[54px] w-[54px] items-center justify-center rounded-full transition-all duration-300 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A13A] focus-visible:ring-offset-2 sm:bottom-7 sm:right-7 ${
        isVisible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-3 scale-90 opacity-0"
      }`}
    >
      {/* Background track + scroll-progress border */}
      <svg
        aria-hidden="true"
        width={CIRCLE_SIZE}
        height={CIRCLE_SIZE}
        viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
        className="absolute inset-0 -rotate-90 overflow-visible"
      >
        <circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="#D9DCE3"
          strokeWidth="3"
        />
        <circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="#E0A13A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-100 ease-out"
        />
      </svg>

      {/* IndieKonnect navy button */}
      <span className="relative flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#0F1A3C] text-white shadow-[0_4px_14px_rgba(15,26,60,0.28)] transition-colors duration-200 hover:bg-[#172653]">
        <ArrowUp size={20} strokeWidth={2.3} />
      </span>
    </button>
  );
}
