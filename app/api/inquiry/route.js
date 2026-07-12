import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escapeHtml';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    const { name, phone, targetName, targetType } = await req.json();

    // 1. Validation
    if (!name?.trim() || !phone?.trim() || !targetName?.trim() || !targetType?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 2. Save Inquiry to MongoDB
    const inquiryRecord = {
      name: name.trim(),
      phone: phone.trim(),
      targetName: targetName.trim(),
      targetType: targetType.trim(),
      createdAt: new Date(),
    };

    await db.collection('inquiries').insertOne(inquiryRecord);

    // 3. Send Email via Resend
    if (resend) {
      const safeName = escapeHtml(name.trim());
      const safePhone = escapeHtml(phone.trim());
      const safeTargetName = escapeHtml(targetName.trim());
      const safeTargetType = escapeHtml(targetType.trim());

      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.ADMIN_EMAIL,
          subject: `[New Inquiry] ${safeTargetType.toUpperCase()} - ${safeTargetName}`,
          text: `
You have received a new inquiry from SimuFlux.

Client Name: ${name.trim()}
Phone Number: ${phone.trim()}
Inquired For: ${targetName.trim()} (${targetType.trim()})
Date: ${new Date().toLocaleString()}
          `,
          html: `
            <h3>New Service/Course Inquiry</h3>
            <p><strong>Client Name:</strong> ${safeName}</p>
            <p><strong>Phone Number:</strong> ${safePhone}</p>
            <p><strong>Inquired For:</strong> ${safeTargetName} (${safeTargetType})</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send Resend email for inquiry:', emailError);
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
