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

async function syncDatabaseToStatic() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Load static data
    const coursesPath = path.join(__dirname, '..', 'data', 'courses.js');
    const servicesPath = path.join(__dirname, '..', 'data', 'services.js');
    
    // Parse static courses (simple extraction)
    const coursesContent = fs.readFileSync(coursesPath, 'utf-8');
    const staticCourseSlugs = coursesContent.match(/slug: "([^"]+)"/g).map(s => s.replace(/slug: "/, '').replace(/"/, ''));
    
    // Parse static services
    const servicesContent = fs.readFileSync(servicesPath, 'utf-8');
    const staticServiceSlugs = servicesContent.match(/slug: "([^"]+)"/g).map(s => s.replace(/slug: "/, '').replace(/"/, ''));
    
    console.log('Static course slugs:', staticCourseSlugs);
    console.log('Static service slugs:', staticServiceSlugs);
    
    // Sync courses
    console.log('\n=== SYNCING COURSES ===');
    const coursesCollection = db.collection('courses');
    const allCourses = await coursesCollection.find({}).toArray();
    
    for (const course of allCourses) {
      if (!staticCourseSlugs.includes(course.slug)) {
        console.log(`Deleting course not in static data: ${course.slug} (${course.title})`);
        await coursesCollection.deleteOne({ _id: course._id });
      } else {
        console.log(`Keeping course in static data: ${course.slug} (${course.title})`);
      }
    }
    
    // Sync services
    console.log('\n=== SYNCING SERVICES ===');
    const servicesCollection = db.collection('services');
    const allServices = await servicesCollection.find({}).toArray();
    
    for (const service of allServices) {
      if (!staticServiceSlugs.includes(service.slug)) {
        console.log(`Deleting service not in static data: ${service.slug} (${service.title})`);
        await servicesCollection.deleteOne({ _id: service._id });
      } else {
        console.log(`Keeping service in static data: ${service.slug} (${service.title})`);
      }
    }
    
    console.log('\n=== VERIFICATION ===');
    const finalCourses = await coursesCollection.find({}).toArray();
    const finalServices = await servicesCollection.find({}).toArray();
    
    console.log(`Courses: ${finalCourses.length} total`);
    console.log(`Services: ${finalServices.length} total`);
    
    if (finalCourses.length === staticCourseSlugs.length && finalServices.length === staticServiceSlugs.length) {
      console.log('\n✓ Database now matches static data exactly!');
    } else {
      console.log('\n✗ Mismatch between database and static data');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

syncDatabaseToStatic();
