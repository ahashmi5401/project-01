import { MongoClient } from 'mongodb';
import dns from "node:dns"

// Force public DNS resolvers — SRV lookups for mongodb+srv:// often fail
// on local ISP/router DNS (SRV records not forwarded or blocked outright)
dns.setServers(["1.1.1.1", "8.8.8.8"]);
// Node 17+ changed default DNS result order to prefer IPv6 which can break Atlas SRV resolution
dns.setDefaultResultOrder("ipv4first");
const options = {};

let client;
let clientPromise;

// In development, use a global variable so the value is preserved
// across module reloads caused by HMR (Hot Module Replacement).
// In production, it's best to not use a global variable.
function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[MongoDB] MONGODB_URI environment variable is not defined');
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  console.log('[MongoDB] Attempting to connect with URI:', uri.replace(/:([^:@]+)@/, ':****@'));
  console.log('[MongoDB] Environment:', process.env.NODE_ENV || 'unknown');

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      console.log('[MongoDB] Creating new MongoDB client connection...');
      client = new MongoClient(uri, {
        ...options,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 30000,
      });
      global._mongoClientPromise = client.connect().then(async (c) => {
        console.log('[MongoDB] Connected successfully to MongoDB');
        await seedDatabase(c.db());
        return c;
      }).catch((error) => {
        console.error('[MongoDB] Connection failed:', error.message);
        console.error('[MongoDB] Full error:', error);
        global._mongoClientPromise = null;
        throw error;
      });
    } else {
      console.log('[MongoDB] Reusing existing MongoDB connection');
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      console.log('[MongoDB] Creating new MongoDB client connection (production)...');
      client = new MongoClient(uri, {
        ...options,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 30000,
      });
      clientPromise = client.connect().then(async (c) => {
        console.log('[MongoDB] Connected successfully to MongoDB (production)');
        await seedDatabase(c.db());
        return c;
      }).catch((error) => {
        console.error('[MongoDB] Connection failed (production):', error.message);
        clientPromise = null;
        throw error;
      });
    } else {
      console.log('[MongoDB] Reusing existing MongoDB connection (production)');
    }
    return clientPromise;
  }
}

export async function connectToDatabase() {
  const clientInstance = await getClientPromise();
  const db = clientInstance.db();
  return { client: clientInstance, db };
}

// Auto-seed services and courses collections from static data if they are empty
async function seedDatabase(db) {
  try {
    // 0. Migration: Move existing admins to users collection and set role 'admin'
    try {
      const adminsCollection = db.collection('admins');
      const adminsCount = await adminsCollection.countDocuments().catch(() => 0);
      if (adminsCount > 0) {
        console.log(`[Migration] Migrating ${adminsCount} admins to users collection...`);
        const usersCollection = db.collection('users');
        const admins = await adminsCollection.find().toArray();
        for (const admin of admins) {
          const userExists = await usersCollection.findOne({ email: admin.email });
          if (!userExists) {
            const { _id, ...adminData } = admin;
            await usersCollection.insertOne({
              ...adminData,
              role: 'admin',
              updatedAt: adminData.updatedAt || new Date(),
              createdAt: adminData.createdAt || new Date()
            });
          }
        }
        await adminsCollection.drop().catch(() => {});
        console.log('[Migration] Migration of admins to users completed successfully.');
      }
    } catch (migError) {
      console.error('[Migration] Failed to migrate admins to users:', migError);
    }

    // 1. Migration: Set isSuperAdmin for admin@Simuflux.com
    try {
      const usersCollection = db.collection('users');
      const superAdminEmail = 'admin@Simuflux.com';
      const superAdmin = await usersCollection.findOne({ email: superAdminEmail });
      
      if (superAdmin) {
        if (!superAdmin.isSuperAdmin) {
          await usersCollection.updateOne(
            { email: superAdminEmail },
            { $set: { isSuperAdmin: true, updatedAt: new Date() } }
          );
          console.log('[Migration] Set isSuperAdmin: true for admin@Simuflux.com');
        }
      } else {
        console.log('[Migration] Warning: admin@Simuflux.com not found in users collection');
      }
    } catch (migError) {
      console.error('[Migration] Failed to set isSuperAdmin for admin@Simuflux.com:', migError);
    }

    const servicesCollection = db.collection('services');
    const coursesCollection = db.collection('courses');
    const registrationLinksCollection = db.collection('registrationLinks');

    // Create unique indexes on slug to prevent duplicates at database level
    try {
      await servicesCollection.createIndex({ slug: 1 }, { unique: true, name: 'slug_unique' });
      console.log('[Seed] Created unique index on services.slug');
    } catch (indexError) {
      if (indexError.code !== 86) { // Index already exists
        console.error('[Seed] Failed to create index on services.slug:', indexError);
      }
    }

    try {
      await coursesCollection.createIndex({ slug: 1 }, { unique: true, name: 'slug_unique' });
      console.log('[Seed] Created unique index on courses.slug');
    } catch (indexError) {
      if (indexError.code !== 86) { // Index already exists
        console.error('[Seed] Failed to create index on courses.slug:', indexError);
      }
    }

    // Create unique index on token for registrationLinks
    try {
      await registrationLinksCollection.createIndex({ token: 1 }, { unique: true, name: 'token_unique' });
      console.log('[Seed] Created unique index on registrationLinks.token');
    } catch (indexError) {
      if (indexError.code !== 86) { // Index already exists
        console.error('[Seed] Failed to create index on registrationLinks.token:', indexError);
      }
    }

    // Create index on courseSlug for querying links per course
    try {
      await registrationLinksCollection.createIndex({ courseSlug: 1, createdAt: -1 }, { name: 'courseSlug_createdAt' });
      console.log('[Seed] Created index on registrationLinks.courseSlug + createdAt');
    } catch (indexError) {
      if (indexError.code !== 86) { // Index already exists
        console.error('[Seed] Failed to create index on registrationLinks.courseSlug:', indexError);
      }
    }

    // 1. Seed/Sync Services (atomic upsert to prevent race conditions)
    // DISABLED: Services are now managed manually through admin panel
    // console.log('[Seed] Syncing services database with static services list...');
    // for (const service of staticServices) {
    //   const result = await servicesCollection.updateOne(
    //     { slug: service.slug },
    //     { $setOnInsert: {
    //       id: service.id,
    //       slug: service.slug,
    //       title: service.title,
    //       shortDescription: service.shortDescription,
    //       detail: service.detail,
    //       image: service.image || `/images/services/${service.slug}.jpg`,
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     }},
    //     { upsert: true }
    //   );
    //   if (result.upsertedCount > 0) {
    //     console.log(`[Seed] Inserted service: ${service.title}`);
    //   }
    // }

    // 2. Seed/Sync Courses (atomic upsert to prevent race conditions)
    // DISABLED: Courses are now managed manually through admin panel
    // console.log('[Seed] Syncing courses database with static courses list...');
    // for (const course of staticCourses) {
    //   const result = await coursesCollection.updateOne(
    //     { slug: course.slug },
    //     { $setOnInsert: {
    //       id: course.id,
    //       slug: course.slug,
    //       title: course.title,
    //       description: course.description,
    //       detail: course.detail || '',
    //       image: course.image || (course.id === '01' ? '/images/courses/ansys.jpg' : `/images/courses/${course.slug}.jpg`),
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     }},
    //     { upsert: true }
    //   );
    //   if (result.upsertedCount > 0) {
    //     console.log(`[Seed] Inserted course: ${course.title}`);
    //   }
    // }
    console.log('[Seed] Database sync completed successfully.');
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
  }
}
