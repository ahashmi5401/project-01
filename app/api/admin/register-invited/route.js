import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, token, password } = body;

    // Validate inputs
    if (!email || !token || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Find matching unverified admin with valid token
    const admin = await db.collection('users').findOne({
      email: email.toLowerCase().trim(),
      role: 'admin',
      verificationToken: token,
      tokenExpiry: { $gt: new Date() }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid or expired invitation link. Please request a new invitation.' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update admin status
    await db.collection('users').updateOne(
      { _id: admin._id },
      {
        $set: {
          password: hashedPassword,
          isVerified: true,
          updatedAt: new Date()
        },
        $unset: {
          verificationToken: "",
          tokenExpiry: ""
        }
      }
    );

    return NextResponse.json({ success: true, message: 'Account activated successfully. You can now log in.' });
  } catch (error) {
    console.error('Finalize invited registration API error:', error);
    return NextResponse.json({ error: 'Failed to complete registration.' }, { status: 500 });
  }
}
