import { NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, turnstileToken } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter both email and password.' },
        { status: 400 }
      );
    }

    // Rate limiting: 5 requests per 15 minutes per IP
    const ip = getClientIp(req);
    const emailLower = email?.toLowerCase().trim() || 'unknown';
    const identifier = `${ip}:${emailLower}`;
    const rateLimitResult = await checkRateLimit('login', identifier);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    // Verify Turnstile token
    const turnstileValid = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed.' },
        { status: 400 }
      );
    }

    // Forward to NextAuth credentials endpoint
    const authUrl = new URL('/api/auth/callback/credentials', req.url);
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        email,
        password,
        csrfToken: body.csrfToken,
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || authData.error) {
      return NextResponse.json(
        { error: authData.error || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, url: authData.url });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
