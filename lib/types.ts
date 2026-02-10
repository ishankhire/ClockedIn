export type SessionType = "countdown" | "stopwatch" | "manual";

export interface Session {
  id: string;
  type: SessionType;
  durationMs: number;
  startedAt: string;
  endedAt: string;
}

export type DailyLog = Record<string, Session[]>;

export interface TimerState {
  mode: "countdown" | "stopwatch" | null;
  running: boolean;
  startTimestamp: number | null;
  accumulated: number;
  countdownTarget: number | null;
}

export interface TaskLine {
  id: string;
  text: string;
  isCheckbox: boolean;
  checked: boolean;
}

export type TimerMode = "countdown" | "stopwatch" | "manual";
