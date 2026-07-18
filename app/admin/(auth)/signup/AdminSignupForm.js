'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

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
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Administrator account created successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to create account.');
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
            [ Simuflux LAB ]
          </span>
          <h1 className="font-sans font-bold text-2xl text-offwhite uppercase tracking-tight">
            Bootstrap Admin Signup
          </h1>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 border border-white/10 bg-white/5 text-green-400 font-sans text-sm leading-relaxed">
              {success}
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
              Set up the initial administrator account. This form is only available for first-time configuration when no other admin exists.
            </p>

            <div>
              <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent transition-colors"
                placeholder="admin@Simuflux.com"
                required
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
              {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-hairline/60 flex justify-between items-center text-xs font-mono">
          <Link href="/admin/login" className="text-steelblue/60 hover:text-accent transition-colors">
            Back to Login
          </Link>
          <span className="text-steelblue/20">|</span>
          <Link href="/" className="text-steelblue/60 hover:text-accent transition-colors">
            Back to Site
          </Link>
        </div>
      </div>
    </section>
  );
}
