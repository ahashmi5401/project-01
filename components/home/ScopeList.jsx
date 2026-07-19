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
    <section className="py-3xl sm:py-4xl bg-navy border-b border-hairline relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-xl">
          <div>
            <SectionEyebrow text="Engineering Capabilities" />
            <h2 className="font-sans font-bold text-h3 sm:text-h2 lg:text-h1 text-offwhite uppercase tracking-tight">
              Consultancy & Services Scope
            </h2>
          </div>
          
          {/* Slider controls (only visible if there are multiple services) */}
          {services.length > 0 && (
            <div className="hidden sm:flex items-center gap-sm">
              <button
                onClick={() => scroll('left')}
                className="w-12 h-12 border border-hairline hover:border-white/20 flex items-center justify-center text-steelblue hover:text-offwhite transition-colors rounded"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-12 h-12 border border-hairline hover:border-white/20 flex items-center justify-center text-steelblue hover:text-offwhite transition-colors rounded"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          {/* Mobile swipe hint */}
          <div className="sm:hidden flex items-center gap-sm text-steelblue/50 text-caption">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span>Swipe to browse</span>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-8 -mx-4 sm:mx-0 px-4 sm:px-0"
        >
          {services.map((service) => (
            <div 
              key={service._id || service.id} 
              className="snap-start w-[280px] sm:w-[320px] lg:w-[360px] flex-shrink-0 bg-navy border border-white/10 rounded-xl overflow-hidden transition-all duration-300 relative group min-h-[440px] sm:min-h-[480px] pb-md flex flex-col"
            >
              {/* Image Thumbnail at Top - clickable to details */}
              <Link href={`/consultancy?service=${service.slug}`} className="relative w-full h-36 sm:h-40 bg-navy overflow-hidden border-b border-white/10 block">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                      e.target.parentElement.innerHTML = '<div class="w-16 h-16 border border-dashed border-white/20 flex items-center justify-center text-steelblue/40"><svg class="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5" /></svg></div>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 border border-dashed border-white/20 flex items-center justify-center text-steelblue/40">
                      <svg className="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5M12 13l8 5m-8-5l-8 5" />
                      </svg>
                    </div>
                  </div>
                )}
              </Link>

              {/* Card Content */}
              <div className="p-lg flex flex-col flex-grow">
                {/* Structural Motif: Number in Accent color */}
                <div className="flex justify-between items-start mb-sm border-b border-white/10 pb-sm">
                  <span className="font-sans text-caption text-steelblue">
                    SERVICE REF
                  </span>
                  <span className="font-sans text-h3 font-bold text-accent">
                    {service.id}
                  </span>
                </div>

                <div className="flex-grow mb-sm">
                  <Link href={`/consultancy?service=${service.slug}`} className="block">
                    <h3 className="font-sans font-semibold text-h4 sm:text-h3 text-offwhite mb-sm group-hover:text-accent transition-colors leading-tight">
                      {service.title}
                    </h3>
                  </Link>
                  <p className="font-sans text-caption text-steelblue/70 leading-relaxed line-clamp-2">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="mt-auto pt-sm">
                  <Link
                    href={`/consultancy?service=${service.slug}`}
                    className="w-full inline-flex items-center justify-center gap-sm font-sans text-label uppercase tracking-wider text-offwhite bg-accent hover:bg-[#d04e1b] py-sm rounded-md transition-all duration-300 font-semibold"
                  >
                    <span>Details →</span>
                    <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-xl">
          <Link
            href="/consultancy"
            className="inline-flex items-center gap-sm font-sans text-label uppercase tracking-wider text-accent border border-accent/20 px-xl py-sm hover:bg-accent/5 active:bg-accent/10 transition-colors inline-block rounded font-semibold"
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
