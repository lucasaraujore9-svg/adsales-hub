"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "adsales:sidebar-collapsed";

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setCollapsed(stored === "1");
    } catch {
      // ignore storage errors (SSR, disabled cookies)
    }
  }, []);

  const persist = useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      persist(next);
      return next;
    });
  }, [persist]);

  const collapse = useCallback(() => {
    setCollapsed(true);
    persist(true);
  }, [persist]);

  const expand = useCallback(() => {
    setCollapsed(false);
    persist(false);
  }, [persist]);

  return { collapsed, toggle, collapse, expand };
}
