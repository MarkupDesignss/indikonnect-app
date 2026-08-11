"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Accent, Display, Eyebrow, Lede, Reveal, Section, Wrap, cx } from "../../design-system";
import { ease } from "../../design-system/motion";
import { values } from "../../../../data/site";
import styles from "./Values.module.css";

const CHIP = { navy: styles.chipNavy, gold: styles.chipGold, white: styles.chipWhite };

export function Values() {
  const reduced = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const seen = useInView(gridRef, { once: true, margin: "0px 0px -20% 0px" });

  return (
    <Section id="values" surface="light" label="Our values" className={styles.values}>
      <Wrap>
        <div className={styles.head}>
          <Reveal as="p">
            <Eyebrow>Chapter Five &middot; The Foundations</Eyebrow>
          </Reveal>
          <Reveal as="div" delay={0.08}>
            <Display size="lg" style={{ marginTop: 20 }}>
              Values you can <Accent>trust</Accent>
            </Display>
          </Reveal>
          <Reveal as="div" delay={0.16}>
            <Lede style={{ marginTop: 20 }}>
              The IndieKonnect ecosystem runs on a people-first philosophy. Our house colours are not
              decoration, they are a commitment.
            </Lede>
          </Reveal>
        </div>

        <div className={styles.grid} ref={gridRef}>
          {values.map((value, i) => (
            <motion.article
              key={value.idx}
              className={styles.val}
              initial={reduced ? undefined : { rotateX: -34, rotateY: i === 0 ? -18 : i === 2 ? 18 : 0, y: 70, opacity: 0 }}
              animate={seen || reduced ? { rotateX: 0, rotateY: 0, y: 0, opacity: 1 } : undefined}
              transition={{ duration: 1, ease: ease.expoOut, delay: i * 0.1 }}
              style={{ transformPerspective: 900 }}
            >
              <span className={styles.idx}>{value.idx}</span>
              <span className={cx(styles.chip, CHIP[value.chip])} aria-hidden="true"></span>
              <h3>{value.title}</h3>
              <p>
                <strong>{value.colour}</strong> {value.body}
              </p>
            </motion.article>
          ))}
        </div>
      </Wrap>
    </Section>
  );
}
