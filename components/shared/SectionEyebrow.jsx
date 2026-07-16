import React from 'react';

export default function SectionEyebrow({ text }) {
  return (
    <div className="flex items-center gap-sm font-mono text-label uppercase tracking-widest text-steelblue mb-md select-none">
      <span className="w-1.5 h-1.5 bg-accent" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
