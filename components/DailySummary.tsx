"use client";

import { useState } from "react";
import { Session } from "@/lib/types";
import { formatTime, formatDuration } from "@/lib/utils";

interface DailySummaryProps {
  sessions: Session[];
  onUpdateSession?: (sessionId: string, durationMs: number) => void;
  onDeleteSession?: (sessionId: string) => void;
}

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  countdown: { label: "countdown", className: "bg-blue-100 text-blue-700" },
  stopwatch: { label: "stopwatch", className: "bg-green-100 text-green-700" },
  manual: { label: "manual", className: "bg-stone-100 text-stone-600" },
};

export default function DailySummary({
  sessions,
  onUpdateSession,
  onDeleteSession,
}: DailySummaryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMinutes, setEditMinutes] = useState<string>("");

  const totalMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);

  const handleEditClick = (session: Session) => {
    setEditingId(session.id);
    setEditMinutes(Math.round(session.durationMs / 60000).toString());
  };

  const handleSaveEdit = (sessionId: string) => {
    const minutes = parseInt(editMinutes);
    if (!isNaN(minutes) && minutes > 0 && onUpdateSession) {
      onUpdateSession(sessionId, minutes * 60000);
    }
    setEditingId(null);
    setEditMinutes("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditMinutes("");
  };

  const handleDelete = (sessionId: string) => {
    if (onDeleteSession) {
      onDeleteSession(sessionId);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Today
      </h2>
      <p className="text-5xl font-bold tabular-nums text-text-primary mb-5">
        {formatTime(totalMs)}
      </p>

      {sessions.length > 0 ? (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {sessions.map((session) => {
            const badge = TYPE_BADGES[session.type];
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                className="flex items-center justify-between text-sm group gap-2"
              >
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editMinutes}
                        onChange={(e) => setEditMinutes(e.target.value)}
                        className="w-16 h-7 px-2 rounded border border-border bg-bg-primary text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                        placeholder="min"
                        autoFocus
                      />
                      <span className="text-xs text-text-secondary">min</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSaveEdit(session.id)}
                        className="text-xs px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs px-2 py-1 rounded bg-bg-accent text-text-secondary hover:bg-border transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-text-primary font-medium">
                      {formatDuration(session.durationMs)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(session)}
                          className="text-xs px-1.5 py-0.5 rounded text-text-secondary hover:text-text-primary hover:bg-bg-accent transition-colors"
                          title="Edit duration"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="text-xs px-1.5 py-0.5 rounded text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Delete session"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">No sessions yet today</p>
      )}
    </div>
  );
}
