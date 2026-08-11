import type { CSSProperties, ReactNode, Ref } from "react";
import { cx } from "./cx";
import styles from "./Section.module.css";

type SectionProps = {
  id?: string;
  surface?: "dark" | "light";
  label?: string;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLElement>;
  children: ReactNode;
};

/** An "act" of the page. data-surface lets primitives re-tune for ivory. */
export function Section({ id, surface = "dark", label, className, style, ref, children }: SectionProps) {
  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      data-surface={surface}
      className={cx(styles.act, surface === "light" && styles.light, className)}
      style={style}
    >
      {children}
    </section>
  );
}

export function Wrap({
  className,
  style,
  children
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.wrap, className)} style={style}>
      {children}
    </div>
  );
}
