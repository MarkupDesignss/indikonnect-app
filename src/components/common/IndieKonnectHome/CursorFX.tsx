"use client";
import { useEffect, useRef } from "react";
import m from "./motion.module.css";

/**
 * Custom cursor: gold dot (link/button/card par bada) + lagging ring.
 * Layout mein ek baar mount karo. Touch devices aur reduced-motion par off.
 */
export default function CursorFX() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;

    let mx = 0, my = 0, cx = 0, cy = 0, raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const d = dot.current;
      if (!d) return;
      d.style.transform = "translate3d(" + (mx - 5) + "px," + (my - 5) + "px,0)";
      const t = e.target as HTMLElement;
      const over = t && t.closest ? t.closest("a, button, [data-card]") : null;
      d.style.width = over ? "30px" : "10px";
      d.style.height = over ? "30px" : "10px";
    };

    const loop = () => {
      cx += (mx - cx) * 0.14;
      cy += (my - cy) * 0.14;
      if (ring.current) {
        ring.current.style.transform = "translate3d(" + (cx - 20) + "px," + (cy - 20) + "px,0)";
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dot} className={m.cursorDot} />
      <div ref={ring} className={m.cursorRing} />
    </>
  );
}
