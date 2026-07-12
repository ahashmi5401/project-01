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

// GET: Fetch all services (Public API)
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const services = await db.collection('services')
      .find({})
      .sort({ id: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Fetch services API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve services.' }, { status: 500 });
  }
}

// POST: Add new service (Admin Protected)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, shortDescription, detail, image, id } = body;

    // Validation
    if (!title?.trim() || !shortDescription?.trim() || !detail?.trim()) {
      return NextResponse.json({ error: 'Title, short description, and details are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Determine custom numeric ID or generate next sequentially
    let serviceId = id ? id.trim() : null;
    if (!serviceId) {
      const allServices = await db.collection('services').find({}).toArray();
      const nextNum = allServices.length + 1;
      serviceId = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    }

    const slug = generateSlug(title);

    // Verify slug uniqueness
    const existing = await db.collection('services').findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: `A service with title "${title}" (slug: ${slug}) already exists.` }, { status: 400 });
    }

    const newService = {
      id: serviceId,
      slug,
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      detail: detail.trim(),
      image: image || '/images/services/placeholder.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('services').insertOne(newService);

    return NextResponse.json({ success: true, serviceId: result.insertedId, service: newService });
  } catch (error) {
    console.error('Create service API error:', error);
    return NextResponse.json({ error: 'Failed to create service.' }, { status: 500 });
  }
}
