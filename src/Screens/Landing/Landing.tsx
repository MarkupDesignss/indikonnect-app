"use client";


import { useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Nav } from "@/components/home/components/Nav";
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
  const onReveal = useCallback(() => setHeroReady(true), []);

  return (
    <SmoothScroll>
      {!reduced ? <Preloader onReveal={onReveal} /> : null}
      <ScrollRail />
      <Header />
 
      <main id="top">
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
