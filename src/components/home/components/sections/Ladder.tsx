"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Accent, Display, Eyebrow, Lede, Section, Wrap, cx } from "../../design-system";
import { ease } from "../../design-system";
import { steps } from "../../../../data/site";
import styles from "./Ladder.module.css";

export function Ladder() {
  const [current, setCurrent] = useState(0);

  return (
    <Section id="ladder" label="The growth ladder" className={styles.ladder}>
      <Wrap className={styles.in}>
        <div className={styles.sticky}>
          <Eyebrow>Chapter Six &middot; The Opportunity</Eyebrow>
          <Display size="lg" style={{ marginTop: 20 }}>
            A growth ladder
            <br />
            for <Accent>leaders</Accent>
          </Display>
          <Lede style={{ marginTop: 20 }}>
            A clear, milestone-driven journey built on leadership development, mentorship and shared
            success. Every rung is earned, and every rung is published.
          </Lede>

          <div className={styles.meter} aria-hidden="true">
            <span className={styles.num}>{String(current + 1).padStart(2, "0")}</span>
            <span className={styles.track}>
              <i
                className={styles.fill}
                style={{ width: ((current + 1) / steps.length) * 100 + "%" }}
              ></i>
            </span>
            <span className={styles.num} style={{ opacity: 0.4 }}>
              05
            </span>
          </div>
        </div>

        <div className={styles.steps}>
          {steps.map((step, i) => (
            <Step key={step.title} step={step} index={i} onActive={setCurrent} />
          ))}
        </div>
      </Wrap>
    </Section>
  );
}

function Step({
  step,
  index,
  onActive
}: {
  step: (typeof steps)[number];
  index: number;
  onActive: (i: number) => void;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  /* A zero-height line at 62% of the viewport: the step that crosses it is live. */
  const crossing = useInView(ref, { margin: "-62% 0px -38% 0px" });

  useEffect(() => {
    if (crossing) onActive(index);
  }, [crossing, index, onActive]);

  return (
    <motion.article
      ref={ref}
      className={cx(styles.step, crossing && styles.on)}
      initial={reduced ? undefined : { x: 44, opacity: 0 }}
      animate={seen || reduced ? { x: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.8, ease: ease.power3Out }}
    >
      <span className={styles.mark}>{step.mark}</span>
      <p className={styles.lvl}>{step.level}</p>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
    </motion.article>
  );
}
