import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // 1. Basic validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { db } = await connectToDatabase();

    // 2. Duplicate check in unified 'users' collection
    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // 5. Create new user with forced role: 'user' and verification fields
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user', // Hardcoded role, client cannot modify it
      isVerified: false,
      verificationToken,
      tokenExpiry,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').insertOne(newUser);

    // 6. Send verification email
    if (resend && process.env.RESEND_FROM_EMAIL) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: normalizedEmail,
          subject: 'Verify Your Email Address — Simuflux Lab',
          text: `Dear ${name.trim()},

Thank you for registering with Simuflux Lab.

To complete your account registration, please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
Simuflux Lab Team
Karachi, Pakistan`,
          html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="border: 1px solid #ddd; padding: 30px;">
    <h2 style="margin: 0 0 20px; color: #333;">Verify Your Email Address</h2>
    
    <p style="margin: 0 0 10px; color: #333;">Dear <strong>${name.trim()}</strong>,</p>
    
    <p style="margin: 0 0 20px; color: #333;">Thank you for registering with Simuflux Lab. To complete your account registration, please verify your email address.</p>
    
    <p style="margin: 0 0 20px;">
      <a href="${verificationUrl}" style="background-color: #333; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block;">Verify Email</a>
    </p>
    
    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Or copy and paste this link:</p>
    <p style="margin: 0 0 20px; color: #666; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
    
    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
    
    <p style="margin: 20px 0 10px; color: #666; font-size: 14px;">If you did not create an account, please ignore this email.</p>
    
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
    
    <p style="margin: 0; color: #333;">Best regards,<br><strong>Simuflux Lab Team</strong><br>Karachi, Pakistan</p>
  </div>
</div>`
        });
      } catch (err) {
        console.error('[Signup] Failed to send verification email:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during signup.' }, { status: 500 });
  }
}
