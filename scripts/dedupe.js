/**
 * Cleanup script — removes duplicate AND slug-less documents from MongoDB.
 * For services and courses: keeps the FIRST doc per slug, deletes duplicates and null-slug docs.
 */
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
dns.setDefaultResultOrder('ipv4first');

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const uriMatch = envContent.match(/MONGODB_URI=["']?([^"'\r\n]+)["']?/);
if (!uriMatch) { console.error('No MONGODB_URI found'); process.exit(1); }
const uri = uriMatch[1];

async function cleanCollection(db, collectionName) {
  const collection = db.collection(collectionName);
  const all = await collection.find({}).sort({ _id: 1 }).toArray();

  const seen = new Map();
  const toDelete = [];

  for (const doc of all) {
    const key = doc.slug;

    // Delete docs with no slug or empty slug
    if (!key || key === 'undefined' || key.trim() === '') {
      toDelete.push(doc._id);
      console.log(`  [DELETE no-slug] id=${doc._id} title="${doc.title}"`);
      continue;
    }

    if (seen.has(key)) {
      toDelete.push(doc._id);
      console.log(`  [DELETE duplicate] slug="${key}" id=${doc._id}`);
    } else {
      seen.set(key, doc._id);
    }
  }

  console.log(`[${collectionName}] Total: ${all.length} | Unique slugs: ${seen.size} | To delete: ${toDelete.length}`);

  if (toDelete.length > 0) {
    const result = await collection.deleteMany({ _id: { $in: toDelete } });
    console.log(`[${collectionName}] ✓ Deleted ${result.deletedCount} documents.`);
  } else {
    console.log(`[${collectionName}] ✓ No cleanup needed.`);
  }

  const remaining = await collection.find({}, { projection: { slug: 1, title: 1, _id: 0 } }).sort({ id: 1 }).toArray();
  console.log(`[${collectionName}] Final count: ${remaining.length}`);
  remaining.forEach(d => console.log(`  ✓ ${d.slug}: ${d.title}`));
  console.log('');
}

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected. Running cleanup...\n');
    await cleanCollection(db, 'services');
    await cleanCollection(db, 'courses');
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
  }
}

main();
