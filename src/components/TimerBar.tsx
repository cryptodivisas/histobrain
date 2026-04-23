"use client";

interface Props {
  progress: number; // 0..1, 1 = full time remaining
  active: boolean;
}

export default function TimerBar({ progress, active }: Props) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  const danger = progress < 0.25;
  const warn = progress < 0.5 && progress >= 0.25;
  const color = danger ? "#ff3860" : warn ? "#ffcc00" : "#00ffa3";

  return (
    <div className="w-full h-2 bg-[#0f0f1a] border-2 border-[#2d2d44] relative overflow-hidden">
      <div
        className={`h-full transition-[width] duration-100 ease-linear ${
          danger && active ? "timer-pulse" : ""
        }`}
        style={{
          width: `${pct}%`,
          background: color,
          boxShadow: active ? `0 0 10px ${color}` : "none",
        }}
      />
    </div>
  );
}
