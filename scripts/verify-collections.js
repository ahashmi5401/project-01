const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let MONGODB_URI = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const patterns = [
    /^MONGODB_URI=(.+)$/m,
    /^MONGODB_URI="(.+)"$/m,
    /^MONGODB_URI='(.+)'$/m,
  ];
  
  for (const pattern of patterns) {
    const match = envContent.match(pattern);
    if (match) {
      MONGODB_URI = match[1].trim().replace(/^['"]|['"]$/g, '');
      break;
    }
  }
}

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

async function verifyCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== COURSES COLLECTION ===');
    const coursesCollection = db.collection('courses');
    const courses = await coursesCollection.find({}).sort({ slug: 1 }).toArray();
    console.log(`Total courses: ${courses.length}`);
    courses.forEach(course => {
      console.log(`  - Slug: ${course.slug}, ID: ${course._id}, Title: ${course.title}, Created: ${course.createdAt}`);
    });
    
    console.log('\n=== SERVICES COLLECTION ===');
    const servicesCollection = db.collection('services');
    const services = await servicesCollection.find({}).sort({ slug: 1 }).toArray();
    console.log(`Total services: ${services.length}`);
    services.forEach(service => {
      console.log(`  - Slug: ${service.slug}, ID: ${service._id}, Title: ${service.title}, Created: ${service.createdAt}`);
    });
    
    console.log('\n=== INDEXES ===');
    const courseIndexes = await coursesCollection.indexes();
    console.log('Courses indexes:', courseIndexes.map(i => i.name).join(', '));
    
    const serviceIndexes = await servicesCollection.indexes();
    console.log('Services indexes:', serviceIndexes.map(i => i.name).join(', '));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

verifyCollections();
