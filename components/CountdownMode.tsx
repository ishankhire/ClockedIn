"use client";

import { useState, useEffect, MutableRefObject } from "react";
import { formatTime } from "@/lib/utils";
import { COUNTDOWN_PRESETS } from "@/lib/constants";

interface CountdownModeProps {
  remainingMs: number | null;
  running: boolean;
  hasStarted: boolean;
  onStart: (durationMs: number) => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onFinish: () => void;
  inputRef?: MutableRefObject<{ hours: string; minutes: string }>;
}

export default function CountdownMode({
  remainingMs,
  running,
  hasStarted,
  onStart,
  onPause,
  onResume,
  onCancel,
  onFinish,
  inputRef,
}: CountdownModeProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  // Expose input values via ref
  useEffect(() => {
    if (inputRef) {
      inputRef.current = { hours, minutes };
    }
  }, [hours, minutes, inputRef]);

  const handleStart = (ms?: number) => {
    if (ms) {
      onStart(ms);
      return;
    }
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    if (h === 0 && m === 0) return;
    onStart((h * 3600 + m * 60) * 1000);
    setHours("");
    setMinutes("");
  };

  // Timer is active (started)
  if (hasStarted && remainingMs !== null) {
    return (
      <div className="space-y-6">
        <p className="text-5xl font-bold font-mono tabular-nums text-center text-text-primary">
          {formatTime(remainingMs)}
        </p>

        <div className="flex gap-3">
          {running ? (
            <>
              <button
                onClick={onPause}
                className="flex-1 h-12 rounded-xl bg-bg-accent text-text-primary font-semibold hover:bg-border transition-colors"
              >
                Pause
              </button>
              <button
                onClick={onFinish}
                className="flex-1 h-12 rounded-xl bg-success text-white font-semibold hover:opacity-90 transition-colors"
              >
                Finish
              </button>
              <button
                onClick={onCancel}
                className="flex-1 h-12 rounded-xl bg-danger/10 text-danger font-semibold hover:bg-danger/20 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onResume}
                className="flex-1 h-12 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
              >
                Resume
              </button>
              <button
                onClick={onFinish}
                className="flex-1 h-12 rounded-xl bg-success text-white font-semibold hover:opacity-90 transition-colors"
              >
                Finish
              </button>
              <button
                onClick={onCancel}
                className="flex-1 h-12 rounded-xl bg-danger/10 text-danger font-semibold hover:bg-danger/20 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {COUNTDOWN_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleStart(preset.ms)}
            className="px-4 h-9 rounded-xl bg-bg-accent text-text-primary text-sm font-semibold hover:bg-border transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="23"
            placeholder="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-16 h-10 rounded-xl border border-border bg-bg-primary text-center text-lg font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <span className="text-sm text-text-secondary">hr</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-16 h-10 rounded-xl border border-border bg-bg-primary text-center text-lg font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <span className="text-sm text-text-secondary">min</span>
        </div>
      </div>

      <button
        onClick={() => handleStart()}
        disabled={!hours && !minutes}
        className="w-full h-10 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start Timer
      </button>
    </div>
  );
}
