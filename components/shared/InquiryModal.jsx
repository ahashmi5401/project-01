'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function InquiryModal({ isOpen, onClose, targetName, targetType }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const validate = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Name is required.';
    if (!phone.trim()) tempErrors.phone = 'Phone number is required.';
    if (!email.trim()) tempErrors.email = 'Email is required.';
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Invalid email address.';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus({ submitting: true, submitted: false, error: null });

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, targetName, targetType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setStatus({ submitting: false, submitted: true, error: null });

      // Generate WhatsApp redirection URL
      // NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE should be a string of digits, e.g. 923463517689
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || '923463517689';
      const text = `Hello SimuFlux, my name is ${name.trim()}. I would like to inquire about the ${targetType} "${targetName}". Please contact me back at ${phone.trim()}.`;
      const encodedText = encodeURIComponent(text);
      const waUrl = `https://wa.me/${adminPhone}?text=${encodedText}`;

      // Open WhatsApp chat in a new tab
      window.open(waUrl, '_blank');

    } catch (err) {
      setStatus({ submitting: false, submitted: false, error: err.message });
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-navy/90 backdrop-blur-lg transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className="w-full max-w-md border border-hairline bg-navy/95 p-xl relative z-10 shadow-elevation-xl transition-all duration-300 rounded-lg">
        {/* Subtle decorative grid/crosshair corners for tech aesthetic */}
        <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-accent/20 pointer-events-none rounded-tr" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-accent/20 pointer-events-none rounded-bl" />
        <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-white/5 pointer-events-none rounded-tl" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-white/5 pointer-events-none rounded-br" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-xl right-xl text-steelblue hover:text-accent font-sans text-xl transition-all duration-300 hover:rotate-90 opacity-70 hover:opacity-100 p-sm"
          aria-label="Close modal"
        >
          ✕
        </button>

        {status.submitted ? (
          <div className="text-center py-4xl space-y-xl">
            <div className="w-12 h-12 border border-accent flex items-center justify-center mx-auto rounded shadow-elevation-sm">
              <svg className="w-6 h-6 text-accent fill-none stroke-current" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-sans font-bold text-h3 text-offwhite uppercase tracking-tight mb-sm">
                Inquiry Logged
              </h3>
              <p className="font-sans text-caption text-steelblue leading-relaxed">
                Opening WhatsApp — send the prefilled message to reach us directly.
              </p>
            </div>
            <button
              onClick={onClose}
              className="font-mono text-label uppercase tracking-wider text-accent border border-accent/20 px-lg py-sm hover:bg-accent/5 transition-colors rounded"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-lg">
            <div className="border-b border-hairline/60 pb-md mb-md">
              <span className="font-mono text-label uppercase tracking-widest text-accent block mb-sm">
                [ SERVICE / COURSE INQUIRY ]
              </span>
              <h3 className="font-sans font-bold text-h3 text-offwhite uppercase tracking-tight">
                Inquire Now
              </h3>
            </div>

            <div>
              <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                Inquiring For
              </label>
              <input
                type="text"
                value={`${targetType.toUpperCase()}: ${targetName}`}
                disabled
                className="w-full bg-navy/40 border border-hairline px-4 py-3 text-steelblue font-sans text-caption outline-none cursor-not-allowed select-none rounded-md"
              />
            </div>

            <div>
              <label htmlFor="name" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                Your Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-navy/60 border ${errors.name ? 'border-accent' : 'border-hairline'} px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded-md text-body`}
                placeholder="e.g. John Doe"
                required
              />
              {errors.name && <span className="font-mono text-caption text-accent mt-sm block">{errors.name}</span>}
            </div>

            <div>
              <label htmlFor="phone" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full bg-navy/60 border ${errors.phone ? 'border-accent' : 'border-hairline'} px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded-md text-body`}
                placeholder="e.g. +92 300 1234567"
                required
              />
              {errors.phone && <span className="font-mono text-caption text-accent mt-sm block">{errors.phone}</span>}
            </div>

            <div>
              <label htmlFor="email" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-navy/60 border ${errors.email ? 'border-accent' : 'border-hairline'} px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded-md text-body`}
                placeholder="e.g. john@example.com"
                required
              />
              {errors.email && <span className="font-mono text-caption text-accent mt-sm block">{errors.email}</span>}
            </div>


            {status.error && (
              <div className="p-lg border border-accent bg-accent/5 text-offwhite font-mono text-label shadow-elevation-sm rounded">
                {status.error}
              </div>
            )}

            <button
              type="submit"
              disabled={status.submitting}
              className="w-full bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-label px-6 py-3 border border-transparent transition-colors disabled:opacity-50 select-none shadow-elevation-sm hover:shadow-elevation-md rounded-md"
            >
              {status.submitting ? 'Processing...' : 'Submit & Open WhatsApp'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
