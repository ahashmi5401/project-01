import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

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

    // 4. Create new user with forced role: 'user'
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user', // Hardcoded role, client cannot modify it
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').insertOne(newUser);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. You can now log in.'
    });

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during signup.' }, { status: 500 });
  }
}
