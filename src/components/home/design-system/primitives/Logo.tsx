import type { CSSProperties } from "react";

/**
 * Portrait lockup: yellow card, dripping base, three blue dots.
 * Sized by height; width follows the 466x790 viewBox.
 */
export function Logo({
  className,
  style,
  title
}: {
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 466 790"
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path
        fill="var(--gold)"
        d="M30 0H436A30 30 0 0 1 466 30V600A30 30 0 0 1 436 630H406V506A31 31 0 0 0 344 506V656A39 39 0 0 1 266 656V588A31 31 0 0 0 204 588V685A40 40 0 0 1 124 685A31 31 0 0 0 62 685V790H31A31 31 0 0 1 0 759V30A30 30 0 0 1 30 0Z"
      ></path>
      <text
        x="47"
        y="193"
        textLength="373"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--ff-ui)"
        fontWeight="700"
        fontSize="153"
        fill="var(--brand-blue)"
      >
        INDIE
      </text>
      <text
        x="47"
        y="293"
        textLength="368"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--ff-ui)"
        fontWeight="700"
        fontSize="125"
        fill="var(--brand-graphite)"
      >
        KONNECT
      </text>
      <rect x="47" y="313" width="375" height="4" fill="#fff"></rect>
      <text
        x="47"
        y="353"
        textLength="375"
        lengthAdjust="spacing"
        fontFamily="var(--ff-ui)"
        fontWeight="600"
        fontSize="25"
        fill="var(--brand-graphite)"
      >
        CONNECT BEYOND BOUNDARIES
      </text>
      <circle cx="93" cy="619" r="25" fill="var(--brand-blue)"></circle>
      <circle cx="235" cy="522" r="25" fill="var(--brand-blue)"></circle>
      <circle cx="375" cy="440" r="25" fill="var(--brand-blue)"></circle>
    </svg>
  );
}
