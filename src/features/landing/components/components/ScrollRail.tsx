"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { scrub } from "@/features/landing/components/design-system/motion";
import styles from "@/features/landing/components/components/ScrollRail.module.css";

export function ScrollRail() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, scrub.s03);
  return <motion.div className={styles.rail} style={{ scaleX }} />;
}
