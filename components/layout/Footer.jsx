import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy border-t border-hairline pt-16 pb-8 text-sm text-steelblue font-sans relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-1.5 mb-4 select-none">
            {/* TODO: replace with client's real logo file once provided */}
            <span className="font-sans font-bold text-xl uppercase tracking-wider text-offwhite">
              SimuFlux
            </span>
            <span className="w-2 h-2 rounded-full bg-accent" />
          </Link>
          <p className="max-w-sm mb-6 leading-relaxed">
            Empowering students, professionals, and industries with practical CFD, FEA, CAD, and product design solutions.
          </p>
          <div className="flex gap-4">
            {/* Facebook Link */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-steelblue hover:text-accent transition-colors"
              aria-label="Follow SimuFlux Design Lab on Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" role="img" aria-label="Facebook logo">
                <title>Facebook</title>
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-wider text-offwhite mb-4">Core Disciplines</h4>
          <ul className="space-y-2.5">
            <li>Computational Fluid Dynamics</li>
            <li>Finite Element Analysis</li>
            <li>CAD & 3D Modelling</li>
            <li>Product Design</li>
            <li>Engineering Consultancy</li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-wider text-offwhite mb-4">Navigation</h4>
          <ul className="space-y-2.5">
            <li>
              <Link href="/" className="hover:text-offwhite transition-colors">Home</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-offwhite transition-colors">About</Link>
            </li>
            <li>
              <Link href="/consultancy" className="hover:text-offwhite transition-colors">Consultancy</Link>
            </li>
            <li>
              <Link href="/courses" className="hover:text-offwhite transition-colors">Courses</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-offwhite transition-colors">Contact</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-hairline/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
        <p>© {currentYear} SimuFlux Design Lab. All rights reserved.</p>
        <p className="text-steelblue/60">Designed & engineered for structural excellence.</p>
      </div>
    </footer>
  );
}
