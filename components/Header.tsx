"use client";

export default function Header() {
  const today = new Date();
  const formatted = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="flex items-center justify-between px-8 py-5">
      <h1 className="text-2xl font-bold text-text-primary tracking-tight">
        ClockedIn
      </h1>
      <span className="text-sm font-medium text-text-secondary">{formatted}</span>
    </header>
  );
}
