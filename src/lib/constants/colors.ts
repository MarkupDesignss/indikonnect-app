// lib/constants/colors.ts

export const COLORS = {
  brand: {
    gold: '#FFC72C',
    blue: '#003DA5',
    darkBlue: '#0A2240',
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
} as const;

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