'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SectionEyebrow from '@/components/shared/SectionEyebrow';
import DiscountGauge from './DiscountGauge';
import EnrollmentSuccessModal from './EnrollmentSuccessModal';
import Toast from '@/components/shared/Toast';
import { calculatePricing, getCourseBadge, getDiscountSourceLabel } from '@/lib/pricingEngine';

const EnrollFormContent = React.memo(function EnrollFormContent({ courses, discountTiers, comboDeals }) {
  const searchParams = useSearchParams();
  const initialCourseSlug = searchParams.get('course') || '';

  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
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

      // 2. Open prefilled WhatsApp chat window
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || '923463517689';
      
      let coursesText = selectedCourses.map(c => `- ${c.title} (PKR ${c.price?.toLocaleString() || 'N/A'})`).join('\n');
      
      const whatsappText = `Hello SimuFlux, my name is ${name.trim()}.\n\nI would like to enroll in the following course(s):\n${coursesText}\n\nSubtotal: PKR ${subtotal.toLocaleString()}\nDiscount: ${discountPercent}% (-PKR ${discountAmount.toLocaleString()})\nTotal Price: PKR ${totalPrice.toLocaleString()}\n\nPlease contact me back at ${phone.trim()}.`;
      
      const encodedText = encodeURIComponent(whatsappText);
      const waUrl = `https://wa.me/${adminPhone}?text=${encodedText}`;
      
      window.open(waUrl, '_blank');

    } catch (err) {
      setStatus({ submitting: false, submitted: false, error: err.message });
      setToastMessage(err.message);
      setToastType('error');
      setShowToast(true);
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
      <div className="space-y-8">
        {/* Header Block */}
        <div className="border-b border-hairline pb-lg sm:pb-xl flex flex-col sm:flex-row sm:items-end justify-between gap-6">
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

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
          
          {/* Student Details Section */}
          <div className="border border-hairline bg-navy/40 backdrop-blur-sm shadow-elevation-md p-xl space-y-xl rounded-lg">
            <h4 className="font-mono text-label uppercase tracking-widest text-steelblue block mb-sm">
              [ STUDENT SIGNATURE DETAILS ]
            </h4>

            <div>
              <label htmlFor="student-name" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                Full Name <span className="text-accent">*</span>
              </label>
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-navy/50 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded text-body"
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="student-phone" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                WhatsApp / Phone <span className="text-accent">*</span>
              </label>
              <input
                id="student-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-navy/50 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded text-body"
                placeholder="e.g. +92 300 1234567"
                required
              />
            </div>

            <div>
              <label htmlFor="student-email" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                Email Address <span className="text-accent">*</span>
              </label>
              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy/50 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded text-body"
                placeholder="e.g. john@example.com"
                required
              />
            </div>
          </div>

          {/* Course Selection Dropdown */}
          <div className="border border-hairline bg-navy/40 shadow-elevation-sm rounded-lg overflow-hidden">
            <h3 className="font-mono text-label uppercase tracking-wider text-accent select-none border-b border-hairline/60 px-xl py-md">
              [ SELECT YOUR TRAINING COURSES ]
            </h3>
            
            {courses.length === 0 ? (
              <div className="p-4xl text-center text-steelblue font-mono text-label">
                NO TRAINING COURSES AVAILABLE CURRENTLY.
              </div>
            ) : (
              <div className="p-xl">
                {/* Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-navy/50 border border-hairline px-lg py-sm text-offwhite font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded text-body flex items-center justify-between"
                >
                  <span className={selectedCount > 0 ? 'text-offwhite' : 'text-steelblue/50'}>
                    {selectedCount > 0 ? `${selectedCount} course${selectedCount > 1 ? 's' : ''} selected` : 'Select courses...'}
                  </span>
                  <svg className={`w-5 h-5 text-steelblue transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className="mt-4 border border-hairline bg-navy/30 rounded-lg max-h-[400px] overflow-y-auto custom-scrollbar">
                    {courses.map((course) => {
                      const isChecked = selectedCourseIds.includes(course._id);
                      const badge = getCourseBadge(course, discountSource);
                      const finalPrice = badge && discountSource === 'individual' 
                        ? Math.round(course.price * (1 - course.discountPercent / 100))
                        : course.price;
                      
                      return (
                        <div
                          key={course._id}
                          onClick={() => handleToggleCourse(course._id)}
                          className="px-xl py-lg border-b border-hairline/40 last:border-b-0 cursor-pointer transition-all duration-300 select-none bg-navy/40 hover:bg-white/[0.02]"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all duration-300 rounded-sm mt-1 flex-shrink-0 ${
                              isChecked ? 'border-accent bg-accent' : 'border-hairline bg-transparent hover:border-accent/50'
                            }`}>
                              {isChecked && (
                                <svg className="w-4 h-4 text-offwhite fill-none stroke-current" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <span className="font-sans font-semibold text-body text-offwhite block">
                                    {course.title}
                                  </span>
                                  <span className="font-mono text-caption text-steelblue/60 uppercase tracking-wider mt-1 block">
                                    {course.id}
                                  </span>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  {badge && discountSource === 'individual' && (
                                    <span className="font-mono text-caption text-steelblue/60 line-through block">
                                      PKR {course.price?.toLocaleString() || 'N/A'}
                                    </span>
                                  )}
                                  <span className={`font-mono text-caption font-semibold block ${badge ? 'text-accent' : 'text-offwhite'}`}>
                                    PKR {finalPrice?.toLocaleString() || 'N/A'}
                                  </span>
                                  {badge && (
                                    <div className="font-mono text-caption text-accent mt-1">
                                      {badge}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="border border-hairline bg-navy/40 backdrop-blur-sm shadow-elevation-md p-xl space-y-xl font-sans rounded-lg">
            <h3 className="font-mono text-label uppercase tracking-wider text-accent select-none border-b border-hairline/60 pb-md">
              [ FITTING SHEET SUMMARY ]
            </h3>

            {/* Discount Gauge */}
            <DiscountGauge 
              selectedCount={selectedCount}
              sortedTiers={sortedTiers}
              activeTier={activeTier}
              nextTier={nextTier}
              coursesNeededForNext={coursesNeededForNext}
            />

            <div className="space-y-lg">
              <div className="flex justify-between items-center">
                <span className="text-steelblue text-body">Original Total</span>
                <span className="font-mono text-offwhite text-caption">PKR {subtotal.toLocaleString()}</span>
              </div>
              
              {discountPercent > 0 && (
                <>
                  <div className="flex justify-between items-center text-accent">
                    <span className="text-body">{getDiscountSourceLabel(discountSource)}</span>
                    <span className="font-mono text-caption">- PKR {discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-steelblue/70 font-mono">
                    {discountReason}
                  </div>
                </>
              )}
              
              <div className="border-t border-hairline/60 pt-lg flex justify-between items-center">
                <span className="font-sans font-bold text-h3 text-offwhite uppercase tracking-wide">Final Payable Amount</span>
                <span className="font-mono font-bold text-h2 text-accent leading-none">PKR {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {status.error && (
            <div className="p-lg bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-sans text-caption shadow-elevation-sm">
              {status.error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status.submitting || selectedCount === 0}
            className="w-full bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-mono uppercase tracking-wider text-label px-xl py-sm border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-elevation-sm hover:shadow-elevation-md disabled:shadow-none rounded"
          >
            {status.submitting ? 'Transmitting Request...' : 'Send Enrollment Request'}
          </button>
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
    <Suspense fallback={<div className="py-20 text-center font-mono text-xs text-steelblue animate-pulse">LOADING CONFIGURATOR FRAME...</div>}>
      <EnrollFormContent courses={courses} discountTiers={discountTiers} comboDeals={comboDeals} />
    </Suspense>
  );
}
