'use client';

import React, { useState, useEffect } from 'react';

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
    points: [''], // Points array initialized with one empty field
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  
  // Toast notifications for link copying
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  // Select Course for Editing
  const handleEditSelect = (course) => {
    console.log('[FRONTEND] Editing course:', course);
    setIsEditing(true);
    setEditingId(course._id);
    setFormFields({
      id: course.id || '',
      title: course.title || '',
      description: course.description || '',
      image: course.image || '',
      price: course.price !== undefined ? course.price : '',
      points: Array.isArray(course.points) && course.points.length > 0 ? course.points : [''],
    });
    setSubmitError(null);
    setSubmitSuccess(null);
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
      points: [''],
    });
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  // Delete Course Handler
  const handleDelete = async (id, title) => {
    if (!confirm(`Are you absolutely sure you want to delete the course: "${title}"?`)) return;

    console.log('[FRONTEND] Deleting course with ID:', id);
    console.log('[FRONTEND] Course title:', title);

    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      console.log('[FRONTEND] Delete response:', res.status, data);
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

    const url = isEditing ? `/api/courses/${editingId}` : '/api/courses';
    const method = isEditing ? 'PUT' : 'POST';

    console.log('[FRONTEND] Submitting form:');
    console.log('[FRONTEND] isEditing:', isEditing);
    console.log('[FRONTEND] editingId:', editingId);
    console.log('[FRONTEND] URL:', url);
    console.log('[FRONTEND] Method:', method);
    console.log('[FRONTEND] Form data:', formFields);

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formFields),
      });
      const data = await res.json();
      console.log('[FRONTEND] Submit response:', res.status, data);

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
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-hairline pb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
            [ PROFESSIONAL CURRICULUM ]
          </span>
          <h1 className="font-sans font-bold text-3xl text-offwhite uppercase tracking-tight">
            Manage Courses
          </h1>
        </div>
      </div>

      {/* Form Section - Premium Dark Design */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-navy/80 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-hairline">
            {/* Header */}
            <div className="bg-gradient-to-r from-navy/60 to-navy/80 px-8 py-6 border-b border-hairline">
              <h3 className="font-sans font-semibold text-xl text-offwhite">
                {isEditing ? 'Edit Course Details' : 'Create New Training Course'}
              </h3>
              {isEditing && (
                <p className="font-sans text-sm text-steelblue mt-1">
                  Reference ID: {formFields.id || 'N/A'}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="id" className="block font-sans text-sm font-medium text-steelblue mb-2">
                    Course Ref ID
                  </label>
                  <input
                    id="id"
                    type="text"
                    name="id"
                    value={formFields.id}
                    onChange={handleChange}
                    className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    placeholder="03"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block font-sans text-sm font-medium text-steelblue mb-2">
                    Course Title <span className="text-accent">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formFields.title}
                    onChange={handleChange}
                    className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    placeholder="ANSYS Fluent CFD Essentials"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block font-sans text-sm font-medium text-steelblue mb-2">
                  Course Description <span className="text-accent">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formFields.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
                  placeholder="Provide a comprehensive course description..."
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="block font-sans text-sm font-medium text-steelblue mb-2">
                  Course Price (PKR) <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-steelblue font-sans text-sm">PKR</span>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formFields.price}
                    onChange={handleChange}
                    className="w-full bg-navy/50 border border-hairline rounded-lg pl-12 pr-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    placeholder="15000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-sm font-medium text-steelblue mb-2">
                  Course Features
                </label>
                <div className="space-y-3">
                  {formFields.points.map((point, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handlePointChange(index, e.target.value)}
                          className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                          placeholder={`Feature ${index + 1}`}
                        />
                      </div>
                      {formFields.points.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePointField(index)}
                          className="px-4 py-2.5 text-steelblue hover:text-accent hover:bg-accent/10 rounded-lg transition-colors font-sans text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPointField}
                    className="w-full py-2.5 border-2 border-dashed border-hairline hover:border-accent text-steelblue hover:text-accent rounded-lg transition-colors font-sans text-sm font-medium"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-sm font-medium text-steelblue mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formFields.image}
                    onChange={handleChange}
                    className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    placeholder="/images/courses/ansys-fluent.jpg"
                  />
                </div>
                
                <div>
                  <label className="block font-sans text-sm font-medium text-steelblue mb-2">
                    Upload Image
                  </label>
                  <div className="flex gap-3">
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
                      className="flex-1 cursor-pointer border border-hairline hover:border-accent hover:bg-accent/5 font-sans text-sm px-4 py-2.5 rounded-lg transition-colors text-center text-steelblue hover:text-accent font-medium"
                    >
                      {uploadingImage ? 'Uploading...' : 'Choose File'}
                    </label>
                    {formFields.image && (
                      <span className="flex items-center text-green-400 font-sans text-sm">
                        ✓ Uploaded
                      </span>
                    )}
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
                  {isEditing ? 'Save Changes' : 'Create Course'}
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

      {/* Courses Cards */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-hairline/60 pb-3">
          <h3 className="font-sans font-bold text-lg text-offwhite">
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
              className="w-full bg-navy/80 border border-hairline px-4 py-2 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent text-sm transition-colors shadow-inner"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center font-mono text-xs text-steelblue animate-pulse">
            LOADING LIVE DATA SHEET...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="border border-dashed border-white/10 p-12 text-center text-steelblue font-mono text-xs">
            {searchQuery ? 'No courses match your search.' : 'NO COURSES DEFINED IN DATABASE.'}
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/5 to-accent/5 rounded-lg opacity-30 blur-sm" />
              <div className="relative overflow-x-auto bg-navy/40 backdrop-blur-sm shadow-2xl shadow-black/20 p-4">
                <div className="flex gap-4 pb-2">
                  {paginatedCourses.map((course) => (
                    <div key={course._id} className="flex-shrink-0 w-80 border border-hairline bg-navy/60 p-4 rounded-lg hover:border-accent/50 transition-all duration-200">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-accent text-sm">REF: {course.id}</span>
                          <span className="font-mono text-offwhite text-sm">PKR {course.price?.toLocaleString() || '0'}</span>
                        </div>
                        
                        <h4 className="font-semibold text-offwhite text-sm leading-tight">{course.title}</h4>
                        
                        <p className="text-steelblue text-xs leading-relaxed line-clamp-3">{course.description}</p>
                        
                        {course.image && (
                          <div className="font-mono text-3xs text-steelblue/50 truncate">
                            {course.image}
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-2 border-t border-hairline/40">
                          <button
                            onClick={() => handleCopyLink(course.slug)}
                            className="flex-1 font-mono text-2xs uppercase tracking-wider text-green-400 border border-green-400/30 hover:bg-green-400/10 px-3 py-2 transition-colors"
                            title="Copy course registration link"
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={() => handleEditSelect(course)}
                            className="flex-1 font-mono text-2xs uppercase tracking-wider text-accent border border-accent/30 hover:bg-accent/10 px-3 py-2 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(course._id, course.title)}
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
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4 font-mono text-xs">
              <span className="text-steelblue">
                Showing <strong className="text-offwhite">{startIndex + 1}</strong> to <strong className="text-offwhite">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong> of <strong className="text-offwhite">{totalItems}</strong> courses
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-4 py-2 border border-hairline hover:border-accent disabled:opacity-30 disabled:hover:border-hairline text-steelblue hover:text-offwhite transition-colors shadow-sm"
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
                    className="px-4 py-2 border border-hairline hover:border-accent disabled:opacity-30 disabled:hover:border-hairline text-steelblue hover:text-offwhite transition-colors shadow-sm"
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
        <div className="fixed bottom-6 right-6 z-50 bg-navy border border-accent px-4 py-3 shadow-2xl font-mono text-xs uppercase tracking-wider text-accent flex items-center gap-2">
          <span>✓</span> {toast}
        </div>
      )}
    </div>
  );
}
