"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue
} from "framer-motion";
import { Accent, ArrowIcon, Button, Display, Eyebrow, Section, cx } from "../../design-system";
import { scrub } from "../../design-system/motion";
import { U, ghostWords, products, type Product } from "../../../../data/site";
import styles from "./Collections.module.css";

const TIER_CLASS = { l: styles.tierL, m: styles.tierM, s: styles.tierS };
/** Smaller tiers travel further, so the staggered baseline reads with depth. */
const TIER_DEPTH = { l: 4, m: 7, s: 10 };

export function Collections() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);

  const [distance, setDistance] = useState(0);
  const [extra, setExtra] = useState(0);
  const [active, setActive] = useState(0);

  /**
   * --edge is a clamp() on :root, so it only resolves to px once applied.
   * Read it off the track's own computed padding, and re-read it on every
   * pass: caching it would carry a stale value across a resize.
   * Without trailing room the track runs out of travel before the last
   * cards reach the focus line, so they could never take focus.
   */
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const base = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    track.style.paddingRight = base + "px";

    const cards = cardsRef.current.filter(Boolean) as HTMLElement[];
    if (cards.length) {
      const last = cards[cards.length - 1];
      const trackLeft = track.getBoundingClientRect().left;
      const r = last.getBoundingClientRect();
      const lastCentre = r.left + r.width / 2 - trackLeft;
      const trailing = track.scrollWidth - lastCentre;
      const need = window.innerWidth * 0.66 - trailing;
      if (need > 0) track.style.paddingRight = base + need + "px";
    }

    const pad = parseFloat(getComputedStyle(track).paddingRight) || 0;
    const d = Math.max(0, track.scrollWidth - window.innerWidth + pad);
    setDistance(d);
    setExtra(d + window.innerHeight * 0.5);
  }, []);

  useEffect(() => {
    if (reduced) return;
    measure();
    window.addEventListener("resize", measure);
    if (document.fonts && document.fonts.ready) void document.fonts.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, reduced]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, scrub.s07);
  const x = useTransform(p, [0, 1], [0, -distance]);

  /**
   * The piece nearest the reading line (a third in from the left, where the
   * eye lands first) carries the section's focus: it comes up to full colour,
   * names its category in the readout, and lights the ghost word.
   */
  const syncFocus = useCallback(() => {
    const line = window.innerWidth * 0.34;
    let best = 0;
    let bestD = Infinity;
    cardsRef.current.forEach((c, i) => {
      if (!c) return;
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - line);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive((prev) => (prev === best ? prev : best));
  }, []);

  useMotionValueEvent(x, "change", syncFocus);
  useEffect(() => {
    if (!reduced) syncFocus();
  }, [distance, reduced, syncFocus]);

  const current = products[active] ?? products[0];

  return (
    <Section
      id="collections"
      label="Product collections"
      className={styles.gallery}
      ref={sectionRef}
      style={reduced ? undefined : { height: "calc(100svh + " + extra + "px)" }}
    >
      <div className={styles.pin}>
        <div className={styles.ghost} aria-hidden="true">
          {ghostWords.map((g) => (
            <span key={g.word} className={cx(g.category === current.category && styles.on)}>
              {g.word}
            </span>
          ))}
        </div>

        <div className={styles.head}>
          <div>
            <Eyebrow>Chapter Three &middot; The Collections</Eyebrow>
            <Display size="lg" style={{ marginTop: 16 }}>
              Curated for the <Accent>discerning</Accent>
            </Display>
          </div>
          <p className={styles.hint}>
            <i></i>Keep scrolling
          </p>
        </div>

        <div className={styles.stage}>
          <motion.div
            className={cx(styles.track, reduced && styles.staticTrack)}
            ref={trackRef}
            style={reduced ? undefined : { x }}
          >
            {products.map((product, i) => (
              <Card
                key={product.num}
                product={product}
                progress={p}
                active={!reduced && i === active}
                reduced={Boolean(reduced)}
                register={(el) => {
                  cardsRef.current[i] = el;
                }}
              />
            ))}

            <div className={styles.end}>
              <Eyebrow>The full range</Eyebrow>
              <p>
                Four categories,
                <br />
                one standard.
              </p>
              <Button href="#collections" variant="gold">
                View all collections
                <ArrowIcon />
              </Button>
            </div>
          </motion.div>
        </div>

        <div className={styles.foot}>
          <span className={styles.idx}>
            <b>{String(active + 1).padStart(2, "0")}</b> / 06
          </span>
          <span className={styles.now}>{current.category}</span>
          <span className={styles.rail}>
            <motion.i style={{ scaleX: reduced ? 1 : p }} />
          </span>
        </div>
      </div>
    </Section>
  );
}

function Card({
  product,
  progress,
  active,
  reduced,
  register
}: {
  product: Product;
  progress: MotionValue<number>;
  active: boolean;
  reduced: boolean;
  register: (el: HTMLElement | null) => void;
}) {
  const depth = TIER_DEPTH[product.tier];
  const y = useTransform(progress, [0, 1], [-depth + "%", depth * 0.7 + "%"]);

  return (
    <article ref={register} className={cx(styles.card, TIER_CLASS[product.tier], active && styles.active)}>
      <div className={styles.media}>
        <motion.div className={styles.mediaShift} style={reduced ? undefined : { y }}>
          <Image src={U(product.image, 900)} alt={product.alt} fill sizes="(max-width: 760px) 60vw, 30vw" />
        </motion.div>
      </div>
      <span className={styles.num}>{product.num}</span>
      {product.badge ? <span className={styles.badge}>{product.badge}</span> : null}
      <div className={styles.cap}>
        <p className={styles.cat}>{product.category}</p>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.meta}>
          <span className={styles.price}>{product.price}</span>
          {product.shop ? (
            <a href="#collections" className={styles.shop}>
              Shop
              <ArrowIcon size={13} strokeWidth={2.2} />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
