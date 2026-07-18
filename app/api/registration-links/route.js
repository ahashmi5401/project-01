import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import crypto from 'crypto';

async function requireAdminSession(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Unauthorized request.' }, { status: 403 }) };
  }

  const ip = getClientIp(req);
  const rateLimitResult = await checkRateLimit('adminCrud', ip, { skipIfAdmin: true, session });
  if (!rateLimitResult.success) {
    return { error: NextResponse.json({ error: rateLimitResult.error }, { status: 429 }) };
  }

  return { session };
}

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
    const auth = await requireAdminSession(req);
    if (auth.error) return auth.error;

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
 * GET - Check token status or list registration links for a specific course
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const courseSlug = searchParams.get('courseSlug');

    // If token is provided, check its status
    if (token) {
      const { db } = await connectToDatabase();
      const link = await db.collection('registrationLinks').findOne({ token });

      if (!link) {
        return NextResponse.json(
          { error: 'Token not found.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        token: link.token,
        status: link.status,
        courseSlug: link.courseSlug,
        createdAt: link.createdAt,
        usedAt: link.usedAt,
      });
    }

    // If courseSlug is provided, list all links for that course (admin only)
    if (courseSlug) {
      const auth = await requireAdminSession(req);
      if (auth.error) return auth.error;

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
    }

    return NextResponse.json(
      { error: 'Either token or courseSlug query parameter is required.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in registration links API:', error);
    return NextResponse.json(
      { error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
