"use client";

interface DomScoreProps {
  score: number;
}

export function DomScore({ score }: DomScoreProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-dom-fg/80 px-2.5 py-1 text-white font-fraunces font-700 text-xs">
      <span className="text-dom-primary text-[10px]">◆</span>
      {score}
    </span>
  );
}
