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
    if (phrases.length <= 1) return;
    const id = setInterval(rotate, ROTATION_INTERVAL);
    return () => clearInterval(id);
  }, [rotate]);

  if (phrases.length === 0) return null;

  const phrase = phrases[index];

  return (
    <div className="px-8 py-3 text-center">
      <p
        className={`${getFontSize(phrase)} font-semibold italic text-text-primary transition-opacity duration-400 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        &ldquo;{phrase}&rdquo;
      </p>
    </div>
  );
}
