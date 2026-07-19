import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { uploadImage } from '@/lib/upload';
import { escapeHtml } from '@/lib/escapeHtml';
import { Resend } from 'resend';
import { google } from 'googleapis';
import { calculatePricing, getDiscountSourceLabel } from '@/lib/pricingEngine';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyTurnstileToken } from '@/lib/turnstile';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Normalize CNIC to 13 digits (strip dashes/spaces).
 * Accepts formats: 12345-1234567-1 or 1234512345671
 */
function normalizeCnic(raw) {
  return raw.replace(/\D/g, '');
}

/**
 * Format CNIC digits back to standard dashed format: XXXXX-XXXXXXX-X
 */
function formatCnic(digits) {
  if (digits.length !== 13) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export async function POST(req) {
  let token = null;
  try {
    // Validate required environment variables
    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error('RESEND_FROM_EMAIL environment variable is not configured');
    }
    if (!process.env.ADMIN_EMAIL) {
      throw new Error('ADMIN_EMAIL environment variable is not configured');
    }

    const formData = await req.formData();

    // Rate limiting: 10 requests per hour per IP
    const ip = getClientIp(req);
    const rateLimitResult = await checkRateLimit('register', ip);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const turnstileToken = formData.get('turnstileToken');
    const turnstileValid = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileValid) {
      return NextResponse.json({ error: 'CAPTCHA verification failed.' }, { status: 400 });
    }

    const name              = formData.get('name');
    const cnicRaw           = formData.get('cnic');
    const email             = formData.get('email');
    const phone             = formData.get('phone');
    const university        = formData.get('university');
    const city              = formData.get('city');
    const reason            = formData.get('reason');
    const highestQual       = formData.get('highestQualification');
    const currentlyPursuing = formData.get('currentlyPursuing');
    const courses           = formData.getAll('courses');
    const screenshot        = formData.get('screenshot');
    token                   = formData.get('token');

    // --- 1. Server-side validation ---
    if (
      !name?.trim() ||
      !cnicRaw?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !university?.trim() ||
      !city?.trim() ||
      !reason?.trim() ||
      !highestQual?.trim() ||
      !currentlyPursuing?.trim() ||
      !Array.isArray(courses) ||
      courses.length === 0 ||
      !screenshot
    ) {
      return NextResponse.json(
        { error: 'All fields, including selecting at least one course and attaching the payment screenshot, are required.' },
        { status: 400 }
      );
    }

    // CNIC: strip dashes/spaces, must be exactly 13 digits
    const cnicDigits = normalizeCnic(cnicRaw);
    if (cnicDigits.length !== 13) {
      return NextResponse.json(
        { error: 'CNIC must be exactly 13 digits (with or without dashes).' },
        { status: 400 }
      );
    }
    const cnic = formatCnic(cnicDigits);

    // Basic email format check
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cleanEmail = email.toLowerCase().trim();
    const cleanCourses = courses.map(c => c.trim());

    // --- Token validation and atomic claim (if token provided) ---
    let tokenLink = null;
    if (token) {
      // Atomically check and claim the token using findOneAndUpdate
      // This prevents race conditions - only one request can successfully claim a pending token
      tokenLink = await db.collection('registrationLinks').findOneAndUpdate(
        { token, status: 'pending' },
        { 
          $set: { 
            status: 'used',
            usedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!tokenLink) {
        // Token doesn't exist or was already used
        return NextResponse.json(
          { error: 'This registration link has already been used or is invalid.' },
          { status: 409 }
        );
      }
    }

    // --- 2. Duplicate detection (same email + same course combination within 24 hours) ---
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await db.collection('registrations').findOne({
      email: cleanEmail,
      courses: { $size: cleanCourses.length, $all: cleanCourses },
      createdAt: { $gte: twentyFourHoursAgo },
    });

    if (existing) {
      // Rollback token status if duplicate detected
      if (token) {
        await db.collection('registrationLinks').updateOne(
          { token },
          { $set: { status: 'pending', usedAt: null } }
        );
      }
      return NextResponse.json(
        { error: "You've already registered for these courses within the last 24 hours — we'll be in touch!" },
        { status: 409 }
      );
    }

    // --- 3. Upload screenshot to Cloudinary ---
    let screenshotUrl = '';
    try {
      screenshotUrl = await uploadImage(screenshot, 'screenshots');
    } catch (uploadError) {
      // Rollback token status if upload fails
      if (token) {
        await db.collection('registrationLinks').updateOne(
          { token },
          { $set: { status: 'pending', usedAt: null } }
        );
      }
      return NextResponse.json({ error: uploadError.message || 'Failed to upload screenshot.' }, { status: 400 });
    }

    // --- 4. Security Recalculation Server-Side ---
    const dbCourses = await db.collection('courses')
      .find({ title: { $in: cleanCourses } })
      .toArray();

    if (dbCourses.length === 0) {
      // Rollback token status if courses not found
      if (token) {
        await db.collection('registrationLinks').updateOne(
          { token },
          { $set: { status: 'pending', usedAt: null } }
        );
      }
      return NextResponse.json({ error: 'Selected courses could not be found in the database.' }, { status: 400 });
    }

    // Check if all requested courses were found
    if (dbCourses.length !== cleanCourses.length) {
      const foundTitles = dbCourses.map(c => c.title);
      const missingCourses = cleanCourses.filter(title => !foundTitles.includes(title));
      // Rollback token status if courses not found
      if (token) {
        await db.collection('registrationLinks').updateOne(
          { token },
          { $set: { status: 'pending', usedAt: null } }
        );
      }
      return NextResponse.json(
        { error: `The following courses were not found: ${missingCourses.join(', ')}. Please check the course titles and try again.` },
        { status: 400 }
      );
    }

    // Fetch combo deals and discount tiers from MongoDB
    const [dbComboDeals, dbTiers] = await Promise.all([
      db.collection('comboDeals').find({}).toArray(),
      db.collection('discountTiers').find({}).toArray()
    ]);

    const now = new Date();
    const filteredComboDeals = dbComboDeals.filter(deal => {
      if (deal.expiryDate === null || deal.expiryDate === undefined) {
        return true;
      }
      return new Date(deal.expiryDate) >= now;
    });

    const filteredTiers = dbTiers.filter(tier => {
      if (tier.expiryDate === null || tier.expiryDate === undefined) {
        return true;
      }
      return new Date(tier.expiryDate) >= now;
    });

    // Use shared pricing engine for calculation
    // Note: calculatePricing normalizes IDs to strings internally, so no pre-conversion needed
    const pricing = calculatePricing(dbCourses, filteredComboDeals, filteredTiers);
    const {
      subtotal: actualSubtotal,
      discountPercent,
      discountAmount,
      totalPrice,
      discountSource,
      discountReason,
    } = pricing;

    // --- 5. Save full record to MongoDB ---
    const registrationRecord = {
      name: name.trim(),
      cnic,
      email: cleanEmail,
      phone: phone.trim(),
      university: university.trim(),
      city: city.trim(),
      reason: reason.trim(),
      highestQualification: highestQual.trim(),
      currentlyPursuing: currentlyPursuing.trim(),
      courses: cleanCourses,
      discountPercent,
      totalPrice,
      screenshotUrl,
      createdAt: new Date(),
    };

    await db.collection('registrations').insertOne(registrationRecord);

    // --- 6. Append row to Google Sheets ---
    //
    // Sheet Header Layout:
    // Name | CNIC | Email | Phone | Highest Qualification | Currently Pursuing | University | City | Reason | Courses | Discount Applied | Total Price | Date | Screenshot Link
    //
    let sheetsSyncSuccess = false;
    if (
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
    ) {
      try {
        // Normalize the private key: strip any wrapping quotes, then always
        // replace literal "\n" sequences (from .env parsing) with real newlines.
        let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
          .replace(/^["']|["']$/g, '')   // strip leading/trailing " or '
          .replace(/\\n/g, '\n');         // literal \n → real newline

        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: privateKey,
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        const dateString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' });

        const appendResponse = await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: 'Sheet1!A:N',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[
              name.trim(),
              cnic,
              cleanEmail,
              phone.trim(),
              highestQual.trim(),
              currentlyPursuing.trim(),
              university.trim(),
              city.trim(),
              reason.trim(),
              cleanCourses.join(', '),
              `${discountPercent}%`,
              totalPrice,
              dateString,
              screenshotUrl,
            ]],
          },
        });

        sheetsSyncSuccess = true;
      } catch (sheetsError) {
        console.error('CRITICAL: Google Sheets sync failed. Registration stored in MongoDB.');
        console.error('Sheets error details:', sheetsError.message);
      }
    } else {
      console.warn('Google Sheets env vars missing. Skipping Sheets sync.');
    }

    // --- 7. Send emails via Resend ---
    const safeName              = escapeHtml(name.trim());
    const safeCnic              = escapeHtml(cnic);
    const safeEmail             = escapeHtml(cleanEmail);
    const safePhone             = escapeHtml(phone.trim());
    const safeUniversity        = escapeHtml(university.trim());
    const safeCity              = escapeHtml(city.trim());
    const safeReason            = escapeHtml(reason.trim());
    const safeHighestQual       = escapeHtml(highestQual.trim());
    const safeCurrentlyPursuing = escapeHtml(currentlyPursuing.trim());
    const safeCourses           = cleanCourses.map(c => escapeHtml(c)).join(', ');
    const safeScreenshotUrl     = escapeHtml(screenshotUrl);

    if (resend) {
      // A. Student confirmation email
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: cleanEmail,
          subject: `Registration Received: ${cleanCourses.join(', ')}`,
          text: `Hello ${name.trim()},\n\nWe have received your registration and payment proof for the following courses: ${cleanCourses.join(', ')}. Our team will verify the payment and contact you shortly to confirm your seat.\n\nThank you for choosing Simuflux Lab.\n\nBest Regards,\nSimuflux Lab Team`,
          html: `
            <h3>Registration Received</h3>
            <p>Hello <strong>${safeName}</strong>,</p>
            <p>We've received your registration and payment proof for: <strong>${safeCourses}</strong>.</p>
            <p>Our training coordination team will verify the payment receipt and contact you shortly with class schedule details.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Simuflux Lab</strong> — Karachi, Pakistan</p>
          `,
        });
      } catch (err) {
        console.error('Failed to send student confirmation email:', err);
      }

      // B. Admin notification email (full details)
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: process.env.ADMIN_EMAIL,
          subject: `[New Registration] Multi-Course — ${name.trim()}`,
          text: `
New Student Registration

Name:                  ${name.trim()}
CNIC:                  ${cnic}
Email:                 ${cleanEmail}
Phone:                 ${phone.trim()}
University:            ${university.trim()}
City:                  ${city.trim()}
Highest Qualification: ${highestQual.trim()}
Currently Pursuing:    ${currentlyPursuing.trim()}
Courses:               ${cleanCourses.join(', ')}
Subtotal:              PKR ${actualSubtotal.toLocaleString()}
Discount Applied:      ${discountPercent}% (-PKR ${discountAmount.toLocaleString()})
Total Price:           PKR ${totalPrice.toLocaleString()}
Reason:                ${reason.trim()}
Screenshot:            ${screenshotUrl}
Date:                  ${new Date().toLocaleString()}
Google Sheets Synced:  ${sheetsSyncSuccess ? 'Yes' : 'NO — check server logs'}
          `,
          html: `
            <h3>New Course Registration</h3>
            <table cellpadding="6" style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:13px;">
              <tr><td><strong>Name</strong></td><td>${safeName}</td></tr>
              <tr style="background:#f5f5f5;"><td><strong>CNIC</strong></td><td>${safeCnic}</td></tr>
              <tr><td><strong>Email</strong></td><td>${safeEmail}</td></tr>
              <tr style="background:#f5f5f5;"><td><strong>Phone</strong></td><td>${safePhone}</td></tr>
              <tr><td><strong>University</strong></td><td>${safeUniversity}</td></tr>
              <tr style="background:#f5f5f5;"><td><strong>City</strong></td><td>${safeCity}</td></tr>
              <tr><td><strong>Highest Qualification</strong></td><td>${safeHighestQual}</td></tr>
              <tr style="background:#f5f5f5;"><td><strong>Currently Pursuing</strong></td><td>${safeCurrentlyPursuing}</td></tr>
              <tr><td><strong>Courses</strong></td><td>${safeCourses}</td></tr>
              <tr style="background:#f5f5f5;"><td><strong>Subtotal</strong></td><td>PKR ${actualSubtotal.toLocaleString()}</td></tr>
              <tr style="color:#e8622c;"><td><strong>Discount Applied</strong></td><td>${discountPercent}% (-PKR ${discountAmount.toLocaleString()})</td></tr>
              <tr style="background:#f5f5f5;font-weight:bold;"><td><strong>Total Price</strong></td><td>PKR ${totalPrice.toLocaleString()}</td></tr>
              <tr><td><strong>Reason for Enrollment</strong></td><td>${safeReason}</td></tr>
              <tr style="background:#f5f5f5;"><td><strong>Payment Receipt</strong></td><td><a href="${safeScreenshotUrl}" target="_blank">View Screenshot</a></td></tr>
              <tr><td><strong>Sheets Synced</strong></td><td>${sheetsSyncSuccess ? '<span style="color:green">Yes</span>' : '<span style="color:red;font-weight:bold">NO — check logs</span>'}</td></tr>
            </table>
          `,
        });
      } catch (err) {
        console.error('Failed to send admin registration notification:', err);
      }
    } else {
      console.warn('Resend API key not configured. Skipping email notifications.');
    }

    return NextResponse.json({
      success: true,
      message: `Registration received for ${cleanCourses.join(', ')} — our team will review and be in touch shortly.`,
    });

  } catch (error) {
    console.error('Course registration endpoint error:', error);
    // Rollback token status if unexpected error occurs
    if (token) {
      try {
        const { db } = await connectToDatabase();
        await db.collection('registrationLinks').updateOne(
          { token },
          { $set: { status: 'pending', usedAt: null } }
        );
      } catch (rollbackError) {
        console.error('Failed to rollback token status:', rollbackError);
      }
    }
    return NextResponse.json({ error: 'An unexpected server error occurred. Please try again later.' }, { status: 500 });
  }
}
