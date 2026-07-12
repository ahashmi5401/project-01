'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AnimatedReveal from '@/components/shared/AnimatedReveal';

const ITEMS_PER_PAGE = 6;

export default function ServicesGrid({ services = [] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(services.length / ITEMS_PER_PAGE);
  const showPagination = services.length > ITEMS_PER_PAGE;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleServices = services.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {visibleServices.map((service, index) => (
          <AnimatedReveal key={service._id || service.id} delay={index * 0.1}>
            <Link
              href={`/consultancy/${service.slug}`}
              className="border border-hairline bg-navy/40 p-8 flex flex-col justify-between h-full transition-all duration-300 relative group cursor-pointer hover:border-accent hover:bg-white/[0.01]"
            >
              {/* Structural Motif: Number in Accent color */}
              <div className="flex justify-between items-start mb-6 border-b border-hairline/60 pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-steelblue">
                  SERVICE REF
                </span>
                <span className="font-mono text-xl font-bold text-accent">
                  {service.id}
                </span>
              </div>

              <div className="flex-grow mb-6">
                <h3 className="font-sans font-bold text-lg text-offwhite mb-3 group-hover:text-accent transition-colors">
                  {service.title}
                </h3>
                <p className="font-sans text-sm sm:text-base text-steelblue leading-relaxed">
                  {service.shortDescription}
                </p>
              </div>

              <div className="border-t border-hairline/60 pt-4 flex justify-between items-center text-xs font-mono text-steelblue/50">
                <span>DISCIPLINE SPEC: {service.id}</span>
                <span className="text-accent group-hover:animate-pulse">● VIEW SPEC</span>
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
