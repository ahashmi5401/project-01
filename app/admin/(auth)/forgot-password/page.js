'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('If an account exists with this email, a reset link has been dispatched.');
        setEmail('');
      } else {
        setError(data.error || 'Failed to request password reset.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />

      <div className="w-full max-w-md border border-hairline bg-navy/60 p-8 relative z-10">
        <div className="absolute top-0 right-0 w-12 h-12 border-r border-t border-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l border-b border-white/5 pointer-events-none" />

        <div className="text-center mb-8 border-b border-hairline/60 pb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
            [ SYSTEM PROTECTION ]
          </span>
          <h1 className="font-sans font-bold text-2xl text-offwhite uppercase tracking-tight">
            Reset Credentials Request
          </h1>
        </div>

        {message ? (
          <div className="space-y-6 text-center">
            <div className="p-4 border border-white/10 bg-white/5 text-steelblue font-sans text-sm leading-relaxed">
              {message}
            </div>
            <Link
              href="/admin/login"
              className="inline-block w-full bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-sm py-4 transition-colors text-center"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="font-sans text-xs text-steelblue leading-relaxed mb-4">
              Enter your registered administrator email address below. We will transmit an activation/reset token link to your mailbox.
            </p>

            <div>
              <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Registered Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent transition-colors"
                placeholder="admin@simuflux.com"
                required
              />
            </div>

            {error && (
              <div className="p-3 border border-accent bg-accent/5 text-offwhite font-mono text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-mono uppercase tracking-wider text-sm py-4 border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {loading ? 'Transmitting Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-hairline/60 flex justify-center text-xs font-mono">
          <Link href="/admin/login" className="text-steelblue/60 hover:text-accent transition-colors">
            Cancel & Return to Login
          </Link>
        </div>
      </div>
    </section>
  );
}
