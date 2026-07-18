'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginForm({ adminExists }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || 'Invalid credentials.');
      } else {
        router.push('/admin');
        router.refresh();
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
            Admin Console Login
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
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
            {loading ? 'Authenticating...' : 'Access Console'}
          </button>
        </form>

        {!adminExists && (
          <div className="mt-lg p-xl border border-dashed border-accent/40 bg-gradient-to-r from-accent/10 to-accent/5 text-center text-label font-mono rounded-lg shadow-elevation-sm">
            <span className="text-steelblue block mb-1">First time setting up?</span>
            <Link href="/admin/signup" className="text-accent hover:underline font-bold">
              Create the first admin account →
            </Link>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-hairline/60 flex justify-between items-center text-xs font-mono">
          <Link href="/" className="text-steelblue/60 hover:text-accent transition-colors">
            Back to Site
          </Link>
        </div>
      </div>
    </section>
  );
}
