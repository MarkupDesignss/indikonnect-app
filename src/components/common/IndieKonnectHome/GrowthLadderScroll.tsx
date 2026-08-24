"use client";
import { useEffect, useRef, useState } from "react";

type Step = {
  id?: string | number;
  title?: string;
  name?: string;
  description?: string;
  text?: string;
};

type Props = {
  title?: string;
  steps: Step[];
  accent?: string;
  ink?: string;
  ink2?: string;
  line?: string;
};

/**
 * Growth ladder — sticky pinned sequence. Section viewport par ruk jaata hai
 * aur scroll 01 → 02 → 03 → 04 ko ek-ek karke kholta hai.
 *   past     = gold ✓, opacity .55
 *   active   = gold + bada number, opacity 1, description khulti hai
 *   upcoming = opacity .25
 *
 * Usage (aapke existing data se):
 *   <GrowthLadderScroll title={growthTitle} steps={growthSteps} />
 *
 * level / setLevel / handlePreviousLevel / handleNextLevel ki zaroorat nahi rehti.
 * Section height = 100 + steps × 60 vh (4 steps = 340vh).
 */
export default function GrowthLadderScroll({
  title = "A growth ladder for leaders",
  steps = [],
  accent = "#C9A96E",
  ink = "#101827",
  ink2 = "#5f636b",
  line = "#e8e2d6",
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [prog, setProg] = useState({ idx: 0, inner: 0, p: 0 });
  const n = steps.length || 1;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      const h = window.innerHeight || 800;
      const travel = Math.max(1, el.offsetHeight - h);
      const q = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel));
      const pp = Math.min(1, Math.max(0, (q - 0.06) / 0.82));
      const raw = pp * n;
      const i = Math.min(n - 1, Math.floor(raw));
      setProg({ idx: i, inner: Math.min(1, Math.max(0, raw - i)), p: q });
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
  }, [n]);

  if (!steps.length) return null;

  const { idx, inner, p } = prog;

  return (
    <div ref={wrap} className="relative" style={{ height: 100 + n * 60 + "vh" }}>
      <section className="sticky top-0 flex  items-center overflow-hidden bg-white">
        <div className="mx-auto w-full max-w-[1900px] px-5 py-14 sm:px-8 lg:px-12">
          <div
            className="mb-3.5 text-[10px] font-extrabold uppercase tracking-[.28em]"
            style={{ color: accent }}
          >
            Opportunity
          </div>

          <h2
            className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[40px] lg:text-[48px]"
            style={{ color: ink, marginBottom: 52 }}
          >
            {title}
          </h2>

          <div className="grid grid-cols-2 items-start gap-y-10 md:grid-cols-4 md:gap-y-0">
            {steps.map((s, i) => {
              const past = i < idx;
              const active = i === idx;
              const label = s.title || s.name || "";
              const body = s.description || s.text || "";
              return (
                <div
                  key={s.id != null ? s.id : i}
                  className="relative transition-all duration-700"
                  style={{
                    opacity: active ? 1 : past ? 0.55 : 0.25,
                    transform: active ? "none" : "translateY(10px)",
                  }}
                >
                  <div className="flex h-[46px] items-center gap-3 pr-7">
                    <div
                      className="origin-left font-serif text-[38px] leading-none transition-all duration-500"
                      style={{
                        color: active || past ? accent : ink2,
                        transform: active ? "scale(1.2)" : "scale(1)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full text-[11px] text-white transition-all duration-500"
                      style={{
                        background: accent,
                        opacity: past ? 1 : 0,
                        transform: past ? "scale(1)" : "scale(.5)",
                      }}
                    >
                      ✓
                    </span>
                  </div>

                  <div className="relative my-6 h-[2px] overflow-hidden" style={{ background: line }}>
                    <div
                      className="absolute inset-0 transition-[width] duration-500"
                      style={{
                        background: accent,
                        width: past ? "100%" : active ? Math.round(inner * 100) + "%" : "0%",
                      }}
                    />
                  </div>

                  <div
                    className="mb-2 pr-7 text-[13px] font-extrabold transition-colors duration-500"
                    style={{ color: active ? ink : ink2 }}
                  >
                    {label}
                  </div>

                  <p
                    className="max-w-[230px] overflow-hidden pr-7 text-[11.5px] leading-[1.75] transition-all duration-700"
                    style={{
                      color: ink2,
                      opacity: active ? 1 : past ? 0.55 : 0,
                      maxHeight: active || past ? 150 : 0,
                      transform: active ? "none" : "translateY(8px)",
                    }}
                  >
                    {body}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            className="mt-14 flex items-center justify-between border-t pt-5"
            style={{ borderColor: line }}
          >
            <div className="text-[11px] font-extrabold tracking-[.22em]" style={{ color: ink2 }}>
              {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </div>
            <div
              className="flex items-center gap-2.5 text-[10px] uppercase tracking-[.24em] transition-opacity duration-500"
              style={{ color: ink2, opacity: 1 - Math.min(1, Math.max(0, (p - 0.78) / 0.16)) }}
            >
              Scroll ↓
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
