export const COLORS = {
  brand: {
    navy: '#0A2240',
    gold: '#FFC72C',
    goldLight: '#FFD44D',
    goldDark: '#E6B320',
  },
  primary: {
    50: '#E8EEF5',
    100: '#D1DDEB',
    200: '#A3BBD7',
    300: '#7599C3',
    400: '#4777AF',
    500: '#1A559B',
    600: '#15447C',
    700: '#10335D',
    800: '#0A2240',
    900: '#051120',
  },
  secondary: {
    50: '#FFF9E6',
    100: '#FFF3CC',
    200: '#FFE799',
    300: '#FFDB66',
    400: '#FFCF33',
    500: '#FFC72C',
    600: '#E6B320',
    700: '#CC9F1A',
    800: '#B38B14',
    900: '#99770E',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  semantic: {
    success: {
      DEFAULT: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      DEFAULT: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      DEFAULT: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      DEFAULT: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
  },
} as const;

export type BrandColor = keyof typeof COLORS.brand;
export type PrimaryShade = keyof typeof COLORS.primary;
export type SecondaryShade = keyof typeof COLORS.secondary;
export type NeutralShade = keyof typeof COLORS.neutral;

// Helper function to get color values
export function getColor(colorPath: string): string {
  const parts = colorPath.split('.');
  let value: any = COLORS;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return colorPath;
    }
  }
  
  return typeof value === 'string' ? value : colorPath;
}

// Color palette metadata for documentation
export const COLOR_METADATA = {
  brand: {
    navy: {
      description: 'Primary dark blue - used for backgrounds and text',
      usage: ['Primary backgrounds', 'Main text color', 'Footer', 'Header'],
    },
    gold: {
      description: 'Primary gold - used for accents and CTAs',
      usage: ['Buttons', 'Links', 'Icons', 'Accents', 'Highlighting'],
    },
  },
} as const;