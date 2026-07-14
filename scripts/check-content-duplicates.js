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

async function checkContentDuplicates() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== CHECKING COURSES FOR DUPLICATE CONTENT (slug + title) ===');
    const coursesCollection = db.collection('courses');
    const courses = await coursesCollection.find({}).sort({ createdAt: 1 }).toArray();
    
    // Group by slug + title combination
    const coursesByKey = {};
    courses.forEach(course => {
      const key = `${course.slug}|${course.title}`;
      if (!coursesByKey[key]) {
        coursesByKey[key] = [];
      }
      coursesByKey[key].push(course);
    });
    
    let courseDuplicates = 0;
    for (const [key, docs] of Object.entries(coursesByKey)) {
      if (docs.length > 1) {
        courseDuplicates++;
        console.log(`\nFound ${docs.length} duplicates for: ${key}`);
        docs.forEach((doc, i) => {
          console.log(`  [${i}] _id=${doc._id}, createdAt=${doc.createdAt}`);
        });
      }
    }
    
    console.log(`\nTotal duplicate content groups in courses: ${courseDuplicates}`);
    
    console.log('\n=== CHECKING SERVICES FOR DUPLICATE CONTENT (slug + title) ===');
    const servicesCollection = db.collection('services');
    const services = await servicesCollection.find({}).sort({ createdAt: 1 }).toArray();
    
    // Group by slug + title combination
    const servicesByKey = {};
    services.forEach(service => {
      const key = `${service.slug}|${service.title}`;
      if (!servicesByKey[key]) {
        servicesByKey[key] = [];
      }
      servicesByKey[key].push(service);
    });
    
    let serviceDuplicates = 0;
    for (const [key, docs] of Object.entries(servicesByKey)) {
      if (docs.length > 1) {
        serviceDuplicates++;
        console.log(`\nFound ${docs.length} duplicates for: ${key}`);
        docs.forEach((doc, i) => {
          console.log(`  [${i}] _id=${doc._id}, createdAt=${doc.createdAt}`);
        });
      }
    }
    
    console.log(`\nTotal duplicate content groups in services: ${serviceDuplicates}`);
    
    if (courseDuplicates === 0 && serviceDuplicates === 0) {
      console.log('\n✓ No duplicate content found!');
    } else {
      console.log('\n✗ Duplicate content found - needs cleanup');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkContentDuplicates();
