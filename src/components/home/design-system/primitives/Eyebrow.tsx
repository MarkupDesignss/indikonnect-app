import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Eyebrow.module.css";

export function Eyebrow({
  center = false,
  className,
  style,
  children
}: {
  center?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <p className={cx(styles.eyebrow, center && styles.center, className)} style={style}>
      {children}
    </p>
  );
}

export const eyebrowClass = styles.eyebrow;
export const eyebrowCenterClass = cx(styles.eyebrow, styles.center);
