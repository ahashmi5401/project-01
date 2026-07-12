'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Registration successful! You can now log in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || 'Invalid credentials.');
        setLoading(false);
      } else {
        // Fetch the session dynamically to determine user role
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        const role = session?.user?.role || 'user';

        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden bg-navy">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />
      
      <div className="w-full max-w-md border border-hairline bg-navy/60 p-8 relative z-10">
        <div className="absolute top-0 right-0 w-12 h-12 border-r border-t border-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l border-b border-white/5 pointer-events-none" />

        <div className="text-center mb-8 border-b border-hairline/60 pb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
            [ SIMUFLUX DESIGN LAB ]
          </span>
          <h1 className="font-sans font-bold text-2xl text-offwhite uppercase tracking-tight">
            Account Sign In
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
              placeholder="you@example.com"
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

          {success && (
            <div className="p-3 border border-green-500/30 bg-green-500/5 text-green-400 font-mono text-xs">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-mono uppercase tracking-wider text-sm py-4 border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-hairline/60 flex justify-between items-center text-xs font-mono">
          <Link href="/signup" className="text-steelblue/60 hover:text-accent transition-colors">
            Register Account
          </Link>
          <span className="text-steelblue/20">|</span>
          <Link href="/admin/forgot-password" className="text-steelblue/60 hover:text-accent transition-colors">
            Forgot Password?
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy text-offwhite flex items-center justify-center font-mono text-xs uppercase tracking-widest animate-pulse">
        Initializing Secure Access...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
