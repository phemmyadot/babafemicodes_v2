"use client";

import { DecodeText } from "./DecodeText";

export function SectionHeader({
  index,
  code,
  title,
  meta,
}: {
  index: string;
  code: string;
  title: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 border-b border-line pb-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="label mb-2 flex items-center gap-2 text-cyan-neon/80">
          <span className="text-cyan-neon">{index}</span>
          <span className="h-px w-8 bg-cyan-neon/50" />
          <span>{code}</span>
        </div>
        <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl">
          <DecodeText text={title} trigger="inView" />
        </h2>
      </div>
      {meta && <div className="label text-left sm:text-right">{meta}</div>}
    </div>
  );
}
