"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import questionsData from "@/data/questions.json";
import AnimatedNumber from "@/components/AnimatedNumber";
import TimerBar from "@/components/TimerBar";
import StatsPanel from "@/components/StatsPanel";
import AchievementToast from "@/components/AchievementToast";
import Particles from "@/components/Particles";
import SettingsModal from "@/components/SettingsModal";
import GameplayPreview from "@/components/GameplayPreview";
import ChallengePreview from "@/components/ChallengePreview";
import { ShareScoreButton } from "@/components/ShareScoreButton";
import type { SharePayload } from "@/lib/share";
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
  defaultProfile,
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
  defaultSettings,
  updateSettings,
  type Settings,
} from "@/lib/settings";
import { eraOf } from "@/lib/eras";
import { slugify } from "@/lib/slug";
import { generateShareCard, downloadBlob } from "@/lib/shareCard";
import { SITE_URL } from "@/lib/site";

interface Option {
  name: string;
  image?: string;
  correct: boolean;
}

interface Question {
  name: string;
  image?: string;
  clue: string;
  wrong_options: { name: string; image?: string }[];
  fact: string;
  category?: Category;
}

type Mode = "classic" | "daily" | "category" | "endless";
type GameState = "menu" | "category-select" | "playing" | "answered" | "finished";

const CLASSIC_QUESTIONS = 5;
const BASE_POINTS = 100;
const TIMER_MS = 20000;
const MAX_SPEED_BONUS = 50;

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };
const FEATURED_TOPICS = [
  { name: "Apollo 11 Moon Landing", category: "Events", image: "/questions/0719509d0e2e4b8f.jpg" },
  { name: "Mona Lisa", category: "Art", image: "/questions/15f79d9238e4d37b.jpg" },
  { name: "US Constitution", category: "Citizenship", image: "/questions/cadc4d587dbdd155.jpg" },
  { name: "Bob Marley", category: "Music", image: "/questions/b8b153b510cd867b.jpg" },
  { name: "The Godfather", category: "Movies", image: "/questions/8ed7c28157c4ef38.jpg" },
  { name: "Friends", category: "TV Series", image: "/questions/794ae15b6e0acf5b.png" },
] as const;
const HOME_FAQS = [
  {
    question: "Is History Brain free?",
    answer: "Yes. The full trivia game and topic library are free to use in your browser, with no account or download required.",
  },
  {
    question: "What do I learn after each question?",
    answer: "Every answer reveals a concise historical fact. Most answers also link to a deeper article covering context, key facts, history, impact, and surprising details.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No. Your scores, streaks, achievements, and settings are stored locally in your browser.",
  },
  {
    question: "What topics does the game cover?",
    answer: "History Brain covers landmarks, art, historical figures, events, documents, U.S. citizenship, music, movies, and TV series.",
  },
] as const;
const GENERATED_TOPIC_CATEGORIES = new Set<Category>([
  "Citizenship",
  "Music",
  "Movies",
  "TV Series",
]);

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function takeUniqueAnswers(questions: Question[], count: number): Question[] {
  const selected: Question[] = [];
  const names = new Set<string>();
  for (const question of questions) {
    if (names.has(question.name)) continue;
    selected.push(question);
    names.add(question.name);
    if (selected.length === count) break;
  }
  return selected;
}

function buildClassicSession(): Question[] {
  return takeUniqueAnswers(
    shuffleArray(questionsData as Question[]),
    CLASSIC_QUESTIONS
  );
}

function buildCategorySession(cat: Category): Question[] {
  const pool = (questionsData as Question[]).filter(
    (q) => categoryOf(q) === cat
  );
  const count = Math.min(CLASSIC_QUESTIONS, pool.length);
  return takeUniqueAnswers(shuffleArray(pool), count);
}

function buildDailySession(): {
  questions: Question[];
  optionsPerQuestion: Option[][];
} {
  const key = getDailyKey();
  const seed = stringToSeed(key);
  const rand = mulberry32(seed);
  const all = questionsData as Question[];
  const qs = takeUniqueAnswers(
    seededShuffle(all, rand),
    CLASSIC_QUESTIONS
  );
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
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const fastestMsThisGameRef = useRef<number | null>(null);

  // Settings / theme
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Particles
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [particleOrigin, setParticleOrigin] =
    useState<{ x: number; y: number } | null>(null);
  const [particleColors, setParticleColors] = useState<string[]>([]);

  // PNG share state
  const [pngSaving, setPngSaving] = useState(false);

  const [dailyNumber] = useState(() => getDailyNumber());

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
    initSound();
    const loadedSettings = loadSettings();
    applyTheme(loadedSettings.theme);

    window.setTimeout(() => {
      setMutedState(isMuted());
      setProfile(loadProfile());
      setSettings(loadedSettings);
    }, 0);
  }, []);

  // ---------- Timer ----------

  const handleTimeout = useCallback(() => {
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
  }, [commitProfile, revealed]);

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
  }, [gameState, currentIndex, handleTimeout]);

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
      const cat = categoryOf(questions[currentIndex]);
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
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, input, summary")) return;
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
  const correctCount = results.filter(Boolean).length;
  const gameCategory =
    mode === "category" && questions.length > 0
      ? categoryOf(questions[0].name)
      : null;
  const sharePayload: SharePayload = {
    s: score,
    r: mode === "endless" ? endlessRound : correctCount,
    t: mode === "endless" ? 0 : results.length || CLASSIC_QUESTIONS,
    m: mode,
    b: bestCombo,
    ...(gameCategory ? { c: gameCategory } : {}),
    ...(mode === "endless" ? { er: endlessRound } : {}),
    ...(mode === "daily" ? { dn: dailyNumber } : {}),
  };

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

  return (
    <div
      className={`min-h-screen flex flex-col items-center px-3 py-3 sm:px-4 sm:py-6 pixel-font ${
        shake === "hit" ? "shake-hit" : shake === "miss" ? "shake-miss" : ""
      }`}
    >
      <HomeStructuredData />
      <AchievementToast queue={achievementQueue} onDismiss={dismissToast} />
      <Particles
        trigger={particleTrigger}
        origin={particleOrigin}
        colors={particleColors}
        reduceMotion={settings.reduceMotion}
      />
      <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          profile={profile}
          settings={settings}
          onChangeTheme={onChangeTheme}
          onToggleMotion={onToggleMotion}
          onResetProgress={onResetProgress}
        />

      <div className="w-full max-w-6xl flex flex-col items-center gap-4 sm:gap-6">
        {/* HEADER */}
        <header className="w-full flex flex-col gap-3 px-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-2 sm:py-3">
          <button
            onClick={gameState === "menu" ? undefined : backToMenu}
            className="glitch-text text-[var(--hb-accent)] text-lg sm:text-2xl tracking-widest cursor-pointer self-start"
            style={hf}
          >
            HISTORY_BRAIN
          </button>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-5 text-[var(--hb-text)]">
            {(gameState === "playing" || gameState === "answered") && (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] sm:text-[10px] text-[var(--hb-muted)] uppercase tracking-widest">
                    {mode === "daily"
                      ? `Day #${dailyNumber}`
                      : mode === "endless"
                      ? "Round"
                      : "Level"}
                  </span>
                  <span
                    className="text-xs sm:text-lg text-[var(--hb-accent)]"
                    style={hf}
                  >
                    {mode === "endless"
                      ? String(endlessRound).padStart(3, "0")
                      : `${String(currentIndex + 1).padStart(2, "0")}/0${CLASSIC_QUESTIONS}`}
                  </span>
                </div>
                {combo >= 2 && (
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] sm:text-[10px] text-[var(--hb-muted)] uppercase tracking-widest">
                      Combo
                    </span>
                    <span
                      className="text-xs sm:text-lg text-[var(--hb-accent-2)]"
                      style={hf}
                    >
                      x{multiplier}
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-end">
                  <span className="text-[9px] sm:text-[10px] text-[var(--hb-muted)] uppercase tracking-widest">
                    Score
                  </span>
                  <AnimatedNumber
                    value={score}
                    pad={4}
                    className="text-xs sm:text-lg text-[var(--hb-accent-2)]"
                    style={hf}
                  />
                </div>
              </>
            )}
            <button
              onClick={onToggleMute}
              aria-label="Toggle sound"
              className="border-2 border-[var(--hb-border)] hover:border-[var(--hb-accent)] text-[var(--hb-accent)] px-2 py-2 sm:px-3 transition-colors cursor-pointer"
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
              className="border-2 border-[var(--hb-border)] hover:border-[var(--hb-accent)] text-[var(--hb-accent)] px-2 py-2 sm:px-3 transition-colors cursor-pointer"
              style={hf}
            >
              <span className="text-xs">CFG</span>
            </button>
          </div>
        </header>

        <div className="w-full h-1 bg-linear-to-r from-transparent via-[var(--hb-accent)] to-transparent opacity-60" />

        {/* MENU */}
        {gameState === "menu" && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 sm:mt-4 w-full animate-[fadeIn_0.5s_ease-out]">
            <section className="w-full max-w-4xl flex flex-col items-center gap-4 text-center py-2 sm:py-5">
              <div
                className="text-[10px] sm:text-xs text-[var(--hb-accent-2)] tracking-[0.2em]"
                style={hf}
              >
                FREE INTERACTIVE QUIZZES · NO ACCOUNT · NO DOWNLOAD
              </div>
              <h1
                className="glitch-text text-[var(--hb-text)] text-2xl sm:text-5xl tracking-wider leading-tight"
                style={hf}
              >
                CHALLENGE YOUR KNOWLEDGE.
                <span className="block text-[var(--hb-accent)]">
                  LEARN EVERY ROUND.
                </span>
              </h1>
              <p className="max-w-3xl text-[var(--hb-text)] text-lg sm:text-2xl leading-snug">
                Challenge your knowledge with interactive quizzes about
                history, landmarks, movies, music, TV series, citizenship, and
                more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button onClick={startClassic} className="pixel-btn">
                  &gt; Play Classic Free
                </button>
                <button
                  onClick={startDaily}
                  className="pixel-btn"
                  style={{
                    background: "var(--hb-accent-2)",
                    color: "var(--hb-bg)",
                  }}
                >
                  &gt; Today&apos;s Challenge
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-[10px] sm:text-xs tracking-widest">
                {[
                  `${questionsData.length} QUESTIONS`,
                  "308 ARTICLES",
                  "9 CATEGORIES",
                  `DAILY #${dailyNumber}`,
                ].map((item) => (
                  <span
                    key={item}
                    className="border-2 border-[var(--hb-border)] bg-[var(--hb-panel)] px-3 py-2 text-[var(--hb-muted)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href="/learn"
                className="text-[var(--hb-accent)] text-xs tracking-widest hover:underline"
                style={hf}
              >
                &gt; FOR STUDENTS, EDUCATORS &amp; CITIZENSHIP LEARNERS →
              </Link>
            </section>

            {profile.gamesPlayed > 0 && <StatsPanel profile={profile} />}

            <h2
              className="glitch-text text-[var(--hb-accent)] text-xl sm:text-4xl tracking-widest text-center mt-2"
              style={hf}
            >
              SELECT MODE
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 w-full">
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
                desc="Pick your area of expertise — Landmarks, Art, Figures, Events, Documents, Citizenship, Music, Movies, or TV Series."
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

            <div className="text-[var(--hb-muted)] text-xs sm:text-sm tracking-widest mt-2 text-center">
              <span className="sm:hidden">TAP A CARD · CFG THEME · SFX TOGGLE</span>
              <span className="hidden sm:inline">[1][2][3] PICK · [ENTER] CONTINUE · [M] MUTE · [ESC] BACK</span>
            </div>
            <GameplayPreview />
            <ChallengePreview dailyNumber={dailyNumber} onStart={startDaily} />

            <section aria-labelledby="how-to-play" className="w-full flex flex-col items-center gap-5 pt-7 sm:pt-10">
              <SectionHeading id="how-to-play" eyebrow="QUICK START" title="HOW TO PLAY" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 w-full">
                <InfoCard number="01" title="READ THE CLUE" text="Use the era, category, and historical details to narrow down the answer." />
                <InfoCard number="02" title="PICK AN IMAGE" text="Choose from three hidden images before the 20-second timer runs out." />
                <InfoCard number="03" title="UNLOCK THE STORY" text="Reveal the answer, collect a fact, and open the full article when curiosity strikes." />
              </div>
              <Link href="/how-it-works" className="text-[var(--hb-accent)] text-xs tracking-widest hover:underline" style={hf}>
                &gt; FULL GAME GUIDE →
              </Link>
            </section>

            <ResponsiveDisclosure label="Explore the archive">
            <section aria-labelledby="featured-topics" className="w-full flex flex-col items-center gap-5 pt-7 sm:pt-10">
              <SectionHeading id="featured-topics" eyebrow="GO BEYOND THE SCORE" title="EXPLORE THE ARCHIVE" />
              <p className="max-w-2xl text-center text-[var(--hb-text)] text-lg sm:text-xl leading-snug">
                Every round can lead somewhere deeper. Browse the people, moments, works, and ideas behind the answers.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 w-full">
                {FEATURED_TOPICS.map((topic) => (
                  <Link
                    key={topic.name}
                    href={`/topics/${slugify(topic.name)}`}
                    className="group bg-[var(--hb-panel)] pixel-border p-2 sm:p-3 flex flex-col gap-2 hover:-translate-y-1 hover:bg-[var(--hb-panel-alt)] transition-all"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--hb-bg)]">
                      <Image
                        src={topic.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 767px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-[var(--hb-bg)]/70 to-transparent" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-[var(--hb-accent-2)] tracking-widest uppercase">
                      {topic.category}
                    </span>
                    <span className="text-[var(--hb-text)] text-[10px] sm:text-sm tracking-wider leading-relaxed" style={hf}>
                      {topic.name}
                    </span>
                  </Link>
                ))}
              </div>
              <Link href="/topics" className="pixel-btn">&gt; Browse All Topics</Link>
            </section>
            </ResponsiveDisclosure>

            <ResponsiveDisclosure label="Why History Brain">
            <section aria-labelledby="why-history-brain" className="w-full flex flex-col items-center gap-5 pt-7 sm:pt-10">
              <SectionHeading id="why-history-brain" eyebrow="BUILT FOR CURIOUS MINDS" title="PLAY WITH PURPOSE" />
              <div className="bg-[var(--hb-panel)] pixel-border p-5 sm:p-7 w-full grid grid-cols-1 md:grid-cols-3 gap-5">
                <TrustPoint title="LEARN IN CONTEXT" text="Facts and articles turn each answer into a useful piece of a bigger story." />
                <TrustPoint title="PRIVATE BY DEFAULT" text="No account is needed. Your game progress stays in your browser." />
                <TrustPoint title="INDEPENDENTLY BUILT" text="Created and maintained by one developer, with sources and corrections openly explained." />
              </div>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs tracking-widest">
                <Link href="/editorial" className="text-[var(--hb-accent)] hover:underline">&gt; EDITORIAL STANDARD</Link>
                <Link href="/contact" className="text-[var(--hb-accent)] hover:underline">&gt; REPORT A CORRECTION</Link>
              </div>
            </section>
            </ResponsiveDisclosure>

            <ResponsiveDisclosure label="Frequently asked questions" maxWidth>
            <section aria-labelledby="frequently-asked" className="w-full max-w-4xl flex flex-col items-center gap-5 pt-7 sm:pt-10">
              <SectionHeading id="frequently-asked" eyebrow="PLAYER INTEL" title="FREQUENTLY ASKED" />
              <div className="w-full flex flex-col gap-3">
                {HOME_FAQS.map((item) => (
                  <details key={item.question} className="group bg-[var(--hb-panel)] pixel-border px-4 py-4 sm:px-6">
                    <summary className="cursor-pointer list-none text-[var(--hb-accent)] text-xs sm:text-sm tracking-wider flex items-center justify-between gap-4" style={hf}>
                      <span>&gt; {item.question.toUpperCase()}</span>
                      <span aria-hidden="true" className="group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="pt-4 text-[var(--hb-text)] text-base sm:text-lg leading-relaxed">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
            </ResponsiveDisclosure>
          </div>
        )}

        {/* CATEGORY SELECT */}
        {gameState === "category-select" && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 sm:mt-4 w-full max-w-3xl animate-[fadeIn_0.4s_ease-out]">
            <h2
              className="glitch-text text-[var(--hb-accent-3)] text-xl sm:text-3xl tracking-widest text-center"
              style={hf}
            >
              CHOOSE CATEGORY
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => startCategory(cat)}
                  className="bg-[var(--hb-panel)] pixel-border p-4 sm:p-5 flex flex-col items-start gap-2 text-left hover:-translate-y-1 hover:bg-[var(--hb-panel-alt)] transition-all cursor-pointer"
                >
                  <span
                    className="text-base tracking-widest"
                    style={{ ...hf, color: CATEGORY_COLORS[cat] }}
                  >
                    &gt; {cat.toUpperCase()}
                  </span>
                  <span className="text-[var(--hb-muted)] text-sm">
                    {
                      (questionsData as Question[]).filter((q) => categoryOf(q) === cat)
                        .length
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
                <div className="bg-[var(--hb-panel)] pixel-border p-4 sm:p-6 relative">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                    <span
                      className="text-[var(--hb-accent)] text-[10px] sm:text-xs tracking-widest shrink-0 sm:mt-1"
                      style={hf}
                    >
                      &gt; CLUE
                    </span>
                    <p className="text-[var(--hb-text)] text-lg sm:text-2xl leading-snug">
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
              <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 w-full max-w-5xl mt-1 sm:mt-2">
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
                      className={`group relative flex flex-col items-stretch bg-[var(--hb-panel)] p-2 sm:p-3 cursor-pointer transition-all duration-300
                        ${
                          showCorrect
                            ? "pixel-border-accent sm:-translate-y-2"
                            : showWrong
                            ? "pixel-border-wrong"
                            : "pixel-border"
                        }
                        ${isDimmed ? "opacity-40" : ""}
                        ${
                          !revealed
                            ? "hover:-translate-y-1 sm:hover:-translate-y-2 hover:bg-[var(--hb-panel-alt)]"
                            : ""
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2 px-0.5 sm:mb-3 sm:px-1">
                        <span
                          className="text-[var(--hb-accent)] text-[10px] tracking-widest"
                          style={hf}
                        >
                          [0{idx + 1}]
                        </span>
                        <span className="hidden sm:inline text-[var(--hb-muted)] text-[10px] tracking-widest uppercase">
                          {revealed ? "Revealed" : "Locked"}
                        </span>
                      </div>

                      <div className="card-flip w-full aspect-[4/5] sm:aspect-3/4">
                        <div
                          className={`card-flip-inner ${
                            revealed ? "flipped" : ""
                          }`}
                        >
                          <div className="card-face bg-[var(--hb-bg)] scanlines">
                            {option.image ? (
                              <Image
                                src={option.image}
                                alt=""
                                fill
                                className="object-cover blur-lg scale-110 opacity-90"
                                sizes="(max-width: 640px) 33vw, 33vw"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-[var(--hb-panel-alt)]" />
                            )}
                            <div className="absolute inset-0 bg-linear-to-b from-[var(--hb-accent)]/5 via-transparent to-[#8a2be2]/10" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="text-[var(--hb-accent)] text-3xl sm:text-5xl opacity-80"
                                style={hf}
                              >
                                ?
                              </span>
                            </div>
                          </div>

                          <div className="card-face card-face-back bg-[var(--hb-bg)]">
                            {option.image ? (
                              <Image
                                src={option.image}
                                alt={option.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 33vw, 33vw"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-[var(--hb-bg)] p-3 text-center">
                                <span
                                  className="text-[var(--hb-accent)] text-[10px] sm:text-sm tracking-wider leading-relaxed"
                                  style={hf}
                                >
                                  {option.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`mt-2 py-1.5 px-1 text-center transition-colors sm:mt-3 sm:py-2 sm:px-2
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
                          className="text-[9px] sm:text-sm tracking-wider leading-tight"
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
                const cat = categoryOf(currentQuestion);
                const topicUrl = `/topics/${slugify(currentQuestion.name)}`;
                return (
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-3xl mt-3 sm:mt-4 animate-[fadeIn_0.5s_ease-out]">
                  <div className="bg-[var(--hb-panel)] pixel-border p-4 sm:p-6 w-full flex flex-col gap-4">
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

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                      <span
                        className="text-[var(--hb-accent-2)] text-[10px] sm:text-xs tracking-widest shrink-0 sm:mt-1"
                        style={hf}
                      >
                        &gt; LOG
                      </span>
                      <p className="text-[var(--hb-text)] text-lg sm:text-xl leading-snug">
                        {selectedIndex === -1
                          ? `TIME'S UP! The answer was ${currentQuestion.name}. ${currentQuestion.fact}`
                          : currentQuestion.fact}
                      </p>
                    </div>

                    {(currentQuestion.image || (cat && GENERATED_TOPIC_CATEGORIES.has(cat))) && (
                      <a
                        href={topicUrl}
                        className="self-start text-xs tracking-widest text-[var(--hb-accent)] hover:underline"
                        style={hf}
                      >
                        &gt; LEARN MORE →
                      </a>
                    )}
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
          <div className="flex flex-col items-center text-center gap-4 sm:gap-6 sm:mt-4 w-full max-w-2xl animate-[fadeIn_0.6s_ease-out]">
            <h2
              className="glitch-text text-[var(--hb-accent)] text-2xl sm:text-4xl tracking-widest"
              style={hf}
            >
              {mode === "endless" ? "RUN OVER" : "GAME OVER"}
            </h2>

            <div className="bg-[var(--hb-panel)] pixel-border p-5 sm:p-8 flex flex-col items-center gap-3 w-full">
              <span className="text-[var(--hb-muted)] text-xs tracking-widest uppercase">
                Final Score
              </span>
              <AnimatedNumber
                value={score}
                duration={900}
                className="text-5xl sm:text-7xl text-[var(--hb-accent-2)]"
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

              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mt-4 text-left">
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

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center flex-wrap justify-center w-full">
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
              <ShareScoreButton
                payload={sharePayload}
                onClick={() => sfx.click()}
              />
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

        <footer className="mt-6 sm:mt-8 text-[var(--hb-muted)] text-[10px] sm:text-xs tracking-widest flex flex-col items-center gap-3 text-center">
          <div>v4.0 · [1][2][3] PICK · [ENTER] NEXT · [M] MUTE · CFG THEME</div>
          <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            <Link href="/about" className="hover:text-[var(--hb-accent)] transition-colors">About</Link>
            <span>·</span>
            <Link href="/how-it-works" className="hover:text-[var(--hb-accent)] transition-colors">How It Works</Link>
            <span>·</span>
            <Link href="/topics" className="hover:text-[var(--hb-accent)] transition-colors">Topics</Link>
            <span>·</span>
            <Link href="/learn" className="hover:text-[var(--hb-accent)] transition-colors">Learn</Link>
            <span>·</span>
            <Link href="/editorial" className="hover:text-[var(--hb-accent)] transition-colors">Editorial</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-[var(--hb-accent)] transition-colors">Contact</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-[var(--hb-accent)] transition-colors">Privacy</Link>
          </nav>
          <div>
            © History Brain. All rights reserved. Created by{" "}
            <a
              href="https://www.henrymontilla.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--hb-accent)] hover:underline"
            >
              Henry Montilla
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
      className="bg-[var(--hb-panel)] pixel-border p-4 sm:p-6 flex flex-col items-start gap-2 sm:gap-3 text-left hover:-translate-y-1 hover:bg-[var(--hb-panel-alt)] transition-all cursor-pointer"
    >
      <span
        className="text-base sm:text-lg tracking-widest"
        style={{ ...hf, color }}
      >
        {label}
      </span>
      <p className="text-[var(--hb-text)] text-base sm:text-xl leading-snug">{desc}</p>
      <span className="text-[var(--hb-muted)] text-xs sm:text-sm sm:mt-2">{shortcut}</span>
    </button>
  );
}

function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="text-center flex flex-col gap-2">
      <span className="text-[var(--hb-muted)] text-[10px] sm:text-xs tracking-[0.2em]">{eyebrow}</span>
      <h2 id={id} className="glitch-text text-[var(--hb-accent)] text-xl sm:text-3xl tracking-widest" style={hf}>
        {title}
      </h2>
    </div>
  );
}

function InfoCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="bg-[var(--hb-panel)] pixel-border p-5 flex flex-col gap-3">
      <span className="text-[var(--hb-accent-2)] text-xs tracking-widest" style={hf}>[{number}]</span>
      <h3 className="text-[var(--hb-accent)] text-sm tracking-wider" style={hf}>{title}</h3>
      <p className="text-[var(--hb-text)] text-lg leading-snug">{text}</p>
    </div>
  );
}

function TrustPoint({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[var(--hb-accent-2)] text-xs tracking-wider" style={hf}>&gt; {title}</h3>
      <p className="text-[var(--hb-text)] text-lg leading-snug">{text}</p>
    </div>
  );
}

function ResponsiveDisclosure({
  label,
  maxWidth = false,
  children,
}: {
  label: string;
  maxWidth?: boolean;
  children: React.ReactNode;
}) {
  const id = `disclosure-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className={`hb-responsive-disclosure w-full ${maxWidth ? "max-w-4xl" : ""}`}>
      <input id={id} type="checkbox" className="peer sr-only" />
      <label
        htmlFor={id}
        className="sm:hidden bg-[var(--hb-panel)] pixel-border px-4 py-4 cursor-pointer text-[var(--hb-accent)] text-xs tracking-widest flex items-center justify-between gap-4"
        style={hf}
      >
        <span>&gt; {label.toUpperCase()}</span>
        <span aria-hidden="true">+</span>
      </label>
      <div className="hidden peer-checked:block sm:block">{children}</div>
    </div>
  );
}

function HomeStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "History Brain",
        url: SITE_URL,
        applicationCategory: "GameApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        description: "A free browser-based interactive quiz game covering history, landmarks, movies, music, TV series, citizenship, and more.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: HOME_FAQS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
