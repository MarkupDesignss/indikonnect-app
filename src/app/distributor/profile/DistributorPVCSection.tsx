"use client";

import { useCallback, useEffect, useState } from "react";

import {

    CreditCard,

    Download,

    Loader2,

    Printer,

    RefreshCw,

    ShieldCheck,

    Truck,

    X,

} from "lucide-react";

import { jsPDF } from "jspdf";

import Logo from "../../../../public/indiekonnect-web/images/logo.png";

const API_BASE = "/api/distributor-card";

const MM_W = 85.6;

const MM_H = 54;

const PX_W = 1011;

const PX_H = 638;
// Registered office address supplied for the PVC card. Verify legal-entity details before issuing cards.
const COMPANY_ADDRESS = "SH05, The Eminence Plaza, Near Singhpura Lights, Rajpura, Mohali, Punjab - 140603, India";

const COMPANY_EMAIL = "[Customer care email]";

const COMPANY_PHONE = "[Customer care phone]";
// Demo validity only; issue and expiry must come from backend for real cards.
const DEMO_ISSUED = "2026-10-23";

const DEMO_EXPIRY = "2027-10-22";
// ---- Clean White / Black Theme ----
const INK = "#16334C";

const MUTED = "#657D8B";

const PAPER = "#FFFFFF";

const SOFT = "#F1F8FA";

const BORDER = "#D5E5EA";

const GREEN = "#008A78";

const FONT_FAMILY = "Poppins, Arial, sans-serif";

const MED = (px: number) => `500 ${px}px ${FONT_FAMILY}`;

const SEMI = (px: number) => `600 ${px}px ${FONT_FAMILY}`;
// Photo rectangle on the FRONT card.
const PHOTO = { x: 760, y: 181, w: 196, h: 244, r: 16 };

// The photo is embedded directly into the canvas for preview, PDF and print.
// Do not overlay a separate HTML image: PDF export cannot capture HTML overlays.


type User = {

    full_name?: string;

    distributor_id?: string;

    profile_picture?: string | { url?: string; path?: string } | null;

    profile_image?: string | null;

    avatar?: string | null;

    account_type?: string;

    distributor_status?: string;

    is_active?: boolean;

    email?: string;

    phone?: string;

    date_of_birth?: string;

    created_at?: string;

    joining_date?: string;

    state?: string;

    country?: string;

    distributor_profile?: {

        state?: string;

        joining_date?: string;

    };

};

type Address = {

    full_name: string;

    phone: string;

    address_line1: string;

    address_line2: string;

    city: string;

    state: string;

    pincode: string;

};

type Quote = {

    quote_id: string;

    amount_paise: number;

    currency: "INR";

    description?: string;

};

type OrderResponse = {

    request_id: string;

    razorpay_key: string;

    razorpay_order_id: string;

    amount_paise: number;

    currency: "INR";

};

declare global {

    interface Window {

        Razorpay?: new (options: Record<string, unknown>) => { open(): void };

    }

}

const emptyAddress: Address = {

    full_name: "",

    phone: "",

    address_line1: "",

    address_line2: "",

    city: "",

    state: "",

    pincode: "",

};

async function api<T>(

    path: string,

    options: RequestInit = {},

): Promise<T> {

    const res = await fetch(API_BASE + path, {

        ...options,

        credentials: "include",

        cache: "no-store",

        headers: {

            "Content-Type": "application/json",

            ...options.headers,

        },

    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok || body.success === false) {

        throw new Error(body.message || `API request failed (${res.status})`);

    }

    return (body.data ?? body) as T;

}

function loadRazorpay(): Promise<void> {

    if (window.Razorpay) return Promise.resolve();

    return new Promise((resolve, reject) => {

        const old = document.querySelector<HTMLScriptElement>(

            'script[data-razorpay-checkout="true"]',

        );

        if (old) {

            old.addEventListener("load", () => resolve(), { once: true });

            old.addEventListener(

                "error",

                () => reject(new Error("Payment gateway failed to load")),

                { once: true },

            );

            return;

        }

        const tag = document.createElement("script");

        tag.src = "https://checkout.razorpay.com/v1/checkout.js";

        tag.async = true;

        tag.dataset.razorpayCheckout = "true";

        tag.onload = () => resolve();

        tag.onerror = () => reject(new Error("Payment gateway failed to load"));

        document.body.appendChild(tag);

    });

}
// Load Poppins 500/600 for the UI and canvas card.
async function loadPoppins(): Promise<void> {

    if (typeof document === "undefined") return;

    const id = "poppins-card-font";

    let link = document.getElementById(id) as HTMLLinkElement | null;

    if (!link) {

        link = document.createElement("link");

        link.id = id;

        link.rel = "stylesheet";

        link.href =

            "https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&display=swap";

        document.head.appendChild(link);

    }

    try {

        await Promise.race([

            new Promise<void>((resolve) => {

                if (link!.sheet) return resolve();

                link!.addEventListener("load", () => resolve(), { once: true });

                link!.addEventListener("error", () => resolve(), { once: true });

            }),

            new Promise<void>((resolve) => setTimeout(resolve, 3000)),

        ]);

        await Promise.race([

            Promise.all([

                document.fonts.load("500 24px Poppins"),

                document.fonts.load("600 24px Poppins"),

            ]),

            new Promise<void>((resolve) => setTimeout(resolve, 3000)),

        ]);

    } catch {
        // Fall back to Arial silently.
    }

}

function getProfilePhotoUrl(user: User): string | null {

    const picture = user.profile_picture;

    const candidate =

        typeof picture === "string" ? picture : picture?.url || picture?.path;

    const finalValue = candidate || user.profile_image || user.avatar;

    if (!finalValue || typeof finalValue !== "string") return null;

    return finalValue.trim() || null;

}

// External storage images must be fetched through a same-origin server route.
// Canvas export cannot embed cross-origin images without appropriate CORS headers.
function exportablePhotoUrl(rawUrl: string): string {
    const value = rawUrl.trim();
    if (/^data:image\/(png|jpeg|webp);base64,/i.test(value)) return value;
    if (value.startsWith("blob:")) return value;
    const url = new URL(value, window.location.origin);
    if (!/^(https?):$/.test(url.protocol)) {
        throw new Error("Unsupported profile photo URL");
    }
    if (url.origin === window.location.origin) return url.href;
    return `/api/distributor-card/profile-photo?url=${encodeURIComponent(url.href)}`;
}

// Try a direct CORS-safe image first, then the same-origin image route.
// This keeps the original on-screen photo independent from PDF embedding.
async function loadPhotoForCanvas(rawUrl: string): Promise<HTMLImageElement> {
    const value = rawUrl.trim();
    const direct = new URL(value, window.location.origin).href;
    const directErrors: string[] = [];

    // First try the original photo in a CORS-safe canvas (works for same-origin images).
    try {
        const image = await img(direct, true);
        const test = document.createElement("canvas");
        test.width = test.height = 1;
        const ctx = test.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.drawImage(image, 0, 0, 1, 1);
        test.toDataURL("image/png");
        return image;
    } catch (err) {
        directErrors.push(err instanceof Error ? err.message : String(err));
    }

    // A cross-origin image visible in <img> is not automatically exportable.
    // Fetch it through our trusted server route, which exposes the actual HTTP error.
    const proxy = exportablePhotoUrl(value);
    if (proxy === direct || proxy.startsWith("data:") || proxy.startsWith("blob:")) {
        throw new Error(`Direct image is not canvas-exportable: ${directErrors.join(", ")}`);
    }
    // Next.js basePath deployments can expose the same route under a prefix.
    // Try the configured/base-path URL first, then the site-root API route.
    const pathPrefix = window.location.pathname.startsWith("/indiekonnect-web/")
        ? "/indiekonnect-web"
        : "";
    const routePath = `/api/distributor-card/profile-photo?url=${encodeURIComponent(direct)}`;
    const candidates = Array.from(new Set([
        `${pathPrefix}${routePath}`,
        proxy,
        `/indiekonnect-web${routePath}`,
    ]));
    let response: Response | null = null;
    const attempts: string[] = [];
    for (const candidate of candidates) {
        try {
            const result = await fetch(candidate, { credentials: "same-origin", cache: "no-store" });
            if (result.ok) { response = result; break; }
            let detail = "";
            try {
                const data: unknown = await result.json();
                if (data && typeof data === "object" && "error" in data) {
                    detail = String((data as { error?: unknown }).error || "");
                }
            } catch { /* e.g. HTML 404 */ }
            attempts.push(`${candidate}: HTTP ${result.status}${detail ? ` (${detail})` : ""}`);
            // 404 means try the alternate route. Other errors also report details.
        } catch (err) {
            attempts.push(`${candidate}: ${err instanceof Error ? err.message : "Network error"}`);
        }
    }
    if (!response) {
        throw new Error(`Photo proxy failed. ${attempts.join("; ")}. Verify route.ts is in the running Next.js app and deployed.`);
    }
    const type = (response.headers.get("content-type") || "").toLowerCase();
    if (!type.startsWith("image/")) throw new Error(`Photo proxy returned ${type || "non-image content"}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
        const image = await img(objectUrl, false);
        // Image has decoded before the object URL is revoked.
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.drawImage(image, 0, 0, 1, 1);
        canvas.toDataURL("image/png");
        // Convert to data URL so the image stays valid after revoking the object URL.
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Image could not be decoded"));
            reader.readAsDataURL(blob);
        });
        return await img(dataUrl, false);
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

function img(

    src: string,

    allowCanvasExport = false,

): Promise<HTMLImageElement> {

    return new Promise((resolve, reject) => {

        const image = new Image();

        if (allowCanvasExport) image.crossOrigin = "anonymous";

        image.onload = () => resolve(image);

        image.onerror = () => reject(new Error("Image unavailable"));

        image.src = src;

    });

}

function escapeHtmlAttribute(value: string): string {

    return value

        .replace(/&/g, "&amp;")

        .replace(/"/g, "&quot;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;");

}

function formatDate(value?: string): string {

    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-GB", {

        day: "2-digit",

        month: "short",

        year: "numeric",

    });

}

function initials(name?: string) {

    return (name || "ID")

        .trim()

        .split(/\s+/)

        .filter(Boolean)

        .slice(0, 2)

        .map((part) => part[0])

        .join("")

        .toUpperCase();

}

function roundRect(

    ctx: CanvasRenderingContext2D,

    x: number,

    y: number,

    w: number,

    h: number,

    r: number,

) {

    ctx.beginPath();

    ctx.roundRect(x, y, w, h, r);

}

function drawText(

    ctx: CanvasRenderingContext2D,

    value: string,

    x: number,

    y: number,

    font: string,

    color: string,

    maxWidth?: number,

    align: CanvasTextAlign = "left",

    spacing = "0px",

) {

    const c = ctx as CanvasRenderingContext2D & {

        letterSpacing?: string;

    };

    ctx.font = font;

    ctx.fillStyle = color;

    ctx.textAlign = align;

    if ("letterSpacing" in c) c.letterSpacing = spacing;

    ctx.fillText(value, x, y, maxWidth);

    if ("letterSpacing" in c) c.letterSpacing = "0px";

    ctx.textAlign = "left";

}

function drawLabelValue(

    ctx: CanvasRenderingContext2D,

    label: string,

    value: string,

    x: number,

    y: number,

    width = 330,

) {

    drawText(

        ctx,

        label.toUpperCase(),

        x,

        y,

        MED(14),

        MUTED,

        width,

        "left",

        "2px",

    );

    drawText(ctx, value || "—", x, y + 34, SEMI(24), INK, width);

}

function cropPhoto(

    ctx: CanvasRenderingContext2D,

    photo: HTMLImageElement,

    x: number,

    y: number,

    w: number,

    h: number,

    r: number,

) {

    const ratio = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);

    const nw = photo.naturalWidth * ratio;

    const nh = photo.naturalHeight * ratio;

    ctx.save();

    roundRect(ctx, x, y, w, h, r);

    ctx.clip();

    ctx.drawImage(

        photo,

        x + (w - nw) / 2,

        y + (h - nh) / 2,

        nw,

        nh,

    );

    ctx.restore();

}

function fitName(

    ctx: CanvasRenderingContext2D,

    value: string,

    maxWidth: number,

) {

    let size = 42;

    while (size > 20) {

        ctx.font = SEMI(size);

        if (ctx.measureText(value).width <= maxWidth) break;

        size -= 1;

    }

    return size;

}
// Clean white card background.
function lightBackground(ctx: CanvasRenderingContext2D) {

    ctx.fillStyle = PAPER;

    ctx.fillRect(0, 0, PX_W, PX_H);

}
// ======================================================// SMALL, CENTERED WATERMARK// The logo stays inside the content area and does not// spread over the entire card or go outside the canvas.// ======================================================
function drawWatermark(

    ctx: CanvasRenderingContext2D,

    logo: HTMLImageElement | null,

    side: "front" | "back",

) {

    if (!logo || !logo.naturalWidth || !logo.naturalHeight) return;
    // Front: keep the watermark behind the information area,// away from the distributor photo.// // Back: center it inside the card's inner content area.
    const area =

        side === "front"

            ? {

                x: 285,

                y: 108,

                w: 690,

                h: 470,

            }

            : {

                x: 50,

                y: 108,

                w: 925,

                h: 470,

            };
    // Smaller maximum size for a subtle background watermark.
    const maxW = 310;

    const maxH = 190;
    // Keep the logo's original aspect ratio.
    const scale = Math.min(

        maxW / logo.naturalWidth,

        maxH / logo.naturalHeight,

        area.w / logo.naturalWidth,

        area.h / logo.naturalHeight,

    );

    const wmW = logo.naturalWidth * scale;

    const wmH = logo.naturalHeight * scale;
    // Center the watermark in its allowed area.
    const x = area.x + (area.w - wmW) / 2;

    const y = area.y + (area.h - wmH) / 2;

    ctx.save();
    // Prevent the watermark from drawing outside its area.
    ctx.beginPath();

    ctx.rect(area.x, area.y, area.w, area.h);

    ctx.clip();
    // Very light watermark, keeping foreground text readable.
    ctx.globalAlpha = 0.04;

    ctx.drawImage(logo, x, y, wmW, wmH);

    ctx.restore();

}

function drawHeader(

    ctx: CanvasRenderingContext2D,

    logo: HTMLImageElement | null,

    height: number,

) {

    ctx.fillStyle = PAPER;

    ctx.fillRect(0, 0, PX_W, height);

    ctx.fillStyle = BORDER;

    ctx.fillRect(0, height, PX_W, 4);

    if (logo && logo.naturalWidth > 0 && logo.naturalHeight > 0) {

        const maxW = 240;

        const maxH = height - 24;

        const scale = Math.min(

            maxW / logo.naturalWidth,

            maxH / logo.naturalHeight,

        );

        const lw = logo.naturalWidth * scale;

        const lh = logo.naturalHeight * scale;

        ctx.drawImage(logo, PHOTO.x + 20, (height - lh) / 2, lw, lh);

    } else {

        drawText(

            ctx,

            "INDIEKONNECT",

            PHOTO.x + 20,

            height / 2 + 9,

            SEMI(28),

            INK,

            300,

            "left",

            "1px",

        );

    }

}

function drawFooterBand(ctx: CanvasRenderingContext2D) {

    ctx.fillStyle = PAPER;

    ctx.fillRect(0, 578, PX_W, 60);

    ctx.fillStyle = BORDER;

    ctx.fillRect(0, 578, PX_W, 2);

}

function drawStatusBadge(

    ctx: CanvasRenderingContext2D,

    status: string,

    active: boolean,

    x: number,

    y: number,

    w: number,

    h: number,

) {

    const col = active ? GREEN : "#B45309";

    ctx.fillStyle = active ? "#E8F8EE" : "#FFF3E0";

    roundRect(ctx, x, y, w, h, h / 2);

    ctx.fill();

    ctx.strokeStyle = col;

    ctx.lineWidth = 2;

    roundRect(ctx, x, y, w, h, h / 2);

    ctx.stroke();

    ctx.fillStyle = col;

    ctx.beginPath();

    ctx.arc(x + 28, y + h / 2, 7, 0, Math.PI * 2);

    ctx.fill();

    drawText(

        ctx,

        status.toUpperCase(),

        x + w / 2 + 12,

        y + h / 2 + 7,

        SEMI(19),

        col,

        w - 70,

        "center",

        "2px",

    );

}

function wrapCardText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string) {

    ctx.font = font;

    const output: string[] = [];

    let line = "";

    for (const word of text.split(/\s+/)) {

        const next = line ? `${line} ${word}` : word;

        if (ctx.measureText(next).width > maxWidth && line) {

            output.push(line);

            line = word;

        } else line = next;

    }

    if (line) output.push(line);

    return output;

}

async function drawCard(
    user: User,
    side: "front" | "back",
    photo: HTMLImageElement | null,
    logo: HTMLImageElement | null,
): Promise<string> {
    const canvas = document.createElement("canvas");
    canvas.width = PX_W;
    canvas.height = PX_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    const NAVY = "#173B55";
    const TEAL = "#087F86";
    const LIGHT = "#EAF6F7";
    const SAND = "#F9FCFD";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, PX_W, PX_H);

    // A clean diagonal accent produces the same premium finish in print and PDF.
    ctx.fillStyle = LIGHT;
    ctx.beginPath();
    ctx.moveTo(670, 0); ctx.lineTo(1011, 0); ctx.lineTo(1011, 500);
    ctx.lineTo(906, 500); ctx.closePath(); ctx.fill();
    ctx.fillStyle = TEAL;
    ctx.fillRect(0, 0, 12, PX_H);
    ctx.fillStyle = NAVY;
    ctx.fillRect(12, 0, PX_W - 12, 10);
    ctx.fillStyle = "#DAEAED";
    ctx.fillRect(45, 117, 922, 2);

    // Brand lockup: logo remains the authentic locally imported logo.
    if (logo && logo.naturalWidth && logo.naturalHeight) {
        const scale = Math.min(246 / logo.naturalWidth, 75 / logo.naturalHeight);
        ctx.drawImage(logo, 47, 26, logo.naturalWidth * scale, logo.naturalHeight * scale);
    } else {
        drawText(ctx, "INDIEKONNECT", 47, 79, SEMI(30), NAVY, 330);
    }
    drawText(ctx, "DISTRIBUTOR IDENTITY CARD", 963, 63, SEMI(22), NAVY, 560, "right", "1.5px");
    drawText(ctx, "OFFICIAL BUSINESS IDENTIFICATION", 963, 93, MED(13), TEAL, 535, "right", "2px");

    if (side === "front") {
        drawText(ctx, "AUTHORIZED DIRECT SELLER", 48, 175, SEMI(25), TEAL, 685, "left", "1px");
        drawText(ctx, "FULL NAME", 48, 238, MED(17), MUTED, 605, "left", "1.4px");
        const name = (user.full_name || "Direct Seller").trim().toUpperCase();
        const size = fitName(ctx, name, 660);
        drawText(ctx, name, 48, 289, SEMI(Math.min(size, 39)), NAVY, 658);
        ctx.fillStyle = "#CFE6E9";
        ctx.fillRect(48, 308, 635, 2);
        drawText(ctx, "DISTRIBUTOR / BA ID", 48, 350, MED(16), MUTED, 590, "left", "1px");
        drawText(ctx, user.distributor_id || "—", 48, 388, SEMI(27), NAVY, 615);
        drawText(ctx, "ISSUED ON", 48, 447, MED(15), MUTED, 230);
        drawText(ctx, formatDate(DEMO_ISSUED), 48, 480, SEMI(23), NAVY, 265);
        drawText(ctx, "VALID UNTIL", 357, 447, MED(15), MUTED, 235);
        drawText(ctx, formatDate(DEMO_EXPIRY), 357, 480, SEMI(23), NAVY, 270);
        // Photo matches PHOTO and PHOTO_CSS overlay dimensions exactly.
        const p = PHOTO;
        ctx.fillStyle = "#FFFFFF";
        roundRect(ctx, p.x - 9, p.y - 9, p.w + 18, p.h + 18, 23);
        ctx.fill();
        ctx.strokeStyle = "#B6D7DD";
        ctx.lineWidth = 3; ctx.stroke();
        if (photo) cropPhoto(ctx, photo, p.x, p.y, p.w, p.h, p.r);
        else {
            ctx.fillStyle = "#E2F0F2";
            roundRect(ctx, p.x, p.y, p.w, p.h, p.r); ctx.fill();
            drawText(ctx, initials(user.full_name), p.x + p.w / 2, p.y + 141, SEMI(66), TEAL, p.w - 18, "center");
        }
        const active = user.is_active === true || (user.is_active == null && (user.distributor_status || "").toLowerCase() === "active");
        drawStatusBadge(ctx, active ? "ACTIVE" : "INACTIVE", active, 774, 449, 180, 42);
        ctx.fillStyle = NAVY;
        ctx.fillRect(12, 527, PX_W - 12, 111);
        drawText(ctx, "INDIEKONNECT ENTERPRISES PVT. LTD.", 48, 565, SEMI(18), "#FFFFFF", 650);
        drawText(ctx, "Independent Direct Seller Identification", 48, 596, MED(15), "#C7E1E8", 660);
        ctx.strokeStyle = "#C7E1E8"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(770, 574); ctx.lineTo(960, 574); ctx.stroke();
        drawText(ctx, "Authorized Signatory", 866, 601, MED(14), "#FFFFFF", 200, "center");
    } else {
        drawText(ctx, "COMPANY INFORMATION", 48, 171, SEMI(27), NAVY);
        ctx.fillStyle = TEAL;
        ctx.fillRect(48, 186, 85, 4);
        drawText(ctx, "REGISTERED OFFICE", 48, 236, SEMI(16), TEAL, 600, "left", "1px");
        wrapCardText(ctx, COMPANY_ADDRESS, 900, MED(22)).slice(0, 3).forEach((line, i) => {
            drawText(ctx, line, 48, 274 + i * 30, MED(22), NAVY, 900);
        });
        ctx.fillStyle = "#EAF6F7";
        roundRect(ctx, 45, 351, 919, 186, 18); ctx.fill();
        drawText(ctx, "IMPORTANT INFORMATION", 65, 385, SEMI(18), TEAL, 830);
        const disclaimer = "This card identifies an independent direct seller associated with Indiekonnect Enterprises Pvt. Ltd. It does not constitute proof of company employment or government-issued identification.";
        wrapCardText(ctx, disclaimer, 870, MED(18)).slice(0, 4).forEach((line, i) => {
            drawText(ctx, line, 65, 422 + i * 28, MED(18), NAVY, 870);
        });
        ctx.fillStyle = NAVY;
        ctx.fillRect(12, 559, PX_W - 12, 79);
        drawText(ctx, "PROPERTY OF INDIEKONNECT ENTERPRISES PVT. LTD.", PX_W / 2, 607, SEMI(17), "#FFFFFF", 925, "center", "0.7px");
    }
    return canvas.toDataURL("image/png");
}

export default function DistributorPVCSection({

    user,

}: {

    user: User;

}) {

    const profilePhotoUrl = getProfilePhotoUrl(user);

    const [front, setFront] = useState("");

    const [back, setBack] = useState("");

    const [photoExportError, setPhotoExportError] = useState("");

    const [busy, setBusy] = useState<

        "render" | "download" | "print" | "quote" | "pay" | null

    >("render");

    const [modal, setModal] = useState(false);

    const [quote, setQuote] = useState<Quote | null>(null);

    const [address, setAddress] = useState<Address>(emptyAddress);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    useEffect(() => {

        void loadPoppins();

    }, []);

    const render = useCallback(async () => {

        setBusy("render");

        setError("");
        setPhotoExportError("");

        try {

            const [localLogo, photoResult] = await Promise.all([
                img(Logo.src, false).catch(() => null),
                profilePhotoUrl
                    ? Promise.resolve().then(() => loadPhotoForCanvas(profilePhotoUrl))
                        .then((image) => ({ image, problem: "" }))
                        .catch((cause) => ({
                            image: null,
                            problem: cause instanceof Error ? cause.message : "Profile photo could not be loaded",
                        }))
                    : Promise.resolve({ image: null, problem: "" }),
                loadPoppins(),
            ]).then(([logoImage, photo]) => [logoImage, photo] as const);

            if (profilePhotoUrl && !photoResult.image) {
                setPhotoExportError(
                    `Profile photo could not be embedded in the card (${photoResult.problem}). Check the image URL and image-proxy server route.`,
                );
            }

            const [frontImg, backImg] = await Promise.all([

                drawCard(user, "front", photoResult.image, localLogo),

                drawCard(user, "back", photoResult.image, localLogo),

            ]);

            setFront(frontImg);

            setBack(backImg);

        } catch (err) {

            setError(

                err instanceof Error ? err.message : "Card preview failed",

            );

        } finally {

            setBusy(null);

        }

    }, [

        profilePhotoUrl,

        user.full_name,

        user.distributor_id,

        user.profile_picture,

        user.profile_image,

        user.avatar,

        user.account_type,

        user.distributor_status,

        user.is_active,

        user.phone,

        user.email,

        user.created_at,

        user.joining_date,

        user.state,

        user.country,

        user.distributor_profile,

    ]);

    useEffect(() => {

        void render();

    }, [render]);
    // ======================================================// DOWNLOAD PDF// ======================================================
    const download = () => {

        if (!front || !back) return;
        if (photoExportError) { setError(photoExportError); return; }

        setBusy("download");

        setError("");

        try {

            const pdf = new jsPDF({

                orientation: "landscape",

                unit: "mm",

                format: [MM_W, MM_H],

                compress: true,

            });

            pdf.addImage(front, "PNG", 0, 0, MM_W, MM_H);

            pdf.addPage([MM_W, MM_H], "landscape");

            pdf.addImage(back, "PNG", 0, 0, MM_W, MM_H);

            pdf.save(

                `Indiekonnect-${(user.distributor_id || "card").replace(

                    /[^\w-]/g,

                    "",

                )}.pdf`,

            );

        } catch (err) {

            setError(

                err instanceof Error ? err.message : "PDF download failed",

            );

        } finally {

            setBusy(null);

        }

    };
    // ======================================================// PRINT CARD// ======================================================
    const print = () => {

        if (!front || !back) return;
        if (photoExportError) { setError(photoExportError); return; }

        const popup = window.open("", "_blank");

        if (!popup) {

            setError("Allow pop-ups to print the card");

            return;

        }

        setBusy("print");

        setError("");

        try {

            popup.document.open();

            popup.document.write(`<!doctype html>

<html>

<head>

<meta charset="utf-8" />

<title>Print Indiekonnect ID</title>

<style>

@page{size:A4 portrait;margin:15mm}

*{box-sizing:border-box}

body{font:13px Arial,sans-serif;padding:0;margin:0}

.card-wrap{

  position:relative;

  width:85.6mm;

  height:54mm;

  margin:0 0 12mm 0;

  print-color-adjust:exact;

  -webkit-print-color-adjust:exact

}

.card{

  position:absolute;

  inset:0;

  width:100%;

  height:100%;

  display:block

}

.note{margin:0 0 8mm 0;padding:0}

@media print{.note{display:none}}

</style>

</head>

<body>

<p class="note">Print at 100% / Actual Size. Front and back are separate; align carefully for duplex printing.</p>

<div class="card-wrap">

  <img class="card" src="${front}" alt="Front card" />


</div>

<div class="card-wrap">

  <img class="card" src="${back}" alt="Back card" />

</div>

<script>

window.addEventListener('load', function(){

  setTimeout(function(){ window.print(); }, 300);

});

<\/script>

</body>

</html>`);

            popup.document.close();

        } catch (err) {

            popup.close();

            setError(err instanceof Error ? err.message : "Print failed");

        } finally {

            setBusy(null);

        }

    };
    // ======================================================// REQUEST PVC CARD DELIVERY// ======================================================
    const startRequest = async () => {

        setBusy("quote");

        setError("");

        setMessage("");

        try {

            const q = await api<Quote>("/quote");

            if (

                !q.quote_id ||

                !Number.isSafeInteger(q.amount_paise) ||

                q.amount_paise <= 0 ||

                q.currency !== "INR"

            ) {

                throw new Error("Invalid price quote");

            }

            setQuote(q);

            setAddress((prev) => ({

                ...prev,

                full_name: prev.full_name || user.full_name || "",

            }));

            setModal(true);

        } catch (err) {

            setError(

                err instanceof Error ? err.message : "Price unavailable",

            );

        } finally {

            setBusy(null);

        }

    };

    const pay = async () => {

        if (!quote || busy) return;

        if (

            !address.full_name.trim() ||

            !/^\d{10}$/.test(address.phone) ||

            !address.address_line1.trim() ||

            !address.city.trim() ||

            !address.state.trim() ||

            !/^\d{6}$/.test(address.pincode)

        ) {

            setError(

                "Enter recipient name, 10-digit mobile, complete address, and 6-digit PIN.",

            );

            return;

        }

        setBusy("pay");

        setError("");

        try {

            const order = await api<OrderResponse>("/requests", {

                method: "POST",

                headers: {

                    "Idempotency-Key": quote.quote_id,

                },

                body: JSON.stringify({

                    quote_id: quote.quote_id,

                    delivery_address: address,

                }),

            });

            if (

                !order.razorpay_order_id ||

                !order.razorpay_key ||

                order.amount_paise !== quote.amount_paise

            ) {

                throw new Error("Payment order mismatch");

            }

            await loadRazorpay();

            if (!window.Razorpay) {

                throw new Error("Razorpay unavailable");

            }

            new window.Razorpay({

                key: order.razorpay_key,

                amount: order.amount_paise,

                currency: "INR",

                order_id: order.razorpay_order_id,

                name: "Indiekonnect",

                description: "Distributor PVC card home delivery",

                prefill: {

                    name: address.full_name,

                    contact: address.phone,

                },

                theme: {

                    color: "#087F86",

                },

                handler: async (response: unknown) => {

                    try {

                        await api(

                            `/requests/${encodeURIComponent(

                                order.request_id,

                            )}/verify`,

                            {

                                method: "POST",

                                body: JSON.stringify(response),

                            },

                        );

                        setModal(false);

                        setMessage(

                            "Payment verified. Your card request has been submitted.",

                        );

                    } catch {

                        setError(

                            "Payment received but verification is pending. Check your request status before paying again.",

                        );

                    }

                },

                modal: {

                    ondismiss: () => {

                        setMessage(

                            "Payment window closed. Request remains unconfirmed until payment is verified.",

                        );

                    },

                },

            }).open();

        } catch (err) {

            setError(

                err instanceof Error ? err.message : "Unable to start payment",

            );

        } finally {

            setBusy(null);

        }

    };

    const fields: {

        key: keyof Address;

        label: string;

        placeholder: string;

    }[] = [

            {

                key: "full_name",

                label: "Recipient name",

                placeholder: "Full name",

            },

            {

                key: "phone",

                label: "Mobile number",

                placeholder: "10-digit mobile",

            },

            {

                key: "address_line1",

                label: "Address line 1",

                placeholder: "House / flat, building, street",

            },

            {

                key: "address_line2",

                label: "Address line 2",

                placeholder: "Area / landmark (optional)",

            },

            {

                key: "city",

                label: "City",

                placeholder: "City",

            },

            {

                key: "state",

                label: "State",

                placeholder: "State",

            },

            {

                key: "pincode",

                label: "PIN code",

                placeholder: "6-digit PIN",

            },

        ];

    return (

        <section

            style={{ fontFamily: FONT_FAMILY }}

            className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 font-medium text-black shadow-sm sm:p-6"

        >

            {/* Section header */}

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                    <span className="rounded-xl bg-gray-100 p-2.5 text-black">

                        <CreditCard size={22} />

                    </span>

                    <div>

                        <h2 className="break-words text-[14px] font-semibold text-[#101828]">

                            My Indiekonnect Distributor ID

                        </h2>

                        <p className=" break-words text-[11px] leading-4 text-[#98a2b3] sm:text-[11.5px]">

                            Horizontal PVC card • front and back • 85.6 × 54 mm

                        </p>

                    </div>

                </div>

                <button

                    type="button"

                    onClick={() => void render()}

                    disabled={!!busy}

                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-gray-100 disabled:opacity-50"

                >

                    <RefreshCw size={14} />

                    Refresh Card

                </button>

            </div>

            {/* Front and back preview */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                {(

                    [

                        { label: "FRONT", src: front },

                        { label: "BACK", src: back },

                    ] as const

                ).map((card) => (

                    <div

                        key={card.label}

                        className="min-w-0 rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-5"

                    >

                        <div className="mb-3 flex items-center justify-between">

                            <span className="text-xs font-semibold tracking-widest text-black">

                                {card.label}

                            </span>

                            <span className="text-[11px] font-medium text-gray-500">

                                Landscape

                            </span>

                        </div>

                        <div className="relative aspect-[85.6/54] overflow-hidden rounded-[4%] border border-gray-200 bg-white shadow-[0_16px_32px_rgba(0,0,0,.1)]">

                            {card.src ? (

                                <img

                                    src={card.src}

                                    alt={`${card.label} of personalized distributor card`}

                                    className="absolute inset-0 h-full w-full object-fill"

                                />

                            ) : (

                                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-500">

                                    <Loader2

                                        size={18}

                                        className="mr-2 animate-spin"

                                    />

                                    Preparing card…

                                </div>

                            )}

                            {/* Always show the original photo in preview when PDF embedding fails. */}
                            {card.label === "FRONT" && profilePhotoUrl && photoExportError && (
                                <img
                                    src={profilePhotoUrl}
                                    alt="Distributor profile photo"
                                    loading="eager"
                                    className="absolute object-cover"
                                    style={{
                                        left: `${PHOTO.x / PX_W * 100}%`,
                                        top: `${PHOTO.y / PX_H * 100}%`,
                                        width: `${PHOTO.w / PX_W * 100}%`,
                                        height: `${PHOTO.h / PX_H * 100}%`,
                                        borderRadius: "7%",
                                    }}
                                />
                            )}
                        </div>

                    </div>

                ))}

            </div>

            {/* Action buttons */}

            <div className="mt-5 flex flex-wrap gap-3">

                <button

                    type="button"

                    disabled={!!busy || !front || !back || !!photoExportError}

                    onClick={download}

                    className="inline-flex items-center gap-2 rounded-xl bg-[#087F86] px-5 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#066C72] disabled:opacity-50"

                >

                    <Download size={16} />

                    Download Print PDF

                </button>

                <button

                    type="button"

                    disabled={!!busy || !front || !back || !!photoExportError}

                    onClick={print}

                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-semibold text-black transition-colors hover:bg-gray-50 disabled:opacity-50"

                >

                    <Printer size={16} />

                    Print Card

                </button>

                {/* <button*

*                    type="button"*

*                    disabled={!!busy || !user.distributor_id || !user.is_active}*

*                    onClick={startRequest}*

*                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-xs font-semibold text-black transition-colors hover:bg-gray-50 disabled:opacity-50"*

*                >*

*                    {busy === "quote" ? (*

*                        <Loader2 size={16} className="animate-spin" />*

*                    ) : (*

*                        <Truck size={16} />*

*                    )}*

*                    Request PVC Home Delivery*

*                </button> */}

            </div>

            <p className="mt-4 flex gap-2 text-xs font-medium leading-5 text-gray-500">

                <ShieldCheck size={15} className="mt-0.5 shrink-0" />

                This is an Indiekonnect company-issued ID, not government

                identification. Delivery is available only after server-confirmed

                payment.

            </p>

            {photoExportError && (
                <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    Preview photo is restored. PDF photo embedding failed: {photoExportError}. Ensure the image proxy route is installed and its URL returns image bytes. PDF is disabled until embedding succeeds.
                </p>
            )}

            {message && (

                <p

                    role="status"

                    className="mt-2 text-xs font-medium text-emerald-700"

                >

                    {message}

                </p>

            )}

            {!modal && error && (

                <p

                    role="alert"

                    className="mt-2 text-xs font-medium text-red-600"

                >

                    {error}

                </p>

            )}

            {/* PVC delivery modal */}

            {modal && quote && (

                <div

                    role="dialog"

                    aria-modal="true"

                    aria-label="Request card delivery"

                    style={{ fontFamily: FONT_FAMILY }}

                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#087F86]/40 p-4"

                >

                    <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">

                        <div className="flex items-center justify-between">

                            <h3 className="text-lg font-semibold text-black">

                                Print and deliver my PVC card

                            </h3>

                            <button

                                type="button"

                                onClick={() => setModal(false)}

                                aria-label="Close"

                                className="rounded-lg p-2 text-black transition-colors hover:bg-gray-100"

                            >

                                <X size={19} />

                            </button>

                        </div>

                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

                            <div className="text-xs font-medium text-gray-500">

                                Total price including delivery

                            </div>

                            <div className="mt-1 text-2xl font-semibold text-black">

                                ₹{(quote.amount_paise / 100).toFixed(2)}

                            </div>

                            <div className="text-xs font-medium text-gray-500">

                                {quote.description ||

                                    "PVC card printing + home delivery"}

                            </div>

                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                            {fields.map((field) => (

                                <label

                                    key={field.key}

                                    className={

                                        field.key.startsWith("address_line")

                                            ? "sm:col-span-2"

                                            : ""

                                    }

                                >

                                    <span className="mb-1 block text-xs font-semibold text-black">

                                        {field.label}

                                    </span>

                                    <input

                                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"

                                        value={address[field.key]}

                                        placeholder={field.placeholder}

                                        onChange={(e) =>

                                            setAddress((prev) => ({

                                                ...prev,

                                                [field.key]:

                                                    field.key === "phone" ||

                                                        field.key === "pincode"

                                                        ? e.target.value

                                                            .replace(/\D/g, "")

                                                            .slice(

                                                                0,

                                                                field.key === "phone" ? 10 : 6,

                                                            )

                                                        : e.target.value,

                                            }))

                                        }

                                    />

                                </label>

                            ))}

                        </div>

                        {error && (

                            <p

                                role="alert"

                                className="mt-3 text-xs font-medium text-red-600"

                            >

                                {error}

                            </p>

                        )}

                        <button

                            type="button"

                            disabled={!!busy}

                            onClick={pay}

                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#087F86] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#066C72] disabled:opacity-50"

                        >

                            {busy === "pay" && (

                                <Loader2 className="animate-spin" size={16} />

                            )}

                            Pay ₹{(quote.amount_paise / 100).toFixed(2)} & Request Card

                        </button>

                        <p className="mt-3 text-[11px] font-medium leading-5 text-gray-500">

                            Order confirmation requires backend payment verification.

                            Do not retry while verification is pending.

                        </p>

                    </div>

                </div>

            )}

        </section>

    );

}