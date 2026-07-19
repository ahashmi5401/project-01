'use client';

import React, { useState, useEffect } from 'react';

export default function ManageDiscountsPage() {
  const [tiers, setTiers] = useState([]);
  const [comboDeals, setComboDeals] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State - Volume Tiers
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null); // MongoDB _id
  const [formFields, setFormFields] = useState({
    minCourses: '',
    discountPercent: '',
    expiryDate: '',
  });

  // Form State - Combo Deals
  const [isEditingCombo, setIsEditingCombo] = useState(false);
  const [editingComboId, setEditingComboId] = useState(null);
  const [comboFormFields, setComboFormFields] = useState({
    courseIds: [],
    discountPercent: '',
    label: '',
    expiryDate: '',
    title: '',
    description: '',
    image: '',
    duration: '',
    classesPerWeek: '',
    classHours: '',
  });
  const [uploadingComboImage, setUploadingComboImage] = useState(false);

  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Load Discount Tiers
  const fetchTiers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/discounts');
      const data = await res.json();
      if (res.ok) {
        const now = new Date();
        const activeTiers = (data.tiers || []).filter(tier => 
          !tier.expiryDate || new Date(tier.expiryDate) > now
        );
        setTiers(activeTiers);
      } else {
        setError(data.error || 'Failed to load discount tiers.');
      }
    } catch (err) {
      setError('Network error. Failed to connect to API.');
    } finally {
      setLoading(false);
    }
  };

  // Load Combo Deals and Courses
  const fetchComboData = async () => {
    try {
      const [comboRes, coursesRes] = await Promise.all([
        fetch('/api/combo-deals'),
        fetch('/api/courses')
      ]);
      
      const comboData = await comboRes.json();
      const coursesData = await coursesRes.json();
      
      if (comboRes.ok) {
        const now = new Date();
        const activeComboDeals = (comboData.comboDeals || []).filter(deal =>
          !deal.expiryDate || new Date(deal.expiryDate) > now
        );
        setComboDeals(activeComboDeals);
      }
      if (coursesRes.ok) {
        setCourses(coursesData.courses || []);
      }
    } catch (err) {
      console.error('Failed to load combo data:', err);
    }
  };

  // Combo Image Upload handler
  const handleComboImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    setUploadingComboImage(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'combo-deals');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setComboFormFields((prev) => ({ ...prev, image: data.url }));
      } else {
        setSubmitError(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      setSubmitError('Failed to upload image. Server unreachable.');
    } finally {
      setUploadingComboImage(false);
    }
  };

  useEffect(() => {
    fetchTiers();
    fetchComboData();
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
      expiryDate: tier.expiryDate ? tier.expiryDate.split('T')[0] : '',
    });
    setSubmitError(null);
    setSubmitSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Edit Form
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormFields({ minCourses: '', discountPercent: '', expiryDate: '' });
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

  // Combo Deal Handlers
  const handleCourseToggle = (courseId) => {
    setComboFormFields((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter(id => id !== courseId)
        : [...prev.courseIds, courseId]
    }));
  };

  const handleComboSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const discountPercentVal = parseFloat(comboFormFields.discountPercent);

    if (comboFormFields.courseIds.length === 0) {
      setSubmitError('At least one course must be selected.');
      return;
    }
    if (isNaN(discountPercentVal) || discountPercentVal < 1 || discountPercentVal > 100) {
      setSubmitError('Discount percent must be a number between 1 and 100.');
      return;
    }

    const url = isEditingCombo ? `/api/combo-deals/${editingComboId}` : '/api/combo-deals';
    const method = isEditingCombo ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseIds: comboFormFields.courseIds,
          discountPercent: discountPercentVal,
          label: comboFormFields.label || comboFormFields.title,
          expiryDate: comboFormFields.expiryDate || null,
          title: comboFormFields.title,
          description: comboFormFields.description,
          image: comboFormFields.image,
          duration: comboFormFields.duration,
          classesPerWeek: comboFormFields.classesPerWeek,
          classHours: comboFormFields.classHours,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitSuccess(isEditingCombo ? 'Combo deal updated successfully!' : 'Combo deal created successfully!');
        handleComboCancelEdit();
        fetchComboData();
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        setSubmitError(data.error || 'Operation failed.');
      }
    } catch (err) {
      setSubmitError('Failed to execute database query. Connection error.');
    }
  };

  const handleComboEditSelect = (deal) => {
    setIsEditingCombo(true);
    setEditingComboId(deal._id);
    
    // Handle both old deals (courseSlugs) and new deals (courseIds)
    const courseIds = deal.courseIds || [];
    const courseSlugs = deal.courseSlugs || [];
    
    // If we have courseSlugs but no courseIds, we need to convert
    let finalCourseIds = courseIds;
    if (courseIds.length === 0 && courseSlugs.length > 0) {
      // Convert slugs to IDs
      finalCourseIds = courseSlugs.map(slug => {
        const course = courses.find(c => c.slug === slug);
        return course ? course._id : null;
      }).filter(id => id !== null);
    }
    
    setComboFormFields({
      courseIds: finalCourseIds,
      discountPercent: deal.discountPercent.toString(),
      label: deal.label || '',
      expiryDate: deal.expiryDate ? deal.expiryDate.split('T')[0] : '',
      title: deal.title || deal.label || '',
      description: deal.description || '',
      image: deal.image || '',
      duration: deal.duration || '',
      classesPerWeek: deal.classesPerWeek || '',
      classHours: deal.classHours || '',
    });
    setSubmitError(null);
    setSubmitSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComboCancelEdit = () => {
    setIsEditingCombo(false);
    setEditingComboId(null);
    setComboFormFields({
      courseIds: [],
      discountPercent: '',
      label: '',
      expiryDate: '',
      title: '',
      description: '',
      image: '',
      duration: '',
      classesPerWeek: '',
      classHours: '',
    });
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleComboDelete = async (id, label) => {
    if (!confirm(`Are you sure you want to delete the combo deal: "${label || 'Unnamed Deal'}"?`)) return;

    try {
      const res = await fetch(`/api/combo-deals/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        fetchComboData();
        setSubmitSuccess('Combo deal deleted successfully.');
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        alert(data.error || 'Failed to delete combo deal.');
      }
    } catch (err) {
      alert('Failed to delete combo deal. Connection error.');
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
          expiryDate: formFields.expiryDate || null,
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
    <div className="space-y-4xl">
      {/* Header */}
      <div className="border-b border-hairline pb-2xl flex flex-col sm:flex-row sm:items-end sm:justify-between gap-lg">
        <div>
          <span className="font-mono text-label uppercase tracking-widest text-accent block mb-sm">
            [ VOLUME DISCOUNT RULES ]
          </span>
          <h1 className="font-sans font-bold text-h2 text-offwhite uppercase tracking-tight">
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

            <form onSubmit={handleSubmit} className="p-xl space-y-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label htmlFor="minCourses" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Minimum Courses <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-lg top-1/2 -translate-y-1/2 text-steelblue font-sans text-body">+</span>
                    <input
                      id="minCourses"
                      type="number"
                      name="minCourses"
                      value={formFields.minCourses}
                      onChange={handleChange}
                      className="w-full bg-navy/50 border border-hairline rounded pl-12 pr-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="2"
                      min="2"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="discountPercent" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Discount Percentage <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="discountPercent"
                      type="number"
                      name="discountPercent"
                      value={formFields.discountPercent}
                      onChange={handleChange}
                      className="w-full bg-navy/50 border border-hairline rounded pl-lg pr-12 py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="20"
                      min="1"
                      max="100"
                      step="any"
                      required
                    />
                    <span className="absolute right-lg top-1/2 -translate-y-1/2 text-steelblue font-sans text-body">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="expiryDate" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                  Expiry Date (Optional)
                </label>
                <input
                  id="expiryDate"
                  type="date"
                  name="expiryDate"
                  value={formFields.expiryDate}
                  onChange={handleChange}
                  className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
                <p className="font-mono text-caption text-steelblue mt-xs">
                  Leave empty for no expiry
                </p>
              </div>

              {submitError && (
                <div className="p-lg bg-red-500/10 border border-red-500/30 rounded text-red-400 font-mono text-label shadow-elevation-sm">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-lg bg-green-500/10 border border-green-500/30 rounded text-green-400 font-mono text-label shadow-elevation-sm">
                  {submitSuccess}
                </div>
              )}

              <div className="flex gap-lg pt-lg">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-offwhite font-mono uppercase tracking-wider text-label px-xl py-sm rounded transition-all shadow-elevation-sm hover:shadow-elevation-md"
                >
                  {isEditing ? 'Save Changes' : 'Add Discount Tier'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-xl py-sm border border-hairline hover:bg-white/5 text-steelblue hover:text-offwhite font-mono uppercase tracking-wider text-label rounded transition-colors shadow-elevation-sm hover:shadow-elevation-md"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Combo Deals Form Section */}
      <div className="flex justify-center mt-4xl">
        <div className="w-full max-w-xl">
          <div className="bg-navy/80 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-hairline">
            {/* Header */}
            <div className="bg-gradient-to-r from-navy/60 to-navy/80 px-8 py-6 border-b border-hairline">
              <h3 className="font-sans font-semibold text-xl text-offwhite">
                {isEditingCombo ? 'Edit Combo Deal' : 'Create New Combo Deal'}
              </h3>
              <p className="font-sans text-sm text-steelblue mt-1">
                Specific course combination discounts
              </p>
            </div>

            <form onSubmit={handleComboSubmit} className="p-xl space-y-lg">
              <div>
                <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                  Select Courses <span className="text-accent">*</span>
                </label>
                <div className="space-y-sm max-h-48 overflow-y-auto bg-navy/30 p-lg rounded border border-hairline">
                  {courses.length === 0 ? (
                    <p className="text-steelblue text-caption">No courses available</p>
                  ) : (
                    courses.map((course) => (
                      <label key={course._id} className="flex items-center gap-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={comboFormFields.courseIds.includes(course._id)}
                          onChange={() => handleCourseToggle(course._id)}
                          className="w-4 h-4 bg-navy/50 border border-hairline rounded accent-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                        <span className="font-sans text-body text-offwhite">{course.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label htmlFor="comboTitle" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Title <span className="text-accent">*</span>
                  </label>
                  <input
                    id="comboTitle"
                    type="text"
                    name="title"
                    value={comboFormFields.title}
                    onChange={(e) => setComboFormFields(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="ANSYS Fluent + Creo Bundle"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="comboLabel" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Label (Optional)
                  </label>
                  <input
                    id="comboLabel"
                    type="text"
                    name="label"
                    value={comboFormFields.label}
                    onChange={(e) => setComboFormFields(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="ANSYS CFD + Structural Combo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label htmlFor="comboDiscountPercent" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Discount Percentage <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="comboDiscountPercent"
                      type="number"
                      name="discountPercent"
                      value={comboFormFields.discountPercent}
                      onChange={(e) => setComboFormFields(prev => ({ ...prev, discountPercent: e.target.value }))}
                      className="w-full bg-navy/50 border border-hairline rounded pl-lg pr-12 py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="20"
                      min="1"
                      max="100"
                      step="any"
                      required
                    />
                    <span className="absolute right-lg top-1/2 -translate-y-1/2 text-steelblue font-sans text-body">%</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="comboDuration" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Course Duration <span className="text-accent">*</span>
                  </label>
                  <input
                    id="comboDuration"
                    type="text"
                    name="duration"
                    value={comboFormFields.duration}
                    onChange={(e) => setComboFormFields(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="8 Weeks"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label htmlFor="comboClassesPerWeek" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Classes Per Week <span className="text-accent">*</span>
                  </label>
                  <input
                    id="comboClassesPerWeek"
                    type="text"
                    name="classesPerWeek"
                    value={comboFormFields.classesPerWeek}
                    onChange={(e) => setComboFormFields(prev => ({ ...prev, classesPerWeek: e.target.value }))}
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="2 Classes"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="comboClassHours" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Classes Hours <span className="text-accent">*</span>
                  </label>
                  <input
                    id="comboClassHours"
                    type="text"
                    name="classHours"
                    value={comboFormFields.classHours}
                    onChange={(e) => setComboFormFields(prev => ({ ...prev, classHours: e.target.value }))}
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="1.5 Hours"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="comboDescription" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                  Description <span className="text-accent">*</span>
                </label>
                <textarea
                  id="comboDescription"
                  name="description"
                  value={comboFormFields.description}
                  onChange={(e) => setComboFormFields(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all min-h-[100px]"
                  placeholder="Detailed description of this bundle package..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label htmlFor="comboImage" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Image URL
                  </label>
                  <input
                    id="comboImage"
                    type="text"
                    name="image"
                    value={comboFormFields.image}
                    onChange={(e) => setComboFormFields(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="/images/combo-deals/simu-fluent.jpg"
                  />
                </div>

                <div>
                  <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Upload Card Image
                  </label>
                  <div className="flex gap-md">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleComboImageUpload}
                      className="hidden"
                      id="combo-file-upload"
                      disabled={uploadingComboImage}
                    />
                    <label
                      htmlFor="combo-file-upload"
                      className="flex-1 cursor-pointer border border-hairline hover:border-accent hover:bg-accent/5 font-sans text-label px-lg py-sm rounded transition-colors text-center text-steelblue hover:text-accent"
                    >
                      {uploadingComboImage ? 'Uploading...' : 'Choose File'}
                    </label>
                    {comboFormFields.image && (
                      <span className="flex items-center text-green-400 font-sans text-label">
                        ✓ Uploaded
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="comboExpiryDate" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                  Expiry Date (Optional)
                </label>
                <input
                  id="comboExpiryDate"
                  type="date"
                  name="expiryDate"
                  value={comboFormFields.expiryDate}
                  onChange={(e) => setComboFormFields(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
                <p className="font-mono text-caption text-steelblue mt-xs">
                  Leave empty for no expiry
                </p>
              </div>

              {submitError && (
                <div className="p-lg bg-red-500/10 border border-red-500/30 rounded text-red-400 font-mono text-label shadow-elevation-sm">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-lg bg-green-500/10 border border-green-500/30 rounded text-green-400 font-mono text-label shadow-elevation-sm">
                  {submitSuccess}
                </div>
              )}

              <div className="flex gap-lg pt-lg">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-offwhite font-mono uppercase tracking-wider text-label px-xl py-sm rounded transition-all shadow-elevation-sm hover:shadow-elevation-md"
                >
                  {isEditingCombo ? 'Save Changes' : 'Add Combo Deal'}
                </button>
                {isEditingCombo && (
                  <button
                    type="button"
                    onClick={handleComboCancelEdit}
                    className="px-xl py-sm border border-hairline hover:bg-white/5 text-steelblue hover:text-offwhite font-mono uppercase tracking-wider text-label rounded transition-colors shadow-elevation-sm hover:shadow-elevation-md"
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
      <div className="space-y-xl">
        <h3 className="font-sans font-bold text-h3 text-offwhite border-b border-hairline/60 pb-md">
          Discount Tiers Configuration
        </h3>

        {loading ? (
          <div className="py-4xl text-center font-mono text-label text-steelblue animate-pulse">
            LOADING LIVE CONFIGURATION...
          </div>
        ) : tiers.length === 0 ? (
          <div className="border border-dashed border-hairline/60 bg-gradient-to-b from-navy/40 to-navy/60 p-4xl text-center text-steelblue/70 font-mono text-label rounded-xl shadow-elevation-sm">
            NO DISCOUNT TIERS CONFIGURED. BUNDLE DISCOUNTS WILL NOT BE CALCULATED.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/5 to-accent/5 rounded-lg opacity-30 blur-sm" />
            <div className="relative overflow-x-auto bg-navy/40 backdrop-blur-sm shadow-elevation-sm p-lg rounded-lg">
              <div className="flex gap-lg pb-sm min-w-max">
                {tiers.map((tier) => (
                  <div key={tier._id} className="flex-shrink-0 w-72 border border-hairline bg-navy/60 shadow-elevation-sm hover:shadow-elevation-md hover:border-accent/50 rounded-lg transition-all duration-200">
                    <div className="p-lg flex flex-col h-full">
                      <div className="flex items-center justify-between mb-md">
                        <span className="font-mono font-bold text-accent text-h3">{tier.minCourses}+ Courses</span>
                        <span className="font-mono font-bold text-offwhite text-h1">{tier.discountPercent}%</span>
                      </div>
                      
                      <p className="text-steelblue text-caption leading-relaxed mb-lg">
                        Discount applies when users register for {tier.minCourses} or more courses
                      </p>
                      
                      <div className="flex gap-sm pt-sm border-t border-hairline/40 mt-auto">
                        <button
                          onClick={() => handleEditSelect(tier)}
                          className="flex-1 font-mono text-label uppercase tracking-wider text-accent border border-accent/30 hover:bg-accent/10 px-sm py-xs rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tier._id, tier.minCourses)}
                          className="flex-1 font-mono text-label uppercase tracking-wider text-steelblue/60 hover:text-accent border border-hairline hover:border-accent/30 px-sm py-xs rounded transition-colors"
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

      {/* Combo Deals Cards */}
      <div className="space-y-xl mt-4xl">
        <h3 className="font-sans font-bold text-h3 text-offwhite border-b border-hairline/60 pb-md">
          Combo Deals Configuration
        </h3>

        {comboDeals.length === 0 ? (
          <div className="border border-dashed border-hairline/60 bg-gradient-to-b from-navy/40 to-navy/60 p-4xl text-center text-steelblue/70 font-mono text-label rounded-xl shadow-elevation-sm">
            NO COMBO DEALS CONFIGURED.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/5 to-accent/5 rounded-lg opacity-30 blur-sm" />
            <div className="relative overflow-x-auto bg-navy/40 backdrop-blur-sm shadow-elevation-sm p-lg rounded-lg">
              <div className="flex gap-lg pb-sm min-w-max">
                {comboDeals.map((deal) => (
                  <div key={deal._id} className="flex-shrink-0 w-80 border border-hairline bg-navy/60 shadow-elevation-sm hover:shadow-elevation-md hover:border-accent/50 rounded-lg transition-all duration-200">
                    <div className="p-lg flex flex-col h-full">
                      {deal.image && (
                        <div className="aspect-video w-full mb-md overflow-hidden rounded border border-hairline/40 bg-navy/80">
                          <img src={deal.image} alt={deal.title || deal.label} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-md">
                        <span className="font-mono font-bold text-accent text-h3">{deal.discountPercent}% OFF</span>
                        <span className="font-mono text-offwhite text-sm">{deal.courseIds?.length || deal.courseSlugs?.length || 0} Course{(deal.courseIds?.length || deal.courseSlugs?.length || 0) > 1 ? 's' : ''}</span>
                      </div>
                      
                      <p className="text-offwhite font-sans text-body leading-relaxed mb-xs font-semibold">
                        {deal.title || deal.label}
                      </p>
                      
                      {(deal.duration || deal.classesPerWeek) && (
                        <p className="text-steelblue font-sans text-caption leading-relaxed mb-sm font-medium">
                          {deal.duration || '8 Weeks'} | {deal.classesPerWeek || '2 classes/wk'}
                        </p>
                      )}

                      <div className="text-steelblue/75 text-caption leading-relaxed mb-lg line-clamp-2">
                        {deal.courseIds ? deal.courseIds.map(courseId => {
                          const course = courses.find(c => c._id === courseId);
                          return course ? course.title : courseId;
                        }).join(' + ') : deal.courseSlugs?.map(slug => {
                          const course = courses.find(c => c.slug === slug);
                          return course ? course.title : slug;
                        }).join(' + ')}
                      </div>
                      
                      <div className="flex gap-sm pt-sm border-t border-hairline/40 mt-auto">
                        <button
                          onClick={() => handleComboEditSelect(deal)}
                          className="flex-1 font-mono text-label uppercase tracking-wider text-accent border border-accent/30 hover:bg-accent/10 px-sm py-xs rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleComboDelete(deal._id, deal.label)}
                          className="flex-1 font-mono text-label uppercase tracking-wider text-steelblue/60 hover:text-accent border border-hairline hover:border-accent/30 px-sm py-xs rounded transition-colors"
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
