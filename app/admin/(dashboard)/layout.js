'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession, SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function AdminLayoutContent({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Services', href: '/admin/services' },
    { name: 'Courses', href: '/admin/courses' },
    { name: 'Discounts', href: '/admin/discounts' },
    { name: 'Admins', href: '/admin/admins' },
    { name: 'Profile', href: '/admin/profile' },
  ];

  return (
    <div className="min-h-screen bg-navy text-offwhite flex flex-col">
      {/* Admin Nav Header */}
      <header className="border-b border-white/10 bg-navy/95 backdrop-blur-sm sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-md sm:gap-lg">
            <Link href="/admin" className="font-sans font-bold text-h2 sm:text-h1 text-offwhite uppercase tracking-wider hover:text-accent transition-colors">
              Simuflux Admin
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-sm sm:gap-md font-mono text-label uppercase tracking-wider text-sm sm:text-label">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative py-sm px-md transition-all duration-300 hover:text-accent rounded-lg ${
                      isActive ? 'text-accent bg-accent/10' : 'text-steelblue hover:text-offwhite'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.span
                        layoutId="activeAdminNav"
                        className="absolute left-0 right-0 bottom-0 h-0.5 bg-accent"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-sm sm:gap-md font-mono text-label text-sm sm:text-label">
            <span className="text-steelblue/60 hidden xl:inline">
              User: <strong className="text-offwhite">{session?.user?.email}</strong>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="border border-white/20 px-md sm:px-lg py-sm hover:bg-white/10 text-offwhite transition-all duration-300 uppercase tracking-wider rounded-lg text-xs sm:text-label"
            >
              Sign Out
            </button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-offwhite hover:text-accent focus:outline-none p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.828 4.828 4.829z" />
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-navy border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col px-xl pt-sm pb-xl gap-md font-mono text-label uppercase tracking-wider border-t border-white/10 mt-lg">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`py-sm px-md transition-all duration-300 hover:text-offwhite rounded-lg ${
                      isActive ? 'text-accent bg-accent/10' : 'text-steelblue hover:text-offwhite'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-white/10">
                <span className="text-steelblue/60 text-label">
                  User: <strong className="text-offwhite">{session?.user?.email}</strong>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-4xl relative z-10">
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
