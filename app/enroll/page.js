import React from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import EnrollForm from '@/components/courses/EnrollForm';

export const metadata = {
  title: "Course Enrollment & Packages | SimuFlux Academy",
  description: "Configure your customized training package, select multiple engineering courses, and view live volume discount calculations.",
};

// Force live server-rendering
export const dynamic = 'force-dynamic';

async function getEnrollData() {
  try {
    const { db } = await connectToDatabase();
    
    const coursesData = await db.collection('courses')
      .find({})
      .sort({ id: 1 })
      .toArray();

    const discountTiersData = await db.collection('discountTiers')
      .find({})
      .sort({ minCourses: 1 })
      .toArray();

    const courses = coursesData.map(c => ({
      _id: c._id.toString(),
      id: c.id,
      title: c.title,
      slug: c.slug,
      price: c.price || 0,
    }));

    const discountTiers = discountTiersData.map(t => ({
      _id: t._id.toString(),
      minCourses: t.minCourses,
      discountPercent: t.discountPercent,
    }));

    return { courses, discountTiers };
  } catch (error) {
    console.error('Failed to load enrollment data from database:', error);
    return { courses: [], discountTiers: [] };
  }
}

export default async function EnrollPage() {
  const { courses, discountTiers } = await getEnrollData();

  return (
    <section className="min-h-screen pt-32 pb-20 relative overflow-hidden bg-navy text-offwhite">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <EnrollForm courses={courses} discountTiers={discountTiers} />
      </div>
    </section>
  );
}
