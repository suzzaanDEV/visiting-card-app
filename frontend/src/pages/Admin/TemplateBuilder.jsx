import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiSave, FiX,
  FiGrid, FiList, FiSearch, FiFilter, FiSettings
} from 'react-icons/fi';
import { FaStar, FaPalette, FaEye, FaEyeSlash } from 'react-icons/fa';

const TemplateBuilder = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    category: 'Professional',
    tags: [],
    isActive: true,
    isFeatured: false,
    preview: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Arial',
      elements: []
    },
    design: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Arial',
      elements: [],
      layout: 'standard',
      aspectRatio: '16:9'
    }
  });

  const categories = [
    'Professional', 'Creative', 'Modern', 'Classic', 'Minimal', 'Premium', 'Cultural'
  ];

  const layouts = [
    { id: 'standard', name: 'Standard' },
    { id: 'modern', name: 'Modern' },
    { id: 'creative', name: 'Creative' },
    { id: 'minimal', name: 'Minimal' }
  ];

  const aspectRatios = [
    { id: '16:9', name: 'Widescreen (16:9)' },
    { id: '4:3', name: 'Standard (4:3)' },
    { id: '1:1', name: 'Square (1:1)' },
    { id: '3:2', name: 'Photo (3:2)' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTemplate 
        ? `/api/admin/templates/${editingTemplate.id}`
        : '/api/admin/templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingTemplate(null);
        resetForm();
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      tags: template.tags || [],
      isActive: template.isActive,
      isFeatured: template.isFeatured,
      preview: template.preview,
      design: template.design
    });
    setShowModal(true);
  };

  const handleToggleFeatured = async (templateId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/templates/${templateId}/featured`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isFeatured: !currentStatus })
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      category: 'Professional',
      tags: [],
      isActive: true,
      isFeatured: false,
      preview: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'Arial',
        elements: []
      },
      design: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'Arial',
        elements: [],
        layout: 'standard',
        aspectRatio: '16:9'
      }
    });
  };

  const addElement = () => {
    const newElement = {
      type: 'Text',
      x: 50,
      y: 50,
      text: 'Sample Text',
      fontSize: 16,
      fill: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'normal'
    };
    
    setFormData(prev => ({
      ...prev,
      design: {
        ...prev.design,
        elements: [...prev.design.elements, newElement]
      }
    }));
  };

  const updateElement = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      design: {
        ...prev.design,
        elements: prev.design.elements.map((element, i) => 
          i === index ? { ...element, [field]: value } : element
        )
      }
    }));
  };

  const removeElement = (index) => {
    setFormData(prev => ({
      ...prev,
      design: {
        ...prev.design,
        elements: prev.design.elements.filter((_, i) => i !== index)
      }
    }));
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderTemplatePreview = (template) => {
    const { preview } = template;
    
    return (
      <div 
        className="w-full h-32 rounded-lg overflow-hidden relative"
        style={{ backgroundColor: preview.backgroundColor }}
      >
        {/* Simple preview rendering */}
        <div className="absolute inset-0 p-3">
          {preview.elements.slice(0, 3).map((element, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${element.x / 8}px`,
                top: `${element.y / 3}px`,
                color: element.fill || preview.textColor,
                fontSize: `${(element.fontSize || 16) / 2}px`,
                fontFamily: element.fontFamily || 'Arial',
                fontWeight: element.fontStyle === 'bold' ? 'bold' : 'normal'
              }}
            >
              {element.text || 'Sample Text'}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Builder</h1>
            <p className="text-gray-600 mt-2">Create and manage card design templates</p>
          </div>
          
          <button
            onClick={() => {
              setEditingTemplate(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Create Template
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
            
                    <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
                    </select>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiList className="h-5 w-5" />
              </button>
            </div>
          </div>
                  </div>

        {/* Templates Grid */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {/* Template Preview */}
              {renderTemplatePreview(template)}
              
              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                  <div className="flex items-center space-x-2">
                    {template.isFeatured && (
                      <FaStar className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {template.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{template.usageCount || 0} uses</span>
                  <span>{template.isActive ? 'Active' : 'Inactive'}</span>
              </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FiEdit className="mr-1 h-4 w-4" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleToggleFeatured(template.id, template.isFeatured)}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors text-sm ${
                      template.isFeatured
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {template.isFeatured ? <FaStar className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FaPalette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Create your first template to get started</p>
          </div>
        )}
      </div>

      {/* Template Builder Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingTemplate ? 'Edit Template' : 'Create Template'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Form */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                      
                  <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Template ID *
                          </label>
                          <input
                            type="text"
                            value={formData.id}
                            onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="professional-template"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Professional Template"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            required
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="A clean and professional design for business cards"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Design Settings */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Design Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Background Color
                            </label>
                            <input
                              type="color"
                              value={formData.design.backgroundColor}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                design: { ...prev.design, backgroundColor: e.target.value },
                                preview: { ...prev.preview, backgroundColor: e.target.value }
                              }))}
                              className="w-full h-10 border border-gray-300 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Text Color
                            </label>
                            <input
                              type="color"
                              value={formData.design.textColor}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                design: { ...prev.design, textColor: e.target.value },
                                preview: { ...prev.preview, textColor: e.target.value }
                              }))}
                              className="w-full h-10 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Font Family
                          </label>
                          <select
                            value={formData.design.fontFamily}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              design: { ...prev.design, fontFamily: e.target.value },
                              preview: { ...prev.preview, fontFamily: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              Layout
                          </label>
                          <select
                              value={formData.design.layout}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                design: { ...prev.design, layout: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {layouts.map(layout => (
                                <option key={layout.id} value={layout.id}>{layout.name}</option>
                              ))}
                          </select>
                        </div>
                          
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              Aspect Ratio
                          </label>
                            <select
                              value={formData.design.aspectRatio}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                design: { ...prev.design, aspectRatio: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {aspectRatios.map(ratio => (
                                <option key={ratio.id} value={ratio.id}>{ratio.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Settings */}
                        <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Status Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-700">
                            Active (visible to users)
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isFeatured}
                            onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-700">
                            Featured (highlighted in template selection)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Design Elements */}
                  <div className="space-y-6">
                        <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Design Elements</h3>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-700">Elements ({formData.design.elements.length})</span>
                          <button
                            type="button"
                            onClick={addElement}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <FiPlus className="mr-1 h-4 w-4" />
                            Add Element
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {formData.design.elements.map((element, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Element {index + 1} - {element.type}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeElement(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  placeholder="X"
                                  value={element.x}
                                  onChange={(e) => updateElement(index, 'x', parseInt(e.target.value))}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <input
                                  type="number"
                                  placeholder="Y"
                                  value={element.y}
                                  onChange={(e) => updateElement(index, 'y', parseInt(e.target.value))}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Text"
                                  value={element.text || ''}
                                  onChange={(e) => updateElement(index, 'text', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm col-span-2"
                                />
                          <input
                            type="number"
                                  placeholder="Font Size"
                                  value={element.fontSize}
                                  onChange={(e) => updateElement(index, 'fontSize', parseInt(e.target.value))}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <input
                                  type="color"
                                  value={element.fill}
                                  onChange={(e) => updateElement(index, 'fill', e.target.value)}
                                  className="w-full h-8 border border-gray-300 rounded"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
            </div>
          </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FiSave className="mr-2" />
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateBuilder; 