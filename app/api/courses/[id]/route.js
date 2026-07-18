import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Helper to generate a URL-safe slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// PUT: Update course (Admin Protected)
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
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    const body = await req.json();
    const { title, description, image, id: courseNum, price, discountPercent, points, curriculum, duration, features, targetAudience, instructor } = body;

    // Validation
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    }
    if (discountPercent !== undefined && (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100)) {
      return NextResponse.json({ error: 'Discount percent must be between 0 and 100.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Check if the course exists
    const course = await db.collection('courses').findOne({ _id: new ObjectId(id) });
    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    const slug = generateSlug(title);

    // Verify slug uniqueness (excluding current course)
    const existing = await db.collection('courses').findOne({ 
      slug, 
      _id: { $ne: new ObjectId(id) } 
    });
    if (existing) {
      return NextResponse.json({ error: `Another course with title "${title}" (slug: ${slug}) already exists.` }, { status: 400 });
    }

    const updateFields = {
      title: title.trim(),
      slug,
      description: description.trim(),
      price: price ? Number(price) : 0,
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : (course.discountPercent || 0),
      points: Array.isArray(points) ? points.map(p => p.trim()).filter(Boolean) : [],
      image: image || course.image,
      id: courseNum || course.id,
      curriculum: Array.isArray(curriculum) ? curriculum.map(c => c.trim()).filter(Boolean) : [],
      duration: duration || course.duration || { totalDuration: '', classesPerWeek: 0, classDurationHours: 0 },
      features: Array.isArray(features) ? features : [],
      targetAudience: targetAudience !== undefined ? targetAudience : (course.targetAudience || ''),
      instructor: instructor || course.instructor || { name: '', experienceYears: '', qualification: '', trainerSince: '', contact: '' },
      updatedAt: new Date()
    };

    const result = await db.collection('courses').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true, course: { ...course, ...updateFields } });
  } catch (error) {
    console.error('[COURSES PUT] Error:', error);
    return NextResponse.json({ error: 'Failed to update course.' }, { status: 500 });
  }
}

// DELETE: Delete course (Admin Protected)
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
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const result = await db.collection('courses').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Course deleted successfully.' });
  } catch (error) {
    console.error('[COURSES DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete course.' }, { status: 500 });
  }
}
