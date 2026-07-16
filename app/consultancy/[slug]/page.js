import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/mongodb';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';
import InquiryTrigger from '@/components/shared/InquiryTrigger';
import WorkSampleImage from '@/components/consultancy/WorkSampleImage';

// Force every request to be server-rendered live from MongoDB.
// This ensures that admin edits (title, description, image) appear immediately.
export const dynamic = 'force-dynamic';

// Fetch dynamic service from database by slug helper
async function getServiceBySlug(slug) {
  try {
    const { db } = await connectToDatabase();
    return await db.collection('services').findOne({ slug });
  } catch (error) {
    console.error(`Failed to fetch service with slug ${slug}:`, error);
    return null;
  }
}

// Pre-render the services at build time dynamically from MongoDB
export async function generateStaticParams() {
  try {
    const { db } = await connectToDatabase();
    const services = await db.collection('services')
      .find({}, { projection: { slug: 1 } })
      .toArray();

    return services.map((service) => ({
      slug: service.slug,
    }));
  } catch (err) {
    console.error('Error generating static params for services:', err);
    return [];
  }
}

// Dynamic SEO metadata
export async function generateMetadata({ params }) {
  const service = await getServiceBySlug(params.slug);

  if (!service) {
    return {
      title: "Service Not Found | SimuFlux",
      description: "The requested engineering service details could not be found.",
    };
  }

  return {
    title: `${service.title} — Engineering Spec | SimuFlux`,
    description: `${service.shortDescription.substring(0, 150)}...`,
  };
}

export default async function ServiceDetailPage({ params }) {
  const service = await getServiceBySlug(params.slug);

  // Return 404 page if service slug is invalid
  if (!service) {
    notFound();
  }

  // Serialize properties for rendering if necessary
  const displayService = {
    ...service,
    _id: service._id.toString(),
  };

  // Service JSON-LD Structured Data for SEO
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": displayService.title,
    "description": displayService.shortDescription,
    "url": `https://simufluxlab.com/consultancy/${displayService.slug}`,
    "provider": {
      "@type": "Organization",
      "name": "SimuFlux Design Lab",
      "url": "https://simufluxlab.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Pakistan"
    },
    "serviceType": "Engineering Consultancy"
  };

  // BreadcrumbList JSON-LD for SEO
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://simufluxlab.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Consultancy",
        "item": "https://simufluxlab.com/consultancy"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": displayService.title,
        "item": `https://simufluxlab.com/consultancy/${displayService.slug}`
      }
    ]
  };

  return (
    <>
      {/* Inject Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {/* Inject BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="min-h-screen pt-32 pb-20 bg-navy relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Breadcrumb back navigation */}
        <AnimatedReveal>
          <div className="mb-4xl flex items-center gap-sm font-mono text-label uppercase tracking-wider text-steelblue select-none">
            <Link href="/consultancy" className="hover:text-accent transition-colors">
              Consultancy
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-offwhite">{displayService.slug}</span>
          </div>
        </AnimatedReveal>

        {/* Title and Header Eyebrow */}
        <AnimatedReveal delay={0.05}>
          <div className="border-b border-hairline pb-4xl mb-4xl flex flex-col md:flex-row md:items-end justify-between gap-xl">
            <div>
              <SectionEyebrow text={`Service Ref ${displayService.id}`} />
              <h1 className="font-sans font-bold text-h2 sm:text-h1 lg:text-display text-offwhite uppercase tracking-tight">
                {displayService.title}
              </h1>
            </div>
            <div className="font-mono text-label text-steelblue/55 select-none">
              DISCIPLINE SPEC ID: {displayService.id}
            </div>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4xl items-start mb-4xl">
          
          {/* Detail Text & CTA Column */}
          <div className="lg:col-span-6 space-y-4xl">
            <AnimatedReveal delay={0.1}>
              <div className="space-y-4xl">
                <h2 className="font-mono text-label uppercase tracking-wider text-accent select-none">
                  [ SPECIFICATION DESCRIPTION ]
                </h2>
                <p className="font-sans text-body sm:text-h4 text-steelblue leading-relaxed">
                  {displayService.shortDescription}
                </p>
                <p className="font-sans text-body sm:text-h4 text-offwhite leading-relaxed whitespace-pre-wrap">
                  {displayService.detail}
                </p>

                {/* Service Highlights / Points */}
                {displayService.points && displayService.points.length > 0 && (
                  <div className="pt-xl">
                    <h3 className="font-mono text-label uppercase tracking-wider text-accent select-none mb-xl">
                      [ SERVICE HIGHLIGHTS ]
                    </h3>
                    <ul className="space-y-md">
                      {displayService.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-sm text-small sm:text-body text-steelblue leading-relaxed">
                          <span className="text-accent mt-0.5 select-none font-bold">✓</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AnimatedReveal>

            <AnimatedReveal delay={0.2}>
              <div className="border-t border-hairline pt-4xl space-y-4xl">
                <p className="text-label font-mono uppercase tracking-wider text-steelblue select-none">
                  Initialize project scoping or technical review:
                </p>
                <InquiryTrigger 
                  targetName={displayService.title}
                  targetType="service"
                  buttonText="Inquire About This Service"
                />
              </div>
            </AnimatedReveal>
          </div>

          {/* Work Sample Image Column */}
          <div className="lg:col-span-6">
            <AnimatedReveal delay={0.15}>
              <div className="space-y-4xl">
                <h3 className="font-mono text-label uppercase tracking-wider text-steelblue select-none">
                  [ DATA SHEET VISUAL / WORK SAMPLE ]
                </h3>
                <WorkSampleImage 
                  src={displayService.image} 
                  alt={`Technical diagram or work sample representing ${displayService.title}`} 
                  serviceId={displayService.id}
                />
              </div>
            </AnimatedReveal>
          </div>
        </div>

      </div>
    </section>
    </>
  );
}
