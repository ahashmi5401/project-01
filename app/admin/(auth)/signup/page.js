import React from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import { redirect } from 'next/navigation';
import AdminSignupForm from './AdminSignupForm';

export const dynamic = 'force-dynamic';

export default async function AdminSignupPage() {
  const { db } = await connectToDatabase();
  
  // Server-side check: Redirect if any admin account already exists
  const existingAdmin = await db.collection('users').findOne({ role: 'admin' });
  if (existingAdmin) {
    redirect('/admin/login');
  }

  return <AdminSignupForm />;
}
