import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configure Cloudinary from environment variables
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload a file (Web API File object from FormData) to Cloudinary.
 * Falls back to local /public/uploads/<folder>/ when Cloudinary env vars are absent (local dev only).
 *
 * @param {File} file   - File object from formData.get('file')
 * @param {string} folder - Cloudinary folder / local subfolder (e.g. 'services', 'screenshots')
 * @returns {Promise<string>} Publicly accessible URL of the uploaded image
 */
export async function uploadImage(file, folder = 'general') {
  if (!file) {
    throw new Error('No file provided');
  }

  // 1. Validate file size (5MB max)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('File size exceeds the 5MB limit.');
  }

  // 2. Validate file type (Images only)
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.');
  }

  // Convert Web API File to Node Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 3. Cloudinary upload (production path)
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const publicId = `${folder}/${crypto.randomUUID()}`;
      const uploadedUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `simuflux/${folder}`,
            resource_type: 'image',
            public_id: crypto.randomUUID(),
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(buffer);
      });

      return uploadedUrl;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new Error('Failed to upload image to Cloudinary. Check your CLOUDINARY_* env vars.');
    }
  }

  // 4. Local filesystem fallback (zero-config local dev — NOT for production)
  console.warn('[Upload] Cloudinary env vars not set. Falling back to local /public/uploads. This is for local dev only.');
  try {
    const originalName = file.name || 'image.jpg';
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const randomName = `${crypto.randomUUID()}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

    // Create directory recursively if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, randomName);
    fs.writeFileSync(filePath, buffer);

    // Return relative URL for next/image rendering
    return `/uploads/${folder}/${randomName}`;
  } catch (error) {
    console.error('Local file upload failed:', error);
    throw new Error('Failed to save uploaded file.');
  }
}
