"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { revealTransition, viewportOnce } from "../motion";

const TAGS = {
  div: motion.div,
  p: motion.p,
  h2: motion.h2,
  h3: motion.h3,
  span: motion.span,
  form: motion.form,
  article: motion.article,
  li: motion.li
} as const;

export type RevealTag = keyof typeof TAGS;

/**
 * The .rv reveal from the original: y 34 -> 0, opacity 0 -> 1, once,
 * fired when the element clears 88% of the viewport.
 */
export function Reveal({
  as = "div",
  delay = 0,
  y = 34,
  className,
  style,
  children
}: {
  as?: RevealTag;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const Tag = TAGS[as];
  const reduced = useReducedMotion();

  if (reduced) {
    const Plain = Tag;
    return (
      <Plain className={className} style={style}>
        {children}
      </Plain>
    );
  }

  return (
    <Tag
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...viewportOnce, margin: "0px 0px -12% 0px" }}
      transition={{ ...revealTransition, delay }}
    >
      {children}
    </Tag>
  );
}
