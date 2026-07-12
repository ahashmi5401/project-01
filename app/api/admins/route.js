import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// GET: List admins
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const admins = await db.collection('users')
      .find({ role: 'admin' }, { projection: { password: 0 } })
      .toArray();

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('List admins API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve administrators.' }, { status: 500 });
  }
}

// POST: Invite a new admin
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const body = await req.json();
    const { email } = body;

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();
    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingAdmin = await db.collection('users').findOne({ email: targetEmail });
    if (existingAdmin) {
      if (existingAdmin.role === 'user') {
        return NextResponse.json({ error: 'A regular user with this email already exists.' }, { status: 409 });
      }
      if (existingAdmin.isVerified) {
        return NextResponse.json({ error: 'An admin with this email already exists.' }, { status: 409 });
      }
      // If invited but not verified, we can re-invite them by updating their token and sending a new email
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    if (existingAdmin) {
      // Update pending admin invitation
      await db.collection('users').updateOne(
        { email: targetEmail },
        { 
          $set: { 
            verificationToken, 
            tokenExpiry, 
            updatedAt: new Date() 
          } 
        }
      );
    } else {
      // Create new pending admin document
      await db.collection('users').insertOne({
        email: targetEmail,
        role: 'admin',
        isVerified: false,
        verificationToken,
        tokenExpiry,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Send invitation email via Resend
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteLink = `${appUrl}/admin/register-invited?token=${verificationToken}&email=${encodeURIComponent(targetEmail)}`;

    // TODO: switch RESEND_FROM_EMAIL to the client's verified domain email once domain is set up
    // e.g. RESEND_FROM_EMAIL="SimuFlux System <system@simuflux.com>"
    // Until the domain is verified in Resend, use onboarding@resend.dev (test mode — only delivers to your own Resend account email)
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'SimuFlux Admin <onboarding@resend.dev>';

    if (resend) {
      try {
        const sendResult = await resend.emails.send({
          from: fromAddress,
          to: targetEmail,
          subject: 'Invitation to join SimuFlux Admin Dashboard',
          text: `You have been invited as an administrator for SimuFlux Design Lab. Set up your account by opening this link: ${inviteLink}`,
          html: `
            <h3>SimuFlux Administrator Invitation</h3>
            <p>You have been invited to manage services and courses on the SimuFlux Admin Dashboard.</p>
            <p>To set up your account and password, click the button below:</p>
            <p style="margin: 24px 0;">
              <a href="${inviteLink}" style="background-color: #E8622C; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; font-family: sans-serif; display: inline-block;">
                Activate Account
              </a>
            </p>
            <p style="color: #666; font-size: 11px;">This link will expire in 24 hours.</p>
          `,
        });
        console.log('[Invite] Resend API response:', JSON.stringify(sendResult));
      } catch (err) {
        console.error('[Invite] Failed to send invite email. Resend error:', err?.message || err);
        return NextResponse.json({ 
          error: 'Admin record created, but invitation email failed to send. Check Resend API config and RESEND_FROM_EMAIL env var.' 
        }, { status: 500 });
      }
    } else {
      console.warn('Resend API key is not configured. Invitation Link:', inviteLink);
      // In local dev, return the invite link for convenience
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ 
          success: true, 
          warning: 'Development Mode: Resend not set up.', 
          inviteLink 
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invite admin API error:', error);
    return NextResponse.json({ error: 'Failed to process administrator invitation.' }, { status: 500 });
  }
}
