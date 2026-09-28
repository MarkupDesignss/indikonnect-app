
"use client";

import { useMemo, useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  Accent,
  Display,
  Eyebrow,
  Lede,
  Reveal,
  Section,
  Wrap,
  cx,
} from "../../design-system";

import { ease, scrub } from "../../design-system/motion";
import styles from "./TheName.module.css";

import { useGetLandingPageQuery } from "@/lib/redux/api/Landing/landingPageApi";

export function TheName() {
  const reduced = useReducedMotion();

  const gridRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLParagraphElement>(null);

  const lockupSeen = useInView(lockupRef, {
    once: true,
    margin: "0px 0px -15% 0px",
  });

  /* =========================================================
     LANDING PAGE API
  ========================================================= */

  const { data: landingData, isLoading } =
    useGetLandingPageQuery();

  /* =========================================================
     CHAPTER TWO DATA
  ========================================================= */

  const chapterTwoBlocks = useMemo(() => {
    const chapterTwoPage = landingData?.data?.find(
      (item: any) =>
        item?.slug === "chapter-two" ||
        item?.title === "Chapter Two"
    );

    const blocks = chapterTwoPage?.blocks || [];

    return {
      intro:
        blocks.find(
          (block: any) =>
            block?.sort_order === 0
        ) || null,

      partOne:
        blocks.find(
          (block: any) =>
            block?.sort_order === 1
        ) || null,

      partTwo:
        blocks.find(
          (block: any) =>
            block?.sort_order === 2
        ) || null,

      identity:
        blocks.find(
          (block: any) =>
            block?.sort_order === 3
        ) || null,
    };
  }, [landingData]);

  /* =========================================================
     DYNAMIC CONTENT
  ========================================================= */

  const chapterHeading =
    chapterTwoBlocks.intro?.heading?.trim() ||
    "Chapter Two · The Meaning";

  const introTitle =
    chapterTwoBlocks.intro?.short_description?.trim() ||
    "So we built a doorway, and gave it a name.";

  const introDescription =
    chapterTwoBlocks.intro?.description?.trim() ||
    "Two ideas, one identity. The independent spirit of India, bridged to the aspirations of every entrepreneur who dares to rise.";

  const partOneRole =
    chapterTwoBlocks.partOne?.heading?.trim() ||
    "Part One";

  const partOneWord =
    chapterTwoBlocks.partOne?.short_description?.trim() ||
    "Indie";

  const partOneDescription =
    chapterTwoBlocks.partOne?.description?.trim() ||
    "The independent spirit of India. Its culture, its people, and an ambition that has never asked permission to exist.";

  const partTwoRole =
    chapterTwoBlocks.partTwo?.heading?.trim() ||
    "Part Two";

  const partTwoWord =
    chapterTwoBlocks.partTwo?.short_description?.trim() ||
    "Konnect";

  const partTwoDescription =
    chapterTwoBlocks.partTwo?.description?.trim() ||
    "The bridge of opportunity. Our mission to close the distance between world-class products and the aspiring Indian entrepreneur.";

  const identityTitle =
    chapterTwoBlocks.identity?.heading?.trim() ||
    "INDIEKONNECT";

  const identityDescription =
    chapterTwoBlocks.identity?.description?.trim() ||
    "The brand is the identity. An institution built not around individuals, but a collective vision of excellence.";

  /* =========================================================
     LOCKUP
  ========================================================= */

  const lockup = useMemo(() => {
    return identityTitle.split("");
  }, [identityTitle]);

  /* =========================================================
     SCROLL ANIMATION
  ========================================================= */

  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start 0.78", "start 0.28"],
  });

  const p = useSpring(
    scrollYProgress,
    scrub.s09
  );

  const leftRotate = useTransform(
    p,
    [0, 1],
    [-72, 0]
  );

  const leftX = useTransform(
    p,
    [0, 1],
    ["-14%", "0%"]
  );

  const rightRotate = useTransform(
    p,
    [0, 1],
    [72, 0]
  );

  const rightX = useTransform(
    p,
    [0, 1],
    ["14%", "0%"]
  );

  const cardOpacity = useTransform(
    p,
    [0, 1],
    [0, 1]
  );

  const joinScale = useTransform(
    p,
    [0.25, 1],
    [0, 1]
  );

  const joinRotate = useTransform(
    p,
    [0.25, 1],
    [-140, 0]
  );

  return (
    <Section
      id="name"
      surface="light"
      label="The meaning of the name"
      className={styles.name}
    >
      <Wrap>
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className={styles.head}>
          <Reveal as="p">
            <Eyebrow>
              {chapterHeading}
            </Eyebrow>
          </Reveal>

          <Reveal
            as="div"
            delay={0.08}
          >
            <Display
              size="lg"
              style={{
                marginTop: 20,
              }}
            >
              So we built a{" "}
              <Accent>
                doorway
              </Accent>
              , and gave it a name.
            </Display>
          </Reveal>

          <Reveal
            as="div"
            delay={0.16}
          >
            <Lede
              style={{
                marginTop: 20,
              }}
            >
              {introDescription}
            </Lede>
          </Reveal>
        </div>

        {/* =====================================================
            CONTENT GRID
        ====================================================== */}

        <div
          className={styles.grid}
          ref={gridRef}
        >
          {/* ===================================================
              PART ONE
          ==================================================== */}

          <motion.article
            className={styles.card}
            style={
              reduced
                ? undefined
                : {
                    rotateY: leftRotate,
                    x: leftX,
                    opacity: cardOpacity,
                    transformOrigin:
                      "right center",
                  }
            }
          >
            <div>
              <p className={styles.role}>
                {partOneRole}
              </p>

              <p
                className={styles.word}
                style={{
                  fontWeight: 700,
                }}
              >
                {partOneWord}
              </p>
            </div>

            <p>
              {partOneDescription}
            </p>
          </motion.article>

          {/* ===================================================
              JOIN ICON
          ==================================================== */}

          <motion.div
            className={styles.join}
            aria-hidden="true"
            style={
              reduced
                ? undefined
                : {
                    scale: joinScale,
                    rotate: joinRotate,
                  }
            }
          >
            &#10022;
          </motion.div>

          {/* ===================================================
              PART TWO
          ==================================================== */}

          <motion.article
            className={cx(
              styles.card,
              styles.alt
            )}
            style={
              reduced
                ? undefined
                : {
                    rotateY: rightRotate,
                    x: rightX,
                    opacity: cardOpacity,
                    transformOrigin:
                      "left center",
                  }
            }
          >
            <div>
              <p
                className={styles.role}
                style={{
                  fontWeight: 700,
                }}
              >
                {partTwoRole}
              </p>

              <p
                className={styles.word}
                style={{
                  fontWeight: 700,
                }}
              >
                {partTwoWord}
              </p>
            </div>

            <p>
              {partTwoDescription}
            </p>
          </motion.article>
        </div>

        {/* =====================================================
            BRAND LOCKUP
        ====================================================== */}

        <p
          className={styles.lockup}
          ref={lockupRef}
          aria-label={identityTitle}
        >
          {lockup.map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              className={cx(
                styles.lk,
                i === 5 &&
                  styles.lkGold
              )}
              initial={
                reduced
                  ? undefined
                  : {
                      y: "100%",
                      opacity: 0,
                      rotateX: -80,
                    }
              }
              animate={
                lockupSeen || reduced
                  ? {
                      y: "0%",
                      opacity: 1,
                      rotateX: 0,
                    }
                  : undefined
              }
              transition={{
                duration: 0.85,
                ease: ease.expoOut,
                delay: i * 0.045,
              }}
            >
              {char}
            </motion.span>
          ))}
        </p>

        {/* =====================================================
            FINAL DESCRIPTION
        ====================================================== */}

        <Reveal
          as="p"
          className={styles.quote}
        >
          {identityDescription}
        </Reveal>

        {/* =====================================================
            OPTIONAL LOADING STATE
        ====================================================== */}

        {isLoading && (
          <span
            style={{
              display: "none",
            }}
          >
            Loading...
          </span>
        )}
      </Wrap>
    </Section>
  );
}
