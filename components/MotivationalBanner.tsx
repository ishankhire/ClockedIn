"use client";

import { useState, useEffect, useCallback } from "react";
import phrases from "@/lib/phrases";

const ROTATION_INTERVAL = 15_000;

function getFontSize(text: string): string {
  const len = text.length;
  if (len <= 15) return "text-6xl";
  if (len <= 30) return "text-4xl";
  if (len <= 50) return "text-3xl";
  return "text-xl";
}

export default function MotivationalBanner() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * phrases.length));
  }, []);

  const rotate = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
      setVisible(true);
    }, 400);
  }, []);

  useEffect(() => {
    if (!shown || phrases.length <= 1) return;
    const id = setInterval(rotate, ROTATION_INTERVAL);
    return () => clearInterval(id);
  }, [rotate, shown]);

  if (phrases.length === 0) return null;

  if (!shown) {
    return (
      <div className="px-8 py-3 text-center">
        <button
          onClick={() => setShown(true)}
          className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          title="Show phrases"
        >
          show phrases
        </button>
      </div>
    );
  }

  const phrase = phrases[index];

  return (
    <div className="px-8 py-3 text-center relative">
      <p
        className={`${getFontSize(phrase)} font-semibold italic text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.7)] transition-opacity duration-400 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        &ldquo;{phrase}&rdquo;
      </p>
      <button
        onClick={() => setShown(false)}
        className="absolute top-1/2 -translate-y-1/2 right-8 text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
        title="Hide phrases"
      >
        hide
      </button>
    </div>
  );
}
