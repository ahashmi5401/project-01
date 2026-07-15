import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escapeHtml';
import { calculatePricing, getDiscountSourceLabel } from '@/lib/pricingEngine';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, selectedCourses } = body;

    // Rate limiting: 15 requests per hour per IP
    const ip = getClientIp(req);
    const rateLimitResult = await checkRateLimit('enroll', ip);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    // 1. Validation
    if (!name?.trim() || !phone?.trim() || !Array.isArray(selectedCourses) || selectedCourses.length === 0) {
      return NextResponse.json({ error: 'Name, phone, and selected courses list are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 2. Security: Fetch course data from MongoDB to recalculate actual subtotal
    const dbCourses = await db.collection('courses')
      .find({ title: { $in: selectedCourses } })
      .toArray();

    if (dbCourses.length === 0) {
      return NextResponse.json({ error: 'None of the selected courses could be found in the database.' }, { status: 400 });
    }

    // 3. Security: Fetch combo deals and discount tiers from MongoDB
    const [dbComboDeals, dbTiers] = await Promise.all([
      db.collection('comboDeals').find({}).toArray(),
      db.collection('discountTiers').find({}).toArray()
    ]);

    // Use shared pricing engine for calculation
    // Note: calculatePricing normalizes IDs to strings internally, so no pre-conversion needed
    const pricing = calculatePricing(dbCourses, dbComboDeals, dbTiers);
    const {
      subtotal: actualSubtotal,
      discountPercent,
      discountAmount,
      totalPrice: actualTotalPrice,
      discountSource,
      discountReason,
    } = pricing;

    // 4. Send Business Email via Resend
    let emailSent = false;
    if (resend && process.env.ADMIN_EMAIL) {
      const safeName = escapeHtml(name.trim());
      const safePhone = escapeHtml(phone.trim());
      const safeCoursesText = dbCourses.map(c => `- ${escapeHtml(c.title)} (PKR ${c.price?.toLocaleString() || 'N/A'})`).join('\n');
      const safeCoursesHtml = dbCourses.map(c => `<li>${escapeHtml(c.title)} (PKR ${c.price?.toLocaleString() || 'N/A'})</li>`).join('');

      // Admin notification email
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.ADMIN_EMAIL,
          subject: `[New Enrollment Inquiry] Multi-Course Bundle — ${name.trim()}`,
          text: `
New Enrollment Inquiry from SimuFlux

Client Name:      ${name.trim()}
Phone Number:     ${phone.trim()}
Timestamp:        ${new Date().toLocaleString()}

Selected Courses:
${dbCourses.map(c => `- ${c.title} (PKR ${c.price?.toLocaleString() || 'N/A'})`).join('\n')}

Subtotal:         PKR ${actualSubtotal.toLocaleString()}
Discount Applied: ${discountPercent}% (-PKR ${discountAmount.toLocaleString()})
Total Price:      PKR ${actualTotalPrice.toLocaleString()}
          `,
          html: `
            <h3>New Multi-Course Enrollment Inquiry</h3>
            <p><strong>Client Name:</strong> ${safeName}</p>
            <p><strong>Phone/WhatsApp:</strong> ${safePhone}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            
            <h4>Selected Courses:</h4>
            <ul>
              ${safeCoursesHtml}
            </ul>

            <table cellpadding="6" style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:13px;border-top:1px solid #ddd;">
              <tr><td><strong>Subtotal</strong></td><td>PKR ${actualSubtotal.toLocaleString()}</td></tr>
              <tr style="background:#f5f5f5;color:#e8622c;"><td><strong>Discount Applied</strong></td><td>${discountPercent}% (-PKR ${discountAmount.toLocaleString()})</td></tr>
              <tr style="font-weight:bold;font-size:14px;"><td><strong>Total Package Price</strong></td><td>PKR ${actualTotalPrice?.toLocaleString() || 'N/A'}</td></tr>
            </table>
          `
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
      }
    } else {
      console.warn('Resend key or ADMIN_EMAIL is missing. Skipping email notification.');
    }

    return NextResponse.json({
      success: true,
      emailSent,
      recalculatedPercent: discountPercent,
      recalculatedTotal: actualTotalPrice,
      message: 'Enrollment inquiry processed successfully.'
    });

  } catch (error) {
    console.error('Enrollment API error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred. Please try again later.' }, { status: 500 });
  }
}
