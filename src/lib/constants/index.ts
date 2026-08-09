// src/lib/utils/constants/index.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind classes properly
 * @param inputs - Class names to combine
 * @returns Merged class string
 * 
 * @example
 * cn('px-2 py-1', 'bg-red-500', 'px-4') // => 'py-1 bg-red-500 px-4'
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// You can also export other utilities here if needed
export { clsx, twMerge };