"use client";
import { useEffect, useRef } from "react";

/**
 * Banner parallax — image apne frame ke andar scroll ke saath slow-slide karti hai.
 * Image ko frame se bada rakho (className={m.pxFrame}) taaki edge na dikhe.
 *
 *   const px = useParallax(26);
 *   <div ref={px} className={m.pxFrame}><img ... /></div>
 *
 * NOTE: hook ko .map() ke andar call na karo — banner ko chhota child
 * component bana lo (PATCH.md section 5 dekho).
 */
export default function useParallax(amount = 26) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frame = el.parentElement;
    if (!frame) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const h = window.innerHeight || 800;
      const box = frame.getBoundingClientRect();
      if (box.bottom < -200 || box.top > h + 200) return;
      const p = (box.top + box.height / 2 - h / 2) / (h / 2 + box.height / 2);
      const y = (Math.max(-1, Math.min(1, p)) * amount).toFixed(2);
      el.style.transform = "translate3d(0," + y + "px,0)";
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
  }, [amount]);

  return ref;
}
