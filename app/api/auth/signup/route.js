import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    console.log('[Signup] New signup request received');
    const { name, email, password } = await req.json();
    console.log('[Signup] Email:', email);

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
    console.log('[Signup] Generated verification token for email:', normalizedEmail);

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
    console.log('[Signup] User created successfully in database:', normalizedEmail);

    // 6. Send verification email
    if (resend && process.env.RESEND_FROM_EMAIL) {
      console.log('[Signup] Sending verification email via Resend...');
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: normalizedEmail,
          subject: 'Verify Your Email Address',
          text: `Hello ${name.trim()},

Thank you for signing up! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best Regards,
Simuflux Lab Team`,
          html: `
            <h3>Verify Your Email Address</h3>
            <p>Hello <strong>${name.trim()}</strong>,</p>
            <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
            <p>
              <a href="${verificationUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
            <p>If you did not create an account, please ignore this email.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Simuflux Lab</strong> — Karachi, Pakistan</p>
          `
        });
        console.log('[Signup] Verification email sent successfully to:', normalizedEmail);
      } catch (err) {
        console.error('[Signup] Failed to send verification email:', err);
      }
    } else {
      console.log('[Signup] Resend not configured, skipping email sending');
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
