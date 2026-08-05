"use client";

import Image from "next/image";
import Watch from "../../../../public/images/Brand/watch.png";
import Jewellery from "../../../../public/images/Brand/jewellery.png";
import Beauty from "../../../../public/images/Brand/beauty.png";
import Dining from "../../../../public/images/Brand/dining.png";

import { getFont, FONT_WEIGHT } from "../../../lib/constants/font-family";

const cards = [
  {
    id: 1,
    title: "Timeless Horology",
    image: Watch,
  },
  {
    id: 2,
    title: "Elegant Jewellery",
    image: Jewellery,
  },
  {
    id: 3,
    title: "Beauty and Personal Care",
    image: Beauty,
  },
  {
    id: 4,
    title: "Lifestyle Dining",
    image: Dining,
  },
];

const marqueeItems = [
  "One Nation. One Network. Endless Possibilities",
  "One Nation. One Network. Endless Possibilities",
  "One Nation. One Network. Endless Possibilities",
  "One Nation. One Network. Endless Possibilities",
  "One Nation. One Network. Endless Possibilities",
  "One Nation. One Network. Endless Possibilities",
];

export default function BrandShowcase() {
  return (
    <section className="w-full bg-white overflow-hidden">
      {/* TOP CONTENT */}
      <div className="max-w-[980px] mx-auto px-6 pt-8 pb-14">
        {/* Our Categories Label */}
        <div className="flex justify-center mb-4">
          <span
            className="text-[#3F3F3F] text-[14px] uppercase tracking-[3px]"
            style={{
              fontFamily: getFont("arimo", FONT_WEIGHT.regular),
            }}
          >
            Our Categories
          </span>
        </div>

        <h2
          className="text-center italic text-[#2A2A2A] text-[18px] leading-[32px] md:text-[28px] md:leading-[42px] font-normal"
          style={{
            fontFamily: getFont("lato", FONT_WEIGHT.regular),
          }}
        >
          We Believe The Brand Is The Identity, An Institution
          <br />
          Built Not Around Individuals, But A Collective Vision Of
          <br />
          Excellence.
        </h2>
      </div>

      {/* MOVING STRIP */}
      <div className="bg-[#E0ECFF] overflow-hidden border-y border-[#c9d9ef] py-3">
        <div className="brand-marquee">
          <div className="brand-track">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <div key={index} className="flex items-center gap-5 shrink-0">
                <span
                  className="text-[14px] whitespace-nowrap text-[#202020]"
                  style={{
                    fontFamily: getFont("arimo", FONT_WEIGHT.light),
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IMAGE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="group relative overflow-hidden h-[450px] cursor-pointer"
          >
            <Image
              src={card.image}
              alt={card.title}
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

            {/* Text */}
            <div className="absolute left-6 bottom-6 z-20">
              <h3
                className="text-white text-[20px] leading-7 font-normal whitespace-pre-line"
                style={{
                  fontFamily: getFont("lato", FONT_WEIGHT.regular),
                }}
              >
                {card.title === "Beauty and Personal Care"
                  ? "Beauty and\nPersonal Care"
                  : card.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* STYLES */}
      <style jsx>{`
        .brand-marquee {
          width: 100%;
          overflow: hidden;
          position: relative;
          white-space: nowrap;
          background: #dce8f8;
        }

        .brand-track {
          display: flex;
          align-items: center;
          gap: 40px;
          width: max-content;
          animation: brandMarquee 28s linear infinite;
        }

        .brand-track:hover {
          animation-play-state: paused;
        }

        @keyframes brandMarquee {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 1024px) {
          .brand-track {
            animation-duration: 24s;
          }
        }

        @media (max-width: 768px) {
          .brand-track {
            gap: 28px;
            animation-duration: 20s;
          }
        }

        @media (max-width: 640px) {
          .brand-track {
            gap: 22px;
            animation-duration: 16s;
          }
        }
      `}</style>
    </section>
  );
}