'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculatePricing, getCourseBadge, getDiscountSourceLabel } from '@/lib/pricingEngine';

export default function RegistrationForm({ courses, discountTiers = [], comboDeals = [], initialCourse = '', isLocked = false }) {
  const [selectedCourses, setSelectedCourses] = useState(initialCourse ? [initialCourse] : []);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    email: '',
    phone: '',
    university: '',
    city: '',
    reason: '',
    highestQualification: '',
    currentlyPursuing: '',
  });
  
  const [screenshot, setScreenshot] = useState(null);

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
    message: null,
  });

  const [errors, setErrors] = useState({});

  // Step-specific validation
  const validateStep = (step) => {
    const tempErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) tempErrors.name = 'Full name is required.';
      
      const digitsOnly = formData.cnic.replace(/\D/g, '');
      if (!formData.cnic.trim()) {
        tempErrors.cnic = 'CNIC is required.';
      } else if (digitsOnly.length !== 13) {
        tempErrors.cnic = 'CNIC must be exactly 13 digits.';
      }

      if (!formData.email.trim()) {
        tempErrors.email = 'Email address is required.';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        tempErrors.email = 'Invalid email address.';
      }

      if (!formData.phone.trim()) tempErrors.phone = 'Phone number is required.';
    }
    
    if (step === 2) {
      if (!formData.university.trim()) tempErrors.university = 'University name is required.';
      if (!formData.city.trim()) tempErrors.city = 'City name is required.';
      if (!formData.highestQualification) tempErrors.highestQualification = 'Highest qualification selection is required.';
      if (!formData.currentlyPursuing) tempErrors.currentlyPursuing = 'Current degree path selection is required.';
    }
    
    if (step === 3) {
      if (!formData.reason.trim()) tempErrors.reason = 'Please explain why you want to enroll.';
      if (selectedCourses.length === 0) tempErrors.course = 'Please select at least one course.';
      if (!screenshot) tempErrors.screenshot = 'Payment receipt screenshot proof is required.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validate = () => {
    return validateStep(1) && validateStep(2) && validateStep(3);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCnicChange = (e) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 5);
    }
    if (digits.length > 5) {
      formatted += '-' + digits.substring(5, 12);
    }
    if (digits.length > 12) {
      formatted += '-' + digits.substring(12, 13);
    }
    setFormData(prev => ({ ...prev, cnic: formatted }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, screenshot: 'File size exceeds the 5MB limit.' }));
      setScreenshot(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, screenshot: 'Only image files (JPEG, PNG, WEBP) are allowed.' }));
      setScreenshot(null);
      return;
    }

    setScreenshot(file);
    setErrors((prev) => ({ ...prev, screenshot: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus({ submitting: true, submitted: false, error: null, message: null });

    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('cnic', formData.cnic);
    submissionData.append('email', formData.email);
    submissionData.append('phone', formData.phone);
    submissionData.append('university', formData.university);
    submissionData.append('city', formData.city);
    submissionData.append('reason', formData.reason);
    submissionData.append('highestQualification', formData.highestQualification);
    submissionData.append('currentlyPursuing', formData.currentlyPursuing);
    selectedCourses.forEach(title => {
      submissionData.append('courses', title);
    });
    submissionData.append('clientDiscountPercent', discountPercent);
    submissionData.append('clientTotalPrice', totalPrice);
    submissionData.append('screenshot', screenshot);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: submissionData,
      });

      const resData = await response.json();

      if (response.ok) {
        setStatus({ 
          submitting: false, 
          submitted: true, 
          error: null, 
          message: resData.message || "We've received your registration and payment proof — we'll be in touch soon." 
        });
        setFormData({
          name: '',
          cnic: '',
          email: '',
          phone: '',
          university: '',
          city: '',
          reason: '',
          highestQualification: '',
          currentlyPursuing: '',
        });
        setSelectedCourses(initialCourse ? [initialCourse] : []);
        setScreenshot(null);
        setCurrentStep(1);
      } else {
        throw new Error(resData.error || 'Failed to submit registration.');
      }
    } catch (err) {
      setStatus({
        submitting: false,
        submitted: false,
        error: err.message || 'An error occurred. Please try again.',
        message: null,
      });

    }
  };

  const qualificationOptions = ['Matric', 'Intermediate', "Bachelor's", "Master's", 'PhD', 'Other'];
  const degreeOptions = ['BS', 'BE', 'ADP', 'MS', 'Not currently studying', 'Other'];

  // Pricing calculations using shared engine
  const selectedCoursesList = courses.filter(c => selectedCourses.includes(c.title));
  const pricing = calculatePricing(selectedCoursesList, comboDeals, discountTiers);
  
  const {
    subtotal,
    discountPercent,
    discountAmount,
    totalPrice,
    discountSource,
    discountReason,
    selectedCount,
  } = pricing;

  // Step content components
  const Step1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
        <div>
          <label htmlFor="name" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full bg-navy/60 border ${errors.name ? 'border-accent' : 'border-hairline'} px-lg py-sm text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-body rounded`}
            placeholder="e.g. John Doe"
          />
          {errors.name && <span className="font-mono text-caption text-accent mt-sm block">{errors.name}</span>}
        </div>

        <div>
          <label htmlFor="cnic" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
            CNIC Number *
          </label>
          <input
            id="cnic"
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleCnicChange}
            maxLength="15"
            className={`w-full bg-navy/60 border ${errors.cnic ? 'border-accent' : 'border-hairline'} px-lg py-sm text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-body rounded`}
            placeholder="e.g. 12345-1234567-1"
          />
          {errors.cnic && <span className="font-mono text-caption text-accent mt-sm block">{errors.cnic}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
        <div>
          <label htmlFor="email" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full bg-navy/60 border ${errors.email ? 'border-accent' : 'border-hairline'} px-lg py-sm text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-body rounded`}
            placeholder="e.g. john@example.com"
          />
          {errors.email && <span className="font-mono text-caption text-accent mt-sm block">{errors.email}</span>}
        </div>

        <div>
          <label htmlFor="phone" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
            WhatsApp / Phone *
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full bg-navy/60 border ${errors.phone ? 'border-accent' : 'border-hairline'} px-lg py-sm text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-body rounded`}
            placeholder="e.g. +92 300 1234567"
          />
          {errors.phone && <span className="font-mono text-caption text-accent mt-sm block">{errors.phone}</span>}
        </div>
      </div>
    </motion.div>
  );

  const Step2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
        <div>
          <label htmlFor="university" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
            University Name *
          </label>
          <input
            id="university"
            type="text"
            name="university"
            value={formData.university}
            onChange={handleChange}
            className={`w-full bg-navy/60 border ${errors.university ? 'border-accent' : 'border-hairline'} px-lg py-sm text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-body rounded`}
            placeholder="e.g. NED University"
          />
          {errors.university && <span className="font-mono text-caption text-accent mt-sm block">{errors.university}</span>}
        </div>

        <div>
          <label htmlFor="city" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
            City *
          </label>
          <input
            id="city"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full bg-navy/60 border ${errors.city ? 'border-accent' : 'border-hairline'} px-lg py-sm text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-body rounded`}
            placeholder="e.g. Karachi"
          />
          {errors.city && <span className="font-mono text-caption text-accent mt-sm block">{errors.city}</span>}
        </div>
      </div>

      <div>
        <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-md">
          Highest Qualification *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
          {qualificationOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-sm border border-hairline/60 bg-navy/40 px-md py-sm cursor-pointer hover:border-accent/60 transition-colors rounded">
              <input
                type="radio"
                name="highestQualification"
                value={opt}
                checked={formData.highestQualification === opt}
                onChange={handleChange}
                className="accent-accent w-4 h-4 cursor-pointer"
              />
              <span className="text-body text-offwhite select-none">{opt}</span>
            </label>
          ))}
        </div>
        {errors.highestQualification && <span className="font-mono text-caption text-accent mt-sm block">{errors.highestQualification}</span>}
      </div>

      <div>
        <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-md">
          Degree Currently Pursuing *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
          {degreeOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-sm border border-hairline/60 bg-navy/40 px-md py-sm cursor-pointer hover:border-accent/60 transition-colors rounded">
              <input
                type="radio"
                name="currentlyPursuing"
                value={opt}
                checked={formData.currentlyPursuing === opt}
                onChange={handleChange}
                className="accent-accent w-4 h-4 cursor-pointer"
              />
              <span className="text-body text-offwhite select-none">{opt}</span>
            </label>
          ))}
        </div>
        {errors.currentlyPursuing && <span className="font-mono text-caption text-accent mt-sm block">{errors.currentlyPursuing}</span>}
      </div>
    </motion.div>
  );

  const Step3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-lg"
    >
      <div>
        <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-md">
          Select Enrolling Course(s) *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {courses.map((c) => {
            const isChecked = selectedCourses.includes(c.title);
            return (
              <label key={c._id || c.id} className={`flex items-center gap-sm border px-md py-md cursor-pointer hover:border-accent/60 transition-colors rounded ${
                isChecked ? 'border-accent bg-accent/5' : 'border-hairline/60 bg-navy/40'
              }`}>
                <input
                  type="checkbox"
                  name="courses"
                  value={c.title}
                  checked={isChecked}
                  onChange={(e) => {
                    const { value, checked } = e.target;
                    setSelectedCourses(prev =>
                      checked ? [...prev, value] : prev.filter(item => item !== value)
                    );
                  }}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
                <div className="select-none">
                  <span className="text-body font-bold text-offwhite block">{c.title}</span>
                  {c.price && (
                    <div>
                      {(() => {
                        const badge = getCourseBadge(c, discountSource);
                        const finalPrice = badge && discountSource === 'individual' 
                          ? Math.round(c.price * (1 - c.discountPercent / 100))
                          : c.price;
                        
                        return (
                          <div>
                            {badge && discountSource === 'individual' && (
                              <span className="text-caption font-mono text-steelblue/60 line-through block">
                                PKR {c.price.toLocaleString()}
                              </span>
                            )}
                            <span className={`text-caption font-mono ${badge ? 'text-accent' : 'text-steelblue/75'}`}>
                              PKR {finalPrice.toLocaleString()}
                            </span>
                            {badge && (
                              <div className="text-caption font-mono text-accent mt-1">
                                {badge}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        {errors.course && <span className="font-mono text-caption text-accent mt-sm block">{errors.course}</span>}

        {/* Dynamic Price Calculation display */}
        {selectedCount > 0 && (
          <div className="border border-hairline bg-navy/40 p-lg space-y-md font-sans mt-lg relative shadow-elevation-sm rounded">
            <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-white/5 pointer-events-none rounded-tr" />
            <div className="flex justify-between items-center text-body">
              <span className="text-steelblue">Original Total</span>
              <span className="font-mono text-offwhite">PKR {subtotal.toLocaleString()}</span>
            </div>
            {discountPercent > 0 && (
              <>
                <div className="flex justify-between items-center text-body text-accent">
                  <span>{getDiscountSourceLabel(discountSource)}</span>
                  <span className="font-mono">- PKR {discountAmount.toLocaleString()}</span>
                </div>
                <div className="text-xs text-steelblue/70 font-mono">
                  {discountReason}
                </div>
              </>
            )}
            <div className="border-t border-hairline pt-md flex justify-between items-center text-h3 font-bold text-offwhite">
              <span>Final Payable Amount</span>
              <span className="font-mono text-accent">PKR {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="reason" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
          Why do you want to enroll in this course? *
        </label>
        <textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows="4"
          className={`w-full bg-navy/60 border ${errors.reason ? 'border-accent' : 'border-hairline'} px-lg py-sm text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none text-body rounded`}
          placeholder="Provide a brief explanation (a few sentences)..."
        />
        {errors.reason && <span className="font-mono text-caption text-accent mt-sm block">{errors.reason}</span>}
      </div>

      <div>
        <label htmlFor="screenshot" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
          Upload Payment Receipt Screenshot * (JPEG/PNG/WEBP, Max 5MB)
        </label>
        <div className="flex flex-col sm:flex-row gap-md items-center">
          <input
            id="screenshot"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="screenshot"
            className={`cursor-pointer border w-full sm:w-auto hover:bg-accent/5 font-mono text-label uppercase tracking-wider px-xl py-sm transition-colors select-none text-center rounded ${
              errors.screenshot ? 'border-accent text-accent' : 'border-hairline text-steelblue hover:text-offwhite'
            }`}
          >
            {screenshot ? 'Change Screenshot' : 'Select Screenshot File'}
          </label>
          {screenshot && (
            <span className="font-mono text-caption text-green-400 truncate max-w-xs block mt-sm sm:mt-0">
              Selected: {screenshot.name} ({(screenshot.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          )}
        </div>
        {errors.screenshot && <span className="font-mono text-caption text-accent mt-sm block">{errors.screenshot}</span>}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-3xl mx-auto border border-hairline bg-navy/60 p-xl sm:p-4xl relative text-offwhite font-sans shadow-elevation-sm rounded-lg">
      {/* Blueprint corners */}
      <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-white/5 pointer-events-none rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-white/5 pointer-events-none rounded-bl-lg" />

      <div className="text-center mb-xl border-b border-hairline/60 pb-xl">
        <span className="font-mono text-label uppercase tracking-widest text-accent block mb-sm">
          [ ACADEMY SEAT ENROLLMENT ]
        </span>
        <h2 className="font-sans font-bold text-h2 sm:text-h1 uppercase tracking-tight">
          Student Registration Desk
        </h2>
        <p className="font-sans text-caption sm:text-body text-steelblue leading-relaxed mt-md max-w-lg mx-auto">
          Please submit details matching your CNIC, qualification logs, and attach the payment transaction receipt screenshot to secure your enrollment slots.
        </p>
      </div>

      {status.submitted ? (
        <div className="text-center py-4xl space-y-xl">
          <div className="w-16 h-16 border border-accent flex items-center justify-center mx-auto rounded-lg shadow-elevation-sm">
            <svg className="w-8 h-8 text-accent fill-none stroke-current" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-sans font-bold text-h2 uppercase tracking-tight">
            Registration Logged
          </h3>
          <p className="font-sans text-body text-steelblue leading-relaxed max-w-md mx-auto">
            {status.message}
          </p>
          {!isLocked && (
            <button
              onClick={() => {
                setStatus((prev) => ({ ...prev, submitted: false }));
                setCurrentStep(1);
              }}
              className="mt-lg font-mono text-label uppercase tracking-wider text-accent border border-accent/20 px-xl py-sm hover:bg-accent/5 transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
            >
              Register for Another Course
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Progress Indicator */}
          <div className="mb-xl">
            <div className="flex items-center justify-between mb-md">
              <span className="font-mono text-label uppercase tracking-wider text-accent">
                Step {currentStep} of {totalSteps}
              </span>
              <div className="flex gap-sm">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-1 rounded-full transition-colors ${
                      step <= currentStep ? 'bg-accent' : 'bg-hairline'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between text-caption text-steelblue font-mono">
              <span className={currentStep >= 1 ? 'text-accent' : ''}>Personal Info</span>
              <span className={currentStep >= 2 ? 'text-accent' : ''}>Education</span>
              <span className={currentStep >= 3 ? 'text-accent' : ''}>Course & Payment</span>
            </div>
          </div>

          {/* Fixed height form container */}
          <div className="min-h-[400px] max-h-[600px] overflow-y-auto pr-sm">
            <AnimatePresence mode="wait">
              {currentStep === 1 && <Step1 />}
              {currentStep === 2 && <Step2 />}
              {currentStep === 3 && <Step3 />}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-xl pt-xl border-t border-hairline/60">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="font-mono text-label uppercase tracking-wider text-steelblue border border-hairline hover:border-accent hover:text-accent px-xl py-sm transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
              >
                Back
              </button>
            )}
            <div className="flex-1" /> {/* Spacer */}
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="font-mono text-label uppercase tracking-wider text-offwhite bg-accent hover:bg-[#d04e1b] px-xl py-sm border border-transparent transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (validate()) {
                    const e = new Event('submit', { cancelable: true });
                    handleSubmit(e);
                  }
                }}
                disabled={status.submitting}
                className="font-mono text-label uppercase tracking-wider text-offwhite bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] px-xl py-sm border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-elevation-sm hover:shadow-elevation-md"
              >
                {status.submitting ? 'Transmitting Registration...' : 'Submit Registration'}
              </button>
            )}
          </div>

          {status.error && (
            <div className="mt-xl p-lg border border-accent bg-accent/5 text-offwhite font-mono text-label shadow-elevation-sm rounded">
              {status.error}
            </div>
          )}
        </>
      )}
    </div>
  );
}
