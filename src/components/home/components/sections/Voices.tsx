"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

import {
  Accent,
  Display,
  Eyebrow,
  Reveal,
  Section,
  Wrap,
  cx,
} from "../../design-system";

import { scrub } from "../../design-system/motion";
import { U, compliance, voices } from "../../../../data/site";

import styles from "./Voices.module.css";
import valStyles from "./Values.module.css";

export function Voices() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const p = useSpring(scrollYProgress, scrub.s10);

  // Infinite scroll animation - moves right to left
  const x = useTransform(p, [0, 0.5], [0, -50]); // 50% for seamless loop

  // Auto-rotate cards on mobile
  useEffect(() => {
    if (reduced || !isMobile || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % voices.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [reduced, isMobile, isDragging, voices.length]);

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const swipeDistance = touchStartY - touchEndY;
    
    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0) {
        setCurrentIndex((prev) => (prev + 1) % voices.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + voices.length) % voices.length);
      }
    }
    
    setTouchStartY(0);
    setTouchEndY(0);
  };

  // Duplicate voices for infinite scroll
  const duplicatedVoices = [...voices, ...voices];

  return (
    <Section
      id="voices"
      surface="light"
      label="Voices of the movement"
      className={styles.voices}
      ref={ref}
    >
      {/* Header */}
      <div className={styles.head}>
        <Reveal as="p">
          <Eyebrow center>
            Chapter Seven &middot; The People
          </Eyebrow>
        </Reveal>

        <Reveal as="div" delay={0.08}>
          <Display
            size="lg"
            style={{
              marginTop: 20,
            }}
          >
            People &amp; <Accent>possibilities</Accent>
          </Display>
        </Reveal>
      </div>

      {/* Cards */}
      <div className={styles.sliderWrapper}>
        {isMobile ? (
          // Mobile: Vertical carousel (one card at a time)
          <div 
            className={styles.mobileContainer}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className={styles.mobileCard}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30 
                }}
              >
                <article className={styles.card}>
                  <p className={styles.mark} aria-hidden="true">
                    &ldquo;
                  </p>

                  <q>{voices[currentIndex].quote}</q>

                  <div className={styles.who}>
                    <span className={styles.av}>
                      <Image
                        src={U(voices[currentIndex].avatar, 140, 70)}
                        alt=""
                        fill
                        sizes="48px"
                      />
                    </span>

                    <span>
                      <span className={styles.name}>
                        {voices[currentIndex].name}
                      </span>
                      <br />
                      <span className={styles.role}>
                        {voices[currentIndex].role}
                      </span>
                    </span>
                  </div>
                </article>
              </motion.div>
            </AnimatePresence>

            {/* Dots indicator */}
            <div className={styles.dots}>
              {voices.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          // Desktop: Infinite horizontal scroll (right to left)
          <motion.div
            className={styles.row}
            style={
              reduced
                ? undefined
                : {
                    x,
                  }
            }
            drag="x"
            dragConstraints={{
              left: -(duplicatedVoices.length * 380), // 380px per card
              right: 0,
            }}
            dragElastic={0.08}
            dragMomentum
          >
            {duplicatedVoices.map((voice, index) => (
              <article
                key={`${voice.name}-${index}`}
                className={styles.card}
              >
                <p
                  className={styles.mark}
                  aria-hidden="true"
                >
                  &ldquo;
                </p>

                <q>{voice.quote}</q>

                <div className={styles.who}>
                  <span className={styles.av}>
                    <Image
                      src={U(voice.avatar, 140, 70)}
                      alt=""
                      fill
                      sizes="48px"
                    />
                  </span>

                  <span>
                    <span className={styles.name}>
                      {voice.name}
                    </span>

                    <br />

                    <span className={styles.role}>
                      {voice.role}
                    </span>
                  </span>
                </div>
              </article>
            ))}
          </motion.div>
        )}
      </div>

      {/* Closing */}
      <Wrap className={styles.closing}>
        <Reveal as="p">
          <Eyebrow center>
            Future-Ready &amp; Compliant
          </Eyebrow>
        </Reveal>

        <Reveal as="div" delay={0.08}>
          <Display
            as="h3"
            size="md"
            style={{
              marginTop: 16,
            }}
          >
            A proud advocate of{" "}
            <Accent>Aatmanirbhar Bharat</Accent>
          </Display>
        </Reveal>

        <Reveal
          as="div"
          delay={0.16}
          className={valStyles.grid}
          style={{
            marginTop: "var(--space-4)",
            textAlign: "left",
          }}
        >
          {compliance.map((item) => (
            <article
              key={item.idx}
              className={cx(
                valStyles.val,
                valStyles.compact
              )}
            >
              <span className={valStyles.idx}>
                {item.idx}
              </span>

              <h3>{item.title}</h3>

              <p>{item.body}</p>
            </article>
          ))}
        </Reveal>
      </Wrap>
    </Section>
  );
}