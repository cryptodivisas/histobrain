// Theme definitions and unlock logic.

import type { Profile } from "./profile";

export type ThemeId = "synthwave" | "terminal" | "gameboy" | "sakura";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  unlockRank: number; // totalCorrect threshold
  unlockLabel: string;
  preview: {
    bg: string;
    panel: string;
    accent: string;
    text: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: "synthwave",
    name: "SYNTHWAVE",
    description: "Default neon-grid cyberpunk",
    unlockRank: 0,
    unlockLabel: "Default",
    preview: {
      bg: "#0f0f1a",
      panel: "#1a1a2e",
      accent: "#00ffa3",
      text: "#e8e8f0",
    },
  },
  {
    id: "terminal",
    name: "TERMINAL",
    description: "Pure monochrome CRT green",
    unlockRank: 0,
    unlockLabel: "Default",
    preview: {
      bg: "#000800",
      panel: "#001a00",
      accent: "#00ff00",
      text: "#33ff33",
    },
  },
  {
    id: "gameboy",
    name: "GAMEBOY",
    description: "4-shade olive handheld",
    unlockRank: 0,
    unlockLabel: "Default",
    preview: {
      bg: "#081820",
      panel: "#346856",
      accent: "#e0f8d0",
      text: "#ffffff",
    },
  },
  {
    id: "sakura",
    name: "SAKURA",
    description: "Cherry blossom / bubblegum pop",
    unlockRank: 0,
    unlockLabel: "Default",
    preview: {
      bg: "#fff0f5",
      panel: "#ffd6e7",
      accent: "#ff4d94",
      text: "#ffb347",
    },
  },
];

export function themeById(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function isThemeUnlocked(id: ThemeId, profile: Profile): boolean {
  const t = themeById(id);
  return profile.totalCorrect >= t.unlockRank;
}

export function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
}
