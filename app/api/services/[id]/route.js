import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID.' }, { status: 400 });
    }

    const body = await req.json();
    const { title, shortDescription, detail, image, id: serviceNum } = body;

    // Validation
    if (!title?.trim() || !shortDescription?.trim() || !detail?.trim()) {
      return NextResponse.json({ error: 'Title, short description, and details are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Check if the service exists
    const service = await db.collection('services').findOne({ _id: new ObjectId(id) });
    if (!service) {
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
      image: image || service.image,
      id: serviceNum || service.id,
      updatedAt: new Date()
    };

    await db.collection('services').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true, service: { ...service, ...updateFields } });
  } catch (error) {
    console.error('Update service API error:', error);
    return NextResponse.json({ error: 'Failed to update service.' }, { status: 500 });
  }
}

// DELETE: Delete service (Admin Protected)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const result = await db.collection('services').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Delete service API error:', error);
    return NextResponse.json({ error: 'Failed to delete service.' }, { status: 500 });
  }
}
