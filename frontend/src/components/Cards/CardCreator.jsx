import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiBriefcase, FiMail, FiPhone, FiGlobe, FiMapPin,
  FiFileText, FiImage, FiSave, FiEye, FiX
} from 'react-icons/fi';
import { GiPalette } from 'react-icons/gi';
import { FaPalette, FaImage, FaEye } from 'react-icons/fa';

const CardCreator = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    jobTitle: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    bio: '',
    isPublic: true
  });

  const [selectedBackground, setSelectedBackground] = useState('gradient-blue');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef(null);

  const backgrounds = [
    { id: 'gradient-blue', name: 'Blue Gradient', class: 'bg-gradient-to-br from-blue-500 to-blue-700' },
    { id: 'gradient-purple', name: 'Purple Gradient', class: 'bg-gradient-to-br from-purple-500 to-purple-700' },
    { id: 'gradient-pink', name: 'Pink Gradient', class: 'bg-gradient-to-br from-pink-500 to-pink-700' },
    { id: 'gradient-green', name: 'Green Gradient', class: 'bg-gradient-to-br from-green-500 to-green-700' },
    { id: 'gradient-orange', name: 'Orange Gradient', class: 'bg-gradient-to-br from-orange-500 to-orange-700' },
    { id: 'gradient-red', name: 'Red Gradient', class: 'bg-gradient-to-br from-red-500 to-red-700' },
    { id: 'solid-white', name: 'Clean White', class: 'bg-white' },
    { id: 'solid-black', name: 'Elegant Black', class: 'bg-gray-900' },
    { id: 'abstract-1', name: 'Abstract 1', class: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' },
    { id: 'abstract-2', name: 'Abstract 2', class: 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500' },
    { id: 'abstract-3', name: 'Abstract 3', class: 'bg-gradient-to-br from-green-400 to-blue-500' },
    { id: 'abstract-4', name: 'Abstract 4', class: 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cardData = {
      ...formData,
      cardImage: selectedImage,
      backgroundColor: backgrounds.find(bg => bg.id === selectedBackground)?.class || 'bg-gradient-to-br from-blue-500 to-blue-700'
    };
    await onSubmit(cardData);
  };

  const CardPreview = () => (
    <div className="w-80 h-48 rounded-2xl shadow-2xl overflow-hidden relative">
      {/* Background */}
      <div className={`w-full h-full ${backgrounds.find(bg => bg.id === selectedBackground)?.class || 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
        {/* Image or Initials */}
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Card Background"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white">
            {getInitials(formData.fullName || 'AB')}
          </div>
        )}
        
        {/* Content Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-6">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-1">{formData.fullName || 'Your Name'}</h2>
            {formData.jobTitle && (
              <p className="text-lg mb-1">{formData.jobTitle}</p>
            )}
            {formData.company && (
              <p className="text-sm opacity-90">{formData.company}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Digital Business Card
          </h1>
          <p className="text-lg text-gray-600">
            Design a beautiful, professional digital business card that stands out
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiUser className="h-5 w-5 mr-2 text-blue-600" />
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
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., My Business Card"
                    />
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
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Suzan Ghimire"
                    />
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
                      placeholder="Tech Corp"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiMail className="h-5 w-5 mr-2 text-green-600" />
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ram.thapa@cardly.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://cardlysolutions.com"
                      />
                    </div>
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
                      placeholder="123 Business St, City, State 12345"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiFileText className="h-5 w-5 mr-2 text-purple-600" />
                  Bio
                </h3>
                
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell people about yourself, your expertise, and what you do..."
                />
              </div>

              {/* Design Options */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FaPalette className="h-5 w-5 mr-2 text-pink-600" />
                  Design Your Card
                </h3>
                
                {/* Background Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose Background
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {backgrounds.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setSelectedBackground(bg.id)}
                        className={`relative p-4 rounded-lg border-2 transition-all ${
                          selectedBackground === bg.id
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-full h-16 rounded ${bg.class}`}></div>
                        <p className="text-xs mt-2 text-gray-600">{bg.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload Profile Image (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaImage className="h-4 w-4 mr-2" />
                      Choose Image
                    </button>
                    {selectedImage && (
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <FiX className="h-4 w-4 mr-2" />
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Make this card public (visible to everyone)
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Card...
                    </>
                  ) : (
                    <>
                      <FiSave className="h-5 w-5 mr-2" />
                      Create Card
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  <FaEye className="h-5 w-5 mr-2" />
                  Preview
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Card Preview
              </h3>
              <p className="text-gray-600">See how your card will look</p>
            </div>
            
            <CardPreview />
            
            {previewMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-white rounded-lg shadow-lg"
              >
                <h4 className="font-semibold text-gray-900 mb-2">Card Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {formData.fullName || 'Not set'}</p>
                  <p><strong>Title:</strong> {formData.jobTitle || 'Not set'}</p>
                  <p><strong>Company:</strong> {formData.company || 'Not set'}</p>
                  <p><strong>Email:</strong> {formData.email || 'Not set'}</p>
                  <p><strong>Phone:</strong> {formData.phone || 'Not set'}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CardCreator; 