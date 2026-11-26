"use client";

import { useEffect, useState } from "react";

/** Debounce a value, optionally allowing an explicit immediate reset. */
export function useDebouncedState<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return [debounced, setDebounced] as const;
}

export function useDebounce<T>(value: T, delay = 300): T {
  return useDebouncedState(value, delay)[0];
}
