"use client";

import { useCallback, useEffect, useRef } from "react";

/** Owns blob URLs for the lifetime of a client component. */
export function useObjectUrlRegistry() {
  const urls = useRef(new Set<string>());
  const createObjectUrl = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    return url;
  }, []);
  const revokeObjectUrl = useCallback((url: string) => {
    if (urls.current.delete(url)) URL.revokeObjectURL(url);
  }, []);
  useEffect(() => {
    const owned = urls.current;
    return () => {
      for (const url of owned) URL.revokeObjectURL(url);
      owned.clear();
    };
  }, []);
  return { createObjectUrl, revokeObjectUrl };
}
