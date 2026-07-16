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

    const comboDealsData = await db.collection('comboDeals')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const courses = coursesData.map(c => ({
      _id: c._id.toString(),
      id: c.id,
      title: c.title,
      slug: c.slug,
      price: c.price || 0,
      discountPercent: c.discountPercent || 0,
    }));

    const discountTiers = discountTiersData.map(t => ({
      _id: t._id.toString(),
      minCourses: t.minCourses,
      discountPercent: t.discountPercent,
    }));

    const comboDeals = comboDealsData.map(d => ({
      _id: d._id.toString(),
      courseIds: (d.courseIds || []).map(String),
      courseSlugs: d.courseSlugs || [],
      discountPercent: d.discountPercent,
      label: d.label,
    }));

    return { courses, discountTiers, comboDeals };
  } catch (error) {
    console.error('Failed to load enrollment data from database:', error);
    return { courses: [], discountTiers: [], comboDeals: [] };
  }
}

export default async function EnrollPage() {
  const { courses, discountTiers, comboDeals } = await getEnrollData();

  return (
    <section className="min-h-screen pt-24 pb-4xl relative overflow-hidden bg-navy text-offwhite">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <EnrollForm courses={courses} discountTiers={discountTiers} comboDeals={comboDeals} />
      </div>
    </section>
  );
}
