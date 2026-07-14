import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT: Update combo deal (Admin Protected)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 403 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid combo deal ID.' }, { status: 400 });
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
    
    // Check if the combo deal exists
    const existingDeal = await db.collection('comboDeals').findOne({ _id: new ObjectId(id) });
    if (!existingDeal) {
      return NextResponse.json({ error: 'Combo deal not found.' }, { status: 404 });
    }

    // Sort courseIds to ensure consistent comparison
    const sortedCourseIds = [...courseIds].sort();

    // Check for duplicate course-set (excluding current deal)
    const duplicate = await db.collection('comboDeals').findOne({
      _id: { $ne: new ObjectId(id) },
      courseIds: { $size: sortedCourseIds.length, $all: sortedCourseIds }
    });
    if (duplicate) {
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

    const updateFields = {
      courseIds: sortedCourseIds,
      courseSlugs: courseSlugs,
      discountPercent: parseFloat(discountPercent),
      label: label || '',
      expiryDate: parsedExpiryDate,
      updatedAt: new Date()
    };

    const result = await db.collection('comboDeals').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true, comboDeal: { ...existingDeal, ...updateFields } });
  } catch (error) {
    console.error('Update combo deal API error:', error);
    return NextResponse.json({ error: 'Failed to update combo deal.' }, { status: 500 });
  }
}

// DELETE: Delete combo deal (Admin Protected)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 403 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid combo deal ID.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const result = await db.collection('comboDeals').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Combo deal not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Combo deal deleted successfully.' });
  } catch (error) {
    console.error('Delete combo deal API error:', error);
    return NextResponse.json({ error: 'Failed to delete combo deal.' }, { status: 500 });
  }
}
