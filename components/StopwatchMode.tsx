"use client";

import { formatTime } from "@/lib/utils";

interface StopwatchModeProps {
  elapsedMs: number;
  running: boolean;
  hasStarted: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function StopwatchMode({
  elapsedMs,
  running,
  hasStarted,
  onStart,
  onPause,
  onResume,
  onStop,
}: StopwatchModeProps) {
  return (
    <div className="space-y-6">
      <p className="text-5xl font-bold font-mono tabular-nums text-center text-text-primary">
        {formatTime(elapsedMs)}
      </p>

      <div className="flex gap-3">
        {!hasStarted ? (
          <button
            onClick={onStart}
            className="flex-1 h-12 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
          >
            Start
          </button>
        ) : running ? (
          <>
            <button
              onClick={onPause}
              className="flex-1 h-12 rounded-xl bg-bg-accent text-text-primary font-semibold hover:bg-border transition-colors"
            >
              Pause
            </button>
            <button
              onClick={onStop}
              className="flex-1 h-12 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
            >
              Finish
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
              onClick={onStop}
              className="flex-1 h-12 rounded-xl bg-success text-white font-semibold hover:opacity-90 transition-colors"
            >
              Finish
            </button>
          </>
        )}
      </div>
    </div>
  );
}
