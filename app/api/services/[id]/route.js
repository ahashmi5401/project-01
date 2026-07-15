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

// PUT: Update service (Admin Protected)
export async function PUT(req, { params }) {
  try {
    console.log('[SERVICES PUT] Starting update request');
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

    console.log('[SERVICES PUT] Session:', session ? 'Found' : 'Not found', session);
    if (!session || session.user.role !== 'admin') {
      console.log('[SERVICES PUT] Unauthorized - no session or not admin');
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 403 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID.' }, { status: 400 });
    }

    const body = await req.json();
    console.log('[SERVICES PUT] Request body:', body);
    const { title, shortDescription, detail, image, id: serviceNum, points } = body;

    // Validation
    if (!title?.trim() || !shortDescription?.trim() || !detail?.trim()) {
      return NextResponse.json({ error: 'Title, short description, and details are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Check if the service exists
    const service = await db.collection('services').findOne({ _id: new ObjectId(id) });
    console.log('[SERVICES PUT] Found service:', service ? 'Yes' : 'No', service ? service._id : null);
    if (!service) {
      console.log('[SERVICES PUT] Service not found with ID:', id);
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    const slug = generateSlug(title);

    // Verify slug uniqueness (excluding current service)
    const existing = await db.collection('services').findOne({ 
      slug, 
      _id: { $ne: new ObjectId(id) } 
    });
    if (existing) {
      return NextResponse.json({ error: `Another service with title "${title}" (slug: ${slug}) already exists.` }, { status: 400 });
    }

    const updateFields = {
      title: title.trim(),
      slug,
      shortDescription: shortDescription.trim(),
      detail: detail.trim(),
      points: Array.isArray(points) ? points.map(p => p.trim()).filter(Boolean) : [],
      image: image || service.image,
      id: serviceNum || service.id,
      updatedAt: new Date()
    };

    const result = await db.collection('services').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    console.log('[SERVICES PUT] Update result:', result);

    return NextResponse.json({ success: true, service: { ...service, ...updateFields } });
  } catch (error) {
    console.error('[SERVICES PUT] Error:', error);
    return NextResponse.json({ error: 'Failed to update service.' }, { status: 500 });
  }
}

// DELETE: Delete service (Admin Protected)
export async function DELETE(req, { params }) {
  try {
    console.log('[SERVICES DELETE] Starting delete request');
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

    console.log('[SERVICES DELETE] Session:', session ? 'Found' : 'Not found', session);
    if (!session || session.user.role !== 'admin') {
      console.log('[SERVICES DELETE] Unauthorized - no session or not admin');
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 403 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const result = await db.collection('services').deleteOne({ _id: new ObjectId(id) });
    console.log('[SERVICES DELETE] Delete result:', result);
    if (result.deletedCount === 0) {
      console.log('[SERVICES DELETE] Service not found, deletedCount:', result.deletedCount);
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('[SERVICES DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete service.' }, { status: 500 });
  }
}
