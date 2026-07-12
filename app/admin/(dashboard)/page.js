'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    servicesCount: 0,
    coursesCount: 0,
    adminsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);

        // Fetch each independently — one failure must not kill the whole dashboard
        const [servicesCount, coursesCount, adminsCount] = await Promise.all([
          fetch('/api/services')
            .then((r) => r.ok ? r.json() : { services: [] })
            .then((d) => d.services?.length ?? 0)
            .catch(() => 0),

          fetch('/api/courses')
            .then((r) => r.ok ? r.json() : { courses: [] })
            .then((d) => d.courses?.length ?? 0)
            .catch(() => 0),

          fetch('/api/admins')
            .then((r) => r.ok ? r.json() : { admins: [] })
            .then((d) => d.admins?.length ?? 0)
            .catch(() => 0),
        ]);

        setStats({ servicesCount, coursesCount, adminsCount });
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-mono text-xs text-steelblue animate-pulse">
        <span>INITIALIZING DASHBOARD SYSTEM...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-accent bg-accent/5 p-6 font-mono text-xs text-offwhite">
        ERROR: {error}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Welcome Banner */}
      <div className="relative border-b border-hairline pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
            [ DASHBOARD MODULE OVERVIEW ]
          </span>
          <h1 className="font-sans font-bold text-3xl sm:text-4xl text-offwhite uppercase tracking-tight">
            Control Panel
          </h1>
          <p className="font-sans text-sm sm:text-base text-steelblue leading-relaxed mt-2 max-w-2xl">
            Welcome to the SimuFlux control panel. Use the modules below to modify live services, schedule/manage training courses, or invite administrative accounts.
          </p>
        </div>
      </div>

      {/* Grid Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Services Module */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
          <div className="relative border border-hairline bg-navy/40 backdrop-blur-sm p-8 flex flex-col justify-between h-full shadow-2xl shadow-black/20 hover:shadow-accent/10 transition-all duration-300">
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-steelblue">Module 01</span>
                <div className="relative">
                  <div className="absolute -inset-1 bg-accent/20 blur-md rounded-full opacity-50" />
                  <span className="relative font-mono text-3xl font-bold text-accent">{stats.servicesCount}</span>
                </div>
              </div>
              <h3 className="font-sans font-bold text-xl text-offwhite mb-3 group-hover:text-accent transition-colors duration-300">
                Consultancy Services
              </h3>
              <p className="font-sans text-xs sm:text-sm text-steelblue leading-relaxed mb-8">
                Manage engineering disciplines, short summaries, specifications details, and technical thumbnail imagery rendered on the public website.
              </p>
            </div>

            <Link
              href="/admin/services"
              className="w-full text-center bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent hover:to-accent/90 border border-accent/30 hover:border-accent font-mono uppercase tracking-wider text-xs py-3.5 transition-all duration-300 block text-accent hover:text-offwhite shadow-lg hover:shadow-accent/25"
            >
              Manage Services
            </Link>
          </div>
        </div>

        {/* Courses Module */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
          <div className="relative border border-hairline bg-navy/40 backdrop-blur-sm p-8 flex flex-col justify-between h-full shadow-2xl shadow-black/20 hover:shadow-accent/10 transition-all duration-300">
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-steelblue">Module 02</span>
                <div className="relative">
                  <div className="absolute -inset-1 bg-accent/20 blur-md rounded-full opacity-50" />
                  <span className="relative font-mono text-3xl font-bold text-accent">{stats.coursesCount}</span>
                </div>
              </div>
              <h3 className="font-sans font-bold text-xl text-offwhite mb-3 group-hover:text-accent transition-colors duration-300">
                Training Courses
              </h3>
              <p className="font-sans text-xs sm:text-sm text-steelblue leading-relaxed mb-8">
                Manage curriculum listings, descriptions, and thumbnails for software courses. Active courses populate the public registration dropdown.
              </p>
            </div>

            <Link
              href="/admin/courses"
              className="w-full text-center bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent hover:to-accent/90 border border-accent/30 hover:border-accent font-mono uppercase tracking-wider text-xs py-3.5 transition-all duration-300 block text-accent hover:text-offwhite shadow-lg hover:shadow-accent/25"
            >
              Manage Courses
            </Link>
          </div>
        </div>

        {/* Admins Module */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
          <div className="relative border border-hairline bg-navy/40 backdrop-blur-sm p-8 flex flex-col justify-between h-full shadow-2xl shadow-black/20 hover:shadow-accent/10 transition-all duration-300">
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-steelblue">Module 03</span>
                <div className="relative">
                  <div className="absolute -inset-1 bg-accent/20 blur-md rounded-full opacity-50" />
                  <span className="relative font-mono text-3xl font-bold text-accent">{stats.adminsCount}</span>
                </div>
              </div>
              <h3 className="font-sans font-bold text-xl text-offwhite mb-3 group-hover:text-accent transition-colors duration-300">
                Administrator Accounts
              </h3>
              <p className="font-sans text-xs sm:text-sm text-steelblue leading-relaxed mb-8">
                Review current users with control console access, track account statuses, or invite new team members via verification mailer.
              </p>
            </div>

            <Link
              href="/admin/admins"
              className="w-full text-center bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent hover:to-accent/90 border border-accent/30 hover:border-accent font-mono uppercase tracking-wider text-xs py-3.5 transition-all duration-300 block text-accent hover:text-offwhite shadow-lg hover:shadow-accent/25"
            >
              Manage Admins
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
