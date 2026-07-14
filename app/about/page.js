import React from 'react';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import Link from 'next/link';

export const metadata = {
  title: "About SimuFlux Design Lab — Engineering Training & Consultancy Karachi",
  description: "SimuFlux Design Lab is an engineering training and consultancy based in Karachi, Pakistan, closing the gap between theory and industry practice.",
};

export default function AboutPage() {
  return (
    <section className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      {/* Blueprint Grid background & alignment markers */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <AnimatedReveal>
          <div className="border-b border-hairline pb-xl mb-4xl">
            <SectionEyebrow text="Core Values & Mission" />
            <h1 className="font-sans font-bold text-h2 sm:text-h1 lg:text-display text-offwhite uppercase tracking-tight">
              About Simuflux Lab
            </h1>
          </div>
        </AnimatedReveal>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Text Column */}
          <div className="lg:col-span-7 space-y-3xl sm:space-y-4xl">
            <AnimatedReveal delay={0.1}>
              <div className="space-y-xl">
                <h2 className="font-mono text-label uppercase tracking-wider text-accent">
                  [ 01 / Welcome to Simuflux Lab ]
                </h2>
                <p className="font-sans text-body sm:text-h3 text-steelblue leading-relaxed">
                  Welcome to Simuflux Lab! At Simuflux Lab, we are committed to empowering engineers, students, researchers, and industries through professional engineering training and advanced simulation solutions. Our mission is to bridge the gap between academic knowledge and industrial applications by delivering practical, industry-focused learning and high-quality engineering consultancy.
                </p>
              </div>
            </AnimatedReveal>

            {/* Our Services Section */}
            <AnimatedReveal delay={0.15}>
              <div className="space-y-xl">
                <h2 className="font-mono text-label uppercase tracking-wider text-accent">
                  [ 02 / OUR SERVICES ]
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl">
                  {/* Engineering Training Group */}
              <div className="border border-hairline/40 bg-navy/20 p-lg sm:p-xl space-y-lg shadow-elevation-sm rounded">
                    <h3 className="font-mono text-body font-bold text-offwhite uppercase tracking-wider border-b border-hairline/40 pb-md">
                      Engineering Training
                    </h3>
                    <ul className="space-y-sm font-sans text-body text-steelblue">
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> ANSYS Mechanical (FEA)
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> ANSYS Fluent (CFD)
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> Creo Parametric
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> SolidWorks
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> Engineering Design & Simulation
                      </li>
                    </ul>
                  </div>

                  {/* Engineering Consultancy Group */}
              <div className="border border-hairline/40 bg-navy/20 p-lg sm:p-xl space-y-lg shadow-elevation-sm rounded">
                    <h3 className="font-mono text-body font-bold text-offwhite uppercase tracking-wider border-b border-hairline/40 pb-md">
                      Engineering Consultancy
                    </h3>
                    <ul className="space-y-sm font-sans text-body text-steelblue">
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> Finite Element Analysis (FEA)
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> Computational Fluid Dynamics (CFD)
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> Thermal Analysis
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> Structural Analysis
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> Product Design & Development
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> CAD & 3D Modelling
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> Engineering Optimization
                      </li>
                      <li className="flex items-center gap-sm">
                        <span className="text-accent">●</span> Technical Reports & Design Validation
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AnimatedReveal>

            {/* Why Choose Us Section */}
            <AnimatedReveal delay={0.2}>
              <div className="border border-hairline bg-white/5 p-lg sm:p-xl relative space-y-lg shadow-elevation-sm rounded">
                {/* Calibration markers on corner of container */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent rounded-tl" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent rounded-br" />
                
                <h3 className="font-mono text-label uppercase tracking-wider text-accent mb-md">
                  [ 03 / WHY CHOOSE SIMUFLUX LAB? ]
                </h3>
                <ul className="space-y-md font-sans text-body text-offwhite">
                  <li className="flex items-start gap-md">
                    <span className="font-mono text-accent text-body">[01]</span>
                    <span>Industry-oriented training with hands-on projects</span>
                  </li>
                  <li className="flex items-start gap-md">
                    <span className="font-mono text-accent text-body">[02]</span>
                    <span>Real-world engineering case studies</span>
                  </li>
                  <li className="flex items-start gap-md">
                    <span className="font-mono text-accent text-body">[03]</span>
                    <span>Consultancy for academic, research, and industrial projects</span>
                  </li>
                  <li className="flex items-start gap-md">
                    <span className="font-mono text-accent text-body">[04]</span>
                    <span>Professional guidance from an experienced mechanical engineer with industrial expertise</span>
                  </li>
                  <li className="flex items-start gap-md">
                    <span className="font-mono text-accent text-body">[05]</span>
                    <span>Practical solutions tailored to your engineering challenges</span>
                  </li>
                </ul>
              </div>
            </AnimatedReveal>

            {/* Closing text & CTA */}
            <AnimatedReveal delay={0.25}>
              <div className="space-y-6">
                <p className="font-sans text-base sm:text-lg text-steelblue leading-relaxed">
                  Whether you&apos;re a student looking to build practical skills, a researcher working on innovative projects, or a company seeking reliable engineering consultancy, we&apos;re here to help you transform ideas into efficient, optimized, and validated engineering solutions.
                </p>
                <div className="border-t border-hairline/60 pt-6">
                  <p className="font-mono text-xs uppercase tracking-wider text-steelblue mb-4">
                    For course registration, project support, or corporate consultancy, feel free to contact us.
                  </p>
                  <div className="flex flex-wrap gap-4 items-center">
                    <WhatsAppButton 
                      phoneNumber="923463517689"
                      message="Hello Simuflux Lab, I would like to inquire about course registration / project support / engineering consultancy."
                    >
                      Inquire via WhatsApp
                    </WhatsAppButton>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center px-6 py-3 border border-hairline text-offwhite font-mono uppercase tracking-wider text-xs hover:bg-white/5 transition-colors"
                    >
                      Other Ways to Contact
                    </Link>
                  </div>
                  <div className="mt-6 text-accent font-mono text-xs tracking-widest uppercase">
                    Design | Simulate | Innovate
                  </div>
                </div>
              </div>
            </AnimatedReveal>
          </div>

          {/* Blueprint Illustration Column */}
          <div className="lg:col-span-5 relative">
            <AnimatedReveal delay={0.25}>
              <div className="border border-hairline bg-navy/40 p-xl aspect-square w-full max-w-[450px] mx-auto relative select-none shadow-elevation-sm rounded">
                <div className="absolute top-sm left-sm font-mono text-caption text-steelblue/40">REF DET: SF-002-B</div>
                <div className="absolute bottom-sm right-sm font-mono text-caption text-steelblue/40">SYS SCHEMATIC: 03</div>

                {/* Abstract CAD Flow/Thermal Diagram Schematic */}
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full text-steelblue/60"
                  role="img"
                  aria-label="Abstract mechanical flow-streamline simulation diagram representing CFD analysis"
                >
                  <defs>
                    {/* Arrowheads */}
                    <marker
                      id="arrow-about-white"
                      viewBox="0 0 10 10"
                      refX="5"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 255, 255, 0.4)" />
                    </marker>
                  </defs>

                  {/* Drafting boundary box */}
                  <rect x="10" y="10" width="380" height="380" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                  {/* Flow stream lines representing CFD */}
                  <path d="M 30,100 C 150,100 120,200 240,200 C 300,200 320,120 370,120" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
                  <path d="M 30,120 C 155,120 125,220 245,220 C 305,220 325,140 370,140" fill="none" stroke="#E8622C" strokeWidth="1.5" />
                  <path d="M 30,140 C 160,140 130,240 250,240 C 310,240 330,160 370,160" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />

                  {/* Mechanical part sketch - simplified CAD */}
                  <rect x="180" y="280" width="100" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="230" cy="305" r="15" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="160" y1="305" x2="300" y2="305" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="8,2" />
                  
                  {/* Dimension lines */}
                  <line x1="180" y1="350" x2="280" y2="350" stroke="currentColor" strokeWidth="1" markerStart="url(#arrow-about-white)" markerEnd="url(#arrow-about-white)" />
                  <text x="230" y="365" fill="currentColor" className="font-mono text-[9px]" textAnchor="middle">100.00 mm</text>
                  
                  {/* Calibration nodes */}
                  <circle cx="180" cy="280" r="2" fill="#E8622C" />
                  <circle cx="280" cy="280" r="2" fill="#E8622C" />
                  <circle cx="280" cy="330" r="2" fill="#E8622C" />
                  <circle cx="180" cy="330" r="2" fill="#E8622C" />

                  {/* Callout tags */}
                  <line x1="230" y1="220" x2="280" y2="180" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  <circle cx="230" cy="220" r="3" fill="#E8622C" />
                  <text x="285" y="183" fill="currentColor" className="font-mono text-[8px]">[T_max: 345 K]</text>

                  {/* Legend/Annotation list */}
                  <text x="30" y="320" fill="currentColor" className="font-mono text-[8px] uppercase tracking-wider">SYM REF:</text>
                  <text x="30" y="335" fill="rgba(255,255,255,0.4)" className="font-mono text-[8px]">X-AXIS FLOW PATTERN</text>
                  <text x="30" y="350" fill="rgba(255,255,255,0.4)" className="font-mono text-[8px]">Y-AXIS LOAD BOUNDARY</text>
                </svg>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
