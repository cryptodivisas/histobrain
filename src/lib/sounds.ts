// Web Audio chiptune sound engine - no external assets.
// All sounds are synthesized at runtime via oscillators + noise.

let ctx: AudioContext | null = null;
let muted = false;
let initialized = false;

const MUTE_KEY = "hb_muted";

export function initSound() {
  if (initialized) return;
  initialized = true;
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(MUTE_KEY);
  muted = stored === "1";
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Safari/Chrome require resume after user gesture
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function isMuted() {
  return muted;
}

export function setMuted(v: boolean) {
  muted = v;
  if (typeof window !== "undefined") {
    localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  }
}

export function toggleMute() {
  setMuted(!muted);
  return muted;
}

type OscType = "square" | "sine" | "triangle" | "sawtooth";

function tone(
  freq: number,
  durationSec: number,
  opts: {
    type?: OscType;
    volume?: number;
    attack?: number;
    release?: number;
    startAt?: number;
    endFreq?: number;
  } = {}
) {
  if (muted) return;
  const actx = getCtx();
  if (!actx) return;
  const {
    type = "square",
    volume = 0.1,
    attack = 0.005,
    release = 0.04,
    startAt = 0,
    endFreq,
  } = opts;
  const now = actx.currentTime + startAt;
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, endFreq),
      now + durationSec
    );
  }
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.setValueAtTime(volume, now + durationSec - release);
  gain.gain.linearRampToValueAtTime(0, now + durationSec);
  osc.connect(gain);
  gain.connect(actx.destination);
  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

function noise(durationSec: number, volume = 0.05) {
  if (muted) return;
  const actx = getCtx();
  if (!actx) return;
  const bufferSize = Math.floor(actx.sampleRate * durationSec);
  const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = actx.createBufferSource();
  source.buffer = buffer;
  const gain = actx.createGain();
  gain.gain.value = volume;
  const filter = actx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1200;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(actx.destination);
  source.start();
}

// --- Public sound effects ---

export const sfx = {
  hover: () => tone(880, 0.04, { type: "square", volume: 0.025 }),
  click: () =>
    tone(420, 0.07, {
      type: "square",
      volume: 0.08,
      endFreq: 260,
    }),
  flip: () => {
    noise(0.12, 0.04);
    tone(180, 0.09, { type: "sawtooth", volume: 0.04, endFreq: 340 });
  },
  correct: () => {
    const seq: [number, number][] = [
      [523.25, 0],
      [659.25, 0.08],
      [783.99, 0.16],
      [1046.5, 0.24],
    ];
    seq.forEach(([f, t]) =>
      tone(f, 0.18, { type: "square", volume: 0.09, startAt: t })
    );
  },
  wrong: () => {
    tone(220, 0.18, {
      type: "sawtooth",
      volume: 0.1,
      endFreq: 110,
    });
    tone(180, 0.25, {
      type: "square",
      volume: 0.06,
      endFreq: 80,
      startAt: 0.1,
    });
  },
  tick: () => tone(1400, 0.02, { type: "square", volume: 0.04 }),
  combo: (level: number) => {
    const base = 660 + level * 80;
    tone(base, 0.1, { type: "square", volume: 0.08 });
    tone(base * 1.5, 0.15, {
      type: "square",
      volume: 0.06,
      startAt: 0.06,
    });
  },
  victory: () => {
    const seq: [number, number][] = [
      [523.25, 0],
      [659.25, 0.1],
      [783.99, 0.2],
      [1046.5, 0.3],
      [1318.51, 0.42],
    ];
    seq.forEach(([f, t]) =>
      tone(f, 0.22, { type: "square", volume: 0.1, startAt: t })
    );
    tone(1568, 0.45, {
      type: "triangle",
      volume: 0.08,
      startAt: 0.5,
    });
  },
  gameOver: () => {
    const seq: [number, number][] = [
      [440, 0],
      [330, 0.18],
      [262, 0.36],
      [196, 0.54],
    ];
    seq.forEach(([f, t]) =>
      tone(f, 0.3, { type: "square", volume: 0.09, startAt: t })
    );
  },
  next: () =>
    tone(660, 0.08, {
      type: "square",
      volume: 0.06,
      endFreq: 880,
    }),
  achievement: () => {
    const seq: [number, number][] = [
      [659.25, 0],
      [783.99, 0.08],
      [987.77, 0.16],
      [1318.51, 0.24],
      [1567.98, 0.34],
    ];
    seq.forEach(([f, t]) =>
      tone(f, 0.2, { type: "triangle", volume: 0.1, startAt: t })
    );
    tone(2093, 0.5, { type: "square", volume: 0.05, startAt: 0.42 });
  },
  timeout: () => {
    tone(200, 0.3, {
      type: "sawtooth",
      volume: 0.1,
      endFreq: 80,
    });
  },
};
