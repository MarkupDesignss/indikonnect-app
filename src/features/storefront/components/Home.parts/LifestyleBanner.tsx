"use client";

import type { ContentResponse } from "@/lib/redux/api/Home/contentTypes";
import type { Ref } from "react";
import type { useRouter } from "next/navigation";
import m from "@/features/storefront/components/motion.module.css";
import { ripple } from "@/features/storefront/components/interactions";
import { getPromoPlaceholderImage } from "@/features/storefront/components/Home.parts/support";


export function LifestyleBanner({ apiResponse, router, parallaxRef }: { apiResponse?: ContentResponse | null; router: ReturnType<typeof useRouter>; parallaxRef: Ref<HTMLDivElement> }) {
  // Get banner data from API
  const content = apiResponse?.data?.find(
    (item) => item.slug === "home-page-second-banner",
  );

  const block = content?.blocks?.[0];

  const primaryImage = block?.images?.find((item) => item?.is_primary);

  const image =
    primaryImage?.url || block?.images?.[0]?.url || getPromoPlaceholderImage();

  return (
    <section
      className="
        relative left-1/2 isolate
        w-screen max-w-none
        -translate-x-1/2
        overflow-hidden
        bg-[#11101f]
      "
    >
      {/* BANNER */}
      <div
        className="
          relative
          h-[220px]
          w-full
          overflow-hidden
          bg-[#11101f]
          sm:h-[280px]
          md:h-[320px]
          lg:h-[360px]
          xl:h-[400px]
        "
      >
        {/* BACKGROUND IMAGE */}
        <div
          ref={parallaxRef}
          className={`
            ${m.pxFrame}
            absolute inset-0
            h-full w-full
          `}
        >
          <img
            src={image}
            alt={
              primaryImage?.alt_text || content?.title || "Premium Lifestyle"
            }
            className="
              block
              h-full
              w-full
              object-cover
              object-center
            "
            onError={(e) => {
              const fallback = getPromoPlaceholderImage();

              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />
        </div>

        {/* GRADIENT OVERLAY */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            bg-gradient-to-r
            from-[#11101f]/85
            via-[#11101f]/45
            to-transparent
          "
        />

        {/* BANNER CONTENT */}
        <div
          className="
            relative z-10
            flex h-full
            items-center
          "
        >
          <div
            className="
              w-full
              px-5
              sm:px-8
              md:px-12
              lg:px-16
              xl:px-24
            "
          >
            {/* SMALL HEADING */}
            {block?.heading && (
              <div
                className="
                  mb-2
                  max-w-[90%]
                  text-[10px]
                  font-medium
                  tracking-wide
                  text-white/85
                  sm:mb-3
                  sm:text-xs
                "
                dangerouslySetInnerHTML={{
                  __html: block.heading,
                }}
              />
            )}

            {/* MAIN HEADING / DESCRIPTION */}
            {block?.short_description && (
              <div
                className="
                  max-w-[530px]
                  text-white
                  [&>h1]:m-0
                  [&>h2]:m-0
                  [&>h3]:m-0
                  [&>p]:m-0
                  [&_h1]:m-0
                  [&_h2]:m-0
                  [&_h3]:m-0
                  [&_p]:m-0
                  [&>h1]:text-[22px]
                  [&>h2]:text-[22px]
                  [&>h3]:text-[22px]
                  [&>p]:text-[22px]
                  [&_h1]:text-[22px]
                  [&_h2]:text-[22px]
                  [&_h3]:text-[22px]
                  [&_p]:text-[22px]
                  [&>h1]:font-semibold
                  [&>h2]:font-semibold
                  [&>h3]:font-semibold
                  [&>p]:font-semibold
                  [&_h1]:font-semibold
                  [&_h2]:font-semibold
                  [&_h3]:font-semibold
                  [&_p]:font-semibold
                  [&>h1]:leading-tight
                  [&>h2]:leading-tight
                  [&>h3]:leading-tight
                  [&>p]:leading-tight
                  [&_h1]:leading-tight
                  [&_h2]:leading-tight
                  [&_h3]:leading-tight
                  [&_p]:leading-tight
                  sm:[&>h1]:text-[28px]
                  sm:[&>h2]:text-[28px]
                  sm:[&>h3]:text-[28px]
                  sm:[&>p]:text-[28px]
                  sm:[&_h1]:text-[28px]
                  sm:[&_h2]:text-[28px]
                  sm:[&_h3]:text-[28px]
                  sm:[&_p]:text-[28px]
                  md:[&>h1]:text-[34px]
                  md:[&>h2]:text-[34px]
                  md:[&>h3]:text-[34px]
                  md:[&>p]:text-[34px]
                  md:[&_h1]:text-[34px]
                  md:[&_h2]:text-[34px]
                  md:[&_h3]:text-[34px]
                  md:[&_p]:text-[34px]
                  lg:[&>h1]:text-[40px]
                  lg:[&>h2]:text-[40px]
                  lg:[&>h3]:text-[40px]
                  lg:[&>p]:text-[40px]
                  lg:[&_h1]:text-[40px]
                  lg:[&_h2]:text-[40px]
                  lg:[&_h3]:text-[40px]
                  lg:[&_p]:text-[40px]
                  xl:[&>h1]:text-[46px]
                  xl:[&>h2]:text-[46px]
                  xl:[&>h3]:text-[46px]
                  xl:[&>p]:text-[46px]
                  xl:[&_h1]:text-[46px]
                  xl:[&_h2]:text-[46px]
                  xl:[&_h3]:text-[46px]
                  xl:[&_p]:text-[46px]
                "
                dangerouslySetInnerHTML={{
                  __html: block.short_description,
                }}
              />
            )}

            {/* EXPLORE BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                ripple(e);
                router.push("/products");
              }}
              className="
                group
                mt-4
                inline-flex
                h-[36px]
                items-center
                gap-2
                rounded-lg
                bg-white
                px-4
                text-[11px]
                font-semibold
                text-[#171717]
                shadow-md
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#f2f2f2]
                sm:mt-5
                sm:h-[42px]
                sm:px-5
                sm:text-xs
              "
            >
              Explore All Products
              <span
                className="
                  text-sm
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
