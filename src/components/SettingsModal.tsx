"use client";

import { useEffect } from "react";
import { THEMES, isThemeUnlocked, type ThemeId } from "@/lib/themes";
import type { Profile } from "@/lib/profile";
import type { Settings } from "@/lib/settings";

interface Props {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  settings: Settings;
  onChangeTheme: (id: ThemeId) => void;
  onToggleMotion: () => void;
  onResetProgress: () => void;
}

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export default function SettingsModal({
  open,
  onClose,
  profile,
  settings,
  onChangeTheme,
  onToggleMotion,
  onResetProgress,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-in"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--hb-panel)] pixel-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="glitch-text text-[var(--hb-accent)] text-xl tracking-widest"
            style={hf}
          >
            &gt; SETTINGS
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="border-2 border-[var(--hb-border)] hover:border-[var(--hb-accent)] text-[var(--hb-accent)] px-3 py-1 text-xs cursor-pointer"
            style={hf}
          >
            X [ESC]
          </button>
        </div>

        {/* THEMES */}
        <section className="mb-6">
          <h3
            className="text-[var(--hb-accent-2)] text-sm tracking-widest mb-3"
            style={hf}
          >
            &gt; THEME
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map((t) => {
              const unlocked = isThemeUnlocked(t.id, profile);
              const active = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  disabled={!unlocked}
                  onClick={() => unlocked && onChangeTheme(t.id)}
                  className={`relative flex items-center gap-3 p-3 border-2 text-left transition-all cursor-pointer
                    ${
                      active
                        ? "border-[var(--hb-accent)] bg-[var(--hb-panel-alt)]"
                        : "border-[var(--hb-border)] hover:border-[var(--hb-accent)]"
                    }
                    ${!unlocked ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {/* Swatches */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <div
                      className="w-12 h-3"
                      style={{ background: t.preview.bg }}
                    />
                    <div
                      className="w-12 h-3"
                      style={{ background: t.preview.panel }}
                    />
                    <div
                      className="w-12 h-3"
                      style={{ background: t.preview.accent }}
                    />
                    <div
                      className="w-12 h-3"
                      style={{ background: t.preview.text }}
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span
                      className="text-sm tracking-widest"
                      style={{
                        ...hf,
                        color: active
                          ? "var(--hb-accent)"
                          : "var(--hb-text)",
                      }}
                    >
                      {t.name}
                    </span>
                    <span className="text-xs text-[var(--hb-muted)] leading-tight">
                      {t.description}
                    </span>
                    {!unlocked && (
                      <span className="text-[10px] text-[var(--hb-wrong)] tracking-widest" style={hf}>
                        LOCKED · {t.unlockLabel}
                      </span>
                    )}
                    {active && (
                      <span className="text-[10px] text-[var(--hb-accent)] tracking-widest" style={hf}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* MOTION */}
        <section className="mb-6">
          <h3
            className="text-[var(--hb-accent-2)] text-sm tracking-widest mb-3"
            style={hf}
          >
            &gt; MOTION
          </h3>
          <button
            onClick={onToggleMotion}
            className="w-full flex items-center justify-between p-3 border-2 border-[var(--hb-border)] hover:border-[var(--hb-accent)] cursor-pointer"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-[var(--hb-text)] text-sm" style={hf}>
                REDUCE MOTION
              </span>
              <span className="text-[var(--hb-muted)] text-xs">
                Disable shakes, flips, and particle bursts
              </span>
            </div>
            <span
              className={`text-sm tracking-widest px-3 py-1 ${
                settings.reduceMotion
                  ? "bg-[var(--hb-accent)] text-[var(--hb-bg)]"
                  : "bg-[var(--hb-border)] text-[var(--hb-text)]"
              }`}
              style={hf}
            >
              {settings.reduceMotion ? "ON" : "OFF"}
            </span>
          </button>
        </section>

        {/* DANGER */}
        <section>
          <h3
            className="text-[var(--hb-wrong)] text-sm tracking-widest mb-3"
            style={hf}
          >
            &gt; DANGER
          </h3>
          <button
            onClick={() => {
              if (
                confirm(
                  "Reset all progress? This will delete your stats, achievements, and unlocked themes."
                )
              ) {
                onResetProgress();
              }
            }}
            className="w-full p-3 border-2 border-[var(--hb-wrong)] text-[var(--hb-wrong)] hover:bg-[var(--hb-wrong)] hover:text-[var(--hb-bg)] transition-colors cursor-pointer text-sm tracking-widest"
            style={hf}
          >
            &gt; RESET ALL PROGRESS
          </button>
        </section>
      </div>
    </div>
  );
}
