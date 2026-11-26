"use client";

import { useCallback, useEffect, useState } from "react";

import { CreditCard, Download, Loader2, Printer, RefreshCw, ShieldCheck, X } from "lucide-react";


import Logo from "../../../../../public/indiekonnect-web/images/logo.png";
import { Address, FONT_FAMILY, MM_H, MM_W, OrderResponse, PHOTO, PX_H, PX_W, Quote, User, api, drawCard, emptyAddress, getProfilePhotoUrl, img, loadPhotoForCanvas, loadPoppins, loadRazorpay } from "@/features/distributor/routes/profile/DistributorPVCSection.parts/support";


declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void };
  }
}

export default function DistributorPVCSection({ user }: { user: User }) {
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
          ? Promise.resolve()

              .then(() => loadPhotoForCanvas(profilePhotoUrl))

              .then((image) => ({ image, problem: "" }))

              .catch((cause) => ({
                image: null,

                problem:
                  cause instanceof Error
                    ? cause.message
                    : "Profile photo could not be loaded",
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
      setError(err instanceof Error ? err.message : "Card preview failed");
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

  const download = async () => {
    if (!front || !back) return;

    if (photoExportError) {
      setError(photoExportError);

      return;
    }

    setBusy("download");

    setError("");

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",

        unit: "mm",

        format: [MM_W, MM_H],

        compress: true,
      });

      pdf.addImage(front, "PNG", 0, 0, MM_W, MM_H);

      pdf.addPage([MM_W, MM_H], "portrait");

      pdf.addImage(back, "PNG", 0, 0, MM_W, MM_H);

      pdf.save(
        `Indiekonnect-${(user.distributor_id || "card").replace(
          /[^\w-]/g,

          "",
        )}.pdf`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setBusy(null);
    }
  };

  // ======================================================// PRINT CARD// ======================================================

  const print = () => {
    if (!front || !back) return;

    if (photoExportError) {
      setError(photoExportError);

      return;
    }

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

  width:54mm;

  height:85.6mm;

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
          ondismiss: () => {
            setMessage(
              "Payment window closed. Request remains unconfirmed until payment is verified.",
            );
          },
        },
      }).open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment");
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
              Vertical PVC card • front and back • 54 × 85.6 mm
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

      <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:gap-5">
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
                Portrait
              </span>
            </div>

            <div className="relative mx-auto w-full max-w-[340px] aspect-[54/85.6] overflow-hidden rounded-[4%] border border-gray-200 bg-white shadow-[0_16px_32px_rgba(0,0,0,.1)]">
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

              {card.label === "FRONT" &&
                profilePhotoUrl &&
                photoExportError && (
                  <img
                    src={profilePhotoUrl}

                    alt="Distributor profile photo"

                    loading="eager"

                    className="absolute object-cover"

                    style={{
                      left: `${(PHOTO.x / PX_W) * 100}%`,

                      top: `${(PHOTO.y / PX_H) * 100}%`,

                      width: `${(PHOTO.w / PX_W) * 100}%`,

                      height: `${(PHOTO.h / PX_H) * 100}%`,

                      borderRadius: "13%",
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
      </div>

      <p className="mt-4 flex gap-2 text-xs font-medium leading-5 text-gray-500">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        This is an Indiekonnect company-issued ID, not government
        identification. Delivery is available only after server-confirmed
        payment.
      </p>

      {!profilePhotoUrl && (
        <p
          role="alert"

          className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
        >
          Profile image URL missing in distributor user data. Check
          profile_picture, profile_image, avatar, and distributor_profile fields
          returned by the backend.
        </p>
      )}

      {photoExportError && (
        <p
          role="alert"

          className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
        >
          Profile photo could not be embedded in the PDF: {photoExportError}. If
          the preview photo is also missing, verify the image URL is publicly
          accessible to the signed-in browser. Check that the same-origin image
          proxy route exists and returns image bytes. PDF is disabled until
          embedding succeeds.
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
                          field.key === "phone" || field.key === "pincode"
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
              {busy === "pay" && <Loader2 className="animate-spin" size={16} />}
              Pay ₹{(quote.amount_paise / 100).toFixed(2)} & Request Card
            </button>

            <p className="mt-3 text-[11px] font-medium leading-5 text-gray-500">
              Order confirmation requires backend payment verification. Do not
              retry while verification is pending.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
