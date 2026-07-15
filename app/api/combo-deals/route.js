import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// GET: Fetch all combo deals (Public)
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const comboDeals = await db.collection('comboDeals')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, comboDeals });
  } catch (error) {
    console.error('Fetch combo deals API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve combo deals.' }, { status: 500 });
  }
}

// POST: Add new combo deal (Admin Protected)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const ip = getClientIp(req);

    // Rate limiting: 100 requests per hour per IP, bypass for authenticated admins
    const rateLimitResult = await checkRateLimit('adminCrud', ip, { skipIfAdmin: true, session });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 403 });
    }

    const body = await req.json();
    const { courseIds, discountPercent, label, expiryDate } = body;

    // Validation
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: 'At least one course must be selected.' }, { status: 400 });
    }
    if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: 'Discount percent must be between 1 and 100.' }, { status: 400 });
    }
    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;
    if (parsedExpiryDate && isNaN(parsedExpiryDate.getTime())) {
      return NextResponse.json({ error: 'Invalid expiry date.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Sort courseIds to ensure consistent comparison
    const sortedCourseIds = [...courseIds].sort();

    // Check for duplicate course-set (exact match regardless of order)
    const existing = await db.collection('comboDeals').findOne({
      courseIds: { $size: sortedCourseIds.length, $all: sortedCourseIds }
    });
    if (existing) {
      return NextResponse.json({ error: 'A combo deal for this exact course combination already exists.' }, { status: 400 });
    }

    // Verify all courses exist and get their slugs
    const courses = await db.collection('courses')
      .find({ _id: { $in: sortedCourseIds.map(id => new ObjectId(id)) } })
      .toArray();
    
    if (courses.length !== sortedCourseIds.length) {
      return NextResponse.json({ error: 'One or more selected courses do not exist.' }, { status: 400 });
    }

    // Extract course slugs for backward compatibility
    const courseSlugs = courses.map(c => c.slug).sort();

    const newComboDeal = {
      courseIds: sortedCourseIds,
      courseSlugs: courseSlugs,
      discountPercent: parseFloat(discountPercent),
      label: label || '',
      expiryDate: parsedExpiryDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('comboDeals').insertOne(newComboDeal);

    return NextResponse.json({ success: true, dealId: result.insertedId, comboDeal: newComboDeal });
  } catch (error) {
    console.error('Create combo deal API error:', error);
    return NextResponse.json({ error: 'Failed to create combo deal.' }, { status: 500 });
  }
}
