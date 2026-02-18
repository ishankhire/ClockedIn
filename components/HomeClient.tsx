"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Session, TaskLine as TaskLineType, DailyLog } from "@/lib/types";
import { getTodayKey, generateId } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { loadUserData, saveUserData } from "@/lib/firestore";
import { playChime } from "@/lib/sound";
import Header from "@/components/Header";
import DailySummary from "@/components/DailySummary";
import TimerPanel from "@/components/TimerPanel";
import TaskEditor from "@/components/TaskEditor";
import MotivationalBanner from "@/components/MotivationalBanner";

export default function HomeClient() {
  const [sessions, setSessions, sessionsLoaded] = useLocalStorage<DailyLog>(
    "clockedin-sessions",
    {}
  );
  const [tasks, setTasks, tasksLoaded] = useLocalStorage<TaskLineType[]>(
    "clockedin-tasks",
    [{ id: generateId(), text: "", isCheckbox: false, checked: false }]
  );
  const [flash, setFlash] = useState(false);
  const [showTaskList, setShowTaskList] = useState(true);

  const { user, authLoading, signIn, signOut } = useAuth();

  // Prevents the auto-save effects from firing while we're loading from Firestore
  const syncingFromRemote = useRef(false);

  // When a user signs in, load their data from Firestore and hydrate local state
  useEffect(() => {
    if (!user) return;

    syncingFromRemote.current = true;
    loadUserData(user.uid).then((data) => {
      if (data?.sessions && Object.keys(data.sessions).length > 0) {
        setSessions(data.sessions);
      }
      if (data?.tasks && data.tasks.length > 0) {
        setTasks(data.tasks);
      }
      // Let React settle the state updates before re-enabling auto-save
      setTimeout(() => {
        syncingFromRemote.current = false;
      }, 500);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Auto-save sessions to Firestore (1.5 s debounce)
  useEffect(() => {
    if (!user || !sessionsLoaded || syncingFromRemote.current) return;
    const t = setTimeout(() => {
      if (!syncingFromRemote.current) {
        saveUserData(user.uid, { sessions });
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [sessions, user, sessionsLoaded]);

  // Auto-save tasks to Firestore (1.5 s debounce)
  useEffect(() => {
    if (!user || !tasksLoaded || syncingFromRemote.current) return;
    const t = setTimeout(() => {
      if (!syncingFromRemote.current) {
        saveUserData(user.uid, { tasks });
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [tasks, user, tasksLoaded]);

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

  // cmd+shift+U to toggle task list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        setShowTaskList((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isReady = sessionsLoaded && tasksLoaded;

  const bg = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        backgroundImage: "url('/spiderman-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        filter: "saturate(0.6)",
      }}
    />
  );

  if (!isReady) {
    return (
      <div className="min-h-screen">
        {bg}
        <Header
          user={user}
          authLoading={authLoading}
          onSignIn={signIn}
          onSignOut={signOut}
        />
        <MotivationalBanner />
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
      className={`min-h-screen transition-colors duration-300 ${
        flash ? "bg-accent/10" : ""
      }`}
    >
      {bg}
      <Header
        user={user}
        authLoading={authLoading}
        onSignIn={signIn}
        onSignOut={signOut}
      />
      <MotivationalBanner />
      <main className="max-w-6xl mx-auto px-6 py-4">
        <div className={`grid grid-cols-1 ${showTaskList ? 'lg:grid-cols-[1.2fr_1fr]' : ''} gap-6 lg:h-[calc(100vh-100px)]`}>
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
          {showTaskList && (
            <div className="min-h-[400px] lg:min-h-0">
              <TaskEditor tasks={tasks} onChange={handleTasksChange} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
