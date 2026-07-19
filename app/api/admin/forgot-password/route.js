import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();
    const { db } = await connectToDatabase();

    // Check if verified admin exists
    const admin = await db.collection('users').findOne({ email: targetEmail, role: 'admin', isVerified: true });
    if (!admin) {
      // Security best practice: don't reveal that the user doesn't exist, just say success
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await db.collection('users').updateOne(
      { _id: admin._id },
      { 
        $set: { 
          resetToken, 
          resetTokenExpiry, 
          updatedAt: new Date() 
        } 
      }
    );

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(targetEmail)}`;

    if (resend) {
      try {
        await resend.emails.send({
          from: 'SimuFlux System <system@simuflux.com>',
          to: targetEmail,
          subject: 'SimuFlux Admin Password Reset',
          text: `You requested a password reset for your SimuFlux Admin account. Reset your password by clicking here: ${resetLink}`,
          html: `
            <h3>SimuFlux Password Reset</h3>
            <p>We received a request to reset the password for your SimuFlux Admin account.</p>
            <p>To set a new password, click the button below:</p>
            <p style="margin: 24px 0;">
              <a href="${resetLink}" style="background-color: #E8622C; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; font-family: sans-serif; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p style="color: #666; font-size: 11px;">This link will expire in 1 hour. If you did not request this, you can ignore this email.</p>
          `,
        });
      } catch (err) {
        console.error('Failed to send reset password email:', err);
        return NextResponse.json({ error: 'Failed to send password reset email. Please try again.' }, { status: 500 });
      }
    } else {
      console.warn('Resend API key is not configured. Reset Link:', resetLink);
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ 
          success: true, 
          warning: 'Development Mode: Resend not set up.', 
          resetLink 
        });
      }
    }

    return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ error: 'Failed to request password reset.' }, { status: 500 });
  }
}
