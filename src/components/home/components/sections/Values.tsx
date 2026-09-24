"use client";

import { useMemo, useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
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

import { ease } from "../../design-system/motion";
import styles from "./Values.module.css";

import { useGetLandingPageQuery } from "@/lib/redux/api/Landing/landingPageApi";

/* =========================================================
   CHIP STYLES
========================================================= */

const CHIP = {
  navy: styles.chipNavy,
  gold: styles.chipGold,
  white: styles.chipWhite,
} as const;

type ChipType = keyof typeof CHIP;

/* =========================================================
   VALUE TYPE
========================================================= */

type ValueItem = {
  idx: string;
  title: string;
  colour: string;
  body: string;
  chip: ChipType;
};

/* =========================================================
   CHIP COLOR HELPER
========================================================= */

const getChipType = (
  colour: string
): ChipType => {
  const value = colour
    .toLowerCase()
    .trim();

  if (value.includes("yellow")) {
    return "gold";
  }

  if (value.includes("white")) {
    return "white";
  }

  return "navy";
};

/* =========================================================
   TEXT PARSER
========================================================= */

const parseShortDescription = (
  text: string
) => {
  const cleaned = text.trim();

  const match = cleaned.match(
    /^([^.!?]+)\.\s*(.*)$/
  );

  if (!match) {
    return {
      colour: cleaned,
      body: "",
    };
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

  const gridRef =
    useRef<HTMLDivElement>(null);

  const seen = useInView(gridRef, {
    once: true,
    margin: "0px 0px -20% 0px",
  });

  /* =========================================================
     API
  ========================================================= */

  const { data: landingData } =
    useGetLandingPageQuery();

  /* =========================================================
     FIND CHAPTER FIVE
  ========================================================= */

  const chapterFivePage =
    landingData?.data?.find(
      (item: any) =>
        item?.slug === "chapter-five"
    );

  /* =========================================================
     GET CHAPTER BLOCKS
  ========================================================= */

  const chapterFiveBlocks =
    useMemo(() => {
      const blocks =
        chapterFivePage?.blocks || [];

      return {
        main:
          blocks.find(
            (block: any) =>
              block?.sort_order === 0
          ) || {},

        values: blocks
          .filter(
            (block: any) =>
              block?.sort_order > 0
          )
          .sort(
            (a: any, b: any) =>
              (a?.sort_order ?? 0) -
              (b?.sort_order ?? 0)
          ),
      };
    }, [chapterFivePage]);

  /* =========================================================
     MAIN CONTENT
  ========================================================= */

  const chapterHeading =
    chapterFiveBlocks.main?.heading?.trim() ||
    "Chapter Five · The Foundations";

  const chapterShortDescription =
    chapterFiveBlocks.main?.short_description?.trim() ||
    "Values you can trust";

  const chapterDescription =
    chapterFiveBlocks.main?.description?.trim() ||
    "The IndieKonnect ecosystem runs on a people-first philosophy. Our house colours are not decoration, they are a commitment.";

  /* =========================================================
     DYNAMIC VALUES
  ========================================================= */

  const values = useMemo<ValueItem[]>(() => {
    return chapterFiveBlocks.values.map(
      (block: any, index: number) => {
        const parsed =
          parseShortDescription(
            block?.short_description ||
              ""
          );

        return {
          idx: String(
            index + 1
          ).padStart(2, "0"),

          title:
            block?.heading?.trim() ||
            `Value ${index + 1}`,

          colour:
            parsed.colour ||
            "",

          body:
            parsed.body ||
            block?.description?.trim() ||
            "",

          chip: getChipType(
            parsed.colour || ""
          ),
        };
      }
    );
  }, [chapterFiveBlocks]);

  /* =========================================================
     HEADING SPLIT
  ========================================================= */

  const shortWords =
    chapterShortDescription
      .split(/\s+/)
      .filter(Boolean);

  const firstHeadingPart =
    shortWords.length > 1
      ? shortWords
          .slice(0, -1)
          .join(" ")
      : chapterShortDescription;

  const lastHeadingWord =
    shortWords.length > 1
      ? shortWords[
          shortWords.length - 1
        ]
      : "";

  return (
    <Section
      id="values"
      surface="light"
      label="Our values"
      className={styles.values}
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
              {firstHeadingPart}{" "}
              {lastHeadingWord ? (
                <Accent>
                  {lastHeadingWord}
                </Accent>
              ) : null}
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
              {chapterDescription}
            </Lede>
          </Reveal>
        </div>

        {/* =====================================================
            VALUES GRID
        ====================================================== */}

        <div
          className={styles.grid}
          ref={gridRef}
        >
          {values.map(
            (value, index) => (
              <motion.article
                key={`${value.title}-${value.idx}`}
                className={styles.val}
                initial={
                  reduced
                    ? undefined
                    : {
                        rotateX: -34,
                        rotateY:
                          index === 0
                            ? -18
                            : index ===
                                2
                              ? 18
                              : 0,
                        y: 70,
                        opacity: 0,
                      }
                }
                animate={
                  seen || reduced
                    ? {
                        rotateX: 0,
                        rotateY: 0,
                        y: 0,
                        opacity: 1,
                      }
                    : undefined
                }
                transition={{
                  duration: 1,
                  ease: ease.expoOut,
                  delay:
                    index * 0.1,
                }}
                style={{
                  transformPerspective: 900,
                }}
              >
                {/* Index */}
                <span
                  className={
                    styles.idx
                  }
                >
                  {value.idx}
                </span>

                {/* Dynamic Chip */}
                <span
                  className={cx(
                    styles.chip,
                    CHIP[value.chip]
                  )}
                  aria-hidden="true"
                />

                {/* Dynamic Title */}
                <h3>
                  {value.title}
                </h3>

                {/* Dynamic Description */}
                <p>
                  {value.colour ? (
                    <strong>
                      {value.colour}
                    </strong>
                  ) : null}

                  {value.colour &&
                  value.body
                    ? " "
                    : null}

                  {value.body}
                </p>
              </motion.article>
            )
          )}
        </div>
      </Wrap>
    </Section>
  );
}