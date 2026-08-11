import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Button.module.css";

export type ButtonVariant = "gold" | "ghost" | "invert";

type Common = {
  variant?: ButtonVariant;
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Button({
  href,
  variant = "gold",
  compact = false,
  className,
  style,
  children
}: Common & { href: string }) {
  return (
    <a href={href} className={cx(styles.btn, styles[variant], compact && styles.compact, className)} style={style}>
      {children}
    </a>
  );
}

export function SubmitButton({
  variant = "invert",
  compact = false,
  className,
  style,
  children
}: Common) {
  return (
    <button
      type="submit"
      className={cx(styles.btn, styles[variant], compact && styles.compact, className)}
      style={style}
    >
      {children}
    </button>
  );
}

export const buttonClass = styles.btn;
export const buttonVariantClass = { gold: styles.gold, ghost: styles.ghost, invert: styles.invert };
