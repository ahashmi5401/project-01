'use client';

import React, { useRef } from 'react';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import Link from 'next/link';

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
    <section className="py-24 bg-navy border-b border-hairline relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Navigation Controls */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <SectionEyebrow text="Professional Training" />
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-offwhite uppercase tracking-tight">
              Industry-Ready Engineering Courses
            </h2>
          </div>
          
          {/* Slider Controls */}
          {courses.length > 0 && (
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
          {courses.map((course) => (
            <div 
              key={course._id || course.id} 
              className="snap-start w-[290px] sm:w-[360px] flex-shrink-0 border border-hairline bg-navy/40 p-8 flex flex-col justify-between h-[380px] hover:border-accent/60 transition-all duration-300 relative group"
            >
              {/* Corner crosshairs for premium tech design */}
              <div className="absolute top-0 right-0 w-6 h-6 border-r border-t border-white/5 pointer-events-none group-hover:border-accent/20 transition-colors" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-white/5 pointer-events-none group-hover:border-accent/20 transition-colors" />

              <div>
                {/* Number & Icon Header */}
                <div className="flex justify-between items-start mb-6">
                  <span className="font-mono text-2xl font-bold text-accent select-none">
                    {course.id}
                  </span>
                  
                  {/* Premium customized SVG Icon based on course ID */}
                  <div className="w-14 h-14 border border-dashed border-white/20 flex items-center justify-center text-steelblue/40 group-hover:border-accent/40 group-hover:text-accent transition-colors relative">
                    {course.id === "01" ? (
                      // ANSYS FEA Mesh Icon
                      <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 24 24" role="img" aria-label="ANSYS FEA course icon">
                        <title>FEA Mesh Icon</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h18v18H3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 12h18M12 3v18M3 3l18 18M3 21L21 3" />
                        <circle cx="12" cy="12" r="3" fill="#0F2A47" />
                      </svg>
                    ) : course.id === "02" ? (
                      // Creo Parametric CAD Cube Icon
                      <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 24 24" role="img" aria-label="Creo Parametric CAD course icon">
                        <title>CAD Cube Icon</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5M12 13l8 5m-8-5l-8 5" />
                      </svg>
                    ) : course.id === "03" ? (
                      // ANSYS Fluent CFD Wave/Streamline Icon
                      <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 24 24" role="img" aria-label="ANSYS Fluent course icon">
                        <title>CFD Streamline Icon</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M2 8c4-2 8 2 12 0s8-2 10-2M2 12c4-2 8 2 12 0s8-2 10-2M2 16c4-2 8 2 12 0s8-2 10-2" />
                      </svg>
                    ) : course.id === "04" ? (
                      // SolidWorks Gear Icon
                      <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 24 24" role="img" aria-label="SolidWorks course icon">
                        <title>CAD Gear Icon</title>
                        <circle cx="12" cy="12" r="4" strokeWidth="1" />
                        <path strokeWidth="1" d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
                      </svg>
                    ) : (
                      // Integrated Capstone Checklist Icon
                      <svg className="w-8 h-8 stroke-current fill-none" viewBox="0 0 24 24" role="img" aria-label="Engineering Design course icon">
                        <title>Design Checklist Icon</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4M3 5h18v14H3z" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Info */}
                <h3 className="font-sans font-bold text-lg sm:text-xl text-offwhite mb-3 group-hover:text-accent transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-steelblue leading-relaxed line-clamp-3">
                  {course.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-hairline/40 flex flex-col gap-3">
                <WhatsAppButton 
                  message={`Hello SimuFlux, I would like to enroll in the "${course.title}" course.`}
                >
                  Enroll via WhatsApp
                </WhatsAppButton>
                
                <Link
                  href={`/courses/${course.slug}`}
                  className="font-mono text-3xs uppercase tracking-wider text-steelblue hover:text-offwhite transition-colors text-center py-2 border border-hairline/40 hover:border-offwhite"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/courses"
            className="font-mono text-xs uppercase tracking-wider text-accent border border-accent/20 px-6 py-3 hover:bg-accent/5 active:bg-accent/10 transition-colors inline-block"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
