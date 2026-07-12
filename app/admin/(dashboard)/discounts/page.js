'use client';

import React, { useState, useEffect } from 'react';

export default function ManageDiscountsPage() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null); // MongoDB _id
  const [formFields, setFormFields] = useState({
    minCourses: '',
    discountPercent: '',
  });

  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Load Discount Tiers
  const fetchTiers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/discounts');
      const data = await res.json();
      if (res.ok) {
        setTiers(data.tiers || []);
      } else {
        setError(data.error || 'Failed to load discount tiers.');
      }
    } catch (err) {
      setError('Network error. Failed to connect to API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  // Form Field Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  // Select Tier for Editing
  const handleEditSelect = (tier) => {
    setIsEditing(true);
    setEditingId(tier._id);
    setFormFields({
      minCourses: tier.minCourses,
      discountPercent: tier.discountPercent,
    });
    setSubmitError(null);
    setSubmitSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Edit Form
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormFields({ minCourses: '', discountPercent: '' });
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  // Delete Tier Handler
  const handleDelete = async (id, minCourses) => {
    if (!confirm(`Are you sure you want to delete the discount tier for ${minCourses}+ courses?`)) return;

    try {
      const res = await fetch(`/api/discounts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        fetchTiers();
        setSubmitSuccess('Discount tier deleted successfully.');
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        alert(data.error || 'Failed to delete tier.');
      }
    } catch (err) {
      alert('Failed to delete tier. Connection error.');
    }
  };

  // Submit Form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const minCoursesVal = parseInt(formFields.minCourses, 10);
    const discountPercentVal = parseFloat(formFields.discountPercent);

    if (isNaN(minCoursesVal) || minCoursesVal < 2) {
      setSubmitError('Number of courses must be an integer greater than or equal to 2.');
      return;
    }
    if (isNaN(discountPercentVal) || discountPercentVal < 1 || discountPercentVal > 100) {
      setSubmitError('Discount percent must be a number between 1 and 100.');
      return;
    }

    const url = isEditing ? `/api/discounts/${editingId}` : '/api/discounts';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minCourses: minCoursesVal,
          discountPercent: discountPercentVal,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitSuccess(isEditing ? 'Discount tier updated successfully!' : 'Discount tier created successfully!');
        handleCancelEdit();
        fetchTiers();
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        setSubmitError(data.error || 'Operation failed.');
      }
    } catch (err) {
      setSubmitError('Failed to execute database query. Connection error.');
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-hairline pb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
            [ VOLUME DISCOUNT RULES ]
          </span>
          <h1 className="font-sans font-bold text-3xl text-offwhite uppercase tracking-tight">
            Manage Discounts
          </h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="border border-hairline bg-navy/40 p-8 relative">
        <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
        
        <h3 className="font-sans font-bold text-lg text-offwhite mb-6 border-b border-hairline/60 pb-3">
          {isEditing ? 'Edit Discount Tier Details' : 'Create New Discount Tier'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minCourses" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Minimum Courses Selected *
              </label>
              <input
                id="minCourses"
                type="number"
                name="minCourses"
                value={formFields.minCourses}
                onChange={handleChange}
                className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent"
                placeholder="e.g. 2"
                min="2"
                required
              />
            </div>
            
            <div>
              <label htmlFor="discountPercent" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Discount Percentage (%) *
              </label>
              <input
                id="discountPercent"
                type="number"
                name="discountPercent"
                value={formFields.discountPercent}
                onChange={handleChange}
                className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent"
                placeholder="e.g. 20"
                min="1"
                max="100"
                step="any"
                required
              />
            </div>
          </div>

          {submitError && (
            <div className="p-3 border border-accent bg-accent/5 text-offwhite font-mono text-xs">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 border border-white/10 bg-white/5 text-green-400 font-mono text-xs">
              {submitSuccess}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-xs px-6 py-3 border border-transparent transition-colors"
            >
              {isEditing ? 'Save Discount Tier' : 'Add Discount Tier'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="border border-hairline hover:bg-white/5 text-steelblue hover:text-offwhite font-mono uppercase tracking-wider text-xs px-6 py-3 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tiers Table */}
      <div className="space-y-6">
        <h3 className="font-sans font-bold text-lg text-offwhite border-b border-hairline/60 pb-3">
          Discount Tiers Configuration
        </h3>

        {loading ? (
          <div className="py-10 text-center font-mono text-xs text-steelblue animate-pulse">
            LOADING LIVE CONFIGURATION...
          </div>
        ) : tiers.length === 0 ? (
          <div className="border border-dashed border-white/10 p-12 text-center text-steelblue font-mono text-xs">
            NO DISCOUNT TIERS CONFIGURED. BUNDLE DISCOUNTS WILL NOT BE CALCULATED.
          </div>
        ) : (
          <div className="border border-hairline overflow-x-auto bg-navy/40">
            <table className="w-full text-left font-sans text-sm border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-white/5 font-mono text-xs uppercase tracking-wider text-steelblue">
                  <th className="p-4 w-40">Minimum Courses</th>
                  <th className="p-4">Discount %</th>
                  <th className="p-4 w-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/60">
                {tiers.map((tier) => (
                  <tr key={tier._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="p-4 font-mono font-bold text-accent">{tier.minCourses} Courses</td>
                    <td className="p-4 font-semibold text-offwhite">{tier.discountPercent}% Off</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-3">
                        <button
                          onClick={() => handleEditSelect(tier)}
                          className="font-mono text-2xs uppercase tracking-wider text-accent border-b border-accent/20 hover:text-offwhite hover:border-offwhite transition-all pb-0.5"
                        >
                          Edit
                        </button>
                        <span className="text-steelblue/20">/</span>
                        <button
                          onClick={() => handleDelete(tier._id, tier.minCourses)}
                          className="font-mono text-2xs uppercase tracking-wider text-steelblue/60 hover:text-accent transition-all pb-0.5"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
