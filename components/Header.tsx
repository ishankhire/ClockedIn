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
      <h1 className="text-2xl font-bold text-white tracking-tight [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">
        Lock Innnnnnn
      </h1>
      <span className="text-sm font-medium text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">{formatted}</span>
    </header>
  );
}
