import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/features/landing/components/design-system/primitives/cx";
import styles from "@/features/landing/components/design-system/primitives/Lede.module.css";

export function Lede({
  className,
  style,
  children
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <p className={cx(styles.lede, className)} style={style}>
      {children}
    </p>
  );
}

export const ledeClass = styles.lede;
