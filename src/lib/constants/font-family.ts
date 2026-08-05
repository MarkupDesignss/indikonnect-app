export const FONT_FAMILY = {
    lato: {
      100: "'Lato', sans-serif",
      200: "'Lato', sans-serif",
      300: "'Lato', sans-serif",
      400: "'Lato', sans-serif",
      500: "'Lato', sans-serif",
      600: "'Lato', sans-serif",
      700: "'Lato', sans-serif",
      800: "'Lato', sans-serif",
      900: "'Lato', sans-serif",
    },
  
    arimo: {
      100: "'Arimo', sans-serif",
      200: "'Arimo', sans-serif",
      300: "'Arimo', sans-serif",
      400: "'Arimo', sans-serif",
      500: "'Arimo', sans-serif",
      600: "'Arimo', sans-serif",
      700: "'Arimo', sans-serif",
      800: "'Arimo', sans-serif",
      900: "'Arimo', sans-serif",
    },
  
    liberationSans: {
      100: "'Liberation Sans', sans-serif",
      200: "'Liberation Sans', sans-serif",
      300: "'Liberation Sans', sans-serif",
      400: "'Liberation Sans', sans-serif",
      500: "'Liberation Sans', sans-serif",
      600: "'Liberation Sans', sans-serif",
      700: "'Liberation Sans', sans-serif",
      800: "'Liberation Sans', sans-serif",
      900: "'Liberation Sans', sans-serif",
    },
  } as const;
  
  export type FontName = keyof typeof FONT_FAMILY;
  export type FontWeight = keyof typeof FONT_FAMILY.lato;
  
  export function getFont(
    font: FontName,
    weight: FontWeight = 400
  ): string {
    return FONT_FAMILY[font][weight];
  }
  
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