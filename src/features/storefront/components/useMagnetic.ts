"use client";
import { useEffect, useRef } from "react";

/**
 * Magnetic pull — button cursor ke paas aane par uski taraf khinchta hai.
 *   const btn = useMagnetic();  <button ref={btn}>
 *
 * Rect cache hota hai (scroll/resize par refresh), isliye har mousemove par
 * layout read nahi hota — warna 8+ buttons pe main thread block ho jaata hai.
 */
export default function useMagnetic(strength = 0.28, radius = 90) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;

    let cx = 0, cy = 0, mx = 0, my = 0, raf = 0;

    const cache = () => {
      const r = el.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
    };
    cache();

    const apply = () => {
      raf = 0;
      const dx = mx - cx;
      const dy = my - cy;
      el.style.transform =
        Math.hypot(dx, dy) < radius
          ? "translate(" + (dx * strength).toFixed(1) + "px," + (dy * strength * 1.15).toFixed(1) + "px)"
          : "translate(0,0)";
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", cache, { passive: true });
    window.addEventListener("resize", cache, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", cache);
      window.removeEventListener("resize", cache);
      cancelAnimationFrame(raf);
    };
  }, [strength, radius]);

  return ref;
}
