"use client";

import { useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import DOMPurify from "dompurify";

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

import { ease } from "../../design-system/motion";
import styles from "./Values.module.css";

import { useGetLandingPageQuery } from "@/lib/redux/api/Landing/landingPageApi";

/* =========================================================
   HTML ENTITY DECODER + STRIP TAGS (plain text fields ke liye)
   - <p>...</p> remove
   - &nbsp; &amp; etc decode
========================================================= */
const stripAndDecode = (text: string): string => {
  if (!text) return "";

  // remove all HTML tags first
  let cleaned = text.replace(/<[^>]*>/g, " ");

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

  // collapse multiple spaces
  return cleaned.replace(/\s+/g, " ").trim();
};

/* =========================================================
   SANITIZER (rich HTML fields like <p>...</p>)
   - safe tags allow
   - &nbsp; ko normal space me convert
========================================================= */
const sanitizeHtml = (html: string): string => {
  if (!html) return "";

  // SSR fallback — tags strip karke plain text
  if (typeof window === "undefined") {
    return stripAndDecode(html);
  }

  const cleaned = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "a", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  // &nbsp; → normal space (extra gap avoid)
  return cleaned.replace(/&nbsp;/g, " ");
};

/* =========================================================
   CHIP STYLES
========================================================= */

const CHIP = {
  navy: styles.chipNavy,
  gold: styles.chipGold,
  white: styles.chipWhite,
} as const;

type ChipType = keyof typeof CHIP;

type ValueItem = {
  idx: string;
  title: string;
  colour: string;
  body: string;
  chip: ChipType;
};

/* =========================================================
   HELPERS
========================================================= */

const getChipType = (colour: string): ChipType => {
  const value = colour.toLowerCase().trim();
  if (value.includes("yellow")) return "gold";
  if (value.includes("white")) return "white";
  return "navy";
};

const parseShortDescription = (text: string) => {
  const cleaned = stripAndDecode(text);
  const match = cleaned.match(/^([^.!?]+)\.\s*(.*)$/);

  if (!match) {
    return { colour: cleaned, body: "" };
  }

  return {
    colour: match[1].trim(),
    body: match[2].trim(),
  };
};

/* =========================================================
   COMPONENT
========================================================= */

export function Values() {
  const reduced = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const seen = useInView(gridRef, {
    once: true,
    margin: "0px 0px -20% 0px",
  });

  const { data: landingData } = useGetLandingPageQuery();

  const chapterFivePage = landingData?.data?.find(
    (item: any) => item?.slug === "chapter-five"
  );

  const chapterFiveBlocks = useMemo(() => {
    const blocks = chapterFivePage?.blocks || [];
    return {
      main: blocks.find((block: any) => block?.sort_order === 0) || {},
      values: blocks
        .filter((block: any) => (block?.sort_order ?? 0) > 0)
        .sort(
          (a: any, b: any) =>
            (a?.sort_order ?? 0) - (b?.sort_order ?? 0)
        ),
    };
  }, [chapterFivePage]);

  /* =========================================================
     MAIN CONTENT (sort_order === 0 — TOP BLOCK)
  ========================================================= */

  const chapterHeading =
    stripAndDecode(chapterFiveBlocks.main?.heading || "") ||
    "Chapter Five · The Foundations";

  const chapterShortDescription =
    stripAndDecode(chapterFiveBlocks.main?.short_description || "") ||
    "Values you can trust";

  // description me HTML <p> hai → sanitize karke render
  const chapterDescriptionHtml = sanitizeHtml(
    chapterFiveBlocks.main?.description ||
      "<p>The IndieKonnect ecosystem runs on a people-first philosophy. Our house colours are not decoration, they are a commitment.</p>"
  );

  /* =========================================================
     DYNAMIC VALUES (sort_order >= 1 — BELOW BLOCKS)
  ========================================================= */

  const values = useMemo<ValueItem[]>(() => {
    return chapterFiveBlocks.values.map((block: any, index: number) => {
      const parsed = parseShortDescription(
        block?.short_description || ""
      );

      // title: heading → fallback short_description → fallback "Value N"
      const rawTitle =
        stripAndDecode(block?.heading || "") ||
        stripAndDecode(block?.short_description || "") ||
        `Value ${index + 1}`;

      // body: parsed body → fallback description (HTML stripped) → ""
      const rawBody =
        parsed.body ||
        stripAndDecode(block?.description || "") ||
        "";

      return {
        idx: String(index + 1).padStart(2, "0"),
        title: rawTitle,
        colour: parsed.colour || "",
        body: rawBody,
        chip: getChipType(parsed.colour || ""),
      };
    });
  }, [chapterFiveBlocks]);

  /* =========================================================
     HEADING SPLIT
  ========================================================= */

  const shortWords = chapterShortDescription.split(/\s+/).filter(Boolean);

  const firstHeadingPart =
    shortWords.length > 1
      ? shortWords.slice(0, -1).join(" ")
      : chapterShortDescription;

  const lastHeadingWord =
    shortWords.length > 1 ? shortWords[shortWords.length - 1] : "";

  return (
    <Section
      id="values"
      surface="light"
      label="Our values"
      className={styles.values}
    >
      <Wrap>
        {/* =====================================================
            HEADER — sort_order === 0 block ka data yahan aayega
        ====================================================== */}
        <div className={styles.head}>
          <Reveal as="p">
            <Eyebrow>{chapterHeading}</Eyebrow>
          </Reveal>

          <Reveal as="div" delay={0.08}>
            <Display size="lg" style={{ marginTop: 20 }}>
              {firstHeadingPart}{" "}
              {lastHeadingWord ? <Accent>{lastHeadingWord}</Accent> : null}
            </Display>
          </Reveal>

          {/* Description: Lede ke andar nested <p> avoid karne ke liye
              dangerouslySetInnerHTML wrapper div pe lagaya hai */}
          <Reveal as="div" delay={0.16}>
            <Lede as="div" style={{ marginTop: 20 }}>
              <div
                className={styles.ledeBody}
                dangerouslySetInnerHTML={{ __html: chapterDescriptionHtml }}
              />
            </Lede>
          </Reveal>
        </div>

        {/* =====================================================
            VALUES GRID — sort_order 1,2,3... blocks niche
        ====================================================== */}
        <div className={styles.grid} ref={gridRef}>
          {values.map((value, index) => (
            <motion.article
              key={`${value.title}-${value.idx}`}
              className={styles.val}
              initial={
                reduced
                  ? undefined
                  : {
                      rotateX: -34,
                      rotateY:
                        index === 0 ? -18 : index === 2 ? 18 : 0,
                      y: 70,
                      opacity: 0,
                    }
              }
              animate={
                seen || reduced
                  ? { rotateX: 0, rotateY: 0, y: 0, opacity: 1 }
                  : undefined
              }
              transition={{
                duration: 1,
                ease: ease.expoOut,
                delay: index * 0.1,
              }}
              style={{ transformPerspective: 900 }}
            >
              {/* Index */}
              <span className={styles.idx}>{value.idx}</span>

              {/* Dynamic Chip */}
              <span
                className={cx(styles.chip, CHIP[value.chip])}
                aria-hidden="true"
              />

              {/* Dynamic Title */}
              <h3>{value.title}</h3>

              {/* Dynamic Description — plain text, no nested <p> */}
              <p>
             
                {value.colour && value.body ? " " : null}
                {value.body}
              </p>
            </motion.article>
          ))}
        </div>
      </Wrap>
    </Section>
  );
}