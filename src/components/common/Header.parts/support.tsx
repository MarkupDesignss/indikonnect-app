"use client";




/* =========================================================
   FESTIVE MODE
   Keep false to use the standard header. The festive classes
   and decorative elements remain available when enabled.
========================================================= */

export const DIWALI_MODE = false;


export const IK_FIREWORKS = [
  { x: "7%", y: "51%", color: "#ffd995", delay: "-1.5s" },
  { x: "94%", y: "44%", color: "#ffc6af", delay: "-4.3s" },
  { x: "24%", y: "41%", color: "#ffd995", delay: "-6.1s" },
  { x: "78%", y: "52%", color: "#ffe8bb", delay: "-3.0s" },
];


export const IK_GLINTS = [
  ["2%", "28%", "-2.2s"],
  ["15%", "68%", "-1.3s"],
  ["30%", "18%", "-2.8s"],
  ["43%", "76%", "-0.6s"],
  ["56%", "23%", "-1.8s"],
  ["69%", "67%", "-3.1s"],
  ["85%", "16%", "-2.6s"],
  ["98%", "77%", "-0.4s"],
];


export function FestiveDiyaMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path
        d="M18 5.3c-3.9 4.5-3.5 7.6-.3 9.1 3.4-1.3 3.8-4.6.3-9.1Z"
        fill="#F7D69B"
      />
      <path
        d="M17.8 10.6c-1.7 2.2-1.4 3.6.1 4.5 1.8-.9 1.9-2.6-.1-4.5Z"
        fill="#EAA763"
      />
      <path
        d="M7 19.2h22c-.9 7.2-5 10.9-11 10.9S7.9 26.4 7 19.2Z"
        stroke="#F1CC88"
        strokeWidth="1.6"
      />
      <path
        d="M5.3 18.8c4.2 2.1 21.3 2.1 25.4 0"
        stroke="#F1CC88"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13 25.3c3.3 1.7 6.7 1.7 10 0"
        stroke="#F1CC88"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M9.5 32.3h17"
        stroke="#F1CC88"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}


/* =========================================================
   SPEECH / LOCATION TYPES
========================================================= */

export interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
    };
  };
}


export interface SpeechRecognitionErrorEventLike {
  error: string;
}


export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}


export interface LocationInfo {
  locality: string | null;
  state: string | null;
  city: string | null;
  district: string | null;
  postcode: string | null;
  country: string | null;
}


/* =========================================================
   SCROLL CONFIG
========================================================= */

export const SCROLL_COLLAPSE_AT = 80;

export const SCROLL_EXPAND_AT = 10;

export const NAV_COLLAPSE_AT = 260;

export const NAV_EXPAND_AT = 140;

export const INITIAL_HEADER_HEIGHT = 112;


/* =========================================================
   DEFAULT EXPORT — SUSPENSE WRAPPER
========================================================= */

export function HeaderSkeleton() {
  return (
    <header
      style={{
        height: INITIAL_HEADER_HEIGHT,
        background: "#fff",
        borderBottom: "1px solid #EAEAEA",
      }}
      aria-hidden="true"
    />
  );
}
