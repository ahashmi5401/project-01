import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password, confirmPassword } = await req.json();

    // 1. Basic Validation
    if (!email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (!email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 2. Atomic Security Check: Use singleton bootstrap document to prevent race conditions
    const bootstrapResult = await db.collection('systemConfig').findOneAndUpdate(
      { _id: 'bootstrap' },
      { $setOnInsert: { used: true } },
      { upsert: true }
    );

    // If upsertedCount is 0, the document already exists -> bootstrap already completed
    if (bootstrapResult.upsertedCount === 0) {
      return NextResponse.json(
        { error: 'Bootstrap registration is permanently disabled because an administrator already exists.' },
        { status: 403 }
      );
    }

    // 3. Email Duplicity Check
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await db.collection('users').findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
    }

    // 4. Hash password and insert admin
    const hashedPassword = await bcrypt.hash(password, 12);
    const newAdmin = {
      email: cleanEmail,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('users').insertOne(newAdmin);

    return NextResponse.json({
      success: true,
      message: 'Initial administrator account configured successfully.'
    });
  } catch (error) {
    console.error('Bootstrap admin signup API error:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
