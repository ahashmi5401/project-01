/**
 * Test Google Sheets Integration
 * 
 * Usage:
 *   node scripts/test-sheets.js
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const dns = require('dns');

// Node 17+ changed default DNS result order to prefer IPv6 which can break Atlas SRV resolution
dns.setDefaultResultOrder("ipv4first");

function getEnvVars() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const vars = {};
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      let val = trimmed.substring(idx + 1).trim();
      vars[key] = val;
    }
  }
  return vars;
}

async function main() {
  const vars = getEnvVars();
  const email = vars.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = vars.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const sheetId = vars.GOOGLE_SHEET_ID;

  console.log('Vars found keys:', Object.keys(vars));
  console.log('Private key exists:', !!privateKey);
  if (privateKey) {
    console.log('Raw Private key length:', privateKey.length);
  }

  if (!email || !privateKey || !sheetId) {
    console.error('Error: Missing environment variables', { email: !!email, privateKey: !!privateKey, sheetId: !!sheetId });
    process.exit(1);
  }

  // Next.js parser strips surrounding quotes if any, let's emulate that
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.substring(1, privateKey.length - 1);
  } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.substring(1, privateKey.length - 1);
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  console.log('Testing with Service Account Email:', email);
  console.log('Testing with Sheet ID:', sheetId);
  console.log('Private key string details:');
  console.log('  - Starts with:', JSON.stringify(privateKey.substring(0, 30)));
  console.log('  - Ends with:', JSON.stringify(privateKey.substring(privateKey.length - 30)));
  console.log('  - Includes raw \\n (literal):', privateKey.includes('\\n'));
  console.log('  - Includes real newline:', privateKey.includes('\n'));
  console.log('  - Total Length after processing:', privateKey.length);

  try {
    console.log('Trying Options Object Constructor...');
    const auth = new google.auth.JWT({
      email: email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    console.log('Authenticating...');
    await auth.authorize();
    console.log('Authentication successful using Options Object!');

    const sheets = google.sheets({ version: 'v4', auth });
    console.log('Fetching spreadsheet metadata...');
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    console.log('Spreadsheet Title:', response.data.properties.title);
    console.log('Sheets inside spreadsheet:', response.data.sheets.map(s => s.properties.title));
  } catch (err) {
    console.error('Google Sheets API Options Object Test FAILED with error:', err);
    
    console.log('\nRetrying with positional arguments just in case...');
    try {
      const auth = new google.auth.JWT(
        email,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      await auth.authorize();
      console.log('Authentication successful using Positional Arguments!');
    } catch (posErr) {
      console.error('Positional Arguments also FAILED:', posErr);
    }
  }
}

main();
