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
              {/* Online-only delivery indicator */}
              <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-accent/80 border border-accent/25 bg-accent/5 px-3 py-1 mt-4">
                ● Delivered Online
              </span>
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
              </div>
            </AnimatedReveal>

            <AnimatedReveal delay={0.2}>
              <div className="border-t border-hairline pt-8 space-y-4">
                <p className="text-xs font-mono uppercase tracking-wider text-steelblue select-none">
                  Initialize query or coordinate training scoping:
                </p>
                <InquiryTrigger 
                  targetName={displayCourse.title}
                  targetType="course"
                  buttonText="Inquire About This Course"
                />
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

      </div>
    </section>
  );
}
