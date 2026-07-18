/**
 * Database repair script: Generates slugs for any courses missing a slug.
 * 
 * Usage:
 *   node scripts/fix-slugs.js
 */

const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const dns = require('dns');

// Node 17+ changed default DNS result order to prefer IPv6 which can break Atlas SRV resolution
dns.setDefaultResultOrder("ipv4first");

// Helper to generate a URL-safe slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Function to load MONGODB_URI from .env.local
function getMongoUri() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Warning: .env.local not found. Checking process.env.MONGODB_URI...');
    return process.env.MONGODB_URI;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('MONGODB_URI=')) {
      const parts = line.split('=');
      return parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  }

  return process.env.MONGODB_URI;
}

async function main() {
  const uri = getMongoUri();
  if (!uri) {
    console.error('Error: MONGODB_URI could not be found.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const coursesCollection = db.collection('courses');

    // Find all courses where slug is missing, null, undefined, or literally "undefined"
    const courses = await coursesCollection.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: "undefined" },
        { slug: "" }
      ]
    }).toArray();

    console.log(`Found ${courses.length} courses with missing or invalid slugs.`);

    for (const course of courses) {
      const newSlug = generateSlug(course.title);
      console.log(`Generating slug for: "${course.title}" -> "${newSlug}"`);
      
      await coursesCollection.updateOne(
        { _id: course._id },
        { $set: { slug: newSlug, updatedAt: new Date() } }
      );
    }

    console.log('Finished updating course slugs successfully!');
  } catch (err) {
    console.error('Database operation failed:', err);
  } finally {
    await client.close();
  }
}

main();
