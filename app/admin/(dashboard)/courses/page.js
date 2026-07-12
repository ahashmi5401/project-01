'use client';

import React, { useState, useEffect } from 'react';

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalItems = courses.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = courses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [courses.length, totalPages, currentPage]);

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
        alert(data.error || 'Failed to delete course.');
      }
    } catch (err) {
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

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formFields),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitSuccess(isEditing ? 'Course updated successfully!' : 'Course created successfully!');
        handleCancelEdit();
        fetchCourses();
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
            [ PROFESSIONAL CURRICULUM ]
          </span>
          <h1 className="font-sans font-bold text-3xl text-offwhite uppercase tracking-tight">
            Manage Courses
          </h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="border border-hairline bg-navy/40 p-8 relative">
        <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
        
        <h3 className="font-sans font-bold text-lg text-offwhite mb-6 border-b border-hairline/60 pb-3">
          {isEditing ? `Edit Course Details [REF: ${formFields.id || 'N/A'}]` : 'Create New Training Course'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="id" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Course Ref ID (Optional)
              </label>
              <input
                id="id"
                type="text"
                name="id"
                value={formFields.id}
                onChange={handleChange}
                className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent"
                placeholder="e.g. 03"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="title" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Course Title *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formFields.title}
                onChange={handleChange}
                className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent"
                placeholder="e.g. ANSYS Fluent CFD Essentials"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Course Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formFields.description}
              onChange={handleChange}
              rows="3"
              className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent resize-none"
              placeholder="Provide a comprehensive course description, outlining curriculum scope and meshing tools..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Course Price (PKR) *
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={formFields.price}
                onChange={handleChange}
                className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent"
                placeholder="e.g. 15000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Features / Key Points (Bullet points)
            </label>
            <div className="space-y-3">
              {formFields.points.map((point, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handlePointChange(index, e.target.value)}
                    className="flex-1 bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent"
                    placeholder={`Point #${index + 1} (e.g. Hands-on ANSYS Workbench projects)`}
                  />
                  {formFields.points.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePointField(index)}
                      className="border border-accent/40 text-accent hover:bg-accent/10 px-4 py-3 transition-colors font-mono text-xs uppercase"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPointField}
                className="border border-hairline border-dashed hover:border-accent text-steelblue hover:text-offwhite px-4 py-2 transition-colors font-mono text-xs uppercase mt-2"
              >
                + Add Point
              </button>
            </div>
          </div>

          {/* Image Upload Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Image Source URL
              </label>
              <input
                type="text"
                name="image"
                value={formFields.image}
                onChange={handleChange}
                className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent"
                placeholder="e.g. /images/courses/ansys-fluent.jpg"
              />
            </div>
            
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Upload Course Image / Badge (Max 5MB)
              </label>
              <div className="flex gap-4 items-center">
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
                  className="cursor-pointer border border-hairline hover:border-accent hover:bg-accent/5 font-mono text-xs uppercase tracking-wider px-6 py-3.5 transition-colors select-none text-steelblue hover:text-offwhite"
                >
                  {uploadingImage ? 'Uploading...' : 'Select File'}
                </label>
                {formFields.image && (
                  <span className="font-mono text-3xs text-green-400 truncate max-w-xs">
                    Uploaded: {formFields.image.split('/').pop()}
                  </span>
                )}
              </div>
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
              {isEditing ? 'Save Course Details' : 'Add Course'}
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

      {/* Courses Table */}
      <div className="space-y-6">
        <h3 className="font-sans font-bold text-lg text-offwhite border-b border-hairline/60 pb-3">
          Live Courses Database
        </h3>

        {loading ? (
          <div className="py-10 text-center font-mono text-xs text-steelblue animate-pulse">
            LOADING LIVE DATA SHEET...
          </div>
        ) : courses.length === 0 ? (
          <div className="border border-dashed border-white/10 p-12 text-center text-steelblue font-mono text-xs">
            NO COURSES DEFINED IN DATABASE.
          </div>
        ) : (
          <>
            <div className="border border-hairline overflow-x-auto bg-navy/40">
              <table className="w-full text-left font-sans text-sm border-collapse">
                <thead>
                  <tr className="border-b border-hairline bg-white/5 font-mono text-xs uppercase tracking-wider text-steelblue">
                    <th className="p-4 w-20">REF</th>
                    <th className="p-4 w-48">Title</th>
                    <th className="p-4 w-32">Price</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 w-40">Thumbnail</th>
                    <th className="p-4 w-40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline/60">
                  {paginatedCourses.map((course) => (
                    <tr key={course._id} className="hover:bg-white/[0.01] transition-all">
                      <td className="p-4 font-mono font-bold text-accent">{course.id}</td>
                      <td className="p-4 font-semibold text-offwhite">{course.title}</td>
                      <td className="p-4 font-mono text-offwhite">PKR {course.price?.toLocaleString() || '0'}</td>
                      <td className="p-4 text-steelblue leading-relaxed text-xs">{course.description}</td>
                      <td className="p-4 font-mono text-3xs text-steelblue/50 truncate max-w-[140px]">
                        {course.image}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-3 items-center">
                          <button
                            onClick={() => handleCopyLink(course.slug)}
                            className="font-mono text-2xs uppercase tracking-wider text-green-400 border-b border-green-400/20 hover:text-offwhite hover:border-offwhite transition-all pb-0.5"
                            title="Copy course registration link"
                          >
                            Copy Link
                          </button>
                          <span className="text-steelblue/20">/</span>
                          <button
                            onClick={() => handleEditSelect(course)}
                            className="font-mono text-2xs uppercase tracking-wider text-accent border-b border-accent/20 hover:text-offwhite hover:border-offwhite transition-all pb-0.5"
                          >
                            Edit
                          </button>
                          <span className="text-steelblue/20">/</span>
                          <button
                            onClick={() => handleDelete(course._id, course.title)}
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

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy border border-accent px-4 py-3 shadow-2xl font-mono text-xs uppercase tracking-wider text-accent flex items-center gap-2">
          <span>✓</span> {toast}
        </div>
      )}
    </div>
  );
}
