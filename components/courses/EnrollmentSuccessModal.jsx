'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

export default function EnrollmentSuccessModal({ isOpen, onClose, enrollmentDetails }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-navy/95 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg border border-hairline bg-navy/95 p-xl relative z-10 shadow-2xl rounded-lg"
      >
        {/* Decorative corners */}
        <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-accent/30 pointer-events-none rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-accent/30 pointer-events-none rounded-bl-lg" />
        <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-white/5 pointer-events-none rounded-tl" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-white/5 pointer-events-none rounded-br" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-steelblue hover:text-accent font-sans text-xl transition-all duration-300 hover:rotate-90 opacity-70 hover:opacity-100 p-1"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Success Content */}
        <div className="text-center space-y-xl">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 border-2 border-accent bg-accent/10 flex items-center justify-center mx-auto shadow-elevation-md rounded-full"
          >
            <svg className="w-10 h-10 text-accent fill-none stroke-current" viewBox="0 0 24 24">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          {/* Header */}
          <div className="space-y-sm">
            <span className="font-mono text-caption uppercase tracking-widest text-accent block">
              [ ENROLLMENT CONFIRMED ]
            </span>
            <h3 className="font-sans font-bold text-h2 text-offwhite uppercase tracking-tight">
              Package Configured
            </h3>
          </div>

          {/* Details */}
          <div className="border border-hairline/40 bg-navy/40 p-lg space-y-md text-left">
            {enrollmentDetails?.selectedCourses && (
              <div>
                <span className="font-mono text-caption uppercase tracking-wider text-steelblue block mb-sm">
                  Selected Courses
                </span>
                <ul className="space-y-xs">
                  {enrollmentDetails.selectedCourses.map((course, idx) => (
                    <li key={idx} className="font-sans text-body text-offwhite flex justify-between">
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {enrollmentDetails?.subtotal && (
              <div className="pt-md border-t border-hairline/40">
                <div className="flex justify-between items-center text-body">
                  <span className="text-steelblue">Subtotal</span>
                  <span className="font-mono text-offwhite">PKR {enrollmentDetails.subtotal.toLocaleString()}</span>
                </div>
                {enrollmentDetails.discountPercent > 0 && (
                  <div className="flex justify-between items-center text-accent">
                    <span>Bundle Savings ({enrollmentDetails.discountPercent}%)</span>
                    <span className="font-mono">- PKR {enrollmentDetails.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-sm font-bold text-h3 text-offwhite">
                  <span>Total</span>
                  <span className="font-mono text-accent">PKR {enrollmentDetails.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <p className="font-sans text-body text-steelblue leading-relaxed">
            Your enrollment request has been logged. Opening WhatsApp to complete the enrollment process and confirm your custom package pricing.
          </p>

          {/* Actions */}
          <div className="flex gap-sm pt-lg">
            <button
              onClick={onClose}
              className="flex-1 font-mono text-label uppercase tracking-wider text-accent border border-accent/30 px-xl py-sm hover:bg-accent/10 transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
            >
              Configure Another
            </button>
            <button
              onClick={onClose}
              className="flex-1 font-mono text-label uppercase tracking-wider text-offwhite bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] px-xl py-sm border border-transparent transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
