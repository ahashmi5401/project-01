import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { uploadImage } from '@/lib/upload';

export async function POST(req) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'general'; // e.g., 'services' or 'courses'

    if (!file) {
      return NextResponse.json({ error: 'No file was selected.' }, { status: 400 });
    }

    const url = await uploadImage(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('File upload route error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload image.' }, { status: 500 });
  }
}
