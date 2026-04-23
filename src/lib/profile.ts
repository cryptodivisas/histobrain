// Persistent player profile stored in localStorage.

import type { Category } from "./categories";

const KEY = "hb_profile_v1";

export interface Profile {
  gamesPlayed: number;
  totalCorrect: number;
  totalAnswered: number;
  bestScore: number;
  bestCombo: number;
  endlessBest: number;
  fastestAnswerMs: number | null;
  seenCategories: Category[];
  dailiesCompleted: string[]; // YYYY-MM-DD list
  unlockedAchievements: string[];
  perfectRuns: number;
  dailyStreak: number;
  bestDailyStreak: number;
  lastDailyKey: string | null;
}

const DEFAULT_PROFILE: Profile = {
  gamesPlayed: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  bestScore: 0,
  bestCombo: 0,
  endlessBest: 0,
  fastestAnswerMs: null,
  seenCategories: [],
  dailiesCompleted: [],
  unlockedAchievements: [],
  perfectRuns: 0,
  dailyStreak: 0,
  bestDailyStreak: 0,
  lastDailyKey: null,
};

export function loadProfile(): Profile {
  if (typeof window === "undefined") return { ...DEFAULT_PROFILE };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore quota
  }
}

export function updateProfile(mutator: (p: Profile) => Profile): Profile {
  const current = loadProfile();
  const next = mutator(current);
  saveProfile(next);
  return next;
}

export function resetProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function accuracyPct(p: Profile): number {
  if (p.totalAnswered === 0) return 0;
  return Math.round((p.totalCorrect / p.totalAnswered) * 100);
}

export function updateDailyStreak(p: Profile, todayKey: string): Profile {
  if (p.lastDailyKey === todayKey) return p; // already counted today
  const yesterday = prevDayKey(todayKey);
  const newStreak = p.lastDailyKey === yesterday ? p.dailyStreak + 1 : 1;
  return {
    ...p,
    dailyStreak: newStreak,
    bestDailyStreak: Math.max(p.bestDailyStreak, newStreak),
    lastDailyKey: todayKey,
  };
}

function prevDayKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function rankFromXp(p: Profile): { name: string; color: string } {
  const xp = p.totalCorrect;
  if (xp >= 150) return { name: "ORACLE", color: "var(--hb-accent-3)" };
  if (xp >= 75) return { name: "PROFESSOR", color: "var(--hb-accent-4)" };
  if (xp >= 30) return { name: "HISTORIAN", color: "var(--hb-accent-2)" };
  if (xp >= 10) return { name: "SCHOLAR", color: "var(--hb-accent)" };
  return { name: "NOVICE", color: "var(--hb-muted)" };
}
