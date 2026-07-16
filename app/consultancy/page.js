import React from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import ServicesGrid from '@/components/consultancy/ServicesGrid';

// Force every request to be server-rendered live from MongoDB (no static caching)
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Engineering Consultancy Services — CFD, FEA, CAD, Product Design | SimuFlux",
  description: "Verify your engineering designs with high-fidelity CFD simulations, structural FEA stress analysis, parametric CAD modeling, and product design services in Karachi, Pakistan.",
};

async function getServices() {
  try {
    const { db } = await connectToDatabase();
    const servicesData = await db.collection('services')
      .find({})
      .sort({ id: 1, createdAt: -1 })
      .toArray();

    return servicesData.map((service) => ({
      ...service,
      _id: service._id.toString(),
      createdAt: service.createdAt ? service.createdAt.toISOString() : null,
      updatedAt: service.updatedAt ? service.updatedAt.toISOString() : null,
    }));
  } catch (error) {
    console.error('Failed to fetch services from database:', error);
    return [];
  }
}

export default async function ConsultancyPage() {
  const services = await getServices();

  return (
    <section className="min-h-screen pt-24 pb-4xl bg-navy relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <AnimatedReveal>
          <div className="border-b border-hairline pb-xl mb-4xl">
            <SectionEyebrow text="Professional Capabilities" />
            <h1 className="font-sans font-bold text-h2 sm:text-h1 lg:text-display text-offwhite uppercase tracking-tight">
              Consultancy Services
            </h1>
          </div>
        </AnimatedReveal>

        {/* Services Grid with Pagination */}
        <ServicesGrid services={services} />

        {/* CTA Banner */}
        <AnimatedReveal delay={0.4}>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-xl sm:p-3xl flex flex-col lg:flex-row items-center justify-between gap-xl relative overflow-hidden">
            
            <div className="max-w-xl">
              <h2 className="font-sans font-bold text-h3 text-offwhite mb-lg">
                Have a project or custom simulation requirement?
              </h2>
              <p className="font-sans text-body text-steelblue leading-relaxed">
                Connect with our analysis department to discuss parameters, scoping documents, or training workflows tailored to your company&apos;s product line.
              </p>
            </div>

            <div>
              <WhatsAppButton 
                message="Hello SimuFlux, I would like to inquire about a consultancy project/simulation proposal."
              >
                Inquire About Project
              </WhatsAppButton>
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}
