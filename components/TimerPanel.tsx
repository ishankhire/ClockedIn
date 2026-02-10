"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  const countdownInputRef = useRef<{ hours: string; minutes: string }>({ hours: "", minutes: "" });
  const manualInputRef = useRef<{ hours: string; minutes: string }>({ hours: "", minutes: "" });

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

  const handleCountdownFinish = useCallback(() => {
    const finalMs = timer.stop();
    if (finalMs > 0) {
      const now = new Date().toISOString();
      onSessionComplete({
        id: generateId(),
        type: "countdown",
        durationMs: finalMs,
        startedAt: now,
        endedAt: now,
      });
    }
    timer.reset();
  }, [timer, onSessionComplete]);

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

  // Global timer shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey || !e.shiftKey) return;

      // cmd+shift+. to start stopwatch
      if (e.key === ".") {
        e.preventDefault();
        if (!timerActive) {
          setActiveTab("stopwatch");
          setTimeout(() => timer.startStopwatch(), 0);
        }
      }
      // cmd+shift+L to start 30 minute countdown
      else if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        if (!timerActive) {
          setActiveTab("countdown");
          setTimeout(() => timer.startCountdown(30 * 60 * 1000), 0);
        }
      }
      // cmd+shift+J to start 1 hour countdown
      else if (e.key.toLowerCase() === "j") {
        e.preventDefault();
        if (!timerActive) {
          setActiveTab("countdown");
          setTimeout(() => timer.startCountdown(60 * 60 * 1000), 0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [timerActive, timer]);

  // cmd+enter multi-purpose shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "Enter") {
        e.preventDefault();

        if (activeTab === "stopwatch") {
          if (!timer.mode) {
            timer.startStopwatch();
          } else if (timer.running) {
            handleStopwatchStop();
          }
        } else if (activeTab === "countdown") {
          if (!timer.mode) {
            // Start countdown if valid input
            const { hours, minutes } = countdownInputRef.current;
            const h = parseInt(hours) || 0;
            const m = parseInt(minutes) || 0;
            if (h > 0 || m > 0) {
              timer.startCountdown((h * 3600 + m * 60) * 1000);
            }
          } else if (timer.mode === "countdown") {
            // Finish countdown
            handleCountdownFinish();
          }
        } else if (activeTab === "manual") {
          // Add manual time if valid input
          const { hours, minutes } = manualInputRef.current;
          const h = parseInt(hours) || 0;
          const m = parseInt(minutes) || 0;
          if (h > 0 || m > 0) {
            handleManualAdd((h * 3600 + m * 60) * 1000);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, timer, handleStopwatchStop, handleCountdownFinish, handleManualAdd]);

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
          onFinish={handleCountdownFinish}
          inputRef={countdownInputRef}
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
          onCancel={timer.reset}
        />
      )}

      {activeTab === "manual" && (
        <ManualEntry onAdd={handleManualAdd} inputRef={manualInputRef} />
      )}
    </div>
  );
}
