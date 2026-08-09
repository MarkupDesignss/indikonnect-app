// lib/constants/colors.ts

export const COLORS = {
  brand: {
    gold: '#F9C744',
    goldLight: '#FFF8E1',
    goldDark: '#E9AC3C',
    darkBlue: '#06101E',
    darkBlueLight: '#0A1A2E',
    white: '#FFFFFF',
    cream: '#F6F1E7',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  error: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

export type ColorKey = keyof typeof COLORS;
export type BrandColor = keyof typeof COLORS.brand;

export const getColor = (path: string): string => {
  const parts = path.split('.');
  let current: any = COLORS;

  for (const part of parts) {
    if (current && current[part] !== undefined) {
      current = current[part];
    } else {
      return '#000000';
    }
  }

  return current;
};

// Helper to get brand colors
export const getBrandColor = (key: BrandColor): string => {
  return COLORS.brand[key] || COLORS.brand.gold;
};

// Helper to get neutral colors
export const getNeutralColor = (key: keyof typeof COLORS.neutral): string => {
  return COLORS.neutral[key] || COLORS.neutral[500];
};