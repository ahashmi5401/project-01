'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatPrice } from '@/lib/price';

export default function EnrollmentSuccessModal({ isOpen, onClose, enrollmentDetails }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Flat Background Overlay (No glassmorphism/blur) */}
      <div 
        className="absolute inset-0 bg-black/75"
        onClick={onClose}
      />

      {/* Modal Box (Solid flat background, responsive scroll) */}
      <div 
        className="w-full max-w-lg border border-hairline bg-navy p-6 relative z-10 shadow-2xl rounded-lg overflow-y-auto max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-steelblue hover:text-offwhite border border-hairline hover:border-accent rounded transition-colors font-mono text-body leading-none"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Success Content */}
        <div className="text-center space-y-6 pt-4">
          {/* Flat Clean Checkmark Icon */}
          <div className="w-16 h-16 border-2 border-accent bg-accent/10 flex items-center justify-center mx-auto rounded-full">
            <svg className="w-8 h-8 text-accent fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <span className="font-mono text-caption uppercase tracking-widest text-accent block">
              [ ENROLLMENT CONFIRMED ]
            </span>
            <h3 className="font-sans font-bold text-h2 text-offwhite uppercase tracking-tight">
              Package Configured
            </h3>
          </div>

          {/* Details */}
          <div className="border border-hairline bg-navy p-4 space-y-4 text-left rounded">
            {enrollmentDetails?.selectedCourses && (
              <div>
                <span className="font-mono text-caption uppercase tracking-wider text-steelblue block mb-2">
                  Selected Courses
                </span>
                <ul className="space-y-1">
                  {enrollmentDetails.selectedCourses.map((course, idx) => (
                    <li key={idx} className="font-sans text-body text-offwhite flex justify-between">
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {enrollmentDetails && (
              <div className="pt-3 border-t border-hairline">
                <div className="flex justify-between items-center text-body">
                  <span className="text-steelblue">Subtotal</span>
                  <span className="font-mono text-offwhite">
                    {enrollmentDetails.subtotalDisplay || formatPrice(enrollmentDetails.subtotal)}
                  </span>
                </div>
                {enrollmentDetails.discountPercent > 0 && (
                  <div className="flex justify-between items-center text-accent">
                    <span>Bundle Savings ({enrollmentDetails.discountPercent}%)</span>
                    <span className="font-mono">- PKR {enrollmentDetails.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-hairline font-bold text-h3 text-offwhite">
                  <span>Total</span>
                  <span className="font-mono text-accent">
                    {enrollmentDetails.totalPriceDisplay || formatPrice(enrollmentDetails.totalPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <p className="font-sans text-body text-steelblue leading-relaxed">
            Your enrollment request has been logged. Opening WhatsApp to complete the enrollment process and confirm your custom package pricing.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 font-mono text-label uppercase tracking-wider text-accent border border-accent/30 hover:border-accent px-4 py-3 rounded transition-colors"
            >
              Configure Another
            </button>
            <button
              onClick={onClose}
              className="flex-1 font-mono text-label uppercase tracking-wider text-offwhite bg-accent hover:bg-accent/90 px-4 py-3 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
