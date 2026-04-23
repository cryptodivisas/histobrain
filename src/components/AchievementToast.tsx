"use client";

import { useEffect, useState } from "react";
import { achievementById } from "@/lib/achievements";

interface Props {
  queue: string[];
  onDismiss: (id: string) => void;
}

export default function AchievementToast({ queue, onDismiss }: Props) {
  const [current, setCurrent] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (current || queue.length === 0) return;
    setCurrent(queue[0]);
    setExiting(false);
  }, [queue, current]);

  useEffect(() => {
    if (!current) return;
    const stayTimer = setTimeout(() => setExiting(true), 3200);
    const endTimer = setTimeout(() => {
      onDismiss(current);
      setCurrent(null);
    }, 3700);
    return () => {
      clearTimeout(stayTimer);
      clearTimeout(endTimer);
    };
  }, [current, onDismiss]);

  if (!current) return null;
  const ach = achievementById(current);
  if (!ach) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 bg-[var(--hb-panel)] pixel-border-accent p-4 flex items-center gap-4 max-w-sm ${
        exiting ? "toast-exit" : "toast-enter"
      }`}
      role="status"
    >
      <div
        className="bg-[var(--hb-accent)] text-[var(--hb-bg)] w-14 h-14 flex items-center justify-center text-3xl shrink-0"
        style={{ fontFamily: "var(--font-pixel-heading), monospace" }}
      >
        {ach.icon}
      </div>
      <div className="flex flex-col gap-1">
        <span
          className="text-[10px] text-[var(--hb-accent-2)] tracking-widest"
          style={{ fontFamily: "var(--font-pixel-heading), monospace" }}
        >
          ACHIEVEMENT UNLOCKED
        </span>
        <span
          className="text-[var(--hb-accent)] text-sm tracking-widest"
          style={{ fontFamily: "var(--font-pixel-heading), monospace" }}
        >
          {ach.title}
        </span>
        <span className="text-[var(--hb-text)] text-sm leading-tight">
          {ach.description}
        </span>
      </div>
    </div>
  );
}
