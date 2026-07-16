'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Consultancy', href: '/consultancy' },
    { name: 'Courses', href: '/courses' },
    { name: 'Enroll', href: '/enroll' },
    { name: 'Contact', href: '/contact' },
    { name: 'Login', href: '/login' },
  ];

  return (
    <nav className="bg-navy border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center select-none">
          <img 
            src="/logo.webp"
            alt="SimuFlux Lab" 
            className="h-10 sm:h-12 lg:h-16 w-auto transition-opacity group-hover:opacity-90"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-lg font-sans text-label uppercase tracking-wider font-semibold">
          <div className="flex items-center gap-sm bg-white/5 border border-hairline rounded-full px-sm py-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-2 px-sm transition-colors rounded-full ${
                    isActive ? 'text-offwhite' : 'text-steelblue hover:text-offwhite'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-accent/20 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-offwhite hover:text-accent focus:outline-none p-2"
          aria-label="Toggle Navigation Menu"
          aria-expanded={isOpen}
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            {isOpen ? (
              <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.828 4.828 4.9z" />
            ) : (
              <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu - simple inline dropdown */}
      {isOpen && (
        <div className="md:hidden bg-navy border-t border-hairline">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-6 py-4 text-white font-semibold border-b border-white/5 last:border-0"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
