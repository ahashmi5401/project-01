import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escapeHtml';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    // Validate required environment variables
    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error('RESEND_FROM_EMAIL environment variable is not configured');
    }
    if (!process.env.ADMIN_EMAIL) {
      throw new Error('ADMIN_EMAIL environment variable is not configured');
    }

    const { name, phone, email, targetName, targetType } = await req.json();

    // Rate limiting: 15 requests per hour per IP
    const ip = getClientIp(req);
    const rateLimitResult = await checkRateLimit('inquiry', ip);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    // 1. Validation
    if (!name?.trim() || !phone?.trim() || !email?.trim() || !targetName?.trim() || !targetType?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cleanEmail = email.toLowerCase().trim();

    // 2. Save Inquiry to MongoDB
    const inquiryRecord = {
      name: name.trim(),
      phone: phone.trim(),
      email: cleanEmail,
      targetName: targetName.trim(),
      targetType: targetType.trim(),
      createdAt: new Date(),
    };

    await db.collection('inquiries').insertOne(inquiryRecord);

    // 3. Send Emails via Resend
    if (resend) {
      const safeName = escapeHtml(name.trim());
      const safePhone = escapeHtml(phone.trim());
      const safeEmail = escapeHtml(cleanEmail);
      const safeTargetName = escapeHtml(targetName.trim());
      const safeTargetType = escapeHtml(targetType.trim());

      // A. Client confirmation email
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: cleanEmail,
          subject: `Inquiry Received: ${safeTargetName}`,
          text: `Hello ${name.trim()},

Thank you for your inquiry about "${targetName.trim()}" (${targetType.trim()}).

We have received your request and our team will review it. You can expect a response within 24-48 hours.

In the meantime, feel free to reach out to us directly on WhatsApp for immediate assistance.

Best Regards,
Simuflux Design Lab Team`,
          html: `
            <h3>Inquiry Received</h3>
            <p>Hello <strong>${safeName}</strong>,</p>
            <p>Thank you for your inquiry about <strong>"${safeTargetName}"</strong> (${safeTargetType}).</p>
            <p>We have received your request and our team will review it. You can expect a response within <strong>24-48 hours</strong>.</p>
            <p>In the meantime, feel free to reach out to us directly on WhatsApp for immediate assistance.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Simuflux Design Lab</strong> — Karachi, Pakistan</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send client confirmation email:', emailError);
      }

      // B. Admin notification email
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: process.env.ADMIN_EMAIL,
          subject: `[New Inquiry] ${safeTargetType.toUpperCase()} - ${safeTargetName}`,
          text: `
You have received a new inquiry from SimuFlux.

Client Name: ${name.trim()}
Email: ${cleanEmail}
Phone Number: ${phone.trim()}
Inquired For: ${targetName.trim()} (${targetType.trim()})
Date: ${new Date().toLocaleString()}
          `,
          html: `
            <h3>New Service/Course Inquiry</h3>
            <p><strong>Client Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Phone Number:</strong> ${safePhone}</p>
            <p><strong>Inquired For:</strong> ${safeTargetName} (${safeTargetType})</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
      }
    } else {
      console.warn('Resend API key is missing. Skipping email notification.');
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry saved successfully.'
    });

  } catch (error) {
    console.error('Inquiry API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
  }
}
