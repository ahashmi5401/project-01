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

      {/* Form Section - Premium Dark Design */}
      <div className="flex justify-center">
        <div className="w-full max-w-xl">
          <div className="bg-navy/80 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-hairline">
            {/* Header */}
            <div className="bg-gradient-to-r from-navy/60 to-navy/80 px-8 py-6 border-b border-hairline">
              <h3 className="font-sans font-semibold text-xl text-offwhite">
                {isEditing ? 'Edit Discount Tier' : 'Create New Discount Tier'}
              </h3>
              <p className="font-sans text-sm text-steelblue mt-1">
                Volume discount rules for bundle purchases
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="minCourses" className="block font-sans text-sm font-medium text-steelblue mb-2">
                    Minimum Courses <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-steelblue font-sans text-sm">+</span>
                    <input
                      id="minCourses"
                      type="number"
                      name="minCourses"
                      value={formFields.minCourses}
                      onChange={handleChange}
                      className="w-full bg-navy/50 border border-hairline rounded-lg pl-8 pr-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="2"
                      min="2"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="discountPercent" className="block font-sans text-sm font-medium text-steelblue mb-2">
                    Discount Percentage <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="discountPercent"
                      type="number"
                      name="discountPercent"
                      value={formFields.discountPercent}
                      onChange={handleChange}
                      className="w-full bg-navy/50 border border-hairline rounded-lg pl-4 pr-10 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="20"
                      min="1"
                      max="100"
                      step="any"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-steelblue font-sans text-sm">%</span>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-sans text-sm">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 font-sans text-sm">
                  {submitSuccess}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-offwhite font-sans font-medium px-8 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  {isEditing ? 'Save Changes' : 'Add Discount Tier'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-8 py-3 border border-hairline hover:bg-white/5 text-steelblue hover:text-offwhite font-sans font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Discount Tiers Cards */}
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
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/5 to-accent/5 rounded-lg opacity-30 blur-sm" />
            <div className="relative overflow-x-auto bg-navy/40 backdrop-blur-sm shadow-2xl shadow-black/20 p-4">
              <div className="flex gap-4 pb-2">
                {tiers.map((tier) => (
                  <div key={tier._id} className="flex-shrink-0 w-64 border border-hairline bg-navy/60 p-4 rounded-lg hover:border-accent/50 transition-all duration-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-accent text-sm">{tier.minCourses}+ Courses</span>
                        <span className="font-mono font-bold text-offwhite text-lg">{tier.discountPercent}%</span>
                      </div>
                      
                      <div className="text-steelblue text-xs">
                        Discount applies when users register for {tier.minCourses} or more courses
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t border-hairline/40">
                        <button
                          onClick={() => handleEditSelect(tier)}
                          className="flex-1 font-mono text-2xs uppercase tracking-wider text-accent border border-accent/30 hover:bg-accent/10 px-3 py-2 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tier._id, tier.minCourses)}
                          className="flex-1 font-mono text-2xs uppercase tracking-wider text-steelblue/60 hover:text-accent border border-hairline hover:border-accent/30 px-3 py-2 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
