"use client";

import { motion } from "framer-motion";

import { COLORS } from "@/lib/constants/colors";
import {
  getFont,
  FONT_WEIGHT,
} from "@/lib/constants/font-family";

const values = [
  {
    id: "01",
    color: "#0A2240",
    title: "Trust & Stability",
    keyword: "Blue.",
    description:
      "We operate with professional vision and steady confidence in every relationship we build, from the first order to the hundredth.",
  },
  {
    id: "02",
    color: "#FFC72C",
    title: "Energy & Growth",
    keyword: "Yellow.",
    description:
      "We foster a culture of positivity, ambition and warmth that keeps people moving forward together.",
  },
  {
    id: "03",
    color: "#FFFFFF",
    title: "Integrity & Transparency",
    keyword: "White.",
    description:
      "Our foundation is ethical values and honest, simple business practice. Nothing hidden in the fine print.",
  },
];

export default function ValuesSection() {
  return (
    <section
      className="relative py-28 overflow-hidden"
      style={{
        background: "#F7F3EA",
      }}
    >
      {/* Background Glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,199,44,.08), transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      <div className="max-w-[1550px] mx-auto px-8 relative z-10">
        {/* Chapter */}
        <div className="flex items-center gap-5">
          <div
            className="w-11 h-[2px]"
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
            Chapter Five • The Foundations
          </span>
        </div>

        {/* Heading */}
        <h2
          className="mt-8 leading-none"
          style={{
            fontFamily: getFont("cormorant"),
            fontSize: "96px",
            color: "#111111",
            fontWeight: FONT_WEIGHT.regular,
          }}
        >
          Values you can{" "}
          <span
            style={{
              color: COLORS.brand.gold,
              fontStyle: "italic",
            }}
          >
            trust
          </span>
        </h2>

        {/* Description */}
        <p
          className="mt-8 max-w-4xl"
          style={{
            fontFamily: getFont("jost"),
            color: "#5B5B5B",
            fontSize: "22px",
            lineHeight: "42px",
          }}
        >
          The IndieKonnect ecosystem runs on a people-first philosophy.
          Our house colours are not decoration, they are a commitment.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-24">
          {values.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
              }}
              viewport={{ once: true }}
              whileHover={{
                y: -10,
                scale: 1.02,
              }}
              className="relative bg-white rounded-[10px] border border-[#DDD8CF] shadow-[0_18px_40px_rgba(0,0,0,.06)] p-14 transition-all duration-500"
            >
              {/* Number */}
              <span
                className="absolute top-8 right-8"
                style={{
                  color: "#B6B6B6",
                  fontSize: "26px",
                  fontFamily: getFont("jost"),
                  fontWeight: FONT_WEIGHT.light,
                }}
              >
                {item.id}
              </span>

              {/* Circle */}
              <div
                className="w-[72px] h-[72px] rounded-full border flex items-center justify-center"
                style={{
                  borderColor: "#D8D8D8",
                }}
              >
                <div
                  className="w-[50px] h-[50px] rounded-full border"
                  style={{
                    background: item.color,
                    borderColor:
                      item.color === "#FFFFFF"
                        ? "#D6D6D6"
                        : item.color,
                  }}
                />
              </div>

              {/* Title */}
              <h3
                className="mt-8"
                style={{
                  fontFamily: getFont("cormorant"),
                  fontSize: "56px",
                  lineHeight: 1.05,
                  color: "#111111",
                  fontWeight: FONT_WEIGHT.regular,
                }}
              >
                {item.title}
              </h3>

              {/* Description */}
              <p
                className="mt-8"
                style={{
                  fontFamily: getFont("jost"),
                  color: "#555555",
                  fontSize: "18px",
                  lineHeight: "38px",
                }}
              >
                <strong>{item.keyword}</strong>{" "}
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Decoration */}
        <div className="mt-24 flex justify-center">
          <div
            className="w-32 h-[2px]"
            style={{
              background:
                "linear-gradient(to right, transparent, #D4A21F, transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}