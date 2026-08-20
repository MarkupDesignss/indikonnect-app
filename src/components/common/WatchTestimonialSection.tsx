"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

import watchImage from "../../../public/indiekonnect-web/images/w1.png";
import leftWatchImage from "../../../public/indiekonnect-web/images/w2.jpg";
import rightWatchImage from "../../../public/indiekonnect-web/images/w3.webp";

export default function WatchTestimonialSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative w-full overflow-hidden bg-[#f6f6f4]">
      <div
        className="
          relative
          mx-auto
          flex
          min-h-[700px]
          w-full
          max-w-[1500px]
          flex-col
          items-center
          overflow-hidden
          px-5
          pt-12
          sm:px-8
          md:min-h-[760px]
          md:pt-14
          lg:px-12
          xl:min-h-[820px]
        "
      >
        {/* =========================================================
            BACKGROUND GLOW
        ========================================================= */}
        <motion.div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[350px]
            h-[420px]
            w-[420px]
            -translate-x-1/2
            rounded-full
            bg-white
            blur-[110px]
          "
          animate={{
            scale: isHovered ? 1.35 : 1,
            opacity: isHovered ? 1 : 0.7,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        {/* =========================================================
            TESTIMONIAL
        ========================================================= */}
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="relative z-20 mx-auto max-w-[700px] text-center"
        >
          <h2
            className="
              font-serif
              text-[24px]
              font-medium
              leading-[1.35]
              tracking-[-0.025em]
              text-[#191919]
              sm:text-[28px]
              md:text-[32px]
              lg:text-[34px]
            "
          >
            It feels healthier, smoother & more
            <br />
            radiant than ever. I love knowing I'm
            <br />
            using something natural and effective!
          </h2>

          {/* STARS */}
          <motion.div
            animate={{
              scale: isHovered ? 1.06 : 1,
            }}
            transition={{
              duration: 0.4,
            }}
            className="mt-7 flex justify-center gap-[3px]"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="
                  text-[14px]
                  leading-none
                  text-[#e6bb3f]
                  sm:text-[16px]
                "
              >
                ★
              </span>
            ))}
          </motion.div>

          {/* CUSTOMER NAME */}
          <div className="mt-2">
            <p
              className="
                font-serif
                text-[15px]
                font-semibold
                text-[#202020]
                sm:text-[16px]
              "
            >
              Jennifer K.
            </p>

            <p
              className="
                mt-[2px]
                text-[7px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#7b7b7b]
                sm:text-[8px]
              "
            >
              Verified Buyer
            </p>
          </div>
        </motion.div>

        {/* =========================================================
            PRODUCT AREA
        ========================================================= */}
        <motion.div
          className="
            relative
            z-10
            mt-[58px]
            h-[430px]
            w-full
            max-w-[700px]
            cursor-pointer
            sm:mt-[65px]
            sm:h-[470px]
            md:mt-[70px]
            md:h-[510px]
          "
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* =======================================================
              WATCH SHADOW
          ======================================================= */}
          <motion.div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[275px]
              h-[42px]
              w-[200px]
              -translate-x-1/2
              rounded-full
              bg-black/[0.08]
              blur-[24px]
            "
            animate={{
              scaleX: isHovered ? 1.4 : 1,
              opacity: isHovered ? 0.2 : 0.1,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          {/* =======================================================
              LEFT PRODUCT CARD (image left, text right)
          ======================================================= */}
          <motion.div
            className="
              absolute
              left-[1%]
              top-[0px]
              z-30
              w-[210px]
              sm:left-[3%]
              sm:w-[240px]
              md:left-[5%]
              md:w-[265px]
            "
            animate={{
              x: isHovered ? -22 : 0,
              y: isHovered ? -14 : 0,
              scale: isHovered ? 1.14 : 1,
              rotate: isHovered ? -2.5 : 0,
            }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              className="
                flex
                items-center
                gap-3
                overflow-hidden
                rounded-[10px]
                border
                border-black/[0.04]
                bg-white
                p-3
                shadow-[0_10px_30px_rgba(0,0,0,0.07)]
              "
            >
              {/* PRODUCT IMAGE - small, left side */}
              <div
                className="
                  flex
                  h-[62px]
                  w-[62px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[8px]
                  bg-[#fafafa]
                "
              >
                <motion.img
                  src={leftWatchImage.src}
                  alt="Premier watch"
                  className="
                    h-[46px]
                    w-[46px]
                    object-contain
                  "
                  draggable={false}
                  animate={{
                    scale: isHovered ? 1.18 : 1,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                />
              </div>

              {/* PRODUCT CONTENT - right side */}
              <div className="min-w-0 flex-1 text-left">
                <p
                  className="
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-[#9a9a9a]
                  "
                >
                  RAYMOND
                </p>

                <p
                  className="
                    mt-[2px]
                    truncate
                    text-[12px]
                    font-semibold
                    leading-[1.25]
                    text-[#202020]
                  "
                >
                  Premier Watch
                </p>

                <div className="mt-[5px] flex items-center gap-2">
                  <span
                    className="
                      text-[10px]
                      font-medium
                      text-[#999]
                      line-through
                    "
                  >
                    ₹42,999
                  </span>

                  <span
                    className="
                      text-[12px]
                      font-bold
                      text-[#202020]
                    "
                  >
                    ₹36,999
                  </span>
                </div>

                <div className="mt-[6px] flex items-center gap-1">
                  <div className="flex items-center gap-[1px]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className="
                          text-[8px]
                          leading-none
                          text-[#e5ba3c]
                        "
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <span
                    className="
                      text-[8px]
                      font-medium
                      text-[#8a8a8a]
                    "
                  >
                    4.8
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* =======================================================
              RIGHT PRODUCT CARD (image left, text right)
          ======================================================= */}
          <motion.div
            className="
              absolute
              right-[0%]
              top-[250px]
              z-30
              w-[210px]
              sm:right-[2%]
              sm:w-[240px]
              md:right-[8%]
              md:w-[265px]
            "
            animate={{
              x: isHovered ? 22 : 0,
              y: isHovered ? 16 : 0,
              scale: isHovered ? 1.14 : 1,
              rotate: isHovered ? 2.5 : 0,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              className="
                flex
                items-center
                gap-3
                overflow-hidden
                rounded-[10px]
                border
                border-black/[0.04]
                bg-white
                p-3
                shadow-[0_10px_30px_rgba(0,0,0,0.07)]
              "
            >
              {/* PRODUCT IMAGE - small, left side */}
              <div
                className="
                  flex
                  h-[62px]
                  w-[62px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[8px]
                  bg-[#fafafa]
                "
              >
                <motion.img
                  src={rightWatchImage.src}
                  alt="Racing Octane watch"
                  className="
                    h-[46px]
                    w-[46px]
                    object-contain
                  "
                  draggable={false}
                  animate={{
                    scale: isHovered ? 1.18 : 1,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                />
              </div>

              {/* PRODUCT CONTENT - right side */}
              <div className="min-w-0 flex-1 text-left">
                <p
                  className="
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-[#9a9a9a]
                  "
                >
                  OCTANE
                </p>

                <p
                  className="
                    mt-[2px]
                    truncate
                    text-[12px]
                    font-semibold
                    leading-[1.25]
                    text-[#202020]
                  "
                >
                  Racing Octane
                </p>

                <div className="mt-[5px] flex items-center gap-2">
                  <span
                    className="
                      text-[10px]
                      font-medium
                      text-[#999]
                      line-through
                    "
                  >
                    ₹39,999
                  </span>

                  <span
                    className="
                      text-[12px]
                      font-bold
                      text-[#202020]
                    "
                  >
                    ₹32,999
                  </span>
                </div>

                <div className="mt-[6px] flex items-center gap-1">
                  <div className="flex items-center gap-[1px]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className="
                          text-[8px]
                          leading-none
                          text-[#e5ba3c]
                        "
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <span
                    className="
                      text-[8px]
                      font-medium
                      text-[#8a8a8a]
                    "
                  >
                    4.7
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* =======================================================
              CENTER WATCH
          ======================================================= */}
          <motion.div
            className="
              absolute
              left-1/2
              top-[22px]
              z-20
              w-[245px]
              -translate-x-1/2
              sm:w-[275px]
              md:w-[310px]
            "
            animate={{
              y: isHovered ? -20 : 0,
              scale: isHovered ? 1.18 : 1,
              rotate: isHovered ? -3 : 0,
            }}
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.img
              src={watchImage.src}
              alt="Premium watch"
              className="
                block
                h-auto
                w-full
                select-none
                object-contain
                mix-blend-multiply
              "
              draggable={false}
              animate={{
                filter: isHovered
                  ? "drop-shadow(0px 30px 32px rgba(0,0,0,0.22))"
                  : "drop-shadow(0px 10px 14px rgba(0,0,0,0.08))",
              }}
              transition={{
                duration: 0.6,
              }}
            />
          </motion.div>

          {/* =======================================================
              SMALL FLOATING DOTS
          ======================================================= */}
          <motion.span
            className="
              absolute
              left-[29%]
              top-[182px]
              h-[5px]
              w-[5px]
              rounded-full
              bg-[#d5d5d5]
            "
            animate={{
              y: isHovered ? -18 : 0,
              opacity: isHovered ? 0.3 : 0.7,
            }}
            transition={{
              duration: 0.8,
            }}
          />

          <motion.span
            className="
              absolute
              right-[28%]
              top-[145px]
              h-[4px]
              w-[4px]
              rounded-full
              bg-[#d8d8d8]
            "
            animate={{
              y: isHovered ? 20 : 0,
              opacity: isHovered ? 0.25 : 0.65,
            }}
            transition={{
              duration: 0.9,
            }}
          />
        </motion.div>

        {/* =========================================================
            BOTTOM FADE
        ========================================================= */}
        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            h-[100px]
            w-full
            bg-gradient-to-t
            from-[#f6f6f4]
            to-transparent
          "
        />
      </div>
    </section>
  );
}