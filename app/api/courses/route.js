import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, image, id } = body;

    // Validation
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
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
      image: image || '/images/courses/placeholder.jpg',
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
