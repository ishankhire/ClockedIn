"use client";

import { User } from "firebase/auth";
import AuthButton from "@/components/AuthButton";

interface HeaderProps {
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Header({
  user,
  authLoading,
  onSignIn,
  onSignOut,
}: HeaderProps) {
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
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">
          {formatted}
        </span>
        <AuthButton
          user={user}
          authLoading={authLoading}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  );
}
