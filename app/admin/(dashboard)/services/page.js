'use client';

import React, { useState, useEffect } from 'react';

export default function ManageServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter services based on search query
  const filteredServices = services.filter(service => 
    service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredServices.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredServices.length, totalPages, currentPage]);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null); // MongoDB _id
  const [formFields, setFormFields] = useState({
    id: '', // Service numeric ID (e.g. 01)
    title: '',
    shortDescription: '',
    detail: '',
    image: '',
    points: [''], // Points array initialized with one empty field
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Load Services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services');
      const data = await res.json();
      if (res.ok) {
        setServices(data.services || []);
      } else {
        setError(data.error || 'Failed to load services.');
      }
    } catch (err) {
      setError('Network error. Failed to connect to API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
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
    formData.append('folder', 'services');

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

  // Select Service for Editing
  const handleEditSelect = (service) => {
    setIsEditing(true);
    setEditingId(service._id);
    setFormFields({
      id: service.id || '',
      title: service.title || '',
      shortDescription: service.shortDescription || '',
      detail: service.detail || '',
      image: service.image || '',
      points: Array.isArray(service.points) && service.points.length > 0 ? service.points : [''],
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
      shortDescription: '',
      detail: '',
      image: '',
      points: [''],
    });
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  // Delete Service Handler
  const handleDelete = async (id, title) => {
    if (!confirm(`Are you absolutely sure you want to delete the service: "${title}"?`)) return;

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        fetchServices();
        setSubmitSuccess('Service deleted successfully.');
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        alert(data.error || 'Failed to delete service.');
      }
    } catch (err) {
      alert('Failed to delete service. Connection error.');
    }
  };

  // Submit Form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!formFields.title.trim() || !formFields.shortDescription.trim() || !formFields.detail.trim()) {
      setSubmitError('Title, short description, and detail fields are required.');
      return;
    }

    const url = isEditing ? `/api/services/${editingId}` : '/api/services';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formFields),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitSuccess(isEditing ? 'Service updated successfully!' : 'Service created successfully!');
        handleCancelEdit();
        fetchServices();
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
            [ SIMUFLUX CAPABILITIES ]
          </span>
          <h1 className="font-sans font-bold text-3xl text-offwhite uppercase tracking-tight">
            Manage Services
          </h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg opacity-50 blur-sm" />
        <div className="relative border border-hairline bg-navy/40 backdrop-blur-sm p-8 shadow-2xl shadow-black/20">
          <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none" />
          
          <h3 className="font-sans font-bold text-lg text-offwhite mb-6 border-b border-hairline/60 pb-3">
            {isEditing ? `Edit Service Details [REF: ${formFields.id || 'N/A'}]` : 'Create New Engineering Service'}
          </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="id" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Service Ref ID (Optional)
              </label>
              <input
                id="id"
                type="text"
                name="id"
                value={formFields.id}
                onChange={handleChange}
                className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent"
                placeholder="e.g. 06"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="title" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Service Title *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formFields.title}
                onChange={handleChange}
                className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent"
                placeholder="e.g. Aerodynamic Flow Simulation"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="shortDescription" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Short Description (BOM view) *
            </label>
            <input
              id="shortDescription"
              type="text"
              name="shortDescription"
              value={formFields.shortDescription}
              onChange={handleChange}
              className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent"
              placeholder="A brief 1-2 sentence overview of scope..."
              required
            />
          </div>

          <div>
            <label htmlFor="detail" className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
              Specification Details (Detail page) *
            </label>
            <textarea
              id="detail"
              name="detail"
              value={formFields.detail}
              onChange={handleChange}
              rows="4"
              className="w-full bg-navy/80 border border-hairline px-4 py-3 text-offwhite placeholder-steelblue/20 font-sans focus:outline-none focus:border-accent resize-none"
              placeholder="Fully detailed engineering specifications, methodologies, solvers and parameters..."
              required
            />
          </div>

          {/* Price input removed */}

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
                    placeholder={`Point #${index + 1} (e.g. 3D Model Optimization)`}
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
                placeholder="e.g. /images/services/aerodynamics.jpg"
              />
            </div>
            
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-steelblue mb-2">
                Upload Work Sample Image (Max 5MB)
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-file-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="image-file-upload"
                  className="cursor-pointer border border-hairline hover:border-accent hover:bg-accent/5 font-mono text-xs uppercase tracking-wider px-6 py-3.5 transition-colors select-none text-steelblue hover:text-offwhite"
                >
                  {uploadingImage ? 'Uploading Image...' : 'Select File'}
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
              className="bg-accent hover:bg-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-xs px-6 py-3 border border-transparent transition-colors shadow-lg hover:shadow-accent/25"
            >
              {isEditing ? 'Save Specification' : 'Add Service'}
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
      </div>

      {/* Services Table */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-hairline/60 pb-3">
          <h3 className="font-sans font-bold text-lg text-offwhite">
            Live Services Database
          </h3>
          <div className="w-full sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 when searching
              }}
              placeholder="Search services..."
              className="w-full bg-navy/80 border border-hairline px-4 py-2 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent text-sm transition-colors shadow-inner"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center font-mono text-xs text-steelblue animate-pulse">
            LOADING LIVE DATA SHEET...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="border border-dashed border-white/10 p-12 text-center text-steelblue font-mono text-xs">
            {searchQuery ? 'No services match your search.' : 'NO SERVICES DEFINED IN DATABASE.'}
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/5 to-accent/5 rounded-lg opacity-30 blur-sm" />
              <div className="relative border border-hairline overflow-x-auto bg-navy/40 backdrop-blur-sm shadow-2xl shadow-black/20">
                <table className="w-full text-left font-sans text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-hairline bg-white/5 font-mono text-xs uppercase tracking-wider text-steelblue">
                      <th className="p-4 w-20">REF</th>
                      <th className="p-4 w-48">Title</th>
                      <th className="p-4">Short Description</th>
                      <th className="p-4 w-40">Thumbnail</th>
                      <th className="p-4 w-40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/60">
                    {paginatedServices.map((service) => (
                      <tr key={service._id} className="hover:bg-white/[0.02] hover:shadow-inner transition-all duration-200">
                        <td className="p-4 font-mono font-bold text-accent">{service.id}</td>
                        <td className="p-4 font-semibold text-offwhite">{service.title}</td>
                        <td className="p-4 text-steelblue leading-relaxed text-xs">{service.shortDescription}</td>
                        <td className="p-4 font-mono text-3xs text-steelblue/50 truncate max-w-[140px]">
                           {service.image}
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-3">
                            <button
                              onClick={() => handleEditSelect(service)}
                              className="font-mono text-2xs uppercase tracking-wider text-accent border-b border-accent/20 hover:text-offwhite hover:border-offwhite hover:shadow-accent/50 transition-all pb-0.5"
                            >
                              Edit
                            </button>
                            <span className="text-steelblue/20">/</span>
                            <button
                              onClick={() => handleDelete(service._id, service.title)}
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
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4 font-mono text-xs">
              <span className="text-steelblue">
                Showing <strong className="text-offwhite">{startIndex + 1}</strong> to <strong className="text-offwhite">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong> of <strong className="text-offwhite">{totalItems}</strong> services
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
    </div>
  );
}
