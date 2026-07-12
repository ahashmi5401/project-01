'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AnimatedReveal from '@/components/shared/AnimatedReveal';

const ITEMS_PER_PAGE = 6;

export default function CoursesGrid({ courses = [] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  const showPagination = courses.length > ITEMS_PER_PAGE;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleCourses = courses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {visibleCourses.map((course, index) => (
          <AnimatedReveal key={course._id || course.id} delay={index * 0.15}>
            <Link
              href={`/courses/${course.slug}`}
              className="border border-hairline bg-navy/40 p-8 flex flex-col justify-between h-full transition-all duration-300 relative group cursor-pointer hover:border-accent hover:bg-white/[0.01]"
            >
              {/* Number & Icon Header */}
              <div className="flex justify-between items-start mb-8">
                <span className="font-mono text-2xl font-bold text-accent">
                  {course.id}
                </span>

                {/* Course Thumbnail SVG Icon Placeholder */}
                <div className="w-16 h-16 border border-dashed border-white/20 flex items-center justify-center text-steelblue/40 group-hover:border-accent/40 group-hover:text-accent transition-colors relative">
                  {course.id === '01' ? (
                    // ANSYS FEA Mesh Icon
                    <svg className="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24" role="img" aria-label="ANSYS FEA course icon">
                      <title>FEA Mesh Icon</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h18v18H3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 12h18M12 3v18M3 3l18 18M3 21L21 3" />
                      <circle cx="12" cy="12" r="3" fill="#0F2A47" />
                    </svg>
                  ) : (
                    // Creo Parametric CAD Isometric Cube Icon
                    <svg className="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24" role="img" aria-label="Creo Parametric CAD course icon">
                      <title>CAD Cube Icon</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5M12 13l8 5m-8-5l-8 5" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="mb-8 flex-grow">
                <h3 className="font-sans font-bold text-xl text-offwhite mb-2 group-hover:text-accent transition-colors">
                  {course.title}
                </h3>
                {/* Online delivery and price labels */}
                <div className="flex flex-wrap gap-2 items-center mb-3">
                  <span className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider text-accent/70 border border-accent/20 bg-accent/5 px-2 py-0.5">
                    ● Online Delivery
                  </span>
                  {course.price && (
                    <span className="inline-flex items-center font-mono text-2xs uppercase tracking-wider text-offwhite border border-white/10 bg-white/5 px-2 py-0.5">
                      PKR {course.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="font-sans text-sm sm:text-base text-steelblue leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="border-t border-hairline/60 pt-4 flex justify-between items-center text-xs font-mono text-steelblue/50">
                <span>CURRICULUM SPEC: {course.id}</span>
                <span className="text-accent group-hover:animate-pulse">● VIEW CURRICULUM</span>
              </div>
            </Link>
          </AnimatedReveal>
        ))}
      </div>

      {/* Pagination Controls — only rendered when there are more items than one page */}
      {showPagination && (
        <AnimatedReveal>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 border border-hairline text-steelblue hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none"
              aria-label="Go to previous page"
            >
              ← Prev
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`font-mono text-xs uppercase tracking-wider px-4 py-2.5 border transition-colors select-none ${
                  page === currentPage
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-hairline text-steelblue hover:border-accent hover:text-accent'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 border border-hairline text-steelblue hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none"
              aria-label="Go to next page"
            >
              Next →
            </button>

            {/* Page counter */}
            <span className="font-mono text-xs text-steelblue/50 ml-2">
              PAGE {currentPage} / {totalPages}
            </span>
          </div>
        </AnimatedReveal>
      )}
    </>
  );
}
