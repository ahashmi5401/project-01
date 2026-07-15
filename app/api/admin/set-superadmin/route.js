import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req) {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const superAdminEmail = 'admin@simuflux.com';
    const superAdmin = await usersCollection.findOne({ email: superAdminEmail });
    
    if (!superAdmin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }
    
    const result = await usersCollection.updateOne(
      { email: superAdminEmail },
      { $set: { isSuperAdmin: true, updatedAt: new Date() } }
    );
    
    const updated = await usersCollection.findOne({ email: superAdminEmail });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Super Admin flag set successfully',
      data: {
        email: updated.email,
        role: updated.role,
        isSuperAdmin: updated.isSuperAdmin
      }
    });
  } catch (error) {
    console.error('Set Super Admin error:', error);
    return NextResponse.json({ error: 'Failed to set Super Admin flag' }, { status: 500 });
  }
}
