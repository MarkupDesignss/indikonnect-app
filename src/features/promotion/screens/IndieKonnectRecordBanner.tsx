"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function IndieKonnectRecordBanner() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#001d2b]">
      {/* ================= BACKGROUND VIDEO ================= */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source
          src="/videos/indiekonnect-underwater.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark / Blue Overlay */}
      <div className="absolute inset-0 bg-[rgba(0,25,40,0.38)]" />

      {/* Extra Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#001a28]/20 via-[#003f57]/10 to-[#00101a]/65" />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-5 py-8 sm:px-8 sm:py-10 md:px-10 lg:py-12">
        
        {/* ================= TOP RECORD HOLDER ================= */}
        <div className="flex w-full justify-center">
          <div className="relative flex items-center">
            
            {/* Left Gold Line */}
            <div className="hidden h-[44px] w-[10px] -skew-x-[12deg] bg-[#dba400] sm:block" />

            {/* Left Badge */}
            <div className="flex h-[44px] items-center bg-[#dba400] px-4 sm:px-7">
              <span className="text-[20px] font-extrabold tracking-tight text-white sm:text-[24px] md:text-[28px]">
                RECORD
              </span>
            </div>

            {/* Center Circle */}
            <div className="relative z-20 -mx-[3px] flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border-[4px] border-[#b9b9b9] bg-[#082f49] shadow-[0_0_12px_rgba(0,0,0,0.35)] sm:h-[84px] sm:w-[84px] md:h-[92px] md:w-[92px]">
              <div className="flex h-[61px] w-[61px] flex-col items-center justify-center rounded-full border border-white/70 text-center sm:h-[68px] sm:w-[68px] md:h-[74px] md:w-[74px]">
                <span className="text-[8px] font-bold tracking-[0.12em] text-white sm:text-[9px]">
                  INDIEKONNECT
                </span>

                <div className="my-[2px] text-[17px] text-[#e0a800] sm:text-[20px]">
                  ★
                </div>

                <span className="text-[7px] font-semibold tracking-[0.08em] text-white/90 sm:text-[8px]">
                  RECORD
                </span>
              </div>
            </div>

            {/* Right Badge */}
            <div className="flex h-[44px] items-center bg-[#dba400] px-4 sm:px-7">
              <span className="text-[20px] font-extrabold tracking-tight text-white sm:text-[24px] md:text-[28px]">
                HOLDER
              </span>
            </div>

            {/* Right Gold Line */}
            <div className="hidden h-[44px] w-[10px] skew-x-[12deg] bg-[#dba400] sm:block" />
          </div>
        </div>

        {/* ================= CENTER CONTENT ================= */}
        <div className="flex w-full flex-1 flex-col items-center justify-center text-center">
          
          {/* IndieKonnect Logo Text */}
          <div className="mt-4 flex flex-col items-center sm:mt-7">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              
              {/* Simple IK Mark */}
              <div className="relative flex h-[58px] w-[54px] items-center justify-center sm:h-[76px] sm:w-[70px] md:h-[88px] md:w-[80px]">
                <span className="absolute left-[7px] top-[2px] font-sans text-[56px] font-extrabold leading-none text-white sm:left-[5px] sm:text-[70px] md:text-[82px]">
                  I
                </span>

                <span className="absolute right-[1px] top-[6px] font-sans text-[48px] font-extrabold leading-none text-white sm:text-[62px] md:text-[74px]">
                  K
                </span>
              </div>

              <span
                className="
                  text-[42px]
                  font-semibold
                  uppercase
                  leading-none
                  tracking-[0.11em]
                  text-white
                  drop-shadow-[0_3px_8px_rgba(0,0,0,0.25)]
                  sm:text-[56px]
                  md:text-[76px]
                  lg:text-[88px]
                "
              >
                INDIEKONNECT
              </span>
            </div>

            {/* Subtitle */}
            <div className="mt-6 sm:mt-8">
              <span className="text-[27px] font-light uppercase tracking-[0.08em] text-white sm:text-[38px] md:text-[52px] lg:text-[58px]">
                ONE NATION
              </span>

              <span className="mx-2 text-[20px] font-light text-white/80 sm:mx-3 sm:text-[28px] md:text-[38px]">
                •
              </span>

              <span className="text-[27px] font-light uppercase tracking-[0.08em] text-white sm:text-[38px] md:text-[52px] lg:text-[58px]">
                ONE NETWORK
              </span>
            </div>

            {/* Supporting Text */}
            <div className="mt-4 sm:mt-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/90 sm:text-[15px] md:text-[18px]">
                Official Community &amp; Business Network
              </p>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM CTA ================= */}
        <div className="mb-2 flex w-full flex-col items-center sm:mb-3">
          
          {/* Tag */}
          <div
            className="
              flex
              min-h-[58px]
              w-[90%]
              max-w-[620px]
              items-center
              justify-center
              rounded-[14px]
              border
              border-white/10
              bg-[#07516a]/90
              px-5
              shadow-[0_8px_25px_rgba(0,0,0,0.20)]
              backdrop-blur-sm
              sm:min-h-[66px]
              md:min-h-[72px]
            "
          >
            <span className="text-center text-[17px] font-bold uppercase tracking-[0.25em] text-white sm:text-[22px] md:text-[28px]">
              ONE NATION • ONE NETWORK
            </span>
          </div>

          {/* Explore Button */}
          <button
            type="button"
            className="
              group
              mt-7
              flex
              items-center
              justify-center
              gap-3
              rounded-[14px]
              border
              border-white/20
              bg-[#003a52]/90
              px-8
              py-3
              shadow-[0_7px_18px_rgba(0,0,0,0.28)]
              backdrop-blur-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-[#07516a]
              hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]
              sm:mt-8
              sm:px-10
              sm:py-3.5
            "
          >
            <span className="text-[21px] font-bold uppercase tracking-[0.17em] text-white sm:text-[26px] md:text-[30px]">
              Explore Now
            </span>

            <ArrowRight
              size={25}
              strokeWidth={2.5}
              className="text-white transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </section>
  );
}