import React from 'react';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import Link from 'next/link';

export const metadata = {
  title: "About Simuflux Lab — Engineering Training & Consultancy Karachi",
  description: "Simuflux Lab is an engineering training and consultancy based in Karachi, Pakistan, closing the gap between theory and industry practice.",
};

export default function AboutPage() {
  return (
    <section className="min-h-screen pt-24 pb-4xl relative overflow-hidden">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3xl items-start">
          
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
              <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-elevation-md rounded-xl p-lg sm:p-xl space-y-lg">
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
              <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-elevation-md rounded-xl p-lg sm:p-xl space-y-lg">
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
              <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-elevation-lg shadow-accent/5 rounded-xl p-lg sm:p-xl relative space-y-lg">
                {/* Calibration markers on corner of container */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent rounded-tl" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent rounded-br" />
                
                <h3 className="font-mono text-label uppercase tracking-wider text-accent mb-md">
                  [ 03 / WHY CHOOSE Simuflux LAB? ]
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

          {/* Image Column */}
          <div className="lg:col-span-5 relative">
            <AnimatedReveal delay={0.25}>
              <div className="w-full max-w-[450px] mx-auto">
                <img
                  src="/images/about-engineering.webp"
                  alt="Engineering Design and Simulation"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
