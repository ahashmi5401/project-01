'use client';

import React, { useRef } from 'react';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import Link from 'next/link';

export default function ScopeList({ services = [] }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      // Scroll by card width + gap (approx 384px)
      const scrollAmount = 384;
      const scrollTo = direction === 'left' 
        ? scrollLeft - scrollAmount 
        : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-navy border-b border-hairline relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Navigation Controls */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <SectionEyebrow text="Engineering Capabilities" />
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-offwhite uppercase tracking-tight">
              Consultancy & Services Scope
            </h2>
          </div>
          
          {/* Slider controls (only visible if there are multiple services) */}
          {services.length > 0 && (
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => scroll('left')}
                className="w-12 h-12 border border-hairline hover:border-accent flex items-center justify-center text-steelblue hover:text-offwhite transition-colors"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-12 h-12 border border-hairline hover:border-accent flex items-center justify-center text-steelblue hover:text-offwhite transition-colors"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Scroll Track */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-8"
        >
          {services.map((service) => (
            <div 
              key={service._id || service.id} 
              className="snap-start w-[290px] sm:w-[360px] flex-shrink-0 border border-hairline bg-navy/40 p-8 flex flex-col justify-between h-[300px] hover:border-accent/60 transition-all duration-300 relative group"
            >
              {/* Corner crosshairs for premium tech design */}
              <div className="absolute top-0 right-0 w-6 h-6 border-r border-t border-white/5 pointer-events-none group-hover:border-accent/20 transition-colors" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-white/5 pointer-events-none group-hover:border-accent/20 transition-colors" />

              <div>
                {/* Numeric Indicator */}
                <div className="font-mono text-2xl font-bold text-accent mb-6 select-none">
                  {service.id}
                </div>
                
                {/* Content */}
                <h3 className="font-sans font-bold text-lg sm:text-xl text-offwhite mb-3 group-hover:text-accent transition-colors line-clamp-1">
                  {service.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-steelblue leading-relaxed line-clamp-3">
                  {service.shortDescription}
                </p>
              </div>

              {/* Link */}
              <div className="pt-4 border-t border-hairline/40">
                <Link
                  href={`/consultancy/${service.slug}`}
                  className="font-mono text-2xs uppercase tracking-wider text-steelblue group-hover:text-accent transition-colors flex items-center gap-1.5"
                >
                  <span>Explore Scope</span>
                  <svg className="w-3.5 h-3.5 stroke-current fill-none transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/consultancy"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent border border-accent/20 px-6 py-3 hover:bg-accent/5 active:bg-accent/10 transition-colors"
          >
            <span>View All Consultancy Services</span>
            <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
