"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue
} from "framer-motion";
import { Eyebrow, Section } from "../../design-system";
import { scrub } from "../../design-system/motion";
import { U, nationColumns } from "../../../../data/site";
import styles from "./Nation.module.css";

export function Nation() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* The pin: progress across the sticky section's travel. */
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, scrub.s08);

  /* The drift: whole section crossing the viewport. */
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useSpring(pass, scrub.s10);

  const value = useTransform(p, (v) => (v * 1.4).toFixed(1));
  const coreScale = useTransform(p, [0, 1], [0.82, 1]);
  const coreOpacity = useTransform(p, [0, 1], [0.4, 1]);
  const colsOpacity = useTransform(p, [0, 1], [0.1, 0.34]);

  return (
    <Section id="nation" label="The scale of the movement" className={styles.nation} ref={ref}>
      <div className={styles.pin}>
        <motion.div className={styles.cols} style={{ opacity: reduced ? 0.3 : colsOpacity }} aria-hidden="true">
          {nationColumns.map((col, ci) => (
            <NationColumn key={ci} drift={drift} amount={col.drift} images={col.images} reduced={Boolean(reduced)} />
          ))}
        </motion.div>

        <div className={styles.core}>
          <Eyebrow center style={{ marginBottom: 22 }}>
            Chapter One &middot; The Nation
          </Eyebrow>
          <motion.p className={styles.count} style={{ scale: reduced ? 1 : coreScale, opacity: reduced ? 1 : coreOpacity }}>
            <motion.span>{reduced ? "1.4" : value}</motion.span>
            <sup>billion</sup>
          </motion.p>
          <p className={styles.sub}>
            people. One shared ambition. Before IndieKonnect was a brand, it was an observation: India
            does not lack talent, it lacks doorways.
          </p>
        </div>
      </div>
    </Section>
  );
}

function NationColumn({
  drift,
  amount,
  images,
  reduced
}: {
  drift: MotionValue<number>;
  amount: number;
  images: string[];
  reduced: boolean;
}) {
  const y = useTransform(drift, [0, 1], [-amount + "%", amount + "%"]);
  return (
    <motion.div className={styles.col} style={reduced ? undefined : { y }}>
      {images.map((id, i) => (
        <figure key={id + i}>
          <Image src={U(id, 520, 70)} alt="" fill sizes="20vw" />
        </figure>
      ))}
    </motion.div>
  );
}
