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
    timeout: 30000, // 30 second timeout
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
            quality: 'auto',
            fetch_format: 'auto',
            transformation: [
              { width: 1200, crop: 'limit' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('[Cloudinary] Upload error details:', {
                message: error.message,
                code: error.http_code || 'N/A',
                name: error.name
              });
              return reject(error);
            }
            resolve(result.secure_url);
          }
        );
        uploadStream.end(buffer);
      });

      return uploadedUrl;
    } catch (error) {
      console.error('[Cloudinary] Upload failed:', error.message);
      
      // Provide specific error messages based on error type
      if (error.message?.includes('timeout')) {
        throw new Error('Upload timed out. Please try again with a smaller file or check your connection.');
      } else if (error.message?.includes('quota')) {
        throw new Error('Cloudinary storage quota exceeded. Please contact support.');
      } else if (error.message?.includes('api_key') || error.message?.includes('authentication')) {
        throw new Error('Cloudinary authentication failed. Check your API credentials.');
      } else if (error.http_code === 400) {
        throw new Error('Invalid image format or corrupted file. Please try a different image.');
      } else if (error.http_code === 413) {
        throw new Error('File too large for Cloudinary. Maximum size exceeded.');
      } else if (error.http_code === 429) {
        throw new Error('Too many upload requests. Please wait and try again.');
      } else {
        throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
      }
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
    console.error('[Local Upload] File save failed:', error);
    if (error.code === 'ENOENT') {
      throw new Error('Upload directory does not exist and could not be created.');
    } else if (error.code === 'EACCES') {
      throw new Error('Permission denied. Cannot write to upload directory.');
    } else if (error.code === 'ENOSPC') {
      throw new Error('Disk full. Cannot save uploaded file.');
    } else {
      throw new Error(`Local upload failed: ${error.message}`);
    }
  }
}
