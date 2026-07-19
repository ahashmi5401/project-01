'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [consultancyOpen, setConsultancyOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const hoverTimeout = useRef(null);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Consultancy', href: '/consultancy' },
    { name: 'Courses', href: '/courses' },
    { name: 'Enroll', href: '/enroll' },
    { name: 'Contact', href: '/contact' },
    { name: 'Login', href: '/login' },
  ];

  // Fetch services from the public API on mount
  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.services) setServices(data.services);
      })
      .catch(() => {});
  }, []);

  // Open dropdown on hover with a slight delay to prevent accidental triggering
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    setConsultancyOpen(true);
  };

  // Close dropdown after a short delay so user can move mouse to the dropdown
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setConsultancyOpen(false);
    }, 150);
  };

  return (
    <nav className="bg-navy border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center select-none">
          <Image
            src="/logo.webp"
            alt="Simuflux Lab"
            width={64}
            height={64}
            className="h-10 sm:h-12 lg:h-16 w-auto transition-opacity group-hover:opacity-90"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-lg font-sans text-label uppercase tracking-wider font-semibold">
          <div className="flex items-center gap-sm bg-white/5 border border-hairline rounded-full px-sm py-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));

              if (link.name === 'Consultancy') {
                return (
                  <div
                    key={link.name}
                    className="relative"
                    ref={dropdownRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={link.href}
                      className={`relative flex items-center gap-1 py-2 px-sm transition-colors rounded-full ${
                        isActive ? 'text-offwhite' : 'text-steelblue hover:text-offwhite'
                      }`}
                    >
                      {link.name}
                      {/* Chevron icon */}
                      <svg
                        className={`w-3 h-3 fill-none stroke-current transition-transform duration-200 ${consultancyOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute inset-0 bg-accent/20 rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>

                    {/* Dropdown Panel */}
                    <AnimatePresence>
                      {consultancyOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="bg-navy/95 backdrop-blur-md border border-hairline rounded-xl shadow-elevation-xl min-w-[220px] overflow-hidden">

                            {/* Service links */}
                            <div className="py-sm max-h-72 overflow-y-auto">
                              {services.length === 0 ? (
                                <p className="px-lg py-sm font-mono text-label text-steelblue/50">Loading...</p>
                              ) : (
                                services.map((service) => (
                                  <Link
                                    key={service._id || service.id}
                                    href={`/consultancy?service=${service.slug}`}
                                    className="flex items-center gap-sm px-lg py-sm text-steelblue hover:text-offwhite hover:bg-accent/5 transition-colors font-sans text-body group"
                                  >
                                    <span className="font-mono text-label text-accent/70 min-w-[28px]">{service.id}</span>
                                    <span className="group-hover:text-offwhite transition-colors">{service.title}</span>
                                  </Link>
                                ))
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

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

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-navy border-t border-hairline">
          {navLinks.map((link) => {
            if (link.name === 'Consultancy') {
              return (
                <div key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-6 py-4 text-white font-semibold border-b border-white/5"
                  >
                    {link.name}
                  </Link>
                  {/* Nested services list under Consultancy */}
                  {services.length > 0 && (
                    <div className="bg-white/[0.02] border-b border-white/5">
                      {services.map((service) => (
                        <Link
                          key={service._id || service.id}
                          href={`/consultancy?service=${service.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-sm pl-10 pr-6 py-3 text-steelblue hover:text-offwhite hover:bg-accent/5 transition-colors border-b border-white/[0.03] last:border-0"
                        >
                          <span className="font-mono text-label text-accent/60 min-w-[28px]">{service.id}</span>
                          <span className="font-sans text-body">{service.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-6 py-4 text-white font-semibold border-b border-white/5 last:border-0"
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
