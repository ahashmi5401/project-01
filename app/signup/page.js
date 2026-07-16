'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to register account.');
        setLoading(false);
      } else {
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden bg-navy">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />
      
      <div className="w-full max-w-md border border-hairline bg-navy/60 p-xl relative z-10 shadow-elevation-sm rounded">
        <div className="absolute top-0 right-0 w-12 h-12 border-r border-t border-white/5 pointer-events-none rounded-tr" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l border-b border-white/5 pointer-events-none rounded-bl" />

        <div className="text-center mb-xl border-b border-hairline/60 pb-xl">
          <span className="font-mono text-label uppercase tracking-widest text-accent block mb-sm">
            [ SIMUFLUX LAB ]
          </span>
          <h1 className="font-sans font-bold text-h2 text-offwhite uppercase tracking-tight">
            Register Account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-xl">
          <div>
            <label htmlFor="name" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-navy/80 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-navy/80 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-navy/80 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded"
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-navy/80 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-lg border border-accent bg-accent/5 text-offwhite font-mono text-label shadow-elevation-sm rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-mono uppercase tracking-wider text-label py-sm border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none rounded shadow-elevation-sm hover:shadow-elevation-md"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-xl pt-xl border-t border-hairline/60 text-center text-label font-mono">
          <span className="text-steelblue/60">Already have an account? </span>
          <Link href="/login" className="text-accent hover:underline transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
