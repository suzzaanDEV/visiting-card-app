import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateCard, fetchCard } from '../../features/cards/cardsThunks';
import { fetchCardTemplates } from '../../features/cards/cardsThunks';
import TemplateSelector from '../../components/TemplateSelector';
import CardEditor from '../../components/CardEditor';
import PrivacyToggle from '../../components/Cards/PrivacyToggle';
import CardRenderer from '../../components/Cards/CardRenderer';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, FiUpload, FiEye, FiCheck, FiLoader, FiSave, FiGlobe, FiLock, FiX, FiPlus, FiTag
} from 'react-icons/fi';

const TagInput = ({ label, tags, setTags, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-brand-text dark:text-brand-text/90 tracking-wide uppercase">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2.5 bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700 rounded-xl min-h-[42px] focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all duration-200">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary/10 dark:bg-emerald-900/30 text-brand-primary dark:text-emerald-400 text-xs font-semibold rounded-lg">
            <FiTag className="h-3 w-3" />
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-brand-danger transition-colors cursor-pointer">
              <FiX className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-brand-text dark:text-white outline-none placeholder:text-brand-textMuted/60"
        />
      </div>
    </div>
  );
};

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
    backgroundColor: '#10B981',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    category: '',
    industry: '',
    profession: ''
  });

  const [skills, setSkills] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardPrivacy, setCardPrivacy] = useState('public');

  useEffect(() => {
    if (cardId) {
      dispatch(fetchCard(cardId));
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
        backgroundColor: card.backgroundColor || '#10B981',
        textColor: card.textColor || '#ffffff',
        fontFamily: card.fontFamily || 'Arial',
        category: card.category || '',
        industry: card.industry || '',
        profession: card.profession || ''
      });
      setSkills(Array.isArray(card.skills) ? card.skills : []);
      setServices(Array.isArray(card.services) ? card.services : []);
      setProducts(Array.isArray(card.products) ? card.products : []);
      
      if (card.templateId) {
        setSelectedTemplate(card.templateId);
      }
      
      // Set privacy from card data
      setCardPrivacy(card.isPublic ? 'public' : 'private');
    }
  }, [currentCard]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (res.ok) setCategories(data.categories || data || []);
      } catch { /* ignore */ }
    };
    loadCategories();
  }, []);

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
          skills,
          services,
          products,
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Loading card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/cards')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Back to Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/cards')}
              className="flex items-center space-x-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
              <span>Back to Cards</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Privacy Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Privacy:</span>
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
              className="flex items-center space-x-2 bg-gray-600 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-slate-600 transition-colors"
            >
              <FiEye className="h-4 w-4" />
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
            
            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Choose Template</h3>
              <TemplateSelector
                templates={templates || []}
                selectedTemplate={selectedTemplate}
                onTemplateSelect={handleTemplateSelect}
              />
            </div>

            {/* Card Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Card Information</h3>
              
              <div className="space-y-4">
                {/* Basic fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Card Title *</label>
                    <input name="title" value={formData.title} onChange={handleInputChange}
                      className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Ram's Tech Solutions" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Full Name *</label>
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange}
                      className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Ram Bahadur Thapa" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Job Title</label>
                    <input name="jobTitle" value={formData.jobTitle} onChange={handleInputChange}
                      className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Lead Developer" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Company</label>
                    <input name="company" value={formData.company} onChange={handleInputChange}
                      className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Leapfrog Technology" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Profession</label>
                    <input name="profession" value={formData.profession} onChange={handleInputChange}
                      className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Software Engineer" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Industry</label>
                    <input name="industry" value={formData.industry} onChange={handleInputChange}
                      className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Technology" />
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}
                    className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat.slug} value={cat.slug || cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <TagInput label="Skills" tags={skills} setTags={setSkills} placeholder="Type a skill and press Enter" />
                <TagInput label="Services" tags={services} setTags={setServices} placeholder="Type a service and press Enter" />
                <TagInput label="Products" tags={products} setTags={setProducts} placeholder="Type a product and press Enter" />

                {/* Contact fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                      className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="you@company.com.np" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Phone</label>
                    <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange}
                      className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="+977-9800000000" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Website</label>
                    <input name="website" type="url" value={formData.website} onChange={handleInputChange}
                      className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="https://company.com.np" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Address</label>
                    <input name="address" value={formData.address} onChange={handleInputChange}
                      className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Kathmandu, Nepal" />
                  </div>
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Brief overview to display on card..." />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Preview</h3>
              <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="w-full h-72">
                  <CardRenderer
                    card={{
                      ...formData,
                      socialLinks: (skills.length > 0 || services.length > 0) ? {} : {},
                      cardDesign: {
                        backgroundColor: formData.backgroundColor || '#10B981',
                        textColor: formData.textColor || '#ffffff',
                        accentColor: '#047857',
                        fontFamily: formData.fontFamily || 'Inter',
                        backgroundImage: '',
                        borderRadius: '12px',
                        layout: 'standard'
                      }
                    }}
                    mode="editor"
                    className="w-full h-full"
                  />
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
