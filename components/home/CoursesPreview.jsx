'use client';

import React, { useRef } from 'react';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import Link from 'next/link';
import CourseCard from './CourseCard';

export default function CoursesPreview({ courses = [] }) {
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
            <SectionEyebrow text="Professional Training" />
            <h2 className="font-sans font-bold text-h3 sm:text-h2 lg:text-h1 text-offwhite uppercase tracking-tight">
              Industry-Ready Engineering Courses
            </h2>
          </div>
          
          {/* Slider Controls */}
          {courses.length > 0 && (
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
          {courses.map((course) => (
            <CourseCard
              key={course._id || course.id}
              image={course.image}
              courseNumber={course.id}
              category={course.category}
              title={course.title}
              description={course.description}
              duration={course.duration}
              price={course.price}
              discountPercent={course.discountPercent || 0}
              slug={course.slug}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-xl">
          <Link
            href="/courses"
            className="font-sans text-label uppercase tracking-wider text-accent border border-accent/20 px-xl py-sm hover:bg-accent/5 active:bg-accent/10 transition-colors inline-block rounded font-semibold"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
