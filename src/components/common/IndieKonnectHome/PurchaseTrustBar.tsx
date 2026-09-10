"use client";

import { useGetContentsQuery } from "@/lib/redux/api/Home/contentApi";
import Image from "next/image";
import React from "react";

const trustItems = [
  {
    title: "100% ORIGINAL",
    icon: "https://www.titan.co.in/on/demandware.static/-/Library-Sites-TitanSharedLibrary/default/dwc17b5cd2/images/homepage/Gurantee.svg",
    alt: "100% Original",
  },
  {
    title: "30 DAY RETURN",
    icon: "https://www.titan.co.in/on/demandware.static/-/Library-Sites-TitanSharedLibrary/default/dw0987d956/images/homepage/Return.svg",
    alt: "7 Day Return",
  },
  {
    title: "FREE SHIPPING",
    icon: "https://www.titan.co.in/on/demandware.static/-/Library-Sites-TitanSharedLibrary/default/dw824f2669/images/homepage/Shipping.svg",
    alt: "Free Shipping",
  },
];

export default function PurchaseTrustBar() {
  return (
    <section className="w-full">
      <div
        className="
          relative
          flex
          min-h-[108px]
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-gradient-to-b
          from-[#d9f4f6]
          via-[#effafb]
          to-white
          px-4
          sm:min-h-[116px]
          sm:px-6
          md:min-h-[124px]
          md:px-8
          lg:min-h-[132px]
        "
      >
        {/* Soft background effect */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.72)_0%,_rgba(255,255,255,0.2)_42%,_transparent_75%)]
          "
        />

        {/* Trust Items */}
        <div
          className="
            relative
            z-10
            flex
            w-full
            max-w-[1000px]
            items-center
            justify-center
            divide-x
            divide-[#a8cfd2]/45
          "
        >
          {trustItems.map((item, index) => (
            <div
              key={item.title}
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2.5
                px-3
                py-2
                transition-transform
                duration-500
                ease-out
                hover:-translate-y-0.5
                sm:gap-3
                sm:px-5
                md:gap-4
                md:px-8
                lg:px-10
              "
            >
              {/* Icon */}
              <div
                className="
                  flex
                  h-[30px]
                  w-[30px]
                  shrink-0
                  items-center
                  justify-center
                  sm:h-[34px]
                  sm:w-[34px]
                  md:h-[38px]
                  md:w-[38px]
                  lg:h-[40px]
                  lg:w-[40px]
                "
              >
                <Image
                  src={item.icon}
                  alt={item.alt}
                  width={40}
                  height={40}
                  unoptimized
                  className="
                    h-full
                    w-full
                    object-contain
                    opacity-90
                  "
                />
              </div>

              {/* Text */}
              <div className="flex items-center">
                <span
                  className="
                    whitespace-nowrap
                    font-sans
                    text-[10px]
                    font-medium
                    tracking-[0.08em]
                    text-[#173e43]
                    sm:text-[11px]
                    md:text-[12px]
                    lg:text-[13px]
                  "
                >
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative soft arrows */}
        <div
          className="
            pointer-events-none
            absolute
            left-[16%]
            top-[48%]
            hidden
            h-4
            w-4
            -translate-y-1/2
            rotate-45
            border-b
            border-r
            border-[#b7d8da]/50
            sm:block
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-[16%]
            top-[48%]
            hidden
            h-4
            w-4
            -translate-y-1/2
            rotate-45
            border-b
            border-r
            border-[#b7d8da]/50
            sm:block
          "
        />
      </div>
    </section>
  );
}