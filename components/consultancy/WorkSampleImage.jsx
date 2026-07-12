'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function WorkSampleImage({ src, alt, serviceId }) {
  const [hasError, setHasError] = useState(false);

  // TODO: replace with real project photos/renders from the client once available
  if (hasError) {
    return (
      <div className="relative aspect-video w-full border border-dashed border-white/20 bg-white/5 flex items-center justify-center overflow-hidden">
        {/* Abstract Blueprint Grid Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy/40 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,_rgba(255,255,255,0.03)_25%,_transparent_25%,_transparent_50%,_rgba(255,255,255,0.03)_50%,_rgba(255,255,255,0.03)_75%,_transparent_75%,_transparent)] bg-[size:24px_24px]" />
        
        {/* Technical crosshair lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5" />

        <div className="z-10 text-center p-6 select-none font-mono">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">
            DWG REF: WS-{serviceId}
          </p>
          <p className="text-[9px] text-steelblue/60 uppercase tracking-widest leading-relaxed max-w-[260px] mx-auto border border-dashed border-steelblue/20 p-2.5 bg-navy/80">
            WORK SAMPLE — TODO: ADD PROJECT IMAGE
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full border border-hairline overflow-hidden bg-navy/50">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-w-7xl) 100vw, 50vw"
        className="object-cover transition-transform duration-500 hover:scale-105"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
