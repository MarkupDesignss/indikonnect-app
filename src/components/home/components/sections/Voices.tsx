"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Accent, Display, Eyebrow, Reveal, Section, Wrap, cx } from "../../design-system";
import { scrub } from "../../design-system/motion";
import { U, compliance, voices } from "../../../../data/site";
import styles from "./Voices.module.css";
import valStyles from "./Values.module.css";

export function Voices() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, scrub.s10);
  const x = useTransform(p, [0, 1], [0, -240]);

  return (
    <Section id="voices" surface="light" label="Voices of the movement" className={styles.voices} ref={ref}>
      <div className={styles.head}>
        <Reveal as="p">
          <Eyebrow center>Chapter Seven &middot; The People</Eyebrow>
        </Reveal>
        <Reveal as="div" delay={0.08}>
          <Display size="lg" style={{ marginTop: 20 }}>
            People &amp; <Accent>possibilities</Accent>
          </Display>
        </Reveal>
      </div>

      <motion.div className={styles.row} style={reduced ? undefined : { x }}>
        {voices.map((voice) => (
          <article key={voice.name} className={styles.card}>
            <p className={styles.mark} aria-hidden="true">
              &ldquo;
            </p>
            <q>{voice.quote}</q>
            <div className={styles.who}>
              <span className={styles.av}>
                <Image src={U(voice.avatar, 140, 70)} alt="" fill sizes="42px" />
              </span>
              <span>
                <span className={styles.name}>{voice.name}</span>
                <br />
                <span className={styles.role}>{voice.role}</span>
              </span>
            </div>
          </article>
        ))}
      </motion.div>

      <Wrap className={styles.closing}>
        <Reveal as="p">
          <Eyebrow center>Future-Ready &amp; Compliant</Eyebrow>
        </Reveal>
        <Reveal as="div" delay={0.08}>
          <Display as="h3" size="md" style={{ marginTop: 16 }}>
            A proud advocate of <Accent>Aatmanirbhar Bharat</Accent>
          </Display>
        </Reveal>
        <Reveal as="div" delay={0.16} className={valStyles.grid} style={{ marginTop: "var(--space-4)", textAlign: "left" }}>
          {compliance.map((item) => (
            <article key={item.idx} className={cx(valStyles.val, valStyles.compact)}>
              <span className={valStyles.idx}>{item.idx}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </Reveal>
      </Wrap>
    </Section>
  );
}
