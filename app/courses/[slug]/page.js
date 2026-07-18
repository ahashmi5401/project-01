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

// Fetch dynamic course from database by slug helper
async function getCourseBySlug(slug) {
  try {
    const { db } = await connectToDatabase();
    return await db.collection('courses').findOne({ slug });
  } catch (error) {
    console.error(`Failed to fetch course with slug ${slug}:`, error);
    return null;
  }
}

// Pre-render the courses at build time dynamically from MongoDB
export async function generateStaticParams() {
  try {
    const { db } = await connectToDatabase();
    const courses = await db.collection('courses')
      .find({}, { projection: { slug: 1 } })
      .toArray();

    return courses.map((course) => ({
      slug: course.slug || '',
    })).filter(p => p.slug !== '');
  } catch (err) {
    console.error('Error generating static params for courses:', err);
    return [];
  }
}

// Dynamic SEO metadata
export async function generateMetadata({ params }) {
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    return {
      title: "Course Not Found | Simuflux",
      description: "The requested training course details could not be found.",
    };
  }

  return {
    title: `${course.title} — Training Curriculum | Simuflux`,
    description: `${course.description.substring(0, 150)}...`,
  };
}

export default async function CourseDetailPage({ params }) {
  const course = await getCourseBySlug(params.slug);

  // Return 404 page if course slug is invalid
  if (!course) {
    notFound();
  }

  // Serialize properties for rendering if necessary
  const displayCourse = {
    ...course,
    _id: course._id.toString(),
  };

  // Course JSON-LD Structured Data for SEO
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": displayCourse.title,
    "description": displayCourse.description,
    "url": `https://simufluxlab.com/courses/${displayCourse.slug}`,
    "provider": {
      "@type": "Organization",
      "name": "Simuflux Lab",
      "url": "https://simufluxlab.com"
    },
    "inLanguage": "en",
    "offers": displayCourse.price ? {
      "@type": "Offer",
      "price": displayCourse.discountPercent && displayCourse.discountPercent > 0 
        ? Math.round(displayCourse.price * (1 - displayCourse.discountPercent / 100))
        : displayCourse.price,
      "priceCurrency": "PKR",
      "availability": "https://schema.org/InStock"
    } : undefined,
    ...(displayCourse.instructor?.name && {
      "instructor": {
        "@type": "Person",
        "name": displayCourse.instructor.name
      }
    })
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
        "name": "Courses",
        "item": "https://simufluxlab.com/courses"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": displayCourse.title,
        "item": `https://simufluxlab.com/courses/${displayCourse.slug}`
      }
    ]
  };

  return (
    <>
      {/* Inject Course Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      {/* Inject BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="min-h-screen pt-24 pb-4xl relative overflow-hidden bg-navy text-offwhite">

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Breadcrumb back navigation */}
        <AnimatedReveal>
          <div className="mb-4xl flex items-center gap-sm font-mono text-label uppercase tracking-wider text-steelblue select-none">
            <Link href="/courses" className="hover:text-accent transition-colors">
              Courses
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-offwhite">{displayCourse.slug}</span>
          </div>
        </AnimatedReveal>

        {/* Title and Header Eyebrow */}
        <AnimatedReveal delay={0.05}>
          <div className="border-b border-hairline pb-4xl mb-4xl flex flex-col md:flex-row md:items-end justify-between gap-xl">
            <div>
              <SectionEyebrow text={`Course Ref ${displayCourse.id}`} />
              <h1 className="font-sans font-bold text-h2 sm:text-h1 lg:text-display text-offwhite uppercase tracking-tight">
                {displayCourse.title}
              </h1>
              {/* Online-only delivery indicator and Price */}
              <div className="flex flex-wrap gap-md mt-lg items-center">
                <span className="inline-flex items-center gap-sm font-mono text-label uppercase tracking-wider text-accent/80 border border-accent/25 bg-accent/5 px-md py-sm rounded">
                  ● Delivered Online
                </span>
                {displayCourse.price && (
                  <>
                    {displayCourse.discountPercent && displayCourse.discountPercent > 0 ? (
                      <>
                        <span className="inline-flex items-center gap-sm font-mono text-label uppercase tracking-wider text-steelblue/60 line-through border border-white/10 bg-white/5 px-md py-sm rounded">
                          PKR {displayCourse.price.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-sm font-mono text-label uppercase tracking-wider text-accent border border-accent/25 bg-accent/5 px-md py-sm rounded">
                          PKR {Math.round(displayCourse.price * (1 - displayCourse.discountPercent / 100)).toLocaleString()}
                          <span className="text-accent/70">({displayCourse.discountPercent}% OFF)</span>
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-sm font-mono text-label uppercase tracking-wider text-offwhite border border-white/20 bg-white/5 px-md py-sm rounded">
                        PKR {displayCourse.price.toLocaleString()}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="font-mono text-label text-steelblue/50 select-none">
              CURRICULUM SPEC ID: {displayCourse.id}
            </div>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3xl items-start mb-4xl">
          
          {/* Detail Text & CTA Column */}
          <div className="lg:col-span-6 space-y-3xl">
            <AnimatedReveal delay={0.1}>
              <div className="space-y-4xl">
                <h2 className="font-mono text-label uppercase tracking-wider text-accent select-none">
                  [ COURSE DESCRIPTION ]
                </h2>
                <p className="font-sans text-body sm:text-h4 text-steelblue leading-relaxed">
                  {displayCourse.description}
                </p>
                {displayCourse.detail && (
                  <p className="font-sans text-body sm:text-h4 text-offwhite leading-relaxed whitespace-pre-wrap">
                    {displayCourse.detail}
                  </p>
                )}

                {/* Course Highlights / Points */}
                {displayCourse.points && displayCourse.points.length > 0 && (
                  <div className="pt-xl">
                    <h3 className="font-mono text-label uppercase tracking-wider text-accent select-none mb-xl">
                      [ COURSE HIGHLIGHTS ]
                    </h3>
                    <ul className="space-y-md">
                      {displayCourse.points.map((point, idx) => (
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
              <div className="border-t border-hairline pt-3xl space-y-3xl">
                <p className="text-label font-mono uppercase tracking-wider text-steelblue select-none">
                  Initialize registration and secure custom package discount:
                </p>
                <Link 
                  href={`/enroll?course=${displayCourse.slug}`}
                  className="inline-block bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-mono uppercase tracking-wider text-label px-xl py-3 border border-transparent transition-all select-none rounded-md"
                >
                  Enroll Now
                </Link>
              </div>
            </AnimatedReveal>
          </div>

          {/* Work Sample/Thumbnail Image Column */}
          <div className="lg:col-span-6">
            <AnimatedReveal delay={0.15}>
              <div className="space-y-3xl">
                <h3 className="font-mono text-label uppercase tracking-wider text-steelblue select-none">
                  [ COURSE SYLLABUS VISUAL ]
                </h3>
                <WorkSampleImage 
                  src={displayCourse.image} 
                  alt={`Technical visual representing ${displayCourse.title}`} 
                  serviceId={displayCourse.id}
                />
              </div>
            </AnimatedReveal>
          </div>
        </div>

        {/* Additional Course Details Sections */}
        <div className="space-y-3xl">
          
          {/* Duration Section */}
          {displayCourse.duration && (displayCourse.duration.totalDuration || displayCourse.duration.classesPerWeek || displayCourse.duration.classDurationHours) && (
            <AnimatedReveal delay={0.25}>
              <div className="border-t border-hairline pt-3xl">
                <h2 className="font-mono text-label uppercase tracking-wider text-accent select-none mb-3xl">
                  [ COURSE DURATION ]
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
                  {displayCourse.duration.totalDuration && (
                    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-lg">
                      <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Total Duration</p>
                      <p className="font-sans text-h4 text-offwhite font-semibold">{displayCourse.duration.totalDuration}</p>
                    </div>
                  )}
                  {displayCourse.duration.classesPerWeek && (
                    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-lg">
                      <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Classes Per Week</p>
                      <p className="font-sans text-h4 text-offwhite font-semibold">{displayCourse.duration.classesPerWeek}</p>
                    </div>
                  )}
                  {displayCourse.duration.classDurationHours && (
                    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-lg">
                      <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Class Duration</p>
                      <p className="font-sans text-h4 text-offwhite font-semibold">{displayCourse.duration.classDurationHours} Hours</p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedReveal>
          )}

          {/* Curriculum Section */}
          {displayCourse.curriculum && displayCourse.curriculum.length > 0 && (
            <AnimatedReveal delay={0.3}>
              <div className="border-t border-hairline pt-3xl">
                <h2 className="font-mono text-label uppercase tracking-wider text-accent select-none mb-3xl">
                  [ COURSE CURRICULUM ]
                </h2>
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-2xl">
                  <ul className="space-y-lg">
                    {displayCourse.curriculum.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-sm text-small sm:text-body text-steelblue leading-relaxed">
                        <span className="text-accent mt-1 select-none font-bold">{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedReveal>
          )}

          {/* Features Section */}
          {displayCourse.features && displayCourse.features.length > 0 && (
            <AnimatedReveal delay={0.35}>
              <div className="border-t border-hairline pt-3xl">
                <h2 className="font-mono text-label uppercase tracking-wider text-accent select-none mb-3xl">
                  [ COURSE FEATURES ]
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                  {displayCourse.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-sm bg-white/[0.02] border border-white/10 rounded-lg px-lg py-3">
                      <span className="text-accent text-lg">✓</span>
                      <span className="font-sans text-small text-offwhite">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedReveal>
          )}

          {/* Target Audience Section */}
          {displayCourse.targetAudience && (
            <AnimatedReveal delay={0.4}>
              <div className="border-t border-hairline pt-3xl">
                <h2 className="font-mono text-label uppercase tracking-wider text-accent select-none mb-3xl">
                  [ TARGET AUDIENCE ]
                </h2>
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-2xl">
                  <p className="font-sans text-body sm:text-h4 text-steelblue leading-relaxed whitespace-pre-wrap">
                    {displayCourse.targetAudience}
                  </p>
                </div>
              </div>
            </AnimatedReveal>
          )}

          {/* Instructor Section */}
          {displayCourse.instructor && (displayCourse.instructor.name || displayCourse.instructor.qualification) && (
            <AnimatedReveal delay={0.45}>
              <div className="border-t border-hairline pt-3xl">
                <h2 className="font-mono text-label uppercase tracking-wider text-accent select-none mb-3xl">
                  [ INSTRUCTOR DETAILS ]
                </h2>
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                    {displayCourse.instructor.name && (
                      <div>
                        <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Instructor Name</p>
                        <p className="font-sans text-h4 text-offwhite font-semibold">{displayCourse.instructor.name}</p>
                      </div>
                    )}
                    {displayCourse.instructor.qualification && (
                      <div>
                        <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Qualification</p>
                        <p className="font-sans text-h4 text-offwhite font-semibold">{displayCourse.instructor.qualification}</p>
                      </div>
                    )}
                    {displayCourse.instructor.experienceYears && (
                      <div>
                        <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Experience</p>
                        <p className="font-sans text-h4 text-offwhite font-semibold">{displayCourse.instructor.experienceYears} Years</p>
                      </div>
                    )}
                    {displayCourse.instructor.trainerSince && (
                      <div>
                        <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Training Since</p>
                        <p className="font-sans text-h4 text-offwhite font-semibold">{displayCourse.instructor.trainerSince}</p>
                      </div>
                    )}
                    {displayCourse.instructor.contact && (
                      <div className="md:col-span-2">
                        <p className="font-mono text-label uppercase tracking-wider text-steelblue mb-sm">Contact</p>
                        <p className="font-sans text-h4 text-offwhite font-semibold">{displayCourse.instructor.contact}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedReveal>
          )}

        </div>

      </div>
    </section>
    </>
  );
}
