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

// ---- Clean White / Black Theme ----
const INK = "#000000";
const MUTED = "#555555";
const PAPER = "#FFFFFF";
const SOFT = "#F3F4F6";
const BORDER = "#D1D5DB";
const GREEN = "#15803D";

const FONT_FAMILY = "Poppins, Arial, sans-serif";
const MED = (px: number) => `500 ${px}px ${FONT_FAMILY}`;
const SEMI = (px: number) => `600 ${px}px ${FONT_FAMILY}`;

// Photo rectangle on the FRONT card.
const PHOTO = { x: 50, y: 140, w: 210, h: 280, r: 12 };

const PHOTO_CSS = {
  left: `${(PHOTO.x / PX_W) * 100}%`,
  top: `${(PHOTO.y / PX_H) * 100}%`,
  width: `${(PHOTO.w / PX_W) * 100}%`,
  height: `${(PHOTO.h / PX_H) * 100}%`,
  borderRadius: `${(PHOTO.r / PHOTO.w) * 100}% / ${
    (PHOTO.r / PHOTO.h) * 100
  }%`,
};

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

// ======================================================
// SMALL, CENTERED WATERMARK
// The logo stays inside the content area and does not
// spread over the entire card or go outside the canvas.
// ======================================================

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  side: "front" | "back",
) {
  if (!logo || !logo.naturalWidth || !logo.naturalHeight) return;

  // Front: keep the watermark behind the information area,
  // away from the distributor photo.
  //
  // Back: center it inside the card's inner content area.
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

  if (!ctx) throw new Error("Canvas not available");

  ctx.textBaseline = "alphabetic";

  const joined = formatDate(
    user.joining_date ||
      user.distributor_profile?.joining_date ||
      user.created_at,
  );

  const state =
    user.state || user.distributor_profile?.state || user.country || "—";

  const status =
    user.distributor_status || (user.is_active ? "Active" : "Inactive");

  // ======================================================
  // FRONT CARD
  // ======================================================

  if (side === "front") {
    lightBackground(ctx);

    // Small and centered watermark behind the details only.
    // It will not spread over the whole card.
    drawWatermark(ctx, logo, "front");

    drawHeader(ctx, logo, 108);

    drawText(
      ctx,
      "DISTRIBUTOR IDENTITY CARD",
      975,
      52,
      SEMI(25),
      INK,
      580,
      "right",
      "2px",
    );

    ctx.fillStyle = BORDER;
    ctx.fillRect(715, 64, 260, 2);

    drawText(
      ctx,
      "COMPANY ISSUED  •  AUTHORISED PARTNER",
      975,
      92,
      MED(14),
      MUTED,
      580,
      "right",
      "2px",
    );

    // Photo frame.
    ctx.fillStyle = PAPER;

    roundRect(
      ctx,
      PHOTO.x - 10,
      PHOTO.y - 10,
      PHOTO.w + 20,
      PHOTO.h + 20,
      18,
    );

    ctx.fill();

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 3;

    roundRect(
      ctx,
      PHOTO.x - 10,
      PHOTO.y - 10,
      PHOTO.w + 20,
      PHOTO.h + 20,
      18,
    );

    ctx.stroke();

    if (photo) {
      cropPhoto(
        ctx,
        photo,
        PHOTO.x,
        PHOTO.y,
        PHOTO.w,
        PHOTO.h,
        PHOTO.r,
      );
    } else {
      ctx.fillStyle = SOFT;

      roundRect(
        ctx,
        PHOTO.x,
        PHOTO.y,
        PHOTO.w,
        PHOTO.h,
        PHOTO.r,
      );

      ctx.fill();

      drawText(
        ctx,
        initials(user.full_name),
        PHOTO.x + PHOTO.w / 2,
        PHOTO.y + PHOTO.h / 2 + 24,
        SEMI(72),
        "#9CA3AF",
        150,
        "center",
      );
    }

    // Status badge under photo.
    drawStatusBadge(
      ctx,
      status,
      !!user.is_active,
      PHOTO.x,
      448,
      PHOTO.w,
      46,
    );

    // Name + role.
    const name = (user.full_name || "Distributor").toUpperCase();
    const nameSize = fitName(ctx, name, 660);

    drawText(ctx, name, 300, 192, SEMI(nameSize), INK, 665);

    drawText(
      ctx,
      (user.account_type || "Distributor").toUpperCase(),
      301,
      228,
      SEMI(19),
      MUTED,
      400,
      "left",
      "4px",
    );

    ctx.fillStyle = BORDER;
    ctx.fillRect(300, 248, 675, 2);

    // Distributor details.
    drawLabelValue(
      ctx,
      "Distributor ID",
      user.distributor_id || "—",
      300,
      292,
      320,
    );

    drawLabelValue(ctx, "Joining Date", joined, 660, 292, 315);

    drawLabelValue(
      ctx,
      "Mobile No.",
      user.phone || "—",
      300,
      377,
      320,
    );

    drawLabelValue(ctx, "State", state, 660, 377, 315);

    drawLabelValue(
      ctx,
      "Email ID",
      user.email || "—",
      300,
      462,
      675,
    );

    drawText(
      ctx,
      "Property of Indiekonnect. If found, please return to support@indiekonnect.com",
      300,
      552,
      MED(14),
      MUTED,
      675,
    );

    // Footer.
    drawFooterBand(ctx);

    drawText(
      ctx,
      "Official distributor card for company identification and verification.",
      50,
      615,
      MED(15),
      INK,
      690,
    );

    drawText(
      ctx,
      user.distributor_id || "INDIEKONNECT",
      975,
      616,
      SEMI(21),
      INK,
      240,
      "right",
      "2px",
    );
  } else {
    // ======================================================
    // BACK CARD
    // ======================================================

    lightBackground(ctx);

    // Small, centered watermark inside the back-card content.
    drawWatermark(ctx, logo, "back");

    drawHeader(ctx, logo, 100);

    drawText(
      ctx,
      "CARDHOLDER TERMS",
      975,
      60,
      SEMI(21),
      INK,
      400,
      "right",
      "3px",
    );

    // Instructions panel.
    ctx.fillStyle = SOFT;

    roundRect(ctx, 50, 138, 925, 280, 18);

    ctx.fill();

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2;

    roundRect(ctx, 50, 138, 925, 280, 18);

    ctx.stroke();

    drawText(
      ctx,
      "IMPORTANT INSTRUCTIONS",
      80,
      182,
      SEMI(22),
      INK,
      600,
      "left",
      "3px",
    );

    ctx.fillStyle = BORDER;
    ctx.fillRect(80, 194, 300, 2);

    const lines = [
      "This card is issued to the authorised distributor of Indiekonnect.",
      "This card is personal, company-issued and non-transferable.",
      "On loss or damage, inform Indiekonnect support immediately.",
      "Card validity depends on account status and company approval.",
      "This is not a government identity document.",
    ];

    let y = 238;

    lines.forEach((line, index) => {
      ctx.fillStyle = SOFT;

      ctx.beginPath();
      ctx.arc(95, y - 7, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = BORDER;
      ctx.lineWidth = 2;
      ctx.stroke();

      drawText(
        ctx,
        String(index + 1),
        95,
        y - 1,
        SEMI(16),
        INK,
        20,
        "center",
      );

      drawText(ctx, line, 128, y, MED(19), INK, 825);

      y += 42;
    });

    // Contact details.
    drawText(
      ctx,
      "WEBSITE",
      50,
      484,
      MED(14),
      MUTED,
      120,
      "left",
      "2px",
    );

    drawText(
      ctx,
      "www.indiekonnect.com",
      170,
      485,
      SEMI(21),
      INK,
      330,
    );

    drawText(
      ctx,
      "EMAIL",
      50,
      534,
      MED(14),
      MUTED,
      120,
      "left",
      "2px",
    );

    drawText(
      ctx,
      "support@indiekonnect.com",
      170,
      535,
      SEMI(21),
      INK,
      360,
    );

    // Barcode box derived from distributor ID.
    const id = user.distributor_id || "IND000000";

    const boxX = 690;
    const boxY = 448;
    const boxW = 285;
    const boxH = 110;

    ctx.fillStyle = PAPER;

    roundRect(ctx, boxX, boxY, boxW, boxH, 10);

    ctx.fill();

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2;

    roundRect(ctx, boxX, boxY, boxW, boxH, 10);

    ctx.stroke();

    ctx.fillStyle = INK;

    let bx = boxX + 18;
    let i = 0;

    while (bx < boxX + boxW - 18) {
      const code = id.charCodeAt(i % id.length);
      const barW = 2 + ((code + i * 7) % 3);

      if (i % 2 === 0) {
        ctx.fillRect(bx, boxY + 12, barW, 56);
      }

      bx += barW + 1.5;
      i += 1;
    }

    drawText(
      ctx,
      id,
      boxX + boxW / 2,
      boxY + 97,
      SEMI(17),
      INK,
      boxW - 30,
      "center",
      "4px",
    );

    // Footer.
    drawFooterBand(ctx);

    drawText(
      ctx,
      "PEOPLE  •  PRODUCTS  •  POSSIBILITIES",
      PX_W / 2,
      616,
      SEMI(19),
      INK,
      800,
      "center",
      "4px",
    );
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

    try {
      const [localLogo, photoResult] = await Promise.all([
        img(Logo.src || Logo, false)
          .then((image) => image)
          .catch(() => null),

        profilePhotoUrl
          ? img(profilePhotoUrl, true)
              .then((image) => ({ image }))
              .catch(() => ({ image: null }))
          : Promise.resolve({ image: null }),

        loadPoppins(),
      ]).then(([logoImage, profileResult]) => [
        logoImage,
        profileResult,
      ] as const);

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

  // ======================================================
  // DOWNLOAD PDF
  // ======================================================

  const download = () => {
    if (!front || !back) return;

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

  // ======================================================
  // PRINT CARD
  // ======================================================

  const print = () => {
    if (!front || !back) return;

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
.profile-overlay{
  position:absolute;
  left:${PHOTO_CSS.left};
  top:${PHOTO_CSS.top};
  width:${PHOTO_CSS.width};
  height:${PHOTO_CSS.height};
  object-fit:cover;
  border-radius:${PHOTO_CSS.borderRadius}
}
.note{margin:0 0 8mm 0;padding:0}
@media print{.note{display:none}}
</style>
</head>
<body>
<p class="note">Print at 100% / Actual Size. Front and back are separate; align carefully for duplex printing.</p>
<div class="card-wrap">
  <img class="card" src="${front}" alt="Front card" />
  ${
    profilePhotoUrl
      ? `<img class="profile-overlay" src="${escapeHtmlAttribute(
          profilePhotoUrl,
        )}" alt="Profile photo" />`
      : ""
  }
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

  // ======================================================
  // REQUEST PVC CARD DELIVERY
  // ======================================================

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
          color: INK,
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
            <h2 className="text-lg font-semibold text-black">
              My Indiekonnect Distributor ID
            </h2>

            <p className="text-xs font-medium text-gray-500">
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

              {card.label === "FRONT" &&
                profilePhotoUrl &&
                card.src && (
                  <div
                    className="absolute overflow-hidden"
                    style={PHOTO_CSS}
                  >
                    <img
                      src={profilePhotoUrl}
                      alt="Profile photo on distributor ID"
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!!busy || !front || !back}
          onClick={download}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          <Download size={16} />
          Download Print PDF
        </button>

        <button
          type="button"
          disabled={!!busy || !front || !back}
          onClick={print}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-semibold text-black transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <Printer size={16} />
          Print Card
        </button>

        <button
          type="button"
          disabled={!!busy || !user.distributor_id || !user.is_active}
          onClick={startRequest}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-xs font-semibold text-black transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {busy === "quote" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Truck size={16} />
          )}

          Request PVC Home Delivery
        </button>
      </div>

      <p className="mt-4 flex gap-2 text-xs font-medium leading-5 text-gray-500">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        This is an Indiekonnect company-issued ID, not government
        identification. Delivery is available only after server-confirmed
        payment.
      </p>

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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
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
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50"
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