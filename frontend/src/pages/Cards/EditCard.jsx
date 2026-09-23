import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { updateCard, fetchCard, fetchCardTemplates } from '../../features/cards/cardsThunks';
import { setCurrentCard } from '../../features/cards/cardsSlice';
import TemplateSelector from '../../components/TemplateSelector';
import CardRenderer from '../../components/Cards/CardRenderer';
import BrandLoader from '../../components/ui/BrandLoader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { isValidEmail, isValidPhone, isValidWebsite } from '../../utils/validation';
import {
  FiArrowLeft, FiSave, FiEye, FiEyeOff, FiUser, FiTag, FiMail, FiBriefcase, FiFileText, FiGlobe, FiLock, FiX, FiAlertCircle
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
  const { currentCard, isLoading, error, templates } = useSelector((state) => state.cards);
  const initializedCardId = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    jobTitle: '',
    company: '',
    profession: '',
    industry: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    bio: '',
    backgroundColor: '#10B981',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    category: '',
    privacy: 'public',
    templateId: ''
  });

  const [skills, setSkills] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cardId) {
      dispatch(setCurrentCard(null));
      dispatch(fetchCard(cardId));
    }
  }, [cardId, dispatch]);

  useEffect(() => {
    if (currentCard) {
      const card = currentCard.card || currentCard;
      const resolvedId = card._id || card.id;
      if (initializedCardId.current === resolvedId) return;

      initializedCardId.current = resolvedId;
      setFormData({
        title: card.title || '',
        fullName: card.fullName || '',
        jobTitle: card.jobTitle || '',
        company: card.company || '',
        profession: card.profession || '',
        industry: card.industry || '',
        email: card.email || '',
        phone: card.phone || '',
        website: card.website || '',
        address: card.address || '',
        bio: card.bio || '',
        backgroundColor: card.backgroundColor || '#10B981',
        textColor: card.textColor || '#ffffff',
        fontFamily: card.fontFamily || 'Arial',
        category: card.category || '',
        privacy: card.isPublic ? 'public' : 'private',
        templateId: card.templateId || ''
      });
      setSkills(Array.isArray(card.skills) ? card.skills : []);
      setServices(Array.isArray(card.services) ? card.services : []);
      setProducts(Array.isArray(card.products) ? card.products : []);
      setSelectedTemplate(card.templateId || '');
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
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    const td = (template.design) || {};
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      backgroundColor: td.backgroundColor || prev.backgroundColor || '#10B981',
      textColor: td.textColor || prev.textColor || '#ffffff',
      fontFamily: td.fontFamily || prev.fontFamily || 'Arial'
    }));
    if (errors.templateId) {
      setErrors(prev => ({ ...prev, templateId: '' }));
    }
  };

  const selectedTemplateObj = templates.find(t => (t.id || t._id) === selectedTemplate) || null;

  // Build the cardDesign used by both the live preview and the saved card so the
  // selected template's visual design is actually applied. Values the user sets via
  // the Visual Configurations selects win over the template for the shared fields
  // (backgroundColor/textColor/fontFamily); template accent/layout/borderRadius apply
  // unless the form overrides them.
  const buildCardDesign = () => {
    const td = (selectedTemplateObj && selectedTemplateObj.design) || {};
    return {
      backgroundColor: formData.backgroundColor || td.backgroundColor || '#10B981',
      textColor: formData.textColor || td.textColor || '#ffffff',
      accentColor: td.accentColor || formData.accentColor || '#047857',
      fontFamily: formData.fontFamily || td.fontFamily || 'Inter',
      backgroundImage: td.backgroundImage || formData.backgroundImage || '',
      borderRadius: td.borderRadius != null ? `${td.borderRadius}px` : (formData.borderRadius || '12px'),
      layout: td.layout || formData.layout || 'standard'
    };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Card title is required';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!selectedTemplateObj) {
      newErrors.templateId = 'Please select a template';
    }
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.website && !isValidWebsite(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCard = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateCard({
        cardId,
        cardData: {
          ...formData,
          skills,
          services,
          products,
          templateId: selectedTemplateObj ? selectedTemplateObj.id : '',
          cardDesign: buildCardDesign(),
          privacy: formData.privacy,
          isPublic: formData.privacy === 'public'
        }
      })).unwrap();

      toast.success('Card updated successfully!');
      const shortLink = currentCard?.card?.shortLink || currentCard?.shortLink;
      if (shortLink) {
        navigate(`/c/${shortLink}`);
      } else {
        navigate('/cards');
      }
    } catch (err) {
      console.error('Error updating card:', err);
      toast.error(err.message || 'Failed to update card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveCard();
  };

  if (isLoading && !currentCard) {
    return <BrandLoader full label="Loading card…" />;
  }

  if (error && !currentCard) {
    return (
      <div className="min-h-screen bg-brand-background dark:bg-slate-950 flex items-center justify-center px-4">
        <Card elevation="sm" className="max-w-md w-full p-8 text-center bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-brand-danger/10 dark:bg-red-900/20 mb-4">
            <FiAlertCircle className="h-6 w-6 text-brand-danger dark:text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-brand-text dark:text-white mb-2">Couldn&apos;t load this card</h2>
          <p className="text-sm text-brand-textMuted dark:text-slate-400 mb-6">{error}</p>
          <Button onClick={() => navigate('/cards')} variant="primary" className="w-full justify-center">
            <FiArrowLeft className="mr-2" />
            Back to Cards
          </Button>
        </Card>
      </div>
    );
  }

  const backgroundColors = [
    { name: 'Emerald Gradient', value: '#10B981' },
    { name: 'Deep Green Gradient', value: '#047857' },
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

  const selectClasses = "px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-brand-text border border-brand-border dark:border-slate-700 rounded-xl transition-all duration-200 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm";

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 transition-colors duration-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 select-none">
          <div>
            <Button
              onClick={() => navigate('/cards')}
              variant="ghost"
              className="mb-3 pl-0 hover:bg-transparent text-brand-textMuted hover:text-brand-primary"
            >
              <FiArrowLeft className="mr-2" />
              Back to Cards
            </Button>
            <h1 className="text-3xl font-extrabold text-brand-text dark:text-white tracking-tight">Edit Card</h1>
            <p className="text-xs text-brand-textMuted mt-1">Update your custom digital visiting card and save your changes.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              size="md"
              className="lg:hidden"
            >
              {showPreview ? <FiEyeOff className="mr-2" /> : <FiEye className="mr-2" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>

            <Button
              onClick={saveCard}
              isLoading={isSubmitting}
              disabled={!currentCard}
              size="md"
            >
              <FiSave className="mr-2" />
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Basic Details */}
                <Card elevation="sm" className="p-6 sm:p-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
                  <h3 className="text-base font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4 border-b border-brand-border/30 dark:border-slate-800/40 pb-2 flex items-center">
                    <FiUser className="mr-2 text-brand-primary" />
                    <span>Basic Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Card Title *"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      error={errors.title}
                      placeholder="e.g. Ram's Tech Solutions"
                    />
                    <Input
                      label="Full Name *"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      error={errors.fullName}
                      placeholder="e.g. Ram Bahadur Thapa"
                    />
                    <Input
                      label="Job Title"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g. Lead Developer"
                    />
                    <Input
                      label="Company Name"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Leapfrog Technology"
                    />
                    <Input
                      label="Profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleInputChange}
                      placeholder="e.g. Software Engineer"
                    />
                    <Input
                      label="Industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="e.g. Technology"
                    />
                  </div>
                </Card>

                {/* Category & Tags */}
                <Card elevation="sm" className="p-6 sm:p-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
                  <h3 className="text-base font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4 border-b border-brand-border/30 dark:border-slate-800/40 pb-2 flex items-center">
                    <FiTag className="mr-2 text-brand-primary" />
                    <span>Category &amp; Tags</span>
                  </h3>

                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-xs font-semibold text-brand-text dark:text-brand-text/90 tracking-wide uppercase">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={selectClasses}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id || cat.slug} value={cat.slug || cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <TagInput
                      label="Skills"
                      tags={skills}
                      setTags={setSkills}
                      placeholder="Type a skill and press Enter"
                    />
                    <TagInput
                      label="Services"
                      tags={services}
                      setTags={setServices}
                      placeholder="Type a service and press Enter"
                    />
                    <TagInput
                      label="Products"
                      tags={products}
                      setTags={setProducts}
                      placeholder="Type a product and press Enter"
                    />
                  </div>
                </Card>

                {/* Contact Info */}
                <Card elevation="sm" className="p-6 sm:p-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
                  <h3 className="text-base font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4 border-b border-brand-border/30 dark:border-slate-800/40 pb-2 flex items-center">
                    <FiMail className="mr-2 text-brand-primary" />
                    <span>Contact Info</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      placeholder="you@company.com.np"
                    />
                    <Input
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={errors.phone}
                      placeholder="+977-9800000000"
                    />
                    <Input
                      label="Website URL"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      error={errors.website}
                      placeholder="https://company.com.np"
                    />
                    <Input
                      label="Address Location"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Kathmandu, Nepal"
                    />
                  </div>
                </Card>

                {/* Bio */}
                <Card elevation="sm" className="p-6 sm:p-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
                  <h3 className="text-base font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4 border-b border-brand-border/30 dark:border-slate-800/40 pb-2 flex items-center">
                    <FiUser className="mr-2 text-brand-primary" />
                    <span>Biography Description</span>
                  </h3>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-brand-text border border-brand-border dark:border-slate-700 rounded-xl transition-all duration-200 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                    placeholder="Brief overview to display on card..."
                  />
                </Card>

                {/* Template Layout */}
                <Card elevation="sm" className="p-6 sm:p-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
                  <h3 className="text-base font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4 border-b border-brand-border/30 dark:border-slate-800/40 pb-2 flex items-center">
                    <FiBriefcase className="mr-2 text-brand-primary" />
                    <span>Select Template Layout</span>
                  </h3>

                  {errors.templateId && (
                    <p className="text-xs text-brand-danger mb-3">{errors.templateId}</p>
                  )}

                  <TemplateSelector
                    templates={templates || []}
                    selectedTemplateId={selectedTemplate}
                    onTemplateSelect={handleTemplateSelect}
                  />
                </Card>

                {/* Privacy */}
                <Card elevation="sm" className="p-6 sm:p-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
                  <h3 className="text-base font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4 border-b border-brand-border/30 dark:border-slate-800/40 pb-2 flex items-center">
                    <FiLock className="mr-2 text-brand-primary" />
                    <span>Card Visibility Settings</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`relative p-3.5 border rounded-xl cursor-pointer transition-all flex items-start gap-3 select-none ${
                      formData.privacy === 'public'
                        ? 'border-brand-success bg-brand-success/5 dark:bg-brand-success/10'
                        : 'border-brand-border dark:border-slate-700 bg-brand-surface dark:bg-slate-850 hover:border-brand-primary/45'
                    }`}>
                      <input
                        type="radio"
                        name="privacy"
                        value="public"
                        checked={formData.privacy === 'public'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border rounded-full mt-0.5 flex items-center justify-center flex-shrink-0 ${
                        formData.privacy === 'public' ? 'border-brand-success bg-brand-success text-white' : 'border-brand-border'
                      }`}>
                        {formData.privacy === 'public' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-brand-text dark:text-white flex items-center gap-1.5">
                          <FiGlobe className="text-brand-success text-xs" />
                          Public Card
                        </p>
                        <p className="text-[9px] text-brand-textMuted mt-1 leading-normal">
                          Searchable in public list. Shared with everyone.
                        </p>
                      </div>
                    </label>

                    <label className={`relative p-3.5 border rounded-xl cursor-pointer transition-all flex items-start gap-3 select-none ${
                      formData.privacy === 'private'
                        ? 'border-brand-danger bg-brand-danger/5 dark:bg-brand-danger/10'
                        : 'border-brand-border dark:border-slate-700 bg-brand-surface dark:bg-slate-850 hover:border-brand-primary/45'
                    }`}>
                      <input
                        type="radio"
                        name="privacy"
                        value="private"
                        checked={formData.privacy === 'private'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border rounded-full mt-0.5 flex items-center justify-center flex-shrink-0 ${
                        formData.privacy === 'private' ? 'border-brand-danger bg-brand-danger text-white' : 'border-brand-border'
                      }`}>
                        {formData.privacy === 'private' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-brand-text dark:text-white flex items-center gap-1.5">
                          <FiLock className="text-brand-danger text-xs" />
                          Private Card
                        </p>
                        <p className="text-[9px] text-brand-textMuted mt-1 leading-normal">
                          Only accessible via link/QR. Hidden from public list.
                        </p>
                      </div>
                    </label>
                  </div>
                </Card>

                {/* Visual Configurations */}
                <Card elevation="sm" className="p-6 sm:p-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
                  <h3 className="text-base font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4 border-b border-brand-border/30 dark:border-slate-800/40 pb-2 flex items-center">
                    <FiFileText className="mr-2 text-brand-primary" />
                    <span>Visual Configurations</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-brand-textMuted uppercase tracking-wider">Back Color</label>
                      <select
                        name="backgroundColor"
                        value={formData.backgroundColor}
                        onChange={handleInputChange}
                        className={`${selectClasses} h-10 cursor-pointer`}
                      >
                        {backgroundColors.map((color) => (
                          <option key={color.value} value={color.value}>{color.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-brand-textMuted uppercase tracking-wider">Text Color</label>
                      <select
                        name="textColor"
                        value={formData.textColor}
                        onChange={handleInputChange}
                        className={`${selectClasses} h-10 cursor-pointer`}
                      >
                        {textColors.map((color) => (
                          <option key={color.value} value={color.value}>{color.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-brand-textMuted uppercase tracking-wider">Font Family</label>
                      <select
                        name="fontFamily"
                        value={formData.fontFamily}
                        onChange={handleInputChange}
                        className={`${selectClasses} h-10 cursor-pointer`}
                      >
                        {fontFamilies.map((font) => (
                          <option key={font.value} value={font.value}>{font.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Save */}
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full justify-center py-3.5 shadow-md mt-6 text-sm"
                >
                  <FiSave className="mr-2" />
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col ${showPreview ? 'block' : 'hidden'} lg:block`}
          >
            <Card elevation="sm" className="p-6 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80 sticky top-24">
              <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4">Live Design Preview</h3>
              <div className="p-1 bg-brand-background dark:bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-brand-border/20 dark:border-slate-800/50">
                <div className="w-full h-72">
                  <CardRenderer
                    card={{
                      ...formData,
                      tags: [...skills, ...services, ...products],
                      socialLinks: {},
                      cardDesign: buildCardDesign()
                    }}
                    mode="editor"
                    className="w-full h-full"
                  />
                </div>
              </div>
              <p className="text-[10px] text-brand-textMuted mt-3">
                Preview updates instantly as you type. Changes are saved when you click Save.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EditCard;