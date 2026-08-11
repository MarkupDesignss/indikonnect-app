"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Accent, ArrowIcon, Button, Display, Eyebrow, Lede, Reveal, Section } from "../../design-system";
import { scrub } from "../../design-system/motion";
import { U } from "../../../../data/site";
import styles from "./Finale.module.css";

export function Finale() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* Slow zoom out across the whole pass, closing the loop on the hero. */
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(pass, scrub.s08);
  const bgScale = useTransform(p, [0, 1], [1.35, 1]);
  const bgY = useTransform(p, [0, 1], ["-8%", "8%"]);

  /* Copy settles between "top 60%" and centre-centre. */
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start 0.6", "center center"] });
  const e = useSpring(enter, scrub.s06);
  const inScale = useTransform(e, [0, 1], [0.94, 1]);
  const inOpacity = useTransform(e, [0, 1], [0.5, 1]);

  return (
    <Section id="join" label="Join the movement" className={styles.finale} ref={ref}>
      <div className={styles.pin}>
        <motion.div className={styles.bg} style={reduced ? undefined : { scale: bgScale, y: bgY }}>
          <Image
            src={U("1548013146-72479768bada", 2000)}
            alt="The Taj Mahal framed through a sandstone archway at sunrise"
            fill
            sizes="100vw"
          />
        </motion.div>

        <motion.div className={styles.in} style={reduced ? undefined : { scale: inScale, opacity: inOpacity }}>
          <Reveal as="p">
            <Eyebrow center>Chapter Eight &middot; The Invitation</Eyebrow>
          </Reveal>
          <Reveal as="div" delay={0.08}>
            <Display size="xl" style={{ marginTop: 22 }}>
              Where people &amp; possibilities
              <br />
              <Accent>connect</Accent>
            </Display>
          </Reveal>
          <Reveal as="div" delay={0.16}>
            <Lede className={styles.lede}>
              Whether you are here for premium products that lift your everyday, or a professional
              opportunity that changes your financial future, this is where India rises together.
            </Lede>
          </Reveal>
          <Reveal as="div" delay={0.24} className={styles.actions}>
            <Button href="#join" variant="gold">
              Become a Distributor
              <ArrowIcon />
            </Button>
            <Button href="#collections" variant="ghost">
              Shop the Collection
            </Button>
          </Reveal>
        </motion.div>
      </div>
    </Section>
  );
}
