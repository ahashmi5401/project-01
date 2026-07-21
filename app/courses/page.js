import React from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';
import CoursesGrid from '@/components/courses/CoursesGrid';
import FaqAccordion from '@/components/courses/FaqAccordion';

// Cache page and regenerate at most once per minute (ISR)
export const revalidate = 60;

export const metadata = {
  title: "ANSYS FEA & Creo CAD Training Courses in Karachi | Simuflux Lab",
  description: "Learn practical engineering FEA meshing and CAD assembly modelling in Karachi, Pakistan. Register for our ANSYS Workbench and Creo Parametric courses.",
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: "ANSYS FEA & Creo CAD Training Courses in Karachi | Simuflux Lab",
    description: "Learn practical engineering FEA meshing and CAD assembly modelling in Karachi, Pakistan. Register for our ANSYS Workbench and Creo Parametric courses.",
    url: "https://simufluxlab.com/courses",
    images: ['/images/og-banner.jpg'],
  },
};

// Next.js Server Component fetching from MongoDB
async function getCourses() {
  try {
    const { db } = await connectToDatabase();
    const coursesData = await db.collection('courses')
      .find({})
      .sort({ id: 1, createdAt: -1 })
      .toArray();

    // Serialize MongoDB ObjectIds to clean strings for Client Components
    return coursesData.map((course) => ({
      ...course,
      _id: course._id.toString(),
      createdAt: course.createdAt ? course.createdAt.toISOString() : null,
      updatedAt: course.updatedAt ? course.updatedAt.toISOString() : null,
    }));
  } catch (error) {
    console.error('Failed to fetch courses from database, falling back:', error);
    return [];
  }
}

export default async function CoursesPage() {
  const courses = await getCourses();

  // FAQ Data for AEO/SEO
  const faqs = [
    {
      q: "What is CFD used for in engineering?",
      a: "Computational Fluid Dynamics (CFD) is used to simulate fluid flow, heat transfer, aerodynamics, and chemical reactions. It helps engineers validate thermal and aerodynamic performances, optimize pipe or duct designs, and predict pressure drops before building physical prototypes."
    },
    {
      q: "Do I need prior experience to join the ANSYS FEA course?",
      a: "No prior software experience is required. However, a baseline understanding of structural mechanics, stress-strain concepts, and engineering drawing is highly recommended since the ANSYS Workbench course is practical and hands-on."
    },
    {
      q: "What's the difference between FEA and CFD?",
      a: "Finite Element Analysis (FEA) focuses on solid structures (solving for stresses, displacements, and structural failures under mechanical loads). Computational Fluid Dynamics (CFD) focuses on moving fluids (gases/liquids) and heat transport profiles within fluid or solid margins."
    },
    {
      q: "Does Simuflux offer consultancy for companies, not just training?",
      a: "Yes. Simuflux is a dual-purpose design lab. We provide professional engineering consultancy, design validation, mesh convergence reports, and parametric modeling capacity to product companies and fabrication shops."
    },
    {
      q: "How do I register for a course?",
      a: "Contact our team on WhatsApp to receive the current account or JazzCash details. Once you transfer the registration fee, upload the payment screenshot in our Registration Form below to reserve your seat instantly."
    },
    {
      q: "What does 'Price Inquiry' mean?",
      a: "Price Inquiry means the course fee is not fixed and varies based on your requirements, background, or customization needs. For these courses, please contact our team via WhatsApp to discuss pricing tailored to your specific situation."
    },
    {
      q: "Is training done online or in-person?",
      a: "All Simuflux training is delivered fully online. Our live virtual sessions are conducted via video conferencing, making our courses accessible to engineering students and working professionals anywhere in the world — no in-person attendance required."
    }
  ];

  // FAQ JSON-LD Structured Schema — kept exactly as-is for SEO/AEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <>
      {/* Schema Injection — unchanged for SEO/AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="min-h-screen pt-24 pb-4xl relative overflow-hidden bg-navy text-offwhite">

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Header Block */}
          <AnimatedReveal>
            <div className="border-b border-hairline pb-xl mb-4xl">
              <SectionEyebrow text="Professional Curriculum" />
              <h1 className="font-sans font-bold text-h2 sm:text-h1 lg:text-display text-offwhite uppercase tracking-tight">
                Training Courses
              </h1>
            </div>
          </AnimatedReveal>

          {/* Courses Cards Grid with Pagination */}
          <CoursesGrid courses={courses} />

          {/* FAQ Block (AEO / SEO) */}
          <div className="mt-4xl border-t border-hairline pt-4xl">
            <AnimatedReveal>
              <div className="mb-3xl">
                <SectionEyebrow text="Common Inquiries" />
                <h2 className="font-sans font-bold text-h2 sm:text-h1 text-offwhite uppercase tracking-tight">
                  Frequently Asked Questions
                </h2>
              </div>
            </AnimatedReveal>

            <AnimatedReveal delay={0.1}>
              <FaqAccordion faqs={faqs} />
            </AnimatedReveal>
          </div>

        </div>
      </section>
    </>
  );
}
