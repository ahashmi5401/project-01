'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    website: '', // Honeypot field
  });

  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileContainerRef = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
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
    if (!formData.name.trim()) tempErrors.name = 'Name is required.';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Invalid email address.';
    }
    
    if (!formData.message.trim()) tempErrors.message = 'Message is required.';

    if (siteKey && !turnstileToken) {
      tempErrors.captcha = 'Please complete the CAPTCHA verification.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus({ submitting: true, submitted: false, error: null });

    // Honeypot spam protection: if website has a value, silently drop the request
    if (formData.website) {
      console.warn('Spam submission detected via honeypot.');
      setTimeout(() => {
        setStatus({ submitting: false, submitted: true, error: null });
        setFormData({ name: '', email: '', phone: '', message: '', website: '' });
      }, 800);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          turnstileToken,
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        setStatus({ submitting: false, submitted: true, error: null });
        setFormData({ name: '', email: '', phone: '', message: '', website: '' });
        setTurnstileToken('');
        if (window.turnstile) {
          window.turnstile.reset();
        }
      } else {
        throw new Error(resData.error || 'Failed to submit form.');
      }
    } catch (err) {
      setStatus({
        submitting: false,
        submitted: false,
        error: err.message || 'An error occurred. Please try again later.',
      });
      if (window.turnstile) {
        window.turnstile.reset();
        setTurnstileToken('');
      }
    }
  };

  return (
    <div className="bg-navy p-xl w-full rounded-xl">
      {status.submitted ? (
        <div className="text-center py-3xl">
          <div className="w-16 h-16 bg-accent/10 flex items-center justify-center mx-auto mb-xl shadow-elevation-sm">
            <svg className="w-8 h-8 text-accent fill-none stroke-current" viewBox="0 0 24 24" role="img" aria-label="Success checkmark icon">
              <title>Success</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-sans font-bold text-h2 text-offwhite mb-lg">Transmission Successful</h3>
          <p className="font-sans text-body text-steelblue leading-relaxed max-w-sm mx-auto">
            Your message has been logged. Our engineering team will review the parameters and get back to you shortly.
          </p>
          <button
            onClick={() => setStatus((prev) => ({ ...prev, submitted: false }))}
            className="mt-xl font-sans text-label uppercase tracking-wider text-accent border border-accent/20 px-lg py-sm hover:bg-accent/5 active:bg-accent/10 transition-colors rounded font-semibold"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-lg">
          {/* Honeypot field (hidden from real users, filled by bots) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex="-1"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="name" className="block font-sans text-label uppercase tracking-wider text-steelblue mb-sm font-semibold">
              Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full bg-navy border ${
                errors.name ? 'border-accent shadow-elevation-sm' : 'border-hairline'
              } px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded-md`} 
              placeholder="e.g. John Doe"
            />
            {errors.name && <span className="font-sans text-label text-accent mt-sm block">{errors.name}</span>}
          </div>

          <div>
            <label htmlFor="email" className="block font-sans text-label uppercase tracking-wider text-steelblue mb-sm font-semibold">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-navy border ${
                errors.email ? 'border-accent shadow-elevation-sm' : 'border-hairline'
              } px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded-md`} 
              placeholder="e.g. john@example.com"
            />
            {errors.email && <span className="font-sans text-label text-accent mt-sm block">{errors.email}</span>}
          </div>

          <div>
            <label htmlFor="phone" className="block font-sans text-label uppercase tracking-wider text-steelblue mb-sm font-semibold">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-navy border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all rounded-md"
              placeholder="e.g. +92 300 1234567"
            />
          </div>

          <div>
            <label htmlFor="message" className="block font-sans text-label uppercase tracking-wider text-steelblue mb-sm font-semibold">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className={`w-full bg-navy border ${
                errors.message ? 'border-accent shadow-elevation-sm' : 'border-hairline'
              } px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none rounded-md`} 
              placeholder="Outline your project scope or training inquiry..."
            />
            {errors.message && <span className="font-sans text-label text-accent mt-sm block">{errors.message}</span>}
          </div>

          {status.error && (
            <div className="p-lg border border-accent bg-accent/10 text-offwhite font-sans text-label shadow-elevation-sm rounded">
              {status.error}
            </div>
          )}

          {/* Turnstile widget */}
          {siteKey && (
            <div className="py-sm flex justify-start">
              <div ref={turnstileContainerRef} />
            </div>
          )}
          {errors.captcha && <span className="font-sans text-label text-accent mt-sm block">{errors.captcha}</span>}

          <button
            type="submit"
            disabled={status.submitting}
            className="w-full bg-accent hover:bg-[#d04e1b] active:bg-[#b03f13] text-offwhite font-sans uppercase tracking-wider text-label px-6 py-3 border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-elevation-sm hover:shadow-elevation-md rounded-md font-semibold"
          >
            {status.submitting ? 'Transmitting...' : 'Submit Inquiry'}
          </button>
        </form>
      )}
    </div>
  );
}
