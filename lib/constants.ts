export const STORAGE_KEYS = {
  SESSIONS: "clockedin-sessions",
  TIMER: "clockedin-timer",
  TASKS: "clockedin-tasks",
} as const;

export const DEFAULT_TIMER_STATE = {
  mode: null,
  running: false,
  startTimestamp: null,
  accumulated: 0,
  countdownTarget: null,
} as const;

export const COUNTDOWN_PRESETS = [
  { label: "10m", ms: 10 * 60 * 1000 },
  { label: "20m", ms: 20 * 60 * 1000 },
  { label: "30m", ms: 30 * 60 * 1000 },
  { label: "1h", ms: 60 * 60 * 1000 },
  { label: "1.5h", ms: 90 * 60 * 1000 },
] as const;
