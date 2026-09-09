
"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Maximize,
    Volume2,
    VolumeX,
    X,
} from "lucide-react";

import { useGetReelsQuery } from "@/lib/redux/api/Home/contentApi";

interface ReelProduct {
    id?: number | string;
    slug?: string;
    product_slug?: string;
    name?: string;
    title?: string;
    price?: number | string;
    sale_price?: number | string;
    regular_price?: number | string;
    retail_price?: number | string;
    primary_image_url?: string;
    image_url?: string;
    thumbnail_url?: string;
    image?: string;
    product_image?: {
        image?: string;
    };
    brand_name?: string;
    brand?: string;
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
    onModalOpen?: () => void;
    onModalClose?: () => void;
}

const STORAGE_BASE_URL =
    "https://www.markupdesigns.net/indikonnect/storage/";

const FALLBACK_IMAGE =
    "/indiekonnect-web/images/placeholder.jpg";

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

function getReelProduct(
    reel: Reel | null,
): ReelProduct | null {
    if (!reel) return null;

    if (reel.product) {
        return reel.product;
    }

    if (
        Array.isArray(reel.products) &&
        reel.products.length > 0
    ) {
        return reel.products[0];
    }

    return null;
}

function getProductImage(
    product: ReelProduct | null,
): string {
    if (!product) {
        return FALLBACK_IMAGE;
    }

    if (product?.product_image?.image) {
        return (
            normalizeAssetUrl(
                product.product_image.image,
            ) || FALLBACK_IMAGE
        );
    }

    return (
        normalizeAssetUrl(
            product?.primary_image_url ||
            product?.image_url ||
            product?.thumbnail_url ||
            product?.image,
        ) || FALLBACK_IMAGE
    );
}

function getProductPrice(
    product: ReelProduct | null,
): string {
    if (!product) return "";

    const price =
        product?.retail_price ??
        product?.sale_price ??
        product?.price ??
        product?.regular_price ??
        "";

    if (price === "") return "";

    return `₹${Number(price).toLocaleString("en-IN")}`;
}

function getProductSlug(
    product: ReelProduct | null,
): string {
    if (!product) return "";

    return (
        product?.slug ||
        product?.product_slug ||
        ""
    );
}

/* ================================================================
   FORMAT NUMBER
================================================================ */

function formatNumber(
    value?: number | string | null,
): string {
    if (!value) return "0";

    const num = Number(value);

    if (isNaN(num)) return "0";

    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    }

    if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }

    return num.toString();
}

/* ================================================================
   REEL ROW
================================================================ */

function ShopReelsRow({
    reels = [],
    isLoading,
    error,
    openReel,
}: {
    reels: Reel[];
    isLoading?: boolean;
    error?: any;
    openReel: (index: number) => void;
}) {
    const scrollRef =
        useRef<HTMLDivElement>(null);

    const scroll = (
        direction: "left" | "right",
    ) => {
        if (!scrollRef.current) {
            return;
        }

        scrollRef.current.scrollBy({
            left:
                direction === "left"
                    ? -270
                    : 270,
            behavior: "smooth",
        });
    };

    if (isLoading) {
        return (
            <div className="flex gap-4 overflow-hidden px-1">
                {[1, 2, 3, 4, 5].map(
                    (item) => (
                        <div
                            key={item}
                            className="h-[300px] w-[190px] shrink-0 animate-pulse rounded-[14px] bg-[#f2f1ec] sm:h-[380px] sm:w-[235px]"
                        />
                    ),
                )}
            </div>
        );
    }

    if (error || !reels.length) {
        return null;
    }

    return (
        <div className="relative">
            {/* LEFT */}
            <button
                type="button"
                aria-label="Previous"
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:scale-105 sm:flex"
            >
                <ChevronLeft size={20} />
            </button>

            {/* RIGHT */}
            <button
                type="button"
                aria-label="Next"
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:scale-105 sm:flex"
            >
                <ChevronRight size={20} />
            </button>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto px-1 pb-2 sm:px-10"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {reels.map((reel, index) => {
                    const videoUrl =
                        getReelVideo(reel);

                    const thumbnail =
                        getReelThumbnail(reel);

                    const viewCount =
                        reel?.views_count ||
                        reel?.view_count ||
                        reel?.views ||
                        0;

                    const creatorName =
                        reel?.creator_name ||
                        reel?.creator ||
                        reel?.creator_handle ||
                        "Creator";

                    return (
                        <button
                            type="button"
                            key={String(reel.id)}
                            onClick={() =>
                                openReel(index)
                            }
                            className="group relative h-[300px] w-[190px] shrink-0 overflow-hidden rounded-[14px] bg-black shadow-[0_10px_30px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1 sm:h-[380px] sm:w-[235px]"
                        >
                            {videoUrl ? (
                                <video
                                    src={videoUrl}
                                    poster={thumbnail}
                                    muted
                                    autoPlay
                                    loop
                                    playsInline
                                    preload="metadata"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : (
                                <img
                                    src={thumbnail}
                                    alt="Reel"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                            {/* Views Count */}
                            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg backdrop-blur-md">
                                <Eye
                                    size={12}
                                    strokeWidth={2}
                                    className="shrink-0 text-white"
                                />

                                <span className="leading-none">
                                    {formatNumber(
                                        viewCount,
                                    )}
                                </span>
                            </div>


                            {/* Shop Now Badge */}
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                                <span className="font-serif rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-[9px] uppercase tracking-[0.14em] text-white backdrop-blur-xl sm:text-[10px]">
                                    Shop Now
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ================================================================
   SIDE PREVIEW
================================================================ */

function ReelSidePreview({
    reel,
    side,
}: {
    reel: Reel;
    side: "left" | "right";
}) {
    const videoRef =
        useRef<HTMLVideoElement | null>(
            null,
        );

    const videoUrl =
        getReelVideo(reel);

    const thumbnail =
        getReelThumbnail(reel);

    useEffect(() => {
        const video =
            videoRef.current;

        if (!video) return;

        video.muted = true;

        video.play().catch(() => { });

        return () => {
            video.pause();
        };
    }, [videoUrl]);

    return (
        <motion.div
            initial={{
                opacity: 0,
                x:
                    side === "left"
                        ? -60
                        : 60,
                scale: 0.88,
            }}
            animate={{
                opacity: 0.38,
                x: 0,
                scale: 0.82,
            }}
            exit={{
                opacity: 0,
                x:
                    side === "left"
                        ? -60
                        : 60,
                scale: 0.88,
            }}
            transition={{
                duration: 0.4,
                ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                ],
            }}
            className={`pointer-events-none absolute top-1/2 z-[20] hidden h-[76vh] w-[285px] -translate-y-1/2 overflow-hidden rounded-[15px] bg-black shadow-[0_25px_70px_rgba(0,0,0,0.38)] lg:block ${side === "left"
                ? "right-[calc(50%+208px)]"
                : "left-[calc(50%+208px)]"
                }`}
        >
            {videoUrl ? (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={thumbnail}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <img
                    src={thumbnail}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            )}

            <div className="absolute inset-0 bg-black/48" />
        </motion.div>
    );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

export default function ShopReels({
    reelsData,
    isLoading: parentLoading,
    reelsError: parentError,
    onModalOpen,
    onModalClose,
}: ShopReelsProps) {
    const router = useRouter();

    const [
        selectedIndex,
        setSelectedIndex,
    ] = useState<number | null>(null);

    const [direction, setDirection] =
        useState<1 | -1>(1);

    const [isMuted, setIsMuted] =
        useState(true);

    const [isPlaying, setIsPlaying] =
        useState(true);

    const [
        isFullscreen,
        setIsFullscreen,
    ] = useState(false);

    const [
        isTransitioning,
        setIsTransitioning,
    ] = useState(false);

    const [mounted, setMounted] =
        useState(false);

    const videoRef =
        useRef<HTMLVideoElement | null>(
            null,
        );

    const stageRef =
        useRef<HTMLDivElement | null>(
            null,
        );

    const shouldUseHook =
        reelsData === undefined;

    const {
        data: hookReelsData,
        isLoading: hookLoading,
        error: hookError,
    } = useGetReelsQuery(
        undefined,
        {
            skip: !shouldUseHook,
        },
    );

    /* ============================================================
       MOUNT
    ============================================================ */

    useEffect(() => {
        setMounted(true);

        return () => {
            setMounted(false);
        };
    }, []);

    /* ============================================================
       DATA
    ============================================================ */

    const rawReelsData =
        shouldUseHook
            ? hookReelsData
            : reelsData;

    const isLoading =
        shouldUseHook
            ? hookLoading
            : Boolean(parentLoading);

    const error =
        shouldUseHook
            ? hookError
            : parentError;

    const reels = useMemo(
        () =>
            normalizeReelsResponse(
                rawReelsData,
            ),
        [rawReelsData],
    );

    const selectedReel =
        selectedIndex !== null
            ? reels[selectedIndex] ?? null
            : null;

    /* ============================================================
       OPEN
    ============================================================ */

    const openReel =
        useCallback(
            (index: number) => {
                setSelectedIndex(index);
                setDirection(1);
                setIsMuted(true);
                setIsPlaying(true);

                onModalOpen?.();
            },
            [onModalOpen],
        );

    /* ============================================================
       CLOSE
    ============================================================ */

    const closeReel =
        useCallback(() => {
            setSelectedIndex(null);
            setIsTransitioning(false);

            if (videoRef.current) {
                videoRef.current.pause();
            }

            if (
                typeof document !==
                "undefined" &&
                document.fullscreenElement
            ) {
                document
                    .exitFullscreen?.()
                    .catch(
                        () => { },
                    );
            }

            setIsFullscreen(false);

            onModalClose?.();
        }, [onModalClose]);

    /* ============================================================
       NEXT
    ============================================================ */

    const handleNext =
        useCallback(
            (
                event?:
                    | React.MouseEvent
                    | React.PointerEvent,
            ) => {
                event?.preventDefault();
                event?.stopPropagation();

                if (
                    !reels.length ||
                    selectedIndex ===
                    null ||
                    isTransitioning
                ) {
                    return;
                }

                setDirection(1);
                setIsTransitioning(
                    true,
                );
                setIsMuted(true);
                setIsPlaying(true);

                setSelectedIndex(
                    (current) => {
                        if (
                            current ===
                            null
                        ) {
                            return 0;
                        }

                        return (
                            (current + 1) %
                            reels.length
                        );
                    },
                );

                window.setTimeout(
                    () => {
                        setIsTransitioning(
                            false,
                        );
                    },
                    400,
                );
            },
            [
                reels.length,
                selectedIndex,
                isTransitioning,
            ],
        );

    /* ============================================================
       PREVIOUS
    ============================================================ */

    const handlePrevious =
        useCallback(
            (
                event?:
                    | React.MouseEvent
                    | React.PointerEvent,
            ) => {
                event?.preventDefault();
                event?.stopPropagation();

                if (
                    !reels.length ||
                    selectedIndex ===
                    null ||
                    isTransitioning
                ) {
                    return;
                }

                setDirection(-1);
                setIsTransitioning(
                    true,
                );
                setIsMuted(true);
                setIsPlaying(true);

                setSelectedIndex(
                    (current) => {
                        if (
                            current ===
                            null
                        ) {
                            return 0;
                        }

                        return (
                            (current - 1 +
                                reels.length) %
                            reels.length
                        );
                    },
                );

                window.setTimeout(
                    () => {
                        setIsTransitioning(
                            false,
                        );
                    },
                    400,
                );
            },
            [
                reels.length,
                selectedIndex,
                isTransitioning,
            ],
        );

    /* ============================================================
       PLAY / PAUSE
    ============================================================ */

    const togglePlay =
        useCallback(
            (
                event: React.MouseEvent,
            ) => {
                event.stopPropagation();

                const video =
                    videoRef.current;

                if (!video) return;

                if (video.paused) {
                    video
                        .play()
                        .then(() => {
                            setIsPlaying(
                                true,
                            );
                        })
                        .catch(
                            () => { },
                        );
                } else {
                    video.pause();

                    setIsPlaying(
                        false,
                    );
                }
            },
            [],
        );

    /* ============================================================
       MUTE
    ============================================================ */

    const toggleMute =
        useCallback(
            (
                event: React.MouseEvent,
            ) => {
                event.stopPropagation();

                const video =
                    videoRef.current;

                if (!video) return;

                const nextMuted =
                    !isMuted;

                video.muted =
                    nextMuted;

                setIsMuted(
                    nextMuted,
                );
            },
            [isMuted],
        );

    /* ============================================================
       FULLSCREEN
    ============================================================ */

    const toggleFullscreen =
        useCallback(
            (
                event: React.MouseEvent,
            ) => {
                event.stopPropagation();

                const stage =
                    stageRef.current;

                if (!stage) {
                    return;
                }

                if (
                    !document.fullscreenElement
                ) {
                    stage
                        .requestFullscreen?.()
                        .then(() => {
                            setIsFullscreen(
                                true,
                            );
                        })
                        .catch(
                            () => { },
                        );
                } else {
                    document
                        .exitFullscreen?.()
                        .then(() => {
                            setIsFullscreen(
                                false,
                            );
                        })
                        .catch(
                            () => { },
                        );
                }
            },
            [],
        );

    /* ============================================================
       PRODUCT
    ============================================================ */

    const handleProductClick =
        useCallback(
            (
                event: React.MouseEvent,
                product: ReelProduct | null,
            ) => {
                event.stopPropagation();

                if (!product) {
                    return;
                }

                const slug =
                    getProductSlug(
                        product,
                    );

                if (slug) {
                    router.push(
                        `/product/${slug}`,
                    );
                    return;
                }

                if (product.id) {
                    router.push(
                        `/product/${product.id}`,
                    );
                }
            },
            [router],
        );

    /* ============================================================
       FULLSCREEN CHANGE
    ============================================================ */

    useEffect(() => {
        const handleFullscreen =
            () => {
                setIsFullscreen(
                    Boolean(
                        document.fullscreenElement,
                    ),
                );
            };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreen,
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreen,
            );
        };
    }, []);

    /* ============================================================
       BODY LOCK
    ============================================================ */

    useEffect(() => {
        if (
            selectedIndex ===
            null
        ) {
            document.body.style.overflow =
                "";
            return;
        }

        const previous =
            document.body.style
                .overflow;

        document.body.style.overflow =
            "hidden";

        return () => {
            document.body.style.overflow =
                previous;
        };
    }, [selectedIndex]);

    /* ============================================================
       KEYBOARD
    ============================================================ */

    useEffect(() => {
        if (
            selectedIndex ===
            null
        ) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (
                event.key ===
                "Escape"
            ) {
                event.preventDefault();
                closeReel();
                return;
            }

            if (
                event.key ===
                "ArrowRight"
            ) {
                event.preventDefault();
                handleNext();
                return;
            }

            if (
                event.key ===
                "ArrowLeft"
            ) {
                event.preventDefault();
                handlePrevious();
                return;
            }

            if (
                event.key === " "
            ) {
                event.preventDefault();

                const video =
                    videoRef.current;

                if (!video) {
                    return;
                }

                if (video.paused) {
                    video
                        .play()
                        .catch(
                            () => { },
                        );
                } else {
                    video.pause();
                }
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        selectedIndex,
        closeReel,
        handleNext,
        handlePrevious,
    ]);

    /* ============================================================
       AUTO PLAY
    ============================================================ */

    useEffect(() => {
        if (
            selectedIndex ===
            null ||
            !selectedReel
        ) {
            return;
        }

        const timer =
            window.setTimeout(
                () => {
                    const video =
                        videoRef.current;

                    if (!video) {
                        return;
                    }

                    try {
                        video.currentTime = 0;
                    } catch { }

                    video.muted = true;

                    setIsMuted(true);

                    video
                        .play()
                        .then(() => {
                            setIsPlaying(
                                true,
                            );
                        })
                        .catch(() => {
                            setIsPlaying(
                                false,
                            );
                        });
                },
                100,
            );

        return () =>
            window.clearTimeout(
                timer,
            );
    }, [
        selectedIndex,
        selectedReel,
    ]);

    /* ============================================================
       LOADING
    ============================================================ */

    if (isLoading) {
        return (
            <section className="w-full bg-white py-16">
                <div className="mb-10 text-center">
                    <div className="mx-auto h-10 w-64 animate-pulse rounded-lg bg-gray-200" />
                </div>

                <div className="flex gap-4 overflow-hidden px-5">
                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="h-[380px] w-[250px] shrink-0 animate-pulse rounded-[14px] bg-[#f2f1ec]"
                            />
                        ),
                    )}
                </div>
            </section>
        );
    }

    if (
        error ||
        !reels.length
    ) {
        return null;
    }

    /* ============================================================
       PREVIOUS / NEXT
    ============================================================ */

    const previousIndex =
        selectedIndex === null
            ? 0
            :
            (
                selectedIndex -
                1 +
                reels.length
            ) %
            reels.length;

    const nextIndex =
        selectedIndex === null
            ? 0
            :
            (
                selectedIndex + 1
            ) %
            reels.length;

    const previousReel =
        reels[previousIndex] ||
        null;

    const nextReel =
        reels[nextIndex] || null;

    const selectedProduct =
        selectedReel
            ? getReelProduct(
                selectedReel,
            )
            : null;

    return (
        <>
            <section className="w-full overflow-hidden bg-white py-16">
                <div className="mx-auto w-full">
                    <div className="mb-10 text-center">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0F1A3C]/50">
                            Don't Miss Out
                        </span>

                        <h2 className="font-serif text-[30px] font-medium tracking-[-0.035em] text-[#111] sm:text-[36px] lg:text-[40px]">
                            Experience the world of Indiekonnect
                        </h2>
                        <div className="mx-auto mt-1 h-px w-16 bg-[#0F1A3C]/20" />
                    </div>

                    <ShopReelsRow
                        reels={reels}
                        isLoading={isLoading}
                        error={error}
                        openReel={openReel}
                    />
                </div>
            </section>

            {/* ==================================================== */}
            {/* MODAL                                                 */}
            {/* ==================================================== */}

            {mounted &&
                selectedReel &&
                selectedIndex !== null && (
                    <div
                        className="fixed inset-0 z-[999999] flex h-[100dvh] w-full items-center justify-center overflow-hidden "
                        onClick={closeReel}
                    >
                        {/* BLURRED BACKGROUND */}

                        <div
                            className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center blur-[25px]"
                            style={{
                                backgroundImage: `url("${getReelThumbnail(
                                    selectedReel,
                                )}")`,
                            }}
                        />

                      
                        {/* GLOBAL TOP RIGHT */}

                        <div className="absolute right-4 top-3 z-[99999999] flex flex-col items-center gap-2">
                            <button
                                type="button"
                                aria-label="Close"
                                onClick={(
                                    event,
                                ) => {
                                    event.stopPropagation();
                                    closeReel();
                                }}
                                className="flex h-10 w-10 items-center justify-center text-white transition hover:scale-110"
                            >
                                <X
                                    size={32}
                                    strokeWidth={2}
                                />
                            </button>

                            <button
                                type="button"
                                aria-label="Fullscreen"
                                onClick={
                                    toggleFullscreen
                                }
                                className="flex h-10 w-10 items-center justify-center text-white transition hover:scale-110"
                            >
                                <Maximize
                                    size={22}
                                    strokeWidth={
                                        1.8
                                    }
                                />
                            </button>
                        </div>

                        {/* STAGE */}

                        <motion.div
                            className="relative flex h-full w-full items-center justify-center"
                            onClick={(
                                event,
                            ) =>
                                event.stopPropagation()
                            }
                        >
                            {/* LEFT PREVIEW */}

                            <AnimatePresence>
                                {reels.length >
                                    1 &&
                                    previousReel && (
                                        <ReelSidePreview
                                            key={`left-${previousReel.id}`}
                                            reel={
                                                previousReel
                                            }
                                            side="left"
                                        />
                                    )}
                            </AnimatePresence>

                            {/* RIGHT PREVIEW */}

                            <AnimatePresence>
                                {reels.length >
                                    1 &&
                                    nextReel && (
                                        <ReelSidePreview
                                            key={`right-${nextReel.id}`}
                                            reel={
                                                nextReel
                                            }
                                            side="right"
                                        />
                                    )}
                            </AnimatePresence>

                            {/* MAIN REEL CARD */}

                            <AnimatePresence
                                initial={false}
                                mode="wait"
                            >
                                <motion.div
                                    key={String(
                                        selectedReel.id,
                                    )}
                                    ref={stageRef}
                                    initial={{
                                        opacity: 0,
                                        scale: 0.96,
                                        x:
                                            direction ===
                                                1
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
                                            direction ===
                                                1
                                                ? -35
                                                : 35,
                                    }}
                                    transition={{
                                        duration: 0.32,
                                        ease: [
                                            0.22,
                                            1,
                                            0.36,
                                            1,
                                        ],
                                    }}
                                    className="relative z-[200] h-[92vh] max-h-[900px] w-[430px] overflow-hidden bg-black md:rounded-[5px]"
                                >
                                    {/* VIDEO */}

                                    <video
                                        ref={
                                            videoRef
                                        }
                                        key={getReelVideo(
                                            selectedReel,
                                        )}
                                        src={getReelVideo(
                                            selectedReel,
                                        )}
                                        poster={getReelThumbnail(
                                            selectedReel,
                                        )}
                                        autoPlay
                                        loop
                                        playsInline
                                        muted={
                                            isMuted
                                        }
                                        preload="auto"
                                        onClick={
                                            togglePlay
                                        }
                                        onPlay={() =>
                                            setIsPlaying(
                                                true,
                                            )
                                        }
                                        onPause={() =>
                                            setIsPlaying(
                                                false,
                                            )
                                        }
                                        className="absolute inset-0 h-full w-full cursor-pointer bg-black object-cover"
                                    />

                                    {/* LIGHT TOP GRADIENT */}

                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-black/30 to-transparent" />

                                    {/* LIGHT BOTTOM GRADIENT */}

                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[23%] bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                                    {/* MUTE */}

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
                                        className="absolute right-3 top-3 z-[500] flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                                    >
                                        {isMuted ? (
                                            <VolumeX
                                                size={
                                                    20
                                                }
                                            />
                                        ) : (
                                            <Volume2
                                                size={
                                                    20
                                                }
                                            />
                                        )}
                                    </button>

                                    {/* GLASS PRODUCT CARD */}

                                    {selectedProduct && (
                                        <button
                                            type="button"
                                            onClick={(
                                                event,
                                            ) =>
                                                handleProductClick(
                                                    event,
                                                    selectedProduct,
                                                )
                                            }
                                            className="absolute bottom-5 left-4 right-4 z-[600] flex items-center gap-3 overflow-hidden rounded-[18px] border border-white/25 bg-white/[0.14] p-2.5 text-left shadow-[0_12px_45px_rgba(0,0,0,0.3)] backdrop-blur-[22px] backdrop-saturate-150 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.20] active:scale-[0.99]"
                                        >
                                            {/* Glass shine */}

                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/[0.10] via-transparent to-white/[0.04]" />

                                            {/* Image */}

                                            <div className="relative z-10 h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[12px] border border-white/20 bg-white/10 shadow-md">
                                                <img
                                                    src={getProductImage(
                                                        selectedProduct,
                                                    )}
                                                    alt={
                                                        selectedProduct.name ||
                                                        "Product"
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            {/* Details */}

                                            <div className="relative z-10 min-w-0 flex-1">
                                                <p className="truncate text-[12px] font-semibold text-white drop-shadow">
                                                    {selectedProduct.name ||
                                                        selectedProduct.title ||
                                                        "Product"}
                                                </p>

                                                {getProductPrice(
                                                    selectedProduct,
                                                ) && (
                                                        <p className="mt-1 text-[12px] font-semibold text-white/80">
                                                            {getProductPrice(
                                                                selectedProduct,
                                                            )}
                                                        </p>
                                                    )}
                                            </div>

                                            {/* Shop */}

                                            <span className="relative z-10 shrink-0 rounded-full border border-white/30 bg-white/[0.18] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-md backdrop-blur-xl transition hover:bg-white/[0.27]">
                                                Shop
                                                Now
                                            </span>
                                        </button>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* DESKTOP PREVIOUS */}

                            {reels.length >
                                1 && (
                                    <button
                                        type="button"
                                        aria-label="Previous reel"
                                        onClick={
                                            handlePrevious
                                        }
                                        className="absolute left-[calc(50%-270px)] top-1/2 z-[99999999] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_25px_rgba(0,0,0,0.28)] transition-all duration-200 hover:scale-110 hover:bg-black hover:text-white lg:flex xl:left-[calc(50%-275px)]"
                                    >
                                        <ChevronLeft
                                            size={
                                                23
                                            }
                                            strokeWidth={
                                                2.5
                                            }
                                        />
                                    </button>
                                )}

                            {/* DESKTOP NEXT */}

                            {reels.length >
                                1 && (
                                    <button
                                        type="button"
                                        aria-label="Next reel"
                                        onClick={
                                            handleNext
                                        }
                                        className="absolute right-[calc(50%-270px)] top-1/2 z-[999999999] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_25px_rgba(0,0,0,0.28)] transition-all duration-200 hover:scale-110 hover:bg-black hover:text-white lg:right-[calc(50%-275px)]"
                                    >
                                        <ChevronRight
                                            size={
                                                23
                                            }
                                            strokeWidth={
                                                2.5
                                            }
                                        />
                                    </button>
                                )}

                            {/* MOBILE PREVIOUS */}

                            {reels.length >
                                1 && (
                                    <button
                                        type="button"
                                        aria-label="Previous reel"
                                        onClick={
                                            handlePrevious
                                        }
                                        className="absolute left-2 top-1/2 z-[999999999] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md md:hidden"
                                    >
                                        <ChevronLeft
                                            size={
                                                25
                                            }
                                        />
                                    </button>
                                )}

                            {/* MOBILE NEXT */}

                            {reels.length >
                                1 && (
                                    <button
                                        type="button"
                                        aria-label="Next reel"
                                        onClick={
                                            handleNext
                                        }
                                        className="absolute right-2 top-1/2 z-[999999999] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md md:hidden"
                                    >
                                        <ChevronRight
                                            size={
                                                25
                                            }
                                        />
                                    </button>
                                )}
                        </motion.div>
                    </div>
                )}
        </>
    );
}

