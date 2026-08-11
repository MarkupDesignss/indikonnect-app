"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import bg from "../../../public/indiekonnect-web/images/Collection5.jpg";

import { COLORS } from "@/lib/constants/colors";
import {
  getFont,
  FONT_WEIGHT,
} from "@/lib/constants/font-family";

export default function StandardSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Image Scale - Zooms from larger starting size to full banner
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.7],
    [0.35, 1.8] // Increased from 0.15 to 0.35 - starts larger
  );

  // Border Radius - Goes from rounded to flat
  const imageRadius = useTransform(
    scrollYProgress,
    [0, 0.5],
    [30, 0] // Slightly less rounded
  );

  // Image Position - Centers as it zooms
  const imageX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [0, 0]
  );

  const imageY = useTransform(
    scrollYProgress,
    [0, 0.5],
    [0, 0]
  );

  // Dark Overlay - Becomes darker as text appears
  const overlayOpacity = useTransform(
    scrollYProgress,
    [0.4, 0.7],
    [0, 0.75]
  );

  // Text Animation - Appears at the end
  const textOpacity = useTransform(
    scrollYProgress,
    [0.6, 0.85],
    [0, 1]
  );

  const textY = useTransform(
    scrollYProgress,
    [0.6, 0.85],
    [100, 0]
  );

  // Glow effect
  const glowOpacity = useTransform(
    scrollYProgress,
    [0.5, 0.8],
    [0, 1]
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[600vh] bg-[#071424]"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">

        {/* Single Image - Zooms from larger size to banner */}
        <motion.div
          style={{
            scale: imageScale,
            borderRadius: imageRadius,
            x: imageX,
            y: imageY,
          }}
          className="relative w-full h-full overflow-hidden"
        >
          <Image
            src={bg}
            alt="Beauty"
            fill
            priority
            className="object-cover"
          />

          {/* Dark Overlay on Image */}
          <motion.div
            style={{
              opacity: overlayOpacity,
            }}
            className="absolute inset-0 bg-black"
          />
        </motion.div>

        {/* Text Content - Appears at the end */}
        <motion.div
          style={{
            opacity: textOpacity,
            y: textY,
          }}
          className="absolute inset-0 flex items-center justify-center z-20 px-8"
        >
          <div className="max-w-4xl text-center">

            {/* Chapter */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <div
                className="w-10 h-[2px]"
                style={{
                  background: COLORS.brand.gold,
                }}
              />
              <span
                className="uppercase tracking-[4px] text-[13px]"
                style={{
                  color: COLORS.brand.gold,
                  fontFamily: getFont("jost"),
                  fontWeight: FONT_WEIGHT.medium,
                }}
              >
                Chapter Four • The Standard
              </span>
            </div>

            {/* Heading */}
            <h2
              className="leading-none"
              style={{
                fontFamily: getFont("cormorant"),
                fontSize: "60px",
                color: "#F7F3EC",
                fontWeight: FONT_WEIGHT.regular,
              }}
            >
              Made to be{" "}
              <span
                style={{
                  color: COLORS.brand.gold,
                  fontStyle: "italic",
                }}
              >
                kept
              </span>
            </h2>

            {/* Paragraph */}
            <p
              className="mx-auto mt-10 max-w-[900px]"
              style={{
                fontFamily: getFont("jost"),
                fontSize: "24px",
                lineHeight: "40px",
                color: "rgba(255,255,255,.82)",
                fontWeight: FONT_WEIGHT.regular,
              }}
            >
              Watches drawn from heritage horology.
              Jewellery that reflects individuality.
              Skincare built on performance, not promises.
              Dining pieces that bring elegance to the
              modern Indian home.
              Four categories, one standard.
            </p>

          </div>
        </motion.div>

        {/* Glow Effect */}
        <motion.div
          style={{
            opacity: glowOpacity,
          }}
          className="absolute inset-0 pointer-events-none z-10"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255,199,44,.08), transparent 70%)",
            }}
          />
        </motion.div>

      </div>
    </section>
  );
}