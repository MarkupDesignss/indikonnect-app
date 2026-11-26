"use client";
import { useEffect } from "react";

/**
 * Stagger scroll-reveal for plain (non-Framer) elements.
 * Element par className={m.reveal} lagao; hook viewport mein aate hi m.in add karta hai.
 *
 * Scroll listener PRIMARY hai — IntersectionObserver kuch embedded/preview
 * environments mein entries deliver nahi karta, isliye wo sirf enhancement hai.
 *
 * @param inClass  revealed state ka CSS-module class (m.in)
 * @param deps     re-scan trigger (e.g. [activeTab, products.length])
 */
export default function useReveal(inClass: string, deps: any[] = []) {
  useEffect(() => {
    const sel = '[class*="reveal"]:not(.' + inClass + ')';
    let pending = Array.from(document.querySelectorAll<HTMLElement>(sel));
    if (!pending.length) return;

    const show = (el: HTMLElement) => {
      const sibs = Array.from(el.parentElement?.children || []);
      el.style.transitionDelay = Math.min(Math.max(0, sibs.indexOf(el)) * 85, 520) + "ms";
      el.classList.add(inClass);
    };

    const check = () => {
      if (!pending.length) return;
      const h = window.innerHeight || 800;
      pending = pending.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < h * 0.98 && r.bottom > -80) {
          show(el);
          return false;
        }
        return true;
      });
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
