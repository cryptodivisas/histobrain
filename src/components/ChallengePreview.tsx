"use client";

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export default function ChallengePreview({
  dailyNumber,
  onStart,
}: {
  dailyNumber: number;
  onStart: () => void;
}) {
  return (
    <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-4 items-stretch">
      <div className="bg-[var(--hb-panel)] pixel-border p-5 sm:p-7 flex flex-col justify-center gap-4">
        <span className="text-[var(--hb-muted)] text-[10px] tracking-[0.2em]">
          FRIENDLY COMPETITION
        </span>
        <h2 className="text-[var(--hb-accent-3)] text-lg sm:text-2xl tracking-widest leading-relaxed" style={hf}>
          PLAY. SHARE. CHALLENGE.
        </h2>
        <p className="text-[var(--hb-text)] text-lg leading-snug">
          Finish a round to generate a score link your friends can open. Daily
          mode gives everyone the same five questions.
        </p>
        <button type="button" onClick={onStart} className="pixel-btn self-stretch sm:self-start">
          &gt; PLAY DAILY #{dailyNumber}
        </button>
      </div>

      <div className="bg-[var(--hb-bg)] pixel-border p-4 sm:p-6 flex flex-col gap-4" aria-label="Example shared result">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--hb-accent)] text-xs tracking-widest" style={hf}>HISTORY_BRAIN</span>
          <span className="text-[var(--hb-muted)] text-[10px] tracking-widest">SHARE PREVIEW</span>
        </div>
        <div className="bg-[var(--hb-panel)] p-4 flex flex-col gap-3">
          <span className="text-[var(--hb-accent-2)] text-xs tracking-widest" style={hf}>DAILY #{dailyNumber}</span>
          <div className="flex gap-2" aria-label="Example result: four correct, one incorrect">
            {[true, true, true, false, true].map((correct, index) => (
              <span
                key={index}
                className={`w-8 h-8 ${correct ? "bg-[var(--hb-accent)]" : "bg-[var(--hb-wrong)]"}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ShareStat label="Score" value="742" />
            <ShareStat label="Accuracy" value="80%" />
          </div>
        </div>
        <p className="text-[var(--hb-muted)] text-sm leading-relaxed">
          Example only. Your real result creates a unique challenge page with
          its own social preview.
        </p>
      </div>
    </section>
  );
}

function ShareStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--hb-bg)] p-3">
      <div className="text-[9px] text-[var(--hb-muted)] tracking-widest">{label.toUpperCase()}</div>
      <div className="mt-1 text-[var(--hb-accent-2)] text-lg" style={hf}>{value}</div>
    </div>
  );
}
