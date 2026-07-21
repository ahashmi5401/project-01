import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { normalizePrice } from '@/lib/price';

// Helper to generate a URL-safe slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_-]+/g, '-') // replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // trim starting/ending hyphens
}

// GET: Fetch all courses (Public API)
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const courses = await db.collection('courses')
      .find({})
      .sort({ id: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Fetch courses API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve courses.' }, { status: 500 });
  }
}

// POST: Add new course (Admin Protected)
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
    const { title, description, image, id, price, discountPercent, points, curriculum, duration, features, targetAudience, instructor } = body;

    // Validation
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    }
    if (discountPercent !== undefined && (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100)) {
      return NextResponse.json({ error: 'Discount percent must be between 0 and 100.' }, { status: 400 });
    }

    let normalizedPrice;
    try {
      normalizedPrice = normalizePrice(price);
    } catch (priceErr) {
      return NextResponse.json({ error: priceErr.message }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Determine custom numeric ID or generate next sequentially
    let courseId = id ? id.trim() : null;
    if (!courseId) {
      const allCourses = await db.collection('courses').find({}).toArray();
      const nextNum = allCourses.length + 1;
      courseId = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    }

    const slug = generateSlug(title);

    // Verify ID uniqueness (if custom ID provided)
    if (courseId) {
      const existingById = await db.collection('courses').findOne({ id: courseId });
      if (existingById) {
        return NextResponse.json({ error: `A course with ID "${courseId}" already exists.` }, { status: 400 });
      }
    }

    // Verify slug uniqueness
    const existing = await db.collection('courses').findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: `A course with title "${title}" (slug: ${slug}) already exists.` }, { status: 400 });
    }

    const newCourse = {
      id: courseId,
      slug,
      title: title.trim(),
      description: description.trim(),
      price: normalizedPrice,
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : 0,
      points: Array.isArray(points) ? points.map(p => p.trim()).filter(Boolean) : [],
      image: image || '/images/courses/placeholder.jpg',
      curriculum: Array.isArray(curriculum) ? curriculum.map(c => c.trim()).filter(Boolean) : [],
      duration: duration || { totalDuration: '', classesPerWeek: 0, classDurationHours: 0 },
      features: Array.isArray(features) ? features : [],
      targetAudience: targetAudience || '',
      instructor: instructor || { name: '', experienceYears: '', qualification: '', trainerSince: '', contact: '' },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('courses').insertOne(newCourse);

    return NextResponse.json({ success: true, courseId: result.insertedId, course: newCourse });
  } catch (error) {
    console.error('Create course API error:', error);
    return NextResponse.json({ error: 'Failed to create course.' }, { status: 500 });
  }
}
