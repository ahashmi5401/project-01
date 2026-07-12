import { NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { escapeHtml } from '@/lib/escapeHtml';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, message, turnstileToken } = body;

    // Validate inputs
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    // Input length limits to prevent abuse
    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Name is too long (max 100 characters).' }, { status: 400 });
    }
    if (email.trim().length > 254) {
      return NextResponse.json({ error: 'Email address is too long.' }, { status: 400 });
    }
    if (message.trim().length > 5000) {
      return NextResponse.json({ error: 'Message is too long (max 5000 characters).' }, { status: 400 });
    }

    // HTML-escape all user inputs before embedding in email
    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safePhone = phone ? escapeHtml(phone.trim()) : 'Not provided';
    const safeMessage = escapeHtml(message.trim());

    // Send email via Resend if available
    let emailSent = false;
    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'system@simuflux.com',
          to: process.env.ADMIN_EMAIL || 'info@simuflux.com', // Recipient business inbox
          subject: `New Contact Inquiry from ${safeName}`,
          text: `
Name: ${name.trim()}
Email: ${email.trim()}
Phone: ${phone?.trim() || 'Not provided'}
Message:
${message.trim()}
          `,
          html: `
            <h3>New Contact Inquiry</h3>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Phone:</strong> ${safePhone}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: #f4f8fb; padding: 12px; border: 1px solid #ddd; color: #333;">${safeMessage}</p>
          `,
        });
        emailSent = true;
      } catch (err) {
        console.error('Failed to send contact email via Resend:', err);
      }
    }

    // Forward to Formspree if configured
    let formspreeSent = false;
    const formspreeId = process.env.FORMSPREE_ID; // Optional Formspree Form ID
    if (formspreeId && formspreeId !== 'YOUR_FORM_ID') {
      try {
        const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone?.trim(), message: message.trim() }),
        });
        if (response.ok) {
          formspreeSent = true;
        }
      } catch (err) {
        console.error('Failed to forward contact to Formspree:', err);
      }
    }

    // Check if we successfully notified the client via at least one mechanism
    if (!emailSent && !formspreeSent) {
      console.warn('Neither Resend nor Formspree were configured or succeeded. Logging submission locally:', { name, email, phone, message });
      // In local dev, we don't block success just because email credentials are unset
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ success: true, warning: 'Development mode: Form submission logged in console.' });
      }
      return NextResponse.json({ error: 'Failed to process inquiry. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
