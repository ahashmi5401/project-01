const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let MONGODB_URI = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  // Try multiple patterns to match MONGODB_URI
  const patterns = [
    /^MONGODB_URI=(.+)$/m,
    /^MONGODB_URI="(.+)"$/m,
    /^MONGODB_URI='(.+)'$/m,
  ];
  
  for (const pattern of patterns) {
    const match = envContent.match(pattern);
    if (match) {
      MONGODB_URI = match[1].trim().replace(/^['"]|['"]$/g, ''); // Remove surrounding quotes
      break;
    }
  }
}

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

async function cleanupDuplicates() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== Cleaning up duplicate courses ===');
    const coursesCollection = db.collection('courses');
    const courses = await coursesCollection.find({}).sort({ createdAt: 1 }).toArray();
    
    // Group by slug
    const coursesBySlug = {};
    courses.forEach(course => {
      if (!coursesBySlug[course.slug]) {
        coursesBySlug[course.slug] = [];
      }
      coursesBySlug[course.slug].push(course);
    });
    
    // Find and remove duplicates
    for (const [slug, docs] of Object.entries(coursesBySlug)) {
      if (docs.length > 1) {
        console.log(`\nFound ${docs.length} duplicates for slug: ${slug}`);
        // Keep the earliest one (first in sorted array)
        const toKeep = docs[0];
        const toDelete = docs.slice(1);
        
        console.log(`  Keeping: _id=${toKeep._id}, createdAt=${toKeep.createdAt}`);
        toDelete.forEach(doc => {
          console.log(`  Deleting: _id=${doc._id}, createdAt=${doc.createdAt}`);
        });
        
        // Delete duplicates
        const deleteIds = toDelete.map(d => d._id);
        await coursesCollection.deleteMany({ _id: { $in: deleteIds } });
        console.log(`  Deleted ${toDelete.length} duplicate(s)`);
      }
    }
    
    console.log('\n=== Cleaning up duplicate services ===');
    const servicesCollection = db.collection('services');
    const services = await servicesCollection.find({}).sort({ createdAt: 1 }).toArray();
    
    // Group by slug
    const servicesBySlug = {};
    services.forEach(service => {
      if (!servicesBySlug[service.slug]) {
        servicesBySlug[service.slug] = [];
      }
      servicesBySlug[service.slug].push(service);
    });
    
    // Find and remove duplicates
    for (const [slug, docs] of Object.entries(servicesBySlug)) {
      if (docs.length > 1) {
        console.log(`\nFound ${docs.length} duplicates for slug: ${slug}`);
        // Keep the earliest one
        const toKeep = docs[0];
        const toDelete = docs.slice(1);
        
        console.log(`  Keeping: _id=${toKeep._id}, createdAt=${toKeep.createdAt}`);
        toDelete.forEach(doc => {
          console.log(`  Deleting: _id=${doc._id}, createdAt=${doc.createdAt}`);
        });
        
        // Delete duplicates
        const deleteIds = toDelete.map(d => d._id);
        await servicesCollection.deleteMany({ _id: { $in: deleteIds } });
        console.log(`  Deleted ${toDelete.length} duplicate(s)`);
      }
    }
    
    console.log('\n=== Verification ===');
    const finalCourses = await coursesCollection.find({}).toArray();
    const finalServices = await servicesCollection.find({}).toArray();
    
    const courseSlugs = finalCourses.map(c => c.slug);
    const serviceSlugs = finalServices.map(s => s.slug);
    
    const duplicateCourses = courseSlugs.filter((item, index) => courseSlugs.indexOf(item) !== index);
    const duplicateServices = serviceSlugs.filter((item, index) => serviceSlugs.indexOf(item) !== index);
    
    console.log(`Courses: ${finalCourses.length} total, ${duplicateCourses.length} duplicate slugs`);
    console.log(`Services: ${finalServices.length} total, ${duplicateServices.length} duplicate slugs`);
    
    if (duplicateCourses.length === 0 && duplicateServices.length === 0) {
      console.log('\n✓ No duplicates remain!');
    } else {
      console.log('\n✗ Duplicates still exist - manual review needed');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

cleanupDuplicates();
