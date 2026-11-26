"use client";

import { useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Preloader } from "@/features/landing/components/components/Preloader";
import { ScrollRail } from "@/features/landing/components/components/ScrollRail";
import { Collections } from "@/features/landing/components/components/sections/Collections";
import { Craft } from "@/features/landing/components/components/sections/Craft";
import { Finale } from "@/features/landing/components/components/sections/Finale";
import { Hero } from "@/features/landing/components/components/sections/Hero";
import { Ladder } from "@/features/landing/components/components/sections/Ladder";
import { Nation } from "@/features/landing/components/components/sections/Nation";
import { TheName } from "@/features/landing/components/components/sections/TheName";
import { Values } from "@/features/landing/components/components/sections/Values";
import { Voices } from "@/features/landing/components/components/sections/Voices";
import { SmoothScroll } from "@/features/landing/components/components/SmoothScroll";
import Footer from "@/components/Footer/Footer";
import Newsletter from "@/features/products/components/Newsletter";
import Header from "@/components/Header";

export default function Home() {
  const reduced = useReducedMotion();
  const [heroReady, setHeroReady] = useState(false);

  const onReveal = useCallback(() => {
    setHeroReady(true);
  }, []);

  return (
    <SmoothScroll>
      {/* Preloader sabse upar hota hai, isliye wo header ko temporarily cover kar sakta hai, jo theek hai */}
      {!reduced ? <Preloader onReveal={onReveal} /> : null}

      <ScrollRail />

      {/* Header ab poori tarah fixed aur z-index 9999 par hai */}
      <Header />

      <main id="top" className="relative z-0">
        <Hero start={Boolean(reduced) || heroReady} />
        <Nation />
        <TheName />
        <Collections />
        <Craft />
        <Values />
        <Ladder />
        <Voices />
        <Finale />
        <Newsletter />
      </main>

      <Footer />
    </SmoothScroll>
  );
}