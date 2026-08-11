import type { CSSProperties, ElementType, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Display.module.css";

export type DisplaySize = "xxl" | "xl" | "lg" | "md";

type DisplayProps = {
  as?: ElementType;
  size?: DisplaySize;
  italic?: boolean;
  gold?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  "aria-label"?: string;
};

/** Fraunces display type. The whole scale, nothing outside it. */
export function Display({
  as: Tag = "h2",
  size = "lg",
  italic = false,
  gold = false,
  id,
  className,
  style,
  children,
  ...rest
}: DisplayProps) {
  return (
    <Tag
      id={id}
      className={cx(styles.display, styles[size], italic && styles.italic, gold && styles.gold, className)}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Inline italic-gold accent inside a Display line. */
export function Accent({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(styles.italic, styles.gold, className)}>{children}</span>;
}
