"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (val: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors, use initial value
    }
    setIsLoaded(true);
  }, [key]);

  const setAndPersist = useCallback(
    (newVal: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof newVal === "function"
            ? (newVal as (p: T) => T)(prev)
            : newVal;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Ignore storage errors
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, setAndPersist, isLoaded];
}
