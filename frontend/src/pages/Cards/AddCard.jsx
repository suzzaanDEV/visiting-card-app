import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiGlobe, FiMapPin, FiFileText, 
  FiBriefcase, FiSave, FiArrowLeft, FiLock, FiX, FiPlus, FiTag, FiEye, FiEyeOff
} from 'react-icons/fi';
import { createCard } from '../../features/cards/cardsThunks';
import toast from 'react-hot-toast';
import LiveCardPreview from '../../components/LiveCardPreview';
import { isValidEmail, isValidPhone, isValidWebsite } from '../../utils/validation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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

const AddCard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.cards);

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
    backgroundColor: '#10B981',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    privacy: 'public',
    templateId: 'default',
    category: '',
    industry: '',
    profession: '',
  });

  const [skills, setSkills] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [errors, setErrors] = useState({});
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (res.ok) setCategories(data.categories || data || []);
      } catch { /* ignore */ }
    };
    const loadTemplates = async () => {
      try {
        const res = await fetch('/api/templates');
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.templates || data.data || []);
        setTemplates(list.filter(t => t.isActive !== false));
      } catch { /* ignore */ }
    };
    loadCategories();
    loadTemplates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const cardData = {
        ...formData,
        skills,
        services,
        products,
        privacy: formData.privacy,
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

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 transition-colors duration-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation back and Titles */}
        <div className="mb-8 select-none">
          <Button
            onClick={() => navigate('/cards')}
            variant="ghost"
            className="mb-4 pl-0 hover:bg-transparent text-brand-textMuted hover:text-brand-primary"
          >
            <FiArrowLeft className="mr-2" />
            Back to Cards
          </Button>
          <h1 className="text-3xl font-extrabold text-brand-text dark:text-white tracking-tight">Create Card</h1>
          <p className="text-xs text-brand-textMuted mt-1">Fill out information to configure your custom digital visiting card.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card elevation="sm" className="p-6 sm:p-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Section */}
                <div>
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
                </div>

                {/* Category Section */}
                <div>
                  <h3 className="text-base font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4 border-b border-brand-border/30 dark:border-slate-800/40 pb-2 flex items-center">
                    <FiTag className="mr-2 text-brand-primary" />
                    <span>Category & Tags</span>
                  </h3>

                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-xs font-semibold text-brand-text dark:text-brand-text/90 tracking-wide uppercase">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-brand-text border border-brand-border dark:border-slate-700 rounded-xl transition-all duration-200 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id || cat.slug} value={cat.slug || cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
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
                </div>

                {/* Contact Section */}
                <div>
                  <h3 className="text-base font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4 border-b border-brand-border/30 dark:border-slate-800/40 pb-2 flex items-center">
                    <FiMail className="mr-2 text-brand-primary" />
                    <span>Contact Info</span>
                  </h3>
                  
                  <div className="space-y-4">
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
                </div>

                {/* Bio text */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-brand-text dark:text-brand-text/90 tracking-wide uppercase">
                    Biography Description
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-brand-text border border-brand-border dark:border-slate-700 rounded-xl transition-all duration-200 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                    placeholder="Brief overview to display on card..."
                  />
                </div>

                {/* Templates Selecting options */}
                <div className="bg-brand-background dark:bg-slate-850 border border-brand-border/40 dark:border-slate-800/60 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-brand-text dark:text-white uppercase tracking-wider mb-3 flex items-center">
                    <FiBriefcase className="mr-2 text-brand-primary" />
                    <span>Select Template Layout</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templates.length > 0 ? templates.map((tmpl) => (
                      <label
                        key={tmpl.id || tmpl._id}
                        className={`relative p-3.5 border rounded-xl cursor-pointer transition-all flex items-start gap-3 select-none ${
                          formData.templateId === (tmpl.id || tmpl._id)
                            ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10' 
                            : 'border-brand-border dark:border-slate-700 bg-brand-surface dark:bg-slate-850 hover:border-brand-primary/45'
                        }`}
                      >
                        <input
                          type="radio"
                          name="templateId"
                          value={tmpl.id || tmpl._id}
                          checked={formData.templateId === (tmpl.id || tmpl._id)}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 border rounded-full mt-0.5 flex items-center justify-center flex-shrink-0 ${
                          formData.templateId === (tmpl.id || tmpl._id) ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-border'
                        }`}>
                          {formData.templateId === (tmpl.id || tmpl._id) && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-brand-text dark:text-white truncate">{tmpl.name}</p>
                          <p className="text-[10px] text-brand-textMuted mt-0.5 leading-normal">{tmpl.description || tmpl.category || 'Card template'}</p>
                          {tmpl.isPremium && <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full mt-1 inline-block">Premium</span>}
                        </div>
                      </label>
                    )) : [
                      { id: 'default', name: 'Classic Design', desc: 'Symmetric professional template' },
                      { id: 'modern', name: 'Modern Style', desc: 'Asymmetric stylish template' },
                      { id: 'minimal', name: 'Minimalist', desc: 'Simple elegant details template' },
                      { id: 'creative', name: 'Creative Accent', desc: 'Bold gradients artist template' }
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`relative p-3.5 border rounded-xl cursor-pointer transition-all flex items-start gap-3 select-none ${
                          formData.templateId === item.id 
                            ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10' 
                            : 'border-brand-border dark:border-slate-700 bg-brand-surface dark:bg-slate-850 hover:border-brand-primary/45'
                        }`}
                      >
                        <input
                          type="radio"
                          name="templateId"
                          value={item.id}
                          checked={formData.templateId === item.id}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 border rounded-full mt-0.5 flex items-center justify-center flex-shrink-0 ${
                          formData.templateId === item.id ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-border'
                        }`}>
                          {formData.templateId === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-brand-text dark:text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-brand-textMuted mt-0.5 leading-normal">{item.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Privacy config */}
                <div className="bg-brand-background dark:bg-slate-850 border border-brand-border/40 dark:border-slate-800/60 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-brand-text dark:text-white uppercase tracking-wider mb-3 flex items-center">
                    <FiLock className="mr-2 text-brand-primary" />
                    <span>Card Visibility Settings</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Public Card */}
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

                    {/* Private Card */}
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
                </div>

                {/* Color and Typography styles options */}
                <div>
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
                        className="px-3 py-2 bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-750 rounded-xl text-xs font-semibold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary/20 h-10 cursor-pointer"
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
                        className="px-3 py-2 bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-750 rounded-xl text-xs font-semibold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary/20 h-10 cursor-pointer"
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
                        className="px-3 py-2 bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-750 rounded-xl text-xs font-semibold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary/20 h-10 cursor-pointer"
                      >
                        {fontFamilies.map((font) => (
                          <option key={font.value} value={font.value}>{font.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mobile Preview Toggle */}
                <button
                  type="button"
                  onClick={() => setShowMobilePreview(!showMobilePreview)}
                  className="flex items-center justify-center gap-2 w-full py-3 border border-brand-border dark:border-slate-700 rounded-xl text-sm font-semibold text-brand-text dark:text-white bg-brand-surface dark:bg-slate-800 hover:bg-brand-border dark:hover:bg-slate-700 transition-colors lg:hidden"
                >
                  {showMobilePreview ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  {showMobilePreview ? 'Hide Preview' : 'Show Preview'}
                </button>

                {/* Submit action button */}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full justify-center py-3.5 shadow-md mt-6 text-sm"
                >
                  <FiSave className="mr-2" />
                  Save and Create Visiting Card
                </Button>

              </form>
            </Card>
          </motion.div>

          {/* Live Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col ${showMobilePreview ? 'block' : 'hidden'} lg:block`}
          >
            <Card elevation="sm" className="p-6 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80 sticky top-24">
              <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4">Live Design Preview</h3>
              <div className="p-1 bg-brand-background dark:bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-brand-border/20 dark:border-slate-800/50">
                <LiveCardPreview formData={formData} selectedTemplate={templates.find(t => (t.id || t._id) === formData.templateId) || null} />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddCard;
