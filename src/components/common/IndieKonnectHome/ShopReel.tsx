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
    Share2,
    UserRound,
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

    if (Array.isArray(input)) return input;

    if (Array.isArray(input?.data)) return input.data;

    if (Array.isArray(input?.data?.data)) {
        return input.data.data;
    }

    if (Array.isArray(input?.reels)) return input.reels;

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
    reel: Reel | null,
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
    value?: number | string | null,
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
            0,
    );
}

function getProductImage(
    product: ReelProduct | null,
): string {
    if (!product) return FALLBACK_IMAGE;

    if (product?.product_image?.image) {
        return normalizeAssetUrl(
            product.product_image.image,
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

// ============================================================
// SHOP REELS ROW
// ============================================================

function ShopReelsRow({
    reels = [],
    isLoading,
    error,
    openReel,
    onModalOpen,
}: any) {
    const scrollRef =
        useRef<HTMLDivElement>(null);

    const scroll = (
        direction: "left" | "right",
    ) => {
        if (!scrollRef.current) return;

        const scrollAmount =
            direction === "left"
                ? -260
                : 260;

        scrollRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
        });
    };

    if (isLoading) {
        return (
            <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map(
                    (item) => (
                        <div
                            key={item}
                            className="h-[300px] w-[190px] shrink-0 animate-pulse rounded-[10px] bg-[#f4f3ee] sm:h-[380px] sm:w-[235px]"
                        />
                    ),
                )}
            </div>
        );
    }

    if (error || !reels.length) {
        return null;
    }

    const handleOpenReel = (
        index: number,
    ) => {
        onModalOpen?.();
        openReel(index);
    };

    return (
        <div className="relative">
            {/* LEFT */}
            <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Previous"
                className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
            >
                <ChevronLeft
                    size={19}
                    strokeWidth={1.7}
                />
            </button>

            {/* RIGHT */}
            <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Next"
                className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
            >
                <ChevronRight
                    size={19}
                    strokeWidth={1.7}
                />
            </button>

            <div
                ref={scrollRef}
                className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-4 sm:px-10"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {reels.map(
                    (
                        reel: Reel,
                        index: number,
                    ) => {
                        const videoUrl =
                            getReelVideo(reel);

                        const thumbnail =
                            getReelThumbnail(reel);

                        const product =
                            getReelProduct(reel);

                        const brandName =
                            product?.brand_name ||
                            product?.brand ||
                            "";

                        return (
                            <button
                                key={String(
                                    reel.id,
                                )}
                                type="button"
                                onClick={() =>
                                    handleOpenReel(
                                        index,
                                    )
                                }
                                className="relative h-[300px] w-[190px] shrink-0 snap-start overflow-hidden rounded-[10px] bg-[#111111] text-left transition-transform duration-300 hover:scale-[1.02] sm:h-[380px] sm:w-[235px]"
                            >
                                {videoUrl ? (
                                    <video
                                        src={
                                            videoUrl
                                        }
                                        poster={
                                            thumbnail
                                        }
                                        muted
                                        playsInline
                                        loop
                                        autoPlay
                                        preload="metadata"
                                        className="absolute inset-0 h-full w-full object-cover"
                                        onError={(
                                            e,
                                        ) => {
                                            const video =
                                                e.currentTarget;

                                            video.style.display =
                                                "none";

                                            const img =
                                                video.nextElementSibling as HTMLImageElement;

                                            if (
                                                img
                                            ) {
                                                img.style.display =
                                                    "block";
                                            }
                                        }}
                                    />
                                ) : null}

                                <img
                                    src={
                                        thumbnail
                                    }
                                    alt={
                                        reel?.title ||
                                        "Reel"
                                    }
                                    className="absolute inset-0 h-full w-full object-cover"
                                    style={{
                                        display:
                                            videoUrl
                                                ? "none"
                                                : "block",
                                    }}
                                    onError={(
                                        e,
                                    ) => {
                                        e.currentTarget.src =
                                            "/images/placeholder.png";
                                    }}
                                />

                                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                                {/* VIEWS */}
                                <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                                    <Eye
                                        size={12}
                                    />
                                    {getViews(
                                        reel,
                                    )}
                                </div>

                                {/* BRAND */}
                                {brandName && (
                                    <div className="absolute right-2.5 top-2.5 z-10 text-[11px] font-semibold uppercase tracking-wide text-white/90 drop-shadow">
                                        {
                                            brandName
                                        }
                                    </div>
                                )}

                                {/* SHOP BUTTON */}
                                <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center">
                                    <span className="rounded-full border border-white/60 bg-white/20 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white shadow-[0_8px_25px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-300 hover:border-white/80 hover:bg-white/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                                        Shop Now
                                    </span>
                                </div>
                            </button>
                        );
                    },
                )}
            </div>
        </div>
    );
}

// ============================================================
// SIDE REEL PREVIEW
// ============================================================

function ReelSidePreview({
    reel,
    side,
}: {
    reel: Reel;
    side: "left" | "right";
}) {
    const videoRef =
        useRef<HTMLVideoElement | null>(null);

    const videoUrl = getReelVideo(reel);
    const thumbnail = getReelThumbnail(reel);

    useEffect(() => {
        const video =
            videoRef.current;

        if (!video) return;

        video.muted = true;

        const playVideo = () => {
            video.play().catch(() => {});
        };

        playVideo();

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
                        ? -50
                        : 50,
                scale: 0.86,
            }}
            animate={{
                opacity: 0.48,
                x: 0,
                scale: 0.86,
            }}
            exit={{
                opacity: 0,
                x:
                    side === "left"
                        ? -50
                        : 50,
                scale: 0.86,
            }}
            transition={{
                duration: 0.35,
                ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                ],
            }}
            className={`pointer-events-none absolute top-1/2 hidden h-[82vh] max-h-[760px] w-[250px] -translate-y-1/2 overflow-hidden rounded-[14px] bg-black shadow-2xl lg:block xl:w-[285px] ${
                side === "left"
                    ? "right-[calc(50%+285px)]"
                    : "left-[calc(50%+285px)]"
            }`}
        >
            <div className="relative h-full w-full">
                {videoUrl ? (
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        poster={thumbnail}
                        muted
                        playsInline
                        loop
                        autoPlay
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : (
                    <Image
                        src={thumbnail}
                        alt=""
                        fill
                        sizes="285px"
                        className="object-cover"
                    />
                )}

                <div className="absolute inset-0 bg-black/35" />

                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 to-transparent" />

                <div className="absolute left-4 right-4 top-4 flex justify-between">
                    <div className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                        {getViews(reel)}
                    </div>
                </div>

                <div className="absolute inset-x-0 bottom-8 px-4 text-center">
                    <p className="line-clamp-2 text-[13px] font-medium text-white/90">
                        {reel?.title ||
                            "Discover this reel"}
                    </p>

                    <span className="mt-2 inline-block rounded-full border border-white/35 bg-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white shadow-sm backdrop-blur-xl">
                        Shop Now
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

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

    const [isFullscreen, setIsFullscreen] =
        useState(false);

    const [isTransitioning, setIsTransitioning] =
        useState(false);

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
    } = useGetReelsQuery(undefined, {
        skip: !shouldUseHook,
    });

    // ========================================================
    // MOUNT
    // ========================================================

    useEffect(() => {
        setMounted(true);

        return () => {
            setMounted(false);
        };
    }, []);

    // ========================================================
    // DATA
    // ========================================================

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

    const reels = useMemo(() => {
        return normalizeReelsResponse(
            rawReelsData,
        );
    }, [rawReelsData]);

    const selectedReel =
        selectedIndex !== null
            ? reels[selectedIndex] ??
              null
            : null;

    // ========================================================
    // OPEN
    // ========================================================

    const openReel = useCallback(
        (index: number) => {
            setSelectedIndex(index);
            setDirection(1);
            setIsMuted(true);
            setIsPlaying(true);
            onModalOpen?.();
        },
        [onModalOpen],
    );

    // ========================================================
    // CLOSE
    // ========================================================

    const closeReel = useCallback(() => {
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
                .catch(() => {});
        }

        onModalClose?.();
    }, [onModalClose]);

    // ========================================================
    // NEXT
    // ========================================================

    const handleNext = useCallback(
        (
            event?:
                | React.MouseEvent
                | React.PointerEvent,
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
            setIsMuted(true);
            setIsPlaying(true);

            setSelectedIndex(
                (current) => {
                    if (current === null) {
                        return 0;
                    }

                    return (
                        (current + 1) %
                        reels.length
                    );
                },
            );

            window.setTimeout(() => {
                setIsTransitioning(false);
            }, 500);
        },
        [
            reels.length,
            selectedIndex,
            isTransitioning,
        ],
    );

    // ========================================================
    // PREVIOUS
    // ========================================================

    const handlePrevious =
        useCallback(
            (
                event?:
                    | React.MouseEvent
                    | React.PointerEvent,
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
                setIsMuted(true);
                setIsPlaying(true);

                setSelectedIndex(
                    (current) => {
                        if (
                            current === null
                        ) {
                            return 0;
                        }

                        return (
                            (current -
                                1 +
                                reels.length) %
                            reels.length
                        );
                    },
                );

                window.setTimeout(() => {
                    setIsTransitioning(
                        false,
                    );
                }, 500);
            },
            [
                reels.length,
                selectedIndex,
                isTransitioning,
            ],
        );

    // ========================================================
    // PLAY / PAUSE
    // ========================================================

    const togglePlay = useCallback(
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
                    .then(() =>
                        setIsPlaying(
                            true,
                        ),
                    )
                    .catch(() => {});
            } else {
                video.pause();
                setIsPlaying(false);
            }
        },
        [],
    );

    // ========================================================
    // MUTE
    // ========================================================

    const toggleMute = useCallback(
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

            setIsMuted(nextMuted);
        },
        [isMuted],
    );

    // ========================================================
    // FULLSCREEN
    // ========================================================

    const toggleFullscreen =
        useCallback(
            (
                event: React.MouseEvent,
            ) => {
                event.stopPropagation();

                const stage =
                    stageRef.current;

                if (!stage) return;

                if (
                    !document.fullscreenElement
                ) {
                    stage
                        .requestFullscreen?.()
                        .catch(() => {});
                } else {
                    document
                        .exitFullscreen?.()
                        .catch(() => {});
                }
            },
            [],
        );

    // ========================================================
    // FULLSCREEN CHANGE
    // ========================================================

    useEffect(() => {
        const handleFullscreenChange =
            () => {
                setIsFullscreen(
                    Boolean(
                        document.fullscreenElement,
                    ),
                );
            };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange,
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
        };
    }, []);

    // ========================================================
    // SHARE
    // ========================================================

    const handleShare = useCallback(
        async (
            event: React.MouseEvent,
        ) => {
            event.stopPropagation();

            if (!selectedReel) return;

            const shareUrl =
                typeof window !==
                "undefined"
                    ? `${window.location.origin}/reels/${selectedReel.id}`
                    : "";

            try {
                if (
                    navigator.share
                ) {
                    await navigator.share(
                        {
                            title:
                                selectedReel.title ||
                                "Check out this reel",
                            url: shareUrl,
                        },
                    );

                    return;
                }

                await navigator.clipboard?.writeText(
                    shareUrl,
                );
            } catch {
                // User cancelled.
            }
        },
        [selectedReel],
    );

    // ========================================================
    // PRODUCT CLICK
    // ========================================================

    const handleProductClick =
        useCallback(
            (
                event: React.MouseEvent,
                product: ReelProduct | null,
            ) => {
                event.stopPropagation();

                if (!product) return;

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

                if (product?.id) {
                    router.push(
                        `/product/${product.id}`,
                    );
                }
            },
            [router],
        );

    // ========================================================
    // VIDEO EVENTS
    // ========================================================

    const handleVideoPlay =
        useCallback(() => {
            setIsPlaying(true);
        }, []);

    const handleVideoPause =
        useCallback(() => {
            setIsPlaying(false);
        }, []);

    // ========================================================
    // BODY LOCK
    // ========================================================

    useEffect(() => {
        if (selectedIndex === null) {
            document.body.style.overflow =
                "";
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        return () => {
            document.body.style.overflow =
                previousOverflow;
        };
    }, [selectedIndex]);

    // ========================================================
    // KEYBOARD
    // ========================================================

    useEffect(() => {
        if (selectedIndex === null) {
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
                event.key ===
                " "
            ) {
                event.preventDefault();

                const video =
                    videoRef.current;

                if (!video) return;

                if (video.paused) {
                    video
                        .play()
                        .catch(
                            () => {},
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

    // ========================================================
    // AUTO PLAY CURRENT REEL
    // ========================================================

    useEffect(() => {
        if (
            selectedIndex ===
                null ||
            !selectedReel
        ) {
            return;
        }

        const timer =
            window.setTimeout(() => {
                const video =
                    videoRef.current;

                if (!video) return;

                video.currentTime =
                    0;

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
            }, 100);

        return () => {
            window.clearTimeout(
                timer,
            );
        };
    }, [
        selectedIndex,
        selectedReel,
    ]);

    // ========================================================
    // CONDITIONAL RETURNS
    // ========================================================

    if (isLoading) {
        return (
            <section className="w-full bg-white py-16">
                <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
                    <div className="mb-10 text-center">
                        <div className="mx-auto mb-3 h-3 w-24 animate-pulse rounded-full bg-gray-200" />

                        <div className="mx-auto h-10 w-64 animate-pulse rounded-lg bg-gray-200" />
                    </div>

                    <div className="flex gap-5 overflow-hidden">
                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={
                                        item
                                    }
                                    className="h-[380px] w-[260px] animate-pulse rounded-[10px] bg-[#f4f3ee] sm:h-[440px] sm:w-[300px]"
                                />
                            ),
                        )}
                    </div>
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

    // ========================================================
    // PREVIOUS / NEXT INDEX
    // ========================================================

    const getPreviousIndex =
        () => {
            if (
                selectedIndex ===
                null
            ) {
                return 0;
            }

            return (
                (selectedIndex -
                    1 +
                    reels.length) %
                reels.length
            );
        };

    const getNextIndex = () => {
        if (
            selectedIndex ===
            null
        ) {
            return 0;
        }

        return (
            (selectedIndex + 1) %
            reels.length
        );
    };

    const previousReel =
        selectedIndex !== null
            ? reels[
                  getPreviousIndex()
              ]
            : null;

    const nextReel =
        selectedIndex !== null
            ? reels[getNextIndex()]
            : null;

    return (
        <>
            {/* ====================================================
                REELS SECTION
            ==================================================== */}

            <section className="relative w-full overflow-hidden bg-white py-16">
                <div className="relative mx-auto w-full">
                    <div className="mb-10 text-center">
                        <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0F1A3C]/50">
                            Discover
                        </span>

                        <h2 className="font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[34px] lg:text-[40px]">
                            Shop the Reel
                        </h2>

                        <p className="mx-auto mt-2 max-w-[520px] text-[11px] leading-5 text-[#777777] sm:text-[13px] sm:leading-6">
                            Watch, discover,
                            and shop
                            <br className="hidden sm:block" />
                            curated products
                            in action
                        </p>

                        <div className="mx-auto mt-5 h-px w-16 bg-[#0F1A3C]/20" />
                    </div>

                    <ShopReelsRow
                        reels={reels}
                        isLoading={
                            isLoading
                        }
                        error={error}
                        openReel={
                            openReel
                        }
                        onModalOpen={
                            onModalOpen
                        }
                    />
                </div>
            </section>

            {/* ====================================================
                FULL SCREEN REEL MODAL
            ==================================================== */}

            {mounted &&
                selectedReel &&
                selectedIndex !== null && (
                    <div
                        className="fixed inset-0 z-[9999999] flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-black"
                        onClick={
                            closeReel
                        }
                    >
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
                                duration:
                                    0.25,
                            }}
                            className="relative flex h-full w-full items-center justify-center overflow-hidden"
                            onClick={(
                                event,
                            ) =>
                                event.stopPropagation()
                            }
                        >
                            {/* ====================================================
                                CLOSE BUTTON
                            ==================================================== */}

                            <button
                                type="button"
                                aria-label="Close"
                                onClick={(
                                    event,
                                ) => {
                                    event.stopPropagation();
                                    closeReel();
                                }}
                                className="absolute right-5 top-4 z-[9999999] flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-white/20"
                            >
                                <X
                                    size={
                                        30
                                    }
                                    strokeWidth={
                                        2
                                    }
                                />
                            </button>

                            {/* ====================================================
                                PREVIOUS SIDE REEL
                            ==================================================== */}

                            <AnimatePresence
                                mode="sync"
                            >
                                {reels.length >
                                    1 &&
                                    previousReel && (
                                        <ReelSidePreview
                                            key={`previous-side-${previousReel.id}`}
                                            reel={
                                                previousReel
                                            }
                                            side="left"
                                        />
                                    )}
                            </AnimatePresence>

                            {/* ====================================================
                                NEXT SIDE REEL
                            ==================================================== */}

                            <AnimatePresence
                                mode="sync"
                            >
                                {reels.length >
                                    1 &&
                                    nextReel && (
                                        <ReelSidePreview
                                            key={`next-side-${nextReel.id}`}
                                            reel={
                                                nextReel
                                            }
                                            side="right"
                                        />
                                    )}
                            </AnimatePresence>

                            {/* ====================================================
                                MAIN REEL
                            ==================================================== */}

                            <AnimatePresence
                                initial={false}
                                custom={
                                    direction
                                }
                                mode="sync"
                            >
                                <motion.div
                                    key={String(
                                        selectedReel.id,
                                    )}
                                    ref={
                                        stageRef
                                    }
                                    custom={
                                        direction
                                    }
                                    initial={{
                                        opacity: 0,
                                        x:
                                            direction ===
                                            1
                                                ? 80
                                                : -80,
                                        scale: 0.95,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: 1,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        x:
                                            direction ===
                                            1
                                                ? -80
                                                : 80,
                                        scale: 0.95,
                                    }}
                                    transition={{
                                        duration:
                                            0.4,
                                        ease: [
                                            0.22,
                                            1,
                                            0.36,
                                            1,
                                        ],
                                    }}
                                    className="relative z-[100] h-[100dvh] w-full max-w-[480px] overflow-hidden bg-black sm:h-[96dvh] sm:rounded-[14px]"
                                >
                                    {/* MAIN VIDEO */}

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
                                        playsInline
                                        muted={
                                            isMuted
                                        }
                                        loop
                                        preload="auto"
                                        onClick={
                                            togglePlay
                                        }
                                        className="absolute inset-0 h-full w-full cursor-pointer object-cover bg-black"
                                        onPlay={
                                            handleVideoPlay
                                        }
                                        onPause={
                                            handleVideoPause
                                        }
                                    />

                                    {/* TOP GRADIENT */}

                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />

                                    {/* BOTTOM GRADIENT */}

                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

                                    {/* ====================================================
                                        VIEWS
                                    ==================================================== */}

                                    <div className="absolute left-4 top-4 z-40 flex items-center gap-1.5 rounded-[8px] bg-black/60 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-md">
                                        <Eye
                                            size={
                                                14
                                            }
                                            strokeWidth={
                                                2.4
                                            }
                                        />

                                        {getViews(
                                            selectedReel,
                                        )}
                                    </div>

                                    {/* ====================================================
                                        RIGHT ACTIONS
                                    ==================================================== */}

                                    <div className="absolute right-4 top-4 z-40 flex items-center gap-3">
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
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
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

                                        {/* SHARE */}

                                        <button
                                            type="button"
                                            onClick={
                                                handleShare
                                            }
                                            aria-label="Share"
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                                        >
                                            <Share2
                                                size={
                                                    20
                                                }
                                            />
                                        </button>

                                        {/* USER */}

                                        <button
                                            type="button"
                                            onClick={(
                                                event,
                                            ) =>
                                                event.stopPropagation()
                                            }
                                            aria-label="Creator"
                                            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                                        >
                                            <UserRound
                                                size={
                                                    20
                                                }
                                            />

                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-emerald-400" />
                                        </button>
                                    </div>

                                    {/* ====================================================
                                        DESKTOP PREVIOUS BUTTON
                                    ==================================================== */}

                                    {reels.length >
                                        1 && (
                                        <button
                                            type="button"
                                            aria-label="Previous reel"
                                            onClick={
                                                handlePrevious
                                            }
                                            className="absolute left-4 top-1/2 z-[200] hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:flex"
                                        >
                                            <ChevronLeft
                                                size={
                                                    32
                                                }
                                                strokeWidth={
                                                    2.5
                                                }
                                            />
                                        </button>
                                    )}

                                    {/* ====================================================
                                        DESKTOP NEXT BUTTON
                                    ==================================================== */}

                                    {reels.length >
                                        1 && (
                                        <button
                                            type="button"
                                            aria-label="Next reel"
                                            onClick={
                                                handleNext
                                            }
                                            className="absolute right-4 top-1/2 z-[200] hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:flex"
                                        >
                                            <ChevronRight
                                                size={
                                                    32
                                                }
                                                strokeWidth={
                                                    2.5
                                                }
                                            />
                                        </button>
                                    )}

                                    {/* ====================================================
                                        BOTTOM CONTENT
                                    ==================================================== */}

                                    <div className="absolute bottom-0 left-0 right-0 z-50 p-5 sm:p-7">
                                        {/* CREATOR */}

                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[14px] font-bold text-[#0F1A3C]">
                                                {getCreatorName(
                                                    selectedReel,
                                                )
                                                    .charAt(
                                                        0,
                                                    )
                                                    .toUpperCase()}
                                            </div>

                                            <span className="text-sm font-semibold text-white drop-shadow-lg">
                                                @
                                                {getCreatorName(
                                                    selectedReel,
                                                )}
                                            </span>
                                        </div>

                                        {/* TITLE */}

                                        <p className="max-w-2xl text-[17px] font-medium leading-relaxed text-white/95 drop-shadow-lg sm:text-[20px]">
                                            {selectedReel?.title ||
                                                "people feel seen..."}
                                        </p>

                                        {/* PRODUCT */}

                                        {getReelProduct(
                                            selectedReel,
                                        ) && (
                                            <button
                                                type="button"
                                                onClick={(
                                                    event,
                                                ) =>
                                                    handleProductClick(
                                                        event,
                                                        getReelProduct(
                                                            selectedReel,
                                                        ),
                                                    )
                                                }
                                                className="mt-4 flex items-center gap-3 rounded-xl bg-white/95 p-2 text-left shadow-xl backdrop-blur-xl transition hover:scale-[1.03] hover:bg-white"
                                            >
                                                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                                                    <Image
                                                        src={getProductImage(
                                                            getReelProduct(
                                                                selectedReel,
                                                            ),
                                                        )}
                                                        alt="Product"
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1 pr-2">
                                                    <p className="truncate text-[12px] font-semibold text-[#0F1A3C]">
                                                        {getReelProduct(
                                                            selectedReel,
                                                        )?.name ||
                                                            getReelProduct(
                                                                selectedReel,
                                                            )?.title ||
                                                            "Product"}
                                                    </p>

                                                    <p className="text-[13px] font-bold text-[#0F1A3C]/70">
                                                        {getProductPrice(
                                                            getReelProduct(
                                                                selectedReel,
                                                            ),
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="shrink-0 rounded-full border border-white/20 bg-[#0F1A3C]/90 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white shadow-md backdrop-blur-xl transition hover:bg-[#1a2a4a]">
                                                    Shop
                                                    Now
                                                </div>
                                            </button>
                                        )}

                                        {/* NO PRODUCT */}

                                        {!getReelProduct(
                                            selectedReel,
                                        ) && (
                                            <button
                                                type="button"
                                                onClick={(
                                                    event,
                                                ) =>
                                                    event.stopPropagation()
                                                }
                                                className="mt-4 rounded-full border border-white/70 bg-white/20 px-5 py-2 text-[12px] font-medium uppercase tracking-[0.1em] text-white shadow-[0_8px_25px_rgba(0,0,0,0.3)] backdrop-blur-xl transition hover:scale-105 hover:bg-white/30 active:scale-95"
                                            >
                                                Shop
                                                Now
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* ====================================================
                                MOBILE PREVIOUS
                            ==================================================== */}

                            {reels.length >
                                1 && (
                                <button
                                    type="button"
                                    aria-label="Previous"
                                    onClick={
                                        handlePrevious
                                    }
                                    className="absolute left-2 top-1/2 z-[300] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md sm:hidden"
                                >
                                    <ChevronLeft
                                        size={
                                            28
                                        }
                                    />
                                </button>
                            )}

                            {/* ====================================================
                                MOBILE NEXT
                            ==================================================== */}

                            {reels.length >
                                1 && (
                                <button
                                    type="button"
                                    aria-label="Next"
                                    onClick={
                                        handleNext
                                    }
                                    className="absolute right-2 top-1/2 z-[300] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md sm:hidden"
                                >
                                    <ChevronRight
                                        size={
                                            28
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