"use client";

import { useState } from "react";

interface ManualEntryProps {
  onAdd: (durationMs: number) => void;
}

export default function ManualEntry({ onAdd }: ManualEntryProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const handleAdd = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    if (h === 0 && m === 0) return;
    const ms = (h * 3600 + m * 60) * 1000;
    onAdd(ms);
    setHours("");
    setMinutes("");
  };

  return (
    <div className="space-y-4">
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
        onClick={handleAdd}
        disabled={!hours && !minutes}
        className="w-full h-10 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Add Time
      </button>
    </div>
  );
}
