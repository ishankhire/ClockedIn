"use client";

import { useState, useCallback } from "react";
import { Session, TaskLine as TaskLineType, DailyLog } from "@/lib/types";
import { getTodayKey, generateId } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { playChime } from "@/lib/sound";
import Header from "@/components/Header";
import DailySummary from "@/components/DailySummary";
import TimerPanel from "@/components/TimerPanel";
import TaskEditor from "@/components/TaskEditor";

export default function Home() {
  const [sessions, setSessions, sessionsLoaded] = useLocalStorage<DailyLog>(
    "clockedin-sessions",
    {}
  );
  const [tasks, setTasks, tasksLoaded] = useLocalStorage<TaskLineType[]>(
    "clockedin-tasks",
    [{ id: generateId(), text: "", isCheckbox: false, checked: false }]
  );
  const [flash, setFlash] = useState(false);

  const todayKey = getTodayKey();
  const todaySessions = sessions[todayKey] || [];

  const handleSessionComplete = useCallback(
    (session: Session) => {
      setSessions((prev) => {
        const key = todayKey;
        const existing = prev[key] || [];
        return { ...prev, [key]: [...existing, session] };
      });
    },
    [setSessions, todayKey]
  );

  const handleCountdownComplete = useCallback(() => {
    playChime();
    setFlash(true);
    setTimeout(() => setFlash(false), 1000);
  }, []);

  const handleTasksChange = useCallback(
    (newTasks: TaskLineType[]) => {
      setTasks(newTasks);
    },
    [setTasks]
  );

  const handleUpdateSession = useCallback(
    (sessionId: string, durationMs: number) => {
      setSessions((prev) => {
        const key = todayKey;
        const existing = prev[key] || [];
        const updated = existing.map((s) =>
          s.id === sessionId ? { ...s, durationMs } : s
        );
        return { ...prev, [key]: updated };
      });
    },
    [setSessions, todayKey]
  );

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        const key = todayKey;
        const existing = prev[key] || [];
        const updated = existing.filter((s) => s.id !== sessionId);
        return { ...prev, [key]: updated };
      });
    },
    [setSessions, todayKey]
  );

  const isReady = sessionsLoaded && tasksLoaded;

  if (!isReady) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm h-48 animate-pulse" />
              <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm h-64 animate-pulse" />
            </div>
            <div className="rounded-2xl border border-border bg-bg-surface shadow-sm h-[500px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-bg-primary transition-colors duration-300 ${
        flash ? "bg-accent/10" : ""
      }`}
    >
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:h-[calc(100vh-100px)]">
          <div className="space-y-6">
            <DailySummary
              sessions={todaySessions}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
            />
            <TimerPanel
              onSessionComplete={handleSessionComplete}
              onCountdownComplete={handleCountdownComplete}
            />
          </div>
          <div className="min-h-[400px] lg:min-h-0">
            <TaskEditor tasks={tasks} onChange={handleTasksChange} />
          </div>
        </div>
      </main>
    </div>
  );
}
