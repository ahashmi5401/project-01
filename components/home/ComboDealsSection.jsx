'use client';

import React from 'react';
import Link from 'next/link';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';

export default function ComboDealsSection({ comboDeals = [] }) {
  if (!comboDeals || comboDeals.length === 0) return null;

  return (
    <section className="py-3xl sm:py-4xl lg:py-5xl bg-navy border-b border-hairline relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-navy/90 pointer-events-none" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header Block — same style as original */}
        <AnimatedReveal>
          <div className="border-b border-hairline pb-lg sm:pb-xl mb-2xl sm:mb-3xl">
            <SectionEyebrow text="Bundle & Save" />
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <h2 className="font-sans font-bold text-h3 sm:text-h2 lg:text-h1 text-offwhite uppercase tracking-tight">
                Save More When You Learn More
              </h2>
              <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" />
            </div>
          </div>
        </AnimatedReveal>

        {/* Combo Deal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg sm:gap-xl">
          {comboDeals.map((deal, index) => (
            <AnimatedReveal key={`deal-${deal._id || index}`} delay={index * 0.1}>
              <Link
                href="/enroll"
                className="group relative bg-navy rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/10 min-h-[340px] sm:min-h-[380px]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-xl sm:p-2xl flex flex-col h-full relative z-10">
                  {/* Deal Badge */}
                  <div className="flex justify-between items-start mb-lg sm:mb-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 bg-gradient-to-b from-accent to-accent/50 rounded-full" />
                      <span className="font-sans text-[10px] sm:text-caption uppercase tracking-widest text-steelblue font-semibold">
                        COMBO DEAL
                      </span>
                    </div>
                    <span className="font-sans text-[10px] sm:text-caption font-bold text-accent bg-accent/10 px-sm py-xs rounded shadow-elevation-sm">
                      {deal.courseIds?.length || deal.courseSlugs?.length || 0} COURSES
                    </span>
                  </div>

                  {/* Discount Percentage */}
                  <div className="mb-lg sm:mb-xl">
                    <div className="font-sans font-bold text-h2 sm:text-display text-accent leading-none mb-sm group-hover:scale-105 transition-transform duration-300">
                      {deal.discountPercent}% OFF
                    </div>
                    <div className="font-sans text-small sm:text-body text-offwhite/70 tracking-wide font-medium">
                      BUNDLE PACKAGE
                    </div>
                  </div>

                  {/* Label */}
                  {deal.label && (
                    <p className="font-sans text-small sm:text-body text-offwhite/90 leading-relaxed mb-lg sm:mb-xl flex-grow">
                      {deal.label}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="border-t border-white/10 pt-lg sm:pt-xl mt-auto">
                    <div className="font-sans text-label uppercase tracking-wider text-offwhite/80 group-hover:text-accent transition-colors flex items-center gap-sm font-semibold">
                      <span>View Bundle</span>
                      <svg className="w-4 h-4 stroke-current fill-none transform group-hover:translate-x-2 transition-transform" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
