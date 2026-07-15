import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// PUT: Update discount tier (Admin Protected)
export async function PUT(req, { params }) {
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

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid tier ID.' }, { status: 400 });
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

    // Check if the tier exists
    const tier = await db.collection('discountTiers').findOne({ _id: new ObjectId(id) });
    if (!tier) {
      return NextResponse.json({ error: 'Discount tier not found.' }, { status: 404 });
    }

    // Verify minCourses uniqueness (excluding current tier)
    const existing = await db.collection('discountTiers').findOne({
      minCourses,
      _id: { $ne: new ObjectId(id) }
    });
    if (existing) {
      return NextResponse.json({ error: `Another discount tier for ${minCourses} courses already exists.` }, { status: 400 });
    }

    const updateFields = {
      minCourses,
      discountPercent,
      expiryDate,
      updatedAt: new Date()
    };

    await db.collection('discountTiers').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true, tier: { ...tier, ...updateFields } });
  } catch (error) {
    console.error('Update discount tier API error:', error);
    return NextResponse.json({ error: 'Failed to update discount tier.' }, { status: 500 });
  }
}

// DELETE: Delete discount tier (Admin Protected)
export async function DELETE(req, { params }) {
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

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid tier ID.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('discountTiers').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Discount tier not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Discount tier deleted successfully.' });
  } catch (error) {
    console.error('Delete discount tier API error:', error);
    return NextResponse.json({ error: 'Failed to delete discount tier.' }, { status: 500 });
  }
}
