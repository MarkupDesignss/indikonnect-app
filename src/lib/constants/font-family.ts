// lib/constants/font-family.ts

export const FONT_FAMILIES = {
  arimo: 'Arimo, sans-serif',
  lato: 'Lato, sans-serif',
  liberationSans: 'Liberation Sans, Arial, sans-serif',
  cormorant: 'Cormorant Garamond, serif',
  jost: 'Jost, sans-serif',
  inter: 'Inter, sans-serif',
  display: 'Playfair Display, serif',
  script: 'Dancing Script, cursive',
} as const;

export const FONT_WEIGHT = {
  thin: 100,
  extraLight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
} as const;

export type FontFamily = keyof typeof FONT_FAMILIES;

export const getFont = (family: FontFamily | string, weight: number = 400): string => {
  const fontFamily = FONT_FAMILIES[family as FontFamily] || FONT_FAMILIES.lato;

  // Return font with weight
  return fontFamily;
};

export const getFontWithWeight = (family: FontFamily | string, weight: number = 400): string => {
  const fontFamily = FONT_FAMILIES[family as FontFamily] || FONT_FAMILIES.lato;
  return `${weight} ${fontFamily}`;
};