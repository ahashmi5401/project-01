'use client';

import React from 'react';
import Link from 'next/link';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';

export default function DiscountPromo({ discountTiers = [] }) {
  if (!discountTiers || discountTiers.length === 0) return null;

  return (
    <section className="py-24 bg-navy border-b border-hairline relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/40 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <AnimatedReveal>
          <div className="border-b border-hairline pb-8 mb-16">
            <SectionEyebrow text="Bundle & Save" />
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-offwhite uppercase tracking-tight">
              Save More When You Learn More
            </h2>
          </div>
        </AnimatedReveal>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {discountTiers.map((tier, index) => (
            <AnimatedReveal key={tier._id || index} delay={index * 0.1}>
              <div className="border border-hairline bg-navy/40 p-8 flex flex-col justify-between h-[280px] relative group hover:border-accent/60 transition-all duration-300">
                {/* Blueprint Corners */}
                <div className="absolute top-0 right-0 w-6 h-6 border-r border-t border-white/5 pointer-events-none group-hover:border-accent/20 transition-colors" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-white/5 pointer-events-none group-hover:border-accent/20 transition-colors" />

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-steelblue">
                      VOLUME DISCOUNT
                    </span>
                    <span className="font-mono text-xs font-bold text-accent">
                      [ TIER 0{index + 1} ]
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-xl text-offwhite mb-2 uppercase">
                    {tier.minCourses} Courses Selected
                  </h3>
                  <div className="font-mono text-3xl font-bold text-accent mb-4">
                    {tier.discountPercent}% SAVINGS
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-steelblue leading-relaxed">
                    Enroll in {tier.minCourses} or more courses and get a {tier.discountPercent}% flat discount applied to your total package instantly.
                  </p>
                </div>

                <div className="pt-4 border-t border-hairline/40">
                  <Link
                    href={`/enroll`}
                    className="font-mono text-2xs uppercase tracking-wider text-steelblue group-hover:text-accent transition-colors flex items-center gap-1.5"
                  >
                    <span>Configure Package</span>
                    <svg className="w-3.5 h-3.5 stroke-current fill-none transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </AnimatedReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
