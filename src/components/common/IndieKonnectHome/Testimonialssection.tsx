"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Maximize,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import { useGetTestimonialsQuery } from "@/lib/redux/api/testimonialApi";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface Testimonial {
  id: number;
  video_path: string;
  video_title: string;
  person_name: string;
  heading: string;
  rating: string;
  text: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  view_counts?: number | string;
}

/* ------------------------------------------------------------------ */
/* Helper Functions                                                   */
/* ------------------------------------------------------------------ */

function normalizeAssetUrl(value?: string | null): string {
  if (!value) return "";

  const url = String(value).trim();

  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const cleanPath = url.replace(/^\/+/, "");

  if (cleanPath.startsWith("storage/")) {
    return `https://www.markupdesigns.net/indikonnect/${cleanPath}`;
  }

  if (
    cleanPath.startsWith("reels/") ||
    cleanPath.startsWith("uploads/") ||
    cleanPath.startsWith("products/") ||
    cleanPath.startsWith("testimonials/")
  ) {
    return `https://www.markupdesigns.net/indikonnect/storage/${cleanPath}`;
  }

  return url;
}

function getTestimonialVideo(testimonial: Testimonial): string {
  return normalizeAssetUrl(testimonial?.video_path || "");
}

function formatNumber(value?: number | string | null): string {
  if (!value) return "0";

  const num = Number(value);

  if (isNaN(num)) return "0";

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }

  return num.toString();
}

/* ------------------------------------------------------------------ */
/* Video Play Helper                                                  */
/* ------------------------------------------------------------------ */

function safelyPlayVideo(
  video: HTMLVideoElement | null,
  muted: boolean
) {
  if (!video) return;

  try {
    video.muted = muted;
    video.playsInline = true;

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Browser may block autoplay with sound.
      });
    }
  } catch {
    // Ignore playback errors.
  }
}

/* ------------------------------------------------------------------ */
/* Side Preview Component                                             */
/* ------------------------------------------------------------------ */

function TestimonialSidePreview({
  testimonial,
  side,
}: {
  testimonial: Testimonial;
  side: "left" | "right";
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoUrl = getTestimonialVideo(testimonial);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    safelyPlayVideo(video, true);

    const handleLoadedData = () => {
      safelyPlayVideo(video, true);
    };

    const handleCanPlay = () => {
      safelyPlayVideo(video, true);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener(
        "loadeddata",
        handleLoadedData
      );

      video.removeEventListener(
        "canplay",
        handleCanPlay
      );

      video.pause();
    };
  }, [videoUrl]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: side === "left" ? -60 : 60,
        scale: 0.88,
      }}
      animate={{
        opacity: 0.38,
        x: 0,
        scale: 0.82,
      }}
      exit={{
        opacity: 0,
        x: side === "left" ? -60 : 60,
        scale: 0.88,
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`pointer-events-none absolute top-1/2 z-[20] hidden h-[68vh] w-[240px] -translate-y-1/2 overflow-hidden rounded-[15px] bg-black shadow-[0_25px_70px_rgba(0,0,0,0.38)] lg:block ${
        side === "left"
          ? "right-[calc(50%+180px)]"
          : "left-[calc(50%+180px)]"
      }`}
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          onLoadedData={() =>
            safelyPlayVideo(videoRef.current, true)
          }
          onCanPlay={() =>
            safelyPlayVideo(videoRef.current, true)
          }
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
      )}

      <div className="absolute inset-0 bg-black/48" />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function CustomerTestimonials() {
  const { data, isLoading, isError } = useGetTestimonialsQuery();

  const testimonials: Testimonial[] = useMemo(() => {
    return data?.data?.data ?? [];
  }, [data]);

  /* ---------------------------------------------------------------- */
  /* Modal State                                                     */
  /* ---------------------------------------------------------------- */

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    null
  );

  const [direction, setDirection] = useState<1 | -1>(1);

  const [isMuted, setIsMuted] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const [mounted, setMounted] = useState(false);

  /* ---------------------------------------------------------------- */
  /* Carousel State                                                   */
  /* ---------------------------------------------------------------- */

  const [activeIndex, setActiveIndex] = useState(0);

  const [isPaused, setIsPaused] = useState(false);

  /* ---------------------------------------------------------------- */
  /* Refs                                                             */
  /* ---------------------------------------------------------------- */

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);

  /* ---------------------------------------------------------------- */
  /* Mount                                                            */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Keep active index valid                                          */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (testimonials.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((previous) => {
      if (previous >= testimonials.length) {
        return testimonials.length - 1;
      }

      return previous;
    });
  }, [testimonials.length]);

  /* ---------------------------------------------------------------- */
  /* Relative Offset                                                  */
  /* ---------------------------------------------------------------- */

  const getRelativeOffset = useCallback(
    (index: number, currentIndex: number) => {
      if (testimonials.length === 0) {
        return 0;
      }

      let offset = index - currentIndex;

      const half = Math.floor(testimonials.length / 2);

      if (offset > half) {
        offset -= testimonials.length;
      }

      if (offset < -half) {
        offset += testimonials.length;
      }

      return offset;
    },
    [testimonials.length]
  );

  /* ---------------------------------------------------------------- */
  /* Carousel Controls                                                */
  /* ---------------------------------------------------------------- */

  const nextSlide = useCallback(() => {
    if (testimonials.length <= 1) return;

    setActiveIndex((previous) => {
      return (previous + 1) % testimonials.length;
    });
  }, [testimonials.length]);

  const previousSlide = useCallback(() => {
    if (testimonials.length <= 1) return;

    setActiveIndex((previous) => {
      return (
        (previous - 1 + testimonials.length) %
        testimonials.length
      );
    });
  }, [testimonials.length]);

  /* ---------------------------------------------------------------- */
  /* Auto Slide                                                       */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (isPaused || testimonials.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((previous) => {
        return (previous + 1) % testimonials.length;
      });
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPaused, testimonials.length]);

  /* ---------------------------------------------------------------- */
  /* Visible Cards                                                    */
  /* ---------------------------------------------------------------- */

  const visibleCards = useMemo(() => {
    return testimonials.map((item, index) => ({
      ...item,
      offset: getRelativeOffset(index, activeIndex),
    }));
  }, [
    testimonials,
    activeIndex,
    getRelativeOffset,
  ]);

  /* ---------------------------------------------------------------- */
  /* Open Modal                                                       */
  /* ---------------------------------------------------------------- */

  const openModal = useCallback((index: number) => {
    setSelectedIndex(index);

    setDirection(1);

    setIsMuted(true);

    setIsPlaying(true);

    setIsTransitioning(false);
  }, []);

  /* ---------------------------------------------------------------- */
  /* Close Modal                                                      */
  /* ---------------------------------------------------------------- */

  const closeModal = useCallback(() => {
    setSelectedIndex(null);

    setIsTransitioning(false);

    if (videoRef.current) {
      videoRef.current.pause();
    }

    if (
      typeof document !== "undefined" &&
      document.fullscreenElement
    ) {
      document.exitFullscreen?.().catch(() => {});
    }

    setIsFullscreen(false);
  }, []);

  /* ---------------------------------------------------------------- */
  /* Modal Next                                                       */
  /* ---------------------------------------------------------------- */

  const handleNext = useCallback(
    (event?: MouseEvent | PointerEvent) => {
      event?.preventDefault();
      event?.stopPropagation();

      if (
        !testimonials.length ||
        selectedIndex === null ||
        isTransitioning
      ) {
        return;
      }

      setDirection(1);

      setIsTransitioning(true);

      setIsPlaying(true);

      setSelectedIndex((current) => {
        if (current === null) {
          return 0;
        }

        return (
          (current + 1) % testimonials.length
        );
      });

      window.setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    },
    [
      testimonials.length,
      selectedIndex,
      isTransitioning,
    ]
  );

  /* ---------------------------------------------------------------- */
  /* Modal Previous                                                   */
  /* ---------------------------------------------------------------- */

  const handlePrevious = useCallback(
    (event?: MouseEvent | PointerEvent) => {
      event?.preventDefault();
      event?.stopPropagation();

      if (
        !testimonials.length ||
        selectedIndex === null ||
        isTransitioning
      ) {
        return;
      }

      setDirection(-1);

      setIsTransitioning(true);

      setIsPlaying(true);

      setSelectedIndex((current) => {
        if (current === null) {
          return 0;
        }

        return (
          (current - 1 + testimonials.length) %
          testimonials.length
        );
      });

      window.setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    },
    [
      testimonials.length,
      selectedIndex,
      isTransitioning,
    ]
  );

  /* ---------------------------------------------------------------- */
  /* Play / Pause                                                     */
  /* ---------------------------------------------------------------- */

  const togglePlay = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();

      const video = videoRef.current;

      if (!video) return;

      if (video.paused) {
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {});
      } else {
        video.pause();

        setIsPlaying(false);
      }
    },
    []
  );

  /* ---------------------------------------------------------------- */
  /* Mute                                                             */
  /* ---------------------------------------------------------------- */

  const toggleMute = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();

      const video = videoRef.current;

      if (!video) return;

      const nextMuted = !isMuted;

      video.muted = nextMuted;

      setIsMuted(nextMuted);

      if (!nextMuted && video.paused) {
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {});
      }
    },
    [isMuted]
  );

  /* ---------------------------------------------------------------- */
  /* Fullscreen                                                       */
  /* ---------------------------------------------------------------- */

  const toggleFullscreen = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();

      const stage = stageRef.current;

      if (!stage) return;

      if (!document.fullscreenElement) {
        stage
          .requestFullscreen?.()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch(() => {});
      } else {
        document
          .exitFullscreen?.()
          .then(() => {
            setIsFullscreen(false);
          })
          .catch(() => {});
      }
    },
    []
  );

  /* ---------------------------------------------------------------- */
  /* Fullscreen Listener                                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const handleFullscreen = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement)
      );
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Body Lock                                                        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (selectedIndex === null) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedIndex]);

  /* ---------------------------------------------------------------- */
  /* Keyboard Shortcuts                                               */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        event.preventDefault();

        closeModal();

        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();

        handleNext();

        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();

        handlePrevious();

        return;
      }

      if (event.key === " ") {
        event.preventDefault();

        const video = videoRef.current;

        if (!video) return;

        if (video.paused) {
          video
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {});
        } else {
          video.pause();

          setIsPlaying(false);
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedIndex,
    closeModal,
    handleNext,
    handlePrevious,
  ]);

  /* ---------------------------------------------------------------- */
  /* Auto Play Modal Video                                            */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (
      selectedIndex === null ||
      !testimonials[selectedIndex]
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const video = videoRef.current;

      if (!video) return;

      try {
        video.currentTime = 0;
      } catch {
        // Ignore currentTime errors.
      }

      video.muted = isMuted;

      safelyPlayVideo(video, isMuted);

      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    selectedIndex,
    testimonials,
    isMuted,
  ]);

  /* ---------------------------------------------------------------- */
  /* Loading                                                          */
  /* ---------------------------------------------------------------- */

  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden bg-white py-14">
        <div className="flex min-h-[420px] items-center justify-center">
          <p className="text-sm text-[#777777]">
            Loading testimonials...
          </p>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Error                                                            */
  /* ---------------------------------------------------------------- */

  if (isError) {
    return (
      <section className="relative w-full overflow-hidden bg-white py-14">
        <div className="flex min-h-[420px] items-center justify-center">
          <p className="text-sm text-red-500">
            Failed to load testimonials.
          </p>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Empty                                                            */
  /* ---------------------------------------------------------------- */

  if (testimonials.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-white py-14">
        <div className="relative z-30 mb-7 px-4 text-center">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0F1A3C]/50">
            Discover
          </span>

          <h2 className="font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[34px] lg:text-[40px]">
            Customer Testimonials And Stories
          </h2>

          <p className="mx-auto mt-3 max-w-[520px] text-[11px] leading-5 text-[#777777] sm:text-[13px] sm:leading-6">
            No testimonials available right now.
          </p>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Selected Modal Data                                              */
  /* ---------------------------------------------------------------- */

  const selectedTestimonial =
    selectedIndex !== null
      ? testimonials[selectedIndex] ?? null
      : null;

  const previousIndex =
    selectedIndex === null
      ? 0
      : (selectedIndex - 1 + testimonials.length) %
        testimonials.length;

  const nextIndex =
    selectedIndex === null
      ? 0
      : (selectedIndex + 1) %
        testimonials.length;

  const previousTestimonial =
    testimonials[previousIndex] || null;

  const nextTestimonial =
    testimonials[nextIndex] || null;

  /* ---------------------------------------------------------------- */
  /* Carousel Video Card                                              */
  /* ---------------------------------------------------------------- */

  const renderCardVideo = (
    item: Testimonial,
    isCenter: boolean
  ) => {
    const videoUrl = getTestimonialVideo(item);

    if (!videoUrl) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
      );
    }

    return (
      <video
        key={`${item.id}-${videoUrl}`}
        src={videoUrl}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        loop
        autoPlay
        preload="auto"
        onLoadedData={(event) => {
          safelyPlayVideo(
            event.currentTarget,
            true
          );
        }}
        onCanPlay={(event) => {
          safelyPlayVideo(
            event.currentTarget,
            true
          );
        }}
        onError={() => {
          // Ignore individual video errors.
        }}
        style={{
          willChange: isCenter
            ? "auto"
            : "transform",
        }}
      />
    );
  };

  /* ---------------------------------------------------------------- */
  /* Modal                                                           */
  /* ---------------------------------------------------------------- */

  const modalContent =
    mounted &&
    selectedTestimonial &&
    selectedIndex !== null
      ? createPortal(
          <div
            className="fixed inset-0 z-[2147483647] flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-black/80"
            style={{
              isolation: "isolate",
              zIndex: 2147483647,
            }}
            onClick={closeModal}
          >
            {/* ----------------------------------------------------- */}
            {/* Blurred Background                                    */}
            {/* ----------------------------------------------------- */}

            <div
              className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center blur-[25px]"
              style={{
                backgroundImage: `url("${getTestimonialVideo(
                  selectedTestimonial
                )}")`,
              }}
            />

            <div className="pointer-events-none absolute inset-0 bg-black/65 backdrop-blur-[9px]" />

            {/* ----------------------------------------------------- */}
            {/* Global Top Right Controls                             */}
            {/* ----------------------------------------------------- */}

            <div
              className="absolute right-4 top-3 z-[2147483647] flex flex-col items-center gap-2"
              style={{
                zIndex: 2147483647,
              }}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={(event) => {
                  event.stopPropagation();

                  closeModal();
                }}
                className="flex h-10 w-10 items-center justify-center text-white transition duration-200 hover:scale-110"
              >
                <X
                  size={32}
                  strokeWidth={2}
                />
              </button>

              <button
                type="button"
                aria-label={
                  isFullscreen
                    ? "Exit fullscreen"
                    : "Fullscreen"
                }
                onClick={toggleFullscreen}
                className="flex h-10 w-10 items-center justify-center text-white transition duration-200 hover:scale-110"
              >
                <Maximize
                  size={22}
                  strokeWidth={1.8}
                />
              </button>
            </div>

            {/* ----------------------------------------------------- */}
            {/* Stage                                                  */}
            {/* ----------------------------------------------------- */}

            <motion.div
              className="relative flex h-full w-full items-center justify-center"
              style={{
                zIndex: 2147483646,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* -------------------------------------------------- */}
              {/* Left Preview                                       */}
              {/* -------------------------------------------------- */}

              <AnimatePresence>
                {testimonials.length > 1 &&
                  previousTestimonial && (
                    <TestimonialSidePreview
                      key={`left-${previousTestimonial.id}`}
                      testimonial={
                        previousTestimonial
                      }
                      side="left"
                    />
                  )}
              </AnimatePresence>

              {/* -------------------------------------------------- */}
              {/* Right Preview                                      */}
              {/* -------------------------------------------------- */}

              <AnimatePresence>
                {testimonials.length > 1 &&
                  nextTestimonial && (
                    <TestimonialSidePreview
                      key={`right-${nextTestimonial.id}`}
                      testimonial={nextTestimonial}
                      side="right"
                    />
                  )}
              </AnimatePresence>

              {/* -------------------------------------------------- */}
              {/* Main Testimonial Card                              */}
              {/* -------------------------------------------------- */}

              <AnimatePresence
                initial={false}
                mode="wait"
              >
                <motion.div
                  key={String(
                    selectedTestimonial.id
                  )}
                  ref={stageRef}
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                    x:
                      direction === 1
                        ? 35
                        : -35,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.96,
                    x:
                      direction === 1
                        ? -35
                        : 35,
                  }}
                  transition={{
                    duration: 0.32,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative z-[200] h-[88vh] max-h-[820px] w-[400px] overflow-hidden bg-black shadow-[0_30px_100px_rgba(0,0,0,0.65)] md:rounded-[5px]"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  {/* ------------------------------------------- */}
                  {/* Main Video                                   */}
                  {/* ------------------------------------------- */}

                  {getTestimonialVideo(
                    selectedTestimonial
                  ) ? (
                    <video
                      ref={videoRef}
                      key={getTestimonialVideo(
                        selectedTestimonial
                      )}
                      src={getTestimonialVideo(
                        selectedTestimonial
                      )}
                      autoPlay
                      loop
                      playsInline
                      muted={isMuted}
                      preload="auto"
                      onClick={togglePlay}
                      onLoadedData={(event) => {
                        safelyPlayVideo(
                          event.currentTarget,
                          isMuted
                        );
                      }}
                      onCanPlay={(event) => {
                        safelyPlayVideo(
                          event.currentTarget,
                          isMuted
                        );
                      }}
                      onPlay={() =>
                        setIsPlaying(true)
                      }
                      onPause={() =>
                        setIsPlaying(false)
                      }
                      className="absolute inset-0 h-full w-full cursor-pointer bg-black object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <p className="text-sm text-white/60">
                        No video available
                      </p>
                    </div>
                  )}

                  {/* ------------------------------------------- */}
                  {/* Top Gradient                                  */}
                  {/* ------------------------------------------- */}

                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-black/30 to-transparent" />

                  {/* ------------------------------------------- */}
                  {/* Bottom Gradient                               */}
                  {/* ------------------------------------------- */}

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[23%] bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* ------------------------------------------- */}
                  {/* Mute                                         */}
                  {/* ------------------------------------------- */}

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={
                      isMuted
                        ? "Unmute"
                        : "Mute"
                    }
                    className="absolute right-3 top-3 z-[500] flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                  >
                    {isMuted ? (
                      <VolumeX size={20} />
                    ) : (
                      <Volume2 size={20} />
                    )}
                  </button>

                  {/* ------------------------------------------- */}
                  {/* Person Name                                   */}
                  {/* ------------------------------------------- */}

                  <div className="absolute bottom-8 left-6 right-6 z-[600]">
                    <h3 className="text-[20px] font-semibold leading-tight text-white drop-shadow-lg sm:text-[24px]">
                      {
                        selectedTestimonial.person_name
                      }
                    </h3>

                    {selectedTestimonial.heading && (
                      <p className="mt-1 text-[13px] text-white/70 drop-shadow">
                        {
                          selectedTestimonial.heading
                        }
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* -------------------------------------------------- */}
              {/* Desktop Previous                                 */}
              {/* -------------------------------------------------- */}

              {testimonials.length > 1 && (
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={handlePrevious}
                  className="absolute left-[calc(50%-240px)] top-1/2 z-[2147483647] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_25px_rgba(0,0,0,0.28)] transition-all duration-200 hover:scale-110 hover:bg-black hover:text-white lg:flex xl:left-[calc(50%-245px)]"
                  style={{
                    zIndex: 2147483647,
                  }}
                >
                  <ChevronLeft
                    size={23}
                    strokeWidth={2.5}
                  />
                </button>
              )}

              {/* -------------------------------------------------- */}
              {/* Desktop Next                                      */}
              {/* -------------------------------------------------- */}

              {testimonials.length > 1 && (
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={handleNext}
                  className="absolute right-[calc(50%-240px)] top-1/2 z-[2147483647] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_25px_rgba(0,0,0,0.28)] transition-all duration-200 hover:scale-110 hover:bg-black hover:text-white lg:right-[calc(50%-245px)]"
                  style={{
                    zIndex: 2147483647,
                  }}
                >
                  <ChevronRight
                    size={23}
                    strokeWidth={2.5}
                  />
                </button>
              )}

              {/* -------------------------------------------------- */}
              {/* Mobile Previous                                  */}
              {/* -------------------------------------------------- */}

              {testimonials.length > 1 && (
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 z-[2147483647] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md md:hidden"
                  style={{
                    zIndex: 2147483647,
                  }}
                >
                  <ChevronLeft size={25} />
                </button>
              )}

              {/* -------------------------------------------------- */}
              {/* Mobile Next                                      */}
              {/* -------------------------------------------------- */}

              {testimonials.length > 1 && (
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 z-[2147483647] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md md:hidden"
                  style={{
                    zIndex: 2147483647,
                  }}
                >
                  <ChevronRight size={25} />
                </button>
              )}
            </motion.div>
          </div>,
          document.body
        )
      : null;

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* ============================================================ */}
      {/* TESTIMONIALS CAROUSEL SECTION                               */}
      {/* ============================================================ */}

      <section className="relative w-full overflow-hidden bg-white py-8 sm:py-10 md:py-12 lg:py-14">
        {/* Heading */}

        <div className="relative z-30 mb-7 px-4 text-center sm:mb-8 md:mb-9">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0F1A3C]/50">
            Discover
          </span>

          <h2 className="font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[34px] lg:text-[40px]">
            Customer Testimonials And Stories
          </h2>

          <p className="mx-auto mt-2 max-w-[520px] text-[11px] leading-5 text-[#777777] sm:text-[13px] sm:leading-6">
            Real stories from our happy customers.
          </p>

          <div className="mx-auto mt-5 h-px w-16 bg-[#0F1A3C]/20" />
        </div>

        {/* Slider */}

        <div
          className="relative mx-auto flex h-[380px] w-full items-center justify-center sm:h-[400px] md:h-[420px]"
          onMouseEnter={() =>
            setIsPaused(true)
          }
          onMouseLeave={() =>
            setIsPaused(false)
          }
        >
          {/* -------------------------------------------------------- */}
          {/* Previous Carousel Button                                */}
          {/* -------------------------------------------------------- */}

          {testimonials.length > 1 && (
            <button
              type="button"
              onClick={previousSlide}
              aria-label="Previous testimonial"
              className="absolute left-0 top-1/2 z-[80] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-105 hover:bg-[#f7f7f7] sm:h-10 sm:w-10"
            >
              <ChevronLeft
                size={25}
                strokeWidth={1.8}
                className="text-[#686868]"
              />
            </button>
          )}

          {/* -------------------------------------------------------- */}
          {/* Next Carousel Button                                    */}
          {/* -------------------------------------------------------- */}

          {testimonials.length > 1 && (
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next testimonial"
              className="absolute right-0 top-1/2 z-[80] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#242424] bg-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#f7f7f7] sm:h-10 sm:w-10"
            >
              <ChevronRight
                size={25}
                strokeWidth={1.8}
                className="text-[#686868]"
              />
            </button>
          )}

          {/* -------------------------------------------------------- */}
          {/* Cards                                                   */}
          {/* -------------------------------------------------------- */}
          {/*
            CIRCLE / ARC LOOK
            -----------------
            Har card ka WIDTH ab FIXED hai (220px) — chahe center ho ya
            side wala, size same rahegi. Sirf scale/opacity/rotate se
            depth ka illusion milega, isliye 3 cards left aur 2 cards
            right (ya koi bhi uneven split) dikhein to bhi farak nahi
            padega, sab ek jaisi width ke honge.

            "rotate" + curved "y" values circle jaisa arc bana dete
            hain (jaise cards ek ghoome hue circle par rakhe ho), aur
            "x" step pehle se kam kiya hai taaki spacing tight lage,
            spread-out wala look na aaye.
          */}

          <div className="relative h-full w-full max-w-[1280px]" style={{ perspective: "1400px" }}>
            {visibleCards.map((item) => {
              const { offset } = item;

              if (Math.abs(offset) > 3) {
                return null;
              }

              const isCenter = offset === 0;

              // Fixed width for every card — only side depth changes.
              const CARD_WIDTH = 220;

              const cardConfig = {
                "-3": {
                  x: -360,
                  y: 82,
                  scale: 0.72,
                  rotate: -10,
                  opacity: 0.85,
                  z: 10,
                  width: CARD_WIDTH,
                  height: 320,
                },

                "-2": {
                  x: -255,
                  y: 50,
                  scale: 0.8,
                  rotate: -7,
                  opacity: 0.95,
                  z: 20,
                  width: CARD_WIDTH,
                  height: 355,
                },

                "-1": {
                  x: -140,
                  y: 22,
                  scale: 0.9,
                  rotate: -4,
                  opacity: 1,
                  z: 30,
                  width: CARD_WIDTH,
                  height: 390,
                },

                "0": {
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotate: 0,
                  opacity: 1,
                  z: 60,
                  width: CARD_WIDTH,
                  height: 430,
                },

                "1": {
                  x: 140,
                  y: 22,
                  scale: 0.9,
                  rotate: 4,
                  opacity: 1,
                  z: 30,
                  width: CARD_WIDTH,
                  height: 390,
                },

                "2": {
                  x: 255,
                  y: 50,
                  scale: 0.8,
                  rotate: 7,
                  opacity: 0.95,
                  z: 20,
                  width: CARD_WIDTH,
                  height: 355,
                },

                "3": {
                  x: 360,
                  y: 82,
                  scale: 0.72,
                  rotate: 10,
                  opacity: 0.85,
                  z: 10,
                  width: CARD_WIDTH,
                  height: 320,
                },
              };

              const config =
                cardConfig[
                  offset.toString() as keyof typeof cardConfig
                ];

              if (!config) {
                return null;
              }

              const viewCount =
                item.view_counts ?? 0;

              return (
                <div
                  key={item.id}
                  className="absolute left-1/2 top-1/2 cursor-pointer"
                  onClick={() => {
                    const targetIndex =
                      testimonials.findIndex(
                        (testimonial) =>
                          testimonial.id === item.id
                      );

                    if (targetIndex !== -1) {
                      openModal(targetIndex);
                    }
                  }}
                  style={{
                    width: `${config.width}px`,
                    height: `${config.height}px`,
                    zIndex: config.z,
                    opacity: config.opacity,

                    transform: `
                      translate(
                        calc(-50% + ${config.x}px),
                        calc(-50% + ${config.y}px)
                      )
                      scale(${config.scale})
                      rotate(${config.rotate}deg)
                    `,

                    transition:
                      "transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease",
                  }}
                >
                  <div
                    className={[
                      "relative h-full w-full overflow-hidden rounded-[14px] bg-[#dcdcdc]",
                      "shadow-[0_9px_28px_rgba(0,0,0,0.22)]",
                      isCenter
                        ? "ring-1 ring-black/5"
                        : "",
                    ].join(" ")}
                  >
                    {/* VIDEO */}

                    {renderCardVideo(
                      item,
                      isCenter
                    )}

                    {/* Overlay */}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />

                    {/* View Count */}

                    <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-white backdrop-blur-[3px]">
                      <Eye
                        size={12}
                        strokeWidth={2.3}
                      />

                      <span className="text-[11px] font-semibold leading-none">
                        {formatNumber(viewCount)}
                      </span>
                    </div>

                    {/* Person Name */}

                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <h3 className="truncate text-[14px] font-semibold leading-tight text-white sm:text-[16px]">
                        {item.person_name}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PORTALED MODAL                                               */}
      {/* ============================================================ */}

      {modalContent}
    </>
  );
}