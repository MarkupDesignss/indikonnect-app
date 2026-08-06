// components/Banner.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Playfair_Display, Great_Vibes } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
});

export default function Banner() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero-bg.jpg"          // Hawa Mahal background
        alt="Hawa Mahal"
        fill
        priority
        className="object-cover object-center"
        quality={90}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">

          {/* Left Content */}
          <div className="lg:col-span-7 pt-20 lg:pt-0">
            {/* Tagline */}
            <p className="text-[11px] md:text-xs tracking-[0.35em] text-[#F5C518] font-medium mb-8 uppercase">
              ONE NATION · ONE NETWORK · ENDLESS POSSIBILITIES
            </p>

            {/* Main Heading */}
            <h1 className="mb-6">
              <span className={`${playfair.className} block text-5xl md:text-6xl lg:text-7xl text-white font-normal leading-none`}>
                Art of
              </span>
              <span className={`${greatVibes.className} block text-6xl md:text-7xl lg:text-8xl text-[#F5C518] leading-none mt-1`}>
                Opportunity
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-md text-white/90 text-base md:text-lg leading-relaxed mb-10">
              A modern Indian movement built on Connection, Opportunity,
              Growth and Trust, where the spirit of 1.4 billion meets the power
              of entrepreneurship.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/join"
                className="bg-[#F5C518] hover:bg-[#e6b800] text-black font-semibold px-8 py-3.5 rounded-full flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                Join the Movement
                <span>→</span>
              </Link>

              <Link
                href="/collections"
                className="border border-white/40 hover:border-white text-white font-medium px-8 py-3.5 rounded-full flex items-center gap-2 transition-all hover:bg-white/10"
              >
                Shop the Collections
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Right Side - Model in Red Arch */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[320px] md:w-[360px] h-[480px] md:h-[560px]">
              {/* Red Arch Shape */}
              <div className="absolute inset-0 bg-[#C8102E] rounded-t-[9999px] rounded-b-[40px] overflow-hidden shadow-2xl">
                <Image
                  src="/model.png"     // woman in purple saree (transparent bg preferred)
                  alt="Indie Konnect Model"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-6 lg:left-12 z-10">
        <p className="text-[11px] tracking-[0.3em] text-white/70 font-medium uppercase">
          SCROLL
        </p>
      </div>
    </section>
  );
}