"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowIcon, Button, Display, Lede, Section, cx } from "../../design-system";
import { ease, scrub } from "../../design-system/motion";
import { U } from "../../../../data/site";
import styles from "./Hero.module.css";

const LINES = [
  { text: "Art of", italic: false },
  { text: "Opportunity", italic: true }
];

/** Entrance offsets, measured off the original GSAP timeline. */
const T = { chars: 0, kicker: 0, lede: 0.4, actions: 0.5, portrait: 0.4, cue: 1.2 };

export function Hero({ start }: { start: boolean }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, scrub.s06);

  const bgY = useTransform(p, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(p, [0, 1], [1, 1.12]);
  const portraitY = useTransform(p, [0, 1], ["0%", "-14%"]);
  const inY = useTransform(p, [0, 1], ["0%", "-28%"]);
  const inOpacity = useTransform(p, [0, 1], [1, 0.25]);
  const cueOpacity = useTransform(p, [0, 0.6], [1, 0]);

  const go = reduced ? true : start;
  let charIndex = -1;

  return (
    <Section id="hero" label="Introduction" className={styles.hero} ref={ref}>
      <motion.div className={cx(styles.layer, styles.bg)} style={{ y: bgY, scale: bgScale }}>
        <Image
          src={U("1477587458883-47145ed94245", 2000)}
          alt=""
          fill
          priority
          sizes="112vw"
        />
      </motion.div>

      <div className={styles.veil}></div>
      <div className={styles.grain}></div>

      

      <motion.div className={styles.in} style={{ y: inY, opacity: inOpacity }}>
        <div>
        

          <Display as="h1" size="xxl" className={styles.h1}>
            {LINES.map((line) => (
              <span key={line.text} className={styles.line}>
                {line.text.split("").map((char, i) => {
                  charIndex += 1;
                  const delay = T.chars + charIndex * 0.022;
                  return (
                    <motion.span
                      key={line.text + i}
                      className={styles.ch}
                      style={
                        line.italic
                          ? {
                              fontStyle: "italic",
                              color: "var(--gold)",
                              fontVariationSettings: "'SOFT' 40, 'WONK' 1, 'opsz' 144"
                            }
                          : undefined
                      }
                      initial={{ y: "118%", opacity: 0 }}
                      animate={go ? { y: "0%", opacity: 1 } : undefined}
                      transition={{ duration: 1.1, ease: ease.expoOut, delay }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </Display>

          <motion.div
            initial={{ y: 34, opacity: 0 }}
            animate={go ? { y: 0, opacity: 1 } : undefined}
            transition={{ duration: 0.9, ease: ease.power3Out, delay: T.lede }}
          >
            <Lede className={styles.lede}>
              A modern Indian movement built on Connection, Opportunity, Growth and Trust, where the
              spirit of 1.4 billion meets the power of entrepreneurship.
            </Lede>
          </motion.div>

          <motion.div
            className={styles.actions}
            initial={{ y: 34, opacity: 0 }}
            animate={go ? { y: 0, opacity: 1 } : undefined}
            transition={{ duration: 0.9, ease: ease.power3Out, delay: T.actions }}
          >
            <Button href="#join" variant="gold">
              Join the Movement
              <ArrowIcon />
            </Button>
            <Button href="#collections" variant="ghost">
              Shop the Collections
              <ArrowIcon />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className={styles.cue}
        style={{ opacity: cueOpacity }}
        initial={{ opacity: 0 }}
        animate={go ? { opacity: 1 } : undefined}
        transition={{ duration: 0.6, delay: T.cue }}
      >
        <i></i>Scroll
      </motion.div>
    </Section>
  );
}
