import type { Transition, Variants } from "framer-motion";

export type Cubic = [number, number, number, number];

/** GSAP eases, ported to cubic-beziers so the port keeps the same feel. */
export const ease = {
  /** var(--ease) — the house curve */
  house: [0.22, 1, 0.36, 1] as Cubic,
  expoOut: [0.16, 1, 0.3, 1] as Cubic,
  expoInOut: [0.87, 0, 0.13, 1] as Cubic,
  power1In: [0.55, 0.085, 0.68, 0.53] as Cubic,
  power2Out: [0.25, 0.46, 0.45, 0.94] as Cubic,
  power2InOut: [0.45, 0, 0.55, 1] as Cubic,
  power3In: [0.55, 0.055, 0.675, 0.19] as Cubic,
  power3Out: [0.215, 0.61, 0.355, 1] as Cubic
};

/**
 * Spring configs that stand in for ScrollTrigger's `scrub: n`.
 * Bigger scrub = softer follow, so damping rises with the number.
 */
export const scrub = {
  s03: { stiffness: 260, damping: 42, mass: 0.28, restDelta: 0.0005 },
  s06: { stiffness: 150, damping: 38, mass: 0.32, restDelta: 0.0005 },
  s07: { stiffness: 130, damping: 38, mass: 0.34, restDelta: 0.0005 },
  s08: { stiffness: 115, damping: 38, mass: 0.36, restDelta: 0.0005 },
  s09: { stiffness: 105, damping: 38, mass: 0.38, restDelta: 0.0005 },
  s10: { stiffness: 95, damping: 38, mass: 0.4, restDelta: 0.0005 }
} as const;

/** The .rv reveal: fade + rise, once. */
export const revealTransition: Transition = { duration: 0.9, ease: ease.power3Out };

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 34 },
  shown: { opacity: 1, y: 0, transition: revealTransition }
};

export const viewportOnce = { once: true, amount: 0.15 } as const;
