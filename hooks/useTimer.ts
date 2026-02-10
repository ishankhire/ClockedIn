"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { TimerState } from "@/lib/types";
import { STORAGE_KEYS, DEFAULT_TIMER_STATE } from "@/lib/constants";
import { formatTime } from "@/lib/utils";

interface UseTimerReturn {
  mode: "countdown" | "stopwatch" | null;
  running: boolean;
  elapsedMs: number;
  remainingMs: number | null;
  startCountdown: (durationMs: number) => void;
  startStopwatch: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => number;
  reset: () => void;
}

function loadTimerState(): TimerState {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TIMER);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ...DEFAULT_TIMER_STATE };
}

function saveTimerState(state: TimerState) {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(state));
  } catch {}
}

export function useTimer(onComplete?: (elapsedMs: number) => void): UseTimerReturn {
  const [mode, setMode] = useState<"countdown" | "stopwatch" | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [countdownTarget, setCountdownTarget] = useState<number | null>(null);

  const startTimestampRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  const originalTitleRef = useRef<string | null>(null);

  onCompleteRef.current = onComplete;

  const tick = useCallback(() => {
    if (startTimestampRef.current === null) return;
    const now = Date.now();
    const elapsed = accumulatedRef.current + (now - startTimestampRef.current);
    setElapsedMs(elapsed);
  }, []);

  // Recover timer state on mount
  useEffect(() => {
    const saved = loadTimerState();
    if (saved.mode && saved.running && saved.startTimestamp !== null) {
      const now = Date.now();
      const elapsed = saved.accumulated + (now - saved.startTimestamp);

      if (saved.mode === "countdown" && saved.countdownTarget !== null) {
        if (elapsed >= saved.countdownTarget) {
          // Countdown already expired while page was closed
          setMode(saved.mode);
          setCountdownTarget(saved.countdownTarget);
          setElapsedMs(saved.countdownTarget);
          accumulatedRef.current = saved.countdownTarget;
          saveTimerState({ ...DEFAULT_TIMER_STATE });
          // Signal completion
          setTimeout(() => onCompleteRef.current?.(saved.countdownTarget!), 0);
          return;
        }
      }

      setMode(saved.mode);
      setCountdownTarget(saved.countdownTarget);
      accumulatedRef.current = saved.accumulated;
      startTimestampRef.current = saved.startTimestamp;
      setElapsedMs(elapsed);
      setRunning(true);
    } else if (saved.mode && !saved.running) {
      // Paused state
      setMode(saved.mode);
      setCountdownTarget(saved.countdownTarget);
      accumulatedRef.current = saved.accumulated;
      setElapsedMs(saved.accumulated);
    }
  }, []);

  // Interval loop (more reliable than rAF for background tabs)
  useEffect(() => {
    if (running) {
      // Initial tick
      tick();
      // Update every 100ms for smooth display
      intervalRef.current = setInterval(tick, 100);
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, tick]);

  // Update document title with timer
  useEffect(() => {
    if (mode && (running || elapsedMs > 0)) {
      // Store original title on first timer start
      if (originalTitleRef.current === null) {
        originalTitleRef.current = document.title;
      }

      let titleText: string;
      if (mode === "countdown" && countdownTarget !== null) {
        const remaining = Math.max(0, countdownTarget - elapsedMs);
        titleText = `⏳ ${formatTime(remaining)}`;
      } else if (mode === "stopwatch") {
        titleText = `⏱️ ${formatTime(elapsedMs)}`;
      } else {
        titleText = originalTitleRef.current || "ClockIn";
      }
      document.title = titleText;
    } else {
      // Restore original title when timer is not active
      if (originalTitleRef.current !== null) {
        document.title = originalTitleRef.current;
        originalTitleRef.current = null;
      }
    }
  }, [mode, running, elapsedMs, countdownTarget]);

  // Check countdown completion
  useEffect(() => {
    if (
      running &&
      mode === "countdown" &&
      countdownTarget !== null &&
      elapsedMs >= countdownTarget &&
      !completedRef.current
    ) {
      completedRef.current = true;
      setRunning(false);
      startTimestampRef.current = null;
      saveTimerState({ ...DEFAULT_TIMER_STATE });
      onCompleteRef.current?.(countdownTarget);
      // Reset UI after brief "00:00:00" flash
      setElapsedMs(0);
      setMode(null);
      setCountdownTarget(null);
      accumulatedRef.current = 0;
    }
  }, [running, mode, countdownTarget, elapsedMs]);

  const startCountdown = useCallback((durationMs: number) => {
    const now = Date.now();
    completedRef.current = false;
    setMode("countdown");
    setCountdownTarget(durationMs);
    setRunning(true);
    setElapsedMs(0);
    accumulatedRef.current = 0;
    startTimestampRef.current = now;
    saveTimerState({
      mode: "countdown",
      running: true,
      startTimestamp: now,
      accumulated: 0,
      countdownTarget: durationMs,
    });
  }, []);

  const startStopwatch = useCallback(() => {
    const now = Date.now();
    completedRef.current = false;
    setMode("stopwatch");
    setCountdownTarget(null);
    setRunning(true);
    setElapsedMs(0);
    accumulatedRef.current = 0;
    startTimestampRef.current = now;
    saveTimerState({
      mode: "stopwatch",
      running: true,
      startTimestamp: now,
      accumulated: 0,
      countdownTarget: null,
    });
  }, []);

  const pause = useCallback(() => {
    if (startTimestampRef.current === null) return;
    const now = Date.now();
    const newAccumulated =
      accumulatedRef.current + (now - startTimestampRef.current);
    accumulatedRef.current = newAccumulated;
    startTimestampRef.current = null;
    setRunning(false);
    setElapsedMs(newAccumulated);
    saveTimerState({
      mode,
      running: false,
      startTimestamp: null,
      accumulated: newAccumulated,
      countdownTarget,
    });
  }, [mode, countdownTarget]);

  const resume = useCallback(() => {
    const now = Date.now();
    startTimestampRef.current = now;
    setRunning(true);
    saveTimerState({
      mode,
      running: true,
      startTimestamp: now,
      accumulated: accumulatedRef.current,
      countdownTarget,
    });
  }, [mode, countdownTarget]);

  const stop = useCallback((): number => {
    let finalElapsed = accumulatedRef.current;
    if (startTimestampRef.current !== null) {
      finalElapsed += Date.now() - startTimestampRef.current;
    }
    setRunning(false);
    startTimestampRef.current = null;
    saveTimerState({ ...DEFAULT_TIMER_STATE });
    return finalElapsed;
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsedMs(0);
    setMode(null);
    setCountdownTarget(null);
    accumulatedRef.current = 0;
    startTimestampRef.current = null;
    completedRef.current = false;
    saveTimerState({ ...DEFAULT_TIMER_STATE });
  }, []);

  const remainingMs =
    mode === "countdown" && countdownTarget !== null
      ? Math.max(0, countdownTarget - elapsedMs)
      : null;

  return {
    mode,
    running,
    elapsedMs,
    remainingMs,
    startCountdown,
    startStopwatch,
    pause,
    resume,
    stop,
    reset,
  };
}
