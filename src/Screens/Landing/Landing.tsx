"use client";

import { useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Preloader } from "@/components/home/components/Preloader";
import { ScrollRail } from "@/components/home/components/ScrollRail";
import { Collections } from "@/components/home/components/sections/Collections";
import { Craft } from "@/components/home/components/sections/Craft";
import { Finale } from "@/components/home/components/sections/Finale";
import { Hero } from "@/components/home/components/sections/Hero";
import { Ladder } from "@/components/home/components/sections/Ladder";
import { Nation } from "@/components/home/components/sections/Nation";
import { TheName } from "@/components/home/components/sections/TheName";
import { Values } from "@/components/home/components/sections/Values";
import { Voices } from "@/components/home/components/sections/Voices";
import { SmoothScroll } from "@/components/home/components/SmoothScroll";
import Footer from "@/components/Footer/Footer";
import Newsletter from "@/components/product/Newsletter";
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