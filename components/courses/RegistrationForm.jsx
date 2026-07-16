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
    <section className="py-4xl bg-navy/20 border-t border-hairline relative z-10" id="register-section">
      <div className="max-w-3xl mx-auto border border-hairline bg-navy/60 p-xl sm:p-4xl relative shadow-elevation-sm rounded-lg">
        {/* Engineering blueprint corners */}
        <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-white/5 pointer-events-none rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-white/5 pointer-events-none rounded-bl-lg" />

        <div className="text-center mb-xl border-b border-hairline/60 pb-xl">
          <span className="font-mono text-label uppercase tracking-widest text-accent block mb-sm">
            [ REGISTRATION DESK ]
          </span>
          <h2 className="font-sans font-bold text-h2 sm:text-h1 text-offwhite uppercase tracking-tight">
            Seat Enrollment & Receipt Submission
          </h2>
          <p className="font-sans text-caption sm:text-body text-steelblue leading-relaxed mt-md max-w-lg mx-auto">
            Once bank transfer or JazzCash details have been provided to you, fill out the details below along with a screenshot of the payment receipt.
          </p>
        </div>

        {status.submitted ? (
          <div className="text-center py-4xl space-y-xl">
            <div className="w-16 h-16 border border-accent flex items-center justify-center mx-auto rounded-lg shadow-elevation-sm">
              <svg className="w-8 h-8 text-accent fill-none stroke-current" viewBox="0 0 24 24" role="img" aria-label="Success checkmark icon">
                <title>Success</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-h2 text-offwhite uppercase tracking-tight">
              Registration Logged
            </h3>
            <p className="font-sans text-body text-steelblue leading-relaxed max-w-md mx-auto">
              {status.message}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-lg">
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
                  className={`w-full bg-navy/60 border ${
                    errors.name ? 'border-accent' : 'border-hairline'
                  } px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded-md text-body`}
                  placeholder="e.g. John Doe"
                />
                {errors.name && <span className="font-mono text-caption text-accent mt-sm block">{errors.name}</span>}
              </div>

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
                  className={`w-full bg-navy/60 border ${
                    errors.email ? 'border-accent' : 'border-hairline'
                  } px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded-md text-body`}
                  placeholder="e.g. john@example.com"
                />
                {errors.email && <span className="font-mono text-caption text-accent mt-sm block">{errors.email}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
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
                  className={`w-full bg-navy/60 border ${
                    errors.phone ? 'border-accent' : 'border-hairline'
                  } px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded-md text-body`}
                  placeholder="e.g. +92 300 1234567"
                />
                {errors.phone && <span className="font-mono text-caption text-accent mt-sm block">{errors.phone}</span>}
              </div>

              <div>
                <label htmlFor="course" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                  Select Course *
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`w-full bg-navy/60 border ${
                    errors.course ? 'border-accent' : 'border-hairline'
                  } px-4 py-3 text-offwhite font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all appearance-none rounded-md text-body`}
                  style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='%239DB4CB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                >
                  <option value="" disabled className="bg-navy text-steelblue/50">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c._id || c.id} value={c.title} className="bg-navy text-offwhite">
                      {c.title}
                    </option>
                  ))}
                </select>
                {errors.course && <span className="font-mono text-caption text-accent mt-sm block">{errors.course}</span>}
              </div>
            </div>

            {/* Payment Screenshot File Upload */}
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

            {/* Turnstile widget */}
            {siteKey && (
              <div className="py-sm flex justify-start">
                <div ref={turnstileContainerRef} />
              </div>
            )}
            {errors.captcha && <span className="font-mono text-caption text-accent mt-sm block">{errors.captcha}</span>}

            {status.error && (
              <div className="p-lg border border-accent bg-accent/5 text-offwhite font-mono text-label shadow-elevation-sm rounded">
                {status.error}
              </div>
            )}

            <button
              type="submit"
              disabled={status.submitting}
              className="w-full bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-mono uppercase tracking-wider text-label px-6 py-3 border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-elevation-sm hover:shadow-elevation-md rounded-md"
            >
              {status.submitting ? 'Transmitting Registration...' : 'Complete Course Registration'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
