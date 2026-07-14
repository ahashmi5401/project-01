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
    <div className="space-y-4xl">
      {/* Header */}
      <div className="border-b border-hairline pb-xl">
        <span className="font-mono text-label uppercase tracking-widest text-accent block mb-sm">
          [ ACCESS LEVEL CONTROLLER ]
        </span>
        <h1 className="font-sans font-bold text-h2 text-offwhite uppercase tracking-tight">
          Admin Accounts
        </h1>
      </div>

      {/* Invite Form */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg opacity-50 blur-sm" />
        <div className="relative border border-hairline bg-navy/40 backdrop-blur-sm p-xl shadow-elevation-sm rounded-lg">
          <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none rounded-tr-lg" />
          
          <h3 className="font-sans font-bold text-h3 text-offwhite mb-md border-b border-hairline/60 pb-md">
            Create New Administrator
          </h3>
          <p className="font-sans text-caption text-steelblue leading-relaxed mb-lg">
            Enter the email address and password for the new administrator. The account will be created immediately and ready to use.
          </p>

          <form onSubmit={handleInviteSubmit} className="space-y-lg">
            <div className="w-full">
              <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-navy/80 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-body transition-all rounded"
                placeholder="e.g. colleague@simuflux.com"
                required
              />
            </div>

            <div className="w-full">
              <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                Password (min 6 characters)
              </label>
              <input
                type="password"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="w-full bg-navy/80 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-body transition-all rounded"
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>

            <div className="w-full">
              <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                Confirm Password
              </label>
              <input
                type="password"
                value={inviteConfirmPassword}
                onChange={(e) => setInviteConfirmPassword(e.target.value)}
                className="w-full bg-navy/80 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-body transition-all rounded"
                placeholder="Confirm password"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={inviteLoading}
              className="w-full sm:w-auto bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-label px-xl py-sm border border-transparent transition-colors disabled:opacity-50 select-none shadow-elevation-sm hover:shadow-elevation-md rounded"
            >
              {inviteLoading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>

          {inviteError && (
            <div className="mt-lg p-lg border border-accent bg-accent/5 text-offwhite font-mono text-label shadow-elevation-sm rounded">
              {inviteError}
            </div>
          )}

          {inviteSuccess && (
            <div className="mt-lg p-lg border border-white/10 bg-white/5 text-green-400 font-mono text-label shadow-elevation-sm rounded">
              {inviteSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Admins Directory */}
      <div className="space-y-xl">
        <h3 className="font-sans font-bold text-h3 text-offwhite border-b border-hairline/60 pb-md">
          Console Access Directory
        </h3>

        {loading ? (
          <div className="py-4xl text-center font-mono text-label text-steelblue animate-pulse">
            LOADING ACCREDITATION LIST...
          </div>
        ) : admins.length === 0 ? (
          <div className="border border-dashed border-white/10 p-4xl text-center text-steelblue font-mono text-label rounded">
            NO ADMINISTRATORS FOUND.
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/5 to-accent/5 rounded-lg opacity-30 blur-sm" />
              <div className="relative border border-hairline overflow-x-auto bg-navy/40 backdrop-blur-sm shadow-elevation-sm rounded-lg">
                <table className="w-full text-left font-sans text-body border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-hairline bg-white/5 font-mono text-label uppercase tracking-wider text-steelblue">
                      <th className="p-lg">Administrator Email</th>
                      <th className="p-lg w-40">Status</th>
                      <th className="p-lg w-52">Creation Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/60">
                    {paginatedAdmins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-white/[0.02] transition-all duration-200">
                        <td className="p-lg font-semibold text-offwhite">{admin.email}</td>
                        <td className="p-lg">
                          {admin.isVerified ? (
                            <span className="font-mono text-label uppercase px-sm py-xs bg-green-500/10 text-green-400 border border-green-500/20 shadow-elevation-sm rounded">
                              Active
                            </span>
                          ) : (
                            <span className="font-mono text-label uppercase px-sm py-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-elevation-sm rounded">
                              Invited
                            </span>
                          )}
                        </td>
                        <td className="p-lg font-mono text-caption text-steelblue">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-xl font-mono text-label">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-lg py-sm border border-hairline hover:border-accent disabled:opacity-30 disabled:hover:border-hairline text-steelblue hover:text-offwhite transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md disabled:shadow-none"
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
                  className="px-lg py-sm border border-hairline hover:border-accent disabled:opacity-30 disabled:hover:border-hairline text-steelblue hover:text-offwhite transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md disabled:shadow-none"
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
