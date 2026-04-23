"use client";

import { useMemo } from "react";
import { accuracyPct, rankFromXp, type Profile } from "@/lib/profile";
import { ACHIEVEMENTS } from "@/lib/achievements";

interface Props {
  profile: Profile;
}

export default function StatsPanel({ profile }: Props) {
  const rank = useMemo(() => rankFromXp(profile), [profile]);
  const acc = accuracyPct(profile);
  const unlocked = profile.unlockedAchievements.length;
  const total = ACHIEVEMENTS.length;
  const hf = "var(--font-pixel-heading), monospace";

  return (
    <div className="bg-[var(--hb-panel)] pixel-border p-6 w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span
          className="text-[var(--hb-accent)] text-sm tracking-widest"
          style={{ fontFamily: hf }}
        >
          &gt; PLAYER
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--hb-muted)] tracking-widest uppercase">
            Rank
          </span>
          <span
            className="text-sm tracking-widest"
            style={{ fontFamily: hf, color: rank.color }}
          >
            {rank.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Games" value={profile.gamesPlayed} color="var(--hb-accent)" />
        <Stat label="Accuracy" value={`${acc}%`} color="var(--hb-accent-2)" />
        <Stat
          label="Best Score"
          value={profile.bestScore}
          color="var(--hb-accent-3)"
        />
        <Stat
          label="Best Combo"
          value={`x${profile.bestCombo}`}
          color="var(--hb-accent-4)"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat
          label="Endless"
          value={profile.endlessBest > 0 ? `R${profile.endlessBest}` : "—"}
          color="var(--hb-accent-4)"
        />
        <Stat
          label="Fastest"
          value={
            profile.fastestAnswerMs !== null
              ? `${(profile.fastestAnswerMs / 1000).toFixed(1)}s`
              : "—"
          }
          color="var(--hb-accent)"
        />
        <Stat
          label="Trophies"
          value={`${unlocked}/${total}`}
          color="var(--hb-accent-2)"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-[var(--hb-bg)] p-3 flex flex-col gap-1">
      <span className="text-[10px] text-[var(--hb-muted)] tracking-widest uppercase">
        {label}
      </span>
      <span
        className="text-lg"
        style={{
          color,
          fontFamily: "var(--font-pixel-heading), monospace",
        }}
      >
        {value}
      </span>
    </div>
  );
}
