// Seeded PRNG + daily-challenge utilities.

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function stringToSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getDailyKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Days since launch epoch (2025-01-01) for a short "Day #" label
const EPOCH = Date.UTC(2025, 0, 1);
export function getDailyNumber(d: Date = new Date()): number {
  const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.max(1, Math.floor((today - EPOCH) / 86400000) + 1);
}

export function buildShareText(params: {
  dailyNumber: number;
  results: boolean[];
  score: number;
  total: number;
}): string {
  const { dailyNumber, results, score, total } = params;
  const grid = results.map((r) => (r ? "🟩" : "🟥")).join("");
  return [
    `HISTORY_BRAIN · Day #${dailyNumber}`,
    `${grid}  ${results.filter(Boolean).length}/${total}`,
    `Score: ${score}`,
    `https://historybrain.app`,
  ].join("\n");
}
