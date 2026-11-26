"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { makeStore } from "@/lib/redux/store";

export function ReduxProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  useEffect(() => {
    const cleanup = setupListeners(store.dispatch);
    return () => {
      cleanup();
    };
  }, [store]);
  return <Provider store={store}>{children}</Provider>;
}
