"use client";

import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 leading-relaxed text-fog-light last:mb-0">{children}</p>,
    h3: ({ children }) => <h3 className="mb-3 mt-6 font-display text-lg uppercase tracking-wide text-white">{children}</h3>,
    h4: ({ children }) => <h4 className="label mb-2 mt-5 text-cyan-neon">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="mb-4 border-l-2 border-cyan-neon/60 pl-4 font-mono text-sm text-fog">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-4 space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-5">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex gap-3 text-fog-light">
        <span className="mt-2 h-1 w-1 shrink-0 bg-cyan-neon" aria-hidden />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    code: ({ children }) => (
      <code className="border border-line bg-obsidian-700 px-1.5 py-0.5 font-mono text-[0.85em] text-phosphor">{children}</code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-cyan-neon underline decoration-cyan-neon/40 underline-offset-4 hover:decoration-cyan-neon"
      >
        {children}
      </a>
    ),
  },
};

export function PortableBody({ value }: { value: PortableTextBlock[] }) {
  if (!value?.length) return null;
  return <PortableText value={value} components={components} />;
}
