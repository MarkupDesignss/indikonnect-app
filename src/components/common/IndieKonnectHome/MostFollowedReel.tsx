"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Volume2, VolumeX, X } from "lucide-react";

import { useGetReelsQuery } from "@/lib/redux/api/Home/contentApi";

/* ================================================================
   TYPES
================================================================ */

interface ReelProduct {
    id?: number | string;
    slug?: string;
    product_slug?: string;
    name?: string;
    title?: string;
    retail_price?: number | string;
    sale_price?: number | string;
    price?: number | string;
    regular_price?: number | string;
    product_image?: { image?: string };
    primary_image_url?: string;
    image_url?: string;
    thumbnail_url?: string;
    image?: string;
}

interface Reel {
    id: number | string;
    title?: string | null;
    creator_handle?: string | null;
    followers_count?: number | string | null;
    views_count?: number | string | null;
    view_count?: number | string | null;
    views?: number | string | null;
    video_full_path?: string | null;
    video_full_url?: string | null;
    video_url?: string | null;
    videoUrl?: string | null;
    url?: string | null;
    video_path?: string | null;
    thumbnail_url?: string | null;
    thumbnailUrl?: string | null;
    thumbnail?: string | null;
    cover_image_url?: string | null;
    cover_image?: string | null;
    product?: ReelProduct | null;
    products?: ReelProduct[];
    [key: string]: any;
}

/* ================================================================
   CONSTANTS
================================================================ */

const STORAGE_BASE_URL =
    "https://www.markupdesigns.net/indikonnect/storage/";
const FALLBACK_IMAGE = "/indiekonnect-web/images/placeholder.jpg";
const MODAL_Z_INDEX = 2147483647;
const FOLLOWER_STORAGE_KEY = "indiekonnect_reel_followers";

/* ================================================================
   HELPERS
================================================================ */

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
    return normalizeAssetUrl(
        reel?.video_full_path ||
        reel?.video_full_url ||
        reel?.video_url ||
        reel?.videoUrl ||
        reel?.url ||
        reel?.video_path ||
        "",
    );
}

function getReelThumbnail(reel: Reel): string {
    return (
        normalizeAssetUrl(
            reel?.thumbnail_url ||
            reel?.thumbnailUrl ||
            reel?.cover_image_url ||
            reel?.cover_image ||
            reel?.thumbnail ||
            "",
        ) || FALLBACK_IMAGE
    );
}

function getReelProduct(reel: Reel | null): ReelProduct | null {
    if (!reel) return null;
    if (reel.product) return reel.product;
    if (Array.isArray(reel.products) && reel.products.length > 0) {
        return reel.products[0];
    }
    return null;
}

function getProductImage(product: ReelProduct | null): string {
    if (!product) return FALLBACK_IMAGE;
    if (product?.product_image?.image) {
        return (
            normalizeAssetUrl(product.product_image.image) || FALLBACK_IMAGE
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

function getProductSlug(product: ReelProduct | null): string {
    if (!product) return "";
    return product?.slug || product?.product_slug || "";
}

function formatNumber(value?: number | string | null): string {
    if (!value) return "0";
    const num = Number(value);
    if (Number.isNaN(num)) return "0";

    if (num >= 1000000) {
        const m = num / 1000000;
        return (Number.isInteger(m) ? m.toString() : m.toFixed(1)) + "M";
    }
    if (num >= 1000) {
        const k = num / 1000;
        return (Number.isInteger(k) ? k.toString() : k.toFixed(1)) + "K";
    }
    return num.toString();
}

/* ================================================================
   LOCALSTORAGE FOLLOWER COUNT
================================================================ */

function getStoredFollowerCount(reelId: string | number): number | null {
    if (typeof window === "undefined") return null;
    try {
        const stored = localStorage.getItem(FOLLOWER_STORAGE_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        if (
            parsed &&
            typeof parsed === "object" &&
            parsed[reelId] !== undefined
        ) {
            return Number(parsed[reelId]);
        }
    } catch {
        // ignore
    }
    return null;
}

function setStoredFollowerCount(
    reelId: string | number,
    count: number | string | null | undefined,
) {
    if (typeof window === "undefined") return;
    try {
        const stored = localStorage.getItem(FOLLOWER_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed[reelId] = count;
        localStorage.setItem(FOLLOWER_STORAGE_KEY, JSON.stringify(parsed));
    } catch {
        // ignore
    }
}

/* ================================================================
   SAFE PLAY
================================================================ */

function safelyPlayVideo(video: HTMLVideoElement | null, muted: boolean) {
    if (!video) return;
    try {
        video.muted = muted;
        video.playsInline = true;
        const p = video.play();
        if (p !== undefined) p.catch(() => { });
    } catch {
        // ignore
    }
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

interface MostFollowedReelProps {
    reelsData?: any;
    isLoading?: boolean;
    enabled?: boolean;
}

export default function MostFollowedReel({
    reelsData,
    isLoading: parentLoading,
    enabled = true,
}: MostFollowedReelProps) {
    const router = useRouter();

    const shouldUseHook = reelsData === undefined;

    const { data: hookReelsData, isLoading: hookLoading } = useGetReelsQuery(
        undefined,
        { skip: !shouldUseHook },
    );

    const rawReelsData = shouldUseHook ? hookReelsData : reelsData;
    const isLoading = shouldUseHook ? hookLoading : Boolean(parentLoading);

    const reels = useMemo(
        () => normalizeReelsResponse(rawReelsData),
        [rawReelsData],
    );

    // Find the most followed reel
    const topReel = useMemo(() => {
        if (!reels.length) return null;

        let best: Reel | null = null;
        let bestCount = -1;

        for (const reel of reels) {
            const stored = getStoredFollowerCount(reel.id);
            const apiCount =
                Number(
                    reel?.followers_count ||
                    reel?.views_count ||
                    reel?.view_count ||
                    reel?.views ||
                    0,
                ) || 0;

            const count =
                stored !== null && !Number.isNaN(stored)
                    ? Math.max(stored, apiCount)
                    : apiCount;

            // Persist if API count is bigger
            if (stored === null || apiCount > stored) {
                setStoredFollowerCount(reel.id, apiCount);
            }

            if (count > bestCount) {
                bestCount = count;
                best = reel;
            }
        }

        return best;
    }, [reels]);

    const [isDismissed, setIsDismissed] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [mounted, setMounted] = useState(false);

    const previewVideoRef = useRef<HTMLVideoElement | null>(null);
    const expandedVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const videoUrl = topReel ? getReelVideo(topReel) : "";
    const thumbnail = topReel ? getReelThumbnail(topReel) : "";
    const product = topReel ? getReelProduct(topReel) : null;

    const viewCount =
        topReel &&
        Number(
            topReel?.followers_count ||
            topReel?.views_count ||
            topReel?.view_count ||
            topReel?.views ||
            0,
        );
    const formattedViewCount = formatNumber(viewCount || 0);

    /* ============================================================
       PREVIEW VIDEO AUTOPLAY
    ============================================================ */
    useEffect(() => {
        if (!videoUrl || isDismissed) return;
        const video = previewVideoRef.current;
        if (!video) return;

        video.muted = true;
        video.loop = true;
        video.playsInline = true;

        safelyPlayVideo(video, true);

        const handleLoaded = () => safelyPlayVideo(video, true);
        video.addEventListener("loadeddata", handleLoaded);
        video.addEventListener("canplay", handleLoaded);

        return () => {
            video.removeEventListener("loadeddata", handleLoaded);
            video.removeEventListener("canplay", handleLoaded);
            video.pause();
        };
    }, [videoUrl, isDismissed]);

    /* ============================================================
       EXPANDED VIDEO AUTOPLAY
    ============================================================ */
    useEffect(() => {
        if (!isExpanded || !videoUrl) return;
        const video = expandedVideoRef.current;
        if (!video) return;

        video.muted = isMuted;
        video.loop = true;
        video.playsInline = true;

        safelyPlayVideo(video, isMuted);

        const handleLoaded = () => safelyPlayVideo(video, isMuted);
        video.addEventListener("loadeddata", handleLoaded);
        video.addEventListener("canplay", handleLoaded);

        return () => {
            video.removeEventListener("loadeddata", handleLoaded);
            video.removeEventListener("canplay", handleLoaded);
            video.pause();
        };
    }, [isExpanded, videoUrl, isMuted]);

    /* ============================================================
       BODY SCROLL LOCK WHEN EXPANDED
    ============================================================ */
    useEffect(() => {
        if (!isExpanded) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isExpanded]);

    /* ============================================================
       ESC TO CLOSE
    ============================================================ */
    useEffect(() => {
        if (!isExpanded) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                setIsExpanded(false);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isExpanded]);

    const handleShopNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!product) return;
        const slug = getProductSlug(product);
        if (slug) {
            router.push(`/product/${slug}`);
            return;
        }
        if (product.id) {
            router.push(`/product/${product.id}`);
        }
    };

    if (!enabled || isLoading || !topReel || isDismissed) return null;

    /* ============================================================
       FLOATING CARD — mobile: bigger + slightly raised; laptop unchanged
    ============================================================ */
    const floatingCard = (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="
                fixed
                bottom-8
                right-2
                z-[9999999]
                sm:bottom-4
                sm:right-5
                md:bottom-6
                md:right-6
            "
        >
            <div
                className="
                    group
                    relative
                    h-[280px]
                    w-[160px]
                    overflow-hidden
                    rounded-[14px]
                    bg-black
                    shadow-[0_18px_50px_rgba(0,0,0,0.35)]
                    ring-1
                    ring-white/10
                    transition-transform
                    duration-300
                    hover:-translate-y-1
                    sm:h-[260px]
                    sm:w-[145px]
                    md:h-[320px]
                    md:w-[190px]
                "
            >
                {/* Video / Thumbnail */}
                {videoUrl ? (
                    <video
                        ref={previewVideoRef}
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

                {/* Gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

                {/* Views badge (top-left) */}
                <div
                    className="
                        absolute
                        left-2
                        top-2
                        z-10
                        flex
                        items-center
                        gap-1
                        rounded-full
                        border
                        border-white/20
                        bg-black/55
                        px-2
                        py-1
                        text-[9px]
                        font-semibold
                        text-white
                        shadow-lg
                        backdrop-blur-md
                        sm:left-2.5
                        sm:top-2.5
                        sm:px-2.5
                        sm:py-1.5
                        sm:text-[10px]
                    "
                >
                    <Eye
                        size={11}
                        strokeWidth={2}
                        className="shrink-0 text-white"
                    />
                    <span className="leading-none">{formattedViewCount}</span>
                </div>

                {/* Close button (top-right) */}
                <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDismissed(true);
                    }}
                    className="
                        absolute
                        right-2
                        top-2
                        z-20
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        bg-black/55
                        text-white
                        backdrop-blur-md
                        transition
                        hover:bg-white
                        hover:text-black
                        sm:right-2.5
                        sm:top-2.5
                        sm:h-6
                        sm:w-6
                        md:h-7
                        md:w-7
                    "
                >
                    <X size={13} strokeWidth={2.5} />
                </button>

                {/* Bottom: Shop Now — full width on mobile, half on sm+ */}
                <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end p-2">
                    <button
                        type="button"
                        onClick={handleShopNow}
                        className="
                            w-full
                            whitespace-nowrap
                            rounded-full
                            border
                            border-white/40
                            bg-white/15
                            px-3
                            py-2
                            font-serif
                            text-[9px]
                            uppercase
                            tracking-[0.14em]
                            text-white
                            backdrop-blur-xl
                            transition
                            hover:bg-white/25
                            sm:w-1/2
                            sm:px-2
                            sm:py-1.5
                            sm:text-[8px]
                            md:px-3
                            md:py-2
                            md:text-[9.5px]
                        "
                    >
                        Shop Now
                    </button>
                </div>
            </div>
        </motion.div>
    );

    /* ============================================================
       EXPANDED MODAL
    ============================================================ */
    const expandedModal =
        mounted && isExpanded
            ? createPortal(
                <div
                    className="fixed inset-0 z-[2147483647] flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-black/80"
                    style={{ isolation: "isolate", zIndex: MODAL_Z_INDEX }}
                    onClick={() => setIsExpanded(false)}
                >
                    {/* Blurred bg */}
                    <div
                        className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center blur-[25px]"
                        style={{ backgroundImage: `url("${thumbnail}")` }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/65 backdrop-blur-[9px]" />

                    {/* Close */}
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(false);
                        }}
                        className="absolute right-3 top-3 z-[2147483647] flex h-9 w-9 items-center justify-center text-white transition duration-200 hover:scale-110 sm:right-4 sm:top-3 sm:h-10 sm:w-10"
                        style={{ zIndex: MODAL_Z_INDEX }}
                    >
                        <X size={28} strokeWidth={2} className="sm:size-[32px]" />
                    </button>

                    {/* Stage */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.32,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative flex h-full w-full items-center justify-center"
                        style={{ zIndex: MODAL_Z_INDEX - 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative z-[200] h-[92vh] max-h-[900px] w-[430px] overflow-hidden bg-black shadow-[0_30px_100px_rgba(0,0,0,0.65)] md:rounded-[5px]">
                            {videoUrl ? (
                                <video
                                    ref={expandedVideoRef}
                                    src={videoUrl}
                                    poster={thumbnail}
                                    autoPlay
                                    loop
                                    playsInline
                                    muted={isMuted}
                                    preload="auto"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : (
                                <img
                                    src={thumbnail}
                                    alt="Reel"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            )}

                            {/* Gradients */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-black/30 to-transparent" />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[23%] bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                            {/* Mute */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMuted((m) => !m);
                                }}
                                aria-label={isMuted ? "Unmute" : "Mute"}
                                className="absolute right-3 top-8 z-[500] flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:right-4 sm:top-10 sm:h-10 sm:w-10"
                            >
                                {isMuted ? (
                                    <VolumeX size={18} className="sm:size-[20px]" />
                                ) : (
                                    <Volume2 size={18} className="sm:size-[20px]" />
                                )}
                            </button>

                            {/* Bottom: Shop Now only */}
                            <div className="absolute bottom-4 left-3 right-3 z-[600] sm:bottom-5 sm:left-4 sm:right-4">
                                <button
                                    type="button"
                                    onClick={handleShopNow}
                                    className="w-full rounded-full border border-white/30 bg-white/[0.18] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.10em] text-white shadow-md backdrop-blur-xl transition hover:bg-white/[0.27] active:scale-[0.99] sm:px-4 sm:py-3 sm:text-[11px]"
                                >
                                    Shop Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>,
                document.body,
            )
            : null;

    return (
        <>
            <AnimatePresence>{floatingCard}</AnimatePresence>
            {expandedModal}
        </>
    );
}