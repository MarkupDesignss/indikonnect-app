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

const STORAGE_BASE_URL = "https://www.markupdesigns.net/indikonnect/storage/";
const FALLBACK_IMAGE = "/indiekonnect-web/images/placeholder.jpg";

// ============================================================
// HELPERS
// ============================================================

function normalizeReelsResponse(input: any): Reel[] {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (Array.isArray(input?.data)) return input.data;
    if (Array.isArray(input?.data?.data)) return input.data.data;
    if (Array.isArray(input?.reels)) return input.reels;
    if (Array.isArray(input?.data?.reels)) return input.data.reels;
    if (Array.isArray(input?.results)) return input.results;
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
        reel?.creator_handle || reel?.creator_name || reel?.creator || "Creator"
    );
}

function getReelProduct(reel: Reel | null): ReelProduct | null {
    if (!reel) return null;
    if (reel?.product) return reel.product;
    if (Array.isArray(reel?.products) && reel.products.length > 0) {
        return reel.products[0];
    }
    return null;
}

function formatNumber(value?: number | string | null): string {
    const number = Number(value || 0);
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    return String(number);
}

function getViews(reel: Reel): string {
    return formatNumber(
        reel?.views_count ?? reel?.view_count ?? reel?.views ?? 0,
    );
}

function getLikes(reel: Reel): string {
    return formatNumber(reel?.likes_count ?? reel?.like_count ?? 0);
}

function getProductImage(product: ReelProduct | null): string {
    if (!product) return FALLBACK_IMAGE;
    return (
        normalizeAssetUrl(
            product?.primary_image_url ||
            product?.image_url ||
            product?.thumbnail_url ||
            product?.image,
        ) || FALLBACK_IMAGE
    );
}

function getProductPrice(product: ReelProduct | null): string {
    if (!product) return "";
    const price =
        product?.sale_price ?? product?.price ?? product?.regular_price ?? "";
    if (price === "") return "";
    return `₹${Number(price).toLocaleString("en-IN")}`;
}

// ============================================================
// SHOP REELS ROW COMPONENT (Like New Arrivals)
// ============================================================

function ShopReelsRow({ reels = [], isLoading, error, openReel }: any) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const scrollAmount = direction === "left" ? -260 : 260;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    // Handle video playback when in viewport
    useEffect(() => {
        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                const videoId = entry.target.getAttribute('data-reel-id');
                if (videoId && videoRefs.current[videoId]) {
                    const video = videoRefs.current[videoId];
                    if (entry.isIntersecting) {
                        // Video is visible - play it
                        video?.play().catch(() => { });
                    } else {
                        // Video is not visible - pause it
                        video?.pause();
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, {
            threshold: 0.5, // 50% of the video must be visible
            rootMargin: '0px',
        });

        // Observe all video elements in the row
        const videoElements = document.querySelectorAll('.reel-video-row');
        videoElements.forEach((el) => observer.observe(el));

        return () => {
            observer.disconnect();
        };
    }, [reels]);

    if (isLoading) {
        return (
            <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        key={item}
                        className="h-[300px] w-[190px] shrink-0 animate-pulse rounded-[10px] bg-[#f4f3ee] sm:h-[380px] sm:w-[235px]"
                    />
                ))}
            </div>
        );
    }

    if (error || !reels.length) {
        return null;
    }

    return (
        <div className="relative">
            {/* LEFT ARROW */}
            <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Previous"
                className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
            >
                <ChevronLeft size={19} strokeWidth={1.7} />
            </button>

            {/* RIGHT ARROW */}
            <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Next"
                className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
            >
                <ChevronRight size={19} strokeWidth={1.7} />
            </button>

            {/* SCROLL ROW */}
            <div
                ref={scrollRef}
                className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-4 sm:px-10"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {reels.map((reel: any, index: number) => {
                    const videoUrl = getReelVideo(reel);
                    const thumbnail = getReelThumbnail(reel);
                    const product = getReelProduct(reel);
                    const brandName = (product as any)?.brand_name || (product as any)?.brand || "";

                    return (
                        <button
                            key={String(reel.id)}
                            type="button"
                            onClick={() => openReel(index)}
                            className="relative h-[300px] w-[190px] shrink-0 snap-start overflow-hidden rounded-[10px] bg-[#111111] text-left transition-transform duration-300 hover:scale-[1.02] sm:h-[380px] sm:w-[235px]"
                        >
                            {/* Video or Thumbnail */}
                            {videoUrl ? (
                                <video
                                    ref={(el) => {
                                        if (el) {
                                            videoRefs.current[String(reel.id)] = el;
                                        }
                                    }}
                                    data-reel-id={String(reel.id)}
                                    src={videoUrl}
                                    poster={thumbnail}
                                    muted
                                    playsInline
                                    loop
                                    className="reel-video-row absolute inset-0 h-full w-full object-cover"
                                    onError={(e) => {
                                        // Fallback to thumbnail if video fails
                                        const video = e.currentTarget;
                                        video.style.display = 'none';
                                        const img = video.nextElementSibling as HTMLImageElement;
                                        if (img) img.style.display = 'block';
                                    }}
                                />
                            ) : null}

                            {/* Fallback Thumbnail Image */}
                            <img
                                src={thumbnail}
                                alt={reel?.title || "Reel"}
                                className="absolute inset-0 h-full w-full object-cover"
                                style={{ display: videoUrl ? 'none' : 'block' }}
                                onError={(e) => {
                                    e.currentTarget.src = "/images/placeholder.png";
                                }}
                            />

                            {/* Bottom Gradient Overlay (for button legibility) */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

                            {/* Views Badge - Top Left */}
                            <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                                <Eye size={12} />
                                {getViews(reel)}
                            </div>

                            {/* Brand Logo/Name - Top Right (optional) */}
                            {brandName && (
                                <div className="absolute right-2.5 top-2.5 z-10 text-[11px] font-semibold uppercase tracking-wide text-white/90 drop-shadow">
                                    {brandName}
                                </div>
                            )}

                            {/* Play Icon Overlay */}
                            {videoUrl && (
                                <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 backdrop-blur-sm">
                                    <Play size={24} className="text-white" fill="white" />
                                </div>
                            )}

                            {/* Shop Now Button - Bottom Center */}
                            <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center">
                                <span className="rounded-[6px] bg-white px-6 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#111111] shadow-lg transition-all duration-300">
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

// ============================================================
// MAIN COMPONENT
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

    const rawReelsData = shouldUseHook ? hookReelsData : reelsData;
    const isLoading = shouldUseHook ? hookLoading : Boolean(parentLoading);
    const error = shouldUseHook ? hookError : parentError;

    const reels = useMemo(() => {
        return normalizeReelsResponse(rawReelsData);
    }, [rawReelsData]);

    // ============================================================
    // STATE
    // ============================================================

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);

    // ============================================================
    // SELECTED
    // ============================================================

    const selectedReel =
        selectedIndex !== null ? (reels[selectedIndex] ?? null) : null;

    // ============================================================
    // OPEN
    // ============================================================

    const openReel = useCallback((index: number) => {
        setSelectedIndex(index);
        setDirection(1);
        setIsMuted(true);
        setIsPlaying(true);
    }, []);

    // ============================================================
    // CLOSE
    // ============================================================

    const closeReel = useCallback(() => {
        setSelectedIndex(null);
        setIsTransitioning(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
        if (typeof document !== "undefined" && document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => { });
        }
    }, []);

    // ============================================================
    // NEXT
    // ============================================================

    const handleNext = useCallback(
        (event?: React.MouseEvent | React.PointerEvent) => {
            event?.stopPropagation();
            if (!reels.length || selectedIndex === null || isTransitioning) return;
            setDirection(1);
            setIsTransitioning(true);
            setSelectedIndex((current) => {
                if (current === null) return 0;
                return (current + 1) % reels.length;
            });
            setIsMuted(true);
            setIsPlaying(true);
            window.setTimeout(() => {
                setIsTransitioning(false);
            }, 500);
        },
        [reels.length, selectedIndex, isTransitioning],
    );

    // ============================================================
    // PREVIOUS
    // ============================================================

    const handlePrevious = useCallback(
        (event?: React.MouseEvent | React.PointerEvent) => {
            event?.stopPropagation();
            if (!reels.length || selectedIndex === null || isTransitioning) return;
            setDirection(-1);
            setIsTransitioning(true);
            setSelectedIndex((current) => {
                if (current === null) return 0;
                return (current - 1 + reels.length) % reels.length;
            });
            setIsMuted(true);
            setIsPlaying(true);
            window.setTimeout(() => {
                setIsTransitioning(false);
            }, 500);
        },
        [reels.length, selectedIndex, isTransitioning],
    );

    // ============================================================
    // PLAY / PAUSE
    // ============================================================

    const togglePlay = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => { });
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, []);

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
        [isMuted],
    );

    // ============================================================
    // FULLSCREEN
    // ============================================================

    const toggleFullscreen = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        const stage = stageRef.current;
        if (!stage) return;
        if (!document.fullscreenElement) {
            stage.requestFullscreen?.().catch(() => { });
        } else {
            document.exitFullscreen?.().catch(() => { });
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
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
                        title: selectedReel.title || "Check out this reel",
                        url: shareUrl,
                    });
                    return;
                }
                await navigator.clipboard?.writeText(shareUrl);
            } catch {
                // User cancelled.
            }
        },
        [selectedReel],
    );

    // ============================================================
    // PRODUCT
    // ============================================================

    const handleProductClick = useCallback(
        (event: React.MouseEvent, product: ReelProduct | null) => {
            event.stopPropagation();
            if (!product) return;
            const slug = product?.slug || product?.product_slug;
            if (slug) {
                router.push(`/product/${slug}`);
                return;
            }
            if (product?.id) {
                router.push(`/product/${product.id}`);
            }
        },
        [router],
    );

    // ============================================================
    // VIDEO EVENTS
    // ============================================================

    const handleVideoPlay = useCallback(() => setIsPlaying(true), []);
    const handleVideoPause = useCallback(() => setIsPlaying(false), []);

    // ============================================================
    // BODY LOCK
    // ============================================================

    useEffect(() => {
        if (selectedIndex === null) {
            document.body.style.overflow = "";
            return;
        }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [selectedIndex]);

    // ============================================================
    // KEYBOARD
    // ============================================================

    useEffect(() => {
        if (selectedIndex === null) return;
        const handleKeyDown = (event: KeyboardEvent) => {
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
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedIndex, closeReel, handleNext, handlePrevious]);

    // ============================================================
    // RESET VIDEO
    // ============================================================

    useEffect(() => {
        if (selectedIndex === null || !selectedReel) return;
        const timer = window.setTimeout(() => {
            const video = videoRef.current;
            if (!video) return;
            video.currentTime = 0;
            video.muted = true;
            setIsMuted(true);
            video
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
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
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-[380px] w-[260px] animate-pulse rounded-[10px] bg-[#f4f3ee] sm:h-[440px] sm:w-[300px]"
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
        return (selectedIndex - 1 + reels.length) % reels.length;
    };

    const getNextIndex = () => {
        if (selectedIndex === null) return 0;
        return (selectedIndex + 1) % reels.length;
    };

    const previousReel =
        selectedIndex !== null ? reels[getPreviousIndex()] : null;
    const nextReel = selectedIndex !== null ? reels[getNextIndex()] : null;

 
    return (
        <>
       
            <section className="relative w-full overflow-hidden bg-white py-16 ">
                <div className="relative mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0F1A3C]/50">
                            Discover
                        </span>
                        <h2 className="font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[34px] lg:text-[40px]">
                            Shop the Reel
                        </h2>
                        <p className="mx-auto mt-2 max-w-[520px] text-[11px] leading-5 text-[#777777] sm:text-[13px] sm:leading-6">
                            Watch, discover, and shop
                            <br className="hidden sm:block" />
                            curated products in action
                        </p>
                        <div className="mx-auto mt-5 h-px w-16 bg-[#0F1A3C]/20" />
                    </div>

                    {/* Reels Row */}
                    <ShopReelsRow
                        reels={reels}
                        isLoading={isLoading}
                        error={error}
                        openReel={openReel}
                    />
                </div>
            </section>

            {/* ========================================================
            FULL SCREEN REEL VIEWER — Full Width
            ======================================================== */}

            <AnimatePresence>
                {selectedReel && selectedIndex !== null && (
                    <motion.div
                        key="reel-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[99999] flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-black"
                        onClick={closeReel}
                    >
                        {/* CLOSE BUTTON */}
                        <button
                            type="button"
                            aria-label="Close"
                            onClick={(event) => {
                                event.stopPropagation();
                                closeReel();
                            }}
                            className="absolute right-5 top-4 z-[200] flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-white/20 sm:bg-black/20"
                        >
                            <X size={30} strokeWidth={2} />
                        </button>

                        {/* FULLSCREEN TOGGLE */}
                        <button
                            type="button"
                            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                            onClick={toggleFullscreen}
                            className="absolute right-6 top-[68px] z-[200] flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-white/20 sm:bg-black/20"
                        >
                            {isFullscreen ? (
                                <Minimize2 size={18} strokeWidth={2} />
                            ) : (
                                <Maximize2 size={18} strokeWidth={2} />
                            )}
                        </button>

                        {/* VIEWER STAGE - Full Width */}
                        <div
                            className="relative flex h-full w-full items-center justify-center overflow-hidden"
                            onClick={(event) => event.stopPropagation()}
                        >
                            {/* PREVIOUS REEL - Full Width */}
                            {reels.length > 1 && previousReel && (
                                <motion.div
                                    key={`previous-${previousReel.id}`}
                                    initial={{ opacity: 0, x: -100, scale: 0.92 }}
                                    animate={{ opacity: 0.3, x: 0, scale: 0.88 }}
                                    className="pointer-events-none absolute left-0 hidden h-full w-[280px] overflow-hidden bg-black/80 lg:block"
                                >
                                    <div className="relative h-full w-full">
                                        <Image
                                            src={getReelThumbnail(previousReel)}
                                            alt=""
                                            fill
                                            sizes="280px"
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60" />
                                        <div className="absolute inset-x-0 bottom-20 px-4 text-center">
                                            <p className="line-clamp-1 text-[13px] font-medium text-white/80">
                                                {previousReel?.title || "Discover this reel"}
                                            </p>
                                            <span className="mt-2 inline-block rounded-lg bg-white/20 px-4 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                                                Shop Now
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* NEXT REEL - Full Width */}
                            {reels.length > 1 && nextReel && (
                                <motion.div
                                    key={`next-${nextReel.id}`}
                                    initial={{ opacity: 0, x: 100, scale: 0.92 }}
                                    animate={{ opacity: 0.3, x: 0, scale: 0.88 }}
                                    className="pointer-events-none absolute right-0 hidden h-full w-[280px] overflow-hidden bg-black/80 lg:block"
                                >
                                    <div className="relative h-full w-full">
                                        <Image
                                            src={getReelThumbnail(nextReel)}
                                            alt=""
                                            fill
                                            sizes="280px"
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60" />
                                        <div className="absolute inset-x-0 bottom-20 px-4 text-center">
                                            <p className="line-clamp-1 text-[13px] font-medium text-white/80">
                                                {nextReel?.title || "Discover this reel"}
                                            </p>
                                            <span className="mt-2 inline-block rounded-lg bg-white/20 px-4 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                                                Shop Now
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* MAIN REEL - Full Width */}
                            <AnimatePresence initial={false} custom={direction} mode="sync">
                                <motion.div
                                    key={String(selectedReel.id)}
                                    ref={stageRef}
                                    custom={direction}
                                    initial={{
                                        opacity: 0,
                                        x: direction === 1 ? 80 : -80,
                                        scale: 0.95,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: 1,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        x: direction === 1 ? -80 : 80,
                                        scale: 0.95,
                                    }}
                                    transition={{
                                        duration: 0.4,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="relative h-full w-full max-w-[1200px] overflow-hidden bg-black"
                                >
                                    {/* VIDEO - Full Width */}
                                    <video
                                        ref={videoRef}
                                        key={getReelVideo(selectedReel)}
                                        src={getReelVideo(selectedReel)}
                                        poster={getReelThumbnail(selectedReel)}
                                        autoPlay
                                        playsInline
                                        muted={isMuted}
                                        preload="auto"
                                        onClick={togglePlay}
                                        className="absolute inset-0 h-full w-full cursor-pointer object-contain bg-black"
                                        onPlay={handleVideoPlay}
                                        onPause={handleVideoPause}
                                    />

                                    {/* VIDEO GRADIENT */}
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

                                    {/* CENTER PLAY */}
                                    {!isPlaying && (
                                        <button
                                            type="button"
                                            onClick={togglePlay}
                                            aria-label="Play"
                                            className="absolute left-1/2 top-1/2 z-30 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F1A3C] shadow-2xl transition hover:scale-110"
                                        >
                                            <Play size={32} fill="currentColor" className="ml-1" />
                                        </button>
                                    )}

                                    {/* TOP VIEW COUNT */}
                                    <div className="absolute left-4 top-4 z-30 flex items-center gap-1.5 rounded-[8px] bg-black/60 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-md">
                                        <Eye size={14} strokeWidth={2.4} />
                                        {getViews(selectedReel)}
                                    </div>

                                    {/* TOP RIGHT ACTIONS */}
                                    <div className="absolute right-4 top-4 z-40 flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={toggleMute}
                                            aria-label={isMuted ? "Unmute" : "Mute"}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                                        >
                                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleShare}
                                            aria-label="Share"
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                                        >
                                            <Share2 size={20} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(event) => event.stopPropagation()}
                                            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                                        >
                                            <UserRound size={20} />
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-emerald-400" />
                                        </button>
                                    </div>

                                    {/* LEFT ARROW - Desktop */}
                                    {reels.length > 1 && (
                                        <button
                                            type="button"
                                            aria-label="Previous reel"
                                            onClick={handlePrevious}
                                            className="absolute left-4 top-1/2 z-[100] hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:flex"
                                        >
                                            <ChevronLeft size={32} strokeWidth={2.5} />
                                        </button>
                                    )}

                                    {/* RIGHT ARROW - Desktop */}
                                    {reels.length > 1 && (
                                        <button
                                            type="button"
                                            aria-label="Next reel"
                                            onClick={handleNext}
                                            className="absolute right-4 top-1/2 z-[100] hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:flex"
                                        >
                                            <ChevronRight size={32} strokeWidth={2.5} />
                                        </button>
                                    )}

                                    {/* BOTTOM CONTENT - Overlay on video */}
                                    <div className="absolute bottom-0 left-0 right-0 z-30 p-6 sm:p-8 lg:p-10">
                                        {/* CREATOR */}
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[14px] font-bold text-[#0F1A3C]">
                                                {getCreatorName(selectedReel).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-white drop-shadow-lg">
                                                @{getCreatorName(selectedReel)}
                                            </span>
                                        </div>

                                        {/* TITLE */}
                                        <p className="max-w-2xl text-[18px] font-medium leading-relaxed text-white/95 drop-shadow-lg sm:text-[22px]">
                                            {selectedReel?.title || "people feel seen..."}
                                        </p>

                                        {/* PRODUCT + SHOP BUTTON */}
                                        <div className="mt-4 flex flex-wrap items-center gap-4">
                                            {getReelProduct(selectedReel) && (
                                                <button
                                                    type="button"
                                                    onClick={(event) =>
                                                        handleProductClick(event, getReelProduct(selectedReel))
                                                    }
                                                    className="flex items-center gap-3 rounded-xl bg-white/95 p-2 text-left shadow-xl backdrop-blur-xl transition hover:scale-105"
                                                >
                                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                                                        <Image
                                                            src={getProductImage(getReelProduct(selectedReel))}
                                                            alt="Product"
                                                            fill
                                                            sizes="48px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 pr-3">
                                                        <p className="truncate text-[12px] font-semibold text-[#0F1A3C]">
                                                            {getReelProduct(selectedReel)?.name ||
                                                                getReelProduct(selectedReel)?.title ||
                                                                "Product"}
                                                        </p>
                                                        <p className="text-[13px] font-bold text-[#0F1A3C]/70">
                                                            {getProductPrice(getReelProduct(selectedReel))}
                                                        </p>
                                                    </div>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    if (getReelProduct(selectedReel)) {
                                                        handleProductClick(event, getReelProduct(selectedReel));
                                                    } else {
                                                        event.stopPropagation();
                                                    }
                                                }}
                                                className="rounded-xl bg-white px-8 py-3 text-[15px] font-semibold text-[#0F1A3C] shadow-[0_8px_25px_rgba(0,0,0,0.35)] transition hover:scale-105 hover:bg-gray-100 active:scale-95"
                                            >
                                                Shop Now
                                            </button>
                                        </div>
                                    </div>

                                    {/* POWERED BY */}
                                    <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-1.5 bg-black/50 py-2 backdrop-blur-sm">
                                        <span className="text-[10px] font-medium text-white/50">
                                            Powered By
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] font-semibold text-white">
                                            <Zap size={11} className="text-amber-400" fill="currentColor" />
                                            Saleassist.Ai
                                        </span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* MOBILE ARROWS */}
                            {reels.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Previous"
                                        onClick={handlePrevious}
                                        className="absolute left-2 top-1/2 z-[300] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md sm:hidden"
                                    >
                                        <ChevronLeft size={28} />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Next"
                                        onClick={handleNext}
                                        className="absolute right-2 top-1/2 z-[300] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md sm:hidden"
                                    >
                                        <ChevronRight size={28} />
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