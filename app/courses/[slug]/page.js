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
      title: "Course Not Found | SimuFlux",
      description: "The requested training course details could not be found.",
    };
  }

  return {
    title: `${course.title} — Training Curriculum | SimuFlux`,
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

  return (
    <section className="min-h-screen pt-32 pb-20 relative overflow-hidden bg-navy text-offwhite">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Breadcrumb back navigation */}
        <AnimatedReveal>
          <div className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-steelblue select-none">
            <Link href="/courses" className="hover:text-accent transition-colors">
              Courses
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-offwhite">{displayCourse.slug}</span>
          </div>
        </AnimatedReveal>

        {/* Title and Header Eyebrow */}
        <AnimatedReveal delay={0.05}>
          <div className="border-b border-hairline pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <SectionEyebrow text={`Course Ref ${displayCourse.id}`} />
              <h1 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-offwhite uppercase tracking-tight">
                {displayCourse.title}
              </h1>
              {/* Online-only delivery indicator and Price */}
              <div className="flex flex-wrap gap-3 mt-4 items-center">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-accent/80 border border-accent/25 bg-accent/5 px-3 py-1">
                  ● Delivered Online
                </span>
                {displayCourse.price && (
                  <>
                    {displayCourse.discountPercent && displayCourse.discountPercent > 0 ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-steelblue/60 line-through border border-white/10 bg-white/5 px-3 py-1">
                          PKR {displayCourse.price.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-accent border border-accent/25 bg-accent/5 px-3 py-1">
                          PKR {Math.round(displayCourse.price * (1 - displayCourse.discountPercent / 100)).toLocaleString()}
                          <span className="text-accent/70">({displayCourse.discountPercent}% OFF)</span>
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-offwhite border border-white/20 bg-white/5 px-3 py-1">
                        PKR {displayCourse.price.toLocaleString()}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="font-mono text-xs text-steelblue/50 select-none">
              CURRICULUM SPEC ID: {displayCourse.id}
            </div>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Detail Text & CTA Column */}
          <div className="lg:col-span-6 space-y-8">
            <AnimatedReveal delay={0.1}>
              <div className="space-y-6">
                <h2 className="font-mono text-xs uppercase tracking-wider text-accent select-none">
                  [ COURSE DESCRIPTION ]
                </h2>
                <p className="font-sans text-base sm:text-lg text-steelblue leading-relaxed">
                  {displayCourse.description}
                </p>
                {displayCourse.detail && (
                  <p className="font-sans text-base sm:text-lg text-offwhite leading-relaxed whitespace-pre-wrap">
                    {displayCourse.detail}
                  </p>
                )}

                {/* Course Highlights / Points */}
                {displayCourse.points && displayCourse.points.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-accent select-none mb-3">
                      [ COURSE HIGHLIGHTS ]
                    </h3>
                    <ul className="space-y-2">
                      {displayCourse.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-steelblue leading-relaxed">
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
              <div className="border-t border-hairline pt-8 space-y-4">
                <p className="text-xs font-mono uppercase tracking-wider text-steelblue select-none">
                  Initialize registration and secure custom package discount:
                </p>
                <Link 
                  href={`/enroll?course=${displayCourse.slug}`}
                  className="inline-block bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-mono uppercase tracking-wider text-xs px-8 py-4 border border-transparent transition-all select-none hover:shadow-lg hover:shadow-accent/15"
                >
                  Enroll Now
                </Link>
              </div>
            </AnimatedReveal>
          </div>

          {/* Work Sample/Thumbnail Image Column */}
          <div className="lg:col-span-6">
            <AnimatedReveal delay={0.15}>
              <div className="space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-wider text-steelblue select-none">
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
        <div className="space-y-16">
          
          {/* Duration Section */}
          {displayCourse.duration && (displayCourse.duration.totalDuration || displayCourse.duration.classesPerWeek || displayCourse.duration.classDurationHours) && (
            <AnimatedReveal delay={0.25}>
              <div className="border-t border-hairline pt-12">
                <h2 className="font-mono text-xs uppercase tracking-wider text-accent select-none mb-6">
                  [ COURSE DURATION ]
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {displayCourse.duration.totalDuration && (
                    <div className="bg-navy/50 border border-hairline rounded-lg p-6">
                      <p className="font-mono text-xs uppercase tracking-wider text-steelblue mb-2">Total Duration</p>
                      <p className="font-sans text-lg text-offwhite font-semibold">{displayCourse.duration.totalDuration}</p>
                    </div>
                  )}
                  {displayCourse.duration.classesPerWeek && (
                    <div className="bg-navy/50 border border-hairline rounded-lg p-6">
                      <p className="font-mono text-xs uppercase tracking-wider text-steelblue mb-2">Classes Per Week</p>
                      <p className="font-sans text-lg text-offwhite font-semibold">{displayCourse.duration.classesPerWeek}</p>
                    </div>
                  )}
                  {displayCourse.duration.classDurationHours && (
                    <div className="bg-navy/50 border border-hairline rounded-lg p-6">
                      <p className="font-mono text-xs uppercase tracking-wider text-steelblue mb-2">Class Duration</p>
                      <p className="font-sans text-lg text-offwhite font-semibold">{displayCourse.duration.classDurationHours} Hours</p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedReveal>
          )}

          {/* Curriculum Section */}
          {displayCourse.curriculum && displayCourse.curriculum.length > 0 && (
            <AnimatedReveal delay={0.3}>
              <div className="border-t border-hairline pt-12">
                <h2 className="font-mono text-xs uppercase tracking-wider text-accent select-none mb-6">
                  [ COURSE CURRICULUM ]
                </h2>
                <div className="bg-navy/30 border border-hairline rounded-lg p-8">
                  <ul className="space-y-3">
                    {displayCourse.curriculum.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-steelblue leading-relaxed">
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
              <div className="border-t border-hairline pt-12">
                <h2 className="font-mono text-xs uppercase tracking-wider text-accent select-none mb-6">
                  [ COURSE FEATURES ]
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayCourse.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-navy/30 border border-hairline rounded-lg px-5 py-4">
                      <span className="text-accent text-lg">✓</span>
                      <span className="font-sans text-sm text-offwhite">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedReveal>
          )}

          {/* Target Audience Section */}
          {displayCourse.targetAudience && (
            <AnimatedReveal delay={0.4}>
              <div className="border-t border-hairline pt-12">
                <h2 className="font-mono text-xs uppercase tracking-wider text-accent select-none mb-6">
                  [ TARGET AUDIENCE ]
                </h2>
                <div className="bg-navy/30 border border-hairline rounded-lg p-8">
                  <p className="font-sans text-base sm:text-lg text-steelblue leading-relaxed whitespace-pre-wrap">
                    {displayCourse.targetAudience}
                  </p>
                </div>
              </div>
            </AnimatedReveal>
          )}

          {/* Instructor Section */}
          {displayCourse.instructor && (displayCourse.instructor.name || displayCourse.instructor.qualification) && (
            <AnimatedReveal delay={0.45}>
              <div className="border-t border-hairline pt-12">
                <h2 className="font-mono text-xs uppercase tracking-wider text-accent select-none mb-6">
                  [ INSTRUCTOR DETAILS ]
                </h2>
                <div className="bg-navy/30 border border-hairline rounded-lg p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayCourse.instructor.name && (
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-steelblue mb-2">Instructor Name</p>
                        <p className="font-sans text-lg text-offwhite font-semibold">{displayCourse.instructor.name}</p>
                      </div>
                    )}
                    {displayCourse.instructor.qualification && (
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-steelblue mb-2">Qualification</p>
                        <p className="font-sans text-lg text-offwhite font-semibold">{displayCourse.instructor.qualification}</p>
                      </div>
                    )}
                    {displayCourse.instructor.experienceYears && (
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-steelblue mb-2">Experience</p>
                        <p className="font-sans text-lg text-offwhite font-semibold">{displayCourse.instructor.experienceYears} Years</p>
                      </div>
                    )}
                    {displayCourse.instructor.trainerSince && (
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-steelblue mb-2">Training Since</p>
                        <p className="font-sans text-lg text-offwhite font-semibold">{displayCourse.instructor.trainerSince}</p>
                      </div>
                    )}
                    {displayCourse.instructor.contact && (
                      <div className="md:col-span-2">
                        <p className="font-mono text-xs uppercase tracking-wider text-steelblue mb-2">Contact</p>
                        <p className="font-sans text-lg text-offwhite font-semibold">{displayCourse.instructor.contact}</p>
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
  );
}
