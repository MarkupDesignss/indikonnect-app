"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  CreditCard,
  Zap,
} from "lucide-react";

export default function GetStartedDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const drawerWidth = "490px";

  return (
    <>
      {/* =========================================================
          GET STARTED FLOATING DRAWER
      ========================================================= */}
      <div
        className="
          fixed
          right-0
          top-1/2
          z-[9999]
          -translate-y-1/2
          pointer-events-none
        "
      >
        {/* =======================================================
            DRAWER PANEL
        ======================================================== */}
        <div
          className={`
            absolute
            right-0
            top-1/2
            h-[415px]
            w-[490px]
            -translate-y-1/2
            bg-white
            border
            border-[#e5e5e5]
            shadow-[-6px_0_22px_rgba(0,0,0,0.05)]
            transition-all
            duration-[380ms]
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              isOpen
                ? "translate-x-0 opacity-100 pointer-events-auto"
                : "translate-x-full opacity-0 pointer-events-none"
            }
          `}
          style={{
            width: drawerWidth,
          }}
        >
          {/* =====================================================
              INNER CONTENT
          ====================================================== */}
          <div
            className="
              h-full
              w-full
              px-[31px]
              pb-[30px]
              pt-[32px]
            "
          >
            {/* ===================================================
                HEADING
            ==================================================== */}
            <h2
              className="
                m-0
                mb-[35px]
                font-sans
                text-[23px]
                font-normal
                leading-[1.2]
                tracking-[-0.2px]
                text-[#183E68]
              "
            >
              Unlock Exclusive Benefits
            </h2>

            {/* ===================================================
                BENEFITS
            ==================================================== */}
            <div
              className="
                mb-[28px]
                grid
                w-full
                grid-cols-4
                gap-[8px]
              "
            >
              {/* -------------------------------------------------
                  1. 10% OFF
              -------------------------------------------------- */}
              <div
                className="
                  flex
                  min-w-0
                  flex-col
                  items-center
                  text-center
                "
              >
                <div
                  className="
                    mb-[8px]
                    flex
                    h-[47px]
                    w-[47px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#FFF0F0]
                  "
                >
                  <Gift
                    size={27}
                    strokeWidth={1.8}
                    className="text-[#F04444]"
                  />
                </div>

                <p
                  className="
                    m-0
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[12.5px]
                    font-medium
                    leading-[17px]
                    text-black
                  "
                >
                  10% OFF*
                </p>

                <p
                  className="
                    m-0
                    w-full
                    font-sans
                    text-[11px]
                    font-normal
                    leading-[15px]
                    text-[#171717]
                  "
                >
                  For New User
                </p>
              </div>

              {/* -------------------------------------------------
                  2. NEU COINS
              -------------------------------------------------- */}
              <div
                className="
                  flex
                  min-w-0
                  flex-col
                  items-center
                  text-center
                "
              >
                <div
                  className="
                    mb-[8px]
                    flex
                    h-[47px]
                    w-[47px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#FFF9E7]
                  "
                >
                  <span
                    className="
                      bg-gradient-to-br
                      from-[#FF198F]
                      via-[#6E3EFF]
                      to-[#12C9D8]
                      bg-clip-text
                      font-sans
                      text-[28px]
                      font-extrabold
                      italic
                      leading-none
                      text-transparent
                    "
                  >
                    N
                  </span>
                </div>

                <p
                  className="
                    m-0
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[12.5px]
                    font-medium
                    leading-[17px]
                    text-black
                  "
                >
                  Earn Neu Coins
                </p>

                <p
                  className="
                    m-0
                    w-full
                    font-sans
                    text-[11px]
                    font-normal
                    leading-[15px]
                    text-[#171717]
                  "
                >
                  On eligible Purchase
                </p>
              </div>

              {/* -------------------------------------------------
                  3. NO COST EMI
              -------------------------------------------------- */}
              <div
                className="
                  flex
                  min-w-0
                  flex-col
                  items-center
                  text-center
                "
              >
                <div
                  className="
                    mb-[8px]
                    flex
                    h-[47px]
                    w-[47px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#EDF3FF]
                  "
                >
                  <CreditCard
                    size={27}
                    strokeWidth={1.8}
                    className="text-[#3157D5]"
                  />
                </div>

                <p
                  className="
                    m-0
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[12.5px]
                    font-medium
                    leading-[17px]
                    text-black
                  "
                >
                  No Cost EMI
                </p>

                <p
                  className="
                    m-0
                    w-full
                    font-sans
                    text-[11px]
                    font-normal
                    leading-[15px]
                    text-[#171717]
                  "
                >
                  Option
                </p>
              </div>

              {/* -------------------------------------------------
                  4. SNAPMINT
              -------------------------------------------------- */}
              <div
                className="
                  flex
                  min-w-0
                  flex-col
                  items-center
                  text-center
                "
              >
                <div
                  className="
                    mb-[8px]
                    flex
                    h-[47px]
                    w-[47px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#EDF9F1]
                  "
                >
                  <Zap
                    size={28}
                    fill="currentColor"
                    strokeWidth={1.5}
                    className="text-[#6244FF]"
                  />
                </div>

                <p
                  className="
                    m-0
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[12.5px]
                    font-medium
                    leading-[17px]
                    text-black
                  "
                >
                  Snapmint
                </p>

                <p
                  className="
                    m-0
                    w-full
                    whitespace-nowrap
                    font-sans
                    text-[11px]
                    font-normal
                    leading-[15px]
                    text-[#171717]
                  "
                >
                  Buy Now Pay Later
                </p>
              </div>
            </div>

            {/* ===================================================
                MOBILE INPUT
            ==================================================== */}
            <div
              className="
                mb-[29px]
                flex
                h-[70px]
                w-full
                items-center
                overflow-hidden
                rounded-[10px]
                border
                border-[#AEB7C4]
                bg-white
              "
            >
              {/* Country */}
              <div
                className="
                  flex
                  h-full
                  shrink-0
                  items-center
                  gap-[9px]
                  pl-[17px]
                "
              >
                <span
                  className="
                    flex
                    h-[24px]
                    w-[28px]
                    items-center
                    justify-center
                    text-[25px]
                  "
                >
                  🇮🇳
                </span>

                <span
                  className="
                    whitespace-nowrap
                    font-sans
                    text-[16px]
                    font-normal
                    text-[#111111]
                  "
                >
                  +91
                </span>

                <ChevronRight
                  size={18}
                  strokeWidth={2}
                  className="
                    mr-[4px]
                    rotate-90
                    text-[#111111]
                  "
                />
              </div>

              {/* Input */}
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Mobile Number*"
                className="
                  h-full
                  min-w-0
                  flex-1
                  border-0
                  bg-transparent
                  px-[13px]
                  font-sans
                  text-[17px]
                  font-normal
                  text-[#222222]
                  outline-none
                  placeholder:text-[#A5ACB8]
                "
              />
            </div>

            {/* ===================================================
                GET OTP BUTTON
            ==================================================== */}
            <button
              type="button"
              className="
                h-[70px]
                w-full
                rounded-[10px]
                border-0
                bg-[#030303]
                font-sans
                text-[19px]
                font-medium
                text-white
                transition
                duration-200
                hover:bg-[#121212]
                active:scale-[0.99]
              "
            >
              GET OTP
            </button>
          </div>
        </div>

        {/* =======================================================
            SIDE TAB
        ======================================================== */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={
            isOpen ? "Close Get Started" : "Open Get Started"
          }
          className={`
            pointer-events-auto
            absolute
            right-0
            top-1/2
            flex
            h-[166px]
            w-[41px]
            -translate-y-1/2
            flex-col
            items-center
            justify-center
            rounded-l-[10px]
            border-0
            bg-[#1D1D1D]
            p-0
            text-white
            shadow-[0_2px_10px_rgba(0,0,0,0.08)]
            transition-all
            duration-[380ms]
            ease-[cubic-bezier(0.22,1,0.36,1)]
            hover:bg-[#111111]
            ${isOpen ? "right-[490px]" : "right-0"}
          `}
        >
          {/* Arrow */}
          <span
            className="
              absolute
              top-[14px]
              flex
              h-[22px]
              w-[22px]
              items-center
              justify-center
            "
          >
            {isOpen ? (
              <ChevronRight
                size={21}
                strokeWidth={1.8}
              />
            ) : (
              <ChevronLeft
                size={21}
                strokeWidth={1.8}
              />
            )}
          </span>

          {/* Vertical Text */}
          <span
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-[42%]
              -rotate-90
              whitespace-nowrap
              font-sans
              text-[14px]
              font-medium
              tracking-[0.3px]
            "
          >
            GET STARTED
          </span>
        </button>
      </div>

      {/* =========================================================
          MOBILE RESPONSIVE
      ========================================================= */}
      <style jsx>{`
        @media (max-width: 700px) {
          /* handled with inline Tailwind classes below */
        }
      `}</style>
    </>
  );
}