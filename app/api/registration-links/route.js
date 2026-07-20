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
    let coursesInput = [];

    if (body.courses && Array.isArray(body.courses)) {
      coursesInput = body.courses;
    } else if (body.courseSlug) {
      coursesInput = [{
        courseSlug: body.courseSlug,
        negotiatedPrice: body.negotiatedPrice !== undefined ? body.negotiatedPrice : null
      }];
    }

    if (coursesInput.length === 0) {
      return NextResponse.json(
        { error: 'At least one course is required.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const coursesToSave = [];

    // Validate each course in the list
    for (const item of coursesInput) {
      const { courseSlug, negotiatedPrice } = item;
      if (!courseSlug || typeof courseSlug !== 'string') {
        return NextResponse.json(
          { error: 'courseSlug is required for each course and must be a string.' },
          { status: 400 }
        );
      }

      const course = await db.collection('courses').findOne({ slug: courseSlug });
      if (!course) {
        return NextResponse.json(
          { error: `Course "${courseSlug}" not found.` },
          { status: 404 }
        );
      }

      let finalNegotiatedPrice = null;
      if (course.price === null) {
        if (negotiatedPrice === undefined || negotiatedPrice === null || negotiatedPrice === '') {
          return NextResponse.json(
            { error: `negotiatedPrice is required for Price Inquiry course "${course.title}".` },
            { status: 400 }
          );
        }
        finalNegotiatedPrice = Number(negotiatedPrice);
        if (isNaN(finalNegotiatedPrice) || finalNegotiatedPrice < 0) {
          return NextResponse.json(
            { error: `negotiatedPrice for "${course.title}" must be a non-negative number.` },
            { status: 400 }
          );
        }
      } else {
        if (negotiatedPrice !== undefined && negotiatedPrice !== null && negotiatedPrice !== '') {
          finalNegotiatedPrice = Number(negotiatedPrice);
          if (isNaN(finalNegotiatedPrice) || finalNegotiatedPrice < 0) {
            return NextResponse.json(
              { error: `negotiatedPrice for "${course.title}" must be a non-negative number.` },
              { status: 400 }
            );
          }
        }
      }

      coursesToSave.push({
        courseSlug,
        negotiatedPrice: finalNegotiatedPrice
      });
    }

    // Generate unique token
    const token = generateToken();

    // Create registration link document
    const registrationLink = {
      token,
      courses: coursesToSave,
      status: 'pending',
      createdAt: new Date(),
      usedAt: null,
    };

    await db.collection('registrationLinks').insertOne(registrationLink);

    return NextResponse.json({
      success: true,
      token,
      registrationUrl: `/register/${coursesToSave[0].courseSlug}?token=${token}`,
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
        courses: link.courses || [{
          courseSlug: link.courseSlug,
          negotiatedPrice: link.negotiatedPrice !== undefined ? link.negotiatedPrice : null
        }],
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
        .find({
          $or: [
            { courseSlug },
            { "courses.courseSlug": courseSlug }
          ]
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      return NextResponse.json({
        success: true,
        links: links.map(link => ({
          token: link.token,
          status: link.status,
          courses: link.courses || [{
            courseSlug: link.courseSlug,
            negotiatedPrice: link.negotiatedPrice !== undefined ? link.negotiatedPrice : null
          }],
          createdAt: link.createdAt,
          usedAt: link.usedAt,
        })),
      });
    }

    // If no specific param is provided, return all links for general admin history management
    const auth = await requireAdminSession(req);
    if (auth.error) return auth.error;

    const { db } = await connectToDatabase();
    const links = await db.collection('registrationLinks')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      links: links.map(link => ({
        token: link.token,
        status: link.status,
        courses: link.courses || [{
          courseSlug: link.courseSlug,
          negotiatedPrice: link.negotiatedPrice !== undefined ? link.negotiatedPrice : null
        }],
        createdAt: link.createdAt,
        usedAt: link.usedAt,
      })),
    });
  } catch (error) {
    console.error('Error in registration links API:', error);
    return NextResponse.json(
      { error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
