'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';

export default function UserDashboard() {
  const { data: session } = useSession();

  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6 bg-navy text-offwhite relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy pointer-events-none" />
      
      <div className="w-full max-w-2xl border border-hairline bg-navy/60 p-10 relative z-10 text-center">
        <div className="absolute top-0 right-0 w-12 h-12 border-r border-t border-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l border-b border-white/5 pointer-events-none" />

        <div className="mb-8 border-b border-hairline/60 pb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
            [ SIMUFLUX LAB ]
          </span>
          <h1 className="font-sans font-bold text-3xl uppercase tracking-tight">
            Welcome, {session?.user?.email}!
          </h1>
        </div>

        <p className="font-sans text-steelblue leading-relaxed mb-8">
          Thank you for joining the SimuFlux Lab portal. We are actively constructing your personalized client dashboard where you can manage your service requests, view project files, download invoices, and schedule 1-on-1 engineering consultancy sessions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto border border-steelblue/20 hover:border-steelblue/40 text-steelblue hover:text-offwhite font-mono uppercase tracking-wider text-xs px-6 py-4 transition-colors select-none"
          >
            Go to Home
          </button>
          
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full sm:w-auto bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-xs px-6 py-4 border border-transparent transition-colors select-none"
          >
            Sign Out
          </button>
        </div>
      </div>
    </section>
  );
}
