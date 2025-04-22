import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCardFromTemplate, fetchCardTemplates, fetchUserCards } from '../../features/cards/cardsThunks';
import { FiArrowLeft, FiUpload, FiEye, FiCheck, FiLoader } from 'react-icons/fi';
import { FaPalette, FaEdit, FaSave } from 'react-icons/fa';
import TemplateSelector from '../../components/TemplateSelector';
import LiveCardPreview from '../../components/LiveCardPreview';
import toast from 'react-hot-toast';

// Fallback templates in case backend is not available
const FALLBACK_TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean and modern design for business professionals',
    preview: {
      backgroundColor: '#ffffff',
      elements: [
        { type: 'Rect', x: 20, y: 20, width: 760, height: 440, fill: '#ffffff', stroke: '#e5e7eb', strokeWidth: 2, cornerRadius: 8 },
        { type: 'Text', x: 50, y: 60, text: 'John Smith', fontSize: 32, fill: '#1f2937', fontFamily: 'Arial', fontStyle: 'bold' },
        { type: 'Text', x: 50, y: 100, text: 'Software Engineer', fontSize: 18, fill: '#6b7280', fontFamily: 'Arial' },
        { type: 'Text', x: 50, y: 140, text: 'john.smith@email.com', fontSize: 16, fill: '#374151', fontFamily: 'Arial' },
        { type: 'Text', x: 50, y: 170, text: '+(977) 9xxxxxxxxx', fontSize: 16, fill: '#374151', fontFamily: 'Arial' },
        { type: 'Text', x: 50, y: 200, text: 'www.johnsmith.com', fontSize: 16, fill: '#3b82f6', fontFamily: 'Arial' },
        { type: 'Rect', x: 600, y: 50, width: 120, height: 120, fill: '#f3f4f6', stroke: '#d1d5db', strokeWidth: 1, cornerRadius: 4 }
      ]
    }
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and colorful design for creative professionals',
    preview: {
      backgroundColor: '#fef3c7',
      elements: [
        { type: 'Rect', x: 20, y: 20, width: 760, height: 440, fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 3, cornerRadius: 12 },
        { type: 'Rect', x: 40, y: 40, width: 200, height: 400, fill: '#f97316', cornerRadius: 8 },
        { type: 'Text', x: 280, y: 80, text: 'Sarah Johnson', fontSize: 36, fill: '#1f2937', fontFamily: 'Arial', fontStyle: 'bold' },
        { type: 'Text', x: 280, y: 130, text: 'Graphic Designer', fontSize: 20, fill: '#dc2626', fontFamily: 'Arial' },
        { type: 'Text', x: 280, y: 180, text: 'sarah@creative.com', fontSize: 16, fill: '#374151', fontFamily: 'Arial' },
        { type: 'Text', x: 280, y: 220, text: '+1 (555) 987-6543', fontSize: 16, fill: '#374151', fontFamily: 'Arial' },
        { type: 'Text', x: 280, y: 260, text: 'www.sarahjohnson.design', fontSize: 16, fill: '#dc2626', fontFamily: 'Arial' },
        { type: 'Circle', x: 650, y: 100, radius: 60, fill: '#fbbf24', stroke: '#f59e0b', strokeWidth: 2 }
      ]
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant design with clean typography',
    preview: {
      backgroundColor: '#fafafa',
      elements: [
        { type: 'Rect', x: 20, y: 20, width: 760, height: 440, fill: '#fafafa', stroke: '#d1d5db', strokeWidth: 1, cornerRadius: 4 },
        { type: 'Text', x: 60, y: 100, text: 'Alex Brown', fontSize: 28, fill: '#111827', fontFamily: 'Arial', fontStyle: 'bold' },
        { type: 'Text', x: 60, y: 140, text: 'Product Manager', fontSize: 16, fill: '#6b7280', fontFamily: 'Arial' },
        { type: 'Line', x: 60, y: 180, points: [0, 0, 200, 0], stroke: '#d1d5db', strokeWidth: 1 },
        { type: 'Text', x: 60, y: 220, text: 'alex@company.com', fontSize: 14, fill: '#374151', fontFamily: 'Arial' },
        { type: 'Text', x: 60, y: 250, text: '+1 (555) 456-7890', fontSize: 14, fill: '#374151', fontFamily: 'Arial' },
        { type: 'Text', x: 60, y: 280, text: 'linkedin.com/in/alexbrown', fontSize: 14, fill: '#3b82f6', fontFamily: 'Arial' }
      ]
    }
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Traditional business card design for corporate settings',
    preview: {
      backgroundColor: '#ffffff',
      elements: [
        { type: 'Rect', x: 20, y: 20, width: 760, height: 440, fill: '#ffffff', stroke: '#1f2937', strokeWidth: 2, cornerRadius: 0 },
        { type: 'Rect', x: 40, y: 40, width: 720, height: 80, fill: '#1f2937' },
        { type: 'Text', x: 60, y: 70, text: 'TECH SOLUTIONS INC.', fontSize: 20, fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' },
        { type: 'Text', x: 60, y: 100, text: 'Michael Davis', fontSize: 24, fill: '#1f2937', fontFamily: 'Arial', fontStyle: 'bold' },
        { type: 'Text', x: 60, y: 130, text: 'Senior Director', fontSize: 16, fill: '#6b7280', fontFamily: 'Arial' },
        { type: 'Text', x: 60, y: 160, text: 'michael.davis@company.com', fontSize: 14, fill: '#374151', fontFamily: 'Arial' },
        { type: 'Text', x: 60, y: 190, text: '+1 (555) 321-0987', fontSize: 14, fill: '#374151', fontFamily: 'Arial' },
        { type: 'Text', x: 60, y: 220, text: '123 Thamel Marg, Kathmandu', fontSize: 14, fill: '#374151', fontFamily: 'Arial' },
        { type: 'Text', x: 60, y: 250, text: 'Nepal 44600', fontSize: 14, fill: '#374151', fontFamily: 'Arial' }
      ]
    }
  }
];

// Simple preview renderer component
const TemplatePreview = ({ template, isSelected, onClick }) => {
  const { preview } = template;
  
  return (
    <div 
      className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
        isSelected 
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl scale-105' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div 
        className="w-full h-48 rounded-lg overflow-hidden"
        style={{ backgroundColor: preview.backgroundColor }}
      >
        {/* Simple preview rendering */}
        <div className="relative w-full h-full p-4">
          {preview.elements.map((element, index) => {
            if (element.type === 'Text') {
              return (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: element.x * 0.4,
                    top: element.y * 0.4,
                    fontSize: (element.fontSize || 16) * 0.4,
                    color: element.fill,
                    fontFamily: element.fontFamily,
                    fontWeight: element.fontStyle === 'bold' ? 'bold' : 'normal'
                  }}
                >
                  {element.text}
                </div>
              );
            }
            if (element.type === 'Rect') {
              return (
                <div
                  key={index}
                  className="absolute border"
                  style={{
                    left: element.x * 0.4,
                    top: element.y * 0.4,
                    width: (element.width || 100) * 0.4,
                    height: (element.height || 100) * 0.4,
                    backgroundColor: element.fill,
                    borderColor: element.stroke,
                    borderWidth: element.strokeWidth,
                    borderRadius: element.cornerRadius
                  }}
                />
              );
            }
            if (element.type === 'Circle') {
              return (
                <div
                  key={index}
                  className="absolute border rounded-full"
                  style={{
                    left: (element.x - element.radius) * 0.4,
                    top: (element.y - element.radius) * 0.4,
                    width: element.radius * 2 * 0.4,
                    height: element.radius * 2 * 0.4,
                    backgroundColor: element.fill,
                    borderColor: element.stroke,
                    borderWidth: element.strokeWidth
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
      
      <div className="p-3 bg-white">
        <h3 className="font-semibold text-gray-800">{template.name}</h3>
        <p className="text-sm text-gray-600">{template.description}</p>
      </div>
      
      {isSelected && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-1.5 shadow-lg">
          <FiCheck size={16} />
        </div>
      )}
    </div>
  );
};

const AddCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, templates } = useSelector((state) => state.cards);

  // Use templates from backend or fallback to local templates
  const cardTemplates = templates.length > 0 ? templates : FALLBACK_TEMPLATES;

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentStep, setCurrentStep] = useState('template'); // template, details, preview
  const [isCreatingCard, setIsCreatingCard] = useState(false); // Separate loading state for card creation
  const [formError, setFormError] = useState(null); // Form-specific error state
  const [formSuccess, setFormSuccess] = useState(false); // Form success state
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    website: '',
    company: '',
    address: '',
    bio: '',
    isPublic: true
  });
  const [cardImage, setCardImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Add form validation
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch templates on component mount
  useEffect(() => {
    dispatch(fetchCardTemplates());
  }, [dispatch]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setCardImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    if (template) {
      setCurrentStep('details');
    }
  };

  // Generate design JSON from template and form data
  const generateDesignJson = async () => {
    if (!selectedTemplate) return null;

    try {
      // Use the backend to generate design from template
      const response = await fetch(`/api/templates/${selectedTemplate.id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const design = await response.json();
        return design;
      } else {
        // Fallback to local generation
        const design = {
          width: 800,
          height: 480,
          backgroundColor: selectedTemplate.design?.backgroundColor || selectedTemplate.preview.backgroundColor,
          textColor: selectedTemplate.design?.textColor || '#000000',
          fontFamily: selectedTemplate.design?.fontFamily || 'Arial',
          elements: selectedTemplate.design?.elements || selectedTemplate.preview.elements
        };
        return design;
      }
    } catch (error) {
      console.error('Error generating design from template:', error);
      // Fallback to local generation
      const design = {
        width: 800,
        height: 480,
        backgroundColor: selectedTemplate.design?.backgroundColor || selectedTemplate.preview.backgroundColor,
        textColor: selectedTemplate.design?.textColor || '#000000',
        fontFamily: selectedTemplate.design?.fontFamily || 'Arial',
        elements: selectedTemplate.design?.elements || selectedTemplate.preview.elements
      };
      return design;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous form errors
    setFormError(null);
    setFormSuccess(false); // Clear success state

    if (!selectedTemplate) {
      setFormError('Please select a card design template');
      return;
    }

    if (!formData.fullName) {
      setFormError('Please fill in the required fields (Full Name)');
      return;
    }

    // Set loading state for card creation
    setIsCreatingCard(true);

    try {
      const designJson = await generateDesignJson();
      
      const cardData = {
        title: formData.title || formData.fullName,
        isPublic: formData.isPublic,
        templateId: selectedTemplate.id,
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        company: formData.company,
        address: formData.address,
        bio: formData.bio,
        backgroundColor: designJson?.backgroundColor,
        textColor: designJson?.textColor,
        fontFamily: designJson?.fontFamily,
        designJson: JSON.stringify(designJson)
      };

      // Only add cardImage if it exists
      if (cardImage) {
        cardData.cardImage = cardImage;
      }

      console.log('Sending card data:', cardData);
      console.log('Selected template:', selectedTemplate);

      const result = await dispatch(createCardFromTemplate(cardData)).unwrap();
      console.log('Card created successfully:', result);
      console.log('Result structure:', Object.keys(result));
      console.log('Card object:', result.card);
      
      if (!result.card || !result.card._id) {
        throw new Error('Card creation failed - no card ID returned');
      }
      
      setFormSuccess(true);
      setFormError(null);
      
      // Refresh the user cards to include the newly created card
      await dispatch(fetchUserCards({ page: 1, limit: 50 }));
      
      // Show success message before redirecting
      toast.success('Card created successfully! Redirecting to your cards...');
      
      // Redirect to cards page instead of library page
      setTimeout(() => {
        navigate('/cards');
      }, 1000);
    } catch (error) {
      console.error('Failed to create card:', error);
      const errorMessage = error.message || 'Failed to create card. Please try again.';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // Reset loading state
      setIsCreatingCard(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <FiArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Card</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'template' ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Card Design</h1>
              <p className="text-lg text-gray-600">Select a beautiful template to start creating your digital business card</p>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FiLoader className="animate-spin mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Templates</h3>
                  <p className="text-gray-600">Please wait while we fetch available templates...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Templates</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={() => dispatch(fetchCardTemplates())}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <TemplateSelector 
                templates={cardTemplates}
                onTemplateSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?.id}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
            {/* Loading Overlay */}
            {isCreatingCard && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
                <div className="text-center">
                  <FiLoader className="animate-spin mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Card</h3>
                  <p className="text-gray-600">Please wait while we generate your digital business card...</p>
                </div>
              </div>
            )}

            {/* Left Column - Card Details Form */}
            <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaEdit className="mr-2" />
                Card Information
              </h2>
              <p className="text-gray-600 mb-6">
                Fill in your details to customize the selected template.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="My Business Card"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Suzan Ghimire"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="Software Engineer"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      placeholder="Tech Solutions Inc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                
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
                      placeholder="example@cardly.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+(977) 9xxxxxxxxx"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      placeholder="www.cardlysolutions.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Thamel Marg, Kathmandu&#10;Nepal 44600"
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Image */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Image (Optional)</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <FiUpload className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max file size: 5MB. Supported formats: JPG, PNG, GIF
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Make this card public (visible to everyone)
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Public cards can be discovered by other users. Private cards are only visible to you.
                </p>
              </div>

              {/* Error Display */}
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{formError}</p>
                </div>
              )}

              {/* Success Display */}
              {formSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-sm">Your card has been created successfully!</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || !selectedTemplate || isCreatingCard}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isCreatingCard ? (
                    <>
                      <FiLoader className="animate-spin mr-2" size={16} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" size={16} />
                      Create Card
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Live Preview */}
          <div className="space-y-6">
            <LiveCardPreview 
              formData={formData}
              selectedTemplate={selectedTemplate}
              isEditing={false}
            />
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AddCard; 