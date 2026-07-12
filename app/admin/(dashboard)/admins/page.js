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
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);
  const [devInviteLink, setDevInviteLink] = useState(null); // Local dev helper

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
    if (!inviteEmail) return;

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    setDevInviteLink(null);

    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setInviteSuccess('Invitation dispatched successfully!');
        setInviteEmail('');
        fetchAdmins();
        
        // If we're in dev mode and the invite link is returned (due to no Resend set up), capture it
        if (data.inviteLink) {
          setDevInviteLink(data.inviteLink);
        }
      } else {
        setInviteError(data.error || 'Failed to invite administrator.');
      }
    } catch (err) {
      setInviteError('Failed to invite admin. Connection error.');
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
      <div className="border border-hairline bg-navy/40 p-8 relative">
        <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
        
        <h3 className="font-sans font-bold text-lg text-offwhite mb-4 border-b border-hairline/60 pb-3">
          Invite New Administrator
        </h3>
        <p className="font-sans text-xs text-steelblue leading-relaxed mb-6">
          Input the email address of the team member. The system will register a pending record and transmit a secure activation link via email.
        </p>

        <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:max-w-md">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-navy/80 border border-hairline px-4 py-3.5 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent text-sm"
              placeholder="e.g. colleague@simuflux.com"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={inviteLoading}
            className="w-full sm:w-auto bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-xs px-6 py-4 border border-transparent transition-colors disabled:opacity-50 select-none"
          >
            {inviteLoading ? 'Inviting...' : 'Transmit Invite'}
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

        {/* Development Helper link */}
        {devInviteLink && (
          <div className="mt-4 p-4 border border-dashed border-accent/40 bg-accent/5 font-mono text-xs space-y-2 max-w-xl">
            <p className="text-accent font-bold">DEVELOPMENT NOTICE: Resend API Key is missing.</p>
            <p className="text-steelblue">Use the link below to finalize this account manually:</p>
            <a 
              href={devInviteLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-offwhite underline break-all hover:text-accent"
            >
              {devInviteLink}
            </a>
          </div>
        )}
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
            <div className="border border-hairline overflow-x-auto bg-navy/40">
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
                    <tr key={admin._id} className="hover:bg-white/[0.01] transition-all">
                      <td className="p-4 font-semibold text-offwhite">{admin.email}</td>
                      <td className="p-4">
                        {admin.isVerified ? (
                          <span className="font-mono text-2xs uppercase px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="font-mono text-2xs uppercase px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
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
