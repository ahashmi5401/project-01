import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req) {
  try {
    console.log('[VerifyEmail] Email verification request received');
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      console.log('[VerifyEmail] No token provided');
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 });
    }

    console.log('[VerifyEmail] Token received, validating...');
    const { db } = await connectToDatabase();

    // Find user with valid token
    const user = await db.collection('users').findOne({
      verificationToken: token,
      tokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      console.log('[VerifyEmail] Invalid or expired token');
      return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });
    }

    console.log('[VerifyEmail] Valid token found for user:', user.email);
    // Update user to verified
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date()
        },
        $unset: {
          verificationToken: "",
          tokenExpiry: ""
        }
      }
    );

    console.log('[VerifyEmail] Email verified successfully for user:', user.email);
    return NextResponse.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('[VerifyEmail] Email verification API error:', error);
    return NextResponse.json({ error: 'Failed to verify email.' }, { status: 500 });
  }
}
