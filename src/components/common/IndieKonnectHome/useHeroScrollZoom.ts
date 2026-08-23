"use client";
import { useEffect, useRef } from "react";

/**
 * Cinematic hero: section pin hota hai, product image 100% → 125% zoom karti hai,
 * text fade + slide + blur hokar nikalta hai, aur agla section hero ke upar se
 * reveal hota hai.
 *
 * Markup PATCH.md section 6 mein hai. Do gotchas:
 *  1. Lift wrapper par overflow-hidden nahi — overflow-clip (warna andar ke
 *     sticky sections toot jaate hain).
 *  2. Image par Framer ka animate={{ scale }} mat rakho — scroll transform se ladta hai.
 */
export default function useHeroScrollZoom() {
  const wrap = useRef<HTMLDivElement | null>(null);
  const art = useRef<HTMLDivElement | null>(null);
  const text = useRef<HTMLDivElement | null>(null);
  const badge = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const update = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      const h = window.innerHeight || 800;
      const travel = Math.max(1, el.offsetHeight - h);
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel));
      const e = p * p * (3 - 2 * p); // smoothstep

      if (art.current) {
        art.current.style.transform = reduced
          ? "none"
          : "scale(" + (1 + e * 0.25).toFixed(4) + ") translateY(" + (e * -34).toFixed(1) + "px)";
      }
      if (text.current) {
        const fade = Math.min(1, p / 0.62);
        text.current.style.opacity = String(Math.max(0, 1 - fade * 1.15));
        text.current.style.transform = "translateY(" + (-fade * 72).toFixed(1) + "px)";
        text.current.style.filter = fade > 0.05 ? "blur(" + (fade * 5).toFixed(1) + "px)" : "none";
      }
      if (badge.current) {
        badge.current.style.opacity = String(Math.max(0, 1 - p * 1.9));
        badge.current.style.transform =
          "translateY(" + (-p * 60).toFixed(1) + "px) scale(" + (1 - p * 0.2).toFixed(3) + ")";
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { wrap, art, text, badge };
}
