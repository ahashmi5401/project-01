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
      <div className="flex flex-col items-center justify-center py-4xl font-mono text-label text-steelblue animate-pulse">
        <span>INITIALIZING DASHBOARD SYSTEM...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-accent bg-accent/5 p-xl font-mono text-label text-offwhite shadow-elevation-sm rounded">
        ERROR: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4xl">
      {/* Welcome Banner */}
      <div className="relative border-b border-hairline pb-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <span className="font-mono text-label uppercase tracking-widest text-accent block mb-sm">
            [ DASHBOARD MODULE OVERVIEW ]
          </span>
          <h1 className="font-sans font-bold text-h2 sm:text-h1 text-offwhite uppercase tracking-tight">
            Control Panel
          </h1>
          <p className="font-sans text-body sm:text-h3 text-steelblue leading-relaxed mt-md max-w-2xl">
            Welcome to the Simuflux control panel. Use the modules below to modify live services, schedule/manage training courses, or invite administrative accounts.
          </p>
        </div>
      </div>

      {/* Grid Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3xl">
        {/* Services Module */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
          <div className="relative border border-hairline bg-navy/40 backdrop-blur-sm p-xl flex flex-col justify-between h-full shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300 rounded-lg">
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none rounded-tr-lg" />
            
            <div>
              <div className="flex justify-between items-center mb-lg">
                <span className="font-mono text-label uppercase tracking-wider text-steelblue">Module 01</span>
                <div className="relative">
                  <div className="absolute -inset-1 bg-accent/20 blur-md rounded-full opacity-50" />
                  <span className="relative font-mono text-h1 font-bold text-accent">{stats.servicesCount}</span>
                </div>
              </div>
              <h3 className="font-sans font-bold text-h3 text-offwhite mb-sm group-hover:text-accent transition-colors duration-300">
                Consultancy Services
              </h3>
              <p className="font-sans text-caption text-steelblue leading-relaxed mb-lg">
                Manage engineering disciplines, short summaries, specifications details, and technical thumbnail imagery rendered on the public website.
              </p>
            </div>

            <Link
              href="/admin/services"
              className="w-full text-center bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent hover:to-accent/90 border border-accent/30 hover:border-accent font-mono uppercase tracking-wider text-label py-sm transition-all duration-300 block text-accent hover:text-offwhite shadow-elevation-sm hover:shadow-elevation-md rounded"
            >
              Manage Services
            </Link>
          </div>
        </div>

        {/* Courses Module */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
          <div className="relative border border-hairline bg-navy/40 backdrop-blur-sm p-xl flex flex-col justify-between h-full shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300 rounded-lg">
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none rounded-tr-lg" />
            
            <div>
              <div className="flex justify-between items-center mb-lg">
                <span className="font-mono text-label uppercase tracking-wider text-steelblue">Module 02</span>
                <div className="relative">
                  <div className="absolute -inset-1 bg-accent/20 blur-md rounded-full opacity-50" />
                  <span className="relative font-mono text-h1 font-bold text-accent">{stats.coursesCount}</span>
                </div>
              </div>
              <h3 className="font-sans font-bold text-h3 text-offwhite mb-sm group-hover:text-accent transition-colors duration-300">
                Training Courses
              </h3>
              <p className="font-sans text-caption text-steelblue leading-relaxed mb-lg">
                Manage curriculum listings, descriptions, and thumbnails for software courses. Active courses populate the public registration dropdown.
              </p>
            </div>

            <Link
              href="/admin/courses"
              className="w-full text-center bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent hover:to-accent/90 border border-accent/30 hover:border-accent font-mono uppercase tracking-wider text-label py-sm transition-all duration-300 block text-accent hover:text-offwhite shadow-elevation-sm hover:shadow-elevation-md rounded"
            >
              Manage Courses
            </Link>
          </div>
        </div>

        {/* Admins Module */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
          <div className="relative border border-hairline bg-navy/40 backdrop-blur-sm p-xl flex flex-col justify-between h-full shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300 rounded-lg">
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none rounded-tr-lg" />
            
            <div>
              <div className="flex justify-between items-center mb-lg">
                <span className="font-mono text-label uppercase tracking-wider text-steelblue">Module 03</span>
                <div className="relative">
                  <div className="absolute -inset-1 bg-accent/20 blur-md rounded-full opacity-50" />
                  <span className="relative font-mono text-h1 font-bold text-accent">{stats.adminsCount}</span>
                </div>
              </div>
              <h3 className="font-sans font-bold text-h3 text-offwhite mb-sm group-hover:text-accent transition-colors duration-300">
                Administrator Accounts
              </h3>
              <p className="font-sans text-caption text-steelblue leading-relaxed mb-lg">
                Review current users with control console access, track account statuses, or invite new team members via verification mailer.
              </p>
            </div>

            <Link
              href="/admin/admins"
              className="w-full text-center bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent hover:to-accent/90 border border-accent/30 hover:border-accent font-mono uppercase tracking-wider text-label py-sm transition-all duration-300 block text-accent hover:text-offwhite shadow-elevation-sm hover:shadow-elevation-md rounded"
            >
              Manage Admins
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
