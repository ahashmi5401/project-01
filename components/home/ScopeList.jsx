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
    <section className="py-4xl bg-navy border-b border-hairline relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Navigation Controls */}
        <div className="flex items-end justify-between mb-xl">
          <div>
            <SectionEyebrow text="Engineering Capabilities" />
            <h2 className="font-sans font-bold text-h2 sm:text-h1 text-offwhite uppercase tracking-tight">
              Consultancy & Services Scope
            </h2>
          </div>
          
          {/* Slider controls (only visible if there are multiple services) */}
          {services.length > 0 && (
            <div className="hidden sm:flex items-center gap-sm">
              <button
                onClick={() => scroll('left')}
                className="w-12 h-12 border border-hairline hover:border-accent flex items-center justify-center text-steelblue hover:text-offwhite transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-12 h-12 border border-hairline hover:border-accent flex items-center justify-center text-steelblue hover:text-offwhite transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
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
              className="snap-start w-[290px] sm:w-[360px] flex-shrink-0 border border-hairline bg-navy/40 shadow-elevation-sm hover:shadow-elevation-md hover:border-accent/50 rounded-lg overflow-hidden transition-all duration-300 relative group"
            >
              {/* Image Thumbnail at Top */}
              {service.image ? (
                <div className="relative w-full h-40 bg-navy/50 overflow-hidden border-b border-hairline">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                      e.target.parentElement.innerHTML = '<div class="w-16 h-16 border border-dashed border-white/20 flex items-center justify-center text-steelblue/40"><svg class="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5" /></svg></div>';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-navy/50 border-b border-hairline flex items-center justify-center">
                  <div className="w-16 h-16 border border-dashed border-white/20 flex items-center justify-center text-steelblue/40">
                    <svg className="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5M12 13l8 5m-8-5l-8 5" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Card Content */}
              <div className="p-xl flex flex-col flex-grow">
                {/* Structural Motif: Number in Accent color */}
                <div className="flex justify-between items-start mb-md border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label text-steelblue">
                    SERVICE REF
                  </span>
                  <span className="font-mono text-h3 font-bold text-accent">
                    {service.id}
                  </span>
                </div>

                <div className="flex-grow mb-lg">
                  <h3 className="font-sans font-semibold text-h3 text-offwhite mb-sm group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                  <p className="font-sans text-caption text-steelblue leading-relaxed line-clamp-2">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="border-t border-hairline/40 pt-lg">
                  <Link
                    href={`/consultancy/${service.slug}`}
                    className="font-mono text-label uppercase tracking-wider text-accent hover:text-offwhite transition-colors flex items-center gap-sm"
                  >
                    <span>Explore Scope</span>
                    <svg className="w-4 h-4 stroke-current fill-none transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-xl text-center">
          <Link
            href="/consultancy"
            className="inline-flex items-center gap-2 font-mono text-label uppercase tracking-wider text-accent border border-accent/20 px-xl py-sm hover:bg-accent/5 active:bg-accent/10 transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
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
