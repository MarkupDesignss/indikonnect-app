"use client";

import type { FormEvent } from "react";
import { ArrowIcon, Reveal, SubmitButton, Wrap } from "../../design-system";
import styles from "./Newsletter.module.css";

export function Newsletter() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
  };

  return (
    <section className={styles.news} aria-label="Newsletter">
      <Wrap className={styles.in}>
        <Reveal as="div">
          <h2>Inspiration, delivered.</h2>
          <p>Insights, opportunities and product launches, straight to your inbox.</p>
        </Reveal>

        <Reveal as="div" delay={0.08}>
          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.label} htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
            <SubmitButton variant="invert">
              Subscribe
              <ArrowIcon />
            </SubmitButton>
          </form>
        </Reveal>
      </Wrap>
    </section>
  );
}
