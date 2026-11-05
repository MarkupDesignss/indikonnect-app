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

/* =========================================================
   HELPERS
========================================================= */

/**
 * HTML tags + entities strip karke plain text nikalta hai.
 * short_description / heading ke liye use karo.
 */
function stripHtml(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "")       // remove tags
    .replace(/&nbsp;/gi, " ")      // non-breaking spaces
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")          // collapse whitespace
    .trim();
}

/**
 * Description HTML ko clean karta hai:
 * - &nbsp; ko normal space mein badalta hai
 * - extra spaces collapse karta hai
 * - content ko <p> tags ke andar preserve karta hai
 */
function cleanHtml(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function Craft() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { data: landingData } = useGetLandingPageQuery();

  /* =========================================================
     DATA EXTRACTION — Chapter Five
  ========================================================== */

  const chapterFivePage = landingData?.data?.find(
    (item: any) => item?.slug === "chapter-five"
  );

  const chapterFiveBlock = chapterFivePage?.blocks?.find(
    (block: any) => block?.sort_order === 0
  );

  /* Heading — plain text */
  const chapterHeading =
    stripHtml(chapterFiveBlock?.heading) ||
    "Chapter Five · The Foundations";

  /* Short description — plain text (last word Accent hoga) */
  const chapterShortDescription =
    stripHtml(chapterFiveBlock?.short_description) ||
    "Values you can trust";

  /* Description — HTML allowed (paragraphs render honge) */
  const chapterDescriptionHtml = cleanHtml(
    chapterFiveBlock?.description
  );

  const chapterDescriptionFallback =
    "The IndieKonnect ecosystem runs on a people-first philosophy. Our house colours are not decoration, they are a commitment.";

  const finalDescriptionHtml =
    chapterDescriptionHtml || chapterDescriptionFallback;

  /* =========================================================
     DYNAMIC IMAGE
  ========================================================== */

  const chapterImage = useMemo(() => {
    const images = chapterFiveBlock?.images || [];

    const primaryImage = images.find(
      (image: any) => image?.is_primary === true && image?.url
    );

    return (
      primaryImage?.url ||
      images.find((image: any) => image?.url)?.url ||
      "/indiekonnect-web/images/chapter-bg-5.jpg"
    );
  }, [chapterFiveBlock]);

  const chapterImageAlt =
    chapterFiveBlock?.images?.find(
      (image: any) => image?.is_primary === true
    )?.alt_text || chapterHeading;

  /* =========================================================
     SCROLL ANIMATION
  ========================================================== */

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const p = useSpring(scrollYProgress, scrub.s08);

  const scale = useTransform(p, [0, 1], [1, 9.5], { ease: easeIn });
  const radius = useTransform(p, [0, 1], [6, 0]);
  const imgScale = useTransform(p, [0, 1], [1.25, 1]);
  const scrimOpacity = useTransform(p, [0.5, 0.85], [0, 1]);
  const copyOpacity = useTransform(p, [0.55, 0.95], [0, 1]);
  const copyY = useTransform(p, [0.55, 0.95], [46, 0]);
  const copyScale = useTransform(p, [0.55, 0.95], [0.96, 1]);

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
          ? { height: "auto", paddingBlock: "var(--space-7)" }
          : undefined
      }
    >
      <div
        className={styles.pin}
        style={
          reduced
            ? { position: "static", height: "auto" }
            : undefined
        }
      >
        {/* ===== IMAGE FRAME ===== */}
        <motion.figure
          className={styles.frame}
          style={
            reduced
              ? { borderRadius: 6 }
              : { scale, borderRadius: radius }
          }
        >
          <motion.div
            className={styles.frameInner}
            style={reduced ? undefined : { scale: imgScale }}
          >
            <Image
              src={chapterImage}
              alt={chapterImageAlt}
              fill
              sizes="100vw"
            />
          </motion.div>
        </motion.figure>

        {/* ===== SCRIM ===== */}
        <motion.div
          className={styles.scrim}
          style={{ opacity: reduced ? 1 : scrimOpacity }}
        />

        {/* ===== DYNAMIC CONTENT ===== */}
        <motion.div
          className={styles.copy}
          style={
            reduced
              ? { opacity: 1 }
              : { opacity: copyOpacity, y: copyY, scale: copyScale }
          }
        >
          {/* Heading — plain text */}
          <Eyebrow center>{chapterHeading}</Eyebrow>

          {/* Short description — last word Accent */}
          <Display size="xl" style={{ marginTop: 20 }}>
            {chapterShortDescription
              .split(/\s+/)
              .map((word: string, index: number, words: string[]) => {
                const isLast = index === words.length - 1;
                return (
                  <span key={`${word}-${index}`}>
                    {isLast ? <Accent>{word}</Accent> : word}
                    {!isLast ? " " : ""}
                  </span>
                );
              })}
          </Display>

          {/* ✅ Description — HTML render via dangerouslySetInnerHTML */}
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: finalDescriptionHtml }}
          />
        </motion.div>
      </div>
    </Section>
  );
}