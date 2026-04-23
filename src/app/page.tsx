"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import questionsData from "@/data/questions.json";
import AnimatedNumber from "@/components/AnimatedNumber";
import TimerBar from "@/components/TimerBar";
import StatsPanel from "@/components/StatsPanel";
import AchievementToast from "@/components/AchievementToast";
import Particles from "@/components/Particles";
import SettingsModal from "@/components/SettingsModal";
import { initSound, sfx, isMuted, toggleMute } from "@/lib/sounds";
import {
  mulberry32,
  seededShuffle,
  stringToSeed,
  getDailyKey,
  getDailyNumber,
  buildShareText,
} from "@/lib/daily";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  categoryOf,
  type Category,
} from "@/lib/categories";
import {
  loadProfile,
  updateProfile,
  updateDailyStreak,
  resetProfile,
  rankFromXp,
  type Profile,
} from "@/lib/profile";
import { evaluateUnlocks } from "@/lib/achievements";
import { applyTheme, type ThemeId } from "@/lib/themes";
import {
  loadSettings,
  updateSettings,
  type Settings,
} from "@/lib/settings";
import { eraOf } from "@/lib/eras";
import { slugify } from "@/lib/slug";
import { generateShareCard, downloadBlob } from "@/lib/shareCard";

interface Option {
  name: string;
  image: string;
  correct: boolean;
}

interface Question {
  name: string;
  image: string;
  clue: string;
  wrong_options: { name: string; image: string }[];
  fact: string;
}

type Mode = "classic" | "daily" | "category" | "endless";
type GameState = "menu" | "category-select" | "playing" | "answered" | "finished";

const CLASSIC_QUESTIONS = 5;
const BASE_POINTS = 100;
const TIMER_MS = 20000;
const MAX_SPEED_BONUS = 50;

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildClassicSession(): Question[] {
  return shuffleArray(questionsData as Question[]).slice(0, CLASSIC_QUESTIONS);
}

function buildCategorySession(cat: Category): Question[] {
  const pool = (questionsData as Question[]).filter(
    (q) => categoryOf(q.name) === cat
  );
  const count = Math.min(CLASSIC_QUESTIONS, pool.length);
  return shuffleArray(pool).slice(0, count);
}

function buildDailySession(): {
  questions: Question[];
  optionsPerQuestion: Option[][];
} {
  const key = getDailyKey();
  const seed = stringToSeed(key);
  const rand = mulberry32(seed);
  const all = questionsData as Question[];
  const qs = seededShuffle(all, rand).slice(0, CLASSIC_QUESTIONS);
  const optionsPerQuestion = qs.map((q) => {
    const opts: Option[] = [
      { name: q.name, image: q.image, correct: true },
      ...q.wrong_options.map((o) => ({ ...o, correct: false })),
    ];
    return seededShuffle(opts, rand);
  });
  return { questions: qs, optionsPerQuestion };
}

function pickEndlessQuestion(usedNames: Set<string>): Question {
  const pool = (questionsData as Question[]).filter(
    (q) => !usedNames.has(q.name)
  );
  const source = pool.length > 0 ? pool : (questionsData as Question[]);
  return source[Math.floor(Math.random() * source.length)];
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("classic");
  const [gameState, setGameState] = useState<GameState>("menu");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dailyOptions, setDailyOptions] = useState<Option[][] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [shake, setShake] = useState<null | "hit" | "miss">(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIMER_MS);
  const questionStartRef = useRef<number>(0);
  const lastTickSecondRef = useRef<number>(-1);
  const answeredRef = useRef<boolean>(false);

  // Endless
  const [endlessRound, setEndlessRound] = useState(0);
  const endlessUsedRef = useRef<Set<string>>(new Set());

  // Profile + achievements
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const fastestMsThisGameRef = useRef<number | null>(null);

  // Settings / theme
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Particles
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [particleOrigin, setParticleOrigin] =
    useState<{ x: number; y: number } | null>(null);
  const [particleColors, setParticleColors] = useState<string[]>([]);

  // PNG share state
  const [pngSaving, setPngSaving] = useState(false);

  const dailyNumber = useRef(getDailyNumber()).current;

  // ---------- Helpers ----------

  const prepareQuestion = useCallback(
    (q: Question, index: number, presetOptions?: Option[][] | null) => {
      if (presetOptions) {
        setOptions(presetOptions[index]);
      } else {
        const opts: Option[] = [
          { name: q.name, image: q.image, correct: true },
          ...q.wrong_options.map((o) => ({ ...o, correct: false })),
        ];
        setOptions(shuffleArray(opts));
      }
      setRevealed(false);
      setSelectedIndex(null);
      setTimeLeft(TIMER_MS);
      questionStartRef.current = Date.now();
      lastTickSecondRef.current = -1;
      answeredRef.current = false;
    },
    []
  );

  const pushUnlocks = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setAchievementQueue((q) => [...q, ...ids]);
    sfx.achievement();
  }, []);

  const commitProfile = useCallback((mutator: (p: Profile) => Profile) => {
    const next = updateProfile(mutator);
    setProfile(next);
    return next;
  }, []);

  // ---------- Mode launchers ----------

  const startClassic = useCallback(() => {
    sfx.click();
    setMode("classic");
    const qs = buildClassicSession();
    setQuestions(qs);
    setDailyOptions(null);
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setResults([]);
    fastestMsThisGameRef.current = null;
    setGameState("playing");
    prepareQuestion(qs[0], 0, null);
  }, [prepareQuestion]);

  const startDaily = useCallback(() => {
    sfx.click();
    setMode("daily");
    const { questions: qs, optionsPerQuestion } = buildDailySession();
    setQuestions(qs);
    setDailyOptions(optionsPerQuestion);
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setResults([]);
    fastestMsThisGameRef.current = null;
    setGameState("playing");
    prepareQuestion(qs[0], 0, optionsPerQuestion);
  }, [prepareQuestion]);

  const startCategory = useCallback(
    (cat: Category) => {
      sfx.click();
      setMode("category");
      const qs = buildCategorySession(cat);
      setQuestions(qs);
      setDailyOptions(null);
      setCurrentIndex(0);
      setScore(0);
      setCombo(0);
      setBestCombo(0);
      setResults([]);
      fastestMsThisGameRef.current = null;
      setGameState("playing");
      prepareQuestion(qs[0], 0, null);
    },
    [prepareQuestion]
  );

  const startEndless = useCallback(() => {
    sfx.click();
    setMode("endless");
    endlessUsedRef.current = new Set();
    const first = pickEndlessQuestion(endlessUsedRef.current);
    endlessUsedRef.current.add(first.name);
    setQuestions([first]);
    setDailyOptions(null);
    setCurrentIndex(0);
    setEndlessRound(1);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setResults([]);
    fastestMsThisGameRef.current = null;
    setGameState("playing");
    prepareQuestion(first, 0, null);
  }, [prepareQuestion]);

  const replayMode = () => {
    if (mode === "classic") startClassic();
    else if (mode === "daily") startDaily();
    else if (mode === "endless") startEndless();
    else setGameState("category-select");
  };

  const backToMenu = useCallback(() => {
    sfx.click();
    setGameState("menu");
  }, []);

  // ---------- Mount ----------

  useEffect(() => {
    setMounted(true);
    initSound();
    setMutedState(isMuted());
    setProfile(loadProfile());
    const s = loadSettings();
    setSettings(s);
    applyTheme(s.theme);
  }, []);

  // ---------- Timer ----------

  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - questionStartRef.current;
      const remaining = Math.max(0, TIMER_MS - elapsed);
      setTimeLeft(remaining);
      const secLeft = Math.ceil(remaining / 1000);
      if (secLeft <= 5 && secLeft > 0 && secLeft !== lastTickSecondRef.current) {
        lastTickSecondRef.current = secLeft;
        sfx.tick();
      }
      if (remaining === 0 && !answeredRef.current) {
        answeredRef.current = true;
        handleTimeout();
      }
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, currentIndex]);

  const handleTimeout = () => {
    if (revealed) return;
    sfx.timeout();
    setSelectedIndex(-1);
    setRevealed(true);
    setResults((r) => [...r, false]);
    setCombo(0);
    setShake("miss");
    setTimeout(() => setShake(null), 400);
    setGameState("answered");
    // track profile
    commitProfile((p) => ({
      ...p,
      totalAnswered: p.totalAnswered + 1,
    }));
  };

  // ---------- Card click ----------

  const handleCardClick = (
    index: number,
    origin?: { x: number; y: number }
  ) => {
    if (revealed || gameState !== "playing") return;
    answeredRef.current = true;
    const answerMs = Date.now() - questionStartRef.current;
    sfx.flip();
    setSelectedIndex(index);
    setRevealed(true);
    const isRight = options[index].correct;
    setResults((r) => [...r, isRight]);

    if (isRight) {
      const newCombo = combo + 1;
      const mult = Math.min(5, 1 + Math.floor(newCombo / 2));
      const speedBonus = Math.max(
        0,
        Math.round(MAX_SPEED_BONUS * (1 - answerMs / TIMER_MS))
      );
      const gain = BASE_POINTS * mult + speedBonus;
      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));
      setScore((s) => s + gain);
      setShake("hit");
      setTimeout(() => sfx.correct(), 180);
      if (newCombo >= 2) setTimeout(() => sfx.combo(newCombo), 550);

      // Pixel particle burst (resolve CSS vars to hex for canvas)
      const cs = getComputedStyle(document.documentElement);
      setParticleOrigin(origin ?? null);
      setParticleColors([
        cs.getPropertyValue("--hb-accent").trim() || "#00ffa3",
        cs.getPropertyValue("--hb-accent-2").trim() || "#ffcc00",
        cs.getPropertyValue("--hb-accent-3").trim() || "#ff6ec7",
        cs.getPropertyValue("--hb-text").trim() || "#ffffff",
      ]);
      setParticleTrigger((t) => t + 1);

      // update profile + achievements
      const cat = categoryOf(questions[currentIndex].name);
      const updated = commitProfile((p) => ({
        ...p,
        totalCorrect: p.totalCorrect + 1,
        totalAnswered: p.totalAnswered + 1,
        bestCombo: Math.max(p.bestCombo, newCombo),
        fastestAnswerMs:
          p.fastestAnswerMs === null
            ? answerMs
            : Math.min(p.fastestAnswerMs, answerMs),
        seenCategories:
          cat && !p.seenCategories.includes(cat)
            ? [...p.seenCategories, cat]
            : p.seenCategories,
      }));
      fastestMsThisGameRef.current =
        fastestMsThisGameRef.current === null
          ? answerMs
          : Math.min(fastestMsThisGameRef.current, answerMs);
      const unlocks = evaluateUnlocks({
        type: "correct",
        combo: newCombo,
        answerMs,
        profile: updated,
      });
      if (unlocks.length > 0) {
        commitProfile((p) => ({
          ...p,
          unlockedAchievements: [...p.unlockedAchievements, ...unlocks],
        }));
        setTimeout(() => pushUnlocks(unlocks), 800);
      }
    } else {
      setCombo(0);
      setShake("miss");
      setTimeout(() => sfx.wrong(), 180);
      commitProfile((p) => ({
        ...p,
        totalAnswered: p.totalAnswered + 1,
      }));
    }
    setTimeout(() => setShake(null), 400);
    setGameState("answered");
  };

  // ---------- Next question / finish ----------

  const finalizeGame = (finalScore: number, finalResults: boolean[]) => {
    const perfect =
      finalResults.length === CLASSIC_QUESTIONS &&
      finalResults.every(Boolean);

    const updated = commitProfile((p) => {
      const newSeen = new Set(p.seenCategories);
      let next: Profile = {
        ...p,
        gamesPlayed: p.gamesPlayed + 1,
        bestScore: Math.max(p.bestScore, finalScore),
        perfectRuns: perfect ? p.perfectRuns + 1 : p.perfectRuns,
        endlessBest:
          mode === "endless"
            ? Math.max(p.endlessBest, endlessRound)
            : p.endlessBest,
        dailiesCompleted:
          mode === "daily" && !p.dailiesCompleted.includes(getDailyKey())
            ? [...p.dailiesCompleted, getDailyKey()]
            : p.dailiesCompleted,
        seenCategories: Array.from(newSeen),
      };
      if (mode === "daily") {
        next = updateDailyStreak(next, getDailyKey());
      }
      return next;
    });

    const unlocks = evaluateUnlocks({
      type: "gameEnd",
      score: finalScore,
      perfect,
      profile: updated,
    });
    const dailyUnlocks =
      mode === "daily"
        ? evaluateUnlocks({ type: "dailyCompleted", profile: updated })
        : [];
    const endlessUnlocks =
      mode === "endless"
        ? evaluateUnlocks({
            type: "endlessRoundReached",
            endlessRound,
            profile: updated,
          })
        : [];
    const all = [...unlocks, ...dailyUnlocks, ...endlessUnlocks];
    if (all.length > 0) {
      commitProfile((p) => ({
        ...p,
        unlockedAchievements: [...p.unlockedAchievements, ...all],
      }));
      setTimeout(() => pushUnlocks(all), 900);
    }
  };

  const nextQuestion = () => {
    if (mode === "endless") {
      // In endless, proceed only if last answer was correct
      const lastResult = results[results.length - 1];
      if (!lastResult) {
        // Game over in endless
        sfx.gameOver();
        setGameState("finished");
        finalizeGame(score, results);
        return;
      }
      // next round
      sfx.next();
      const next = pickEndlessQuestion(endlessUsedRef.current);
      endlessUsedRef.current.add(next.name);
      const nextIdx = currentIndex + 1;
      setQuestions((qs) => [...qs, next]);
      setCurrentIndex(nextIdx);
      setEndlessRound((r) => r + 1);
      setGameState("playing");
      prepareQuestion(next, nextIdx, null);
      return;
    }

    if (currentIndex + 1 >= questions.length) {
      sfx.gameOver();
      setGameState("finished");
      finalizeGame(score, results);
      setTimeout(() => {
        if (score > 0) sfx.victory();
      }, 350);
    } else {
      sfx.next();
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setGameState("playing");
      prepareQuestion(questions[nextIdx], nextIdx, dailyOptions);
    }
  };

  const onToggleMute = useCallback(() => {
    const m = toggleMute();
    setMutedState(m);
    if (!m) sfx.click();
  }, []);

  // ---------- Settings handlers ----------

  const onChangeTheme = useCallback((theme: ThemeId) => {
    const next = updateSettings((s) => ({ ...s, theme }));
    setSettings(next);
    applyTheme(theme);
    sfx.click();
  }, []);

  const onToggleMotion = useCallback(() => {
    const next = updateSettings((s) => ({
      ...s,
      reduceMotion: !s.reduceMotion,
    }));
    setSettings(next);
    sfx.click();
  }, []);

  const onResetProgress = useCallback(() => {
    resetProfile();
    const fresh = loadProfile();
    setProfile(fresh);
    setSettingsOpen(false);
    sfx.gameOver();
  }, []);

  // ---------- Keyboard ----------

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === "m") {
        onToggleMute();
        return;
      }
      if (gameState === "playing") {
        if (e.key === "1") handleCardClick(0);
        else if (e.key === "2") handleCardClick(1);
        else if (e.key === "3") handleCardClick(2);
      } else if (gameState === "answered") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nextQuestion();
        }
      } else if (gameState === "finished") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          backToMenu();
        }
      } else if (gameState === "menu") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startClassic();
        } else if (k === "d") {
          startDaily();
        } else if (k === "e") {
          startEndless();
        } else if (k === "c") {
          setGameState("category-select");
        }
      } else if (gameState === "category-select" && e.key === "Escape") {
        setGameState("menu");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, options, currentIndex, questions, revealed, combo]);

  // ---------- Derived ----------

  const currentQuestion = questions[currentIndex];
  const multiplier = Math.min(5, 1 + Math.floor(combo / 2));
  const timerProgress = timeLeft / TIMER_MS;

  const copyShare = async () => {
    const text = buildShareText({
      dailyNumber,
      results,
      score,
      total: CLASSIC_QUESTIONS,
    });
    try {
      await navigator.clipboard.writeText(text);
      setShareCopied(true);
      sfx.correct();
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const downloadPng = async () => {
    if (!profile) return;
    setPngSaving(true);
    sfx.click();
    try {
      const blob = await generateShareCard({
        dailyNumber,
        results,
        score,
        streak: profile.dailyStreak,
        rank: rankFromXp(profile).name,
      });
      if (blob) {
        downloadBlob(blob, `history-brain-day-${dailyNumber}.png`);
        sfx.correct();
      }
    } finally {
      setPngSaving(false);
    }
  };

  const dismissToast = useCallback((id: string) => {
    setAchievementQueue((q) => q.filter((x) => x !== id));
  }, []);

  // ---------- Render ----------

  if (!mounted || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="text-[var(--hb-accent)] text-2xl tracking-widest animate-pulse"
          style={hf}
        >
          BOOTING...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center px-4 py-6 pixel-font ${
        shake === "hit" ? "shake-hit" : shake === "miss" ? "shake-miss" : ""
      }`}
    >
      <AchievementToast queue={achievementQueue} onDismiss={dismissToast} />
      <Particles
        trigger={particleTrigger}
        origin={particleOrigin}
        colors={particleColors}
        reduceMotion={settings?.reduceMotion ?? false}
      />
      {settings && (
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          profile={profile}
          settings={settings}
          onChangeTheme={onChangeTheme}
          onToggleMotion={onToggleMotion}
          onResetProgress={onResetProgress}
        />
      )}

      <div className="w-full max-w-6xl flex flex-col items-center gap-6">
        {/* HEADER */}
        <header className="w-full flex items-center justify-between px-2 py-3">
          <button
            onClick={gameState === "menu" ? undefined : backToMenu}
            className="glitch-text text-[var(--hb-accent)] text-lg sm:text-2xl tracking-widest cursor-pointer"
            style={hf}
          >
            HISTORY_BRAIN
          </button>
          <div className="flex items-center gap-3 sm:gap-5 text-[var(--hb-text)]">
            {(gameState === "playing" || gameState === "answered") && (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[var(--hb-muted)] uppercase tracking-widest">
                    {mode === "daily"
                      ? `Day #${dailyNumber}`
                      : mode === "endless"
                      ? "Round"
                      : "Level"}
                  </span>
                  <span
                    className="text-sm sm:text-lg text-[var(--hb-accent)]"
                    style={hf}
                  >
                    {mode === "endless"
                      ? String(endlessRound).padStart(3, "0")
                      : `${String(currentIndex + 1).padStart(2, "0")}/0${CLASSIC_QUESTIONS}`}
                  </span>
                </div>
                {combo >= 2 && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[var(--hb-muted)] uppercase tracking-widest">
                      Combo
                    </span>
                    <span
                      className="text-sm sm:text-lg text-[var(--hb-accent-2)]"
                      style={hf}
                    >
                      x{multiplier}
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[var(--hb-muted)] uppercase tracking-widest">
                    Score
                  </span>
                  <AnimatedNumber
                    value={score}
                    pad={4}
                    className="text-sm sm:text-lg text-[var(--hb-accent-2)]"
                    style={hf}
                  />
                </div>
              </>
            )}
            <button
              onClick={onToggleMute}
              aria-label="Toggle sound"
              className="border-2 border-[var(--hb-border)] hover:border-[var(--hb-accent)] text-[var(--hb-accent)] px-3 py-2 transition-colors cursor-pointer"
              style={hf}
            >
              <span className="text-xs">{muted ? "SFX:OFF" : "SFX:ON"}</span>
            </button>
            <button
              onClick={() => {
                sfx.click();
                setSettingsOpen(true);
              }}
              aria-label="Open settings"
              className="border-2 border-[var(--hb-border)] hover:border-[var(--hb-accent)] text-[var(--hb-accent)] px-3 py-2 transition-colors cursor-pointer"
              style={hf}
            >
              <span className="text-xs">CFG</span>
            </button>
          </div>
        </header>

        <div className="w-full h-1 bg-linear-to-r from-transparent via-[var(--hb-accent)] to-transparent opacity-60" />

        {/* MENU */}
        {gameState === "menu" && (
          <div className="flex flex-col items-center gap-6 mt-4 w-full animate-[fadeIn_0.5s_ease-out]">
            <StatsPanel profile={profile} />

            <h2
              className="glitch-text text-[var(--hb-accent)] text-2xl sm:text-4xl tracking-widest text-center mt-2"
              style={hf}
            >
              SELECT MODE
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
              <ModeCard
                onClick={startClassic}
                color="var(--hb-accent)"
                label="> CLASSIC"
                desc="5 random questions from the full archive. Build combos for massive scores."
                shortcut="[ENTER]"
              />
              <ModeCard
                onClick={startDaily}
                color="var(--hb-accent-2)"
                label={`> DAILY #${dailyNumber}`}
                desc="Everyone gets the same 5 today. Share your result and compare."
                shortcut="[D]"
              />
              <ModeCard
                onClick={() => setGameState("category-select")}
                color="var(--hb-accent-3)"
                label="> CATEGORY"
                desc="Pick your area of expertise — Landmarks, Art, Figures, Events, Documents."
                shortcut="[C]"
              />
              <ModeCard
                onClick={startEndless}
                color="var(--hb-accent-4)"
                label="> ENDLESS"
                desc="Survive as long as you can. One wrong answer ends the run."
                shortcut="[E]"
              />
            </div>

            <div className="text-[var(--hb-muted)] text-sm tracking-widest mt-2 text-center">
              [1][2][3] PICK · [ENTER] CONTINUE · [M] MUTE · [ESC] BACK
            </div>
          </div>
        )}

        {/* CATEGORY SELECT */}
        {gameState === "category-select" && (
          <div className="flex flex-col items-center gap-6 mt-4 w-full max-w-3xl animate-[fadeIn_0.4s_ease-out]">
            <h2
              className="glitch-text text-[var(--hb-accent-3)] text-2xl sm:text-3xl tracking-widest text-center"
              style={hf}
            >
              CHOOSE CATEGORY
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => startCategory(cat)}
                  className="bg-[var(--hb-panel)] pixel-border p-5 flex flex-col items-start gap-2 text-left hover:-translate-y-1 hover:bg-[var(--hb-panel-alt)] transition-all cursor-pointer"
                >
                  <span
                    className="text-base tracking-widest"
                    style={{ ...hf, color: CATEGORY_COLORS[cat] }}
                  >
                    &gt; {cat.toUpperCase()}
                  </span>
                  <span className="text-[var(--hb-muted)] text-sm">
                    {
                      (questionsData as Question[]).filter(
                        (q) => categoryOf(q.name) === cat
                      ).length
                    }{" "}
                    items in pool
                  </span>
                </button>
              ))}
            </div>
            <button onClick={backToMenu} className="pixel-btn">
              &gt; Back [ESC]
            </button>
          </div>
        )}

        {/* GAME */}
        {(gameState === "playing" || gameState === "answered") &&
          currentQuestion && (
            <>
              {/* CLUE + TIMER */}
              <div className="w-full max-w-3xl flex flex-col gap-3">
                <div className="bg-[var(--hb-panel)] pixel-border p-6 relative">
                  <div className="flex items-start gap-3">
                    <span
                      className="text-[var(--hb-accent)] text-xs tracking-widest shrink-0 mt-1"
                      style={hf}
                    >
                      &gt; CLUE
                    </span>
                    <p className="text-[var(--hb-text)] text-xl sm:text-2xl leading-snug">
                      {currentQuestion.clue}
                      <span className="inline-block w-2 h-5 bg-[var(--hb-accent)] ml-1 animate-pulse align-middle" />
                    </p>
                  </div>
                </div>
                <TimerBar
                  progress={timerProgress}
                  active={gameState === "playing"}
                />
              </div>

              {/* COMBO BADGE */}
              {combo >= 2 && gameState === "playing" && (
                <div
                  key={combo}
                  className="bg-[var(--hb-accent-2)] text-[var(--hb-bg)] px-4 py-2 combo-pop"
                  style={hf}
                >
                  <span className="text-sm tracking-widest">
                    COMBO x{multiplier} · {combo} STREAK
                  </span>
                </div>
              )}

              {/* CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl mt-2">
                {options.map((option, idx) => {
                  const isCorrect = option.correct;
                  const isSelected = selectedIndex === idx;
                  const showCorrect = revealed && isCorrect;
                  const showWrong = revealed && isSelected && !isCorrect;
                  const isDimmed = revealed && !isCorrect && !isSelected;

                  return (
                    <button
                      key={`${currentIndex}-${idx}`}
                      onClick={(e) => {
                        const rect =
                          e.currentTarget.getBoundingClientRect();
                        handleCardClick(idx, {
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 2,
                        });
                      }}
                      onMouseEnter={() => !revealed && sfx.hover()}
                      disabled={revealed}
                      className={`group relative flex flex-col items-stretch bg-[var(--hb-panel)] p-3 cursor-pointer transition-all duration-300
                        ${
                          showCorrect
                            ? "pixel-border-accent -translate-y-2"
                            : showWrong
                            ? "pixel-border-wrong"
                            : "pixel-border"
                        }
                        ${isDimmed ? "opacity-40" : ""}
                        ${
                          !revealed
                            ? "hover:-translate-y-2 hover:bg-[var(--hb-panel-alt)]"
                            : ""
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span
                          className="text-[var(--hb-accent)] text-[10px] tracking-widest"
                          style={hf}
                        >
                          [0{idx + 1}]
                        </span>
                        <span className="text-[var(--hb-muted)] text-[10px] tracking-widest uppercase">
                          {revealed ? "Revealed" : "Locked"}
                        </span>
                      </div>

                      <div className="card-flip w-full aspect-3/4">
                        <div
                          className={`card-flip-inner ${
                            revealed ? "flipped" : ""
                          }`}
                        >
                          <div className="card-face bg-[var(--hb-bg)] scanlines">
                            <Image
                              src={option.image}
                              alt=""
                              fill
                              className="object-cover blur-lg scale-110 opacity-90"
                              sizes="(max-width: 640px) 100vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-linear-to-b from-[var(--hb-accent)]/5 via-transparent to-[#8a2be2]/10" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="text-[var(--hb-accent)] text-5xl opacity-80"
                                style={hf}
                              >
                                ?
                              </span>
                            </div>
                          </div>

                          <div className="card-face card-face-back bg-[var(--hb-bg)]">
                            <Image
                              src={option.image}
                              alt={option.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 33vw"
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        className={`mt-3 py-2 px-2 text-center transition-colors
                        ${
                          showCorrect
                            ? "bg-[var(--hb-accent)] text-[var(--hb-bg)]"
                            : showWrong
                            ? "bg-[var(--hb-wrong)] text-[var(--hb-bg)]"
                            : "bg-[var(--hb-bg)] text-[var(--hb-text)]"
                        }
                      `}
                      >
                        <span
                          className="text-xs sm:text-sm tracking-wider"
                          style={hf}
                        >
                          {option.name}
                        </span>
                      </div>

                      {showCorrect && (
                        <div
                          className="absolute -top-3 -right-3 bg-[var(--hb-accent)] text-[var(--hb-bg)] text-[10px] px-2 py-1 tracking-widest pop-in"
                          style={hf}
                        >
                          +{BASE_POINTS * multiplier}
                        </div>
                      )}
                      {showWrong && (
                        <div
                          className="absolute -top-3 -right-3 bg-[var(--hb-wrong)] text-[var(--hb-bg)] text-[10px] px-2 py-1 tracking-widest pop-in"
                          style={hf}
                        >
                          MISS
                        </div>
                      )}

                      <span className="absolute bottom-1 left-2 text-[var(--hb-muted)] text-[9px] tracking-widest opacity-60">
                        [{idx + 1}]
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* FACT + NEXT */}
              {gameState === "answered" && (() => {
                const era = eraOf(currentQuestion.name);
                const cat = categoryOf(currentQuestion.name);
                const topicUrl = `/topics/${slugify(currentQuestion.name)}`;
                return (
                <div className="flex flex-col items-center gap-6 w-full max-w-3xl mt-4 animate-[fadeIn_0.5s_ease-out]">
                  <div className="bg-[var(--hb-panel)] pixel-border p-6 w-full flex flex-col gap-4">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-3 py-1 text-[10px] tracking-widest"
                        style={{
                          ...hf,
                          background: "var(--hb-accent)",
                          color: "var(--hb-bg)",
                        }}
                      >
                        {currentQuestion.name.toUpperCase()}
                      </span>
                      {era && (
                        <span
                          className="px-3 py-1 text-[10px] tracking-widest border-2 border-[var(--hb-border)] text-[var(--hb-text)]"
                          style={hf}
                        >
                          {era.year}
                        </span>
                      )}
                      {cat && (
                        <span
                          className="px-3 py-1 text-[10px] tracking-widest border-2"
                          style={{
                            ...hf,
                            borderColor: CATEGORY_COLORS[cat],
                            color: CATEGORY_COLORS[cat],
                          }}
                        >
                          {cat.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      <span
                        className="text-[var(--hb-accent-2)] text-xs tracking-widest shrink-0 mt-1"
                        style={hf}
                      >
                        &gt; LOG
                      </span>
                      <p className="text-[var(--hb-text)] text-xl leading-snug">
                        {selectedIndex === -1
                          ? `TIME'S UP! The answer was ${currentQuestion.name}. ${currentQuestion.fact}`
                          : currentQuestion.fact}
                      </p>
                    </div>

                    <a
                      href={topicUrl}
                      className="self-start text-xs tracking-widest text-[var(--hb-accent)] hover:underline"
                      style={hf}
                    >
                      &gt; LEARN MORE →
                    </a>
                  </div>
                  <button onClick={nextQuestion} className="pixel-btn">
                    {mode === "endless"
                      ? results[results.length - 1]
                        ? "> Next Round [ENTER]"
                        : "> See Results [ENTER]"
                      : currentIndex + 1 >= questions.length
                      ? "> See Results [ENTER]"
                      : "> Next Round [ENTER]"}
                  </button>
                </div>
                );
              })()}
            </>
          )}

        {/* FINISHED */}
        {gameState === "finished" && (
          <div className="flex flex-col items-center text-center gap-6 mt-4 w-full max-w-2xl animate-[fadeIn_0.6s_ease-out]">
            <h2
              className="glitch-text text-[var(--hb-accent)] text-3xl sm:text-4xl tracking-widest"
              style={hf}
            >
              {mode === "endless" ? "RUN OVER" : "GAME OVER"}
            </h2>

            <div className="bg-[var(--hb-panel)] pixel-border p-8 flex flex-col items-center gap-3 w-full">
              <span className="text-[var(--hb-muted)] text-xs tracking-widest uppercase">
                Final Score
              </span>
              <AnimatedNumber
                value={score}
                duration={900}
                className="text-6xl sm:text-7xl text-[var(--hb-accent-2)]"
                style={hf}
              />

              {mode !== "endless" && (
                <div className="flex gap-2 mt-3 flex-wrap justify-center">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 ${
                        r ? "bg-[var(--hb-accent)]" : "bg-[var(--hb-wrong)]"
                      } pop-in`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 w-full mt-4 text-left">
                <div className="bg-[var(--hb-bg)] p-3">
                  <div className="text-[10px] text-[var(--hb-muted)] tracking-widest uppercase">
                    {mode === "endless" ? "Rounds" : "Accuracy"}
                  </div>
                  <div className="text-[var(--hb-accent)] text-lg" style={hf}>
                    {mode === "endless"
                      ? `R${endlessRound}`
                      : `${Math.round(
                          (results.filter(Boolean).length /
                            Math.max(1, results.length)) *
                            100
                        )}%`}
                  </div>
                </div>
                <div className="bg-[var(--hb-bg)] p-3">
                  <div className="text-[10px] text-[var(--hb-muted)] tracking-widest uppercase">
                    Best Combo
                  </div>
                  <div className="text-[var(--hb-accent-2)] text-lg" style={hf}>
                    x{bestCombo}
                  </div>
                </div>
              </div>

              <span className="text-[var(--hb-text)] text-xl mt-4">
                {mode === "endless"
                  ? endlessRound >= 10
                    ? "LEGENDARY RUN"
                    : endlessRound >= 5
                    ? "WELL PLAYED"
                    : "TRY AGAIN"
                  : score >= CLASSIC_QUESTIONS * BASE_POINTS * 2
                  ? "FLAWLESS VICTORY"
                  : results.filter(Boolean).length >= 3
                  ? "WELL PLAYED"
                  : "TRY AGAIN"}
              </span>
            </div>

            {mode === "daily" && profile.dailyStreak > 0 && (
              <div
                className="px-4 py-2 bg-[var(--hb-accent-3)] text-[var(--hb-bg)] tracking-widest"
                style={hf}
              >
                STREAK · {profile.dailyStreak} DAY
                {profile.dailyStreak === 1 ? "" : "S"}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-center flex-wrap justify-center">
              {mode === "daily" && (
                <>
                  <button onClick={copyShare} className="pixel-btn">
                    {shareCopied ? "> Copied!" : "> Copy Text"}
                  </button>
                  <button
                    onClick={downloadPng}
                    disabled={pngSaving}
                    className="pixel-btn"
                    style={{ background: "var(--hb-accent-3)" }}
                  >
                    {pngSaving ? "> Saving..." : "> Save PNG"}
                  </button>
                </>
              )}
              <button
                onClick={replayMode}
                className="pixel-btn"
                style={{ background: "var(--hb-accent-2)" }}
              >
                &gt; Play Again
              </button>
              <button
                onClick={backToMenu}
                className="pixel-btn"
                style={{ background: "var(--hb-muted)" }}
              >
                &gt; Menu
              </button>
            </div>
          </div>
        )}

        <footer className="mt-8 text-[var(--hb-muted)] text-xs tracking-widest flex flex-col items-center gap-2 text-center">
          <div>v4.0 · [1][2][3] PICK · [ENTER] NEXT · [M] MUTE · CFG THEME</div>
          <div>
            © History Brain all right reserved - Created by{" "}
            <a
              href="https://www.henrymontilla.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--hb-accent)] hover:underline"
            >
              Henry Montilla
            </a>
            {" · "}
            <a
              href="/privacy"
              className="text-[var(--hb-accent)] hover:underline"
            >
              Privacy
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ----------------- small components -----------------

function ModeCard({
  onClick,
  color,
  label,
  desc,
  shortcut,
}: {
  onClick: () => void;
  color: string;
  label: string;
  desc: string;
  shortcut: string;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-[var(--hb-panel)] pixel-border p-6 flex flex-col items-start gap-3 text-left hover:-translate-y-1 hover:bg-[var(--hb-panel-alt)] transition-all cursor-pointer"
    >
      <span
        className="text-lg tracking-widest"
        style={{ ...hf, color }}
      >
        {label}
      </span>
      <p className="text-[var(--hb-text)] text-xl leading-snug">{desc}</p>
      <span className="text-[var(--hb-muted)] text-sm mt-2">{shortcut}</span>
    </button>
  );
}
