'use client';

import React from 'react';
import Link from 'next/link';
import { signOut, useSession, SessionProvider } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

function AdminLayoutContent({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-navy text-offwhite flex flex-col">
      {/* Admin Nav Header */}
      <header className="border-b border-hairline bg-navy/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-sans font-bold text-lg text-offwhite uppercase tracking-wider hover:text-accent transition-colors">
              SimuFlux Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-6 font-mono text-xs uppercase tracking-wider">
              <Link
                href="/admin/services"
                className={`transition-colors hover:text-accent ${
                  pathname.startsWith('/admin/services') ? 'text-accent border-b border-accent pb-0.5' : 'text-steelblue'
                }`}
              >
                Services
              </Link>
              <Link
                href="/admin/courses"
                className={`transition-colors hover:text-accent ${
                  pathname.startsWith('/admin/courses') ? 'text-accent border-b border-accent pb-0.5' : 'text-steelblue'
                }`}
              >
                Courses
              </Link>
              <Link
                href="/admin/discounts"
                className={`transition-colors hover:text-accent ${
                  pathname.startsWith('/admin/discounts') ? 'text-accent border-b border-accent pb-0.5' : 'text-steelblue'
                }`}
              >
                Discounts
              </Link>
              <Link
                href="/admin/admins"
                className={`transition-colors hover:text-accent ${
                  pathname.startsWith('/admin/admins') ? 'text-accent border-b border-accent pb-0.5' : 'text-steelblue'
                }`}
              >
                Admins
              </Link>
              <Link
                href="/admin/profile"
                className={`transition-colors hover:text-accent ${
                  pathname.startsWith('/admin/profile') ? 'text-accent border-b border-accent pb-0.5' : 'text-steelblue'
                }`}
              >
                Profile
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-steelblue/60 hidden md:inline">
              User: <strong className="text-offwhite">{session?.user?.email}</strong>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="border border-accent/20 px-4 py-2 hover:bg-accent/10 text-accent transition-colors uppercase tracking-wider"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Mobile Sub-nav (only visible on small screens) */}
      <div className="sm:hidden border-b border-hairline/60 bg-navy/40 px-6 py-3 flex gap-4 font-mono text-2xs uppercase tracking-wider flex-wrap">
        <Link href="/admin/services" className={`hover:text-accent ${pathname.startsWith('/admin/services') ? 'text-accent' : 'text-steelblue'}`}>
          Services
        </Link>
        <Link href="/admin/courses" className={`hover:text-accent ${pathname.startsWith('/admin/courses') ? 'text-accent' : 'text-steelblue'}`}>
          Courses
        </Link>
        <Link href="/admin/discounts" className={`hover:text-accent ${pathname.startsWith('/admin/discounts') ? 'text-accent' : 'text-steelblue'}`}>
          Discounts
        </Link>
        <Link href="/admin/admins" className={`hover:text-accent ${pathname.startsWith('/admin/admins') ? 'text-accent' : 'text-steelblue'}`}>
          Admins
        </Link>
        <Link href="/admin/profile" className={`hover:text-accent ${pathname.startsWith('/admin/profile') ? 'text-accent' : 'text-steelblue'}`}>
          Profile
        </Link>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-10 relative z-10">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  );
}
