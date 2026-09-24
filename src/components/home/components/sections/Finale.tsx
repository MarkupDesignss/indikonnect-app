"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  Accent,
  ArrowIcon,
  Button,
  Display,
  Eyebrow,
  Lede,
  Reveal,
  Section,
} from "../../design-system";

import { scrub } from "../../design-system/motion";
import styles from "./Finale.module.css";

import { useGetLandingPageQuery } from "@/lib/redux/api/Landing/landingPageApi";

export function Finale() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* =========================================================
     LANDING PAGE API
  ========================================================== */

  const { data: landingData } =
    useGetLandingPageQuery();

  /* =========================================================
     FIND CHAPTER EIGHT BY SLUG
  ========================================================== */

  const chapterEightPage =
    landingData?.data?.find(
      (item: any) =>
        item?.slug === "chapter-eight"
    );

  /* =========================================================
     GET FIRST BLOCK
  ========================================================== */

  const chapterEightBlock =
    chapterEightPage?.blocks?.find(
      (block: any) =>
        block?.sort_order === 0
    );

  /* =========================================================
     DYNAMIC CONTENT
  ========================================================== */

  const chapterHeading =
    chapterEightBlock?.heading?.trim() ||
    "Chapter Eight · The Invitation";

  const chapterShortDescription =
    chapterEightBlock?.short_description?.trim() ||
    "Where people & possibilities\nconnect";

  const chapterDescription =
    chapterEightBlock?.description?.trim() ||
    "Whether you are here for premium products that lift your everyday, or a professional opportunity that changes your financial future, this is where India rises together.";

  /* =========================================================
     DYNAMIC IMAGE
  ========================================================== */

  const chapterImage = useMemo(() => {
    const images =
      chapterEightBlock?.images || [];

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
      "/indiekonnect-web/images/chapter-bg-8.jpg"
    );
  }, [chapterEightBlock]);

  const imageAlt =
    chapterEightBlock?.images?.find(
      (image: any) =>
        image?.is_primary === true
    )?.alt_text ||
    "Chapter Eight";

  /* =========================================================
     HEADING
     
     "Where people & possibilities
      connect"
     
     Last line/word gets Accent styling.
  ========================================================== */

  const shortDescriptionLines =
    chapterShortDescription.split(
      /\r?\n/
    );

  const renderHeading = () => {
    if (
      shortDescriptionLines.length > 1
    ) {
      return (
        <>
          {shortDescriptionLines[0]}
          <br />

          <Accent>
            {shortDescriptionLines
              .slice(1)
              .join(" ")
              .trim()}
          </Accent>
        </>
      );
    }

    const words =
      chapterShortDescription
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
      return null;
    }

    const lastWord =
      words[words.length - 1];

    return (
      <>
        {words
          .slice(0, -1)
          .join(" ")}{" "}
        <Accent>
          {lastWord}
        </Accent>
      </>
    );
  };

  /* =========================================================
     BACKGROUND SCROLL ANIMATION
  ========================================================== */

  const {
    scrollYProgress: pass,
  } = useScroll({
    target: ref,
    offset: [
      "start end",
      "end start",
    ],
  });

  const p = useSpring(
    pass,
    scrub.s08
  );

  const bgScale = useTransform(
    p,
    [0, 1],
    [1.35, 1]
  );

  const bgY = useTransform(
    p,
    [0, 1],
    ["-8%", "8%"]
  );

  /* =========================================================
     COPY ENTRANCE ANIMATION
  ========================================================== */

  const {
    scrollYProgress: enter,
  } = useScroll({
    target: ref,
    offset: [
      "start 0.6",
      "center center",
    ],
  });

  const e = useSpring(
    enter,
    scrub.s06
  );

  const inScale = useTransform(
    e,
    [0, 1],
    [0.94, 1]
  );

  const inOpacity = useTransform(
    e,
    [0, 1],
    [0.5, 1]
  );

  return (
    <Section
      id="join"
      label="Join the movement"
      className={styles.finale}
      ref={ref}
    >
      <div className={styles.pin}>

        {/* =====================================================
            BACKGROUND IMAGE
        ====================================================== */}

        <motion.div
          className={styles.bg}
          style={
            reduced
              ? undefined
              : {
                  scale: bgScale,
                  y: bgY,
                }
          }
        >
          <Image
            src={chapterImage}
            alt={imageAlt}
            fill
            sizes="100vw"
          />
        </motion.div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <motion.div
          className={styles.in}
          style={
            reduced
              ? undefined
              : {
                  scale: inScale,
                  opacity: inOpacity,
                }
          }
        >
          {/* Dynamic Chapter Heading */}
          <Reveal as="p">
            <Eyebrow center>
              {chapterHeading}
            </Eyebrow>
          </Reveal>

          {/* Dynamic Short Description */}
          <Reveal
            as="div"
            delay={0.08}
          >
            <Display
              size="xl"
              style={{
                marginTop: 22,
              }}
            >
              {renderHeading()}
            </Display>
          </Reveal>

          {/* Dynamic Description */}
          <Reveal
            as="div"
            delay={0.16}
          >
            <Lede
              className={
                styles.lede
              }
            >
              {chapterDescription}
            </Lede>
          </Reveal>

          {/* Actions */}
          <Reveal
            as="div"
            delay={0.24}
            className={
              styles.actions
            }
          >
            <Button
              href="#join"
              variant="gold"
            >
              Become a Distributor
              <ArrowIcon />
            </Button>

            <Button
              href="#collections"
              variant="ghost"
            >
              Shop the Collection
            </Button>
          </Reveal>
        </motion.div>
      </div>
    </Section>
  );
}