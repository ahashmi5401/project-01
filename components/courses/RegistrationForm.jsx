'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function RegistrationForm({ courses }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
  });
  
  const [screenshot, setScreenshot] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileContainerRef = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
    message: null,
  });

  const [errors, setErrors] = useState({});

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
              setErrors((prev) => ({ ...prev, captcha: null }));
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

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Full name is required.';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Invalid email address.';
    }

    if (!formData.phone.trim()) tempErrors.phone = 'Phone number is required.';
    if (!formData.course) tempErrors.course = 'Please select a course.';
    if (!screenshot) tempErrors.screenshot = 'Payment screenshot proof is required.';

    if (siteKey && !turnstileToken) {
      tempErrors.captcha = 'Please complete the CAPTCHA verification.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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
    submissionData.append('email', formData.email);
    submissionData.append('phone', formData.phone);
    submissionData.append('course', formData.course);
    submissionData.append('screenshot', screenshot);
    submissionData.append('turnstileToken', turnstileToken);

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
        setFormData({ name: '', email: '', phone: '', course: '' });
        setScreenshot(null);
        setTurnstileToken('');
        if (window.turnstile) {
          window.turnstile.reset();
        }
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
      if (window.turnstile) {
        window.turnstile.reset();
        setTurnstileToken('');
      }
    }
  };

  return (
    <section className="py-16 bg-navy/20 border-t border-hairline relative z-10" id="register-section">
      <div className="max-w-3xl mx-auto border border-hairline bg-navy/60 p-8 sm:p-12 relative">
        {/* Engineering blueprint corners */}
        <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-white/5 pointer-events-none" />

        <div className="text-center mb-10 border-b border-hairline/60 pb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
            [ REGISTRATION DESK ]
          </span>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-offwhite uppercase tracking-tight">
            Seat Enrollment & Receipt Submission
          </h2>
          <p className="font-sans text-xs sm:text-sm text-steelblue leading-relaxed mt-2 max-w-lg mx-auto">
            Once bank transfer or JazzCash details have been provided to you, fill out the details below along with a screenshot of the payment receipt.
          </p>
        </div>

        {status.submitted ? (
          <div className="text-center py-12 space-y-6">
            <div className="w-16 h-16 border border-accent flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-accent fill-none stroke-current" viewBox="0 0 24 24" role="img" aria-label="Success checkmark icon">
                <title>Success</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-xl text-offwhite uppercase tracking-tight">
              Registration Logged
            </h3>
            <p className="font-sans text-sm text-steelblue leading-relaxed max-w-md mx-auto">
              {status.message}
            </p>
            <button
              onClick={() => setStatus((prev) => ({ ...prev, submitted: false }))}
              className="mt-6 font-mono text-xs uppercase tracking-wider text-accent border border-accent/20 px-8 py-3 hover:bg-accent/5 active:bg-accent/10 transition-colors"
            >
              Enroll In Another Course
            </button>
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
                  className={`w-full bg-navy/60 border ${
                    errors.name ? 'border-accent' : 'border-hairline'
                  } px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors`}
                  placeholder="e.g. John Doe"
                />
                {errors.name && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.name}</span>}
              </div>

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
                  className={`w-full bg-navy/60 border ${
                    errors.email ? 'border-accent' : 'border-hairline'
                  } px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors`}
                  placeholder="e.g. john@example.com"
                />
                {errors.email && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.email}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  className={`w-full bg-navy/60 border ${
                    errors.phone ? 'border-accent' : 'border-hairline'
                  } px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors`}
                  placeholder="e.g. +92 300 1234567"
                />
                {errors.phone && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.phone}</span>}
              </div>

              <div>
                <label htmlFor="course" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                  Select Course *
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`w-full bg-navy/60 border ${
                    errors.course ? 'border-accent' : 'border-hairline'
                  } px-4 py-3.5 text-offwhite font-sans focus:outline-none focus:border-accent transition-colors appearance-none`}
                  style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='%239DB4CB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                >
                  <option value="" disabled className="bg-navy text-steelblue/50">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c._id || c.id} value={c.title} className="bg-navy text-offwhite">
                      {c.title}
                    </option>
                  ))}
                </select>
                {errors.course && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.course}</span>}
              </div>
            </div>

            {/* Payment Screenshot File Upload */}
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
                  <span className="font-mono text-3xs text-green-400 truncate max-w-xs block mt-2 sm:mt-0">
                    Selected: {screenshot.name} ({(screenshot.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
              {errors.screenshot && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.screenshot}</span>}
            </div>

            {/* Turnstile widget */}
            {siteKey && (
              <div className="py-2 flex justify-start">
                <div ref={turnstileContainerRef} />
              </div>
            )}
            {errors.captcha && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.captcha}</span>}

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
    </section>
  );
}
