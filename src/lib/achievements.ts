// Achievement definitions + evaluation logic.

import type { Profile } from "./profile";
import { CATEGORIES } from "./categories";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // short pixel-style glyph
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_blood",
    title: "FIRST BLOOD",
    description: "Get your very first correct answer",
    icon: "*",
  },
  {
    id: "flawless",
    title: "FLAWLESS VICTORY",
    description: "Finish a Classic run with 5/5",
    icon: "+",
  },
  {
    id: "combo_3",
    title: "ON FIRE",
    description: "Hit a 3-answer streak",
    icon: "<",
  },
  {
    id: "combo_5",
    title: "UNSTOPPABLE",
    description: "Hit a 5-answer streak",
    icon: "@",
  },
  {
    id: "speed_demon",
    title: "SPEED DEMON",
    description: "Answer a question in under 3 seconds",
    icon: ">",
  },
  {
    id: "dedicated",
    title: "DEDICATED",
    description: "Play 5 games",
    icon: "#",
  },
  {
    id: "high_scorer",
    title: "HIGH SCORER",
    description: "Score over 2000 in a single game",
    icon: "$",
  },
  {
    id: "marathon",
    title: "MARATHON RUNNER",
    description: "Survive 10 rounds in Endless",
    icon: "%",
  },
  {
    id: "daily_done",
    title: "DAILY CALLER",
    description: "Complete your first Daily Challenge",
    icon: "!",
  },
  {
    id: "polyglot",
    title: "POLYGLOT",
    description: "Correctly answer at least one from every category",
    icon: "&",
  },
];

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// Event context passed to evaluator
export interface GameEvent {
  type:
    | "correct"
    | "wrong"
    | "gameEnd"
    | "endlessRoundReached"
    | "dailyCompleted";
  combo?: number;
  answerMs?: number;
  score?: number;
  perfect?: boolean;
  endlessRound?: number;
  profile: Profile;
}

export function evaluateUnlocks(ev: GameEvent): string[] {
  const unlocked = new Set(ev.profile.unlockedAchievements);
  const newly: string[] = [];
  const unlock = (id: string) => {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      newly.push(id);
    }
  };

  if (ev.type === "correct") {
    if (ev.profile.totalCorrect >= 1) unlock("first_blood");
    if ((ev.combo ?? 0) >= 3) unlock("combo_3");
    if ((ev.combo ?? 0) >= 5) unlock("combo_5");
    if ((ev.answerMs ?? Infinity) < 3000) unlock("speed_demon");
    if (CATEGORIES.every((c) => ev.profile.seenCategories.includes(c))) {
      unlock("polyglot");
    }
  }

  if (ev.type === "gameEnd") {
    if (ev.profile.gamesPlayed >= 5) unlock("dedicated");
    if ((ev.score ?? 0) >= 2000) unlock("high_scorer");
    if (ev.perfect) unlock("flawless");
  }

  if (ev.type === "endlessRoundReached") {
    if ((ev.endlessRound ?? 0) >= 10) unlock("marathon");
  }

  if (ev.type === "dailyCompleted") {
    unlock("daily_done");
  }

  return newly;
}
