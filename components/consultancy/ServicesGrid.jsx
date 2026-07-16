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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl mb-4xl">
        {visibleServices.map((service, index) => (
          <AnimatedReveal key={service._id || service.id} delay={index * 0.1}>
            <Link
              href={`/consultancy/${service.slug}`}
              className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden transition-all duration-300 relative group cursor-pointer flex flex-col h-full"
            >
              {/* Image Thumbnail at Top - 16:9 aspect ratio */}
              {service.image ? (
                <div className="relative w-full aspect-video bg-navy/40 overflow-hidden border-b border-white/10">
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
                </div>
              ) : (
                <div className="w-full aspect-video bg-navy/50 flex items-center justify-center border-b border-white/10">
                  <div className="w-16 h-16 border border-dashed border-white/20 flex items-center justify-center text-steelblue/40">
                    <svg className="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5M12 13l8 5m-8-5l-8 5" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Card Content */}
              <div className="p-lg flex flex-col flex-grow h-full">
                {/* Structural Motif: Number in Accent color */}
                <div className="flex justify-between items-start mb-md border-b border-hairline/40 pb-md">
                  <span className="font-mono text-label text-steelblue">
                    SERVICE REF
                  </span>
                  <span className="font-mono text-h3 font-bold text-accent/90">
                    {service.id}
                  </span>
                </div>

                <div className="flex-grow mb-md">
                  <h3 className="font-sans font-semibold text-h3 text-offwhite mb-sm group-hover:text-accent/90 transition-colors leading-tight">
                    {service.title}
                  </h3>
                  <p className="font-sans text-body text-steelblue/80 leading-relaxed">
                    {service.shortDescription.length > 150 
                      ? service.shortDescription.substring(0, 150) + '...' 
                      : service.shortDescription}
                  </p>
                </div>

                <div className="pt-sm mt-auto">
                  <Link
                    href={`/consultancy/${service.slug}`}
                    className="w-full inline-flex items-center justify-center gap-sm font-mono text-label uppercase tracking-wider text-offwhite bg-accent hover:bg-[#d04e1b] py-sm rounded-md transition-all duration-300"
                  >
                    <span>View Details →</span>
                    <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </Link>
          </AnimatedReveal>
        ))}
      </div>

      {/* Pagination Controls — only rendered when there are more items than one page */}
      {showPagination && (
        <AnimatedReveal>
          <div className="flex flex-wrap items-center justify-center gap-sm mb-4xl">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="font-mono text-label uppercase tracking-wider px-md py-sm border border-hairline text-steelblue hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none rounded-md"
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
                className={`font-mono text-label uppercase tracking-wider px-md py-sm border transition-colors select-none rounded-md ${
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
              className="font-mono text-label uppercase tracking-wider px-md py-sm border border-hairline text-steelblue hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none rounded-md"
              aria-label="Go to next page"
            >
              Next →
            </button>

            {/* Page counter */}
            <span className="font-mono text-label text-steelblue/50 ml-sm">
              PAGE {currentPage} / {totalPages}
            </span>
          </div>
        </AnimatedReveal>
      )}
    </>
  );
}
