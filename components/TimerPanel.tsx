"use client";

import { useState, useCallback } from "react";
import { TimerMode, Session } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import CountdownMode from "./CountdownMode";
import StopwatchMode from "./StopwatchMode";
import ManualEntry from "./ManualEntry";

interface TimerPanelProps {
  onSessionComplete: (session: Session) => void;
  onCountdownComplete?: () => void;
}

const TABS: { key: TimerMode; label: string }[] = [
  { key: "countdown", label: "Countdown" },
  { key: "stopwatch", label: "Stopwatch" },
  { key: "manual", label: "Manual" },
];

export default function TimerPanel({
  onSessionComplete,
  onCountdownComplete,
}: TimerPanelProps) {
  const [activeTab, setActiveTab] = useState<TimerMode>("countdown");

  const handleCountdownDone = useCallback(
    (elapsedMs: number) => {
      const now = new Date().toISOString();
      onSessionComplete({
        id: generateId(),
        type: "countdown",
        durationMs: elapsedMs,
        startedAt: now,
        endedAt: now,
      });
      onCountdownComplete?.();
    },
    [onSessionComplete, onCountdownComplete]
  );

  const timer = useTimer(handleCountdownDone);

  const timerActive = timer.mode !== null && (timer.running || timer.elapsedMs > 0);

  const handleStopwatchStop = () => {
    const finalMs = timer.stop();
    if (finalMs > 0) {
      const now = new Date().toISOString();
      onSessionComplete({
        id: generateId(),
        type: "stopwatch",
        durationMs: finalMs,
        startedAt: now,
        endedAt: now,
      });
    }
    timer.reset();
  };

  const handleManualAdd = (durationMs: number) => {
    const now = new Date().toISOString();
    onSessionComplete({
      id: generateId(),
      type: "manual",
      durationMs,
      startedAt: now,
      endedAt: now,
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
      <div className="flex gap-1 mb-6 bg-bg-accent rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              if (!timerActive) setActiveTab(tab.key);
            }}
            className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${
              activeTab === tab.key
                ? "bg-bg-surface text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            } ${timerActive && tab.key !== activeTab ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "countdown" && (
        <CountdownMode
          remainingMs={timer.remainingMs}
          running={timer.running}
          hasStarted={timer.mode === "countdown" && timer.elapsedMs > 0}
          onStart={(ms) => timer.startCountdown(ms)}
          onPause={timer.pause}
          onResume={timer.resume}
          onCancel={timer.reset}
        />
      )}

      {activeTab === "stopwatch" && (
        <StopwatchMode
          elapsedMs={timer.elapsedMs}
          running={timer.running}
          hasStarted={timer.mode === "stopwatch"}
          onStart={timer.startStopwatch}
          onPause={timer.pause}
          onResume={timer.resume}
          onStop={handleStopwatchStop}
        />
      )}

      {activeTab === "manual" && <ManualEntry onAdd={handleManualAdd} />}
    </div>
  );
}
