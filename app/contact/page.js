import React from 'react';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';
import ContactForm from '@/components/contact/ContactForm';
import WhatsAppButton from '@/components/shared/WhatsAppButton';

export const metadata = {
  title: "Contact SimuFlux — Engineering Inquiries & Course Registration in Karachi",
  description: "Reach SimuFlux Design Lab in Karachi, Pakistan for CFD simulation projects, FEA structural analysis, CAD modeling contracts, or engineering course registration.",
};

export default function ContactPage() {
  return (
    <section className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <AnimatedReveal>
          <div className="border-b border-hairline pb-xl mb-4xl">
            <SectionEyebrow text="Get In Touch" />
            <h1 className="font-sans font-bold text-h2 sm:text-h1 lg:text-display text-offwhite uppercase tracking-tight">
              Contact SimuFlux
            </h1>
          </div>
        </AnimatedReveal>

        {/* Form and info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Info Column */}
          <div className="lg:col-span-5 space-y-3xl sm:space-y-4xl font-sans">
            <AnimatedReveal delay={0.1}>
              <div className="space-y-xl">
                <h2 className="font-sans font-bold text-h2 sm:text-h3 text-offwhite">
                  Project Inquiries & Enrollment
                </h2>
                <p className="text-body text-steelblue leading-relaxed">
                  Have a project in mind, or want to ask about a course? Send a message below or reach us directly on WhatsApp.
                </p>
              </div>
            </AnimatedReveal>

            <AnimatedReveal delay={0.2}>
              <div className="border border-hairline bg-white/5 p-xl space-y-xl font-mono text-label shadow-elevation-sm rounded">
                <div className="space-y-sm">
                  <span className="text-accent block uppercase tracking-wider">[ INQUIRY TIMELINE ]</span>
                  <span className="text-steelblue">Average response latency: &lt; 24 Hours</span>
                </div>
                <div className="space-y-sm">
                  <span className="text-accent block uppercase tracking-wider">[ ENVELOPE PARAMETERS ]</span>
                  <span className="text-steelblue">Email: info@simuflux.com</span>
                </div>
                <div className="space-y-sm">
                  <span className="text-accent block uppercase tracking-wider">[ PHYSICAL STATION ]</span>
                  <span className="text-steelblue">Karachi, Pakistan</span>
                </div>
              </div>
            </AnimatedReveal>

            <AnimatedReveal delay={0.3}>
              <div className="space-y-xl">
                <p className="text-label font-mono uppercase tracking-wider text-steelblue">
                  Direct connection line:
                </p>
                <WhatsAppButton 
                  message="Hello SimuFlux, I am reaching out to discuss a design, simulation or training inquiry."
                >
                  Connect On WhatsApp
                </WhatsAppButton>
              </div>
            </AnimatedReveal>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <AnimatedReveal delay={0.2}>
              <ContactForm />
            </AnimatedReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
