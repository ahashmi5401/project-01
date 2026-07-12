'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function RegistrationForm({ courses, initialCourse = '', isLocked = false }) {
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
    course: initialCourse,
  });
  
  const [screenshot, setScreenshot] = useState(null);

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
    message: null,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Full name is required.';
    
    // CNIC check
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
    if (!formData.university.trim()) tempErrors.university = 'University name is required.';
    if (!formData.city.trim()) tempErrors.city = 'City name is required.';
    if (!formData.reason.trim()) tempErrors.reason = 'Please explain why you want to enroll.';
    if (!formData.highestQualification) tempErrors.highestQualification = 'Highest qualification selection is required.';
    if (!formData.currentlyPursuing) tempErrors.currentlyPursuing = 'Current degree path selection is required.';
    if (!formData.course) tempErrors.course = 'Please select a course.';
    if (!screenshot) tempErrors.screenshot = 'Payment receipt screenshot proof is required.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    submissionData.append('course', formData.course);
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
          course: isLocked ? initialCourse : '',
        });
        setScreenshot(null);
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

  return (
    <div className="max-w-3xl mx-auto border border-hairline bg-navy/60 p-8 sm:p-12 relative text-offwhite font-sans">
      {/* Blueprint corners */}
      <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-white/5 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-white/5 pointer-events-none" />

      <div className="text-center mb-10 border-b border-hairline/60 pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
          [ ACADEMY SEAT ENROLLMENT ]
        </span>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl uppercase tracking-tight">
          Student Registration Desk
        </h2>
        <p className="font-sans text-xs sm:text-sm text-steelblue leading-relaxed mt-2 max-w-lg mx-auto">
          Please submit details matching your CNIC, qualification logs, and attach the payment transaction receipt screenshot to secure your enrollment slots.
        </p>
      </div>

      {status.submitted ? (
        <div className="text-center py-12 space-y-6">
          <div className="w-16 h-16 border border-accent flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-accent fill-none stroke-current" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-sans font-bold text-xl uppercase tracking-tight">
            Registration Logged
          </h3>
          <p className="font-sans text-sm text-steelblue leading-relaxed max-w-md mx-auto">
            {status.message}
          </p>
          {!isLocked && (
            <button
              onClick={() => setStatus((prev) => ({ ...prev, submitted: false }))}
              className="mt-6 font-mono text-xs uppercase tracking-wider text-accent border border-accent/20 px-8 py-3 hover:bg-accent/5 transition-colors"
            >
              Register for Another Course
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full bg-navy/60 border ${errors.name ? 'border-accent' : 'border-hairline'} px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors text-sm`}
                placeholder="e.g. John Doe"
                required
              />
              {errors.name && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.name}</span>}
            </div>

            <div>
              <label htmlFor="cnic" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                CNIC Number *
              </label>
              <input
                id="cnic"
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleCnicChange}
                maxLength="15"
                className={`w-full bg-navy/60 border ${errors.cnic ? 'border-accent' : 'border-hairline'} px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors text-sm`}
                placeholder="e.g. 12345-1234567-1"
                required
              />
              {errors.cnic && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.cnic}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-navy/60 border ${errors.email ? 'border-accent' : 'border-hairline'} px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors text-sm`}
                placeholder="e.g. john@example.com"
                required
              />
              {errors.email && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.email}</span>}
            </div>

            <div>
              <label htmlFor="phone" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                WhatsApp / Phone *
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full bg-navy/60 border ${errors.phone ? 'border-accent' : 'border-hairline'} px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors text-sm`}
                placeholder="e.g. +92 300 1234567"
                required
              />
              {errors.phone && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.phone}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="university" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                University Name *
              </label>
              <input
                id="university"
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className={`w-full bg-navy/60 border ${errors.university ? 'border-accent' : 'border-hairline'} px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors text-sm`}
                placeholder="e.g. NED University"
                required
              />
              {errors.university && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.university}</span>}
            </div>

            <div>
              <label htmlFor="city" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                City *
              </label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full bg-navy/60 border ${errors.city ? 'border-accent' : 'border-hairline'} px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors text-sm`}
                placeholder="e.g. Karachi"
                required
              />
              {errors.city && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.city}</span>}
            </div>
          </div>

          {/* Radio Buttons for Highest Qualification */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-3">
              Highest Qualification *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {qualificationOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-3 border border-hairline/60 bg-navy/40 px-4 py-3 cursor-pointer hover:border-accent/60 transition-colors">
                  <input
                    type="radio"
                    name="highestQualification"
                    value={opt}
                    checked={formData.highestQualification === opt}
                    onChange={handleChange}
                    className="accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-offwhite select-none">{opt}</span>
                </label>
              ))}
            </div>
            {errors.highestQualification && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.highestQualification}</span>}
          </div>

          {/* Radio Buttons for Current Degree pursuing */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-3">
              Degree Currently Pursuing *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {degreeOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-3 border border-hairline/60 bg-navy/40 px-4 py-3 cursor-pointer hover:border-accent/60 transition-colors">
                  <input
                    type="radio"
                    name="currentlyPursuing"
                    value={opt}
                    checked={formData.currentlyPursuing === opt}
                    onChange={handleChange}
                    className="accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-offwhite select-none">{opt}</span>
                </label>
              ))}
            </div>
            {errors.currentlyPursuing && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.currentlyPursuing}</span>}
          </div>

          {/* Radio Buttons for Courses */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-3">
              Enrolling Course *
            </label>
            {isLocked ? (
              <div className="border border-accent/40 bg-accent/5 px-4 py-4 font-sans font-bold text-offwhite flex justify-between items-center text-sm">
                <span>{formData.course}</span>
                <span className="font-mono text-3xs text-accent uppercase select-none">[ PRE-SELECTED & LOCKED ]</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((c) => (
                  <label key={c._id || c.id} className="flex items-center gap-3 border border-hairline/60 bg-navy/40 px-4 py-4 cursor-pointer hover:border-accent/60 transition-colors">
                    <input
                      type="radio"
                      name="course"
                      value={c.title}
                      checked={formData.course === c.title}
                      onChange={handleChange}
                      className="accent-accent w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-offwhite select-none">{c.title}</span>
                  </label>
                ))}
              </div>
            )}
            {errors.course && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.course}</span>}
          </div>

          {/* Why do you want to learn this course textarea */}
          <div>
            <label htmlFor="reason" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Why do you want to enroll in this course? *
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              className={`w-full bg-navy/60 border ${errors.reason ? 'border-accent' : 'border-hairline'} px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors resize-none text-sm`}
              placeholder="Provide a brief explanation (a few sentences)..."
              required
            />
            {errors.reason && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.reason}</span>}
          </div>

          {/* Payment receipt screenshot upload */}
          <div>
            <label htmlFor="screenshot" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Upload Payment Receipt Screenshot * (JPEG/PNG/WEBP, Max 5MB)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="screenshot"
                className={`cursor-pointer border w-full sm:w-auto hover:bg-accent/5 font-mono text-xs uppercase tracking-wider px-8 py-3.5 transition-colors select-none text-center ${
                  errors.screenshot ? 'border-accent text-accent' : 'border-hairline text-steelblue hover:text-offwhite'
                }`}
              >
                {screenshot ? 'Change Screenshot' : 'Select Screenshot File'}
              </label>
              {screenshot && (
                <span className="font-mono text-xs text-green-400 truncate max-w-xs block mt-2 sm:mt-0">
                  Selected: {screenshot.name} ({(screenshot.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>
            {errors.screenshot && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.screenshot}</span>}
          </div>


          {status.error && (
            <div className="p-4 border border-accent bg-accent/5 text-offwhite font-mono text-xs">
              {status.error}
            </div>
          )}

          <button
            type="submit"
            disabled={status.submitting}
            className="w-full bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-mono uppercase tracking-wider text-sm py-4 border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {status.submitting ? 'Transmitting Registration...' : 'Complete Course Registration'}
          </button>
        </form>
      )}
    </div>
  );
}
