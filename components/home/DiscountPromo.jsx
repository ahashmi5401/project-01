'use client';

import React from 'react';
import Link from 'next/link';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';

export default function DiscountPromo({ discountTiers = [], comboDeals = [] }) {
  if ((!discountTiers || discountTiers.length === 0) && (!comboDeals || comboDeals.length === 0)) return null;

  return (
    <section className="py-4xl bg-navy border-b border-hairline relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/40 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <AnimatedReveal>
          <div className="border-b border-hairline pb-xl mb-3xl">
            <SectionEyebrow text="Bundle & Save" />
            <h2 className="font-sans font-bold text-h2 sm:text-h1 text-offwhite uppercase tracking-tight">
              Save More When You Learn More
            </h2>
          </div>
        </AnimatedReveal>

        {/* Promo Grid - Combined Volume Discounts and Combo Deals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
          {/* Volume Discount Tiers */}
          {discountTiers && discountTiers.map((tier, index) => (
            <AnimatedReveal key={`tier-${tier._id || index}`} delay={index * 0.1}>
              <Link
                href={`/enroll`}
                className="border border-hairline bg-navy/40 shadow-elevation-sm hover:shadow-elevation-md hover:border-accent/50 rounded-lg overflow-hidden transition-all duration-300 relative group block"
              >
                <div className="p-xl flex flex-col h-full">
                  {/* Tier Badge */}
                  <div className="flex justify-between items-start mb-lg">
                    <span className="font-mono text-caption uppercase tracking-widest text-steelblue">
                      VOLUME DISCOUNT
                    </span>
                    <span className="font-mono text-caption font-bold text-accent border border-accent/30 bg-accent/5 px-sm py-xs rounded">
                      TIER 0{index + 1}
                    </span>
                  </div>

                  {/* Discount Percentage - Focal Point */}
                  <div className="mb-lg">
                    <div className="font-sans font-bold text-display text-accent leading-none mb-sm">
                      {tier.discountPercent}% OFF
                    </div>
                    <div className="font-mono text-body text-offwhite/80">
                      {tier.minCourses}+ COURSES
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-sans text-caption text-steelblue leading-relaxed mb-lg flex-grow">
                    Enroll in {tier.minCourses} or more courses and get instant savings on your total package.
                  </p>

                  {/* CTA */}
                  <div className="border-t border-hairline/40 pt-lg mt-auto">
                    <div className="font-mono text-label uppercase tracking-wider text-offwhite group-hover:text-accent transition-colors flex items-center gap-sm">
                      <span>Configure Package</span>
                      <svg className="w-4 h-4 stroke-current fill-none transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedReveal>
          ))}

          {/* Combo Deals */}
          {comboDeals && comboDeals.map((deal, index) => (
            <AnimatedReveal key={`deal-${deal._id || index}`} delay={(discountTiers?.length || 0) * 0.1 + index * 0.1}>
              <Link
                href={`/enroll`}
                className="border border-hairline bg-navy/40 shadow-elevation-sm hover:shadow-elevation-md hover:border-accent/50 rounded-lg overflow-hidden transition-all duration-300 relative group block"
              >
                <div className="p-xl flex flex-col h-full">
                  {/* Deal Badge */}
                  <div className="flex justify-between items-start mb-lg">
                    <span className="font-mono text-caption uppercase tracking-widest text-steelblue">
                      COMBO DEAL
                    </span>
                    <span className="font-mono text-caption font-bold text-accent border border-accent/30 bg-accent/5 px-sm py-xs rounded">
                      {deal.courseIds?.length || deal.courseSlugs?.length || 0} COURSES
                    </span>
                  </div>

                  {/* Discount Percentage - Focal Point */}
                  <div className="mb-lg">
                    <div className="font-sans font-bold text-display text-accent leading-none mb-sm">
                      {deal.discountPercent}% OFF
                    </div>
                    <div className="font-mono text-body text-offwhite/80">
                      BUNDLE PACKAGE
                    </div>
                  </div>

                  {/* Label */}
                  {deal.label && (
                    <p className="font-sans text-body text-offwhite leading-relaxed mb-lg flex-grow">
                      {deal.label}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="border-t border-hairline/40 pt-lg mt-auto">
                    <div className="font-mono text-label uppercase tracking-wider text-offwhite group-hover:text-accent transition-colors flex items-center gap-sm">
                      <span>View Bundle</span>
                      <svg className="w-4 h-4 stroke-current fill-none transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24">
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
