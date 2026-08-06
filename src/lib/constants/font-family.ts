// lib/constants/font-family.ts

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

export const getFont = (family: string, weight: number = 400): string => {
  const fontMap: Record<string, string> = {
    arimo: 'Arimo, sans-serif',
    lato: 'Lato, sans-serif',
    liberationSans: 'Liberation Sans, Arial, sans-serif',
    cormorant: 'Cormorant Garamond, serif',
    jost: 'Jost, sans-serif',
  };

  const fontFamily = fontMap[family] || fontMap.lato;
  
  // Return font with weight
  return fontFamily;
};