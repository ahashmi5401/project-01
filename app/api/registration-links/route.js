import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST - Generate a new registration link token for a course
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { courseSlug } = body;

    if (!courseSlug || typeof courseSlug !== 'string') {
      return NextResponse.json(
        { error: 'courseSlug is required and must be a string.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Verify the course exists
    const course = await db.collection('courses').findOne({ slug: courseSlug });
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found.' },
        { status: 404 }
      );
    }

    // Generate unique token
    const token = generateToken();

    // Create registration link document
    const registrationLink = {
      token,
      courseSlug,
      status: 'pending',
      createdAt: new Date(),
      usedAt: null,
    };

    await db.collection('registrationLinks').insertOne(registrationLink);

    return NextResponse.json({
      success: true,
      token,
      registrationUrl: `/register/${courseSlug}?token=${token}`,
    });
  } catch (error) {
    console.error('Error generating registration link:', error);
    return NextResponse.json(
      { error: 'Failed to generate registration link.' },
      { status: 500 }
    );
  }
}

/**
 * GET - List registration links for a specific course
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseSlug = searchParams.get('courseSlug');

    if (!courseSlug) {
      return NextResponse.json(
        { error: 'courseSlug query parameter is required.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const links = await db.collection('registrationLinks')
      .find({ courseSlug })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      links: links.map(link => ({
        token: link.token,
        status: link.status,
        createdAt: link.createdAt,
        usedAt: link.usedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching registration links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration links.' },
      { status: 500 }
    );
  }
}
