import React from 'react';

export default function SectionEyebrow({ text }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-steelblue mb-3 select-none">
      <span className="w-1.5 h-1.5 bg-accent" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
