"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  ArrowIcon,
  Button,
  Display,
  Lede,
  Section,
  cx,
} from "../../design-system";

import { ease, scrub } from "../../design-system/motion";
import { U } from "../../../../data/site";
import styles from "./Hero.module.css";

import { useGetLandingPageQuery } from "@/lib/redux/api/Landing/landingPageApi";

const T = {
  chars: 0,
  kicker: 0,
  lede: 0.4,
  actions: 0.5,
  portrait: 0.4,
  cue: 1.2,
};

export function Hero({ start }: { start: boolean }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { data: landingData } = useGetLandingPageQuery();

  const heroPage = landingData?.data?.find(
    (item: any) => item?.slug === "hero-section"
  );

  const heroBlock = heroPage?.blocks?.find(
    (block: any) => block?.sort_order === 0
  );

  const heroHeading =
    heroBlock?.heading?.trim() || "Art of Opportunity";

  const heroDescription =
    heroBlock?.description?.trim() ||
    "A modern Indian movement built on Connection, Opportunity, Growth and Trust, where the spirit of 1.4 billion meets the power of entrepreneurship.";

  const headingWords = heroHeading
    .split(/\s+/)
    .filter(Boolean);

  const headingLines =
    headingWords.length > 1
      ? [
          {
            text: headingWords.slice(0, -1).join(" "),
            italic: false,
          },
          {
            text: headingWords[headingWords.length - 1],
            italic: true,
          },
        ]
      : [
          {
            text: heroHeading,
            italic: false,
          },
        ];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const p = useSpring(scrollYProgress, scrub.s06);

  const bgY = useTransform(
    p,
    [0, 1],
    ["0%", "22%"]
  );

  const bgScale = useTransform(
    p,
    [0, 1],
    [1, 1.12]
  );

  const inY = useTransform(
    p,
    [0, 1],
    ["0%", "-28%"]
  );

  const inOpacity = useTransform(
    p,
    [0, 1],
    [1, 0.25]
  );

  const cueOpacity = useTransform(
    p,
    [0, 0.6],
    [1, 0]
  );

  const go = reduced ? true : start;

  let charIndex = -1;

  return (
    <Section
      id="hero"
      label="Introduction"
      className={styles.hero}
      ref={ref}
    >
      {/* Background */}
      <motion.div
        className={cx(styles.layer, styles.bg)}
        style={{
          y: bgY,
          scale: bgScale,
        }}
      >
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

      {/* Hero Content */}
      <motion.div
        className={styles.in}
        style={{
          y: inY,
          opacity: inOpacity,
        }}
      >
        <div>
          {/* Dynamic Heading */}
          <Display
            as="h1"
            size="xxl"
            className={styles.h1}
          >
            {headingLines.map((line, lineIndex) => (
              <span
                key={`${line.text}-${lineIndex}`}
                className={styles.line}
              >
                {line.text.split("").map((char, i) => {
                  charIndex += 1;

                  const delay =
                    T.chars + charIndex * 0.022;

                  return (
                    <motion.span
                      key={`${line.text}-${i}`}
                      className={styles.ch}
                      style={
                        line.italic
                          ? {
                              fontStyle: "italic",
                              color: "var(--gold)",
                              fontVariationSettings:
                                "'SOFT' 40, 'WONK' 1, 'opsz' 144",
                            }
                          : undefined
                      }
                      initial={{
                        y: "118%",
                        opacity: 0,
                      }}
                      animate={
                        go
                          ? {
                              y: "0%",
                              opacity: 1,
                            }
                          : undefined
                      }
                      transition={{
                        duration: 1.1,
                        ease: ease.expoOut,
                        delay,
                      }}
                    >
                      {char === " "
                        ? "\u00A0"
                        : char}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </Display>

          {/* Dynamic Description */}
          <motion.div
            initial={{
              y: 34,
              opacity: 0,
            }}
            animate={
              go
                ? {
                    y: 0,
                    opacity: 1,
                  }
                : undefined
            }
            transition={{
              duration: 0.9,
              ease: ease.power3Out,
              delay: T.lede,
            }}
          >
            <Lede className={styles.lede}>
              {heroDescription}
            </Lede>
          </motion.div>

          {/* Shop Button */}
          <motion.div
            className={styles.actions}
            initial={{
              y: 34,
              opacity: 0,
            }}
            animate={
              go
                ? {
                    y: 0,
                    opacity: 1,
                  }
                : undefined
            }
            transition={{
              duration: 0.9,
              ease: ease.power3Out,
              delay: T.actions,
            }}
          >
            <Link
              href="/products/"
              className="inline-flex"
            >
              <Button
                className="cursor-pointer"
                variant="gold"
              >
                Shop the Collections
                <ArrowIcon />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Cue */}
      <motion.div
        className={styles.cue}
        style={{
          opacity: cueOpacity,
        }}
        initial={{
          opacity: 0,
        }}
        animate={
          go
            ? {
                opacity: 1,
              }
            : undefined
        }
        transition={{
          duration: 0.6,
          delay: T.cue,
        }}
      >
        <i></i>
        Scroll
      </motion.div>
    </Section>
  );
}