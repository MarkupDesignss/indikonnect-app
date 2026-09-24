"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";

import {
  easeIn,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  Accent,
  Display,
  Eyebrow,
  Section,
} from "../../design-system";

import { scrub } from "../../design-system/motion";
import styles from "./Craft.module.css";

import { useGetLandingPageQuery } from "@/lib/redux/api/Landing/landingPageApi";

export function Craft() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { data: landingData } =
    useGetLandingPageQuery();


  const chapterFourPage =
    landingData?.data?.find(
      (item: any) =>
        item?.slug === "chapter-four"
    );


  const chapterFourBlock =
    chapterFourPage?.blocks?.find(
      (block: any) =>
        block?.sort_order === 0
    );


  const chapterHeading =
    chapterFourBlock?.heading?.trim() ||
    "Chapter Four · The Standard";

  const chapterShortDescription =
    chapterFourBlock?.short_description?.trim() ||
    "Made to be kept";

  const chapterDescription =
    chapterFourBlock?.description?.trim() ||
    "Watches drawn from heritage horology. Jewellery that reflects individuality. Skincare built on performance, not promises. Dining pieces that bring elegance to the modern Indian home. Four categories, one standard.";

  /* =========================================================
     DYNAMIC IMAGE
  ========================================================== */

  const chapterImage = useMemo(() => {
    const images =
      chapterFourBlock?.images || [];

    const primaryImage =
      images.find(
        (image: any) =>
          image?.is_primary === true &&
          image?.url
      );

    return (
      primaryImage?.url ||
      images.find(
        (image: any) =>
          image?.url
      )?.url ||
      "/indiekonnect-web/images/chapter-bg-4.jpg"
    );
  }, [chapterFourBlock]);

  /* =========================================================
     SCROLL ANIMATION
  ========================================================== */

  const { scrollYProgress } =
    useScroll({
      target: ref,
      offset: [
        "start start",
        "end end",
      ],
    });

  const p = useSpring(
    scrollYProgress,
    scrub.s08
  );

  /*
   * power1.in on the zoom,
   * so the frame accelerates
   * into full bleed.
   */
  const scale = useTransform(
    p,
    [0, 1],
    [1, 9.5],
    {
      ease: easeIn,
    }
  );

  const radius = useTransform(
    p,
    [0, 1],
    [6, 0]
  );

  const imgScale = useTransform(
    p,
    [0, 1],
    [1.25, 1]
  );

  const scrimOpacity =
    useTransform(
      p,
      [0.5, 0.85],
      [0, 1]
    );

  const copyOpacity =
    useTransform(
      p,
      [0.55, 0.95],
      [0, 1]
    );

  const copyY = useTransform(
    p,
    [0.55, 0.95],
    [46, 0]
  );

  const copyScale =
    useTransform(
      p,
      [0.55, 0.95],
      [0.96, 1]
    );

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <Section
      id="lifestyle"
      label="Our standard of craft"
      className={styles.craft}
      ref={ref}
      style={
        reduced
          ? {
              height: "auto",
              paddingBlock:
                "var(--space-7)",
            }
          : undefined
      }
    >
      <div
        className={styles.pin}
        style={
          reduced
            ? {
                position: "static",
                height: "auto",
              }
            : undefined
        }
      >
        {/* =====================================================
            IMAGE FRAME
        ====================================================== */}

        <motion.figure
          className={styles.frame}
          style={
            reduced
              ? {
                  borderRadius: 6,
                }
              : {
                  scale,
                  borderRadius:
                    radius,
                }
          }
        >
          <motion.div
            className={
              styles.frameInner
            }
            style={
              reduced
                ? undefined
                : {
                    scale: imgScale,
                  }
            }
          >
            <Image
              src={chapterImage}
              alt={
                chapterFourBlock
                  ?.images?.find(
                    (image: any) =>
                      image?.is_primary ===
                      true
                  )?.alt_text ||
                "Chapter Four"
              }
              fill
              sizes="100vw"
            />
          </motion.div>
        </motion.figure>

        {/* =====================================================
            SCRIM
        ====================================================== */}

        <motion.div
          className={styles.scrim}
          style={{
            opacity: reduced
              ? 1
              : scrimOpacity,
          }}
        />

        {/* =====================================================
            DYNAMIC CONTENT
        ====================================================== */}

        <motion.div
          className={styles.copy}
          style={
            reduced
              ? {
                  opacity: 1,
                }
              : {
                  opacity:
                    copyOpacity,
                  y: copyY,
                  scale: copyScale,
                }
          }
        >
          {/* Dynamic Chapter Heading */}
          <Eyebrow center>
            {chapterHeading}
          </Eyebrow>

          {/* Dynamic Short Description */}
          <Display
            size="xl"
            style={{
              marginTop: 20,
            }}
          >
            {chapterShortDescription
              .split(/\s+/)
              .map(
                (
                  word: string,
                  index: number,
                  words: string[]
                ) => {
                  const isLast =
                    index ===
                    words.length - 1;

                  return (
                    <span
                      key={`${word}-${index}`}
                    >
                      {isLast ? (
                        <Accent>
                          {word}
                        </Accent>
                      ) : (
                        word
                      )}

                      {!isLast
                        ? " "
                        : ""}
                    </span>
                  );
                }
              )}
          </Display>

          {/* Dynamic Description */}
          <p>
            {chapterDescription}
          </p>
        </motion.div>
      </div>
    </Section>
  );
}