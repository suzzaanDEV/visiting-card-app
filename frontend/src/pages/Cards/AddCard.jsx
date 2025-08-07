import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiGlobe, FiMapPin, FiFileText, 
  FiBriefcase, FiSave, FiArrowLeft, FiEye, FiEyeOff, FiLock
} from 'react-icons/fi';
import { createCard } from '../../features/cards/cardsThunks';
import toast from 'react-hot-toast';
import LiveCardPreview from '../../components/LiveCardPreview';

const AddCard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.cards);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    jobTitle: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: 'Kathmandu, Nepal',
    bio: '',
    backgroundColor: '#667eea',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    privacy: 'public',
    templateId: 'default' // Default template
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Card title is required';
    }

    if (!formData.templateId) {
      newErrors.templateId = 'Please select a template';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website) && !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const cardData = {
        ...formData,
        privacy: formData.privacy, // Send the privacy field
        isPublic: formData.privacy === 'public'
      };

      await dispatch(createCard(cardData)).unwrap();
      toast.success('Card created successfully!');
      navigate('/cards');
    } catch (error) {
      toast.error(error.message || 'Failed to create card');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/cards')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Cards
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Card</h1>
          <p className="text-gray-600">Design your digital business card</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiUser className="mr-2" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., John Doe - Software Engineer"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tech Solutions Nepal"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiMail className="mr-2" />
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john.doe@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+977-123456789"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.website ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="https://www.example.com"
                    />
                    {errors.website && (
                      <p className="text-red-500 text-sm mt-1">{errors.website}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Kathmandu, Nepal"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Template Selection */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiBriefcase className="mr-2 text-purple-600" />
                  Template Selection
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Your Card Template
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'default', name: 'Classic Template', description: 'Clean and professional design' },
                        { id: 'modern', name: 'Modern Template', description: 'Contemporary and stylish' },
                        { id: 'minimal', name: 'Minimal Template', description: 'Simple and elegant' },
                        { id: 'creative', name: 'Creative Template', description: 'Bold and artistic' }
                      ].map((template) => (
                        <label
                          key={template.id}
                          className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            formData.templateId === template.id 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="templateId"
                            value={template.id}
                            checked={formData.templateId === template.id}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="flex items-start">
                            <div className={`w-5 h-5 border-2 rounded-full mr-3 mt-1 flex items-center justify-center ${
                              formData.templateId === template.id 
                                ? 'border-purple-500 bg-purple-500' 
                                : 'border-gray-300'
                            }`}>
                              {formData.templateId === template.id && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {template.name}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {template.description}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.templateId && (
                      <p className="text-red-500 text-sm mt-2">{errors.templateId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiLock className="mr-2 text-blue-600" />
                  Privacy Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Card Visibility
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        formData.privacy === 'public' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="privacy"
                          value="public"
                          checked={formData.privacy === 'public'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-start">
                          <div className={`w-5 h-5 border-2 rounded-full mr-3 mt-1 flex items-center justify-center ${
                            formData.privacy === 'public' 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {formData.privacy === 'public' && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center">
                              <FiGlobe className="w-4 h-4 mr-2 text-green-600" />
                              Public Card
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              • Visible in discovery section<br/>
                              • Searchable by others<br/>
                              • Shareable via link and QR code
                            </div>
                          </div>
                        </div>
                      </label>
                      
                      <label className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        formData.privacy === 'private' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="privacy"
                          value="private"
                          checked={formData.privacy === 'private'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-start">
                          <div className={`w-5 h-5 border-2 rounded-full mr-3 mt-1 flex items-center justify-center ${
                            formData.privacy === 'private' 
                              ? 'border-orange-500 bg-orange-500' 
                              : 'border-gray-300'
                          }`}>
                            {formData.privacy === 'private' && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center">
                              <FiLock className="w-4 h-4 mr-2 text-orange-600" />
                              Private Card
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              • Only accessible via QR code<br/>
                              • Not visible in discovery<br/>
                              • Maximum privacy protection
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Privacy Notice */}
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Privacy Note:</strong> {formData.privacy === 'public' 
                        ? 'Your card will be visible to everyone in the discovery section. Contact information will be masked for non-authenticated users.'
                        : 'Your card will only be accessible via direct link or QR code. It will not appear in public discovery sections.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Design Settings */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiBriefcase className="mr-2" />
                  Design Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <select
                      name="backgroundColor"
                      value={formData.backgroundColor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {backgroundColors.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <select
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {textColors.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Family
                    </label>
                    <select
                      name="fontFamily"
                      value={formData.fontFamily}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {fontFamilies.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Card...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Create Card
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Preview</h3>
                            <LiveCardPreview formData={formData} selectedTemplate={selectedTemplate} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddCard; 