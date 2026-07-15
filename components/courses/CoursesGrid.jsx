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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl mb-4xl">
        {visibleCourses.map((course, index) => (
          <AnimatedReveal key={course._id || course.id} delay={index * 0.15}>
            <Link
              href={`/courses/${course.slug}`}
              className="border border-hairline bg-navy/40 shadow-elevation-sm hover:shadow-elevation-md hover:border-accent/50 flex flex-col h-full transition-all duration-300 relative group cursor-pointer overflow-hidden rounded-lg min-h-[400px]"
            >
              {/* Image Thumbnail at Top - 16:9 aspect ratio */}
              {course.image ? (
                <div className="relative w-full aspect-video bg-navy/50 overflow-hidden border-b border-hairline">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                      e.target.parentElement.innerHTML = '<div class="w-16 h-16 border border-dashed border-white/20 flex items-center justify-center text-steelblue/40"><svg class="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h18v18H3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 12h18M12 3v18" /></svg></div>';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-navy/50 border-b border-hairline flex items-center justify-center">
                  <div className="w-16 h-16 border border-dashed border-white/20 flex items-center justify-center text-steelblue/40">
                    {course.id === '01' ? (
                      <svg className="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h18v18H3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 12h18M12 3v18M3 3l18 18M3 21L21 3" />
                        <circle cx="12" cy="12" r="3" fill="#0F2A47" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5M12 13l8 5m-8-5l-8 5" />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {/* Card Content */}
              <div className="p-xl flex flex-col flex-grow">
                {/* Number & Price Header */}
                <div className="flex justify-between items-start mb-lg">
                  <span className="font-mono text-h3 font-bold text-accent">
                    {course.id}
                  </span>
                  {course.price && (
                    <div className="text-right">
                      {course.discountPercent && course.discountPercent > 0 ? (
                        <>
                          <span className="font-mono text-caption text-steelblue/50 line-through block">
                            PKR {course.price.toLocaleString()}
                          </span>
                          <span className="font-mono text-caption text-accent font-bold">
                            PKR {Math.round(course.price * (1 - course.discountPercent / 100)).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-caption text-offwhite border border-white/10 bg-white/5 px-sm py-xs rounded">
                          PKR {course.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-lg flex-grow">
                  <h3 className="font-sans font-semibold text-h3 text-offwhite mb-sm group-hover:text-accent transition-colors">
                    {course.title}
                  </h3>
                  <span className="inline-flex items-center gap-sm font-mono text-label text-accent/70 border border-accent/20 bg-accent/5 px-sm py-xs rounded mb-sm">
                    ● Online Delivery
                  </span>
                  <p className="font-sans text-body text-steelblue leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="border-t border-hairline/60 pt-lg flex justify-between items-center text-xs font-mono text-steelblue/50">
                  <span>CURRICULUM SPEC: {course.id}</span>
                  <span className="text-accent group-hover:animate-pulse">● VIEW CURRICULUM</span>
                </div>
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
