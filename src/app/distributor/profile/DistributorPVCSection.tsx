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

const BASE_PATH = (
  process.env.NEXT_PUBLIC_BASE_PATH ?? "/indiekonnect-distributor"
).replace(/\/$/, "");
const BRAND_LOGO = `${BASE_PATH}/api/distributor-card/photo?kind=logo`;
const API_BASE = `${BASE_PATH}/api/distributor-card`;
const MM_W = 85.6;
const MM_H = 54;
const PX_W = 1011;
const PX_H = 638;

const BLUE = "#1748B8";
const BLUE_DARK = "#123C9B";
const BLUE_SOFT = "#EAF1FF";
const YELLOW = "#FFC928";
const INK = "#1A1A1A";
const MUTED = "#51627E";
const BORDER = "#D7DFEC";

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

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
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

function getProfilePhotoUrl(user: User): string | null {
  const picture = user.profile_picture;
  const candidate =
    typeof picture === "string" ? picture : picture?.url || picture?.path;
  const finalValue = candidate || user.profile_image || user.avatar;
  if (!finalValue || typeof finalValue !== "string") return null;
  return finalValue.trim() || null;
}

function img(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image unavailable"));
    image.src = src;
  });
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
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.fillText(value, x, y, maxWidth);
}

function drawLabelValue(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  width = 425,
) {
  drawText(ctx, label, x, y, "700 18px Arial, sans-serif", BLUE_DARK, 180);
  drawText(ctx, ":", x + 150, y, "700 18px Arial, sans-serif", MUTED);
  drawText(
    ctx,
    value || "—",
    x + 168,
    y,
    "700 25px Arial, sans-serif",
    INK,
    width,
  );
}

function cropPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ratio = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
  const nw = photo.naturalWidth * ratio;
  const nh = photo.naturalHeight * ratio;
  ctx.save();
  roundRect(ctx, x, y, w, h, 14);
  ctx.clip();
  ctx.drawImage(photo, x + (w - nw) / 2, y + (h - nh) / 2, nw, nh);
  ctx.restore();
}

function fitName(
  ctx: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
) {
  let size = 44;
  while (size > 22) {
    ctx.font = `800 ${size}px Arial, sans-serif`;
    if (ctx.measureText(value).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function frontBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, PX_W, PX_H);

  ctx.fillStyle = BLUE;
  roundRect(ctx, 0, 0, 42, PX_H, 18);
  ctx.fill();

  ctx.fillStyle = YELLOW;
  roundRect(ctx, 42, 0, PX_W - 42, 92, 0);
  ctx.fill();

  ctx.fillStyle = BLUE;
  ctx.fillRect(42, 92, PX_W - 42, 6);

  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 90; i += 1) {
    ctx.beginPath();
    const px = 60 + ((i * 97) % (PX_W - 110));
    const py = 110 + ((i * 53) % (PX_H - 140));
    ctx.arc(px, py, (i % 5) + 3, 0, Math.PI * 2);
    ctx.fillStyle = BLUE;
    ctx.fill();
  }
  ctx.restore();
}

function backBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, PX_W, PX_H);

  ctx.fillStyle = BLUE;
  roundRect(ctx, 0, 0, 42, PX_H, 18);
  ctx.fill();

  ctx.fillStyle = BLUE;
  ctx.fillRect(42, 0, PX_W - 42, 74);

  ctx.fillStyle = YELLOW;
  ctx.fillRect(42, 74, PX_W - 42, 7);

  ctx.fillStyle = BLUE_SOFT;
  roundRect(ctx, 72, 130, PX_W - 116, 438, 24);
  ctx.fill();
}

function drawStatusBadge(
  ctx: CanvasRenderingContext2D,
  status: string,
  active: boolean,
  x: number,
  y: number,
) {
  ctx.fillStyle = active ? "#EFFAF3" : "#FFF4E9";
  roundRect(ctx, x, y, 138, 52, 26);
  ctx.fill();
  ctx.strokeStyle = active ? "#1C9D5B" : "#E5932F";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, 138, 52, 26);
  ctx.stroke();
  drawText(
    ctx,
    status.toUpperCase(),
    x + 20,
    y + 33,
    "800 20px Arial, sans-serif",
    active ? "#1C9D5B" : "#C97717",
    100,
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

  if (side === "front") {
    frontBackground(ctx);

    if (logo) {
      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, 70, 16, 325, 60, 12);
      ctx.fill();
      const scale = Math.min(305 / logo.naturalWidth, 52 / logo.naturalHeight);
      const lw = logo.naturalWidth * scale,
        lh = logo.naturalHeight * scale;
      ctx.drawImage(logo, 78 + (305 - lw) / 2, 20 + (52 - lh) / 2, lw, lh);
    } else {
      drawText(
        ctx,
        "INDIEKONNECT",
        82,
        53,
        "800 34px Arial, sans-serif",
        BLUE_DARK,
      );
    }

    drawText(
      ctx,
      "DISTRIBUTOR IDENTITY CARD",
      430,
      58,
      "800 28px Arial, sans-serif",
      BLUE_DARK,
      520,
    );
    drawText(
      ctx,
      "Company Issued ID",
      431,
      85,
      "700 18px Arial, sans-serif",
      MUTED,
      450,
    );

    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, 82, 124, 640, 446, 20);
    ctx.fill();
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2;
    roundRect(ctx, 82, 124, 640, 446, 20);
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, 757, 124, 196, 246, 18);
    ctx.fill();
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 3;
    roundRect(ctx, 757, 124, 196, 246, 18);
    ctx.stroke();

    if (photo) {
      cropPhoto(ctx, photo, 767, 134, 176, 226);
    } else {
      ctx.fillStyle = BLUE_SOFT;
      roundRect(ctx, 767, 134, 176, 226, 14);
      ctx.fill();
      drawText(
        ctx,
        initials(user.full_name),
        812,
        254,
        "800 70px Arial, sans-serif",
        BLUE_DARK,
        95,
      );
    }

    drawText(
      ctx,
      "INDIEKONNECT ID",
      779,
      430,
      "800 19px Arial, sans-serif",
      BLUE_DARK,
      171,
    );
    drawText(
      ctx,
      user.distributor_id || "—",
      780,
      467,
      "700 25px Arial, sans-serif",
      INK,
      170,
    );

    const name = (user.full_name || "Distributor").toUpperCase();
    const nameSize = fitName(ctx, name, 582);
    drawText(
      ctx,
      name,
      112,
      188,
      `800 ${nameSize}px Arial, sans-serif`,
      INK,
      585,
    );
    drawText(
      ctx,
      (user.account_type || "Distributor").toUpperCase(),
      115,
      222,
      "700 22px Arial, sans-serif",
      BLUE,
      300,
    );

    drawStatusBadge(ctx, status, !!user.is_active, 552, 170);

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(112, 252);
    ctx.lineTo(690, 252);
    ctx.stroke();

    drawLabelValue(ctx, "Distributor ID", user.distributor_id || "—", 112, 310);
    drawLabelValue(ctx, "Mobile No.", user.phone || "—", 112, 362);
    drawLabelValue(ctx, "Email ID", user.email || "—", 112, 414, 455);
    drawLabelValue(ctx, "Joining Date", joined, 112, 466);
    drawLabelValue(ctx, "State", state, 112, 518);

    ctx.fillStyle = BLUE;
    roundRect(ctx, 82, 579, 871, 43, 0);
    ctx.fill();
    drawText(
      ctx,
      "Official distributor card for company identification and verification.",
      108,
      607,
      "700 18px Arial, sans-serif",
      "#FFFFFF",
      700,
    );
    ctx.fillStyle = YELLOW;
    roundRect(ctx, 777, 579, 176, 43, 0);
    ctx.fill();
    drawText(
      ctx,
      user.distributor_id || "INDIEKONNECT",
      800,
      607,
      "800 17px Arial, sans-serif",
      BLUE_DARK,
      140,
    );
  } else {
    backBackground(ctx);

    if (logo) {
      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, 70, 10, 320, 54, 10);
      ctx.fill();
      const scale = Math.min(300 / logo.naturalWidth, 48 / logo.naturalHeight);
      const lw = logo.naturalWidth * scale,
        lh = logo.naturalHeight * scale;
      ctx.drawImage(logo, 78 + (300 - lw) / 2, 13 + (48 - lh) / 2, lw, lh);
    } else {
      drawText(
        ctx,
        "INDIEKONNECT",
        75,
        48,
        "800 30px Arial, sans-serif",
        "#FFFFFF",
      );
    }

    drawText(
      ctx,
      "PEOPLE • PRODUCTS • POSSIBILITIES",
      414,
      48,
      "700 18px Arial, sans-serif",
      "#FFFFFF",
      540,
    );

    drawText(
      ctx,
      "IMPORTANT INSTRUCTIONS",
      98,
      183,
      "800 30px Arial, sans-serif",
      BLUE_DARK,
    );

    const lines = [
      "1. This card is issued to the authorised distributor of Indiekonnect.",
      "2. This card is personal, company-issued and non-transferable.",
      "3. On loss or damage, inform Indiekonnect support immediately.",
      "4. Card validity depends on account status and company approval.",
      "5. This is not a government identity document.",
    ];

    let y = 234;
    for (const line of lines) {
      drawText(ctx, line, 102, y, "600 23px Arial, sans-serif", INK, 775);
      y += 54;
    }

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(94, 524);
    ctx.lineTo(913, 524);
    ctx.stroke();

    drawText(ctx, "Website", 96, 566, "700 18px Arial, sans-serif", BLUE_DARK);
    drawText(
      ctx,
      "www.indiekonnect.com",
      210,
      566,
      "700 22px Arial, sans-serif",
      INK,
      320,
    );
    drawText(ctx, "Email", 96, 600, "700 18px Arial, sans-serif", BLUE_DARK);
    drawText(
      ctx,
      "support@indiekonnect.com",
      210,
      600,
      "700 22px Arial, sans-serif",
      INK,
      350,
    );

    const startX = 720;
    const baseY = 556;
    ctx.fillStyle = BLUE_DARK;
    for (let i = 0; i < 42; i += 1) {
      const barW = i % 3 === 0 ? 6 : i % 2 === 0 ? 3 : 2;
      const barH = 74 + ((i * 13) % 28);
      ctx.fillRect(startX + i * 6, baseY - barH, barW, barH);
    }
    drawText(
      ctx,
      user.distributor_id || "IND000000",
      744,
      608,
      "800 24px Arial, sans-serif",
      BLUE_DARK,
      210,
    );
  }

  return canvas.toDataURL("image/png");
}

export default function DistributorPVCSection({ user }: { user: User }) {
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
  const [imageNote, setImageNote] = useState("");

  const render = useCallback(async () => {
    setBusy("render");
    setError("");
    setImageNote("");

    try {
      const photoUrl = getProfilePhotoUrl(user);

      const [logo, photoResult] = await Promise.all([
        img(BRAND_LOGO).catch(() => null),
        photoUrl
          ? (async () => {
              const response = await fetch(
                `${API_BASE}/photo?url=${encodeURIComponent(photoUrl)}`,
                {
                  credentials: "include",
                  cache: "no-store",
                },
              );

              if (!response.ok) {
                throw new Error(
                  `Photo proxy HTTP ${response.status}. Confirm route.ts is inside src/app/api/distributor-card/photo/ and Next.js has been restarted.`,
                );
              }

              const blob = await response.blob();
              const localUrl = URL.createObjectURL(blob);
              try {
                return await img(localUrl);
              } finally {
                URL.revokeObjectURL(localUrl);
              }
            })()
              .then((image) => ({ image, error: "" }))
              .catch((err) => ({
                image: null,
                error: String(err?.message || err),
              }))
          : Promise.resolve({
              image: null,
              error: "No profile_picture URL was returned by the profile API.",
            }),
      ]);

      if (!logo)
        setImageNote(
          "Company logo could not load from the configured server proxy.",
        );
      if (!photoResult.image) {
        setImageNote((previous) =>
          `${previous} Profile photo unavailable: ${photoResult.error}. Card currently shows initials instead.`.trim(),
        );
      }

      const [frontImg, backImg] = await Promise.all([
        drawCard(user, "front", photoResult.image, logo),
        drawCard(user, "back", photoResult.image, logo),
      ]);

      setFront(frontImg);
      setBack(backImg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Card preview failed");
    } finally {
      setBusy(null);
    }
  }, [
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
        `Indiekonnect-${(user.distributor_id || "card").replace(/[^\w-]/g, "")}.pdf`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setBusy(null);
    }
  };

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
.card{width:85.6mm;height:54mm;display:block;margin:0 0 12mm 0;print-color-adjust:exact;-webkit-print-color-adjust:exact}
.note{margin:0 0 8mm 0;padding:0}
@media print{.note{display:none}}
</style>
</head>
<body>
<p class="note">Print at 100% / Actual Size. Front and back are separate; align carefully for duplex printing.</p>
<img class="card" src="${front}" alt="Front card" />
<img class="card" src="${back}" alt="Back card" />
<script>
window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 300); });
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
      setError(err instanceof Error ? err.message : "Price unavailable");
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
        headers: { "Idempotency-Key": quote.quote_id },
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
      if (!window.Razorpay) throw new Error("Razorpay unavailable");

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
        theme: { color: BLUE },
        handler: async (response: unknown) => {
          try {
            await api(
              `/requests/${encodeURIComponent(order.request_id)}/verify`,
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
          ondismiss: () =>
            setMessage(
              "Payment window closed. Request remains unconfirmed until payment is verified.",
            ),
        },
      }).open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment");
    } finally {
      setBusy(null);
    }
  };

  const fields: { key: keyof Address; label: string; placeholder: string }[] = [
    { key: "full_name", label: "Recipient name", placeholder: "Full name" },
    { key: "phone", label: "Mobile number", placeholder: "10-digit mobile" },
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
    { key: "city", label: "City", placeholder: "City" },
    { key: "state", label: "State", placeholder: "State" },
    { key: "pincode", label: "PIN code", placeholder: "6-digit PIN" },
  ];

  return (
    <section className="w-full min-w-0 rounded-2xl border border-[#e7eaf0] bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-[#1748B8] p-2.5 text-[#FFC928]">
            <CreditCard size={22} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#1748B8]">
              My Indiekonnect Distributor ID
            </h2>
            <p className="text-xs text-slate-500">
              Horizontal PVC card • front and back • 85.6 × 54 mm
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void render()}
          disabled={!!busy}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
        >
          <RefreshCw size={14} /> Refresh Card
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {(
          [
            { label: "FRONT", src: front },
            { label: "BACK", src: back },
          ] as const
        ).map((card) => (
          <div
            key={card.label}
            className="min-w-0 rounded-2xl border border-slate-100 bg-[#f4f6f9] p-3 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-slate-600">
                {card.label}
              </span>
              <span className="text-[11px] text-slate-400">Landscape</span>
            </div>
            <div className="aspect-[85.6/54] overflow-hidden rounded-[4%] shadow-[0_16px_32px_rgba(1,15,30,.17)]">
              {card.src ? (
                <img
                  src={card.src}
                  alt={`${card.label} of personalized distributor card`}
                  className="h-full w-full object-fill"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  <Loader2 size={18} className="mr-2 animate-spin" /> Preparing
                  card…
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!!busy || !front || !back}
          onClick={download}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1748B8] px-5 py-3 text-xs font-semibold text-white disabled:opacity-50"
        >
          <Download size={16} /> Download Print PDF
        </button>

        <button
          type="button"
          disabled={!!busy || !front || !back}
          onClick={print}
          className="inline-flex items-center gap-2 rounded-xl border border-[#d6dce5] bg-white px-5 py-3 text-xs font-semibold text-[#1748B8] disabled:opacity-50"
        >
          <Printer size={16} /> Print Card
        </button>

        <button
          type="button"
          disabled={!!busy || !user.distributor_id || !user.is_active}
          onClick={startRequest}
          className="inline-flex items-center gap-2 rounded-xl border border-[#FFC928] bg-[#FFF7D7] px-5 py-3 text-xs font-semibold text-[#1748B8] disabled:opacity-50"
        >
          {busy === "quote" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Truck size={16} />
          )}
          Request PVC Home Delivery
        </button>
      </div>

      <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        This is an Indiekonnect company-issued ID, not government
        identification. Delivery is available only after server-confirmed
        payment.
      </p>

      {imageNote && <p className="mt-2 text-xs text-amber-700">{imageNote}</p>}
      {message && (
        <p role="status" className="mt-2 text-xs text-emerald-700">
          {message}
        </p>
      )}
      {!modal && error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {modal && quote && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Request card delivery"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
        >
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1748B8]">
                Print and deliver my PVC card
              </h3>
              <button
                type="button"
                onClick={() => setModal(false)}
                aria-label="Close"
                className="p-2"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-[#FFF7D6] p-4">
              <div className="text-xs text-slate-600">
                Total price including delivery
              </div>
              <div className="mt-1 text-2xl font-bold text-[#1748B8]">
                ₹{(quote.amount_paise / 100).toFixed(2)}
              </div>
              <div className="text-xs text-slate-500">
                {quote.description || "PVC card printing + home delivery"}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <label
                  key={field.key}
                  className={
                    field.key.startsWith("address_line") ? "sm:col-span-2" : ""
                  }
                >
                  <span className="mb-1 block text-xs font-semibold text-slate-600">
                    {field.label}
                  </span>
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1748B8]"
                    value={address[field.key]}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        [field.key]:
                          field.key === "phone" || field.key === "pincode"
                            ? e.target.value
                                .replace(/\D/g, "")
                                .slice(0, field.key === "phone" ? 10 : 6)
                            : e.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>

            {error && (
              <p role="alert" className="mt-3 text-xs text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={!!busy}
              onClick={pay}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1748B8] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy === "pay" && <Loader2 className="animate-spin" size={16} />}
              Pay ₹{(quote.amount_paise / 100).toFixed(2)} & Request Card
            </button>

            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              Order confirmation requires backend payment verification. Do not
              retry while verification is pending.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
