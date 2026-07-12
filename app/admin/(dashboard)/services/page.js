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

      {/* Form Section - Premium Dark Design */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-navy/80 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-hairline">
            {/* Header */}
            <div className="bg-gradient-to-r from-navy/60 to-navy/80 px-8 py-6 border-b border-hairline">
              <h3 className="font-sans font-semibold text-xl text-offwhite">
                {isEditing ? 'Edit Service Details' : 'Create New Engineering Service'}
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
                    Service Ref ID
                  </label>
                  <input
                    id="id"
                    type="text"
                    name="id"
                    value={formFields.id}
                    onChange={handleChange}
                    className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    placeholder="06"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block font-sans text-sm font-medium text-steelblue mb-2">
                    Service Title <span className="text-accent">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formFields.title}
                    onChange={handleChange}
                    className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    placeholder="Aerodynamic Flow Simulation"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="shortDescription" className="block font-sans text-sm font-medium text-steelblue mb-2">
                  Short Description <span className="text-accent">*</span>
                </label>
                <input
                  id="shortDescription"
                  type="text"
                  name="shortDescription"
                  value={formFields.shortDescription}
                  onChange={handleChange}
                  className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  placeholder="A brief 1-2 sentence overview of scope..."
                  required
                />
              </div>

              <div>
                <label htmlFor="detail" className="block font-sans text-sm font-medium text-steelblue mb-2">
                  Specification Details <span className="text-accent">*</span>
                </label>
                <textarea
                  id="detail"
                  name="detail"
                  value={formFields.detail}
                  onChange={handleChange}
                  rows="5"
                  className="w-full bg-navy/50 border border-hairline rounded-lg px-4 py-2.5 text-offwhite placeholder-steelblue/30 font-sans focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
                  placeholder="Fully detailed engineering specifications..."
                  required
                />
              </div>

              <div>
                <label className="block font-sans text-sm font-medium text-steelblue mb-2">
                  Service Features
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
                    placeholder="/images/services/aerodynamics.jpg"
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
                      id="image-file-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="image-file-upload"
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
                  {isEditing ? 'Save Changes' : 'Add Service'}
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

      {/* Services Cards */}
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
                setCurrentPage(1);
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
              <div className="relative overflow-x-auto bg-navy/40 backdrop-blur-sm shadow-2xl shadow-black/20 p-4">
                <div className="flex gap-4 pb-2">
                  {paginatedServices.map((service) => (
                    <div key={service._id} className="flex-shrink-0 w-80 border border-hairline bg-navy/60 p-4 rounded-lg hover:border-accent/50 transition-all duration-200">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-accent text-sm">REF: {service.id}</span>
                        </div>
                        
                        <h4 className="font-semibold text-offwhite text-sm leading-tight">{service.title}</h4>
                        
                        <p className="text-steelblue text-xs leading-relaxed line-clamp-2">{service.shortDescription}</p>
                        
                        {service.image && (
                          <div className="font-mono text-3xs text-steelblue/50 truncate">
                            {service.image}
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-2 border-t border-hairline/40">
                          <button
                            onClick={() => handleEditSelect(service)}
                            className="flex-1 font-mono text-2xs uppercase tracking-wider text-accent border border-accent/30 hover:bg-accent/10 px-3 py-2 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(service._id, service.title)}
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
