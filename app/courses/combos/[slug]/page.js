import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import AnimatedReveal from '@/components/shared/AnimatedReveal';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import WorkSampleImage from '@/components/consultancy/WorkSampleImage';

// Cache page and regenerate at most once per minute (ISR)
export const revalidate = 60;

// Fetch dynamic combo deal from database by slug
async function getComboBySlug(slug) {
  try {
    const { db } = await connectToDatabase();
    return await db.collection('comboDeals').findOne({ slug });
  } catch (error) {
    console.error(`Failed to fetch combo with slug ${slug}:`, error);
    return null;
  }
}

// Pre-render the combos at build time dynamically from MongoDB
export async function generateStaticParams() {
  try {
    const { db } = await connectToDatabase();
    const combos = await db.collection('comboDeals')
      .find({}, { projection: { slug: 1 } })
      .toArray();

    return combos.map((combo) => ({
      slug: combo.slug || '',
    })).filter(p => p.slug !== '');
  } catch (err) {
    console.error('Error generating static params for combos:', err);
    return [];
  }
}

// Dynamic SEO metadata
export async function generateMetadata({ params }) {
  const combo = await getComboBySlug(params.slug);

  if (!combo) {
    return {
      title: "Combo Deal Not Found | Simuflux",
      description: "The requested training combo bundle details could not be found.",
      alternates: {
        canonical: "/courses",
      },
    };
  }

  const titleText = combo.title || combo.label || "Course Combo Package";
  const descText = combo.description || "Get instant savings on this comprehensive course bundle.";

  return {
    title: `${titleText} — Combo Package | Simuflux`,
    description: `${descText.substring(0, 150)}...`,
    alternates: {
      canonical: `/courses/combos/${combo.slug}`,
    },
    openGraph: {
      title: `${titleText} — Combo Package | Simuflux`,
      description: `${descText.substring(0, 150)}...`,
      url: `https://simufluxlab.com/courses/combos/${combo.slug}`,
      images: combo.image ? [combo.image] : ['/images/og-banner.jpg'],
    },
  };
}

export default async function ComboDetailPage({ params }) {
  const combo = await getComboBySlug(params.slug);

  // Return 404 page if combo slug is invalid
  if (!combo) {
    notFound();
  }

  const { db } = await connectToDatabase();

  // Find associated courses
  let courses = [];
  try {
    const courseIds = combo.courseIds || [];
    if (courseIds.length > 0) {
      courses = await db.collection('courses')
        .find({ _id: { $in: courseIds.map(id => new ObjectId(id)) } })
        .toArray();
    } else if (combo.courseSlugs && combo.courseSlugs.length > 0) {
      courses = await db.collection('courses')
        .find({ slug: { $in: combo.courseSlugs } })
        .toArray();
    }
  } catch (err) {
    console.error('Error loading courses for combo:', err);
  }

  // Calculate pricing
  const originalPrice = courses.reduce((sum, c) => sum + (c.price || 0), 0);
  const finalPrice = originalPrice > 0 
    ? Math.round(originalPrice * (1 - combo.discountPercent / 100))
    : 0;

  const displayCombo = {
    ...combo,
    _id: combo._id.toString(),
    title: combo.title || combo.label || 'Course Combo Package',
    description: combo.description || `Register for ${courses.map(c => c.title).join(' + ')} as a bundle and save instantly.`,
    duration: combo.duration || '8 Weeks',
    classesPerWeek: combo.classesPerWeek || '2 Classes',
    classHours: combo.classHours || '1.5 Hours',
  };

  // Structured Data for SEO
  const comboJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": displayCombo.title,
    "description": displayCombo.description,
    "image": displayCombo.image || 'https://simufluxlab.com/images/og-banner.jpg',
    "offers": {
      "@type": "Offer",
      "price": finalPrice,
      "priceCurrency": "PKR",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comboJsonLd) }}
      />

      <section className="min-h-screen pt-32 pb-20 bg-navy relative overflow-hidden text-offwhite">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Breadcrumb back navigation */}
          <AnimatedReveal>
            <div className="mb-4xl flex items-center gap-sm font-mono text-label uppercase tracking-wider text-steelblue select-none">
              <Link href="/courses" className="hover:text-accent transition-colors">
                Courses
              </Link>
              <span className="text-white/20">/</span>
              <span className="hover:text-accent transition-colors">
                Combos
              </span>
              <span className="text-white/20">/</span>
              <span className="text-offwhite">{displayCombo.slug}</span>
            </div>
          </AnimatedReveal>

          {/* Title and Header Eyebrow */}
          <AnimatedReveal delay={0.05}>
            <div className="border-b border-hairline pb-4xl mb-4xl flex flex-col md:flex-row md:items-end justify-between gap-xl">
              <div>
                <SectionEyebrow text={`${courses.length} Course Bundle Deal`} />
                <h1 className="font-sans font-bold text-h2 sm:text-h1 lg:text-display text-offwhite uppercase tracking-tight">
                  {displayCombo.title}
                </h1>
                
                {/* Online-only delivery indicator and Price */}
                <div className="flex flex-wrap gap-md mt-lg items-center">
                  <span className="inline-flex items-center gap-sm font-mono text-label uppercase tracking-wider text-accent/80 border border-accent/25 bg-accent/5 px-md py-sm rounded">
                    ● Delivered Online
                  </span>
                  
                  {originalPrice > 0 && (
                    <>
                      <span className="inline-flex items-center gap-sm font-mono text-label uppercase tracking-wider text-steelblue/60 line-through border border-white/10 bg-white/5 px-md py-sm rounded">
                        PKR {originalPrice.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-sm font-mono text-label uppercase tracking-wider text-accent border border-accent/25 bg-accent/5 px-md py-sm rounded">
                        PKR {finalPrice.toLocaleString()}
                        <span className="text-accent/70">({displayCombo.discountPercent}% OFF)</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="font-mono text-label text-steelblue/50 select-none">
                COMBO SPEC ID: {displayCombo._id.substring(18)}
              </div>
            </div>
          </AnimatedReveal>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3xl items-start mb-4xl">
            
            {/* Left Column: Details & Courses List */}
            <div className="lg:col-span-6 space-y-3xl">
              <AnimatedReveal delay={0.1}>
                <div className="space-y-4xl">
                  <h2 className="font-mono text-label uppercase tracking-wider text-accent select-none">
                    [ BUNDLE DESCRIPTION ]
                  </h2>
                  <p className="font-sans text-body sm:text-h4 text-steelblue leading-relaxed">
                    {displayCombo.description}
                  </p>

                  {/* Included Courses Links */}
                  <div className="pt-xl">
                    <h3 className="font-mono text-label uppercase tracking-wider text-accent select-none mb-xl">
                      [ INCLUDED COURSES ]
                    </h3>
                    <div className="space-y-md">
                      {courses.map((course, idx) => (
                        <div key={course._id || idx} className="bg-white/[0.02] border border-white/10 rounded-lg p-lg hover:border-accent/40 transition-colors flex items-center justify-between gap-md group">
                          <div>
                            <span className="font-sans font-semibold text-offwhite group-hover:text-accent transition-colors block">
                              {course.title}
                            </span>
                            <span className="text-steelblue/60 text-caption font-sans block mt-1">
                              {course.description?.substring(0, 100)}...
                            </span>
                          </div>
                          <Link 
                            href={`/courses/${course.slug}`}
                            className="text-accent font-mono text-label uppercase tracking-wider group-hover:underline flex-shrink-0"
                          >
                            Course Details →
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedReveal>

              {/* CTA and Inquiry Actions */}
              <AnimatedReveal delay={0.2}>
                <div className="border-t border-hairline pt-3xl space-y-xl">
                  <p className="text-label font-mono uppercase tracking-wider text-steelblue select-none">
                    Enroll in this bundle package or inquire about installment plans:
                  </p>
                  
                  <div className="flex flex-wrap gap-md items-center">
                    <Link 
                      href={`/enroll?combo=${displayCombo.slug}`}
                      className="bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-mono uppercase tracking-wider text-label px-xl py-3 border border-transparent transition-all select-none rounded-md text-center"
                    >
                      Enroll in Bundle
                    </Link>
                    
                    <WhatsAppButton 
                      message={`Hello Simuflux, I would like to inquire about the installment plan option for the "${displayCombo.title}" combo bundle.`}
                    >
                      Inquire for Installments
                    </WhatsAppButton>
                  </div>
                </div>
              </AnimatedReveal>
            </div>

            {/* Right Column: Visual Representing Bundle */}
            <div className="lg:col-span-6">
              <AnimatedReveal delay={0.15}>
                <div className="space-y-3xl">
                  <h3 className="font-mono text-label uppercase tracking-wider text-steelblue select-none">
                    [ BUNDLE VISUAL SHEET ]
                  </h3>
                  <WorkSampleImage 
                    src={displayCombo.image} 
                    alt={`Technical visual representing ${displayCombo.title}`} 
                    serviceId={displayCombo._id.substring(20)}
                  />
                </div>
              </AnimatedReveal>
            </div>

          </div>

          {/* Schedule/Duration Information */}
          <AnimatedReveal delay={0.25}>
            <div className="border-t border-hairline pt-3xl">
              <h2 className="font-mono text-label uppercase tracking-wider text-accent select-none mb-3xl">
                [ COURSE DURATION & WEEKLY SCHEDULE ]
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
                <div className="bg-white/[0.02] border border-white/10 rounded-lg p-lg">
                  <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Total Duration</p>
                  <p className="font-sans text-h4 text-offwhite font-semibold">{displayCombo.duration}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-lg p-lg">
                  <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Classes Per Week</p>
                  <p className="font-sans text-h4 text-offwhite font-semibold">{displayCombo.classesPerWeek}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-lg p-lg">
                  <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Class Duration</p>
                  <p className="font-sans text-h4 text-offwhite font-semibold">{displayCombo.classHours}</p>
                </div>
              </div>
            </div>
          </AnimatedReveal>

        </div>
      </section>
    </>
  );
}
