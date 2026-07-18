'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    email: '',
    currentPassword: '',
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(null);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      if (res.ok) {
        setProfile(data.admin || null);
        setEmailForm((prev) => ({ ...prev, email: data.admin?.email || '' }));
      } else {
        setError(data.error || 'Failed to load profile.');
      }
    } catch (err) {
      setError('Connection error. Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.currentPassword) {
      setEmailError('Please fill in all fields.');
      return;
    }

    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-email',
          email: emailForm.email,
          currentPassword: emailForm.currentPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmailSuccess(data.message || 'Email updated successfully.');
        setEmailForm((prev) => ({ ...prev, currentPassword: '' }));
        fetchProfile();
      } else {
        setEmailError(data.error || 'Failed to update email.');
      }
    } catch (err) {
      setEmailError('Failed to execute update. Connection error.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all fields.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-password',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordSuccess(data.message || 'Password updated successfully.');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setPasswordError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError('Failed to execute update. Connection error.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-4xl font-mono text-label text-steelblue animate-pulse">
        <span>RETRIEVING ACCOUNT SYSTEM CARD...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-accent bg-accent/5 p-xl font-mono text-label text-offwhite">
        ERROR: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4xl">
      {/* Header */}
      <div className="border-b border-hairline pb-2xl">
        <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
          [ ACCOUNT OVERVIEW ]
        </span>
        <h1 className="font-sans font-bold text-3xl text-offwhite uppercase tracking-tight">
          Admin Profile
        </h1>
        <p className="font-sans text-sm text-steelblue leading-relaxed mt-2 max-w-2xl">
          Review your credentials, check database system roles, and securely update your authentication parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3xl">
        {/* Info Column */}
        <div className="border border-hairline bg-navy/40 p-8 relative flex flex-col justify-between h-full">
          <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
          
          <div>
            <h3 className="font-sans font-bold text-lg text-offwhite mb-6 border-b border-hairline/60 pb-3">
              Account Metadata
            </h3>
            
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-steelblue/50 uppercase block mb-1">Database ID</span>
                <span className="text-offwhite break-all">{profile?._id}</span>
              </div>
              <div>
                <span className="text-steelblue/50 uppercase block mb-1">Assigned Email</span>
                <span className="text-offwhite font-bold">{profile?.email}</span>
              </div>
              <div>
                <span className="text-steelblue/50 uppercase block mb-1">Security Role</span>
                <span className="text-accent uppercase font-bold">{profile?.role || 'admin'}</span>
              </div>
              <div>
                <span className="text-steelblue/50 uppercase block mb-1">Created At</span>
                <span className="text-steelblue">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-hairline/60 font-sans text-2xs text-steelblue leading-normal">
            <strong>Security Notice:</strong> Changing your email or password will modify active authentication tokens. For security, please sign out and sign back in after making updates to ensure your local browser session is completely in sync.
          </div>
        </div>

        {/* Update Forms */}
        <div className="lg:col-span-2 space-y-3xl">
          {/* Update Email Form */}
          <div className="border border-hairline bg-navy/40 p-8 relative">
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
            
            <h3 className="font-sans font-bold text-lg text-offwhite mb-4 border-b border-hairline/60 pb-3">
              Change Email Address
            </h3>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                  New Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={emailForm.email}
                  onChange={handleEmailChange}
                  className="w-full max-w-md bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent text-sm"
                  placeholder="new-email@Simuflux.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="email-currentPassword" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                  Confirm Current Password
                </label>
                <input
                  id="email-currentPassword"
                  type="password"
                  name="currentPassword"
                  value={emailForm.currentPassword}
                  onChange={handleEmailChange}
                  className="w-full max-w-md bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              {emailError && (
                <div className="p-3 border border-accent bg-accent/5 text-offwhite font-mono text-xs max-w-md">
                  {emailError}
                </div>
              )}

              {emailSuccess && (
                <div className="p-3 border border-white/10 bg-white/5 text-green-400 font-mono text-xs max-w-md">
                  {emailSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-xs px-6 py-3.5 border border-transparent transition-colors disabled:opacity-50 select-none"
              >
                {emailLoading ? 'Updating Email...' : 'Update Email Address'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="border border-hairline bg-navy/40 p-8 relative">
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
            
            <h3 className="font-sans font-bold text-lg text-offwhite mb-4 border-b border-hairline/60 pb-3">
              Change Security Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full max-w-md bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent text-sm"
                  placeholder="Current password"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full max-w-md bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent text-sm"
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full max-w-md bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent text-sm"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {passwordError && (
                <div className="p-3 border border-accent bg-accent/5 text-offwhite font-mono text-xs max-w-md">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 border border-white/10 bg-white/5 text-green-400 font-mono text-xs max-w-md">
                  {passwordSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-xs px-6 py-3.5 border border-transparent transition-colors disabled:opacity-50 select-none"
              >
                {passwordLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
