"use client";

import { useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowIcon, Button,  Logo, Wrap, cx } from "../design-system";
import { nav } from "../../../data/site";
import styles from "./Nav.module.css";

export function Nav() {
  const { scrollY } = useScroll();
  const [stuck, setStuck] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    const next = v > 80;
    setStuck((prev) => (prev === next ? prev : next));
  });

  return (
    <header className={cx(styles.nav, stuck && styles.stuck)}>
      <Wrap className={styles.in}>
        <a href="#top" className={styles.brand} aria-label="IndieKonnect, connect beyond boundaries, home">
          <Logo className={styles.logo} />
        </a>

        <nav className={styles.links} aria-label="Primary">
          {nav.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.cta}>
        
          <Button href="#join" variant="gold" compact>
            Join
            <ArrowIcon />
          </Button>
        </div>
      </Wrap>
    </header>
  );
}
