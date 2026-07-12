'use client';

import React, { useState, useEffect } from 'react';

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalItems = admins.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAdmins = admins.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [admins.length, totalPages, currentPage]);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteConfirmPassword, setInviteConfirmPassword] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admins');
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.admins || []);
      } else {
        setError(data.error || 'Failed to retrieve admins.');
      }
    } catch (err) {
      setError('Connection error. Failed to reach API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !invitePassword) {
      setInviteError('Email and password are required.');
      return;
    }
    if (invitePassword.length < 6) {
      setInviteError('Password must be at least 6 characters long.');
      return;
    }
    if (invitePassword !== inviteConfirmPassword) {
      setInviteError('Passwords do not match.');
      return;
    }

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: inviteEmail, 
          password: invitePassword,
          role: 'admin'
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setInviteSuccess('Admin account created successfully!');
        setInviteEmail('');
        setInvitePassword('');
        setInviteConfirmPassword('');
        fetchAdmins();
      } else {
        setInviteError(data.error || 'Failed to create administrator.');
      }
    } catch (err) {
      setInviteError('Failed to create admin. Connection error.');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-hairline pb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
          [ ACCESS LEVEL CONTROLLER ]
        </span>
        <h1 className="font-sans font-bold text-3xl text-offwhite uppercase tracking-tight">
          Admin Accounts
        </h1>
      </div>

      {/* Invite Form */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg opacity-50 blur-sm" />
        <div className="relative border border-hairline bg-navy/40 backdrop-blur-sm p-8 shadow-2xl shadow-black/20">
          <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
          
          <h3 className="font-sans font-bold text-lg text-offwhite mb-4 border-b border-hairline/60 pb-3">
            Create New Administrator
          </h3>
          <p className="font-sans text-xs text-steelblue leading-relaxed mb-6">
            Enter the email address and password for the new administrator. The account will be created immediately and ready to use.
          </p>

          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="w-full">
              <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-navy/80 border border-hairline px-4 py-3.5 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent text-sm transition-colors shadow-inner"
                placeholder="e.g. colleague@simuflux.com"
                required
              />
            </div>

            <div className="w-full">
              <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Password (min 6 characters)
              </label>
              <input
                type="password"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="w-full bg-navy/80 border border-hairline px-4 py-3.5 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent text-sm transition-colors shadow-inner"
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>

            <div className="w-full">
              <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={inviteConfirmPassword}
                onChange={(e) => setInviteConfirmPassword(e.target.value)}
                className="w-full bg-navy/80 border border-hairline px-4 py-3.5 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent text-sm transition-colors shadow-inner"
                placeholder="Confirm password"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={inviteLoading}
              className="w-full sm:w-auto bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-xs px-6 py-4 border border-transparent transition-colors disabled:opacity-50 select-none shadow-lg hover:shadow-accent/25"
            >
              {inviteLoading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>

          {inviteError && (
            <div className="mt-4 p-3 border border-accent bg-accent/5 text-offwhite font-mono text-xs max-w-xl">
              {inviteError}
            </div>
          )}

          {inviteSuccess && (
            <div className="mt-4 p-3 border border-white/10 bg-white/5 text-green-400 font-mono text-xs max-w-xl">
              {inviteSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Admins Directory */}
      <div className="space-y-6">
        <h3 className="font-sans font-bold text-lg text-offwhite border-b border-hairline/60 pb-3">
          Console Access Directory
        </h3>

        {loading ? (
          <div className="py-10 text-center font-mono text-xs text-steelblue animate-pulse">
            LOADING ACCREDITATION LIST...
          </div>
        ) : admins.length === 0 ? (
          <div className="border border-dashed border-white/10 p-12 text-center text-steelblue font-mono text-xs">
            NO ADMINISTRATORS FOUND.
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/5 to-accent/5 rounded-lg opacity-30 blur-sm" />
              <div className="relative border border-hairline overflow-x-auto bg-navy/40 backdrop-blur-sm shadow-2xl shadow-black/20">
                <table className="w-full text-left font-sans text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-hairline bg-white/5 font-mono text-xs uppercase tracking-wider text-steelblue">
                      <th className="p-4">Administrator Email</th>
                      <th className="p-4 w-40">Status</th>
                      <th className="p-4 w-52">Creation Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/60">
                    {paginatedAdmins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-white/[0.02] hover:shadow-inner transition-all duration-200">
                        <td className="p-4 font-semibold text-offwhite">{admin.email}</td>
                        <td className="p-4">
                          {admin.isVerified ? (
                            <span className="font-mono text-2xs uppercase px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 shadow-lg shadow-green-500/10">
                              Active
                            </span>
                          ) : (
                            <span className="font-mono text-2xs uppercase px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
                              Invited
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-mono text-xs text-steelblue">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-6 font-mono text-xs">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 border border-hairline hover:border-accent disabled:opacity-30 disabled:hover:border-hairline text-steelblue hover:text-offwhite transition-colors"
                >
                  &lt; Previous
                </button>
                <span className="text-steelblue">
                  Page <strong className="text-offwhite">{currentPage}</strong> of <strong className="text-offwhite">{totalPages}</strong>
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 border border-hairline hover:border-accent disabled:opacity-30 disabled:hover:border-hairline text-steelblue hover:text-offwhite transition-colors"
                >
                  Next &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
