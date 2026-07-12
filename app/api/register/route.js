import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { uploadImage } from '@/lib/upload';
import { escapeHtml } from '@/lib/escapeHtml';
import { Resend } from 'resend';
import { google } from 'googleapis';

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
  try {
    const formData = await req.formData();

    const name              = formData.get('name');
    const cnicRaw           = formData.get('cnic');
    const email             = formData.get('email');
    const phone             = formData.get('phone');
    const university        = formData.get('university');
    const city              = formData.get('city');
    const reason            = formData.get('reason');
    const highestQual       = formData.get('highestQualification');
    const currentlyPursuing = formData.get('currentlyPursuing');
    const course            = formData.get('course');
    const screenshot        = formData.get('screenshot');

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
      !course?.trim() ||
      !screenshot
    ) {
      return NextResponse.json(
        { error: 'All fields, including the payment screenshot, are required.' },
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
    const cleanEmail  = email.toLowerCase().trim();
    const cleanCourse = course.trim();

    // --- 2. Duplicate detection (same email + course within 24 hours) ---
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await db.collection('registrations').findOne({
      email: cleanEmail,
      course: cleanCourse,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You've already registered for this course within the last 24 hours — we'll be in touch!" },
        { status: 409 }
      );
    }

    // --- 3. Upload screenshot to Vercel Blob ---
    // uploadImage validates file type/size and uploads to BLOB_READ_WRITE_TOKEN if set,
    // falling back to local /public/uploads (dev only) if not configured.
    let screenshotUrl = '';
    try {
      screenshotUrl = await uploadImage(screenshot, 'screenshots');
    } catch (uploadError) {
      return NextResponse.json({ error: uploadError.message || 'Failed to upload screenshot.' }, { status: 400 });
    }

    // --- 4. Save full record to MongoDB ---
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
      course: cleanCourse,
      screenshotUrl,
      createdAt: new Date(),
    };

    await db.collection('registrations').insertOne(registrationRecord);

    // --- 5. Append row to Google Sheets ---
    //
    // TODO: Update the Google Sheet's header row (Row 1) to:
    // Name | CNIC | Email | Phone | Highest Qualification | Currently Pursuing | University | City | Reason | Course | Date | Screenshot Link
    //
    let sheetsSyncSuccess = false;
    if (
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
    ) {
      try {
        const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');

        const auth = new google.auth.JWT({
          email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const dateString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' });

        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: 'Sheet1!A:L',
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
              cleanCourse,
              dateString,
              screenshotUrl,
            ]],
          },
        });

        sheetsSyncSuccess = true;
      } catch (sheetsError) {
        // Non-fatal — registration is already saved to MongoDB
        console.error('CRITICAL: Google Sheets sync failed. Registration stored in MongoDB. Error:', sheetsError);
      }
    } else {
      console.warn('Google Sheets env vars missing. Skipping Sheets sync.');
    }

    // --- 6. Send emails via Resend ---
    const safeName              = escapeHtml(name.trim());
    const safeCnic              = escapeHtml(cnic);
    const safeEmail             = escapeHtml(cleanEmail);
    const safePhone             = escapeHtml(phone.trim());
    const safeUniversity        = escapeHtml(university.trim());
    const safeCity              = escapeHtml(city.trim());
    const safeReason            = escapeHtml(reason.trim());
    const safeHighestQual       = escapeHtml(highestQual.trim());
    const safeCurrentlyPursuing = escapeHtml(currentlyPursuing.trim());
    const safeCourse            = escapeHtml(cleanCourse);
    const safeScreenshotUrl     = escapeHtml(screenshotUrl);

    if (resend) {
      // A. Student confirmation email
      try {
        await resend.emails.send({
          from: 'SimuFlux Academy <academy@simuflux.com>',
          to: cleanEmail,
          subject: `Registration Received: ${cleanCourse}`,
          text: `Hello ${name.trim()},\n\nWe have received your registration and payment proof for the "${cleanCourse}" course. Our team will verify the payment and contact you shortly to confirm your seat.\n\nThank you for choosing SimuFlux Design Lab.\n\nBest Regards,\nSimuFlux Team`,
          html: `
            <h3>Registration Received</h3>
            <p>Hello <strong>${safeName}</strong>,</p>
            <p>We've received your registration and payment proof for <strong>${safeCourse}</strong>.</p>
            <p>Our training coordination team will verify the payment receipt and contact you shortly with class schedule details.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>SimuFlux Design Lab</strong> — Karachi, Pakistan</p>
          `,
        });
      } catch (err) {
        console.error('Failed to send student confirmation email:', err);
      }

      // B. Admin notification email (full details)
      try {
        await resend.emails.send({
          from: 'SimuFlux Registrations <system@simuflux.com>',
          to: 'info@simuflux.com', // TODO: replace with client's verified inbox
          subject: `[New Registration] ${cleanCourse} — ${name.trim()}`,
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
Course:                ${cleanCourse}
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
              <tr><td><strong>Course</strong></td><td>${safeCourse}</td></tr>
              <tr style="background:#f5f5f5;"><td><strong>Reason for Enrollment</strong></td><td>${safeReason}</td></tr>
              <tr><td><strong>Payment Receipt</strong></td><td><a href="${safeScreenshotUrl}" target="_blank">View Screenshot</a></td></tr>
              <tr style="background:#f5f5f5;"><td><strong>Sheets Synced</strong></td><td>${sheetsSyncSuccess ? '<span style="color:green">Yes</span>' : '<span style="color:red;font-weight:bold">NO — check logs</span>'}</td></tr>
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
      message: `Registration received for ${cleanCourse} — our team will review and be in touch shortly.`,
    });

  } catch (error) {
    console.error('Course registration endpoint error:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred. Please try again later.' }, { status: 500 });
  }
}
