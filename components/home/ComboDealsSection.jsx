'use client';

import React from 'react';
import Link from 'next/link';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';

// Helper to generate a URL-safe slug from title (fallback)
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ComboDealsSection({ comboDeals = [], courses = [] }) {
  if (!comboDeals || comboDeals.length === 0) return null;

  return (
    <section className="py-3xl sm:py-4xl lg:py-5xl bg-navy border-b border-hairline relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-navy/90 pointer-events-none" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header Block */}
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

        {/* Combo Deal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg sm:gap-xl">
          {comboDeals.map((deal, index) => {
            // Find courses belonging to this deal
            const dealCourses = courses.filter(c => 
              deal.courseIds?.includes(c._id) || 
              deal.courseSlugs?.includes(c.slug)
            );

            // Calculate pricing
            const hasInquiryCourse = dealCourses.some(c => c.price === null || c.price === undefined);
            const knownTotal = dealCourses.reduce(
              (sum, c) => sum + (c.price !== null && c.price !== undefined ? c.price : 0), 0
            );
            const finalPrice = !hasInquiryCourse && knownTotal > 0
              ? Math.round(knownTotal * (1 - deal.discountPercent / 100))
              : null;

            const courseCount = deal.courseIds?.length || deal.courseSlugs?.length || 0;
            const courseBadgeText = `${courseCount} Course Combo`;
            
            const comboTitle = deal.title || deal.label || 'Course Combo Package';
            const comboDescription = deal.description || `Register for ${dealCourses.map(c => c.title).join(' + ')} as a bundle and save instantly.`;
            const comboSlug = deal.slug || generateSlug(comboTitle);

            const durationText = deal.duration 
              ? `${deal.duration} | ${deal.classesPerWeek || '2 classes/wk'}`
              : dealCourses.map(c => c.duration?.totalDuration || c.duration || '').filter(Boolean)[0] || '';

            return (
              <AnimatedReveal key={`deal-${deal._id || index}`} delay={index * 0.1}>
                <div className="group relative bg-navy border border-white/10 rounded-xl overflow-hidden transition-all duration-300 w-full flex flex-col min-h-[380px] sm:min-h-[400px] pb-md">
                  
                  {/* Image - clickable to details */}
                  <Link href={`/courses/combos/${comboSlug}`} className="block relative w-full aspect-video overflow-hidden bg-navy border-b border-white/10">
                    {deal.image ? (
                      <img
                        src={deal.image}
                        alt={comboTitle}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-navy/60">
                              <svg class="w-16 h-16 text-steelblue/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 3L4 8v8l8 5 8-5V8z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 3v18M4 8l8 5 8-5M12 13l8 5m-8-5l-8 5" />
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-navy/60">
                        <svg className="w-16 h-16 text-steelblue/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5M12 13l8 5m-8-5l-8 5" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Card Content */}
                  <div className="p-lg flex flex-col flex-grow">
                    
                    {/* Category/Combo Badge */}
                    <div className="mb-sm">
                      <span className="inline-flex items-center px-sm py-xs text-caption font-sans font-medium text-accent bg-accent/10 rounded border border-accent/30">
                        {courseBadgeText}
                      </span>
                    </div>

                    {/* Discount Badge */}
                    <div className="mb-sm">
                      <span className="font-sans text-label font-bold text-accent">
                        {deal.discountPercent}% OFF
                      </span>
                    </div>

                    {/* Title - clickable to details */}
                    <Link href={`/courses/combos/${comboSlug}`} className="block">
                      <h3 className="font-sans font-semibold text-h4 text-offwhite mb-sm line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                        {comboTitle}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="font-sans text-caption sm:text-small text-steelblue/70 line-clamp-2 mb-sm leading-relaxed">
                      {comboDescription}
                    </p>

                    {/* Duration Info */}
                    {durationText && (
                      <div className="flex items-center gap-sm mb-sm mt-xs">
                        <svg className="w-4 h-4 text-steelblue/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-sans text-caption text-steelblue/60">
                          {durationText}
                        </span>
                      </div>
                    )}

                    {/* Pricing & CTA */}
                    <div className="flex items-center justify-between pt-sm border-t border-white/10 mt-auto gap-sm">
                      <div>
                        {knownTotal > 0 && (
                          <span className="font-sans text-caption text-steelblue/50 line-through block">
                            PKR {knownTotal.toLocaleString()}{hasInquiryCourse ? ' + Price Inquiry' : ''}
                          </span>
                        )}
                        {hasInquiryCourse ? (
                          <span className="font-sans text-body font-bold text-accent">Price Inquiry</span>
                        ) : finalPrice > 0 ? (
                          <span className="font-sans text-body font-bold text-accent">PKR {finalPrice.toLocaleString()}</span>
                        ) : (
                          <span className="font-sans text-body font-bold text-accent">Custom Pricing</span>
                        )}
                      </div>

                      <Link
                        href={`/courses/combos/${comboSlug}`}
                        className="px-md py-sm bg-accent text-offwhite font-sans text-label uppercase font-medium rounded-md hover:bg-[#d04e1b] transition-all duration-300 font-semibold text-sm"
                      >
                        View Details →
                      </Link>
                    </div>

                  </div>
                </div>
              </AnimatedReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
