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
    console.log('[FRONTEND] Editing service:', service);
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

    console.log('[FRONTEND] Deleting service with ID:', id);
    console.log('[FRONTEND] Service title:', title);

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      console.log('[FRONTEND] Delete response:', res.status, data);
      if (res.ok) {
        fetchServices();
        setSubmitSuccess('Service deleted successfully.');
        setTimeout(() => setSubmitSuccess(null), 3000);
      } else {
        console.error('[FRONTEND] Delete failed:', data.error);
        alert(data.error || 'Failed to delete service.');
      }
    } catch (err) {
      console.error('[FRONTEND] Delete error:', err);
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
        setSubmitSuccess(isEditing ? 'Service updated successfully!' : 'Service created successfully!');
        handleCancelEdit();
        fetchServices();
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
      <div className="border-b border-hairline pb-xl flex flex-col sm:flex-row sm:items-end sm:justify-between gap-lg">
        <div>
          <span className="font-mono text-label uppercase tracking-widest text-accent block mb-sm">
            [ SIMUFLUX CAPABILITIES ]
          </span>
          <h1 className="font-sans font-bold text-h2 text-offwhite uppercase tracking-tight">
            Manage Services
          </h1>
        </div>
      </div>

      {/* Form Section - Premium Dark Design */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-navy/80 backdrop-blur-sm rounded-xl shadow-elevation-sm overflow-hidden border border-hairline">
            {/* Header */}
            <div className="bg-gradient-to-r from-navy/60 to-navy/80 px-xl py-lg border-b border-hairline">
              <h3 className="font-sans font-semibold text-h3 text-offwhite">
                {isEditing ? 'Edit Service Details' : 'Create New Engineering Service'}
              </h3>
              {isEditing && (
                <p className="font-sans text-caption text-steelblue mt-sm">
                  Reference ID: {formFields.id || 'N/A'}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-xl space-y-4xl">
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
                      Service Ref ID
                    </label>
                    <input
                      id="id"
                      type="text"
                      name="id"
                      value={formFields.id}
                      onChange={handleChange}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="06"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                      Service Title <span className="text-accent">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formFields.title}
                      onChange={handleChange}
                      className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="Aerodynamic Flow Simulation"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="shortDescription" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Short Description <span className="text-accent">*</span>
                  </label>
                  <input
                    id="shortDescription"
                    type="text"
                    name="shortDescription"
                    value={formFields.shortDescription}
                    onChange={handleChange}
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="A brief 1-2 sentence overview of scope..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="detail" className="block font-mono text-label uppercase tracking-wider text-steelblue mb-sm">
                    Specification Details <span className="text-accent">*</span>
                  </label>
                  <textarea
                    id="detail"
                    name="detail"
                    value={formFields.detail}
                    onChange={handleChange}
                    rows="5"
                    className="w-full bg-navy/50 border border-hairline rounded px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                    placeholder="Fully detailed engineering specifications..."
                    required
                  />
                </div>
              </div>

              {/* Features Section */}
              <div className="space-y-xl">
                <div className="border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label uppercase tracking-wider text-accent">
                    [ SERVICE FEATURES ]
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
                          placeholder={`Feature ${index + 1}`}
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
                    + Add Feature
                  </button>
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-xl">
                <div className="border-b border-hairline/60 pb-md">
                  <span className="font-mono text-label uppercase tracking-wider text-accent">
                    [ SERVICE MEDIA ]
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
                      placeholder="/images/services/aerodynamics.jpg"
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
                        id="image-file-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="image-file-upload"
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
                      alt="Service preview"
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
                  {isEditing ? 'Save Changes' : 'Add Service'}
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

      {/* Services Cards */}
      <div className="space-y-xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-lg border-b border-hairline/60 pb-md">
          <h3 className="font-sans font-bold text-h3 text-offwhite">
            Live Services Database
          </h3>
          <div className="w-full sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search services..."
              className="w-full bg-navy/80 border border-hairline px-lg py-sm text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-caption transition-all rounded shadow-elevation-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-4xl text-center font-mono text-label text-steelblue animate-pulse">
            LOADING LIVE DATA SHEET...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="border border-dashed border-white/10 p-4xl text-center text-steelblue font-mono text-label rounded">
            {searchQuery ? 'No services match your search.' : 'NO SERVICES DEFINED IN DATABASE.'}
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/5 to-accent/5 rounded-lg opacity-30 blur-sm" />
              <div className="relative overflow-x-auto bg-navy/40 backdrop-blur-sm shadow-elevation-sm p-lg rounded-lg">
                <div className="flex gap-lg pb-sm min-w-max">
                  {paginatedServices.map((service) => (
                    <div key={service._id} className="flex-shrink-0 w-80 border border-hairline bg-navy/60 shadow-elevation-sm hover:shadow-elevation-md hover:border-accent/50 rounded-lg transition-all duration-200 overflow-hidden">
                      <div className="flex flex-col h-full">
                        {/* Image Thumbnail at Top */}
                        {service.image ? (
                          <div className="relative w-full h-40 bg-navy/50 overflow-hidden border-b border-hairline">
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-full h-full object-cover"
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
                        <div className="p-lg flex flex-col flex-grow">
                          <div className="flex items-center justify-between mb-sm">
                            <span className="font-mono font-bold text-accent text-sm">REF: {service.id}</span>
                          </div>
                          
                          <h4 className="font-semibold text-offwhite text-h3 leading-tight mb-sm">{service.title}</h4>
                          
                          <p className="text-steelblue text-caption leading-relaxed line-clamp-2 mb-sm">{service.shortDescription}</p>
                          
                          <div className="flex gap-sm pt-sm border-t border-hairline/40 mt-auto">
                            <button
                              onClick={() => handleEditSelect(service)}
                              className="flex-1 font-mono text-label uppercase tracking-wider text-accent border border-accent/30 hover:bg-accent/10 px-sm py-xs rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(service._id, service.title)}
                              className="flex-1 font-mono text-label uppercase tracking-wider text-steelblue/60 hover:text-accent border border-hairline hover:border-accent/30 px-sm py-xs rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center pt-xl gap-lg font-mono text-label">
              <span className="text-steelblue">
                Showing <strong className="text-offwhite">{startIndex + 1}</strong> to <strong className="text-offwhite">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong> of <strong className="text-offwhite">{totalItems}</strong> services
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
    </div>
  );
}
