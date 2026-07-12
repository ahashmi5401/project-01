'use client';

import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    website: '', // Honeypot field
  });

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Name is required.';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Invalid email address.';
    }
    
    if (!formData.message.trim()) tempErrors.message = 'Message is required.';

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
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        setStatus({ submitting: false, submitted: true, error: null });
        setFormData({ name: '', email: '', phone: '', message: '', website: '' });
      } else {
        throw new Error(resData.error || 'Failed to submit form.');
      }
    } catch (err) {
      setStatus({
        submitting: false,
        submitted: false,
        error: err.message || 'An error occurred. Please try again later.',
      });
    }
  };

  return (
    <div className="border border-hairline bg-navy/40 p-8 w-full">
      {status.submitted ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border border-accent flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-accent fill-none stroke-current" viewBox="0 0 24 24" role="img" aria-label="Success checkmark icon">
              <title>Success</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-sans font-bold text-xl text-offwhite mb-3">Transmission Successful</h3>
          <p className="font-sans text-sm text-steelblue leading-relaxed max-w-sm mx-auto">
            Your message has been logged. Our engineering team will review the parameters and get back to you shortly.
          </p>
          <button
            onClick={() => setStatus((prev) => ({ ...prev, submitted: false }))}
            className="mt-8 font-mono text-xs uppercase tracking-wider text-accent border border-accent/20 px-6 py-2.5 hover:bg-accent/5 active:bg-accent/10 transition-colors"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label htmlFor="name" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Name *
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

          <div>
            <label htmlFor="phone" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-navy/60 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors"
              placeholder="e.g. +92 300 1234567"
            />
          </div>

          <div>
            <label htmlFor="message" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className={`w-full bg-navy/60 border ${
                errors.message ? 'border-accent' : 'border-hairline'
              } px-4 py-3 text-offwhite placeholder-steelblue/40 font-sans focus:outline-none focus:border-accent transition-colors resize-none`}
              placeholder="Outline your project scope or training inquiry..."
            />
            {errors.message && <span className="font-mono text-[10px] text-accent mt-1 block">{errors.message}</span>}
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
            {status.submitting ? 'Transmitting...' : 'Submit Inquiry'}
          </button>
        </form>
      )}
    </div>
  );
}
