'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import DiscountGauge from './DiscountGauge';
import EnrollmentSuccessModal from './EnrollmentSuccessModal';
import Toast from '@/components/shared/Toast';
import { calculatePricing, getCourseBadge, getDiscountSourceLabel } from '@/lib/pricingEngine';
import { formatPrice } from '@/lib/price';

const EnrollFormContent = React.memo(function EnrollFormContent({ courses, discountTiers, comboDeals }) {
  const searchParams = useSearchParams();
  const initialCourseSlug = searchParams.get('course') || '';
  const initialComboSlug = searchParams.get('combo') || '';

  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileContainerRef = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

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

  // Pre-check combo deal courses from query param
  useEffect(() => {
    if (initialComboSlug && comboDeals.length > 0 && courses.length > 0) {
      const matchCombo = comboDeals.find(d => d.slug === initialComboSlug);
      if (matchCombo) {
        const courseIdsToSelect = [];
        if (matchCombo.courseIds && matchCombo.courseIds.length > 0) {
          matchCombo.courseIds.forEach(id => {
            if (courses.some(c => c._id === id)) {
              courseIdsToSelect.push(id);
            }
          });
        } else if (matchCombo.courseSlugs && matchCombo.courseSlugs.length > 0) {
          matchCombo.courseSlugs.forEach(slug => {
            const matchCourse = courses.find(c => c.slug === slug);
            if (matchCourse) {
              courseIdsToSelect.push(matchCourse._id);
            }
          });
        }

        if (courseIdsToSelect.length > 0) {
          setSelectedCourseIds(prev => {
            const newIds = [...prev];
            courseIdsToSelect.forEach(id => {
              if (!newIds.includes(id)) {
                newIds.push(id);
              }
            });
            return newIds;
          });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialComboSlug, comboDeals, courses]);

  // Initialize Turnstile widget
  useEffect(() => {
    if (!siteKey) return;

    let turnstileWidgetId = null;

    const initializeTurnstile = () => {
      if (window.turnstile && turnstileContainerRef.current && turnstileWidgetId === null) {
        try {
          turnstileWidgetId = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: siteKey,
            callback: (token) => {
              setTurnstileToken(token);
            },
            'expired-callback': () => {
              setTurnstileToken('');
            },
            'error-callback': () => {
              setTurnstileToken('');
            },
          });
        } catch (e) {
          console.error('Turnstile render error:', e);
        }
      }
    };

    if (window.turnstile) {
      initializeTurnstile();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          initializeTurnstile();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [siteKey]);

  // Handle checking/unchecking
  const handleToggleCourse = (id) => {
    setSelectedCourseIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  // Pricing calculations using shared engine
  const selectedCourses = courses.filter(c => selectedCourseIds.includes(c._id));
  const pricing = calculatePricing(selectedCourses, comboDeals, discountTiers);
  
  const {
    subtotal,
    discountPercent,
    discountAmount,
    totalPrice,
    discountSource,
    discountReason,
    selectedCount,
  } = pricing;

  // Sort tiers for gauge display
  const sortedTiers = [...discountTiers].sort((a, b) => a.minCourses - b.minCourses);

  // Find active tier and next tier for gauge display
  let activeTier = null;
  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    if (selectedCount >= sortedTiers[i].minCourses) {
      activeTier = sortedTiers[i];
      break;
    }
  }

  const nextTier = discountSource === 'combo' ? null : sortedTiers.find(t => t.minCourses > selectedCount);
  const coursesNeededForNext = nextTier ? nextTier.minCourses - selectedCount : 0;

  // Calculate selected course titles for modal
  const selectedCourseTitles = selectedCourses.map(c => c.title);

  // Filter courses based on search query
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCount === 0) {
      setStatus({ submitting: false, submitted: false, error: 'Please select at least one course.' });
      setToastMessage('Please select at least one course.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setStatus({ submitting: false, submitted: false, error: 'Name, Phone Number, and Email are required.' });
      setToastMessage('Name, Phone Number, and Email are required.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      setStatus({ submitting: false, submitted: false, error: 'Invalid email address.' });
      setToastMessage('Invalid email address.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    if (siteKey && !turnstileToken) {
      setStatus({ submitting: false, submitted: false, error: 'Please complete the CAPTCHA verification.' });
      setToastMessage('Please complete the CAPTCHA verification.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const selectedCourseTitles = selectedCourses.map(c => c.title);

    try {
      // 1. Send admin notification email (recalculated on server)
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          selectedCourses: selectedCourseTitles,
          turnstileToken,
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
      setShowSuccessModal(true);
      setToastMessage('Enrollment confirmed! Opening WhatsApp...');
      setToastType('success');
      setShowToast(true);
      setTurnstileToken('');
      if (window.turnstile) {
        window.turnstile.reset();
      }

      // 2. Open prefilled WhatsApp chat window
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || '923463517689';
      
      let coursesText = selectedCourses.map(c => `- ${c.title} (${formatPrice(c.price)})`).join('\n');
      
      const whatsappText = `Hello Simuflux, my name is ${name.trim()}.\n\nI would like to enroll in the following course(s):\n${coursesText}\n\nSubtotal: ${formatPrice(subtotal)}\nDiscount: ${discountPercent}% (-PKR ${discountAmount.toLocaleString()})\nTotal Price: ${formatPrice(totalPrice)}\n\nPlease contact me back at ${phone.trim()}.`;
      
      const encodedText = encodeURIComponent(whatsappText);
      const waUrl = `https://wa.me/${adminPhone}?text=${encodedText}`;
      
      window.open(waUrl, '_blank');

    } catch (err) {
      setStatus({ submitting: false, submitted: false, error: err.message });
      setToastMessage(err.message);
      setToastType('error');
      setShowToast(true);
      setTurnstileToken('');
      if (window.turnstile) {
        window.turnstile.reset();
      }
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSelectedCourseIds([]);
    setName('');
    setPhone('');
    setStatus({ submitting: false, submitted: false, error: null });
  };

  return (
    <>
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}
      <div className="min-h-screen bg-navy">
        {/* Header Block */}
        <div className="border-b border-hairline bg-white/[0.02] px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <SectionEyebrow text="Package Configurator" />
                <h1 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-offwhite tracking-tight mt-2">
                  Enroll Now
                </h1>
                <p className="font-sans text-base text-steelblue mt-3 leading-relaxed max-w-xl">
                  Choose your training courses. Your bundle discount updates dynamically based on the volume discount tiers set by the admin.
                </p>
              </div>
              <div className="font-mono text-xs text-steelblue/50 select-none">
                DESK ID: ENROLL-MAIN
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Course Selection & Student Details */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Course Selection Panel */}
              <div className="bg-white/[0.02] border border-hairline rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-hairline">
                  <h3 className="font-sans font-semibold text-lg text-offwhite">
                    Select Your Training Courses
                  </h3>
                  <p className="font-sans text-sm text-steelblue mt-1">
                    Choose one or more courses to build your custom package
                  </p>
                </div>
                
                {courses.length === 0 ? (
                  <div className="p-12 text-center text-steelblue font-sans text-sm">
                    No training courses available currently.
                  </div>
                ) : (
                  <div className="p-6">
                    {/* Search Input */}
                    <div className="relative mb-6">
                      <svg 
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-steelblue" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search courses by name or ID..."
                        className="w-full bg-navy/50 border border-hairline rounded-lg pl-12 pr-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                        aria-label="Search courses"
                      />
                    </div>

                    {/* Course Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredCourses.map((course) => {
                        const isChecked = selectedCourseIds.includes(course._id);
                        const badge = getCourseBadge(course, discountSource);
                        const finalPrice = badge && discountSource === 'individual' 
                          ? Math.round(course.price * (1 - course.discountPercent / 100))
                          : course.price;
                        
                        return (
                          <button
                            key={course._id}
                            type="button"
                            onClick={() => handleToggleCourse(course._id)}
                            className={`
                              relative p-5 rounded-lg border-2 transition-all duration-200 text-left
                              ${isChecked 
                                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20' 
                                : 'border-hairline bg-white/[0.02] hover:border-hairline hover:bg-white/[0.04]'
                              }
                            `}
                            aria-label={`Select ${course.title}`}
                            aria-pressed={isChecked}
                          >
                            {/* Selection Indicator */}
                            <div className={`
                              absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                              ${isChecked 
                                ? 'border-accent bg-accent' 
                                : 'border-steelblue/40 bg-transparent'
                              }
                            `}>
                              {isChecked && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>

                            {/* Course Content */}
                            <div className="pr-8">
                              <div className="font-mono text-xs text-steelblue/60 uppercase tracking-wider mb-2">
                                {course.id}
                              </div>
                              <h4 className="font-sans font-semibold text-base text-offwhite mb-3 leading-snug">
                                {course.title}
                              </h4>
                              
                              {/* Price Section */}
                              <div className="flex items-baseline gap-2">
                                {badge && discountSource === 'individual' && course.price !== null && course.price > 0 && (
                                  <span className="font-mono text-sm text-steelblue/60 line-through">
                                    PKR {course.price.toLocaleString()}
                                  </span>
                                )}
                                <span className={`font-mono text-lg font-semibold ${badge ? 'text-accent' : 'text-offwhite'}`}>
                                  {finalPrice !== null && finalPrice > 0 
                                    ? `PKR ${finalPrice.toLocaleString()}` 
                                    : finalPrice === 0 
                                      ? 'Free' 
                                      : 'Price Inquiry'}
                                </span>
                              </div>

                              {/* Discount Badge */}
                              {badge && (
                                <div className="inline-block mt-3 px-2 py-1 bg-accent/20 border border-accent/30 rounded-md">
                                  <span className="font-mono text-xs text-accent font-medium">
                                    {badge}
                                  </span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selection Counter */}
                    <div className="mt-4 pt-4 border-t border-hairline flex items-center justify-between">
                      <span className="font-sans text-sm text-steelblue">
                        {selectedCount} course{selectedCount !== 1 ? 's' : ''} selected
                      </span>
                      {selectedCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCourseIds([])}
                          className="font-sans text-sm text-steelblue hover:text-offwhite transition-colors"
                        >
                          Clear selection
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Student Details */}
              <div className="bg-white/[0.02] border border-hairline rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="font-sans font-semibold text-lg text-offwhite mb-1">
                    Student Details
                  </h3>
                  <p className="font-sans text-sm text-steelblue">
                    Please provide your contact information
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="student-name" className="block font-sans text-sm font-medium text-steelblue mb-2">
                      Full Name <span className="text-accent">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="student-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                        placeholder="e.g. John Doe"
                        required
                        aria-required="true"
                      />
                      <svg 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-steelblue pointer-events-none" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="font-sans text-xs text-steelblue/60 mt-2">
                      Enter your full legal name as it appears on official documents
                    </p>
                  </div>

                  <div>
                    <label htmlFor="student-phone" className="block font-sans text-sm font-medium text-steelblue mb-2">
                      WhatsApp / Phone <span className="text-accent">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="student-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                        placeholder="e.g. +92 300 1234567"
                        required
                        aria-required="true"
                      />
                      <svg 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-steelblue pointer-events-none" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <p className="font-sans text-xs text-steelblue/60 mt-2">
                      We&apos;ll send enrollment confirmation via WhatsApp
                    </p>
                  </div>

                  <div>
                    <label htmlFor="student-email" className="block font-sans text-sm font-medium text-steelblue mb-2">
                      Email Address <span className="text-accent">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="student-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                        placeholder="e.g. john@example.com"
                        required
                        aria-required="true"
                      />
                      <svg 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-steelblue pointer-events-none" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-sans text-xs text-steelblue/60 mt-2">
                      For course materials and updates
                    </p>
                  </div>

                  {/* Turnstile widget */}
                  {siteKey && (
                    <div className="py-sm flex justify-start">
                      <div ref={turnstileContainerRef} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Pricing Summary */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-8 space-y-6">
                {/* Pricing Summary Card */}
                <div className="bg-white/[0.02] border border-hairline rounded-xl p-6 space-y-6">
                  <div>
                    <h3 className="font-sans font-semibold text-lg text-offwhite mb-1">
                      Order Summary
                    </h3>
                    <p className="font-sans text-sm text-steelblue">
                      Review your package details
                    </p>
                  </div>

                  {/* Discount Gauge */}
                  <DiscountGauge 
                    selectedCount={selectedCount}
                    sortedTiers={sortedTiers}
                    activeTier={activeTier}
                    nextTier={nextTier}
                    coursesNeededForNext={coursesNeededForNext}
                  />

                  {/* Selected Courses List */}
                  {selectedCourses.length > 0 && (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedCourses.map((course) => (
                        <div key={course._id} className="flex items-center justify-between text-sm">
                          <span className="font-sans text-steelblue truncate flex-1 pr-4">
                            {course.title}
                          </span>
                          <span className="font-mono text-steelblue/70 whitespace-nowrap">
                            {formatPrice(course.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="space-y-4 pt-4 border-t border-hairline">
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-sm text-steelblue">Original Total</span>
                      <span className="font-mono text-sm text-offwhite">{formatPrice(subtotal)}</span>
                    </div>
                    
                    {discountPercent > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="font-sans text-sm text-accent">
                            {getDiscountSourceLabel(discountSource)}
                          </span>
                          <span className="font-mono text-sm text-accent">
                            - PKR {discountAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-steelblue/70 font-sans leading-relaxed">
                          {discountReason}
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-hairline">
                      <span className="font-sans font-semibold text-base text-offwhite">Final Total</span>
                      <span className="font-mono font-bold text-2xl text-offwhite">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust Section */}
                <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="font-sans text-sm text-steelblue">Secure Enrollment</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="font-sans text-sm text-steelblue">WhatsApp Confirmation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-sans text-sm text-steelblue">Response within 15 minutes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-12a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span className="font-sans text-sm text-steelblue">No hidden charges</span>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {status.error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-sans text-sm">
                    {status.error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status.submitting || selectedCount === 0 || (siteKey && !turnstileToken)}
                  className="w-full bg-accent hover:bg-accent/90 active:bg-accent/80 text-offwhite font-sans font-semibold text-base px-6 py-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent shadow-lg shadow-accent/25 hover:shadow-accent/40 flex items-center justify-center gap-2"
                >
                  {status.submitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Enrollment Request</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <EnrollmentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        enrollmentDetails={{
          selectedCourses: selectedCourseTitles,
          subtotal,
          discountPercent,
          discountAmount,
          totalPrice,
        }}
      />
    </>
  );
});

export default function EnrollForm({ courses, discountTiers, comboDeals }) {
  return (
    <Suspense fallback={<div className="py-20 text-center font-sans text-sm text-slate-500 animate-pulse">Loading configurator...</div>}>
      <EnrollFormContent courses={courses} discountTiers={discountTiers} comboDeals={comboDeals} />
    </Suspense>
  );
}
