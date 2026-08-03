"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Banner from "../../../../public/images/taj.jpeg";
import { COLORS } from "@/src/lib/constants/colors";

export function Hero() {
  const marqueeRef = useRef(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let animationId;
    let position = 0;
    const speed = 0.5;

    const animate = () => {
      position -= speed;
      if (marquee) {
        marquee.style.transform = `translateX(${position}px)`;
        if (position <= -marquee.scrollWidth / 3) {
          position = 0;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background Image */}
      <Image
        className="w-full h-full object-cover"
        src={Banner}
        alt="Description of the image"
      />

      {/* Overlay with Blur */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center z-[2] backdrop-blur-[4px] bg-black/40">
        {/* "Art of" Text */}
        <span className="absolute top-[20%] left-1/2 -translate-x-1/2 text-white font-['Cormorant_serif'] text-[150px] font-light tracking-[-0.32px] leading-[77.625px] text-center whitespace-nowrap transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] antialiased">
          Art of
        </span>

        {/* "Opportunity" Text */}
        <span
          className="absolute top-[32%] left-1/2 -translate-x-1/2 font-['Cormorant_serif'] text-[150px] font-light tracking-[-0.32px] leading-[77.625px] text-center whitespace-nowrap italic antialiased"
          style={{ color: COLORS.brand.gold }}
        >
          Opportunity
        </span>

        {/* Description Paragraph */}
        <p className="text-white/85 font-['Jost_system-ui_sans-serif'] mt-[50px] text-base font-light leading-[27.2px] text-center max-w-[500px] mb-[34px]">
          A modern Indian movement built on Connection, Opportunity, Growth, and
          Trust, where the spirit of 1.4 billion meets the power of
          entrepreneurship.
        </p>

        {/* Buttons */}
        <div className="flex flex-row gap-5">
          <Link
            href="/join"
            className="flex items-center justify-center gap-2.5 cursor-pointer px-[34px] py-4 bg-[#FFC72C] text-[#0A2240] border border-[#FFC72C] text-center no-underline uppercase font-['Jost_sans-serif'] text-xs font-medium leading-[20.4px] tracking-[2.64px] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#e6b52a] hover:scale-105 antialiased"
          >
            JOIN THE MOVEMENT →
          </Link>
          <Link
            href="/join"
            className="flex items-center justify-center gap-2.5 cursor-pointer font-medium px-[34px] py-4 text-white border-b border-b-white text-center uppercase font-['Jost_sans-serif'] text-xs leading-[20.4px] tracking-[2.64px] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] antialiased"
          >
            SHOP THE COLLECTIONS →
          </Link>
        </div>

        {/* Bottom Bar with Marquee Animation */}
        <div className="absolute bottom-0 left-0 w-full bg-[#0A2240] flex items-center justify-center z-[3] overflow-hidden">
          <div
            ref={marqueeRef}
            className="flex whitespace-nowrap py-[30px] will-change-transform"
          >
            {[...Array(4)].map((_, index) => (
              <span
                key={index}
                className={`text-white text-base font-['Cormorant_serif'] tracking-[2px] uppercase italic opacity-80 ${
                  index < 3 ? "mr-[50px]" : ""
                }`}
              >
                One Nation.One Network. Endless Possibilities.
                <span className="ml-2.5" style={{ color: COLORS.brand.gold }}>
                  ✦
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
