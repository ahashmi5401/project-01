'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function WorkSampleImage({ src, alt, serviceId }) {
  const [hasError, setHasError] = useState(false);

  // TODO: replace with real project photos/renders from the client once available
  if (hasError) {
    return (
      <div className="relative aspect-video w-full border border-dashed border-white/20 bg-white/5 flex items-center justify-center overflow-hidden">

        <div className="z-10 text-center p-xl select-none font-mono">
          <p className="text-label uppercase tracking-widest text-accent mb-sm">
            DWG REF: WS-{serviceId}
          </p>
          <p className="text-caption text-steelblue/60 uppercase tracking-widest leading-relaxed max-w-[260px] mx-auto border border-dashed border-steelblue/20 p-md bg-navy/80">
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
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
