'use client';

import React, { useState, useEffect, useMemo } from 'react';

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter courses based on search query (memoized for performance)
  const filteredCourses = useMemo(() => 
    courses.filter(course => 
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.id?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [courses, searchQuery]);

  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = useMemo(() => 
    filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [filteredCourses, startIndex]
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredCourses.length, totalPages, currentPage]);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null); // MongoDB _id
  const [formFields, setFormFields] = useState({
    id: '', // Course numeric ID (e.g. 01)
    title: '',
    description: '',
    image: '',
    price: '',
    discountPercent: '',
    points: [''], // Points array initialized with one empty field
    curriculum: '',
    duration: { totalDuration: '', classesPerWeek: '', classDurationHours: '' },
    features: [],
    targetAudience: '',
    instructor: { name: '', experienceYears: '', qualification: '', trainerSince: '', contact: '' }
  });

  // Import Mode State
  const [importMode, setImportMode] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [importError, setImportError] = useState(null);
  const [showImportWarning, setShowImportWarning] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  
  // Toast notifications for link copying
  const [toast, setToast] = useState(null);
  const [registrationLinks, setRegistrationLinks] = useState({});
  const [generatingLink, setGeneratingLink] = useState(null);
  // negotiatedPrices: maps courseSlug -> string value from the admin input
  const [negotiatedPrices, setNegotiatedPrices] = useState({});

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleGenerateLink = async (course) => {
    const slug = course.slug;
    setGeneratingLink(slug);
    try {
      const body = { courseSlug: slug };
      // If course has no fixed price, pass the admin-entered negotiated price
      if (course.price === null) {
        const agreed = negotiatedPrices[slug];
        if (!agreed || isNaN(Number(agreed)) || Number(agreed) < 0) {
          setToast('Enter the agreed price before generating a link.');
          setGeneratingLink(null);
          return;
        }
        body.negotiatedPrice = Number(agreed);
      }
      const res = await fetch('/api/registration-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
        const fullUrl = `${siteUrl}${data.registrationUrl}`;
        await navigator.clipboard.writeText(fullUrl);
        setToast('Registration link copied!');
        // Refresh links for this course
        fetchRegistrationLinks(slug);
      } else {
        setToast(data.error || 'Failed to generate link.');
      }
    } catch (err) {
      setToast('Failed to generate link.');
    } finally {
      setGeneratingLink(null);
    }
  };

  const fetchRegistrationLinks = async (slug) => {
    try {
      const res = await fetch(`/api/registration-links?courseSlug=${slug}`);
      const data = await res.json();
      if (res.ok) {
        setRegistrationLinks(prev => ({ ...prev, [slug]: data.links }));
      }
    } catch (err) {
      console.error('Failed to fetch registration links:', err);
    }
  };

  const handleCopyLink = (slug) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const registerUrl = `${siteUrl}/register/${slug}`;
    
    navigator.clipboard.writeText(registerUrl)
      .then(() => {
        setToast('Link copied!');
      })
      .catch(() => {
        setToast('Failed to copy link.');
      });
  };

  // Load Courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
      } else {
        setError(data.error || 'Failed to load courses.');
      }
    } catch (err) {
      setError('Network error. Failed to connect to API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch registration links when courses are loaded
  useEffect(() => {
    if (courses.length > 0) {
      courses.forEach(course => {
        fetchRegistrationLinks(course.slug);
      });
    }
  }, [courses]);

  // Form Field Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handlePointChange = (index, value) => {
    setFormFields((prev) => {
      const newPoints = [...prev.points];
      newPoints[index] = value;
      return { ...prev, points: newPoints };
    });
  };

  const addPointField = () => {
    setFormFields((prev) => ({
      ...prev,
      points: [...prev.points, ''],
    }));
  };

  const removePointField = (index) => {
    setFormFields((prev) => {
      const newPoints = prev.points.filter((_, i) => i !== index);
      return { ...prev, points: newPoints.length > 0 ? newPoints : [''] };
    });
  };

  // Image Upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    setUploadingImage(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'courses');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setFormFields((prev) => ({ ...prev, image: data.url }));
      } else {
        setSubmitError(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      setSubmitError('Failed to upload image. Server unreachable.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Document Upload handler
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isEditing && !showImportWarning) {
      setShowImportWarning(true);
      return;
    }

    setUploadingDocument(true);
    setImportError(null);
    setImportSummary(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/import-course-document', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        // Populate form fields with extracted data
        setFormFields((prev) => ({
          ...prev,
          title: data.extractedData.title || prev.title,
          description: data.extractedData.description || prev.description,
          price: data.extractedData.price > 0 ? data.extractedData.price.toString() : prev.price,
          points: data.extractedData.points.length > 0 ? data.extractedData.points : prev.points,
          curriculum: data.extractedData.curriculum.join('\n'),
          duration: {
            totalDuration: data.extractedData.duration.totalDuration,
            classesPerWeek: data.extractedData.duration.classesPerWeek.toString(),
            classDurationHours: data.extractedData.duration.classDurationHours.toString()
          },
          features: data.extractedData.features,
          targetAudience: data.extractedData.targetAudience,
          instructor: data.extractedData.instructor
        }));
        setImportSummary(data.summary);
        setShowImportWarning(false);
      } else {
        setImportError(data.error || 'Failed to import document.');
        setShowImportWarning(false);
      }
    } catch (err) {
      setImportError('Failed to import document. Server unreachable.');
      setShowImportWarning(false);
    } finally {
      setUploadingDocument(false);
    }
  };

  // Feature toggle handler
  const handleFeatureToggle = (feature) => {
    setFormFields((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  // Instructor field handler
  const handleInstructorChange = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      instructor: { ...prev.instructor, [field]: value }
    }));
  };

  // Duration field handler
  const handleDurationChange = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      duration: { ...prev.duration, [field]: value }
    }));
  };

  // Select Course for Editing
  const handleEditSelect = (course) => {
    setIsEditing(true);
    setEditingId(course._id);
    setFormFields({
      id: course.id || '',
      title: course.title || '',
      description: course.description || '',
      image: course.image || '',
      price: course.price === null ? '' : course.price,
      discountPercent: course.discountPercent !== undefined ? course.discountPercent : '',
      points: Array.isArray(course.points) && course.points.length > 0 ? course.points : [''],
      curriculum: Array.isArray(course.curriculum) ? course.curriculum.join('\n') : '',
      duration: course.duration || { totalDuration: '', classesPerWeek: '', classDurationHours: '' },
      features: Array.isArray(course.features) ? course.features : [],
      targetAudience: course.targetAudience || '',
      instructor: course.instructor || { name: '', experienceYears: '', qualification: '', trainerSince: '', contact: '' }
    });
    setSubmitError(null);
    setSubmitSuccess(null);
    setImportSummary(null);
    setImportError(null);
    setImportMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Edit Form
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormFields({
      id: '',
      title: '',
      description: '',
      image: '',
      price: '',
      discountPercent: '',
      points: [''],
      curriculum: '',
      duration: { totalDuration: '', classesPerWeek: '', classDurationHours: '' },
      features: [],
      targetAudience: '',
      instructor: { name: '', experienceYears: '', qualification: '', trainerSince: '', contact: '' }
    });
    setSubmitError(null);
    setSubmitSuccess(null);
    setImportSummary(null);
    setImportError(null);
    setImportMode(false);
  };

  // Delete Course Handler
  const handleDelete = async (id, title) => {
    if (!confirm(`Are you absolutely sure you want to delete the course: "${title}"?`)) return;

    if (!id) {
      alert('Course ID is missing. Cannot delete.');
      return;
    }

    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        fetchCourses();
        setSubmitSuccess('Course deleted successfully.');
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        console.error('[FRONTEND] Delete failed:', data.error);
        alert(data.error || 'Failed to delete course.');
      }
    } catch (err) {
      console.error('[FRONTEND] Delete error:', err);
      alert('Failed to delete course. Connection error.');
    }
  };

  // Submit Form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!formFields.title.trim() || !formFields.description.trim()) {
      setSubmitError('Title and description fields are required.');
      return;
    }

    // Prepare form data for submission
    const submitData = {
      ...formFields,
      discountPercent: formFields.discountPercent ? parseFloat(formFields.discountPercent) : 0,
      curriculum: formFields.curriculum.split('\n').map(c => c.trim()).filter(Boolean),
      duration: {
        totalDuration: formFields.duration.totalDuration,
        classesPerWeek: parseInt(formFields.duration.classesPerWeek, 10) || 0,
        classDurationHours: parseInt(formFields.duration.classDurationHours, 10) || 0
      }
    };

    const url = isEditing ? `/api/courses/${editingId}` : '/api/courses';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitSuccess(isEditing ? 'Course updated successfully!' : 'Course created successfully!');
        handleCancelEdit();
        fetchCourses();
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        console.error('[FRONTEND] Submit failed:', data.error);
        setSubmitError(data.error || 'Operation failed.');
      }
    } catch (err) {
      console.error('[FRONTEND] Submit error:', err);
      setSubmitError('Failed to execute database query. Connection error.');
    }
  };

  return (
    <div className="space-y-4xl">
      {/* Header */}
      <div className="border-b border-hairline pb-2xl flex flex-col sm:flex-row sm:items-end sm:justify-between gap-lg">
        <div>
          <span className="font-mono text-label uppercase tracking-widest text-accent block mb-sm">
            [ PROFESSIONAL CURRICULUM ]
          </span>
          <h1 className="font-sans font-bold text-h2 text-offwhite uppercase tracking-tight">
            Manage Courses
          </h1>
        </div>
        <button
          onClick={() => window.location.href = '/api/admin/course-template'}
          className="font-mono text-label uppercase tracking-wider text-accent border border-accent/30 hover:bg-accent/10 px-lg py-sm rounded transition-colors shadow-elevation-sm hover:shadow-elevation-md"
        >
          Download Document Template
        </button>
      </div>

      {/* Form Section - Premium Dark Design */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-navy/80 backdrop-blur-sm rounded-xl shadow-elevation-sm overflow-hidden border border-hairline">
            {/* Header */}
            <div className="bg-gradient-to-r from-navy/60 to-navy/80 px-xl py-lg border-b border-hairline">
              <h3 className="font-sans font-semibold text-h3 text-offwhite">
                {isEditing ? 'Edit Course Details' : 'Create New Training Course'}
              </h3>
              {isEditing && (
                <p className="font-sans text-caption text-steelblue mt-sm">
                  Reference ID: {formFields.id || 'N/A'}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-xl space-y-4xl">
              {/* Manual/Import Toggle */}
              <div className="flex gap-sm mb-xl">
                <button
                  type="button"
                  onClick={() => { setImportMode(false); setImportSummary(null); setImportError(null); }}
                  className={`flex-1 py-sm font-mono text-label uppercase tracking-wider rounded transition-colors ${!importMode ? 'bg-accent text-offwhite' : 'bg-navy/50 text-steelblue border border-hairline hover:border-accent hover:text-accent'}`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => { setImportMode(true); setImportSummary(null); setImportError(null); }}
                  className={`flex-1 py-sm font-mono text-label uppercase tracking-wider rounded transition-colors ${importMode ? 'bg-accent text-offwhite' : 'bg-navy/50 text-steelblue border border-hairline hover:border-accent hover:text-accent'}`}
                >
                  Import from Document
                </button>
              </div>

              {/* Import Mode - Document Upload */}
              {importMode && (
                <div className="space-y-xl mb-xl">
                  <div className="border-b border-hairline/60 pb-md">
                    <span className="font-mono text-label uppercase tracking-wider text-accent">
                      [ DOCUMENT IMPORT ]
                    </span>
                  </div>
                  <div>
                    <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Upload .docx File
                    </label>
                    <div className="flex gap-md">
                      <input
                        type="file"
                        accept=".docx"
                        onChange={handleDocumentUpload}
                        className="hidden"
                        id="document-upload"
                        disabled={uploadingDocument}
                      />
                      <label
                        htmlFor="document-upload"
                        className="flex-1 cursor-pointer border border-hairline hover:border-accent hover:bg-accent/5 font-sans text-label px-lg py-sm rounded transition-colors text-center text-steelblue hover:text-accent"
                      >
                        {uploadingDocument ? 'Processing...' : 'Choose .docx File'}
                      </label>
                    </div>
                    {importSummary && (
                      <div className="mt-sm p-lg bg-green-500/10 border border-green-500/30 rounded text-green-400 font-sans text-caption">
                        {importSummary}
                      </div>
                    )}
                    {importError && (
                      <div className="mt-sm p-lg bg-red-500/10 border border-red-500/30 rounded text-red-400 font-sans text-caption">
                        {importError}
                      </div>
                    )}
                    {showImportWarning && (
                      <div className="mt-sm p-lg bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 font-sans text-caption">
                        Importing will overwrite the current data in matched fields. Continue?
                        <div className="flex gap-sm mt-sm">
                          <button
                            type="button"
                            onClick={() => setShowImportWarning(false)}
                            className="px-lg py-sm border border-hairline hover:bg-white/5 text-steelblue hover:text-offwhite font-sans font-medium rounded transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowImportWarning(false);
                              document.getElementById('document-upload').click();
                            }}
                            className="px-lg py-sm bg-accent hover:bg-accent/90 text-offwhite font-sans font-medium rounded transition-colors"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Basic Info Section */}
              <div className="space-y-xl">
                <div className="border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label uppercase tracking-wider text-accent">
                    [ BASIC INFORMATION ]
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  <div>
                    <label htmlFor="id" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Course Ref ID
                    </label>
                    <input
                      id="id"
                      type="text"
                      name="id"
                      value={formFields.id}
                      onChange={handleChange}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="03"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Course Title <span className="text-accent">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formFields.title}
                      onChange={handleChange}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="ANSYS Fluent CFD Essentials"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Course Description <span className="text-accent">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formFields.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                    placeholder="Provide a comprehensive course description..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Course Price (PKR) (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-lg top-1/2 -translate-y-1/2 text-steelblue font-sans text-body">PKR</span>
                    <input
                      id="price"
                      type="number"
                      name="price"
                      value={formFields.price}
                      onChange={handleChange}
                      className="w-full bg-navy/50 border border-hairline rounded pl-16 pr-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="15000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="discountPercent" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Discount % (Optional)
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
                      min="0"
                      max="100"
                      step="any"
                    />
                    <span className="absolute right-lg top-1/2 -translate-y-1/2 text-steelblue font-sans text-body">%</span>
                  </div>
                </div>
              </div>

              {/* Features Section (Points) */}
              <div className="space-y-xl">
                <div className="border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label uppercase tracking-wider text-accent">
                    [ COURSE HIGHLIGHTS ]
                  </span>
                </div>
                <div className="space-y-md">
                  {formFields.points.map((point, index) => (
                    <div key={index} className="flex gap-md items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handlePointChange(index, e.target.value)}
                          className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                          placeholder={`Highlight ${index + 1}`}
                        />
                      </div>
                      {formFields.points.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePointField(index)}
                          className="px-lg py-sm text-steelblue hover:text-accent hover:bg-accent/10 rounded transition-colors font-mono text-label uppercase tracking-wider"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPointField}
                    className="w-full py-sm border-2 border-dashed border-hairline hover:border-accent text-steelblue hover:text-accent rounded transition-colors font-mono text-label uppercase tracking-wider"
                  >
                    + Add Highlight
                  </button>
                </div>
              </div>

              {/* Curriculum Section */}
              <div className="space-y-xl">
                <div className="border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label uppercase tracking-wider text-accent">
                    [ COURSE CURRICULUM ]
                  </span>
                </div>
                <div>
                  <label htmlFor="curriculum" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Course Outline (one topic per line)
                  </label>
                  <textarea
                    id="curriculum"
                    name="curriculum"
                    value={formFields.curriculum}
                    onChange={handleChange}
                    rows="6"
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                    placeholder="Design Modeler / Geometry Preparation&#10;Meshing&#10;Material Modeling"
                  />
                </div>
              </div>

              {/* Duration Section */}
              <div className="space-y-xl">
                <div className="border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label uppercase tracking-wider text-accent">
                    [ COURSE DURATION ]
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  <div>
                    <label htmlFor="totalDuration" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Total Duration
                    </label>
                    <input
                      id="totalDuration"
                      type="text"
                      name="totalDuration"
                      value={formFields.duration.totalDuration}
                      onChange={(e) => handleDurationChange('totalDuration', e.target.value)}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="8 Weeks"
                    />
                  </div>
                  <div>
                    <label htmlFor="classesPerWeek" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Classes Per Week
                    </label>
                    <input
                      id="classesPerWeek"
                      type="number"
                      name="classesPerWeek"
                      value={formFields.duration.classesPerWeek}
                      onChange={(e) => handleDurationChange('classesPerWeek', e.target.value)}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label htmlFor="classDurationHours" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Class Duration (Hours)
                    </label>
                    <input
                      id="classDurationHours"
                      type="number"
                      name="classDurationHours"
                      value={formFields.duration.classDurationHours}
                      onChange={(e) => handleDurationChange('classDurationHours', e.target.value)}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="2"
                    />
                  </div>
                </div>
              </div>

              {/* Features Checklist Section */}
              <div className="space-y-xl">
                <div className="border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label uppercase tracking-wider text-accent">
                    [ COURSE FEATURES ]
                  </span>
                </div>
                <div className="space-y-sm">
                  {[
                    "Live Interactive Online Classes",
                    "Recorded Tutorials",
                    "Hands-on Practical Training",
                    "Project-Based Learning",
                    "Assignments & Practice Exercises",
                    "Certificate of Completion"
                  ].map((feature) => (
                    <label key={feature} className="flex items-center gap-md cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFields.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="w-4 h-4 bg-navy/50 border border-hairline rounded accent-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      />
                      <span className="font-sans text-body text-offwhite">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Audience Section */}
              <div className="space-y-xl">
                <div className="border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label uppercase tracking-wider text-accent">
                    [ TARGET AUDIENCE ]
                  </span>
                </div>
                <div>
                  <label htmlFor="targetAudience" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Who This Course Is For
                  </label>
                  <textarea
                    id="targetAudience"
                    name="targetAudience"
                    value={formFields.targetAudience}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                    placeholder="Suitable for Beginners & Professionals – No prior experience required"
                  />
                </div>
              </div>

              {/* Instructor Section */}
              <div className="space-y-xl">
                <div className="border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label uppercase tracking-wider text-accent">
                    [ INSTRUCTOR PROFILE ]
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div>
                    <label htmlFor="instructorName" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Trainer Name
                    </label>
                    <input
                      id="instructorName"
                      type="text"
                      value={formFields.instructor.name}
                      onChange={(e) => handleInstructorChange('name', e.target.value)}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="experienceYears" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Experience
                    </label>
                    <input
                      id="experienceYears"
                      type="text"
                      value={formFields.instructor.experienceYears}
                      onChange={(e) => handleInstructorChange('experienceYears', e.target.value)}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="10+ years"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="qualification" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Qualification
                    </label>
                    <textarea
                      id="qualification"
                      value={formFields.instructor.qualification}
                      onChange={(e) => handleInstructorChange('qualification', e.target.value)}
                      rows="3"
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                      placeholder="M.S. Mechanical Engineering&#10;Certified ANSYS Expert"
                    />
                  </div>
                  <div>
                    <label htmlFor="trainerSince" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Trainer Since
                    </label>
                    <input
                      id="trainerSince"
                      type="text"
                      value={formFields.instructor.trainerSince}
                      onChange={(e) => handleInstructorChange('trainerSince', e.target.value)}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="2015"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Contact
                    </label>
                    <input
                      id="contact"
                      type="text"
                      value={formFields.instructor.contact}
                      onChange={(e) => handleInstructorChange('contact', e.target.value)}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="trainer@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-xl">
                <div className="border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label uppercase tracking-wider text-accent">
                    [ COURSE MEDIA ]
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div>
                    <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Image URL
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={formFields.image}
                      onChange={handleChange}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="/images/courses/ansys-fluent.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Upload Image
                    </label>
                    <div className="flex gap-md">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="course-file-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="course-file-upload"
                        className="flex-1 cursor-pointer border border-hairline hover:border-accent hover:bg-accent/5 font-sans text-label px-lg py-sm rounded transition-colors text-center text-steelblue hover:text-accent"
                      >
                        {uploadingImage ? 'Uploading...' : 'Choose File'}
                      </label>
                      {formFields.image && (
                        <span className="flex items-center text-green-400 font-sans text-label">
                          ✓ Uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {formFields.image && (
                  <div className="border border-hairline/40 bg-navy/30 p-lg rounded-lg">
                    <span className="font-mono text-caption uppercase tracking-wider text-steelblue block mb-sm">
                      [ IMAGE PREVIEW ]
                    </span>
                    <img
                      src={formFields.image}
                      alt="Course preview"
                      className="w-full h-48 object-cover rounded border border-hairline/40"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span class="text-steelblue/40 font-sans text-caption">Image failed to load</span>';
                      }}
                    />
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-lg bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-sans text-caption shadow-elevation-sm">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-lg bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 font-sans text-caption shadow-elevation-sm">
                  {submitSuccess}
                </div>
              )}

              <div className="flex gap-lg pt-lg">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-offwhite font-sans font-medium px-xl py-sm rounded-lg transition-all shadow-elevation-sm hover:shadow-elevation-md"
                >
                  {isEditing ? 'Save Changes' : 'Create Course'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-xl py-sm border border-hairline hover:bg-white/5 text-steelblue hover:text-offwhite font-sans font-medium rounded-lg transition-colors shadow-elevation-sm hover:shadow-elevation-md"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Courses Cards */}
      <div className="space-y-xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-lg border-b border-hairline/60 pb-md">
          <h3 className="font-sans font-bold text-h3 text-offwhite">
            Live Courses Database
          </h3>
          <div className="w-full sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search courses..."
              className="w-full bg-navy/80 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-caption transition-all rounded shadow-elevation-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-4xl text-center font-mono text-label text-steelblue animate-pulse">
            LOADING LIVE DATA SHEET...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="border border-dashed border-hairline/60 bg-gradient-to-b from-navy/40 to-navy/60 p-4xl text-center text-steelblue/70 font-mono text-label rounded-xl shadow-elevation-sm">
            {searchQuery ? 'No courses match your search.' : 'NO COURSES DEFINED IN DATABASE.'}
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/5 to-accent/5 rounded-lg opacity-30 blur-sm" />
              <div className="relative overflow-x-auto bg-navy/40 backdrop-blur-sm shadow-elevation-md p-lg">
                <div className="flex gap-lg pb-sm min-w-max">
                  {paginatedCourses.map((course) => (
                    <div key={course._id} className="flex-shrink-0 w-80 border border-hairline/60 bg-gradient-to-b from-navy/60 to-navy/80 shadow-elevation-sm hover:shadow-elevation-lg hover:border-accent/40 rounded-xl transition-all duration-500 overflow-hidden group">
                      <div className="flex flex-col h-full">
                        {/* Image Thumbnail at Top */}
                        {course.image ? (
                          <div className="relative w-full h-40 bg-navy/40 overflow-hidden border-b border-hairline/40">
                            <img
                              src={course.image}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                e.target.parentElement.innerHTML = '<span class="text-steelblue/40 font-mono text-xs">No Image</span>';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-navy/50 border-b border-hairline flex items-center justify-center">
                            <span className="text-steelblue/40 font-mono text-xs">No Image</span>
                          </div>
                        )}

                        {/* Card Content */}
                        <div className="p-lg flex flex-col flex-grow h-full">
                          <div className="flex items-center justify-between mb-sm">
                            <span className="font-mono font-bold text-accent/90 text-sm">REF: {course.id}</span>
                            <div className="text-right">
                              {course.price !== null && course.price > 0 ? (
                                <>
                                  {course.discountPercent && course.discountPercent > 0 ? (
                                    <>
                                      <span className="font-mono text-steelblue/50 line-through block text-xs">
                                        PKR {course.price.toLocaleString()}
                                      </span>
                                      <span className="font-mono text-accent font-bold text-sm">
                                        PKR {Math.round(course.price * (1 - course.discountPercent / 100)).toLocaleString()}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-mono text-offwhite text-sm">PKR {course.price.toLocaleString()}</span>
                                  )}
                                </>
                              ) : course.price === 0 ? (
                                <span className="font-mono text-offwhite text-sm">Free</span>
                              ) : (
                                <span className="font-mono text-accent font-bold text-sm">Price Inquiry</span>
                              )}
                            </div>
                          </div>
                          
                          <h4 className="font-semibold text-offwhite text-h3 leading-tight mb-sm group-hover:text-accent/90 transition-colors">{course.title}</h4>
                          
                          <p className="text-steelblue/80 text-caption leading-relaxed line-clamp-2 mb-sm">{course.description}</p>
                          
                          <div className="flex gap-sm pt-sm border-t border-hairline/40 mt-auto">
                            {/* Negotiated price input — only shown for null-price courses */}
                            {course.price === null && (
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={negotiatedPrices[course.slug] || ''}
                                onChange={(e) => setNegotiatedPrices(prev => ({ ...prev, [course.slug]: e.target.value }))}
                                placeholder="Agreed price (PKR)"
                                className="flex-1 bg-navy/50 border border-hairline rounded px-sm py-xs text-offwhite placeholder-steelblue/30 font-mono text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                                aria-label={`Agreed price for ${course.title}`}
                              />
                            )}
                            <button
                              onClick={() => handleGenerateLink(course)}
                              disabled={generatingLink === course.slug}
                              className="flex-1 font-mono text-label uppercase tracking-wider text-green-400 border border-green-400/30 hover:bg-green-400/10 px-sm py-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Generate single-use registration link"
                            >
                              {generatingLink === course.slug ? 'Generating...' : 'Generate Link'}
                            </button>
                            <button
                              onClick={() => handleEditSelect(course)}
                              className="flex-1 font-mono text-label uppercase tracking-wider text-accent border border-accent/30 hover:bg-accent/10 px-sm py-xs rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(course._id, course.title)}
                              className="flex-1 font-mono text-label uppercase tracking-wider text-steelblue/60 hover:text-accent border border-hairline hover:border-accent/30 px-sm py-xs rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>

                          {/* Registration Links Status */}
                          {registrationLinks[course.slug] && registrationLinks[course.slug].length > 0 && (
                            <div className="mt-sm pt-sm border-t border-hairline/40">
                              <div className="font-mono text-caption uppercase tracking-wider text-steelblue mb-xs">
                                Generated Links ({registrationLinks[course.slug].length})
                              </div>
                              <div className="space-y-xs max-h-24 overflow-y-auto custom-scrollbar">
                                {registrationLinks[course.slug].slice(0, 3).map((link, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className={`font-mono ${link.status === 'pending' ? 'text-green-400' : 'text-steelblue/60'}`}>
                                      {link.status === 'pending' ? '● Pending' : '○ Used'}
                                    </span>
                                    <span className="font-mono text-steelblue/50">
                                      {new Date(link.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                                {registrationLinks[course.slug].length > 3 && (
                                  <div className="font-mono text-steelblue/50 text-xs">
                                    +{registrationLinks[course.slug].length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center pt-xl gap-lg font-mono text-label">
              <span className="text-steelblue">
                Showing <strong className="text-offwhite">{startIndex + 1}</strong> to <strong className="text-offwhite">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong> of <strong className="text-offwhite">{totalItems}</strong> courses
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-sm">
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
            </div>
          </>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy border border-accent px-xl py-sm shadow-elevation-md font-mono text-label uppercase tracking-wider text-accent flex items-center gap-sm rounded">
          <span>✓</span> {toast}
        </div>
      )}
    </div>
  );
}
