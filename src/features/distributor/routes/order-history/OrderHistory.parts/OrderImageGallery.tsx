"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ModalShell, OrderImageGalleryProps } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";


export const OrderImageGallery = ({
  isOpen,
  onClose,
  order,
}: OrderImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    }
  }, [isOpen, order?.order_id, order?.line_id]);

  if (!isOpen || !order) {
    return null;
  }

  const images = (order.images || [])
    .filter((image) => !!image?.image_url)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

  if (images.length === 0 && order.primary_image) {
    images.push({
      id: -1,
      image_url: order.primary_image,
      is_primary: true,
    });
  }

  if (images.length === 0) {
    return (
      <ModalShell onClose={onClose} maxWidth="max-w-md">
        <div className="flex items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
          <h3 className="text-[15px] font-semibold text-[#171717]">
            Product Images
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-[220px] items-center justify-center px-5 py-8 text-center">
          <p className="text-[12px] text-[#999999]">
            No product images available.
          </p>
        </div>
      </ModalShell>
    );
  }

  const activeImage = images[activeIndex] || images[0];

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-[#171717]">
            {order.product_name}
          </h3>

          <p className="mt-0.5 text-[10px] text-black">
            {order.order_reference}
            {" • "}
            {images.length} image
            {images.length > 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 px-5 py-4">
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[10px] border border-[#E4E4E2] bg-[#F8F8F7] sm:min-h-[430px]">
          <Image
            src={activeImage.image_url}
            alt={order.product_name || "Product image"}
            fill
            sizes="(max-width: 640px) 90vw, 620px"
            className="object-contain p-4 sm:p-6"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1,
                  )
                }
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#555555] shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1,
                  )
                }
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#555555] shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                type="button"
                key={image.id || `${image.image_url}-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-[7px] border bg-white transition ${activeIndex === index
                  ? "border-[#0E1B3D] ring-2 ring-[#0E1B3D]/10"
                  : "border-[#E4E4E2] hover:border-[#BDBDBA]"
                  }`}
              >
                <Image
                  src={image.image_url}
                  alt={`${order.product_name} ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666]"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
