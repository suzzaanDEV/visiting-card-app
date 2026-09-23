import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiStar, FiGrid, 
  FiSearch
} from 'react-icons/fi';
import { FaLayerGroup, FaPalette } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../features/admin/adminThunks';
import { API_BASE_URL } from '../../services/apiService';

const TemplateManagement = () => {
  const dispatch = useDispatch();
  const { templates, isLoading, error } = useSelector((state) => ({
    templates: state.admin.templates.data || [],
    isLoading: state.admin.templates.loading,
    error: state.admin.templates.error
  }));
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    design: {
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      accentColor: '#6366f1',
      fontFamily: 'Inter',
      layout: 'standard',
      borderRadius: 16,
      headerStyle: 'centered',
      avatarShape: 'circle',
      avatarSize: 120,
      backgroundImage: ''
    }
  });

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('design.')) {
      const designKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        design: {
          ...prev.design,
          [designKey]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const slugify = (str) => (str || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');

      const payload = {
        id: slugify(formData.id) || slugify(formData.name) || `template-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        isPremium: formData.isPremium,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        design: {
          backgroundColor: formData.design.backgroundColor,
          textColor: formData.design.textColor,
          accentColor: formData.design.accentColor,
          fontFamily: formData.design.fontFamily,
          layout: formData.design.layout,
          borderRadius: Number(formData.design.borderRadius) || 16,
          headerStyle: formData.design.headerStyle,
          avatarShape: formData.design.avatarShape,
          avatarSize: Number(formData.design.avatarSize) || 120,
          backgroundImage: formData.design.backgroundImage,
          elements: editingTemplate ? (editingTemplate.design?.elements || []) : []
        }
      };
      
      if (editingTemplate) {
        await dispatch(updateTemplate({ id: editingTemplate.id || editingTemplate._id, ...payload })).unwrap();
        toast.success('Template updated successfully!');
      } else {
        await dispatch(createTemplate(payload)).unwrap();
        toast.success('Template created successfully!');
      }
      
      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
      dispatch(fetchTemplates());
    } catch (error) {
      toast.error(error.message || 'Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    const d = template.design || {};
    setFormData({
      id: template.id || '',
      name: template.name,
      description: template.description,
      category: template.category,
      isPremium: template.isPremium || false,
      isActive: template.isActive,
      isFeatured: template.isFeatured,
      design: {
        backgroundColor: d.backgroundColor || '#ffffff',
        textColor: d.textColor || '#1a1a1a',
        accentColor: d.accentColor || '#6366f1',
        fontFamily: d.fontFamily || 'Inter',
        layout: d.layout || 'standard',
        borderRadius: d.borderRadius ?? 16,
        headerStyle: d.headerStyle || 'centered',
        avatarShape: d.avatarShape || 'circle',
        avatarSize: d.avatarSize ?? 120,
        backgroundImage: d.backgroundImage || ''
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setActionLoading(templateId);
      try {
        await dispatch(deleteTemplate(templateId)).unwrap();
        toast.success('Template deleted successfully!');
        dispatch(fetchTemplates());
      } catch (error) {
        toast.error(error.message || 'Failed to delete template');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      category: '',
      isPremium: false,
      isActive: true,
      isFeatured: false,
      design: {
        backgroundColor: '#ffffff',
        textColor: '#1a1a1a',
        accentColor: '#6366f1',
        fontFamily: 'Inter',
        layout: 'standard',
        borderRadius: 16,
        headerStyle: 'centered',
        avatarShape: 'circle',
        avatarSize: 120,
        backgroundImage: ''
      }
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select templates first');
      return;
    }

    setBulkLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      for (const templateId of selectedTemplates) {
        if (action === 'delete') {
          await fetch(`${API_BASE_URL}/admin/templates/${templateId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else if (action === 'activate' || action === 'deactivate') {
          await fetch(`${API_BASE_URL}/admin/templates/${templateId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ isActive: action === 'activate' })
          });
        }
      }
      toast.success(`${action} applied to ${selectedTemplates.length} templates`);
      setSelectedTemplates([]);
      dispatch(fetchTemplates());
    } catch {
      toast.error('Failed to apply bulk action');
    } finally {
      setBulkLoading(false);
    }
  };

  const fontFamilies = [
    { name: 'Arial', value: 'Arial' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Verdana', value: 'Verdana' },
    { name: 'Courier New', value: 'Courier New' }
  ];

  const filteredTemplates = Array.isArray(templates) ? templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const vd = (viewingTemplate || {}).design || {};
  const viewElements = (viewingTemplate || {}).design?.elements || [];

  return (
    <AdminLayout title="Template Management">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Template Management</h1>
          <p className="text-gray-600 dark:text-slate-400">Manage card templates and designs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Template
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="business">Business</option>
            <option value="creative">Creative</option>
            <option value="minimal">Minimal</option>
            <option value="modern">Modern</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkAction('activate')}
              disabled={selectedTemplates.length === 0 || bulkLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {bulkLoading && <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />}
              <span>Activate</span>
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              disabled={selectedTemplates.length === 0 || bulkLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {bulkLoading && <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />}
              <span>Deactivate</span>
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={selectedTemplates.length === 0 || bulkLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {bulkLoading && <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />}
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Template Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingTemplate ? 'Edit Template' : 'Add Template'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Template ID
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      disabled={!!editingTemplate}
                      placeholder="auto-generated from name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="business">Business</option>
                      <option value="creative">Creative</option>
                      <option value="minimal">Minimal</option>
                      <option value="modern">Modern</option>
                      <option value="personal">Personal</option>
                      <option value="tech">Tech</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="2"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">Design Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Layout</label>
                      <select name="design.layout" value={formData.design.layout} onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="standard">Standard</option>
                        <option value="modern">Modern</option>
                        <option value="minimal">Minimal</option>
                        <option value="bold">Bold</option>
                        <option value="creative">Creative</option>
                        <option value="premium">Premium</option>
                        <option value="showcase">Showcase</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Background Color</label>
                      <div className="flex gap-2">
                        <input type="color" name="design.backgroundColor" value={formData.design.backgroundColor} onChange={handleInputChange}
                          className="w-10 h-10 rounded border border-gray-300 dark:border-slate-600 cursor-pointer" />
                        <input type="text" name="design.backgroundColor" value={formData.design.backgroundColor} onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Text Color</label>
                      <div className="flex gap-2">
                        <input type="color" name="design.textColor" value={formData.design.textColor} onChange={handleInputChange}
                          className="w-10 h-10 rounded border border-gray-300 dark:border-slate-600 cursor-pointer" />
                        <input type="text" name="design.textColor" value={formData.design.textColor} onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Accent Color</label>
                      <div className="flex gap-2">
                        <input type="color" name="design.accentColor" value={formData.design.accentColor} onChange={handleInputChange}
                          className="w-10 h-10 rounded border border-gray-300 dark:border-slate-600 cursor-pointer" />
                        <input type="text" name="design.accentColor" value={formData.design.accentColor} onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Font Family</label>
                      <select name="design.fontFamily" value={formData.design.fontFamily} onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        {fontFamilies.map((font) => (
                          <option key={font.value} value={font.value}>{font.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Border Radius (px)</label>
                      <input type="number" name="design.borderRadius" value={formData.design.borderRadius} onChange={handleInputChange} min="0" max="64"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Header Style</label>
                      <select name="design.headerStyle" value={formData.design.headerStyle} onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="centered">Centered</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="full">Full Width</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Avatar Shape</label>
                      <select name="design.avatarShape" value={formData.design.avatarShape} onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="circle">Circle</option>
                        <option value="rounded">Rounded</option>
                        <option value="square">Square</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Avatar Size (px)</label>
                      <input type="number" name="design.avatarSize" value={formData.design.avatarSize} onChange={handleInputChange} min="40" max="240"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Background Image</label>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append('image', file);
                      setUploading(true);
                      try {
                        const token = localStorage.getItem('adminToken');
                        const res = await fetch(`${API_BASE_URL}/admin/templates/background`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` },
                          body: fd
                        });
                        const data = await res.json();
                        if (data.imageUrl) {
                          setFormData(f => ({ ...f, design: { ...f.design, backgroundImage: data.imageUrl } }));
                          toast.success('Background added');
                        } else {
                          toast.error(data.error || 'Upload failed');
                        }
                      } catch { toast.error('Upload failed'); }
                      setUploading(false);
                    }} className="w-full text-sm text-gray-700 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-900/40 dark:file:text-emerald-400 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/60 cursor-pointer" />
                    {uploading && (
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent mt-2 inline-block" />
                    )}
                    {formData.design?.backgroundImage && (
                      <img src={formData.design.backgroundImage} alt="Background preview" className="mt-2 h-20 w-full object-cover rounded border border-gray-200 dark:border-slate-600" />
                    )}
                    {formData.design?.backgroundImage && (
                      <button type="button" onClick={() => setFormData(f => ({ ...f, design: { ...f.design, backgroundImage: '' } }))}
                        className="mt-1 text-xs text-red-500 hover:text-red-600">Remove background</button>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">Preview</h4>
                  <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600"
                    style={{ backgroundColor: formData.design.backgroundColor, color: formData.design.textColor, fontFamily: formData.design.fontFamily }}>
                    <div className="p-4 h-full flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full mb-2 flex items-center justify-center font-bold"
                        style={{ backgroundColor: formData.design.accentColor + '33', color: formData.design.accentColor }}>
                        TN
                      </div>
                      <p className="font-bold text-sm">Template Name</p>
                      <p className="text-xs opacity-70">Job Title - Company</p>
                      <div className="w-16 h-0.5 mt-2 rounded" style={{ backgroundColor: formData.design.accentColor }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Featured</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="isPremium" checked={formData.isPremium} onChange={handleInputChange} className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Premium</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {submitting && (
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                    )}
                    <span>{editingTemplate ? 'Update Template' : 'Create Template'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Template Modal */}
      <AnimatePresence>
        {viewingTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{viewingTemplate.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 capitalize">{viewingTemplate.category} · {viewingTemplate.id}</p>
                </div>
                <button
                  onClick={() => setViewingTemplate(null)}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                {viewingTemplate.isPremium && (
                  <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">PRO</span>
                )}
                {viewingTemplate.isFeatured && (
                  <span className="text-[10px] bg-yellow-400 text-white px-1.5 py-0.5 rounded-full font-bold">FEATURED</span>
                )}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white ${viewingTemplate.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                  {viewingTemplate.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{viewingTemplate.description}</p>

              <div
                className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 mb-4"
                style={{ backgroundColor: vd.backgroundColor || '#ffffff', color: vd.textColor || '#1a1a1a', fontFamily: vd.fontFamily || 'Inter' }}
              >
                <div className="p-6 h-52 flex flex-col items-center justify-center text-center">
                  <div
                    className="w-16 h-16 rounded-full mb-3 flex items-center justify-center font-bold"
                    style={{ backgroundColor: (vd.accentColor || '#6366f1') + '33', color: vd.accentColor || '#6366f1' }}
                  >
                    {(viewingTemplate.name || 'T').charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-base">Template Name</p>
                  <p className="text-xs opacity-70">Job Title - Company</p>
                  <div className="w-16 h-0.5 mt-2 rounded" style={{ backgroundColor: vd.accentColor || '#6366f1' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded border border-gray-300 dark:border-slate-600" style={{ backgroundColor: vd.backgroundColor }}></span>
                  <span className="text-gray-700 dark:text-slate-300">Background</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded border border-gray-300 dark:border-slate-600" style={{ backgroundColor: vd.accentColor }}></span>
                  <span className="text-gray-700 dark:text-slate-300">Accent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded border border-gray-300 dark:border-slate-600" style={{ backgroundColor: vd.textColor }}></span>
                  <span className="text-gray-700 dark:text-slate-300">Text</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded border border-gray-300 dark:border-slate-600 text-center text-xs gray-400">Aa</span>
                  <span className="text-gray-700 dark:text-slate-300 truncate">{vd.fontFamily || 'Inter'}</span>
                </div>
                <div><span className="text-gray-500 dark:text-slate-400">Layout</span><p className="font-medium text-gray-900 dark:text-slate-100 capitalize">{vd.layout || 'standard'}</p></div>
                <div><span className="text-gray-500 dark:text-slate-400">Header style</span><p className="font-medium text-gray-900 dark:text-slate-100 capitalize">{vd.headerStyle || 'centered'}</p></div>
                <div><span className="text-gray-500 dark:text-slate-400">Avatar shape</span><p className="font-medium text-gray-900 dark:text-slate-100 capitalize">{vd.avatarShape || 'circle'}</p></div>
                <div><span className="text-gray-500 dark:text-slate-400">Border radius</span><p className="font-medium text-gray-900 dark:text-slate-100">{vd.borderRadius ?? 16}px</p></div>
              </div>

              {vd.backgroundImage && (
                <img src={vd.backgroundImage} alt="Template background" className="mb-4 h-24 w-full object-cover rounded border border-gray-200 dark:border-slate-600" />
              )}

              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">Elements ({viewElements.length})</h4>
                {viewElements.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-slate-400">No custom elements</p>
                ) : (
                  <div className="space-y-2">
                    {viewElements.map((el, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900 rounded-lg px-3 py-2 text-sm">
                        <span className="text-gray-700 dark:text-slate-300 capitalize">{el.type || 'element'} · {el.label || el.key || `#${i + 1}`}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">{el.value || ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewingTemplate(null)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Templates</h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => {
            const td = template.design || {};
            return (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              <div
                className="h-32 relative"
                style={{ backgroundColor: td.backgroundColor || '#6366f1', color: td.textColor || '#ffffff', fontFamily: td.fontFamily || 'Inter' }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <FiGrid className="h-8 w-8 mx-auto mb-2 opacity-70" />
                    <p className="text-sm font-bold">{template.name}</p>
                    <p className="text-[10px] opacity-70 capitalize">{td.layout || 'standard'}</p>
                  </div>
                </div>
                {td.accentColor && (
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: td.accentColor }}></div>
                )}
                {template.isFeatured && (
                  <div className="absolute top-2 right-2">
                    <FiStar className="h-5 w-5 text-yellow-400" />
                  </div>
                )}
                {template.isPremium && (
                  <div className="absolute top-2 left-2 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">PRO</div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-2 line-clamp-2">{template.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-3">
                  <span className="capitalize">{template.category}</span>
                  <span>{template.usageCount || 0} uses</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewingTemplate(template)}
                      title="View template"
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:bg-blue-900/40 rounded-lg transition-colors"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(template)}
                      title="Edit template"
                      className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:bg-emerald-900/40 rounded-lg transition-colors"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id || template._id)}
                      disabled={actionLoading === (template.id || template._id)}
                      title="Delete template"
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:bg-red-900/40 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === (template.id || template._id) ? (
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                      ) : <FiTrash2 className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      title={template.isActive ? 'Active' : 'Inactive'}
                      className={`inline-block w-2.5 h-2.5 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-400 dark:bg-slate-500'}`}
                    ></span>
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTemplates(prev => [...prev, template._id]);
                        } else {
                          setSelectedTemplates(prev => prev.filter(id => id !== template._id));
                        }
                      }}
                      className="h-4 w-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      )}

      {filteredTemplates.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">No Templates Found</h3>
            <p className="text-gray-600 dark:text-slate-400">Create your first template to get started.</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TemplateManagement; 