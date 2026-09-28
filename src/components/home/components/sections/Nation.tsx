"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { Eyebrow, Section } from "../../design-system";
import { scrub } from "../../design-system/motion";
import styles from "./Nation.module.css";

import { useGetLandingPageQuery } from "@/lib/redux/api/Landing/landingPageApi";

/* =========================================================
   TYPES
========================================================= */

type NationImage = {
  id: number | string;
  url: string;
  alt_text?: string | null;
  is_primary?: boolean;
};

type NationBlock = {
  id?: number | string;
  heading?: string | null;
  short_description?: string | null;
  description?: string | null;
  sort_order?: number;
  images?: NationImage[];
  videos?: unknown[];
};

/* =========================================================
   COLUMN DRIFT
   Keep same visual feel as the existing section
========================================================= */

const COLUMN_DRIFTS = [18, 26, 16, 24, 19];

/* =========================================================
   NATION
========================================================= */

export function Nation() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* =========================================================
     LANDING PAGE API
  ========================================================= */

  const { data: landingData } =
    useGetLandingPageQuery();

  /* =========================================================
     CHAPTER ONE
  ========================================================= */

  const chapterOneBlock = useMemo<NationBlock | null>(() => {
    const chapterOnePage = landingData?.data?.find(
      (item: any) =>
        item?.slug === "chapter-one" ||
        item?.title === "Chapter One"
    );

    const blocks =
      chapterOnePage?.blocks || [];

    return (
      blocks.find(
        (block: any) =>
          block?.sort_order === 0
      ) || null
    );
  }, [landingData]);

  /* =========================================================
     DYNAMIC CONTENT
  ========================================================= */

  const chapterHeading =
    chapterOneBlock?.heading?.trim() ||
    "Chapter One · The Nation";

  const chapterDescription =
    chapterOneBlock?.description?.trim() ||
    "people. One shared ambition. Before IndieKonnect was a brand, it was an observation: India does not lack talent, it lacks doorways.";

  const chapterImages = useMemo<NationImage[]>(
    () =>
      (chapterOneBlock?.images || []).filter(
        (image: any) =>
          Boolean(image?.url)
      ),
    [chapterOneBlock]
  );

  /* =========================================================
     SPLIT API IMAGES INTO 5 COLUMNS
  ========================================================= */

  const nationColumns = useMemo(() => {
    const totalColumns =
      COLUMN_DRIFTS.length;

    if (!chapterImages.length) {
      return Array.from(
        { length: totalColumns },
        (_, index) => ({
          images: [] as NationImage[],
          drift:
            COLUMN_DRIFTS[index],
        })
      );
    }

    const columns: NationImage[][] =
      Array.from(
        { length: totalColumns },
        () => []
      );

    chapterImages.forEach(
      (image, index) => {
        columns[
          index % totalColumns
        ].push(image);
      }
    );

    return columns.map(
      (images, index) => ({
        images,
        drift:
          COLUMN_DRIFTS[index],
      })
    );
  }, [chapterImages]);

  /* =========================================================
     PIN PROGRESS
  ========================================================= */

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

  /* =========================================================
     SECTION DRIFT
  ========================================================= */

  const {
    scrollYProgress: pass,
  } = useScroll({
    target: ref,
    offset: [
      "start end",
      "end start",
    ],
  });

  const drift = useSpring(
    pass,
    scrub.s10
  );

  /* =========================================================
     CORE ANIMATION
  ========================================================= */

  const value = useTransform(
    p,
    (v) => (v * 1.4).toFixed(1)
  );

  const coreScale = useTransform(
    p,
    [0, 1],
    [0.82, 1]
  );

  const coreOpacity = useTransform(
    p,
    [0, 1],
    [0.4, 1]
  );

  const colsOpacity = useTransform(
    p,
    [0, 1],
    [0.1, 0.34]
  );

  return (
    <Section
      id="nation"
      label="The scale of the movement"
      className={styles.nation}
      ref={ref}
    >
      <div className={styles.pin}>
        {/* =====================================================
            BACKGROUND IMAGE COLUMNS
        ====================================================== */}

        <motion.div
          className={styles.cols}
          style={{
            opacity: reduced
              ? 0.3
              : colsOpacity,
          }}
          aria-hidden="true"
        >
          {nationColumns.map(
            (column, columnIndex) => (
              <NationColumn
                key={columnIndex}
                drift={drift}
                amount={column.drift}
                images={column.images}
                reduced={Boolean(
                  reduced
                )}
              />
            )
          )}
        </motion.div>

        {/* =====================================================
            CENTER CONTENT
        ====================================================== */}

        <div className={styles.core}>
          <Eyebrow
            center
            style={{
              marginBottom: 22,
            }}
          >
            {chapterHeading}
          </Eyebrow>

          <motion.p
            className={styles.count}
            style={{
              scale: reduced
                ? 1
                : coreScale,
              opacity: reduced
                ? 1
                : coreOpacity,
            }}
          >
            <motion.span>
              {reduced
                ? "1.4"
                : value}
            </motion.span>

            <sup>
              billion
            </sup>
          </motion.p>

          <p
            className={styles.sub}
          >
            {chapterDescription}
          </p>
        </div>
      </div>
    </Section>
  );
}

/* =========================================================
   NATION COLUMN
========================================================= */

function NationColumn({
  drift,
  amount,
  images,
  reduced,
}: {
  drift: MotionValue<number>;
  amount: number;
  images: NationImage[];
  reduced: boolean;
}) {
  const y = useTransform(
    drift,
    [0, 1],
    [
      `-${amount}%`,
      `${amount}%`,
    ]
  );

  return (
    <motion.div
      className={styles.col}
      style={
        reduced
          ? undefined
          : { y }
      }
    >
      {images.map(
        (image, index) => (
          <figure
            key={`${image.id}-${index}`}
          >
            <Image
              src={image.url}
              alt={
                image.alt_text ||
                ""
              }
              fill
              sizes="20vw"
            />
          </figure>
        )
      )}
    </motion.div>
  );
}