'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedReveal from '@/components/shared/AnimatedReveal';
import InquiryTrigger from '@/components/shared/InquiryTrigger';

const CORE_CAPABILITIES = [
  "Finite Element Analysis (FEA)",
  "Computational Fluid Dynamics (CFD)",
  "Thermal Analysis",
  "Structural Analysis",
  "Product Design & Development",
  "CAD & 3D Modelling",
  "Engineering Optimization",
  "Technical Reports & Design Validation"
];

function ServicesGridInner({ services = [] }) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get('service');

  const selectedService = activeSlug
    ? services.find((s) => s.slug === activeSlug)
    : null;

  if (activeSlug && selectedService) {
    return (
      <AnimatedReveal>
        {/* Full-width grid: left text, right image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">

          {/* ─── Left Column: Content ─── */}
          <div className="px-8 md:px-12 xl:px-20 py-xl lg:py-3xl flex flex-col justify-start">


            {/* Eyebrow */}
            <span className="font-mono text-label text-accent tracking-widest block mb-sm">
            </span>

            {/* Title */}
            <h1 className="font-sans font-bold text-h1 sm:text-display text-offwhite uppercase tracking-tight leading-tight mb-md">
              {selectedService.title}
            </h1>

            {/* Accent underline decoration */}
            <div className="w-16 h-[3px] bg-accent mb-xl" />

            {/* Short description */}
            <p className="font-sans text-h4 text-steelblue leading-relaxed mb-xl">
              {selectedService.shortDescription}
            </p>

            {/* Full detail */}
            {selectedService.detail && (
              <p className="font-sans text-body text-offwhite/80 leading-relaxed whitespace-pre-wrap mb-xl">
                {selectedService.detail}
              </p>
            )}

            {/* Capabilities list */}
            {selectedService.points && selectedService.points.length > 0 && (
              <div className="mb-xl">
                <h3 className="font-mono text-label text-accent mb-md select-none">
                  [ KEY CAPABILITIES ]
                </h3>
                <ul className="space-y-sm">
                  {selectedService.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-sm text-body text-steelblue leading-relaxed">
                      <span className="text-accent font-bold select-none mt-[2px]">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="border-t border-white/10 pt-xl mt-auto">
              <p className="font-sans text-small text-steelblue/70 mb-md">
                Discuss parameters, coordinate files, or review technical workflows with our engineering team.
              </p>
              <InquiryTrigger
                targetName={selectedService.title}
                targetType="service"
                buttonText="Inquire About This Service"
              />
            </div>

          </div>

          {/* ─── Right Column: Image ─── */}
          <div className="relative hidden lg:block">
            <div className="sticky top-24 h-[60vh] overflow-hidden rounded-xl mr-8 xl:mr-16">
              {selectedService.image ? (
                <Image
                  src={selectedService.image}
                  alt={`Technical visual for ${selectedService.title}`}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-navy/60 flex flex-col items-center justify-center gap-md border-l border-white/10">
                  <div className="w-20 h-20 border border-dashed border-white/20 flex items-center justify-center text-steelblue/40">
                    <svg className="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3L4 8v8l8 5 8-5V8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v18M4 8l8 5 8-5" />
                    </svg>
                  </div>
                  <p className="font-mono text-caption text-steelblue/40 uppercase tracking-widest">
                    DWG REF: WS-{selectedService.id}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </AnimatedReveal>
    );
  }

  // Welcome State: Elegant list of capabilities
  return (
    <div className="max-w-3xl mx-auto py-xl">
      <AnimatedReveal>
        <div className="text-center mb-xl">
          <span className="font-mono text-label text-accent tracking-widest block mb-md">
            [ SIMUFLUX DEPARTMENTS ]
          </span>
          <h2 className="font-sans font-bold text-h1 text-offwhite uppercase tracking-tight mb-md">
            Engineering Consultancy
          </h2>
          <p className="font-sans text-body text-steelblue leading-relaxed max-w-xl mx-auto">
            Select a specific service from the <strong>Consultancy</strong> dropdown menu in the navigation bar above to view detailed technical specifications and validation parameters.
          </p>
        </div>

        {/* Core Capabilities List */}
        <div className="border-t border-white/10 pt-xl mt-xl">
          <h3 className="font-mono text-label text-steelblue/55 text-center mb-lg tracking-wider">
            [ PRIMARY EXPERTISE & SERVICE AREAS ]
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-md gap-x-xl max-w-2xl mx-auto">
            {CORE_CAPABILITIES.map((capability, idx) => (
              <li key={idx} className="flex items-center gap-sm text-body text-offwhite/90 py-sm border-b border-white/5 last:border-b-0 md:border-b border-white/5">
                <span className="text-accent font-bold text-lg select-none">•</span>
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </div>
      </AnimatedReveal>
    </div>
  );
}

export default function ServicesGrid({ services = [] }) {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto p-xl bg-white/[0.01] border border-white/5 rounded-2xl h-96 animate-pulse" />
    }>
      <ServicesGridInner services={services} />
    </Suspense>
  );
}
