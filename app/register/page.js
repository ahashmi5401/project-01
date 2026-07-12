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

// Fetch courses helper to pass to form
async function getCourses() {
  try {
    const { db } = await connectToDatabase();
    const courses = await db.collection('courses').find({}).toArray();
    return courses.map(c => ({
      ...c,
      _id: c._id.toString(),
    }));
  } catch (error) {
    console.error('Failed to fetch courses for registration:', error);
    return [];
  }
}

export default async function GeneralRegisterPage() {
  const courses = await getCourses();

  return (
    <section className="min-h-screen pt-32 pb-20 relative overflow-hidden bg-navy text-offwhite">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <RegistrationForm courses={courses} isLocked={false} />
      </div>
    </section>
  );
}
