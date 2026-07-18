/**
 * One-time Admin Seeding Script for Simuflux Lab
 * 
 * Usage:
 *   node scripts/seed-admin.js <email> <password> [--super-admin] [--force]
 * 
 * Make sure MONGODB_URI is defined in your .env.local file!
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Parse command line arguments
const args = process.argv.slice(2);
const positionalArgs = args.filter((arg) => !arg.startsWith('--'));
const flags = new Set(args.filter((arg) => arg.startsWith('--')));

if (positionalArgs.length < 2) {
  console.error('\x1b[31mError: Missing arguments.\x1b[0m');
  console.log('Usage: node scripts/seed-admin.js <email> <password> [--super-admin] [--force]');
  process.exit(1);
}

const [email, password] = positionalArgs;

if (!email.includes('@') || password.length < 6) {
  console.error('\x1b[31mError: Invalid email or password (min 6 characters).\x1b[0m');
  process.exit(1);
}

// Function to load MONGODB_URI from .env.local
function getMongoUri() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('\x1b[33mWarning: .env.local not found. Checking process.env.MONGODB_URI...\x1b[0m');
    return process.env.MONGODB_URI;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('MONGODB_URI=')) {
      const parts = line.split('=');
      return parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, ''); // strip quotes
    }
  }

  return process.env.MONGODB_URI;
}

async function main() {
  const uri = getMongoUri();
  if (!uri) {
    console.error('\x1b[31mError: MONGODB_URI could not be found in .env.local or process.env.\x1b[0m');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');

    // Check if admin already exists
    const existing = await usersCollection.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.error(`\x1b[33mWarning: User or Admin with email ${email} already exists.\x1b[0m`);
      if (!flags.has('--force')) {
        console.log('To overwrite this admin, run again with: node scripts/seed-admin.js <email> <password> --force');
        process.exit(0);
      }
      console.log('Overwriting existing account...');
      await usersCollection.deleteOne({ email: email.toLowerCase().trim() });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isSuperAdmin: flags.has('--super-admin'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await usersCollection.insertOne(newAdmin);
    console.log(`\n\x1b[32mSuccess: Admin account created successfully!\x1b[0m`);
    console.log(`Email: ${email}`);
    console.log(`Verified: Yes`);
    console.log(`Super Admin: ${newAdmin.isSuperAdmin ? 'Yes' : 'No'}\n`);
  } catch (err) {
    console.error('\x1b[31mDatabase operation failed:\x1b[0m', err);
  } finally {
    await client.close();
  }
}

main();
