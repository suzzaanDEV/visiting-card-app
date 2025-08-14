import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { updateCard, fetchPublicCard } from '../../features/cards/cardsThunks';
import { fetchCardTemplates } from '../../features/cards/cardsThunks';
import TemplateSelector from '../../components/TemplateSelector';
import CardEditor from '../../components/CardEditor';
import PrivacyToggle from '../../components/Cards/PrivacyToggle';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, FiUpload, FiEye, FiCheck, FiLoader, FiSave, FiGlobe, FiLock
} from 'react-icons/fi';

const EditCard = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCard, isLoading, error } = useSelector((state) => state.cards);
  const { templates } = useSelector((state) => state.cards);
  
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
    backgroundColor: '#667eea',
    textColor: '#ffffff',
    fontFamily: 'Arial'
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardPrivacy, setCardPrivacy] = useState('public');

  useEffect(() => {
    if (cardId) {
      dispatch(fetchPublicCard(cardId));
    }
  }, [cardId, dispatch]);

  useEffect(() => {
    if (currentCard) {
      const card = currentCard.card || currentCard;
      setFormData({
        title: card.title || '',
        fullName: card.fullName || '',
        jobTitle: card.jobTitle || '',
        company: card.company || '',
        email: card.email || '',
        phone: card.phone || '',
        website: card.website || '',
        address: card.address || '',
        bio: card.bio || '',
        backgroundColor: card.backgroundColor || '#667eea',
        textColor: card.textColor || '#ffffff',
        fontFamily: card.fontFamily || 'Arial'
      });
      
      if (card.templateId) {
        setSelectedTemplate(card.templateId);
      }
      
      // Set privacy from card data
      setCardPrivacy(card.isPublic ? 'public' : 'private');
    }
  }, [currentCard]);

  useEffect(() => {
    // Fetch templates with error handling
    const loadTemplates = async () => {
      try {
        await dispatch(fetchCardTemplates()).unwrap();
      } catch (error) {
        console.error('Failed to load templates:', error);
        toast.error('Failed to load templates. Please try again.');
      }
    };
    
    loadTemplates();
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
  };

  const handlePrivacyChange = (newPrivacy) => {
    setCardPrivacy(newPrivacy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await dispatch(updateCard({ 
        cardId, 
        cardData: { 
          ...formData, 
          templateId: selectedTemplate,
          isPublic: cardPrivacy === 'public'
        } 
      })).unwrap();
      
      toast.success('Card updated successfully!');
      navigate(`/cards/${cardId}`);
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error(error.message || 'Failed to update card');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/cards')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/cards')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
              <span>Back to Cards</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Privacy Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Privacy:</span>
              <PrivacyToggle
                cardId={cardId}
                initialPrivacy={cardPrivacy}
                onPrivacyChange={handlePrivacyChange}
                showLabel={false}
                size="md"
              />
            </div>
            
            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiEye className="h-4 w-4" />
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
            
            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <FiLoader className="animate-spin h-4 w-4" />
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Section */}
          <div className="space-y-6">
            {/* Template Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h3>
              <TemplateSelector
                templates={templates || []}
                selectedTemplate={selectedTemplate}
                onTemplateSelect={handleTemplateSelect}
              />
            </div>

            {/* Card Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Information</h3>
              <CardEditor
                formData={formData}
                onInputChange={handleInputChange}
              />
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                {/* Add your card preview component here */}
                <div className="text-center text-gray-500">
                  Card preview will be displayed here
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCard;