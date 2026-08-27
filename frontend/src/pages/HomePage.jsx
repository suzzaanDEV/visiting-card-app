import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowRight, FiUsers, FiGrid, FiEye, FiZap, FiStar, FiMail, FiPhone, FiGlobe, FiTrendingUp, FiClock, FiAward, FiBriefcase, FiMapPin } from 'react-icons/fi';
import { FaPalette, FaQrcode, FaShareAlt, FaMobileAlt, FaRocket, FaShieldAlt } from 'react-icons/fa';
import UnifiedNavigation from '../components/Layout/UnifiedNavigation';
import Logo from '../components/Layout/Logo';
import CardGrid from '../components/Cards/CardGrid';
import { fetchPopularCards, fetchRecentCards, fetchFeaturedCards, fetchSuggestions } from '../features/cards/cardsThunks';

const HomePage = () => {
  const dispatch = useDispatch();
  const { popularCards, recentCards, featuredCards, suggestions } = useSelector(state => state.cards);
  const { isAuthenticated } = useSelector(state => state.auth);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchPopularCards({ limit: 8 }));
    dispatch(fetchRecentCards({ limit: 8 }));
    dispatch(fetchFeaturedCards({ limit: 4 }));
    if (isAuthenticated) {
      dispatch(fetchSuggestions({ limit: 6 }));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.categories || data || []);
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const categoryIcons = {
    technology: '💻',
    business: '💼',
    creative: '🎨',
    education: '📚',
    health: '🏥',
    finance: '💰',
    marketing: '📢',
    design: '🎯',
    default: '📁'
  };

  const categoryColors = [
    'from-emerald-500 to-green-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-violet-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-teal-600',
    'from-yellow-500 to-amber-600',
    'from-indigo-500 to-blue-600',
  ];

  const features = [
    {
      icon: FaPalette,
      title: 'Beautiful Templates',
      description: 'Choose from our collection of professionally designed templates',
      color: 'from-emerald-500 to-green-600'
    },
    {
      icon: FaQrcode,
      title: 'QR Code Generation',
      description: 'Automatic QR codes for easy mobile sharing',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: FaShareAlt,
      title: 'Easy Sharing',
      description: 'Share your digital card with a simple link',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FaMobileAlt,
      title: 'Mobile Friendly',
      description: 'Perfect viewing experience on all devices',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Cards Created', icon: FiGrid },
    { number: '5K+', label: 'Happy Users', icon: FiUsers },
    { number: '50+', label: 'Templates', icon: FaPalette },
    { number: '99%', label: 'Uptime', icon: FiZap }
  ];

  const testimonials = [
    {
      name: 'Sujita Shrestha',
      role: 'Co-Founder',
      company: 'Nepali Craft Store',
      content: 'Cardly has revolutionized how we showcase our artisanal business. The digital cards look incredibly sleek and represent our traditional values modernly!',
      rating: 5
    },
    {
      name: 'Rohan Adhikari',
      role: 'Freelance Photographer',
      company: 'Rohan Studios Pokhara',
      content: 'I can update my portfolios and share my details instantly via the QR code. It makes networking at tourism events a total breeze.',
      rating: 5
    },
    {
      name: 'Pooja Karki',
      role: 'HR Manager',
      company: 'Nabil Bank',
      content: 'Our corporate teams love using Cardly. The professional designs and seamless analytics help us manage corporate networking efficiently.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      <UnifiedNavigation />

      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Tech Grid Texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        ></div>
        
        {/* Colorful blobs */}
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[5%] w-96 h-96 bg-emerald-500/20 rounded-full filter blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[10%] w-96 h-96 bg-teal-500/15 rounded-full filter blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -80, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[10%] left-[15%] w-[400px] h-[400px] bg-green-500/10 rounded-full filter blur-[140px]"
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              {/* Nepal Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6 backdrop-blur-md shadow-lg shadow-emerald-500/5 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300 cursor-default"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                🇳🇵 Proudly Crafted in Nepal
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight"
              >
                Your Digital Business Card
                <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent drop-shadow-sm">
                  Reimagined with Cardly
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto lg:mx-0 leading-relaxed"
              >
                Create stunning digital business cards that leave a lasting impression.
                Share instantly, track real-time analytics, and build your professional network across Nepal.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  to="/register"
                  className="relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 inline-flex items-center justify-center gap-2"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    Start Creating Free
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
                <Link
                  to="/about"
                  className="bg-slate-900/50 backdrop-blur-md border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-800/60 transition-all duration-300 inline-flex items-center justify-center"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex-1 hidden lg:flex justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotateY: 8, rotateX: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                className="relative group cursor-pointer"
              >
                {/* Card glow behind */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-40 blur-2xl group-hover:opacity-70 transition duration-500 animate-pulse"></div>
                
                {/* Glass card body */}
                <div className="relative w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl p-8 transform-gpu">
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">NFC Active</span>
                  </div>

                  <div className="flex items-center gap-4 mb-6" style={{ transform: 'translateZ(35px)' }}>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 text-xl font-bold shadow-md shadow-emerald-500/10">
                      RT
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-wide">Ram Bahadur Thapa</h4>
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Lead Architect</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3.5 text-sm text-slate-300" style={{ transform: 'translateZ(25px)' }}>
                    <div className="flex items-center gap-3 hover:text-white transition-colors">
                      <FiBriefcase className="text-emerald-400 shrink-0" />
                      <span className="truncate">Leapfrog Technology</span>
                    </div>
                    <div className="flex items-center gap-3 hover:text-white transition-colors">
                      <FiMail className="text-emerald-400 shrink-0" />
                      <span className="truncate">ram.thapa@company.com.np</span>
                    </div>
                    <div className="flex items-center gap-3 hover:text-white transition-colors">
                      <FiPhone className="text-emerald-400 shrink-0" />
                      <span>+977-9801234567</span>
                    </div>
                    <div className="flex items-center gap-3 hover:text-white transition-colors">
                      <FiMapPin className="text-emerald-400 shrink-0" />
                      <span>Kathmandu, Nepal</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800/80 flex justify-between items-center" style={{ transform: 'translateZ(15px)' }}>
                    <span className="text-xxs text-slate-500 font-medium">DIGITAL CARD</span>
                    <span className="text-sm font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">Cardly</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Suggested for You Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Suggested for You</h2>
            <p className="text-xl text-gray-400">
              {isAuthenticated ? 'Personalized card recommendations based on your interests' : 'Sign up to get personalized card recommendations'}
            </p>
          </motion.div>

          {isAuthenticated ? (
            suggestions.length > 0 ? (
              <CardGrid cards={suggestions} loading={false} emptyMessage="No suggestions available yet" />
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Discover more cards to get personalized suggestions</p>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiStar className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Get Personalized Suggestions</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Create an account to receive card recommendations tailored to your industry and interests.
              </p>
              <Link
                to="/register"
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 inline-flex items-center group"
              >
                Sign Up Free
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Explore by Category Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Explore by Category</h2>
            <p className="text-xl text-gray-400">Browse cards organized by industry and profession</p>
          </motion.div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-36 bg-white/5 rounded-xl animate-pulse border border-white/10" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, index) => {
                const slug = (cat.slug || cat.name || '').toLowerCase().replace(/\s+/g, '-');
                const icon = categoryIcons[slug] || categoryIcons.default;
                const color = categoryColors[index % categoryColors.length];
                return (
                  <motion.div
                    key={cat._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                  >
                    <Link
                      to={`/search?category=${slug}`}
                      className="block bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 h-full"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center mb-4 text-xl`}>
                        {icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{cat.name}</h3>
                      {cat.cardCount != null && (
                        <p className="text-sm text-gray-400">{cat.cardCount} cards</p>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No categories available</p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Cardly?</h2>
            <p className="text-xl text-gray-400">Everything you need to create professional digital business cards</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Get your digital business card in three simple steps</p>
          </motion.div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
            {[
              { step: '01', title: 'Create Your Card', description: 'Sign up and choose from dozens of professional templates tailored to your industry.', icon: FaRocket },
              { step: '02', title: 'Customize Design', description: 'Add your details, upload a photo, and personalize colors to match your brand.', icon: FaPalette },
              { step: '03', title: 'Share & Track', description: 'Share via QR code or link and monitor engagement with built-in analytics.', icon: FaShareAlt }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex-1 text-center relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-emerald-500/50 to-emerald-500/10"></div>
                )}
                <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mx-auto max-w-xs">
                  <item.icon className="text-emerald-400 text-2xl mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cards Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                <FiTrendingUp className="text-emerald-400" />
                Popular Cards
              </h2>
              <p className="text-xl text-gray-400">Most viewed cards on Cardly</p>
            </div>
            <Link
              to="/search?sortBy=views"
              className="hidden md:inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
            >
              View All <FiArrowRight className="ml-1" />
            </Link>
          </motion.div>
          <CardGrid
            cards={popularCards.data}
            loading={popularCards.loading}
            emptyMessage="No popular cards yet"
          />
        </div>
      </section>

      {/* Featured Cards Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                <FiAward className="text-yellow-400" />
                Featured Cards
              </h2>
              <p className="text-xl text-gray-400">Hand-picked cards by the Cardly team</p>
            </div>
          </motion.div>
          <CardGrid
            cards={featuredCards.data}
            loading={featuredCards.loading}
            emptyMessage="No featured cards yet"
          />
        </div>
      </section>

      {/* Recent Cards Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                <FiClock className="text-blue-400" />
                Recent Cards
              </h2>
              <p className="text-xl text-gray-400">Freshly created cards from the community</p>
            </div>
            <Link
              to="/search?sortBy=createdAt"
              className="hidden md:inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
            >
              View All <FiArrowRight className="ml-1" />
            </Link>
          </motion.div>
          <CardGrid
            cards={recentCards.data}
            loading={recentCards.loading}
            emptyMessage="No recent cards yet"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="text-white text-2xl" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <p className="text-center text-gray-500 text-sm uppercase tracking-widest">Trusted by teams at</p>
        </div>
        <div className="relative">
          <div className="flex animate-marquee whitespace-nowrap">
            {['Google', 'Microsoft', 'Spotify', 'Airbnb', 'Stripe', 'Slack', 'Notion', 'Figma', 'Google', 'Microsoft', 'Spotify', 'Airbnb', 'Stripe', 'Slack', 'Notion', 'Figma'].map((name, i) => (
              <span key={i} className="mx-12 text-2xl font-bold text-white/20 select-none">{name}</span>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
        `}</style>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-400">Join thousands of satisfied professionals</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              const initials = testimonial.name.split(' ').map(n => n[0]).join('');
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-400 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mr-4 text-white font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-gray-400">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 shadow-lg shadow-emerald-500/20"
          >
            <div className="bg-slate-900 rounded-2xl px-8 py-12">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Networking?</h2>
              <p className="text-xl text-gray-400 mb-8">Join thousands of professionals who have already upgraded to digital business cards</p>
              <Link
                to="/register"
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-4 rounded-xl text-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-2xl hover:shadow-green-500/25 inline-flex items-center group"
              >
                Start Creating Now
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Logo className="h-8 w-8 mr-3" color="white" />
              <span className="text-xl font-bold text-white">Cardly</span>
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; 2025 Cardly. Developed by Suzan Ghimire. All rights reserved.</p>
            <p className="mt-2 text-sm">Contact: sznghimire61@gmail.com | GitHub: @suzzaanDEV</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
