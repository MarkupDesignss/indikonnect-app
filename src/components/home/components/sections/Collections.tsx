"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import {
  Accent,
  ArrowIcon,
  Button,
  Display,
  Eyebrow,
  Section,
  cx,
} from "../../design-system";

import { scrub } from "../../design-system/motion";
import styles from "./Collections.module.css";

import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useGetLandingPageQuery } from "@/lib/redux/api/Landing/landingPageApi";

/* =========================================================
   TIER STYLES
========================================================= */

const TIER_CLASS = {
  l: styles.tierL,
  m: styles.tierM,
  s: styles.tierS,
};

/*
 * Smaller tiers travel further, so the staggered
 * baseline reads with depth.
 */
const TIER_DEPTH = {
  l: 4,
  m: 7,
  s: 10,
};

/* =========================================================
   CATEGORY TYPE
========================================================= */

type Category = {
  id: number | string;
  title: string;
  image: string;
  description?: string;
  tier: "l" | "m" | "s";
};

export function Collections() {
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const cardsRef = useRef<Array<HTMLElement | null>>([]);

  const [distance, setDistance] = useState(0);
  const [extra, setExtra] = useState(0);
  const [active, setActive] = useState(0);

  /* =========================================================
     LANDING PAGE API
  ========================================================= */

  const { data: landingData } = useGetLandingPageQuery();

  const chapterThreePage = landingData?.data?.find(
    (item: any) => item?.slug === "chapter-three"
  );

  const chapterThreeBlock = chapterThreePage?.blocks?.find(
    (block: any) => block?.sort_order === 0
  );

  const chapterHeading =
    chapterThreeBlock?.heading?.trim() ||
    "Chapter Three · The Collections";

  const chapterDescription =
    chapterThreeBlock?.description?.trim() ||
    "Curated for the discerning";

  /* =========================================================
     CATEGORIES API
  ========================================================= */

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery();

  const categories = useMemo<Category[]>(() => {
    const apiCategories = categoriesData?.data || [];

    return apiCategories
      .filter(
        (category: any) =>
          category?.status === "active" &&
          category?.image
      )
      .map(
        (category: any, index: number) => ({
          id: category?.id ?? index + 1,
          title:
            category?.title?.trim() ||
            "Collection",
          image: category.image,
          description:
            category?.description || "",
          tier:
            index % 3 === 0
              ? "l"
              : index % 3 === 1
                ? "m"
                : "s",
        })
      );
  }, [categoriesData]);

  /* =========================================================
     GHOST WORDS
  ========================================================= */

  const ghostWords = useMemo(() => {
    return categories.map((category) => ({
      word: category.title,
      category: category.title,
    }));
  }, [categories]);

  /* =========================================================
     MEASURE TRACK
  ========================================================= */

  const measure = useCallback(() => {
    const track = trackRef.current;

    if (!track) return;

    const base =
      parseFloat(
        getComputedStyle(track).paddingLeft
      ) || 0;

    track.style.paddingRight =
      base + "px";

    const cards =
      cardsRef.current.filter(
        Boolean
      ) as HTMLElement[];

    if (cards.length) {
      const last =
        cards[cards.length - 1];

      const trackLeft =
        track.getBoundingClientRect()
          .left;

      const rect =
        last.getBoundingClientRect();

      const lastCentre =
        rect.left +
        rect.width / 2 -
        trackLeft;

      const trailing =
        track.scrollWidth -
        lastCentre;

      const need =
        window.innerWidth * 0.66 -
        trailing;

      if (need > 0) {
        track.style.paddingRight =
          base + need + "px";
      }
    }

    const pad =
      parseFloat(
        getComputedStyle(track)
          .paddingRight
      ) || 0;

    const d = Math.max(
      0,
      track.scrollWidth -
        window.innerWidth +
        pad
    );

    setDistance(d);

    setExtra(
      d +
        window.innerHeight *
          0.5
    );
  }, []);

  /* =========================================================
     MEASURE ON MOUNT / RESIZE / CATEGORY LOAD
  ========================================================= */

  useEffect(() => {
    if (reduced) return;

    const runMeasure = () => {
      requestAnimationFrame(() => {
        measure();
      });
    };

    runMeasure();

    window.addEventListener(
      "resize",
      runMeasure
    );

    if (
      document.fonts &&
      document.fonts.ready
    ) {
      void document.fonts.ready.then(
        runMeasure
      );
    }

    return () => {
      window.removeEventListener(
        "resize",
        runMeasure
      );
    };
  }, [
    measure,
    reduced,
    categories.length,
  ]);

  /* =========================================================
     SCROLL PROGRESS
  ========================================================= */

  const { scrollYProgress } =
    useScroll({
      target: sectionRef,
      offset: [
        "start start",
        "end end",
      ],
    });

  const p = useSpring(
    scrollYProgress,
    scrub.s07
  );

  const x = useTransform(
    p,
    [0, 1],
    [0, -distance]
  );

  /* =========================================================
     SYNC ACTIVE CARD
  ========================================================= */

  const syncFocus = useCallback(() => {
    const line =
      window.innerWidth * 0.34;

    let best = 0;
    let bestD = Infinity;

    cardsRef.current.forEach(
      (card, index) => {
        if (!card) return;

        const rect =
          card.getBoundingClientRect();

        const d = Math.abs(
          rect.left +
            rect.width / 2 -
            line
        );

        if (d < bestD) {
          bestD = d;
          best = index;
        }
      }
    );

    setActive((prev) =>
      prev === best ? prev : best
    );
  }, []);

  useMotionValueEvent(
    x,
    "change",
    syncFocus
  );

  useEffect(() => {
    if (!reduced) {
      requestAnimationFrame(
        syncFocus
      );
    }
  }, [
    distance,
    reduced,
    syncFocus,
    categories.length,
  ]);

  /* =========================================================
     CURRENT CATEGORY
  ========================================================= */

  const current =
    categories[active] ??
    categories[0];

  /* =========================================================
     HEADING SPLIT
  ========================================================= */

  const descriptionWords =
    chapterDescription
      .split(/\s+/)
      .filter(Boolean);

  const firstHeadingPart =
    descriptionWords.length > 1
      ? descriptionWords
          .slice(0, -1)
          .join(" ")
      : chapterDescription;

  const lastHeadingWord =
    descriptionWords.length > 1
      ? descriptionWords[
          descriptionWords.length - 1
        ]
      : "";

  return (
    <Section
      id="collections"
      label="Product collections"
      className={styles.gallery}
      ref={sectionRef}
      style={
        reduced
          ? undefined
          : {
              height:
                "calc(100svh + " +
                extra +
                "px)",
            }
      }
    >
      <div className={styles.pin}>
        {/* =====================================================
            GHOST CATEGORY WORDS
        ====================================================== */}

        <div
          className={styles.ghost}
          aria-hidden="true"
        >
          {ghostWords.map((item) => (
            <span
              key={item.word}
              className={cx(
                item.category ===
                  current?.title &&
                  styles.on
              )}
            >
              {item.word}
            </span>
          ))}
        </div>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className={styles.head}>
          <div>
            <Eyebrow>
              {chapterHeading}
            </Eyebrow>

            <Display
              size="lg"
              style={{
                marginTop: 16,
              }}
            >
              {firstHeadingPart}{" "}
              {lastHeadingWord ? (
                <Accent>
                  {lastHeadingWord}
                </Accent>
              ) : null}
            </Display>
          </div>

          <p className={styles.hint}>
            <i></i>
            Keep scrolling
          </p>
        </div>

        {/* =====================================================
            CATEGORY STAGE
        ====================================================== */}

        <div
          className={styles.stage}
        >
          <motion.div
            className={cx(
              styles.track,
              reduced &&
                styles.staticTrack
            )}
            ref={trackRef}
            style={
              reduced
                ? undefined
                : { x }
            }
          >
            {categoriesLoading ? (
              <>
                {Array.from({
                  length: 5,
                }).map(
                  (_, index) => (
                    <article
                      key={index}
                      className={cx(
                        styles.card,
                        TIER_CLASS[
                          index % 3 === 0
                            ? "l"
                            : index % 3 === 1
                              ? "m"
                              : "s"
                        ]
                      )}
                    >
                      <div
                        className={styles.media}
                        style={{
                          background:
                            "rgba(255,255,255,0.05)",
                        }}
                      />
                    </article>
                  )
                )}
              </>
            ) : categories.length ? (
              <>
                {categories.map(
                  (
                    category,
                    index
                  ) => (
                    <Card
                      key={
                        category.id
                      }
                      category={
                        category
                      }
                      progress={p}
                      active={
                        !reduced &&
                        index === active
                      }
                      reduced={Boolean(
                        reduced
                      )}
                      register={(
                        element
                      ) => {
                        cardsRef.current[
                          index
                        ] =
                          element;
                      }}
                    />
                  )
                )}

                {/* =================================================
                    END CARD
                ================================================== */}

                <div
                  className={
                    styles.end
                  }
                >
                  <Eyebrow>
                    The full range
                  </Eyebrow>

                  <p>
                    {categories.length}{" "}
                    categories,
                    <br />
                    one standard.
                  </p>

                  <Link
                    href="/products/"
                    className="inline-flex"
                  >
                    <Button
                      variant="gold"
                    >
                      View all
                      collections
                      <ArrowIcon />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div
                className={styles.end}
              >
                <Eyebrow>
                  Collections
                </Eyebrow>

                <p>
                  No collections
                  available.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* =====================================================
            FOOT
        ====================================================== */}

        <div className={styles.foot}>
          <span
            className={styles.idx}
          >
            <b>
              {String(
                categories.length
                  ? active + 1
                  : 0
              ).padStart(2, "0")}
            </b>{" "}
            /{" "}
            {String(
              categories.length
            ).padStart(2, "0")}
          </span>

          <span
            className={styles.now}
          >
            {current?.title ||
              "Collections"}
          </span>

          <span
            className={styles.rail}
          >
            <motion.i
              style={{
                scaleX: reduced
                  ? 1
                  : p,
              }}
            />
          </span>
        </div>
      </div>
    </Section>
  );
}

/* =========================================================
   CATEGORY CARD
========================================================= */

function Card({
  category,
  progress,
  active,
  reduced,
  register,
}: {
  category: Category;
  progress: MotionValue<number>;
  active: boolean;
  reduced: boolean;
  register: (
    el: HTMLElement | null
  ) => void;
}) {
  const depth =
    TIER_DEPTH[category.tier];

  const y = useTransform(
    progress,
    [0, 1],
    [
      `-${depth}%`,
      `${depth * 0.7}%`,
    ]
  );

  return (
    <article
      ref={register}
      className={cx(
        styles.card,
        TIER_CLASS[
          category.tier
        ],
        active && styles.active
      )}
    >
      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div
        className={styles.media}
      >
        <motion.div
          className={
            styles.mediaShift
          }
          style={
            reduced
              ? undefined
              : { y }
          }
        >
          <Image
            src={category.image}
            alt={
              category.title
            }
            fill
            sizes="(max-width: 760px) 60vw, 30vw"
            className="object-cover"
          />
        </motion.div>
      </div>

      {/* =====================================================
          NUMBER
      ====================================================== */}

      <span
        className={styles.num}
      >
        {String(
          category.id
        ).padStart(2, "0")}
      </span>

      {/* =====================================================
          CAPTION
      ====================================================== */}

      <div className={styles.cap}>
        <p
          className={styles.cat}
        >
          Collection
        </p>

        <h3
          className={
            styles.name
          }
        >
          {category.title}
        </h3>

        {/* No product price/name */}
      </div>
    </article>
  );
}