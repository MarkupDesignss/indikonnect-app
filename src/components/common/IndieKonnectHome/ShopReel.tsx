"use client";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Eye,
    Maximize2,
    Minimize2,
    Play,
    Volume2,
    VolumeX,
    X,
} from "lucide-react";
import { useGetReelsQuery } from "@/lib/redux/api/Home/contentApi";

// TYPES
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
    product_image?: { image?: string };
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

// CONSTANTS
const STORAGE_BASE_URL =
    "https://www.markupdesigns.net/indikonnect/storage/";
const MODAL_Z_INDEX = 2147483647;
const FOLLOWER_STORAGE_KEY = "indiekonnect_reel_followers";

// HELPERS
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
function getReelProduct(reel: Reel | null): ReelProduct | null {
    if (!reel) return null;
    if (reel.product) return reel.product;
    if (Array.isArray(reel.products) && reel.products.length > 0) {
        return reel.products[0];
    }
    return null;
}
function getReelCreator(reel: Reel | null): string {
    if (!reel) return "";
    return reel.creator_name || reel.creator_handle || reel.creator || "";
}
function getProductPrice(product: ReelProduct | null): string {
    if (!product) return "";
    const price =
        product?.retail_price ??
        product?.sale_price ??
        product?.price ??
        product?.regular_price ??
        "";
    if (price === "") return "";
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) return "";
    return `₹${numericPrice.toLocaleString("en-IN")}`;
}
function getProductSlug(product: ReelProduct | null): string {
    if (!product) return "";
    return product?.slug || product?.product_slug || "";
}
function formatNumber(value?: number | string | null): string {
    if (!value) return "0";
    const num = Number(value);
    if (Number.isNaN(num)) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
}
// FOLLOWER COUNT PERSISTENCE (LOCAL STORAGE)
function getPersistentFollowerCount(
    reelId: string | number,
    fallback: number | string | null | undefined,
): string {
    if (typeof window === "undefined") {
        return formatNumber(fallback);
    }
    try {
        const stored = localStorage.getItem(FOLLOWER_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (
                parsed &&
                typeof parsed === "object" &&
                parsed[reelId] !== undefined
            ) {
                return formatNumber(parsed[reelId]);
            }
        }
    } catch {
        // ignore
    }
    // Save fallback once
    const formatted = formatNumber(fallback);
    try {
        const stored = localStorage.getItem(FOLLOWER_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed[reelId] = fallback;
        localStorage.setItem(FOLLOWER_STORAGE_KEY, JSON.stringify(parsed));
    } catch {
        // ignore
    }
    return formatted;
}
// SAFE VIDEO PLAY
function safelyPlayVideo(video: HTMLVideoElement | null, muted: boolean) {
    if (!video) return;
    try {
        video.muted = muted;
        video.playsInline = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Browser may block autoplay.
            });
        }
    } catch {
        // ignore
    }
}

// REEL ROW
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
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    }, []);
    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            // Avoid the browser's initial snap position shifting the first reel left.
            container.scrollTo({ left: 0, behavior: "instant" });
        }
        updateScrollState();
    }, [reels[0]?.id, updateScrollState]);

    useEffect(() => {
        window.addEventListener("resize", updateScrollState);
        return () => window.removeEventListener("resize", updateScrollState);
    }, [updateScrollState]);
    const scroll = (direction: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;

        const cards = Array.from(
            container.querySelectorAll<HTMLElement>("[data-reel-card]"),
        );
        if (!cards.length) return;

        const current = container.scrollLeft;
        const leftPadding =
            parseFloat(window.getComputedStyle(container).scrollPaddingLeft) || 0;
        const containerLeft = container.getBoundingClientRect().left;

        // Every card snaps to the same padded left edge.
        const snapPoints = cards.map((card) =>
            Math.max(
                0,
                current + card.getBoundingClientRect().left - containerLeft - leftPadding,
            ),
        );
        const nextPoint =
            direction === "right"
                ? snapPoints.find((point) => point > current + 5)
                : [...snapPoints].reverse().find((point) => point < current - 5);

        if (nextPoint !== undefined) {
            container.scrollTo({ left: nextPoint, behavior: "smooth" });
        }
    };
    if (isLoading) {
        return (
            <div className="flex gap-3 overflow-hidden px-5 sm:gap-4 sm:px-8 lg:gap-5 lg:px-12">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        key={item}
                        className="aspect-[9/16] w-[186px] shrink-0 animate-pulse rounded-[22px] bg-[#e6e3dc] sm:w-[215px] lg:w-[235px]"
                    />
                ))}
            </div>
        );
    }
    if (error || !reels.length) return null;
    return (
        <div className="relative isolate w-full">
            {/* LEFT */}
            <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e1d7] bg-white/95 text-[#172337] shadow-[0_8px_30px_rgba(12,22,38,0.16)] backdrop-blur-md transition hover:scale-105 hover:bg-[#071A41] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#071A41] disabled:pointer-events-none disabled:opacity-0 sm:flex lg:left-5"
            >
                <ChevronLeft size={20} />
            </button>
            {/* RIGHT */}
            <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e1d7] bg-white/95 text-[#172337] shadow-[0_8px_30px_rgba(12,22,38,0.16)] backdrop-blur-md transition hover:scale-105 hover:bg-[#071A41] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#071A41] disabled:pointer-events-none disabled:opacity-0 sm:flex lg:right-5"
            >
                <ChevronRight size={20} />
            </button>
            <div
                ref={scrollRef}
                onScroll={updateScrollState}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth scroll-px-5 px-5 pb-7 pt-3 sm:gap-4 sm:scroll-px-8 sm:px-8 lg:gap-5 lg:scroll-px-12 lg:px-12"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {reels.map((reel, index) => {
                    const videoUrl = getReelVideo(reel);
                    const viewCount =
                        reel?.views_count ??
                        reel?.view_count ??
                        reel?.views ??
                        reel?.followers_count ??
                        0;
                    const formattedCount = getPersistentFollowerCount(
                        reel.id,
                        viewCount,
                    );
                    const product = getReelProduct(reel);
                    const productPrice = getProductPrice(product);
                    const creator = getReelCreator(reel);
                    return (
                        <button
                            type="button"
                            key={String(reel.id)}
                            data-reel-card
                            onClick={() => openReel(index)}
                            aria-label={`Open reel${creator ? ` by ${creator}` : ""}`}
                            className="group relative aspect-[9/16] w-[186px] shrink-0 snap-start overflow-hidden rounded-[22px] border border-[#142338]/10 bg-[#101a29] text-left shadow-[0_10px_35px_rgba(11,25,42,0.13)] outline-none transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_52px_rgba(11,25,42,0.24)] focus-visible:ring-2 focus-visible:ring-[#c59d5d] focus-visible:ring-offset-4 sm:w-[215px] lg:w-[235px]"
                        >
                            {/* Video only: no poster or product thumbnail. */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#253852] via-[#101a29] to-[#080c13]" />
                            {videoUrl ? (
                                <video
                                    src={videoUrl}
                                    muted
                                    autoPlay
                                    loop
                                    playsInline
                                    preload="metadata"
                                    aria-hidden="true"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70">
                                    <Play size={23} strokeWidth={1.4} />
                                    <span className="text-[10px] uppercase tracking-[0.22em]">
                                        Reel unavailable
                                    </span>
                                </div>
                            )}

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-40% to-[#06101e]/95" />
                            <div className="pointer-events-none absolute inset-0 rounded-[21px] ring-1 ring-inset ring-white/10" />

                            {/* Quiet editorial view counter. */}
                            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-2.5 py-1.5 text-[10px] font-medium tracking-wide text-white backdrop-blur-md">
                                <Eye size={12} strokeWidth={1.8} />
                                <span className="tabular-nums">{formattedCount}</span>
                            </div>
                            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white opacity-100 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-[#101a29] sm:opacity-0 sm:group-hover:opacity-100">
                                <Play size={12} className="ml-0.5" fill="currentColor" />
                            </div>

                            {/* Product details are text-only, so the video stays visible. */}
                            <div className="absolute inset-x-0 bottom-0 px-3.5 pb-4 pt-16 sm:px-4 sm:pb-5">
                                <div className="mb-2 flex min-w-0 items-center gap-2 text-[10px] font-medium text-white/80">
                                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#e9c789]" />
                                    <span className="truncate">{creator || "Indiekonnect"}</span>
                                </div>
                                <div className="mb-2.5 h-px w-full bg-white/20" />
                                <div className="flex items-end gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-semibold leading-snug tracking-[-0.01em] text-white sm:text-[14px]">
                                            {product?.name || product?.title || reel.title || "Discover the story"}
                                        </p>
                                        <p className="mt-1 truncate text-[12px] font-medium text-[#efce91]">
                                            {productPrice || "Watch the reel"}
                                        </p>
                                    </div>
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-md transition-colors group-hover:border-[#f4d59a] group-hover:bg-[#f4d59a] group-hover:text-[#132037]">
                                        <ArrowUpRight size={17} strokeWidth={1.8} />
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// SIDE PREVIEW
function ReelSidePreview({
    reel,
    side,
}: {
    reel: Reel;
    side: "left" | "right";
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const videoUrl = getReelVideo(reel);
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        safelyPlayVideo(video, true);
        const handleLoadedData = () => safelyPlayVideo(video, true);
        const handleCanPlay = () => safelyPlayVideo(video, true);
        video.addEventListener("loadeddata", handleLoadedData);
        video.addEventListener("canplay", handleCanPlay);
        return () => {
            video.removeEventListener("loadeddata", handleLoadedData);
            video.removeEventListener("canplay", handleCanPlay);
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
            animate={{ opacity: 0.4, x: 0, scale: 0.84 }}
            exit={{
                opacity: 0,
                x: side === "left" ? -60 : 60,
                scale: 0.88,
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-none absolute top-1/2 z-[20] hidden h-[76vh] max-h-[760px] w-[285px] -translate-y-1/2 overflow-hidden rounded-3xl bg-black shadow-[0_25px_70px_rgba(0,0,0,0.45)] ring-1 ring-white/10 lg:block ${side === "left"
                    ? "right-[calc(50%+208px)]"
                    : "left-[calc(50%+208px)]"
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
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-[#293a4b] to-[#070b12]" />
            )}
            <div className="absolute inset-0 bg-black/45" />
        </motion.div>
    );
}

// MAIN COMPONENT
export default function ShopReels({
    reelsData,
    isLoading: parentLoading,
    reelsError: parentError,
    onModalOpen,
    onModalClose,
}: ShopReelsProps) {
    const router = useRouter();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const shouldUseHook = reelsData === undefined;
    const {
        data: hookReelsData,
        isLoading: hookLoading,
        error: hookError,
    } = useGetReelsQuery(undefined, { skip: !shouldUseHook });
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    const rawReelsData = shouldUseHook ? hookReelsData : reelsData;
    const isLoading = shouldUseHook ? hookLoading : Boolean(parentLoading);
    const error = shouldUseHook ? hookError : parentError;
    const reels = useMemo(
        () => normalizeReelsResponse(rawReelsData),
        [rawReelsData],
    );
    const selectedReel =
        selectedIndex !== null ? reels[selectedIndex] ?? null : null;
    useEffect(() => {
        if (!reels.length) {
            setSelectedIndex(null);
            return;
        }
        setSelectedIndex((current) => {
            if (current === null) return null;
            if (current >= reels.length) return reels.length - 1;
            return current;
        });
    }, [reels.length]);
    const openReel = useCallback(
        (index: number) => {
            setSelectedIndex(index);
            setDirection(1);
            setIsMuted(true);
            setIsPlaying(true);
            setIsTransitioning(false);
            setProgress(0);
            onModalOpen?.();
        },
        [onModalOpen],
    );
    const closeReel = useCallback(() => {
        setSelectedIndex(null);
        setIsTransitioning(false);
        if (videoRef.current) videoRef.current.pause();
        if (typeof document !== "undefined" && document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => { });
        }
        setIsFullscreen(false);
        onModalClose?.();
    }, [onModalClose]);
    const handleNext = useCallback(
        (event?: React.MouseEvent | React.PointerEvent) => {
            event?.preventDefault();
            event?.stopPropagation();
            if (!reels.length || selectedIndex === null || isTransitioning)
                return;
            setDirection(1);
            setIsTransitioning(true);
            setIsPlaying(true);
            setProgress(0);
            setSelectedIndex((current) => {
                if (current === null) return 0;
                return (current + 1) % reels.length;
            });
            window.setTimeout(() => setIsTransitioning(false), 400);
        },
        [reels.length, selectedIndex, isTransitioning],
    );
    const handlePrevious = useCallback(
        (event?: React.MouseEvent | React.PointerEvent) => {
            event?.preventDefault();
            event?.stopPropagation();
            if (!reels.length || selectedIndex === null || isTransitioning)
                return;
            setDirection(-1);
            setIsTransitioning(true);
            setIsPlaying(true);
            setProgress(0);
            setSelectedIndex((current) => {
                if (current === null) return 0;
                return (current - 1 + reels.length) % reels.length;
            });
            window.setTimeout(() => setIsTransitioning(false), 400);
        },
        [reels.length, selectedIndex, isTransitioning],
    );
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
    const toggleMute = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            const video = videoRef.current;
            if (!video) return;
            const nextMuted = !isMuted;
            video.muted = nextMuted;
            setIsMuted(nextMuted);
            if (!nextMuted && video.paused) {
                video
                    .play()
                    .then(() => setIsPlaying(true))
                    .catch(() => { });
            }
        },
        [isMuted],
    );
    const toggleFullscreen = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        const stage = stageRef.current;
        if (!stage) return;
        if (!document.fullscreenElement) {
            stage
                .requestFullscreen?.()
                .then(() => setIsFullscreen(true))
                .catch(() => { });
        } else {
            document
                .exitFullscreen?.()
                .then(() => setIsFullscreen(false))
                .catch(() => { });
        }
    }, []);
    const handleProductClick = useCallback(
        (event: React.MouseEvent, product: ReelProduct | null) => {
            event.stopPropagation();
            if (!product) return;
            const slug = getProductSlug(product);
            if (slug) {
                router.push(`/product/${slug}`);
                return;
            }
            if (product.id) {
                router.push(`/product/${product.id}`);
            }
        },
        [router],
    );
    useEffect(() => {
        const handleFullscreen = () =>
            setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", handleFullscreen);
        return () =>
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreen,
            );
    }, []);
    useEffect(() => {
        if (selectedIndex === null) {
            document.body.style.overflow = "";
            return;
        }
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [selectedIndex]);
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
                    video
                        .play()
                        .then(() => setIsPlaying(true))
                        .catch(() => { });
                } else {
                    video.pause();
                    setIsPlaying(false);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndex, closeReel, handleNext, handlePrevious]);
    useEffect(() => {
        if (selectedIndex === null || !selectedReel) return;
        const timer = window.setTimeout(() => {
            const video = videoRef.current;
            if (!video) return;
            try {
                video.currentTime = 0;
            } catch { }
            video.muted = isMuted;
            safelyPlayVideo(video, isMuted);
            video
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        }, 180);
        return () => window.clearTimeout(timer);
    }, [selectedIndex, selectedReel, isMuted]);
    if (isLoading) {
        return (
            <section className="w-full overflow-hidden bg-[#f9f8f5] py-12 sm:py-16 lg:py-20">
                <div className="mx-auto w-full max-w-[1900px] px-4 sm:px-8 lg:px-12">
                    <div className="mb-8 space-y-3">
                        <div className="h-8 w-72 max-w-full animate-pulse rounded-lg bg-neutral-100" />
                        <div className="h-4 w-52 animate-pulse rounded-lg bg-neutral-100" />
                    </div>
                </div>
                <div className="flex gap-3 overflow-hidden px-5 sm:gap-4 sm:px-8 lg:gap-5 lg:px-12">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="aspect-[9/16] w-[186px] shrink-0 animate-pulse rounded-[22px] bg-[#e6e3dc] sm:w-[215px] lg:w-[235px]"
                        />
                    ))}
                </div>
            </section>
        );
    }
    if (error || !reels.length) return null;
    const previousIndex =
        selectedIndex === null
            ? 0
            : (selectedIndex - 1 + reels.length) % reels.length;
    const nextIndex =
        selectedIndex === null ? 0 : (selectedIndex + 1) % reels.length;
    const previousReel = reels[previousIndex] || null;
    const nextReel = reels[nextIndex] || null;
    const selectedProduct = selectedReel ? getReelProduct(selectedReel) : null;
    const selectedCreator = getReelCreator(selectedReel);
    const selectedPrice = getProductPrice(selectedProduct);
    const modalContent =
        mounted && selectedReel && selectedIndex !== null
            ? createPortal(
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Reel viewer"
                    className="fixed inset-0 z-[2147483647] flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-black"
                    style={{ isolation: "isolate", zIndex: MODAL_Z_INDEX }}
                    onClick={closeReel}
                >
                    {/* Calm ambient backdrop with no image thumbnails. */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#27364a_0%,#0c1421_46%,#05080f_100%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-black/30" />
                    {/* Close */}
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={(event) => {
                            event.stopPropagation();
                            closeReel();
                        }}
                        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:rotate-90 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        style={{ zIndex: MODAL_Z_INDEX }}
                    >
                        <X size={22} strokeWidth={2.2} />
                    </button>
                    <motion.div
                        className="relative flex h-full w-full items-center justify-center"
                        style={{ zIndex: MODAL_Z_INDEX - 1 }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <AnimatePresence>
                            {reels.length > 1 && previousReel && (
                                <ReelSidePreview
                                    key={`left-${previousReel.id}`}
                                    reel={previousReel}
                                    side="left"
                                />
                            )}
                        </AnimatePresence>
                        <AnimatePresence>
                            {reels.length > 1 && nextReel && (
                                <ReelSidePreview
                                    key={`right-${nextReel.id}`}
                                    reel={nextReel}
                                    side="right"
                                />
                            )}
                        </AnimatePresence>
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={String(selectedReel.id)}
                                ref={stageRef}
                                initial={{
                                    opacity: 0,
                                    scale: 0.96,
                                    x: direction === 1 ? 35 : -35,
                                }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.96,
                                    x: direction === 1 ? -35 : 35,
                                }}
                                transition={{
                                    duration: 0.32,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="relative z-[200] h-full w-full overflow-hidden bg-black shadow-[0_30px_100px_rgba(0,0,0,0.7)] md:h-[92vh] md:max-h-[900px] md:w-[430px] md:rounded-3xl md:ring-1 md:ring-white/10"
                            >
                                {getReelVideo(selectedReel) ? (
                                    <video
                                        ref={videoRef}
                                        key={getReelVideo(selectedReel)}
                                        src={getReelVideo(selectedReel)}
                                        autoPlay
                                        loop
                                        playsInline
                                        muted={isMuted}
                                        preload="auto"
                                        onClick={togglePlay}
                                        onLoadedData={(event) =>
                                            safelyPlayVideo(
                                                event.currentTarget,
                                                isMuted,
                                            )
                                        }
                                        onCanPlay={(event) =>
                                            safelyPlayVideo(
                                                event.currentTarget,
                                                isMuted,
                                            )
                                        }
                                        onTimeUpdate={(event) => {
                                            const v = event.currentTarget;
                                            if (v.duration) {
                                                setProgress(
                                                    (v.currentTime /
                                                        v.duration) *
                                                    100,
                                                );
                                            }
                                        }}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        className="absolute inset-0 h-full w-full cursor-pointer bg-black object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950">
                                        <p className="text-sm text-white/60">
                                            Video is not available
                                        </p>
                                    </div>
                                )}
                                {/* Gradients */}
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-black/60 to-transparent" />
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                {/* Progress */}
                                <div className="absolute inset-x-3 top-3 z-[500] h-[3px] overflow-hidden rounded-full bg-white/25">
                                    <div
                                        className="h-full rounded-full bg-white transition-[width] duration-200 ease-linear"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                {/* Header: creator + counter */}
                                <div className="pointer-events-none absolute inset-x-4 top-7 z-[500] flex items-center gap-2.5 pr-24">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-[13px] font-semibold uppercase text-white ring-1 ring-white/30 backdrop-blur-md">
                                        {(selectedCreator || "I").charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-[13px] font-semibold leading-tight text-white drop-shadow">
                                            {selectedCreator || "Indiekonnect"}
                                        </p>
                                        <p className="text-[11px] leading-tight text-white/70 tabular-nums">
                                            {selectedIndex + 1} of {reels.length}
                                        </p>
                                    </div>
                                </div>
                                {/* Controls */}
                                <div className="absolute right-4 top-7 z-[500] flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={toggleFullscreen}
                                        aria-label={
                                            isFullscreen
                                                ? "Exit fullscreen"
                                                : "Enter fullscreen"
                                        }
                                        className="hidden h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex"
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 size={16} />
                                        ) : (
                                            <Maximize2 size={16} />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleMute}
                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        {isMuted ? (
                                            <VolumeX size={17} />
                                        ) : (
                                            <Volume2 size={17} />
                                        )}
                                    </button>
                                </div>
                                {/* Center paused indicator */}
                                <AnimatePresence>
                                    {!isPlaying && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.18 }}
                                            className="pointer-events-none absolute left-1/2 top-1/2 z-[400] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/20 backdrop-blur-md"
                                        >
                                            <Play
                                                size={26}
                                                className="ml-1"
                                                fill="currentColor"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {/* Bottom: title + product */}
                                <div className="absolute inset-x-4 bottom-5 z-[600] flex flex-col gap-3">
                                    {selectedReel.title && (
                                        <p className="pointer-events-none line-clamp-2 text-[14px] font-medium leading-snug text-white drop-shadow-md">
                                            {selectedReel.title}
                                        </p>
                                    )}
                                    {selectedProduct && (
                                        <button
                                            type="button"
                                            onClick={(event) =>
                                                handleProductClick(event, selectedProduct)
                                            }
                                            className="group flex w-full items-center gap-3 rounded-[18px] border border-white/65 bg-white/95 px-4 py-3.5 text-left shadow-[0_18px_45px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-200 hover:bg-white hover:shadow-[0_23px_55px_rgba(0,0,0,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#efce91]"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[#95764a]">
                                                    {selectedProduct.brand_name || selectedProduct.brand || "Featured product"}
                                                </p>
                                                <p className="truncate text-[14px] font-semibold leading-tight text-[#111b2b]">
                                                    {selectedProduct.name || selectedProduct.title || "Shop the look"}
                                                </p>
                                                {selectedPrice && (
                                                    <p className="mt-1 text-[13px] font-medium text-[#4c5564]">
                                                        {selectedPrice}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#071A41] px-3.5 text-[12px] font-semibold text-white transition-colors group-hover:bg-[#18365a]">
                                                Shop
                                                <ArrowUpRight size={15} strokeWidth={1.9} />
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                        {/* Desktop arrows */}
                        {reels.length > 1 && (
                            <button
                                type="button"
                                aria-label="Previous reel"
                                onClick={handlePrevious}
                                className="absolute left-[calc(50%-270px)] top-1/2 z-[2147483647] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_25px_rgba(0,0,0,0.3)] transition-all duration-200 hover:scale-110 hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:flex xl:left-[calc(50%-275px)]"
                                style={{ zIndex: MODAL_Z_INDEX }}
                            >
                                <ChevronLeft size={23} strokeWidth={2.5} />
                            </button>
                        )}
                        {reels.length > 1 && (
                            <button
                                type="button"
                                aria-label="Next reel"
                                onClick={handleNext}
                                className="absolute right-[calc(50%-270px)] top-1/2 z-[2147483647] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_25px_rgba(0,0,0,0.3)] transition-all duration-200 hover:scale-110 hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:flex lg:right-[calc(50%-275px)]"
                                style={{ zIndex: MODAL_Z_INDEX }}
                            >
                                <ChevronRight size={23} strokeWidth={2.5} />
                            </button>
                        )}
                        {/* Tablet arrows (md → lg) */}
                        {reels.length > 1 && (
                            <button
                                type="button"
                                aria-label="Previous reel"
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 z-[2147483647] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-lg backdrop-blur-md md:flex lg:hidden"
                                style={{ zIndex: MODAL_Z_INDEX }}
                            >
                                <ChevronLeft size={22} />
                            </button>
                        )}
                        {reels.length > 1 && (
                            <button
                                type="button"
                                aria-label="Next reel"
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 z-[2147483647] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-lg backdrop-blur-md md:flex lg:hidden"
                                style={{ zIndex: MODAL_Z_INDEX }}
                            >
                                <ChevronRight size={22} />
                            </button>
                        )}
                        {/* Mobile arrows */}
                        {reels.length > 1 && (
                            <button
                                type="button"
                                aria-label="Previous reel"
                                onClick={handlePrevious}
                                className="absolute left-2 top-[42%] z-[2147483647] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md md:hidden"
                                style={{ zIndex: MODAL_Z_INDEX }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        {reels.length > 1 && (
                            <button
                                type="button"
                                aria-label="Next reel"
                                onClick={handleNext}
                                className="absolute right-2 top-[42%] z-[2147483647] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md md:hidden"
                                style={{ zIndex: MODAL_Z_INDEX }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}
                    </motion.div>
                </div>,
                document.body,
            )
            : null;
    return (
        <>
            <section className="relative isolate w-full overflow-hidden bg-[#f9f8f5] py-12 sm:py-16 lg:py-20">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/85 to-transparent" />
                <div className="relative mx-auto w-full max-w-[2000px]">
                    <div className="mb-7 px-5 text-center sm:mb-9 sm:px-8 lg:mb-10">
                        <div className="mb-3 flex items-center justify-center gap-3">
                            <span className="h-px w-7 bg-[#c2a475]/65" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#967a55]">
                                Curated for you
                            </span>
                            <span className="h-px w-7 bg-[#c2a475]/65" />
                        </div>
                        <h2 className="font-serif text-[30px] font-medium leading-[1.12] tracking-[-0.045em] text-[#142137] sm:text-[38px] lg:text-[46px]">
                            Experience the world of <span className="text-[#967447]">Indiekonnect</span>
                        </h2>
                        <p className="mx-auto mt-3 max-w-[440px] text-[12px] leading-relaxed text-[#69717c] sm:text-[14px]">
                            Beautiful finds, real stories, and style worth discovering.
                        </p>
                    </div>
                    <ShopReelsRow
                        reels={reels}
                        isLoading={isLoading}
                        error={error}
                        openReel={openReel}
                    />
                </div>
            </section>
            {modalContent}
        </>
    );
}
