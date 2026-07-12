import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escapeHtml';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, selectedCourses } = body;

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

    const actualSubtotal = dbCourses.reduce((sum, c) => sum + (c.price || 0), 0);
    const courseCount = dbCourses.length;

    // 3. Security: Fetch discount tiers from MongoDB to recalculate actual savings
    const dbTiers = await db.collection('discountTiers')
      .find({})
      .toArray();

    let discountPercent = 0;
    // Find the highest applicable discount tier
    for (const tier of dbTiers) {
      if (courseCount >= tier.minCourses && tier.discountPercent > discountPercent) {
        discountPercent = tier.discountPercent;
      }
    }

    const discountAmount = (actualSubtotal * discountPercent) / 100;
    const actualTotalPrice = actualSubtotal - discountAmount;

    // 4. Send Business Email via Resend
    let emailSent = false;
    if (resend && process.env.ADMIN_EMAIL) {
      const safeName = escapeHtml(name.trim());
      const safePhone = escapeHtml(phone.trim());
      const safeCoursesText = dbCourses.map(c => `- ${escapeHtml(c.title)} (PKR ${c.price.toLocaleString()})`).join('\n');
      const safeCoursesHtml = dbCourses.map(c => `<li>${escapeHtml(c.title)} (PKR ${c.price.toLocaleString()})</li>`).join('');

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
${dbCourses.map(c => `- ${c.title} (PKR ${c.price.toLocaleString()})`).join('\n')}

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
              <tr style="font-weight:bold;font-size:14px;"><td><strong>Total Package Price</strong></td><td>PKR ${actualTotalPrice.toLocaleString()}</td></tr>
            </table>
          `
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Failed to send Resend email for enrollment:', emailError);
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
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
  }
}
