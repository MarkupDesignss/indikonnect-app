"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";

import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Maximize2,
    Minimize2,
    MessageCircle,
    Pause,
    Play,
    Share2,
    UserRound,
    Volume2,
    VolumeX,
    X,
    Zap,
} from "lucide-react";

// ============================================================
// API
// ============================================================

import { useGetReelsQuery } from "@/lib/redux/api/Home/contentApi";

// ============================================================
// TYPES
// ============================================================

interface ReelProduct {
    id?: number | string;
    slug?: string;
    product_slug?: string;

    name?: string;
    title?: string;

    price?: number | string;
    sale_price?: number | string;
    regular_price?: number | string;

    primary_image_url?: string;
    image_url?: string;
    thumbnail_url?: string;
    image?: string;
}

interface Reel {
    id: number | string;

    title?: string | null;

    creator_handle?: string | null;
    creator_name?: string | null;
    creator?: string | null;

    followers_count?: number | string | null;

    views_count?: number | string | null;
    view_count?: number | string | null;
    views?: number | string | null;

    likes_count?: number | string | null;
    like_count?: number | string | null;

    video_path?: string | null;
    video_url?: string | null;
    video_full_url?: string | null;
    video_full_path?: string | null;
    videoUrl?: string | null;
    url?: string | null;

    thumbnail?: string | null;
    thumbnail_url?: string | null;
    thumbnailUrl?: string | null;

    cover_image?: string | null;
    cover_image_url?: string | null;

    product?: ReelProduct | null;
    products?: ReelProduct[];

    is_published?: boolean;
    sort_order?: number;

    [key: string]: any;
}

interface ShopReelsProps {
    reelsData?: any;
    isLoading?: boolean;
    reelsError?: any;
}

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_BASE_URL =
    "https://www.markupdesigns.net/indikonnect/storage/";

const FALLBACK_IMAGE =
    "/indiekonnect-web/images/placeholder.jpg";

// ============================================================
// HELPERS
// ============================================================

function normalizeReelsResponse(input: any): Reel[] {
    if (!input) return [];

    if (Array.isArray(input)) {
        return input;
    }

    if (Array.isArray(input?.data)) {
        return input.data;
    }

    if (Array.isArray(input?.data?.data)) {
        return input.data.data;
    }

    if (Array.isArray(input?.reels)) {
        return input.reels;
    }

    if (Array.isArray(input?.data?.reels)) {
        return input.data.reels;
    }

    if (Array.isArray(input?.results)) {
        return input.results;
    }

    return [];
}

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
        cleanPath.startsWith("products/")
    ) {
        return `${STORAGE_BASE_URL}${cleanPath}`;
    }

    return url;
}

function getReelVideo(reel: Reel): string {
    const value =
        reel?.video_full_path ||
        reel?.video_full_url ||
        reel?.video_url ||
        reel?.videoUrl ||
        reel?.url ||
        reel?.video_path ||
        "";

    return normalizeAssetUrl(value);
}

function getReelThumbnail(reel: Reel): string {
    const value =
        reel?.thumbnail_url ||
        reel?.thumbnailUrl ||
        reel?.cover_image_url ||
        reel?.cover_image ||
        reel?.thumbnail ||
        "";

    return normalizeAssetUrl(value) || FALLBACK_IMAGE;
}

function getCreatorName(reel: Reel): string {
    return (
        reel?.creator_handle ||
        reel?.creator_name ||
        reel?.creator ||
        "Creator"
    );
}

function getReelProduct(
    reel: Reel | null
): ReelProduct | null {
    if (!reel) return null;

    if (reel?.product) {
        return reel.product;
    }

    if (
        Array.isArray(reel?.products) &&
        reel.products.length > 0
    ) {
        return reel.products[0];
    }

    return null;
}

function formatNumber(
    value?: number | string | null
): string {
    const number = Number(value || 0);

    if (number >= 1000000) {
        return `${(number / 1000000).toFixed(1)}M`;
    }

    if (number >= 1000) {
        return `${(number / 1000).toFixed(1)}K`;
    }

    return String(number);
}

function getViews(reel: Reel): string {
    return formatNumber(
        reel?.views_count ??
        reel?.view_count ??
        reel?.views ??
        0
    );
}

function getLikes(reel: Reel): string {
    return formatNumber(
        reel?.likes_count ??
        reel?.like_count ??
        0
    );
}

function getProductImage(
    product: ReelProduct | null
): string {
    if (!product) return FALLBACK_IMAGE;

    return (
        normalizeAssetUrl(
            product?.primary_image_url ||
            product?.image_url ||
            product?.thumbnail_url ||
            product?.image
        ) || FALLBACK_IMAGE
    );
}

function getProductPrice(
    product: ReelProduct | null
): string {
    if (!product) return "";

    const price =
        product?.sale_price ??
        product?.price ??
        product?.regular_price ??
        "";

    if (price === "") return "";

    return `₹${Number(price).toLocaleString("en-IN")}`;
}

// ============================================================
// COMPONENT
// ============================================================

export default function ShopReels({
    reelsData,
    isLoading: parentLoading,
    reelsError: parentError,
}: ShopReelsProps) {
    const router = useRouter();

    // ============================================================
    // API
    // ============================================================

    const shouldUseHook = reelsData === undefined;

    const {
        data: hookReelsData,
        isLoading: hookLoading,
        error: hookError,
    } = useGetReelsQuery(undefined, {
        skip: !shouldUseHook,
    });

    const rawReelsData = shouldUseHook
        ? hookReelsData
        : reelsData;

    const isLoading = shouldUseHook
        ? hookLoading
        : Boolean(parentLoading);

    const error = shouldUseHook
        ? hookError
        : parentError;

    const reels = useMemo(() => {
        return normalizeReelsResponse(rawReelsData);
    }, [rawReelsData]);

    // ============================================================
    // STATE
    // ============================================================

    const [selectedIndex, setSelectedIndex] =
        useState<number | null>(null);

    const [direction, setDirection] =
        useState<1 | -1>(1);

    const [isMuted, setIsMuted] =
        useState(true);

    const [isPlaying, setIsPlaying] =
        useState(true);

    const [isFullscreen, setIsFullscreen] =
        useState(false);

    const [isTransitioning, setIsTransitioning] =
        useState(false);

    const videoRef =
        useRef<HTMLVideoElement | null>(null);

    const stageRef =
        useRef<HTMLDivElement | null>(null);

    // ============================================================
    // SELECTED
    // ============================================================

    const selectedReel =
        selectedIndex !== null
            ? reels[selectedIndex] ?? null
            : null;

    // ============================================================
    // OPEN
    // ============================================================

    const openReel = useCallback(
        (index: number) => {
            setSelectedIndex(index);
            setDirection(1);
            setIsMuted(true);
            setIsPlaying(true);
        },
        []
    );

    // ============================================================
    // CLOSE
    // ============================================================

    const closeReel = useCallback(() => {
        setSelectedIndex(null);
        setIsTransitioning(false);

        if (videoRef.current) {
            videoRef.current.pause();
        }

        if (
            typeof document !== "undefined" &&
            document.fullscreenElement
        ) {
            document.exitFullscreen?.().catch(() => { });
        }
    }, []);

    // ============================================================
    // NEXT
    // ============================================================

    const handleNext = useCallback(
        (
            event?: React.MouseEvent | React.PointerEvent
        ) => {
            event?.stopPropagation();

            if (
                !reels.length ||
                selectedIndex === null ||
                isTransitioning
            ) {
                return;
            }

            setDirection(1);
            setIsTransitioning(true);

            setSelectedIndex((current) => {
                if (current === null) return 0;

                return (
                    (current + 1) % reels.length
                );
            });

            setIsMuted(true);
            setIsPlaying(true);

            window.setTimeout(() => {
                setIsTransitioning(false);
            }, 500);
        },
        [
            reels.length,
            selectedIndex,
            isTransitioning,
        ]
    );

    // ============================================================
    // PREVIOUS
    // ============================================================

    const handlePrevious = useCallback(
        (
            event?: React.MouseEvent | React.PointerEvent
        ) => {
            event?.stopPropagation();

            if (
                !reels.length ||
                selectedIndex === null ||
                isTransitioning
            ) {
                return;
            }

            setDirection(-1);
            setIsTransitioning(true);

            setSelectedIndex((current) => {
                if (current === null) return 0;

                return (
                    (current - 1 + reels.length) %
                    reels.length
                );
            });

            setIsMuted(true);
            setIsPlaying(true);

            window.setTimeout(() => {
                setIsTransitioning(false);
            }, 500);
        },
        [
            reels.length,
            selectedIndex,
            isTransitioning,
        ]
    );

    // ============================================================
    // PLAY / PAUSE
    // ============================================================

    const togglePlay = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();

            const video = videoRef.current;

            if (!video) return;

            if (video.paused) {
                video
                    .play()
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch(() => { });
            } else {
                video.pause();
                setIsPlaying(false);
            }
        },
        []
    );

    // ============================================================
    // MUTE
    // ============================================================

    const toggleMute = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();

            const video = videoRef.current;

            if (!video) return;

            const nextMuted = !isMuted;

            video.muted = nextMuted;

            setIsMuted(nextMuted);
        },
        [isMuted]
    );

    // ============================================================
    // FULLSCREEN
    // ============================================================

    const toggleFullscreen = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();

            const stage = stageRef.current;

            if (!stage) return;

            if (!document.fullscreenElement) {
                stage
                    .requestFullscreen?.()
                    .catch(() => { });
            } else {
                document
                    .exitFullscreen?.()
                    .catch(() => { });
            }
        },
        []
    );

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(
                Boolean(document.fullscreenElement)
            );
        };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    // ============================================================
    // SHARE
    // ============================================================

    const handleShare = useCallback(
        async (event: React.MouseEvent) => {
            event.stopPropagation();

            if (!selectedReel) return;

            const shareUrl =
                typeof window !== "undefined"
                    ? `${window.location.origin}/reels/${selectedReel.id}`
                    : "";

            try {
                if (navigator.share) {
                    await navigator.share({
                        title:
                            selectedReel.title ||
                            "Check out this reel",
                        url: shareUrl,
                    });

                    return;
                }

                await navigator.clipboard?.writeText(
                    shareUrl
                );
            } catch {
                // User cancelled.
            }
        },
        [selectedReel]
    );

    // ============================================================
    // PRODUCT
    // ============================================================

    const handleProductClick = useCallback(
        (
            event: React.MouseEvent,
            product: ReelProduct | null
        ) => {
            event.stopPropagation();

            if (!product) return;

            const slug =
                product?.slug ||
                product?.product_slug;

            if (slug) {
                router.push(`/product/${slug}`);
                return;
            }

            if (product?.id) {
                router.push(`/product/${product.id}`);
            }
        },
        [router]
    );

    // ============================================================
    // VIDEO EVENTS
    // ============================================================

    const handleVideoPlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const handleVideoPause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    // ============================================================
    // BODY LOCK
    // ============================================================

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

    // ============================================================
    // KEYBOARD
    // ============================================================

    useEffect(() => {
        if (selectedIndex === null) return;

        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeReel();
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
                    video.play().catch(() => { });
                } else {
                    video.pause();
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
        closeReel,
        handleNext,
        handlePrevious,
    ]);

    // ============================================================
    // RESET VIDEO
    // ============================================================

    useEffect(() => {
        if (
            selectedIndex === null ||
            !selectedReel
        ) {
            return;
        }

        const timer = window.setTimeout(() => {
            const video = videoRef.current;

            if (!video) return;

            video.currentTime = 0;
            video.muted = true;

            setIsMuted(true);

            video
                .play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(() => {
                    setIsPlaying(false);
                });
        }, 80);

        return () => {
            window.clearTimeout(timer);
        };
    }, [selectedIndex, selectedReel]);

    // ============================================================
    // LOADING
    // ============================================================

    if (isLoading) {
        return (
            <section className="w-full bg-white py-16">
                <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
                    <div className="mb-10 text-center">
                        <div className="mx-auto mb-3 h-3 w-24 animate-pulse rounded-full bg-gray-200" />
                        <div className="mx-auto h-10 w-64 animate-pulse rounded-lg bg-gray-200" />
                    </div>

                    <div className="flex gap-5 overflow-hidden">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="
                  h-[430px]
                  min-w-[245px]
                  animate-pulse
                  rounded-[26px]
                  bg-gray-200
                  sm:h-[500px]
                  sm:min-w-[280px]
                "
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ============================================================
    // ERROR / EMPTY
    // ============================================================

    if (error || !reels.length) {
        return null;
    }

    // ============================================================
    // GET SIDE REELS
    // ============================================================

    const getPreviousIndex = () => {
        if (selectedIndex === null) return 0;

        return (
            (selectedIndex - 1 + reels.length) %
            reels.length
        );
    };

    const getNextIndex = () => {
        if (selectedIndex === null) return 0;

        return (
            (selectedIndex + 1) % reels.length
        );
    };

    const previousReel =
        selectedIndex !== null
            ? reels[getPreviousIndex()]
            : null;

    const nextReel =
        selectedIndex !== null
            ? reels[getNextIndex()]
            : null;

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <>
            {/* ========================================================
          SHOP REELS SECTION
      ======================================================== */}

            <section className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24">

                {/* Soft background glow */}

                <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[#0F1A3C]/[0.035] blur-[100px]" />

                <div className="relative mx-auto w-full max-w-[1550px] px-5 sm:px-8 lg:px-12">

                    {/* ==================================================
              HEADER
          ================================================== */}

                    <div className="mb-10 text-center">

                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0F1A3C]/50">
                            Discover
                        </p>

                        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#0F1A3C] sm:text-4xl lg:text-5xl">
                            Shop the Reel
                        </h2>

                        <div className="mx-auto mt-5 h-px w-16 bg-[#0F1A3C]/20" />

                    </div>

                    {/* ==================================================
              REEL CARDS
          ================================================== */}

                    <div
                        className="
              flex
              gap-5
              overflow-x-auto
              pb-4
              scrollbar-hide
              snap-x
              snap-mandatory
            "
                    >

                        {reels.map((reel, index) => {

                            const thumbnail =
                                getReelThumbnail(reel);

                            const creator =
                                getCreatorName(reel);

                            const product =
                                getReelProduct(reel);

                            return (
                                <motion.button
                                    key={String(reel.id)}
                                    type="button"
                                    onClick={() =>
                                        openReel(index)
                                    }
                                    whileHover={{
                                        y: -6,
                                    }}
                                    className="
                    group
                    relative
                    h-[430px]
                    min-w-[245px]
                    snap-start
                    overflow-hidden
                    rounded-[26px]
                    bg-black
                    text-left
                    shadow-[0_18px_50px_rgba(15,26,60,0.13)]
                    sm:h-[500px]
                    sm:min-w-[285px]
                  "
                                >

                                    {/* IMAGE */}

                                    <Image
                                        src={thumbnail}
                                        alt={
                                            reel?.title ||
                                            "Reel"
                                        }
                                        fill
                                        sizes="285px"
                                        className="
                      object-cover
                      transition
                      duration-700
                      group-hover:scale-105
                    "
                                    />

                                    {/* GRADIENT */}

                                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/85" />

                                    {/* PLAY */}

                                    <div
                                        className="
                      absolute
                      left-1/2
                      top-1/2
                      flex
                      h-14
                      w-14
                      -translate-x-1/2
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      bg-white/95
                      text-[#0F1A3C]
                      shadow-2xl
                      transition
                      duration-300
                      group-hover:scale-110
                    "
                                    >
                                        <Play
                                            size={21}
                                            fill="currentColor"
                                            className="ml-0.5"
                                        />
                                    </div>

                                    {/* TOP */}

                                    <div className="absolute left-4 right-4 top-4 flex items-center justify-between">

                                        <div className="rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                                            @{creator}
                                        </div>

                                        <div className="flex items-center gap-1 rounded-full bg-black/35 px-3 py-1.5 text-[11px] text-white backdrop-blur-md">
                                            <Eye size={12} />
                                            {getViews(reel)}
                                        </div>

                                    </div>

                                    {/* BOTTOM */}

                                    <div className="absolute bottom-0 left-0 right-0 p-5">

                                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">
                                            {reel?.title ||
                                                "Discover this reel"}
                                        </h3>

                                        {product && (
                                            <div className="mt-4 flex items-center gap-3">

                                                <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-white">
                                                    <Image
                                                        src={getProductImage(
                                                            product
                                                        )}
                                                        alt={
                                                            product?.name ||
                                                            product?.title ||
                                                            "Product"
                                                        }
                                                        fill
                                                        sizes="44px"
                                                        className="object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0">

                                                    <p className="truncate text-xs font-medium text-white">
                                                        {product?.name ||
                                                            product?.title ||
                                                            "Product"}
                                                    </p>

                                                    <p className="mt-0.5 text-xs font-semibold text-white/80">
                                                        {getProductPrice(
                                                            product
                                                        )}
                                                    </p>

                                                </div>

                                            </div>
                                        )}

                                    </div>

                                </motion.button>
                            );
                        })}

                    </div>
                </div>
            </section>

            {/* ========================================================
          FULL SCREEN REEL VIEWER
      ======================================================== */}

            <AnimatePresence>
                {selectedReel &&
                    selectedIndex !== null && (
                        <motion.div
                            key="reel-modal"
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.25,
                            }}
                            className="
                fixed
                inset-0
                z-[99999]
                flex
                h-[100dvh]
                w-full
                items-center
                justify-center
                overflow-hidden
                bg-black/80
                backdrop-blur-[14px]
              "
                            onClick={closeReel}
                        >

                            {/* ==================================================
                  BACKGROUND DARK OVERLAY
              ================================================== */}

                            <div className="pointer-events-none absolute inset-0 bg-black/45" />

                            {/* ==================================================
                  CLOSE BUTTON
              ================================================== */}

                            <button
                                type="button"
                                aria-label="Close"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    closeReel();
                                }}
                                className="
                  absolute
                  right-5
                  top-4
                  z-[200]
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  text-white
                  transition
                  hover:bg-white/10
                "
                            >
                                <X
                                    size={30}
                                    strokeWidth={2}
                                />
                            </button>

                            {/* ==================================================
                  FULLSCREEN TOGGLE
              ================================================== */}

                            <button
                                type="button"
                                aria-label={
                                    isFullscreen
                                        ? "Exit fullscreen"
                                        : "Enter fullscreen"
                                }
                                onClick={toggleFullscreen}
                                className="
                  absolute
                  right-6
                  top-[68px]
                  z-[200]
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-white
                  transition
                  hover:bg-white/10
                "
                            >
                                {isFullscreen ? (
                                    <Minimize2
                                        size={18}
                                        strokeWidth={2}
                                    />
                                ) : (
                                    <Maximize2
                                        size={18}
                                        strokeWidth={2}
                                    />
                                )}
                            </button>

                            {/* ==================================================
                  VIEWER STAGE
              ================================================== */}

                            <div
                                className="
                  relative
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  overflow-hidden
                "
                                style={{
                                    perspective: "1800px",
                                }}
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                            >

                                {/* ==================================================
                    PREVIOUS REEL
                ================================================== */}

                                {reels.length > 1 &&
                                    previousReel && (
                                        <motion.div
                                            key={`previous-${previousReel.id}`}
                                            initial={{
                                                opacity: 0,
                                                x: -70,
                                                scale: 0.88,
                                            }}
                                            animate={{
                                                opacity: 0.42,
                                                x: 0,
                                                scale: 0.86,
                                            }}
                                            className="
                        pointer-events-none
                        absolute
                        left-[calc(50%-600px)]
                        hidden
                        h-[78vh]
                        max-h-[720px]
                        w-[300px]
                        overflow-hidden
                        rounded-[20px]
                        bg-black
                        shadow-[0_30px_80px_rgba(0,0,0,0.5)]
                        lg:block
                      "
                                        >

                                            <Image
                                                src={getReelThumbnail(
                                                    previousReel
                                                )}
                                                alt=""
                                                fill
                                                sizes="300px"
                                                className="object-cover"
                                            />

                                            <div className="absolute inset-0 bg-black/45" />

                                            {/* caption + shop now */}
                                            <div className="absolute inset-x-0 bottom-9 px-4">
                                                <p className="line-clamp-1 text-[12px] font-medium text-white/85">
                                                    {previousReel?.title ||
                                                        "Discover this reel"}
                                                </p>

                                                <div className="mt-2 flex justify-center">
                                                    <span
                                                        className="
                              rounded-lg
                              bg-[#0F1A3C]
                              px-4
                              py-1.5
                              text-[11px]
                              font-semibold
                              text-white
                            "
                                                    >
                                                        Shop Now
                                                    </span>
                                                </div>
                                            </div>

                                            {/* powered by */}
                                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/70 py-1.5">
                                                <span className="text-[9px] font-medium text-white/60">
                                                    Powered By
                                                </span>
                                                <span className="flex items-center gap-1 text-[9px] font-semibold text-white">
                                                    <Zap
                                                        size={9}
                                                        className="text-amber-400"
                                                        fill="currentColor"
                                                    />
                                                    Saleassist.Ai
                                                </span>
                                            </div>

                                        </motion.div>
                                    )}

                                {/* ==================================================
                    NEXT REEL
                ================================================== */}

                                {reels.length > 1 &&
                                    nextReel && (
                                        <motion.div
                                            key={`next-${nextReel.id}`}
                                            initial={{
                                                opacity: 0,
                                                x: 70,
                                                scale: 0.88,
                                            }}
                                            animate={{
                                                opacity: 0.42,
                                                x: 0,
                                                scale: 0.86,
                                            }}
                                            className="
                        pointer-events-none
                        absolute
                        right-[calc(50%-600px)]
                        hidden
                        h-[78vh]
                        max-h-[720px]
                        w-[300px]
                        overflow-hidden
                        rounded-[20px]
                        bg-black
                        shadow-[0_30px_80px_rgba(0,0,0,0.5)]
                        lg:block
                      "
                                        >

                                            <Image
                                                src={getReelThumbnail(
                                                    nextReel
                                                )}
                                                alt=""
                                                fill
                                                sizes="300px"
                                                className="object-cover"
                                            />

                                            <div className="absolute inset-0 bg-black/45" />

                                            {/* caption + shop now */}
                                            <div className="absolute inset-x-0 bottom-9 px-4">
                                                <p className="line-clamp-1 text-[12px] font-medium text-white/85">
                                                    {nextReel?.title ||
                                                        "Discover this reel"}
                                                </p>

                                                <div className="mt-2 flex justify-center">
                                                    <span
                                                        className="
                              rounded-lg
                              bg-[#0F1A3C]
                              px-4
                              py-1.5
                              text-[11px]
                              font-semibold
                              text-white
                            "
                                                    >
                                                        Shop Now
                                                    </span>
                                                </div>
                                            </div>

                                            {/* powered by */}
                                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/70 py-1.5">
                                                <span className="text-[9px] font-medium text-white/60">
                                                    Powered By
                                                </span>
                                                <span className="flex items-center gap-1 text-[9px] font-semibold text-white">
                                                    <Zap
                                                        size={9}
                                                        className="text-amber-400"
                                                        fill="currentColor"
                                                    />
                                                    Saleassist.Ai
                                                </span>
                                            </div>

                                        </motion.div>
                                    )}

                                {/* ==================================================
                    MAIN REEL
                ================================================== */}

                                <AnimatePresence
                                    initial={false}
                                    custom={direction}
                                    mode="sync"
                                >

                                    <motion.div
                                        key={String(
                                            selectedReel.id
                                        )}
                                        ref={stageRef}
                                        custom={direction}
                                        initial={{
                                            opacity: 0,
                                            x:
                                                direction === 1
                                                    ? 120
                                                    : -120,
                                            rotateY:
                                                direction === 1
                                                    ? 8
                                                    : -8,
                                            scale: 0.94,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                            rotateY: 0,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            x:
                                                direction === 1
                                                    ? -120
                                                    : 120,
                                            rotateY:
                                                direction === 1
                                                    ? -8
                                                    : 8,
                                            scale: 0.94,
                                        }}
                                        transition={{
                                            duration: 0.48,
                                            ease: [
                                                0.22,
                                                1,
                                                0.36,
                                                1,
                                            ],
                                        }}
                                        className="
                      relative
                      h-[100dvh]
                      w-full
                      overflow-hidden
                      bg-black
                      shadow-[0_35px_100px_rgba(0,0,0,0.7)]
                      sm:h-[92vh]
                      sm:max-h-[830px]
                      sm:w-[calc(92vh*0.5625)]
                      sm:max-w-[470px]
                      sm:rounded-[20px]
                    "
                                        style={{
                                            transformStyle:
                                                "preserve-3d",
                                            willChange:
                                                "transform",
                                        }}
                                    >

                                        {/* ==================================================
                        VIDEO
                    ================================================== */}

                                        <video
                                            ref={videoRef}
                                            key={getReelVideo(
                                                selectedReel
                                            )}
                                            src={getReelVideo(
                                                selectedReel
                                            )}
                                            poster={getReelThumbnail(
                                                selectedReel
                                            )}
                                            autoPlay
                                            playsInline
                                            muted={isMuted}
                                            preload="auto"
                                            onClick={
                                                togglePlay
                                            }
                                            className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        cursor-pointer
                        object-cover
                        bg-black
                      "
                                            onPlay={
                                                handleVideoPlay
                                            }
                                            onPause={
                                                handleVideoPause
                                            }
                                        />

                                        {/* ==================================================
                        VIDEO GRADIENT
                    ================================================== */}

                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-45% to-black/75" />

                                        {/* ==================================================
                        CENTER PLAY (shown only when paused)
                    ================================================== */}

                                        {!isPlaying && (
                                            <button
                                                type="button"
                                                onClick={
                                                    togglePlay
                                                }
                                                aria-label="Play"
                                                className="
                          absolute
                          left-1/2
                          top-1/2
                          z-30
                          flex
                          h-16
                          w-16
                          -translate-x-1/2
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          bg-white/90
                          text-[#0F1A3C]
                          shadow-2xl
                        "
                                            >
                                                <Play
                                                    size={26}
                                                    fill="currentColor"
                                                    className="ml-1"
                                                />
                                            </button>
                                        )}

                                        {/* ==================================================
                        TOP VIEW COUNT
                    ================================================== */}

                                        <div
                                            className="
                        absolute
                        left-3
                        top-3
                        z-30
                        flex
                        items-center
                        gap-1.5
                        rounded-[8px]
                        bg-black/65
                        px-3
                        py-1.5
                        text-[13px]
                        font-semibold
                        text-white
                        backdrop-blur-md
                      "
                                        >
                                            <Eye
                                                size={14}
                                                strokeWidth={2.4}
                                            />

                                            {getViews(
                                                selectedReel
                                            )}
                                        </div>

                                        {/* ==================================================
                        TOP RIGHT ACTIONS
                    ================================================== */}

                                        <div
                                            className="
                        absolute
                        right-3
                        top-3
                        z-40
                        flex
                        flex-col
                        items-center
                        gap-3
                      "
                                        >

                                            {/* SOUND */}

                                            <button
                                                type="button"
                                                onClick={
                                                    toggleMute
                                                }
                                                aria-label={
                                                    isMuted
                                                        ? "Unmute"
                                                        : "Mute"
                                                }
                                                className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-black/35
                          text-white
                          backdrop-blur-md
                          transition
                          hover:bg-white
                          hover:text-black
                        "
                                            >
                                                {isMuted ? (
                                                    <VolumeX
                                                        size={18}
                                                    />
                                                ) : (
                                                    <Volume2
                                                        size={18}
                                                    />
                                                )}
                                            </button>

                                            {/* SHARE */}

                                            <button
                                                type="button"
                                                onClick={
                                                    handleShare
                                                }
                                                aria-label="Share"
                                                className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-black/35
                          text-white
                          backdrop-blur-md
                          transition
                          hover:bg-white
                          hover:text-black
                        "
                                            >
                                                <Share2
                                                    size={18}
                                                />
                                            </button>

                                            {/* PROFILE */}

                                            <button
                                                type="button"
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                                className="
                          relative
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-black/35
                          text-white
                          backdrop-blur-md
                          transition
                          hover:bg-white
                          hover:text-black
                        "
                                            >
                                                <UserRound
                                                    size={18}
                                                />

                                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-black bg-emerald-400" />
                                            </button>

                                        </div>

                                        {/* ==================================================
                        LEFT ARROW
                    ================================================== */}

                                        {reels.length > 1 && (
                                            <button
                                                type="button"
                                                aria-label="Previous reel"
                                                onClick={
                                                    handlePrevious
                                                }
                                                className="
                          absolute
                          left-[-70px]
                          top-1/2
                          z-[100]
                          hidden
                          h-12
                          w-12
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          text-black
                          shadow-2xl
                          transition
                          hover:scale-105
                          sm:flex
                        "
                                            >
                                                <ChevronLeft
                                                    size={27}
                                                    strokeWidth={2.5}
                                                />
                                            </button>
                                        )}

                                        {/* ==================================================
                        RIGHT ARROW
                    ================================================== */}

                                        {reels.length > 1 && (
                                            <button
                                                type="button"
                                                aria-label="Next reel"
                                                onClick={
                                                    handleNext
                                                }
                                                className="
                          absolute
                          right-[-70px]
                          top-1/2
                          z-[100]
                          hidden
                          h-12
                          w-12
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          text-black
                          shadow-2xl
                          transition
                          hover:scale-105
                          sm:flex
                        "
                                            >
                                                <ChevronRight
                                                    size={27}
                                                    strokeWidth={2.5}
                                                />
                                            </button>
                                        )}

                                        {/* ==================================================
                        CREATOR
                    ================================================== */}

                                        <div className="absolute bottom-[124px] left-5 right-20 z-30">

                                            <div className="mb-3 flex items-center gap-2">

                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[12px] font-bold text-[#0F1A3C]">
                                                    {getCreatorName(
                                                        selectedReel
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <span className="text-xs font-semibold text-white drop-shadow-lg">
                                                    @
                                                    {getCreatorName(
                                                        selectedReel
                                                    )}
                                                </span>

                                            </div>

                                            <p className="line-clamp-2 text-[14px] font-medium leading-relaxed text-white/90 drop-shadow-lg sm:text-[15px]">
                                                {selectedReel?.title ||
                                                    "people feel seen..."}
                                            </p>

                                        </div>

                                        {/* ==================================================
                        PRODUCT PREVIEW
                    ================================================== */}

                                        {getReelProduct(
                                            selectedReel
                                        ) && (
                                                <button
                                                    type="button"
                                                    onClick={(event) =>
                                                        handleProductClick(
                                                            event,
                                                            getReelProduct(
                                                                selectedReel
                                                            )
                                                        )
                                                    }
                                                    className="
                          absolute
                          bottom-[105px]
                          left-4
                          hidden
                          max-w-[190px]
                          items-center
                          gap-2
                          rounded-xl
                          bg-white/95
                          p-1.5
                          text-left
                          shadow-xl
                          backdrop-blur-xl
                          sm:flex
                        "
                                                >

                                                    <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg">
                                                        <Image
                                                            src={getProductImage(
                                                                getReelProduct(
                                                                    selectedReel
                                                                )
                                                            )}
                                                            alt="Product"
                                                            fill
                                                            sizes="36px"
                                                            className="object-cover"
                                                        />
                                                    </div>

                                                    <div className="min-w-0 pr-2">

                                                        <p className="truncate text-[10px] font-semibold text-[#0F1A3C]">
                                                            {getReelProduct(
                                                                selectedReel
                                                            )?.name ||
                                                                getReelProduct(
                                                                    selectedReel
                                                                )?.title ||
                                                                "Product"}
                                                        </p>

                                                        <p className="text-[10px] font-bold text-[#0F1A3C]/70">
                                                            {getProductPrice(
                                                                getReelProduct(
                                                                    selectedReel
                                                                )
                                                            )}
                                                        </p>

                                                    </div>

                                                </button>
                                            )}

                                        {/* ==================================================
                        SHOP NOW
                    ================================================== */}

                                        <div
                                            className="
                        absolute
                        bottom-14
                        left-1/2
                        z-50
                        -translate-x-1/2
                      "
                                        >

                                            {getReelProduct(
                                                selectedReel
                                            ) ? (
                                                <button
                                                    type="button"
                                                    onClick={(event) =>
                                                        handleProductClick(
                                                            event,
                                                            getReelProduct(
                                                                selectedReel
                                                            )
                                                        )
                                                    }
                                                    className="
                            rounded-xl
                            bg-[#0F1A3C]
                            px-6
                            py-3
                            text-[14px]
                            font-semibold
                            text-white
                            shadow-[0_8px_25px_rgba(0,0,0,0.35)]
                            transition
                            hover:scale-105
                            hover:bg-[#162653]
                            active:scale-95
                          "
                                                >
                                                    Shop Now
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(event) =>
                                                        event.stopPropagation()
                                                    }
                                                    className="
                            rounded-xl
                            bg-[#0F1A3C]
                            px-6
                            py-3
                            text-[14px]
                            font-semibold
                            text-white
                            shadow-[0_8px_25px_rgba(0,0,0,0.35)]
                            transition
                            hover:scale-105
                          "
                                                >
                                                    Shop Now
                                                </button>
                                            )}

                                        </div>

                                        {/* ==================================================
                        POWERED BY
                    ================================================== */}

                                        <div
                                            className="
                        absolute
                        inset-x-0
                        bottom-0
                        z-40
                        flex
                        items-center
                        justify-center
                        gap-1.5
                        bg-black/70
                        py-2.5
                        backdrop-blur-md
                      "
                                        >
                                            <span className="text-[11px] font-medium text-white/60">
                                                Powered By
                                            </span>

                                            <span className="flex items-center gap-1 text-[11px] font-semibold text-white">
                                                <Zap
                                                    size={12}
                                                    className="text-amber-400"
                                                    fill="currentColor"
                                                />
                                                Saleassist.Ai
                                            </span>
                                        </div>

                                    </motion.div>

                                </AnimatePresence>

                                {/* ==================================================
                    MOBILE ARROWS
                ================================================== */}

                                {reels.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            aria-label="Previous"
                                            onClick={
                                                handlePrevious
                                            }
                                            className="
                        absolute
                        left-2
                        top-1/2
                        z-[300]
                        flex
                        h-10
                        w-10
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        bg-black/40
                        text-white
                        backdrop-blur-md
                        sm:hidden
                      "
                                        >
                                            <ChevronLeft
                                                size={22}
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            aria-label="Next"
                                            onClick={
                                                handleNext
                                            }
                                            className="
                        absolute
                        right-2
                        top-1/2
                        z-[300]
                        flex
                        h-10
                        w-10
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        bg-black/40
                        text-white
                        backdrop-blur-md
                        sm:hidden
                      "
                                        >
                                            <ChevronRight
                                                size={22}
                                            />
                                        </button>
                                    </>
                                )}

                            </div>
                        </motion.div>
                    )}
            </AnimatePresence>
        </>
    );
}