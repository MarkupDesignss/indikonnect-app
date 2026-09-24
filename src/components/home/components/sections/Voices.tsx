"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

import {
  Accent,
  Display,
  Eyebrow,
  Reveal,
  Section,
  Wrap,
  cx,
} from "../../design-system";

import { scrub } from "../../design-system/motion";

import styles from "./Voices.module.css";
import valStyles from "./Values.module.css";

import { useGetLandingPageQuery } from "@/lib/redux/api/Landing/landingPageApi";
import { useGetTestimonialsQuery } from "@/lib/redux/api/testimonialApi";

/* =========================================================
   TYPES
========================================================= */

type Testimonial = {
  id: number | string;
  video_path?: string | null;
  video_title?: string | null;
  person_name?: string | null;
  heading?: string | null;
  rating?: string | number | null;
  text?: string | null;
  is_active?: boolean;
  display_order?: number;
  view_counts?: number;
};

type ComplianceItem = {
  id: number | string;
  idx: string;
  title: string;
  body: string;
};

/* =========================================================
   VOICES
========================================================= */

export function Voices() {
  const reduced = useReducedMotion();

  const ref = useRef<HTMLElement>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [isDragging, setIsDragging] =
    useState(false);

  const [touchStartY, setTouchStartY] =
    useState(0);

  const [touchEndY, setTouchEndY] =
    useState(0);

  const [isMobile, setIsMobile] =
    useState(false);

  /* =========================================================
     MOBILE DETECTION
  ========================================================== */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
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

  /* =========================================================
     LANDING PAGE API
  ========================================================== */

  const { data: landingData } =
    useGetLandingPageQuery();

  /* =========================================================
     CHAPTER SEVEN
  ========================================================== */

  const chapterSevenPage =
    landingData?.data?.find(
      (item: any) =>
        item?.slug === "chapter-seven"
    );

  const chapterSevenBlock =
    chapterSevenPage?.blocks?.find(
      (block: any) =>
        block?.sort_order === 0
    );

  const chapterHeading =
    chapterSevenBlock?.heading?.trim() ||
    "Chapter Seven · The People";

  const chapterShortDescription =
    chapterSevenBlock?.short_description?.trim() ||
    "People & possibilities";

  /* =========================================================
     FUTURE READY API
  ========================================================== */

  const futureReadyPage =
    landingData?.data?.find(
      (item: any) =>
        item?.slug === "future-ready"
    );

  /* =========================================================
     FUTURE READY BLOCKS
     ALL BLOCKS = ALL CARDS
  ========================================================== */

  const futureReadyBlocks =
    useMemo(() => {
      const blocks = [
        ...(futureReadyPage?.blocks || []),
      ].sort(
        (a: any, b: any) =>
          (a?.sort_order ?? 0) -
          (b?.sort_order ?? 0)
      );

      return {
        main:
          blocks.find(
            (block: any) =>
              block?.sort_order === 0
          ) || {},

        items: blocks,
      };
    }, [futureReadyPage]);

  /* =========================================================
     FUTURE READY MAIN CONTENT
  ========================================================== */

  const futureReadyHeading =
    futureReadyBlocks.main?.heading?.trim() ||
    "Future-Ready & Compliant";

  const futureReadyShortDescription =
    futureReadyBlocks.main?.short_description?.trim() ||
    "A proud advocate of Aatmanirbhar Bharat";

  /* =========================================================
     FULLY DYNAMIC COMPLIANCE
  ========================================================== */

  const compliance =
    useMemo<ComplianceItem[]>(() => {
      return futureReadyBlocks.items.map(
        (block: any, index: number) => ({
          id:
            block?.id ??
            block?.sort_order ??
            index + 1,

          idx: String(
            index + 1
          ).padStart(2, "0"),

          title:
            block?.heading?.trim() ||
            `Item ${index + 1}`,

          body:
            block?.short_description?.trim() ||
            block?.description?.trim() ||
            "",
        })
      );
    }, [futureReadyBlocks]);

  /* =========================================================
     TESTIMONIAL API
  ========================================================== */

  const {
    data: testimonialsResponse,
    isLoading: testimonialsLoading,
    isError: testimonialsError,
  } = useGetTestimonialsQuery();

  /* =========================================================
     TESTIMONIAL LIST
  ========================================================== */

  const testimonials =
    useMemo<Testimonial[]>(() => {
      const responseData =
        testimonialsResponse?.data;

      let list: any[] = [];

      if (
        responseData &&
        Array.isArray(
          responseData.data
        )
      ) {
        list = responseData.data;
      } else if (
        Array.isArray(responseData)
      ) {
        list = responseData;
      }

      return list
        .filter(
          (item: any) =>
            item?.is_active !== false
        )
        .sort(
          (a: any, b: any) =>
            (a?.display_order ?? 0) -
            (b?.display_order ?? 0)
        )
        .map(
          (item: any) => ({
            id: item?.id,

            video_path:
              item?.video_path ||
              null,

            video_title:
              item?.video_title ||
              null,

            person_name:
              item?.person_name ||
              "Anonymous",

            heading:
              item?.heading ||
              null,

            rating:
              item?.rating ?? null,

            text:
              item?.text || "",

            is_active:
              item?.is_active ??
              true,

            display_order:
              item?.display_order ??
              0,

            view_counts:
              item?.view_counts ??
              0,
          })
        );
    }, [testimonialsResponse]);

  /* =========================================================
     CURRENT INDEX SAFETY
  ========================================================== */

  useEffect(() => {
    if (!testimonials.length) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) =>
      Math.min(
        prev,
        testimonials.length - 1
      )
    );
  }, [testimonials.length]);

  /* =========================================================
     SCROLL PROGRESS
  ========================================================== */

  const { scrollYProgress } =
    useScroll({
      target: ref,
      offset: [
        "start end",
        "end start",
      ],
    });

  const p = useSpring(
    scrollYProgress,
    scrub.s10
  );

  const x = useTransform(
    p,
    [0, 0.5],
    [0, -50]
  );

  /* =========================================================
     MOBILE AUTO ROTATE
  ========================================================== */

  useEffect(() => {
    if (
      reduced ||
      !isMobile ||
      isDragging ||
      testimonials.length <= 1
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        setCurrentIndex(
          (prev) =>
            (prev + 1) %
            testimonials.length
        );
      }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [
    reduced,
    isMobile,
    isDragging,
    testimonials.length,
  ]);

  /* =========================================================
     TOUCH START
  ========================================================== */

  const handleTouchStart = (
    e: React.TouchEvent
  ) => {
    setTouchStartY(
      e.touches[0].clientY
    );

    setTouchEndY(
      e.touches[0].clientY
    );

    setIsDragging(true);
  };

  /* =========================================================
     TOUCH MOVE
  ========================================================== */

  const handleTouchMove = (
    e: React.TouchEvent
  ) => {
    setTouchEndY(
      e.touches[0].clientY
    );
  };

  /* =========================================================
     TOUCH END
  ========================================================== */

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (!testimonials.length) {
      return;
    }

    const swipeDistance =
      touchStartY - touchEndY;

    if (
      Math.abs(swipeDistance) >
      50
    ) {
      if (swipeDistance > 0) {
        setCurrentIndex(
          (prev) =>
            (prev + 1) %
            testimonials.length
        );
      } else {
        setCurrentIndex(
          (prev) =>
            (prev -
              1 +
              testimonials.length) %
            testimonials.length
        );
      }
    }

    setTouchStartY(0);
    setTouchEndY(0);
  };

  /* =========================================================
     DUPLICATED DESKTOP TESTIMONIALS
  ========================================================== */

  const duplicatedTestimonials =
    useMemo(
      () => [
        ...testimonials,
        ...testimonials,
      ],
      [testimonials]
    );

  /* =========================================================
     STATES
  ========================================================== */

  const isLoading =
    testimonialsLoading &&
    testimonials.length === 0;

  const noTestimonials =
    !testimonialsLoading &&
    testimonials.length === 0;

  const currentTestimonial =
    testimonials[currentIndex];

  /* =========================================================
     CHAPTER SEVEN HEADING
  ========================================================== */

  const renderChapterHeading =
    () => {
      const words =
        chapterShortDescription
          .split(/\s+/)
          .filter(Boolean);

      if (!words.length) {
        return null;
      }

      const lastWord =
        words[
          words.length - 1
        ];

      const firstPart =
        words
          .slice(0, -1)
          .join(" ");

      return (
        <>
          {firstPart}{" "}
          <Accent>
            {lastWord}
          </Accent>
        </>
      );
    };

  /* =========================================================
     FUTURE READY HEADING
  ========================================================== */

  const renderFutureReadyHeading =
    () => {
      const text =
        futureReadyShortDescription;

      const target =
        "Aatmanirbhar Bharat";

      if (
        text
          .toLowerCase()
          .includes(
            target.toLowerCase()
          )
      ) {
        const index =
          text.toLowerCase().indexOf(
            target.toLowerCase()
          );

        const before =
          text.slice(0, index);

        const after =
          text.slice(
            index +
              target.length
          );

        return (
          <>
            {before}

            <Accent>
              {text.slice(
                index,
                index +
                  target.length
              )}
            </Accent>

            {after}
          </>
        );
      }

      const words =
        text
          .split(/\s+/)
          .filter(Boolean);

      if (
        words.length >= 2
      ) {
        return (
          <>
            {words
              .slice(0, -2)
              .join(" ")}{" "}

            <Accent>
              {words
                .slice(-2)
                .join(" ")}
            </Accent>
          </>
        );
      }

      return text;
    };

  return (
    <Section
      id="voices"
      surface="light"
      label="Voices of the movement"
      className={styles.voices}
      ref={ref}
    >
      {/* =====================================================
          CHAPTER SEVEN HEADER
      ====================================================== */}

      <div className={styles.head}>
        <Reveal as="p">
          <Eyebrow center>
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
            {renderChapterHeading()}
          </Display>
        </Reveal>
      </div>

      {/* =====================================================
          TESTIMONIAL SLIDER
      ====================================================== */}

      <div
        className={
          styles.sliderWrapper
        }
      >
        {isLoading ? (
          <div
            className={
              styles.mobileContainer
            }
          >
            <article
              className={styles.card}
            >
              <p
                className={
                  styles.mark
                }
              >
                &ldquo;
              </p>

              <div className="h-6 w-2/3 rounded bg-black/10 animate-pulse" />

              <div className="mt-4 h-4 w-full rounded bg-black/10 animate-pulse" />

              <div className="mt-2 h-4 w-5/6 rounded bg-black/10 animate-pulse" />

              <div className="mt-8 h-12 w-40 rounded bg-black/10 animate-pulse" />
            </article>
          </div>
        ) : testimonialsError ? (
          <div
            className={
              styles.mobileContainer
            }
          >
            <article
              className={styles.card}
            >
              <p
                className={
                  styles.mark
                }
              >
                &ldquo;
              </p>

              <q>
                Unable to load
                testimonials right
                now.
              </q>
            </article>
          </div>
        ) : noTestimonials ? (
          <div
            className={
              styles.mobileContainer
            }
          >
            <article
              className={styles.card}
            >
              <p
                className={
                  styles.mark
                }
              >
                &ldquo;
              </p>

              <q>
                No testimonials
                available yet.
              </q>
            </article>
          </div>
        ) : isMobile ? (
          /* =================================================
             MOBILE
          ================================================== */

          <div
            className={
              styles.mobileContainer
            }
            onTouchStart={
              handleTouchStart
            }
            onTouchMove={
              handleTouchMove
            }
            onTouchEnd={
              handleTouchEnd
            }
          >
            <AnimatePresence mode="wait">
              {currentTestimonial && (
                <motion.div
                  key={
                    currentTestimonial.id
                  }
                  className={
                    styles.mobileCard
                  }
                  initial={{
                    opacity: 0,
                    y: 50,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -50,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <TestimonialCard
                    testimonial={
                      currentTestimonial
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className={
                styles.dots
              }
            >
              {testimonials.map(
                (
                  testimonial,
                  index
                ) => (
                  <button
                    key={
                      testimonial.id
                    }
                    type="button"
                    className={cx(
                      styles.dot,
                      index ===
                        currentIndex &&
                        styles.activeDot
                    )}
                    onClick={() =>
                      setCurrentIndex(
                        index
                      )
                    }
                    aria-label={`Go to testimonial ${
                      index + 1
                    }`}
                  />
                )
              )}
            </div>
          </div>
        ) : (
          /* =================================================
             DESKTOP
          ================================================== */

          <motion.div
            className={
              styles.row
            }
            style={
              reduced
                ? undefined
                : { x }
            }
            drag="x"
            dragConstraints={{
              left:
                -(
                  duplicatedTestimonials.length *
                  380
                ),
              right: 0,
            }}
            dragElastic={0.08}
            dragMomentum
          >
            {duplicatedTestimonials.map(
              (
                testimonial,
                index
              ) => (
                <TestimonialCard
                  key={`${testimonial.id}-${index}`}
                  testimonial={
                    testimonial
                  }
                />
              )
            )}
          </motion.div>
        )}
      </div>

      {/* =====================================================
          FUTURE READY / COMPLIANT
      ====================================================== */}

      <Wrap
        className={
          styles.closing
        }
      >
        <Reveal as="p">
          <Eyebrow center>
            {futureReadyHeading}
          </Eyebrow>
        </Reveal>

        <Reveal
          as="div"
          delay={0.08}
        >
          <Display
            as="h3"
            size="md"
            style={{
              marginTop: 16,
            }}
          >
            {renderFutureReadyHeading()}
          </Display>
        </Reveal>

        {/* =================================================
            4 DYNAMIC API CARDS
        ================================================== */}

        {compliance.length > 0 && (
          <Reveal
            as="div"
            delay={0.16}
            className={
              valStyles.grid
            }
            style={{
              marginTop:
                "var(--space-4)",
              textAlign:
                "left",
            }}
          >
            {compliance.map(
              (item) => (
                <article
                  key={item.id}
                  className={cx(
                    valStyles.val,
                    valStyles.compact
                  )}
                >
                  <span
                    className={
                      valStyles.idx
                    }
                  >
                    {item.idx}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.body}
                  </p>
                </article>
              )
            )}
          </Reveal>
        )}
      </Wrap>
    </Section>
  );
}

/* =========================================================
   TESTIMONIAL CARD
========================================================= */

function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  const [expanded, setExpanded] =
    useState(false);

  const text =
    testimonial.text?.trim() || "";

  const [
    isLongText,
    setIsLongText,
  ] = useState(false);

  const textRef =
    useRef<HTMLQuoteElement>(null);

  /* =========================================================
     CHECK IF TEXT EXCEEDS 4 LINES
  ========================================================== */

  useEffect(() => {
    const checkTextHeight =
      () => {
        const element =
          textRef.current;

        if (!element) return;

        const computed =
          window.getComputedStyle(
            element
          );

        const lineHeight =
          parseFloat(
            computed.lineHeight
          );

        if (!lineHeight) {
          setIsLongText(false);
          return;
        }

        const maxHeight =
          lineHeight * 4;

        setIsLongText(
          element.scrollHeight >
            maxHeight + 2
        );
      };

    const timer =
      setTimeout(
        checkTextHeight,
        50
      );

    window.addEventListener(
      "resize",
      checkTextHeight
    );

    return () => {
      clearTimeout(timer);

      window.removeEventListener(
        "resize",
        checkTextHeight
      );
    };
  }, [text]);

  /* =========================================================
     FOUR LINE CLAMP STYLE
  ========================================================== */

  const fourLineClampStyle =
    expanded
      ? undefined
      : {
          display: "-webkit-box",
          WebkitBoxOrient:
            "vertical" as const,
          WebkitLineClamp: 4,
          overflow: "hidden",
        };

  return (
    <article
      className={
        styles.card
      }
    >
      {/* Quote */}
      <p
        className={
          styles.mark
        }
        aria-hidden="true"
      >
        &ldquo;
      </p>

      {/* =================================================
          VOICE TEXT
          EXACTLY 4 LINES
      ================================================== */}

      <div className="relative">
        <q
          ref={textRef}
          style={fourLineClampStyle}
        >
          {text}
        </q>

        {isLongText && (
          <button
            type="button"
            onClick={() =>
              setExpanded(
                (prev) => !prev
              )
            }
            className="mt-2 inline-flex items-center text-sm font-medium transition-opacity hover:opacity-70"
            style={{
              color:
                "var(--gold, #C9A227)",
            }}
          >
            {expanded
              ? "Read Less"
              : "Read More"}
          </button>
        )}
      </div>

      {/* =================================================
          PERSON
      ================================================== */}

      <div
        className={
          styles.who
        }
      >
        <span
          className={
            styles.av
          }
        >
          {testimonial.video_path ? (
            <video
              src={
                testimonial.video_path
              }
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-black text-white text-sm font-medium">
              {(
                testimonial.person_name ||
                "A"
              )
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
        </span>

        <span>
          <span
            className={
              styles.name
            }
          >
            {
              testimonial.person_name
            }
          </span>

          <br />

          <span
            className={
              styles.role
            }
          >
            {testimonial.rating
              ? `Rating ${testimonial.rating}/10`
              : "IndieKonnect Customer"}
          </span>
        </span>
      </div>
    </article>
  );
}