import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// GET: Retrieve current logged-in admin's profile
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const admin = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }
    );

    if (!admin) {
      return NextResponse.json({ error: 'Administrator not found.' }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Get admin profile error:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile data.' }, { status: 500 });
  }
}

// PUT: Update admin email or password
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    }

    const body = await req.json();
    const { action, currentPassword, email, newPassword, confirmPassword } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const adminId = new ObjectId(session.user.id);

    // Retrieve active admin record (with password)
    const admin = await db.collection('users').findOne({ _id: adminId });
    if (!admin) {
      return NextResponse.json({ error: 'Administrator account not found.' }, { status: 404 });
    }

    // Verify current password is provided and correct
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to verify changes.' }, { status: 400 });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'SimuFlux Security <onboarding@resend.dev>';
    const originalEmail = admin.email;

    // --- Action: Update Email ---
    if (action === 'update-email') {
      if (!email || !email.trim() || !email.includes('@')) {
        return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
      }

      const cleanEmail = email.toLowerCase().trim();

      // Check if email is already taken by another user/admin
      const existingUser = await db.collection('users').findOne({
        email: cleanEmail,
        _id: { $ne: adminId }
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Email address is already in use.' }, { status: 409 });
      }

      // Update email in DB
      await db.collection('users').updateOne(
        { _id: adminId },
        {
          $set: {
            email: cleanEmail,
            updatedAt: new Date()
          }
        }
      );

      // Send security notification email to original (old) email address
      if (resend) {
        try {
          await resend.emails.send({
            from: fromAddress,
            to: originalEmail,
            subject: '[Security Alert] Your SimuFlux Admin email has been updated',
            text: `Hello,\n\nThis is a security alert to confirm that the email address associated with your SimuFlux Admin account has been changed from ${originalEmail} to ${cleanEmail}.\n\nIf you did not request this change, please contact support or your system administrator immediately.\n\nBest Regards,\nSimuFlux Security Team`,
            html: `
              <h3>Security Alert: Email Address Updated</h3>
              <p>Hello,</p>
              <p>This is a security alert to confirm that the email address associated with your SimuFlux Admin account has been changed:</p>
              <ul>
                <li><strong>Old Email:</strong> ${originalEmail}</li>
                <li><strong>New Email:</strong> ${cleanEmail}</li>
              </ul>
              <p>If you did not initiate this request, please contact support or your system administrator immediately to secure your account.</p>
              <br/>
              <p>Best Regards,</p>
              <p><strong>SimuFlux Security Team</strong></p>
            `,
          });
        } catch (mailErr) {
          console.error('Failed to send email change notification:', mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Email address updated successfully. Please note you may need to sign in again to refresh your session.'
      });
    }

    // --- Action: Update Password ---
    if (action === 'update-password') {
      if (!newPassword || !confirmPassword) {
        return NextResponse.json({ error: 'New password and confirmation are required.' }, { status: 400 });
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
      }

      // Hash and update password in DB
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.collection('users').updateOne(
        { _id: adminId },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date()
          }
        }
      );

      // Send security notification email to original email address
      if (resend) {
        try {
          await resend.emails.send({
            from: fromAddress,
            to: originalEmail,
            subject: '[Security Alert] Your SimuFlux Admin password has been updated',
            text: `Hello,\n\nThis is a security alert to confirm that the password for your SimuFlux Admin account (${originalEmail}) was changed on ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}.\n\nIf you did not request this change, please contact support or your system administrator immediately.\n\nBest Regards,\nSimuFlux Security Team`,
            html: `
              <h3>Security Alert: Password Updated</h3>
              <p>Hello,</p>
              <p>This is a security alert to confirm that the password for your SimuFlux Admin account (<strong>${originalEmail}</strong>) was updated on ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}.</p>
              <p>If you did not initiate this request, please contact support or your system administrator immediately to secure your account.</p>
              <br/>
              <p>Best Regards,</p>
              <p><strong>SimuFlux Security Team</strong></p>
            `,
          });
        } catch (mailErr) {
          console.error('Failed to send password change notification:', mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.'
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Update admin profile error:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
