"use client";

import { useEffect, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";

/**
 * Lenis drives the native scroll position, so every Framer Motion
 * useScroll progress inherits the same eased feel the GSAP build had.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
