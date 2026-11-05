"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef } from "react";
import DOMPurify from "dompurify";

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

/* =========================================================
   HTML ENTITY DECODER + STRIP TAGS (plain text fields ke liye)
   - <p>...</p>, <br> remove
   - &nbsp; &amp; etc decode
   - multi-line preserve karo (newline from </p><p> or <br>)
========================================================= */
const stripAndDecode = (text: string): string => {
  if (!text) return "";

  let cleaned = text;

  // convert paragraph breaks & br to newline
  cleaned = cleaned
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<\/?p[^>]*>/gi, "");

  // remove any remaining tags
  cleaned = cleaned.replace(/<[^>]*>/g, "");

  // decode entities
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const txt = document.createElement("textarea");
    txt.innerHTML = cleaned;
    cleaned = txt.value;
  } else {
    cleaned = cleaned
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  // collapse spaces but keep newlines
  return cleaned
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
};

/* =========================================================
   SANITIZER (rich HTML fields like <p>...</p>)
   - safe tags allow
   - &nbsp; ko normal space me convert
========================================================= */
const sanitizeHtml = (html: string): string => {
  if (!html) return "";

  // SSR fallback — strip tags, plain text with line breaks
  if (typeof window === "undefined") {
    const plain = stripAndDecode(html);
    return plain
      .split("\n")
      .map((line) => `<p>${line}</p>`)
      .join("");
  }

  const cleaned = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "a",
      "ul",
      "ol",
      "li",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  // &nbsp; → normal space (extra gap avoid)
  return cleaned.replace(/&nbsp;/g, " ");
};

export function Finale() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* =========================================================
     LANDING PAGE API
  ========================================================== */

  const { data: landingData } = useGetLandingPageQuery();

  /* =========================================================
     FIND CHAPTER EIGHT BY SLUG
  ========================================================== */

  const chapterEightPage = landingData?.data?.find(
    (item: any) => item?.slug === "chapter-eight"
  );

  /* =========================================================
     GET FIRST BLOCK
  ========================================================== */

  const chapterEightBlock = chapterEightPage?.blocks?.find(
    (block: any) => block?.sort_order === 0
  );

  /* =========================================================
     DYNAMIC CONTENT
  ========================================================== */

  const chapterHeading =
    stripAndDecode(chapterEightBlock?.heading || "") ||
    "Chapter Eight · The Invitation";

  const chapterShortDescription =
    stripAndDecode(chapterEightBlock?.short_description || "") ||
    "Where people & possibilities\nconnect";

  // Description — sanitized HTML, render via dangerouslySetInnerHTML
  const chapterDescriptionHtml = sanitizeHtml(
    chapterEightBlock?.description ||
      "<p>Whether you are here for premium products that lift your everyday, or a professional opportunity that changes your financial future, this is where India rises together.</p>"
  );

  /* =========================================================
     DYNAMIC IMAGE
  ========================================================== */

  const chapterImage = useMemo(() => {
    const images = chapterEightBlock?.images || [];

    const primaryImage = images.find(
      (image: any) => image?.is_primary === true && image?.url
    );

    return (
      primaryImage?.url ||
      images.find((image: any) => image?.url)?.url ||
      "/indiekonnect-web/images/chapter-bg-8.jpg"
    );
  }, [chapterEightBlock]);

  const imageAlt =
    chapterEightBlock?.images?.find(
      (image: any) => image?.is_primary === true
    )?.alt_text || "Chapter Eight";

  /* =========================================================
     HEADING

     "Where people & possibilities
      connect"

     Last line/word gets Accent styling.
  ========================================================== */

  const shortDescriptionLines = chapterShortDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const renderHeading = () => {
    /* ---------- MULTI-LINE CASE ---------- */
    if (shortDescriptionLines.length > 1) {
      return (
        <span className="flex flex-col gap-1 sm:gap-1.5 md:gap-2">
          <span className="block">{shortDescriptionLines[0]}</span>

          <span className="block">
            <Accent>
              {shortDescriptionLines.slice(1).join(" ").trim()}
            </Accent>
          </span>
        </span>
      );
    }

    /* ---------- SINGLE-LINE CASE ---------- */
    const words = (shortDescriptionLines[0] || "")
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return null;

    const lastWord = words[words.length - 1];

    return (
      <>
        {words.slice(0, -1).join(" ")}{" "}
        <Accent>{lastWord}</Accent>
      </>
    );
  };

  /* =========================================================
     BACKGROUND SCROLL ANIMATION
  ========================================================== */

  const { scrollYProgress: pass } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const p = useSpring(pass, scrub.s08);

  const bgScale = useTransform(p, [0, 1], [1.35, 1]);
  const bgY = useTransform(p, [0, 1], ["-8%", "8%"]);

  /* =========================================================
     COPY ENTRANCE ANIMATION
  ========================================================== */

  const { scrollYProgress: enter } = useScroll({
    target: ref,
    offset: ["start 0.6", "center center"],
  });

  const e = useSpring(enter, scrub.s06);

  const inScale = useTransform(e, [0, 1], [0.94, 1]);
  const inOpacity = useTransform(e, [0, 1], [0.5, 1]);

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
            <Eyebrow center>{chapterHeading}</Eyebrow>
          </Reveal>

          {/* Dynamic Short Description */}
          <Reveal as="div" delay={0.08}>
            <Display
              size="xl"
              style={{
                marginTop: 22,
                lineHeight: 1.15,
              }}
            >
              {renderHeading()}
            </Display>
          </Reveal>

          {/* Dynamic Description — HTML sanitized */}
          <Reveal as="div" delay={0.16}>
            <Lede as="div" className={styles.lede}>
              <div
                dangerouslySetInnerHTML={{ __html: chapterDescriptionHtml }}
              />
            </Lede>
          </Reveal>

          {/* Actions */}
          <Reveal as="div" delay={0.24} className={styles.actions}>
            <Link href="/auth/distributor/login">
              <Button variant="gold">
                Join Indie Konnect
                <ArrowIcon />
              </Button>
            </Link>

            <Link href="/products">
              <Button href="#collections" variant="ghost">
                Explore Collections
              </Button>
            </Link>
          </Reveal>
        </motion.div>
      </div>
    </Section>
  );
}