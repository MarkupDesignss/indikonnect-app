"use client";

import { useEffect, useState } from "react";
import { useAnimate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { Logo } from "../design-system";
import { ease } from "../design-system/motion";
import styles from "./Preloader.module.css";

/**
 * The GSAP intro timeline, one for one:
 * mark rises, bar and counter run to 100, mark exits, curtain lifts.
 * onReveal fires 0.45s into the curtain lift, which is where the
 * original handed the hero its entrance ("-=.55" of a 1s tween).
 */
export function Preloader({ onReveal }: { onReveal: () => void }) {
  const [scope, animate] = useAnimate();
  const count = useMotionValue(0);
  const [num, setNum] = useState("000");
  const [gone, setGone] = useState(false);

  useMotionValueEvent(count, "change", (v) => {
    setNum(String(Math.round(v)).padStart(3, "0"));
  });

  useEffect(() => {
    let cancelled = false;
    const drop = () => {
      if (!cancelled) setGone(true);
    };
    /* Failsafe: never leave the curtain up. */
    const failsafe = window.setTimeout(drop, 6000);
    let handoff = 0;

    const run = async () => {
      await animate([
        ["[data-pl-mark] span", { y: "0%" }, { duration: 0.9, ease: ease.expoOut, at: 0.15 }],
        ["[data-pl-bar] i", { width: "100%" }, { duration: 1.5, ease: ease.power2InOut, at: 0.25 }],
        [count, 100, { duration: 1.5, ease: ease.power2InOut, at: 0.25 }],
        ["[data-pl-mark] span", { y: "-110%" }, { duration: 0.6, ease: ease.power3In, at: "+0.15" }]
      ]);
      if (cancelled) return;
      handoff = window.setTimeout(onReveal, 450);
      await animate(scope.current, { y: "-100%" }, { duration: 1, ease: ease.expoInOut });
      drop();
    };

    void run();

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      window.clearTimeout(handoff);
    };
  }, [animate, count, onReveal, scope]);

  useEffect(() => {
    if (gone) onReveal();
  }, [gone, onReveal]);

  if (gone) return null;

  return (
    <div ref={scope} className={styles.curtain} aria-hidden="true">
      <div className={styles.mark} data-pl-mark>
        <span style={{ transform: "translateY(110%)" }}>
          <Logo className={styles.logo} />
        </span>
      </div>
      <div className={styles.bar} data-pl-bar>
        <i></i>
      </div>
      <div className={styles.num}>{num}</div>
    </div>
  );
}
