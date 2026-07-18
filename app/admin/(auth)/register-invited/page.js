'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function RegisterInvitedForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid invite parameters. Please request a new administrator invitation.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/register-invited', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to complete registration.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success ? (
        <div className="space-y-6 text-center">
          <div className="p-4 border border-white/10 bg-white/5 text-green-400 font-sans text-sm leading-relaxed">
            Account activated successfully! Redirecting you to login...
          </div>
          <Link
            href="/admin/login"
            className="inline-block w-full bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-sm py-4 transition-colors text-center"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="font-sans text-xs text-steelblue leading-relaxed mb-4">
            Set a secure password below to finalize your administrator credentials for Simuflux Lab.
          </p>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Your Email Address
            </label>
            <input
              type="text"
              value={email || ''}
              disabled
              className="w-full bg-navy/20 border border-hairline/40 px-4 py-3 text-steelblue/50 font-sans focus:outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Choose Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent transition-colors"
              placeholder="Min 6 characters"
              required
              disabled={!token || !email}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent transition-colors"
              placeholder="Confirm password"
              required
              disabled={!token || !email}
            />
          </div>

          {error && (
            <div className="p-3 border border-accent bg-accent/5 text-offwhite font-mono text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token || !email}
            className="w-full bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-mono uppercase tracking-wider text-sm py-4 border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {loading ? 'Activating Account...' : 'Complete Activation'}
          </button>
        </form>
      )}
    </>
  );
}

export default function RegisterInvitedPage() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />

      <div className="w-full max-w-md border border-hairline bg-navy/60 p-8 relative z-10">
        <div className="absolute top-0 right-0 w-12 h-12 border-r border-t border-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l border-b border-white/5 pointer-events-none" />

        <div className="text-center mb-8 border-b border-hairline/60 pb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
            [ ADMINISTRATOR ONBOARDING ]
          </span>
          <h1 className="font-sans font-bold text-2xl text-offwhite uppercase tracking-tight">
            Activate Admin Account
          </h1>
        </div>

        <Suspense fallback={
          <div className="py-10 text-center font-mono text-xs text-steelblue animate-pulse">
            LOADING...
          </div>
        }>
          <RegisterInvitedForm />
        </Suspense>
      </div>
    </section>
  );
}
