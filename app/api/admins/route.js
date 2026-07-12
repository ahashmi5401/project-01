import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

// GET: List admins
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const admins = await db.collection('users')
      .find({ role: 'admin' }, { projection: { password: 0 } })
      .toArray();

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('List admins API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve administrators.' }, { status: 500 });
  }
}

// POST: Create a new admin directly
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const body = await req.json();
    const { email, password, role = 'admin' } = body;

    // Validation
    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Only admin role can be created through this endpoint.' }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();
    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: targetEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new admin account
    await db.collection('users').insertOne({
      email: targetEmail,
      password: hashedPassword,
      role: role,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('[Admin Create] New admin account created:', targetEmail);

    return NextResponse.json({ success: true, message: 'Admin account created successfully.' });
  } catch (error) {
    console.error('Create admin API error:', error);
    return NextResponse.json({ error: 'Failed to create administrator account.' }, { status: 500 });
  }
}
