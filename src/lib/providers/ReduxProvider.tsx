"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { makeStore, type AppStore } from "@/lib/redux/store";

export function ReduxProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();
  const store = storeRef.current;
  useEffect(() => {
    const cleanup = setupListeners(store.dispatch);
    return () => {
      cleanup();
    };
  }, [store]);
  return <Provider store={store}>{children}</Provider>;
}
