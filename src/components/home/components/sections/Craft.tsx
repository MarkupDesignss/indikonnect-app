"use client";

import Image from "next/image";
import { useRef } from "react";
import { easeIn, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Accent, Display, Eyebrow, Section } from "../../design-system";
import { scrub } from "../../design-system/motion";
import { U } from "../../../../data/site";
import styles from "./Craft.module.css";

export function Craft() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, scrub.s08);

  /* power1.in on the zoom, so the frame accelerates into full bleed */
  const scale = useTransform(p, [0, 1], [1, 9.5], { ease: easeIn });
  const radius = useTransform(p, [0, 1], [6, 0]);
  const imgScale = useTransform(p, [0, 1], [1.25, 1]);
  const scrimOpacity = useTransform(p, [0.5, 0.85], [0, 1]);
  const copyOpacity = useTransform(p, [0.55, 0.95], [0, 1]);
  const copyY = useTransform(p, [0.55, 0.95], [46, 0]);
  const copyScale = useTransform(p, [0.55, 0.95], [0.96, 1]);

  return (
    <Section
      id="lifestyle"
      label="Our standard of craft"
      className={styles.craft}
      ref={ref}
      style={reduced ? { height: "auto", paddingBlock: "var(--space-7)" } : undefined}
    >
      <div className={styles.pin} style={reduced ? { position: "static", height: "auto" } : undefined}>
        <motion.figure
          className={styles.frame}
          style={reduced ? { borderRadius: 6 } : { scale, borderRadius: radius }}
        >
          <motion.div className={styles.frameInner} style={reduced ? undefined : { scale: imgScale }}>
            <Image
              src={U("1596462502278-27bfdc403348", 1800)}
              alt="Beauty and personal care products arranged as a flat lay"
              fill
              sizes="100vw"
            />
          </motion.div>
        </motion.figure>

        <motion.div className={styles.scrim} style={{ opacity: reduced ? 1 : scrimOpacity }} />

        <motion.div
          className={styles.copy}
          style={reduced ? { opacity: 1 } : { opacity: copyOpacity, y: copyY, scale: copyScale }}
        >
          <Eyebrow center>Chapter Four &middot; The Standard</Eyebrow>
          <Display size="xl" style={{ marginTop: 20 }}>
            Made to be <Accent>kept</Accent>
          </Display>
          <p>
            Watches drawn from heritage horology. Jewellery that reflects individuality. Skincare built
            on performance, not promises. Dining pieces that bring elegance to the modern Indian home.
            Four categories, one standard.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}
