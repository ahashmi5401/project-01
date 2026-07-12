'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SectionEyebrow from '@/components/shared/SectionEyebrow';

function EnrollFormContent({ courses, discountTiers }) {
  const searchParams = useSearchParams();
  const initialCourseSlug = searchParams.get('course') || '';

  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
  });

  // Pre-check course from query param
  useEffect(() => {
    if (initialCourseSlug && courses.length > 0) {
      const match = courses.find(c => c.slug === initialCourseSlug);
      if (match) {
        setSelectedCourseIds(prev =>
          prev.includes(match._id) ? prev : [...prev, match._id]
        );
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCourseSlug, courses]);

  // Handle checking/unchecking
  const handleToggleCourse = (id) => {
    setSelectedCourseIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  // Pricing calculations
  const selectedCourses = courses.filter(c => selectedCourseIds.includes(c._id));
  const subtotal = selectedCourses.reduce((sum, c) => sum + (c.price || 0), 0);
  const selectedCount = selectedCourses.length;

  // Find active discount tier
  let activeTier = null;
  // Sort tiers ascending by minCourses
  const sortedTiers = [...discountTiers].sort((a, b) => a.minCourses - b.minCourses);
  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    if (selectedCount >= sortedTiers[i].minCourses) {
      activeTier = sortedTiers[i];
      break;
    }
  }

  const discountPercent = activeTier ? activeTier.discountPercent : 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const totalPrice = subtotal - discountAmount;

  // Find next tier for upsell messaging
  const nextTier = sortedTiers.find(t => t.minCourses > selectedCount);
  const coursesNeededForNext = nextTier ? nextTier.minCourses - selectedCount : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCount === 0) {
      setStatus({ submitting: false, submitted: false, error: 'Please select at least one course.' });
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setStatus({ submitting: false, submitted: false, error: 'Name and Phone Number are required.' });
      return;
    }

    setStatus({ submitting: true, submitted: false, error: null });

    const selectedCourseTitles = selectedCourses.map(c => c.title);

    try {
      // 1. Send admin notification email (recalculated on server)
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          selectedCourses: selectedCourseTitles,
          // Client calculations passed for convenience, server will verify
          clientDiscountPercent: discountPercent,
          clientTotalPrice: totalPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enrollment request.');
      }

      setStatus({ submitting: false, submitted: true, error: null });

      // 2. Open prefilled WhatsApp chat window
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || '923463517689';
      
      let coursesText = selectedCourses.map(c => `- ${c.title} (PKR ${c.price.toLocaleString()})`).join('\n');
      
      const whatsappText = `Hello SimuFlux, my name is ${name.trim()}.\n\nI would like to enroll in the following course(s):\n${coursesText}\n\nSubtotal: PKR ${subtotal.toLocaleString()}\nDiscount: ${discountPercent}% (-PKR ${discountAmount.toLocaleString()})\nTotal Price: PKR ${totalPrice.toLocaleString()}\n\nPlease contact me back at ${phone.trim()}.`;
      
      const encodedText = encodeURIComponent(whatsappText);
      const waUrl = `https://wa.me/${adminPhone}?text=${encodedText}`;
      
      window.open(waUrl, '_blank');

    } catch (err) {
      setStatus({ submitting: false, submitted: false, error: err.message });
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Block */}
      <div className="border-b border-hairline pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <SectionEyebrow text="Package Configurator" />
          <h1 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-offwhite uppercase tracking-tight">
            Enroll Now
          </h1>
          <p className="font-sans text-sm text-steelblue mt-2 leading-relaxed max-w-xl">
            Choose your training courses. Your bundle discount updates dynamically based on the volume discount tiers set by the admin.
          </p>
        </div>
        <div className="font-mono text-xs text-steelblue/50 select-none">
          DESK ID: ENROLL-MAIN
        </div>
      </div>

      {status.submitted ? (
        <div className="border border-hairline bg-navy/40 p-12 text-center max-w-2xl mx-auto space-y-6 relative">
          {/* Blueprint corners */}
          <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-accent/20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-accent/20 pointer-events-none" />
          
          <div className="w-16 h-16 border border-accent flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-accent fill-none stroke-current" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="font-sans font-bold text-2xl uppercase tracking-tight text-offwhite">
            Enrollment Request Received
          </h3>
          <p className="font-sans text-sm text-steelblue leading-relaxed max-w-md mx-auto">
            We have logged your course selection. Opening WhatsApp to complete the enrollment process and confirm your custom package pricing.
          </p>
          
          <div className="pt-4">
            <button
              onClick={() => {
                setStatus({ submitting: false, submitted: false, error: null });
                setSelectedCourseIds([]);
                setName('');
                setPhone('');
              }}
              className="font-mono text-xs uppercase tracking-wider text-accent border border-accent/20 px-8 py-3.5 hover:bg-accent/5 transition-colors"
            >
              Configure Another Package
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Course Select Checkboxes */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-mono text-xs uppercase tracking-wider text-accent select-none border-b border-hairline/60 pb-3">
              [ SELECT YOUR TRAINING COURSES ]
            </h3>
            
            {courses.length === 0 ? (
              <div className="border border-dashed border-white/10 p-12 text-center text-steelblue font-mono text-xs">
                NO TRAINING COURSES AVAILABLE CURRENTLY.
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => {
                  const isChecked = selectedCourseIds.includes(course._id);
                  return (
                    <div
                      key={course._id}
                      onClick={() => handleToggleCourse(course._id)}
                      className={`border px-6 py-5 flex items-center justify-between cursor-pointer transition-all duration-300 select-none ${
                        isChecked 
                          ? 'border-accent bg-accent/5' 
                          : 'border-hairline bg-navy/40 hover:border-white/30 hover:bg-white/[0.01]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                          isChecked ? 'border-accent bg-accent' : 'border-hairline bg-transparent'
                        }`}>
                          {isChecked && (
                            <svg className="w-3.5 h-3.5 text-offwhite fill-none stroke-current" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="font-sans font-bold text-sm sm:text-base text-offwhite block">
                            {course.title}
                          </span>
                          <span className="font-mono text-3xs text-steelblue/60 uppercase">
                            COURSE ID: {course.id}
                          </span>
                        </div>
                      </div>
                      
                      <div className="font-mono text-xs sm:text-sm text-offwhite font-semibold">
                        PKR {course.price?.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Pricing Summary & Details */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-mono text-xs uppercase tracking-wider text-accent select-none border-b border-hairline/60 pb-3">
              [ FITTING SHEET SUMMARY ]
            </h3>

            {/* Calculations Box */}
            <div className="border border-hairline bg-navy/40 p-6 space-y-6 font-sans">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-steelblue">Subtotal</span>
                  <span className="font-mono text-offwhite">PKR {subtotal.toLocaleString()}</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="flex justify-between items-center text-accent">
                    <span>Bundle Savings ({discountPercent}%)</span>
                    <span className="font-mono">- PKR {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t border-hairline pt-3 flex justify-between items-center text-base font-bold text-offwhite">
                  <span>Total Package Price</span>
                  <span className="font-mono text-accent">PKR {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Dynamic Upsell / Helper Message */}
              {selectedCount > 0 && nextTier && (
                <div className="border border-accent/20 bg-accent/5 p-4 text-xs leading-relaxed text-steelblue font-mono uppercase">
                  <strong className="text-accent block mb-1">PROMO INCIDENT:</strong>
                  Add <strong className="text-offwhite">{coursesNeededForNext}</strong> more course{coursesNeededForNext > 1 ? 's' : ''} to unlock the <strong className="text-offwhite">{nextTier.discountPercent}%</strong> savings bracket!
                </div>
              )}

              {selectedCount > 0 && !nextTier && (
                <div className="border border-green-500/20 bg-green-500/5 p-4 text-xs leading-relaxed text-steelblue font-mono uppercase">
                  <strong className="text-green-400 block mb-1">PEAK OPTIMIZATION:</strong>
                  Maximum package volume discount applied.
                </div>
              )}
            </div>

            {/* Details Form */}
            <div className="border border-hairline bg-navy/40 p-6 space-y-4">
              <h4 className="font-mono text-2xs uppercase tracking-widest text-steelblue block mb-2">
                [ STUDENT SIGNATURE DETAILS ]
              </h4>

              <div>
                <label htmlFor="student-name" className="block font-mono text-[10px] uppercase tracking-wider text-steelblue mb-2">
                  Full Name *
                </label>
                <input
                  id="student-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-navy/60 border border-hairline px-4 py-2.5 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent text-sm"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="student-phone" className="block font-mono text-[10px] uppercase tracking-wider text-steelblue mb-2">
                  WhatsApp / Phone *
                </label>
                <input
                  id="student-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-navy/60 border border-hairline px-4 py-2.5 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent text-sm"
                  placeholder="e.g. +92 300 1234567"
                  required
                />
              </div>

              {status.error && (
                <div className="p-3 border border-accent bg-accent/5 text-offwhite font-mono text-xs">
                  {status.error}
                </div>
              )}

              <button
                type="submit"
                disabled={status.submitting || selectedCount === 0}
                className="w-full bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-xs py-3.5 border border-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none"
              >
                {status.submitting ? 'Transmitting Request...' : 'Send Enrollment Request'}
              </button>
            </div>

          </div>
        </form>
      )}
    </div>
  );
}

export default function EnrollForm({ courses, discountTiers }) {
  return (
    <Suspense fallback={<div className="py-20 text-center font-mono text-xs text-steelblue animate-pulse">LOADING CONFIGURATOR FRAME...</div>}>
      <EnrollFormContent courses={courses} discountTiers={discountTiers} />
    </Suspense>
  );
}
