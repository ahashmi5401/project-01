import React from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import AdminLoginForm from './AdminLoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const { db } = await connectToDatabase();
  const adminExists = await db.collection('users').findOne({ role: 'admin' }) ? true : false;

  return <AdminLoginForm adminExists={adminExists} />;
}
