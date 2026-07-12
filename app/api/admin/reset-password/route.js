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
    
    // Find matching admin with valid reset token
    const admin = await db.collection('users').findOne({
      email: email.toLowerCase().trim(),
      role: 'admin',
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid or expired password reset link. Please request a new link.' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update admin password
    await db.collection('users').updateOne(
      { _id: admin._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: ""
        }
      }
    );

    return NextResponse.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
