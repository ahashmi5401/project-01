export async function verifyTurnstileToken(token, ip) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  // Local development escape hatch: if secret is not set, allow submission but warn.
  if (!secretKey && process.env.NODE_ENV === 'development') {
    console.warn('TURNSTILE_SECRET_KEY is not defined. Skipping verification in development only.');
    return true;
  }
  if (!secretKey) {
    return false;
  }

  if (!token) {
    console.error('Turnstile token was not provided.');
    return false;
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await res.json();
    return !!data.success;
  } catch (error) {
    console.error('Error contacting Cloudflare Turnstile API:', error);
    return false;
  }
}
