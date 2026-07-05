"use client";

import Image from "next/image";
import { useState } from "react";

const OPTIONS = [
  { name: "Eiffel Tower", image: "/questions/8ab7452248314ab7.jpg", correct: false },
  { name: "Apollo 11", image: "/questions/0719509d0e2e4b8f.jpg", correct: true },
  { name: "Statue of Liberty", image: "/questions/3a5f5b5d9422cc8b.jpg", correct: false },
] as const;

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export default function GameplayPreview() {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = selected !== null && OPTIONS[selected].correct;

  return (
    <section aria-labelledby="try-a-question" className="w-full max-w-4xl bg-[var(--hb-panel)] pixel-border p-4 sm:p-7 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="flex flex-col gap-2">
          <span className="text-[var(--hb-muted)] text-[10px] tracking-[0.2em]">LIVE PREVIEW</span>
          <h2 id="try-a-question" className="text-[var(--hb-accent)] text-lg sm:text-2xl tracking-widest" style={hf}>
            TRY ONE QUESTION
          </h2>
        </div>
        <span className="text-[var(--hb-accent-2)] text-[10px] tracking-widest" style={hf}>NO TIMER · NO SCORE</span>
      </div>

      <p className="text-[var(--hb-text)] text-xl sm:text-2xl leading-snug">
        Which historic mission first landed humans on the Moon in 1969?
      </p>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {OPTIONS.map((option, index) => {
          const isSelected = selected === index;
          const showCorrect = answered && option.correct;
          const showWrong = isSelected && !option.correct;
          return (
            <button
              key={option.name}
              type="button"
              onClick={() => setSelected(index)}
              disabled={answered}
              aria-label={option.name}
              className={`relative bg-[var(--hb-bg)] p-1.5 sm:p-2 transition-all ${
                showCorrect ? "pixel-border-accent" : showWrong ? "pixel-border-wrong" : "pixel-border hover:-translate-y-1"
              } ${answered && !showCorrect && !showWrong ? "opacity-40" : ""}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={option.image}
                  alt=""
                  fill
                  className={`object-cover transition-all duration-500 ${answered ? "" : "blur-md scale-110"}`}
                  sizes="(max-width: 640px) 30vw, 240px"
                />
                {!answered && (
                  <span className="absolute inset-0 flex items-center justify-center text-[var(--hb-accent)] text-xl sm:text-4xl" style={hf}>?</span>
                )}
              </div>
              <span className="block py-2 text-[8px] sm:text-xs text-[var(--hb-text)] tracking-wider leading-relaxed" style={hf}>
                {option.name}
              </span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div role="status" className={`p-4 border-2 ${correct ? "border-[var(--hb-accent)]" : "border-[var(--hb-wrong)]"}`}>
          <div className={correct ? "text-[var(--hb-accent)]" : "text-[var(--hb-wrong)]"} style={hf}>
            {correct ? "> CORRECT" : "> NOT QUITE — APOLLO 11"}
          </div>
          <p className="mt-2 text-[var(--hb-text)] text-lg leading-snug">
            Apollo 11 landed Neil Armstrong and Buzz Aldrin on the Moon on July 20, 1969, while Michael Collins remained in lunar orbit.
          </p>
          <button type="button" onClick={() => setSelected(null)} className="mt-3 text-[var(--hb-accent-2)] text-xs tracking-widest hover:underline" style={hf}>
            &gt; RESET PREVIEW
          </button>
        </div>
      )}
    </section>
  );
}
