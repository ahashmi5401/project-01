/**
 * Migration script to add courseTitles to existing combo deals
 * This ensures fallback title matching works even if slugs change
 */

const { connectToDatabase } = require('../lib/mongodb');

async function updateComboDeals() {
  try {
    const { db } = await connectToDatabase();
    
    // Get all combo deals
    const comboDeals = await db.collection('comboDeals').find({}).toArray();
    
    console.log(`Found ${comboDeals.length} combo deals`);
    
    for (const deal of comboDeals) {
      // Skip if already has courseTitles
      if (deal.courseTitles && deal.courseTitles.length > 0) {
        console.log(`Skipping ${deal.label} - already has courseTitles`);
        continue;
      }
      
      // Find courses by IDs (primary) or slugs (fallback for backward compatibility)
      const { ObjectId } = require('mongodb');
      let courses = [];
      
      if (deal.courseIds && deal.courseIds.length > 0) {
        // Use courseIds (primary method)
        courses = await db.collection('courses')
          .find({ _id: { $in: deal.courseIds.map(id => new ObjectId(id)) } })
          .toArray();
      } else if (deal.courseSlugs && deal.courseSlugs.length > 0) {
        // Fallback to courseSlugs for old deals
        courses = await db.collection('courses')
          .find({ slug: { $in: deal.courseSlugs } })
          .toArray();
      }
      
      const expectedCount = deal.courseIds?.length || deal.courseSlugs?.length || 0;
      if (courses.length === expectedCount) {
        const courseTitles = courses.map(c => c.title).sort();
        
        // Update combo deal
        await db.collection('comboDeals').updateOne(
          { _id: deal._id },
          { 
            $set: { 
              courseTitles: courseTitles,
              updatedAt: new Date()
            } 
          }
        );
        
        console.log(`✓ Updated "${deal.label}" with titles:`, courseTitles);
      } else {
        console.log(`✗ Failed to update "${deal.label}" - some courses not found`);
      }
    }
    
    console.log('\nMigration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

updateComboDeals();
