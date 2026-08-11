"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Accent, Display, Eyebrow, Lede, Reveal, Section, Wrap, cx } from "../../design-system";
import { ease, scrub } from "../../design-system/motion";
import styles from "./TheName.module.css";

const LOCKUP = "INDIEKONNECT".split("");

export function TheName() {
  const reduced = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLParagraphElement>(null);
  const lockupSeen = useInView(lockupRef, { once: true, margin: "0px 0px -15% 0px" });

  /* Original: scrub from "top 78%" to "top 28%" of the viewport. */
  const { scrollYProgress } = useScroll({ target: gridRef, offset: ["start 0.78", "start 0.28"] });
  const p = useSpring(scrollYProgress, scrub.s09);

  const leftRotate = useTransform(p, [0, 1], [-72, 0]);
  const leftX = useTransform(p, [0, 1], ["-14%", "0%"]);
  const rightRotate = useTransform(p, [0, 1], [72, 0]);
  const rightX = useTransform(p, [0, 1], ["14%", "0%"]);
  const cardOpacity = useTransform(p, [0, 1], [0, 1]);
  const joinScale = useTransform(p, [0.25, 1], [0, 1]);
  const joinRotate = useTransform(p, [0.25, 1], [-140, 0]);

  return (
    <Section id="name" surface="light" label="The meaning of the name" className={styles.name}>
      <Wrap>
        <div className={styles.head}>
          <Reveal as="p">
            <Eyebrow>Chapter Two &middot; The Meaning</Eyebrow>
          </Reveal>
          <Reveal as="div" delay={0.08}>
            <Display size="lg" style={{ marginTop: 20 }}>
              So we built a <Accent>doorway</Accent>, and gave it a name.
            </Display>
          </Reveal>
          <Reveal as="div" delay={0.16}>
            <Lede style={{ marginTop: 20 }}>
              Two ideas, one identity. The independent spirit of India, bridged to the aspirations of
              every entrepreneur who dares to rise.
            </Lede>
          </Reveal>
        </div>

        <div className={styles.grid} ref={gridRef}>
          <motion.article
            className={styles.card}
            style={
              reduced
                ? undefined
                : { rotateY: leftRotate, x: leftX, opacity: cardOpacity, transformOrigin: "right center" }
            }
          >
            <div>
              <p className={styles.role}>Part One</p>
              <p className={styles.word}>Indie</p>
            </div>
            <p>
              The independent spirit of India. Its culture, its people, and an ambition that has never
              asked permission to exist.
            </p>
          </motion.article>

          <motion.div
            className={styles.join}
            aria-hidden="true"
            style={reduced ? undefined : { scale: joinScale, rotate: joinRotate }}
          >
            &#10022;
          </motion.div>

          <motion.article
            className={cx(styles.card, styles.alt)}
            style={
              reduced
                ? undefined
                : { rotateY: rightRotate, x: rightX, opacity: cardOpacity, transformOrigin: "left center" }
            }
          >
            <div>
              <p className={styles.role}>Part Two</p>
              <p className={styles.word}>Konnect</p>
            </div>
            <p>
              The bridge of opportunity. Our mission to close the distance between world-class products
              and the aspiring Indian entrepreneur.
            </p>
          </motion.article>
        </div>

        <p className={styles.lockup} ref={lockupRef} aria-label="IndieKonnect">
          {LOCKUP.map((char, i) => (
            <motion.span
              key={char + i}
              className={cx(styles.lk, i === 5 && styles.lkGold)}
              initial={reduced ? undefined : { y: "100%", opacity: 0, rotateX: -80 }}
              animate={lockupSeen || reduced ? { y: "0%", opacity: 1, rotateX: 0 } : undefined}
              transition={{ duration: 0.85, ease: ease.expoOut, delay: i * 0.045 }}
            >
              {char}
            </motion.span>
          ))}
        </p>

        <Reveal as="p" className={styles.quote}>
          The brand <em>is</em> the identity. An institution built not around individuals, but a
          collective vision of excellence.
        </Reveal>
      </Wrap>
    </Section>
  );
}
