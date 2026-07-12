import React from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import RegistrationForm from '@/components/shared/RegistrationForm';

export const metadata = {
  title: "General Course Enrollment | SimuFlux",
  description: "Secure student seat registration and receipt submission.",
  robots: {
    index: false,
    follow: false,
  },
};

// Fetch courses and discount tiers helper to pass to form
async function getRegistrationData() {
  try {
    const { db } = await connectToDatabase();
    const coursesData = await db.collection('courses').find({}).toArray();
    const tiersData = await db.collection('discountTiers').find({}).sort({ minCourses: 1 }).toArray();
    
    const courses = coursesData.map(c => ({
      ...c,
      _id: c._id.toString(),
    }));

    const discountTiers = tiersData.map(t => ({
      _id: t._id.toString(),
      minCourses: t.minCourses,
      discountPercent: t.discountPercent,
    }));

    return { courses, discountTiers };
  } catch (error) {
    console.error('Failed to fetch registration data:', error);
    return { courses: [], discountTiers: [] };
  }
}

export default async function GeneralRegisterPage() {
  const { courses, discountTiers } = await getRegistrationData();

  return (
    <section className="min-h-screen pt-32 pb-20 relative overflow-hidden bg-navy text-offwhite">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <RegistrationForm courses={courses} discountTiers={discountTiers} isLocked={false} />
      </div>
    </section>
  );
}
