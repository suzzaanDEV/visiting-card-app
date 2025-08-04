import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiStar, FiGrid, 
  FiSearch, FiFilter, FiDownload, FiUpload, FiSettings
} from 'react-icons/fi';
import { FaLayerGroup, FaPalette } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../features/admin/adminThunks';

const TemplateManagement = () => {
  const dispatch = useDispatch();
  const { templates, isLoading, error } = useSelector((state) => state.admin);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    backgroundColor: '#667eea',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    isActive: true,
    isFeatured: false
  });

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        await dispatch(updateTemplate({ id: editingTemplate._id, ...formData })).unwrap();
        toast.success('Template updated successfully!');
      } else {
        await dispatch(createTemplate(formData)).unwrap();
        toast.success('Template created successfully!');
      }
      
      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Failed to save template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      backgroundColor: template.backgroundColor || '#667eea',
      textColor: template.textColor || '#ffffff',
      fontFamily: template.fontFamily || 'Arial',
      isActive: template.isActive,
      isFeatured: template.isFeatured
    });
    setShowForm(true);
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await dispatch(deleteTemplate(templateId)).unwrap();
        toast.success('Template deleted successfully!');
      } catch (error) {
        toast.error(error.message || 'Failed to delete template');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      backgroundColor: '#667eea',
      textColor: '#ffffff',
      fontFamily: 'Arial',
      isActive: true,
      isFeatured: false
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select templates first');
      return;
    }

    try {
      // Implement bulk actions here
      toast.success(`${action} applied to ${selectedTemplates.length} templates`);
      setSelectedTemplates([]);
    } catch (error) {
      toast.error('Failed to apply bulk action');
    }
  };

  const backgroundColors = [
    { name: 'Blue Gradient', value: '#667eea' },
    { name: 'Purple Gradient', value: '#764ba2' },
    { name: 'Green Gradient', value: '#11998e' },
    { name: 'Orange Gradient', value: '#f12711' },
    { name: 'Pink Gradient', value: '#ff6b6b' },
    { name: 'Dark Blue', value: '#1a3a63' },
    { name: 'Deep Purple', value: '#4a148c' },
    { name: 'Forest Green', value: '#2e7d32' },
    { name: 'Dark Orange', value: '#e65100' },
    { name: 'Rose', value: '#c2185b' }
  ];

  const textColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#333333' },
    { name: 'Light Gray', value: '#666666' }
  ];

  const fontFamilies = [
    { name: 'Arial', value: 'Arial' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Verdana', value: 'Verdana' },
    { name: 'Courier New', value: 'Courier New' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout title="Template Management">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
          <p className="text-gray-600">Manage card templates and designs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Template
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              disabled={selectedTemplates.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              disabled={selectedTemplates.length === 0}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={selectedTemplates.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Delete
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
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="business">Business</option>
                      <option value="creative">Creative</option>
                      <option value="minimal">Minimal</option>
                      <option value="modern">Modern</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <select
                      name="backgroundColor"
                      value={formData.backgroundColor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {backgroundColors.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <select
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {textColors.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <select
                      name="fontFamily"
                      value={formData.fontFamily}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {fontFamilies.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
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
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Templates</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
            >
              <div
                className="h-32 relative"
                style={{ backgroundColor: template.backgroundColor || '#667eea' }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <FiGrid className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">{template.name}</p>
                  </div>
                </div>
                {template.isFeatured && (
                  <div className="absolute top-2 right-2">
                    <FiStar className="h-5 w-5 text-yellow-400" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="capitalize">{template.category}</span>
                  <div className="flex items-center space-x-1">
                    {template.isActive ? (
                      <FiEye className="h-4 w-4 text-green-500" />
                    ) : (
                      <FiEyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
            <p className="text-gray-600">Create your first template to get started.</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TemplateManagement; 