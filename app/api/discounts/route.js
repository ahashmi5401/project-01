import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';

// GET: Fetch all discount tiers (Public)
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const tiers = await db.collection('discountTiers')
      .find({})
      .sort({ minCourses: 1 })
      .toArray();

    return NextResponse.json({ success: true, tiers });
  } catch (error) {
    console.error('Fetch discounts API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve discount tiers.' }, { status: 500 });
  }
}

// POST: Add new discount tier (Admin Protected)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 403 });
    }

    const body = await req.json();
    const minCourses = parseInt(body.minCourses, 10);
    const discountPercent = parseFloat(body.discountPercent);
    const expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;

    // Validation
    if (isNaN(minCourses) || minCourses < 2) {
      return NextResponse.json({ error: 'Number of courses must be a positive integer greater than or equal to 2.' }, { status: 400 });
    }
    if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: 'Discount percent must be between 1 and 100.' }, { status: 400 });
    }
    if (expiryDate && isNaN(expiryDate.getTime())) {
      return NextResponse.json({ error: 'Invalid expiry date.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check for duplicate minCourses
    const existing = await db.collection('discountTiers').findOne({ minCourses });
    if (existing) {
      return NextResponse.json({ error: `A discount tier for ${minCourses} courses already exists.` }, { status: 400 });
    }

    const newTier = {
      minCourses,
      discountPercent,
      expiryDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('discountTiers').insertOne(newTier);

    return NextResponse.json({ success: true, tierId: result.insertedId, tier: newTier });
  } catch (error) {
    console.error('Create discount tier API error:', error);
    return NextResponse.json({ error: 'Failed to create discount tier.' }, { status: 500 });
  }
}
