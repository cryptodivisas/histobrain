// Persistent user settings (theme, motion, volume).

import type { ThemeId } from "./themes";

const KEY = "hb_settings_v1";
const VALID_THEMES: ThemeId[] = [
  "synthwave",
  "terminal",
  "gameboy",
  "sakura",
];

export interface Settings {
  theme: ThemeId;
  reduceMotion: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: "synthwave",
  reduceMotion: false,
};

export function loadSettings(): Settings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as Settings;
    // Sanitize: migrate unknown / legacy theme IDs (e.g. "parchment") to default
    if (!VALID_THEMES.includes(parsed.theme)) {
      parsed.theme = "synthwave";
    }
    return parsed;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function updateSettings(mutator: (s: Settings) => Settings): Settings {
  const next = mutator(loadSettings());
  saveSettings(next);
  return next;
}
