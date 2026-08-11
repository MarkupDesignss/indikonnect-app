"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { scrub } from "../design-system/motion";
import styles from "./ScrollRail.module.css";

export function ScrollRail() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, scrub.s03);
  return <motion.div className={styles.rail} style={{ scaleX }} />;
}
