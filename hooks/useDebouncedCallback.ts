"use client";

import { useRef, useCallback } from "react";

export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delayMs: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delayMs);
    },
    [callback, delayMs]
  ) as T;
}
