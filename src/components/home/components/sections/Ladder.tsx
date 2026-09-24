"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Section,
  Wrap,
  cx,
} from "../../design-system";

import { ease } from "../../design-system";
import styles from "./Ladder.module.css";

import { useGetLandingPageQuery } from "@/lib/redux/api/Landing/landingPageApi";

/* =========================================================
   MOBILE DETECTION
========================================================= */

function useIsMobile() {
  const [isMobile, setIsMobile] =
    useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768
      );
    };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };
  }, []);

  return isMobile;
}

/* =========================================================
   STEP TYPE
========================================================= */

type LadderStep = {
  id: number | string;
  mark: string;
  level: string;
  title: string;
  body: string;
};

/* =========================================================
   CHAPTER SIX
========================================================= */

export function Ladder() {
  const [current, setCurrent] =
    useState(0);

  const isMobile = useIsMobile();

  /* =========================================================
     API
  ========================================================= */

  const { data: landingData } =
    useGetLandingPageQuery();

  /* =========================================================
     FIND CHAPTER SIX BY SLUG
  ========================================================== */

  const chapterSixPage =
    landingData?.data?.find(
      (item: any) =>
        item?.slug === "chapter-six"
    );

  /* =========================================================
     GET CHAPTER BLOCKS
  ========================================================== */

  const chapterSixBlocks =
    useMemo(() => {
      const blocks =
        chapterSixPage?.blocks || [];

      const main =
        blocks.find(
          (block: any) =>
            block?.sort_order === 0
        ) || null;

      const stepBlocks =
        blocks
          .filter(
            (block: any) =>
              block?.sort_order > 0
          )
          .sort(
            (a: any, b: any) =>
              (a?.sort_order ?? 0) -
              (b?.sort_order ?? 0)
          );

      return {
        main,
        stepBlocks,
      };
    }, [chapterSixPage]);

  /* =========================================================
     MAIN CONTENT
  ========================================================== */

  const chapterHeading =
    chapterSixBlocks.main?.heading?.trim() ||
    "Chapter Six · The Opportunity";

  const chapterShortDescription =
    chapterSixBlocks.main?.short_description?.trim() ||
    "A growth ladder\nfor leaders";

  const chapterDescription =
    chapterSixBlocks.main?.description?.trim() ||
    "A clear, milestone-driven journey built on leadership development, mentorship and shared success. Every rung is earned, and every rung is published.";

  /* =========================================================
     DYNAMIC LADDER STEPS
  ========================================================== */

  const steps = useMemo<LadderStep[]>(
    () => {
      return chapterSixBlocks.stepBlocks.map(
        (block: any, index: number) => ({
          id:
            block?.id ??
            block?.sort_order ??
            index + 1,

          mark: String(
            block?.sort_order ??
              index + 1
          ).padStart(2, "0"),

          level:
            block?.heading?.trim() ||
            `Level ${String(
              index + 1
            ).padStart(2, "0")}`,

          title:
            block?.short_description?.trim() ||
            `Level ${index + 1}`,

          body:
            block?.description?.trim() ||
            "",
        })
      );
    },
    [chapterSixBlocks]
  );

  /* =========================================================
     KEEP CURRENT INDEX VALID
  ========================================================== */

  useEffect(() => {
    if (!steps.length) {
      setCurrent(0);
      return;
    }

    setCurrent((prev) =>
      Math.min(
        prev,
        steps.length - 1
      )
    );
  }, [steps.length]);

  /* =========================================================
     MAIN SHORT DESCRIPTION
     
     API:
     "A growth ladder\r\nfor leaders"
     
     Render as:
     A growth ladder
     for leaders
  ========================================================== */

  const shortDescriptionLines =
    chapterShortDescription.split(
      /\r?\n/
    );

  return (
    <Section
      id="ladder"
      label="The growth ladder"
      className={styles.ladder}
    >
      <Wrap className={styles.in}>
        {/* =====================================================
            LEFT / STICKY CONTENT
        ====================================================== */}

        <div className={styles.sticky}>
          {/* Dynamic Chapter Heading */}
          <Eyebrow>
            {chapterHeading}
          </Eyebrow>

          {/* Dynamic Main Heading */}
          <Display
            size="lg"
            style={{
              marginTop: 20,
            }}
          >
            {shortDescriptionLines.map(
              (
                line: string,
                index: number
              ) => {
                const isLast =
                  index ===
                  shortDescriptionLines.length -
                    1;

                /*
                 * Last word of last line
                 * is highlighted.
                 */
                if (isLast) {
                  const words =
                    line
                      .split(
                        /\s+/
                      )
                      .filter(
                        Boolean
                      );

                  if (
                    words.length >
                    1
                  ) {
                    return (
                      <span
                        key={`${line}-${index}`}
                      >
                        {words
                          .slice(
                            0,
                            -1
                          )
                          .join(
                            " "
                          )}{" "}
                        <Accent>
                          {
                            words[
                              words.length -
                                1
                            ]
                          }
                        </Accent>
                      </span>
                    );
                  }
                }

                return (
                  <span
                    key={`${line}-${index}`}
                  >
                    {line}
                  </span>
                );
              }
            )}
          </Display>

          {/* Dynamic Description */}
          <Lede
            style={{
              marginTop: 20,
            }}
          >
            {chapterDescription}
          </Lede>

          {/* =================================================
              DESKTOP METER
          ================================================= */}

          {!isMobile &&
            steps.length > 0 && (
              <div
                className={
                  styles.meter
                }
                aria-hidden="true"
              >
                <span
                  className={
                    styles.num
                  }
                >
                  {String(
                    current + 1
                  ).padStart(2, "0")}
                </span>

                <span
                  className={
                    styles.track
                  }
                >
                  <i
                    className={
                      styles.fill
                    }
                    style={{
                      width:
                        `${
                          ((current +
                            1) /
                            steps.length) *
                          100
                        }%`,
                    }}
                  />
                </span>

                <span
                  className={
                    styles.num
                  }
                  style={{
                    opacity: 0.4,
                  }}
                >
                  {String(
                    steps.length
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>
              </div>
            )}
        </div>

        {/* =====================================================
            STEPS
        ====================================================== */}

        <div
          className={cx(
            styles.steps,
            isMobile &&
              styles.stepsMobile
          )}
        >
          {steps.map(
            (
              step,
              index
            ) => (
              <Step
                key={step.id}
                step={step}
                index={index}
                onActive={
                  setCurrent
                }
                isMobile={
                  isMobile
                }
              />
            )
          )}
        </div>
      </Wrap>
    </Section>
  );
}

/* =========================================================
   STEP COMPONENT
========================================================= */

function Step({
  step,
  index,
  onActive,
  isMobile,
}: {
  step: LadderStep;
  index: number;
  onActive: (
    index: number
  ) => void;
  isMobile: boolean;
}) {
  const reduced =
    useReducedMotion();

  const ref =
    useRef<HTMLElement>(null);

  /* Entrance animation */
  const seen = useInView(ref, {
    once: true,
    margin:
      "0px 0px -12% 0px",
  });

  /* Active/crossing state */
  const crossing = useInView(
    ref,
    {
      margin:
        "-62% 0px -38% 0px",
    }
  );

  useEffect(() => {
    if (crossing) {
      onActive(index);
    }
  }, [
    crossing,
    index,
    onActive,
  ]);

  /*
   * Disable animations on mobile
   * or when reduced motion is preferred.
   */
  const shouldAnimate =
    !reduced &&
    !isMobile;

  return (
    <motion.article
      ref={ref}
      className={cx(
        styles.step,
        crossing &&
          styles.on,
        isMobile &&
          styles.stepMobile
      )}
      initial={
        shouldAnimate
          ? {
              x: 44,
              opacity: 0,
            }
          : undefined
      }
      animate={
        seen || !shouldAnimate
          ? {
              x: 0,
              opacity: 1,
            }
          : undefined
      }
      transition={
        shouldAnimate
          ? {
              duration: 0.8,
              ease: ease.power3Out,
            }
          : undefined
      }
    >
      {/* =================================================
          STEP NUMBER
      ================================================= */}

      <span
        className={
          styles.mark
        }
      >
        {step.mark}
      </span>

      {/* =================================================
          LEVEL
          
          API heading:
          Level 01
          Level 02
          ...
      ================================================= */}

      <p
        className={
          styles.lvl
        }
      >
        {step.level}
      </p>

      {/* =================================================
          STEP TITLE
          
          API short_description:
          Associate
          Builder
          Leader
          Director
          Ambassador
      ================================================= */}

      <h3>
        {step.title}
      </h3>

      {/* =================================================
          STEP DESCRIPTION
      ================================================= */}

      <p>
        {step.body}
      </p>
    </motion.article>
  );
}