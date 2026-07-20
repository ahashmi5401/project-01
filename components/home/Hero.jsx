'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import SectionEyebrow from '@/components/shared/SectionEyebrow';

export default function Hero() {
  const teethCount = 18;
  const cx = 200;
  const cy = 200;
  const rOuter = 100;
  const toothWidth = 22;
  const toothHeight = 16;

  return (
    <section className="relative min-h-screen pt-20 pb-3xl sm:pt-24 flex items-center overflow-hidden border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-2xl lg:gap-3xl items-center relative z-10 w-full">
        {/* Left Copy Column */}
        <div className="lg:col-span-7 flex flex-col justify-center order-1 lg:order-1">
          <SectionEyebrow text="Engineering Design & Simulation Lab" />
          
          <h1 className="font-sans font-bold text-h2 sm:text-h1 lg:text-display tracking-tight text-offwhite mb-lg sm:mb-xl leading-[1.1]">
            Design|<br className="hidden sm:inline" />
            Simulate| <span className="text-accent">Innovate.</span>
          </h1>

          <p className="font-sans text-small sm:text-body lg:text-h3 text-steelblue mb-lg sm:mb-xl max-w-full sm:max-w-2xl leading-relaxed">
            At Simuflux Lab, we are committed to empowering engineers, students, researchers, and industries through professional engineering training and advanced simulation solutions, bridging the gap between theory and practical industrial application.
          </p>

          <div className="flex flex-wrap gap-md sm:gap-lg items-center">
            {/* Primary WhatsApp CTA Button */}
            <WhatsAppButton message="Hello Simuflux, I would like to inquire about your engineering training and consultancy services." />
            
            {/* Secondary Outline Link */}
            <Link
              href="/consultancy"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 font-sans text-label uppercase tracking-wider text-offwhite border border-hairline hover:bg-white/5 active:bg-white/10 transition-colors rounded-md font-semibold text-sm sm:text-label"
            >
              Explore Services
            </Link>
          </div>
        </div>

        {/* Right Image Column */}
        <div className="lg:col-span-5 flex justify-center items-center relative order-2 lg:order-2 mb-lg lg:mb-0">
          <div className="relative w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[450px]">
            <Image
              src="/images/hero-engineering.webp"
              alt="Engineering Design and Simulation"
              width={450}
              height={450}
              className="w-full rounded-xl"
            />
          </div>
        </div>
      </div>

    </section>
  );
}
