import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useReducedMotion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiArrowRight, FiCheck, FiUsers, FiEye,
  FiTrendingUp, FiShare2, FiBarChart2, FiHeart, FiDownload,
  FiSearch, FiSmartphone, FiLayers
} from 'react-icons/fi';
import {
  FaPalette, FaQrcode
} from 'react-icons/fa';
import UnifiedNavigation from '../components/Layout/UnifiedNavigation';
import Logo from '../components/Layout/Logo';
import CardRenderer from '../components/Cards/CardRenderer';
import CardGrid from '../components/Cards/CardGrid';
import { fetchPopularCards } from '../features/cards/cardsThunks';
import { API_BASE_URL } from '../services/apiService';

// ── SEO Hook ──
function useSEO() {
  useEffect(() => {
    document.title = 'Cardly — Your Digital Business Card | One Beautiful Card';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Create, customize and share a professional digital business card that makes every connection memorable. Beautiful templates, QR sharing, and analytics.');
    
    let og = document.querySelector('meta[property="og:title"]');
    if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:title'); document.head.appendChild(og); }
    og.setAttribute('content', 'Cardly — Your Digital Business Card');

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    ogDesc.setAttribute('content', 'Create, customize and share a professional digital business card.');

    let tw = document.querySelector('meta[name="twitter:card"]');
    if (!tw) { tw = document.createElement('meta'); tw.setAttribute('name', 'twitter:card'); document.head.appendChild(tw); }
    tw.setAttribute('content', 'summary_large_image');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', window.location.origin + '/');

    // JSON-LD structured data
    let sd = document.getElementById('landing-jsonld');
    if (sd) sd.remove();
    sd = document.createElement('script');
    sd.id = 'landing-jsonld';
    sd.type = 'application/ld+json';
    sd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Cardly',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Create, customize and share a professional digital business card that makes every connection memorable.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    });
    document.head.appendChild(sd);

    return () => {
      const node = document.getElementById('landing-jsonld');
      if (node) node.remove();
    };
  }, []);
}

// ── Scroll Reveal Wrapper ──
function Reveal({ children, className = '', delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const prefersReducedMotion = useReducedMotion();

  const dirMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };
  const offset = dirMap[direction] || dirMap.up;

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, ...offset }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : prefersReducedMotion ? undefined : { opacity: 0, ...offset }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Gradient Text Helper ──
function GradientText({ children, className = '' }) {
  return (
    <span className={`bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════════════════
const LandingPage = () => {
  useSEO();
  const dispatch = useDispatch();
  const { popularCards } = useSelector(state => state.cards);

  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    dispatch(fetchPopularCards({ limit: 6 }));
  }, [dispatch]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/templates/featured?limit=6`);
        const data = await res.json();
        let list = data.templates || data;

        // Top up with the broader collection when fewer than 6 are featured
        if (!Array.isArray(list) || list.length < 6) {
          try {
            const res2 = await fetch(`${API_BASE_URL}/templates?limit=18`);
            const data2 = await res2.json();
            const all = data2.templates || data2;
            const seen = new Set((Array.isArray(list) ? list : []).map((t) => t.id || t._id));
            const extra = (Array.isArray(all) ? all : []).filter((t) => !seen.has(t.id || t._id));
            list = [...(Array.isArray(list) ? list : []), ...extra];
          } catch {
            // keep the featured list as-is
          }
        }

        setFeaturedTemplates((Array.isArray(list) ? list : []).slice(0, 6));
      } catch {
        setFeaturedTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const hasPopular = popularCards.data && popularCards.data.length > 0;
  const hasTemplates = featuredTemplates.length > 0;

  // Sample card for hero preview (use first popular card or a default)
  const heroCard = popularCards.data?.[0] || {
    fullName: 'Sarah Chen',
    jobTitle: 'Product Designer',
    company: 'Vercel',
    email: 'sarah@vercel.com',
    phone: '+1 (555) 123-4567',
    website: 'vercel.com',
    city: 'San Francisco',
    country: 'USA',
    bio: 'Crafting beautiful digital experiences that make a difference.',
    socialLinks: { linkedin: 'https://linkedin.com', twitter: 'https://twitter.com' },
    cardDesign: { backgroundColor: '#10B981', textColor: '#ffffff', accentColor: '#047857', fontFamily: 'Inter', borderRadius: 16, layout: 'modern' }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <UnifiedNavigation />

      <HeroSection heroCard={heroCard} />
      <ProductShowcaseSection />
      <FeaturesSection />
      <TemplateShowcaseSection templates={featuredTemplates} loading={templatesLoading} hasTemplates={hasTemplates} />
      <HowItWorksSection />
      <DiscoverySection popularCards={popularCards} hasPopular={hasPopular} />
      <QRSection />
      <AnalyticsPreviewSection />
      <FinalCTASection />
      <LandingFooter />
    </div>
  );
};

// ═══════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════
function HeroSection({ heroCard }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-0">
      {/* Subtle Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-emerald-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-teal-500/5 to-transparent rounded-full blur-3xl" />
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <motion.div style={{ y: y1, opacity }} className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left — Copy */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Digital Business Cards
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
                Your identity.
                <br />
                <GradientText>One beautiful card.</GradientText>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                Create, customize and share a professional digital business card that makes every connection memorable.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 text-white text-base font-semibold transition-all duration-300 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                >
                  Create Your Card <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/discover"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-base font-semibold transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                >
                  Explore Cards
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><FiCheck className="text-emerald-500" /> Free to create</span>
                <span className="flex items-center gap-1.5"><FiCheck className="text-emerald-500" /> No app needed</span>
                <span className="flex items-center gap-1.5"><FiCheck className="text-emerald-500" /> Share anywhere</span>
              </div>
            </Reveal>
          </div>

          {/* Right — Interactive Card Preview */}
          <Reveal direction="right" delay={0.3} className="flex-1 flex justify-center lg:justify-end w-full max-w-md lg:max-w-none">
            <div className="relative w-full max-w-sm">
              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl opacity-60" />
              
              {/* Card */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                style={{ aspectRatio: '3/4' }}
              >
                <CardRenderer card={heroCard} className="w-full h-full" />
              </motion.div>

              {/* Floating Elements */}
              <FloatingBadge icon={FaQrcode} label="QR Sharing" position="top-[-12px] right-[-20px]" delay={0.6} />
              <FloatingBadge icon={FiBarChart2} label="Analytics" position="bottom-[40%] left-[-30px]" delay={0.8} />
              <FloatingBadge icon={FiHeart} label="Contact Saved" position="bottom-[-12px] left-[10%]" delay={1.0} />
              <FloatingBadge icon={FiEye} label="1.2K Views" position="top-[30%] right-[-40px]" delay={1.2} />
            </div>
          </Reveal>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500"
      >
        <span className="text-xs font-medium tracking-wide uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 flex justify-center pt-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 rounded-full bg-slate-400 dark:bg-slate-500"
          />
        </div>
      </motion.div>
    </section>
  );
}

function FloatingBadge({ icon: Icon, label, position, delay }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`absolute ${position} z-20`}
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-lg shadow-slate-200 dark:shadow-slate-900 border border-slate-200 dark:border-slate-700"
      >
        <Icon className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{label}</span>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// PRODUCT SHOWCASE
// ═══════════════════════════════════════════════════
function ProductShowcaseSection() {
  const steps = [
    { step: '01', title: 'Create', desc: 'Sign up and add your professional details.', icon: FiLayers },
    { step: '02', title: 'Design', desc: 'Choose from beautiful templates and customize.', icon: FaPalette },
    { step: '03', title: 'Share', desc: 'Share via link, QR code or contact download.', icon: FiShare2 },
  ];

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3">How Cardly Works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            From creation to connection
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get your digital business card in three simple steps
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((item, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <div className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 tracking-widest">{item.step}</span>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// FEATURES (BENTO GRID)
// ═══════════════════════════════════════════════════
function FeaturesSection() {
  const features = [
    { icon: FiLayers, title: 'Digital Business Cards', desc: 'Create professional cards instantly with your details, photo and branding.', span: 'md:col-span-2 md:row-span-1', color: 'from-emerald-500 to-teal-500' },
    { icon: FaPalette, title: 'Beautiful Templates', desc: 'Choose from admin-managed aesthetic card backgrounds and layouts.', span: 'md:col-span-1 md:row-span-1', color: 'from-purple-500 to-violet-500' },
    { icon: FaQrcode, title: 'QR Sharing', desc: 'Share your card instantly through a beautiful, scannable QR code.', span: 'md:col-span-1 md:row-span-1', color: 'from-blue-500 to-cyan-500' },
    { icon: FiSearch, title: 'Smart Discovery', desc: 'Search and discover cards by name, profession, category, location and more.', span: 'md:col-span-1 md:row-span-1', color: 'from-orange-500 to-amber-500' },
    { icon: FiBarChart2, title: 'Analytics', desc: 'Understand views, clicks and engagement with real-time card analytics.', span: 'md:col-span-2 md:row-span-1', color: 'from-pink-500 to-rose-500' },
    { icon: FiUsers, title: 'Contact & CRM', desc: 'Manage contacts and inquiries from your professional network.', span: 'md:col-span-1 md:row-span-1', color: 'from-teal-500 to-emerald-500' },
    { icon: FiTrendingUp, title: 'Dynamic Recommendations', desc: 'Discover relevant people and cards based on real profile and category data.', span: 'md:col-span-1 md:row-span-1', color: 'from-indigo-500 to-blue-500' },
    { icon: FiSmartphone, title: 'Notifications', desc: 'Receive important in-app, email and push notifications.', span: 'md:col-span-1 md:row-span-1', color: 'from-yellow-500 to-orange-500' },
  ];

  return (
    <section id="features" className="py-24 sm:py-32 bg-slate-50/50 dark:bg-slate-900/30 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Professional digital cards with powerful features to grow your network
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 0.06} className={f.span}>
              <div className="group relative h-full p-6 lg:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// TEMPLATE SHOWCASE
// ═══════════════════════════════════════════════════
const SHOWCASE_SAMPLE = {
  fullName: 'Suzan Ghimire',
  jobTitle: 'Software Engineer',
  company: 'Leapfrog Technology',
  email: 'suzan.ghimire@leapfrog.com.np',
  phone: '+977-9801234567',
  website: 'leapfrog.com.np',
  city: 'Kathmandu',
  country: 'Nepal',
  bio: 'Full stack developer crafting clean, modern digital experiences.'
};

function isLightHex(color) {
  if (!color || typeof color !== 'string' || !color.startsWith('#')) return false;
  const c = color.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function TemplateShowcaseSection({ templates, loading, hasTemplates }) {
  const displayTemplates = templates.slice(0, 6);

  return (
    <section id="templates" className="relative py-24 sm:py-32 scroll-mt-16 overflow-hidden">
      {/* Ambient background accents */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-b from-emerald-500/6 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-teal-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3">Templates</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            <GradientText>Beautiful by default</GradientText>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose from professionally designed templates and make every card yours.
          </p>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : hasTemplates ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {displayTemplates.map((template, i) => (
                <Reveal key={template.id || template._id || i} delay={i * 0.08}>
                  <TemplateShowcaseCard template={template} />
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <div className="text-center mt-12">
                <Link
                  to="/cards/add"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:gap-3 transition-all duration-300"
                >
                  Start creating your card <FiArrowRight />
                </Link>
                <div className="mt-4">
                  <Link
                    to="/cards/add"
                    className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-2 transition-all duration-300"
                  >
                    Browse all templates <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </>
        ) : (
          <EmptyState
            icon={FaPalette}
            title="Templates Coming Soon"
            description="Beautiful templates are being curated. Check back soon!"
          />
        )}
      </div>
    </section>
  );
}

function TemplateShowcaseCard({ template }) {
  const design = template.design || template.preview || {};
  const lightBackground = isLightHex(design.backgroundColor);

  // Mirrors how a real card is rendered (CardRenderer), using the template's
  // design palette and layout with sample contact data.
  const previewCard = {
    ...SHOWCASE_SAMPLE,
    template,
    cardDesign: design,
    backgroundColor: design.backgroundColor,
    textColor: design.textColor,
    accentColor: design.accentColor,
    fontFamily: design.fontFamily
  };

  return (
    <Link
      to="/cards/add"
      className="group relative block aspect-[4/5] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all duration-300"
    >
      <CardRenderer card={previewCard} className="w-full h-full" />

      {/* Legibility scrim */}
      <div
        className={`absolute inset-x-0 bottom-0 h-2/5 pointer-events-none transition-opacity ${
          lightBackground
            ? 'bg-gradient-to-t from-black/25 via-black/10 to-transparent'
            : 'bg-gradient-to-t from-black/75 via-black/35 to-transparent'
        }`}
      />

      {/* Hover CTA */} 
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-emerald-700 text-sm font-semibold shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Use this template <FiArrowRight className="h-4 w-4" />
        </span>
      </div>

      {/* PRO badge */}
      {template.isPremium && (
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[10px] font-bold uppercase tracking-widest shadow">
          PRO
        </span>
      )}

      {/* Name + category */}
      <div className={`absolute inset-x-0 bottom-0 p-4 sm:p-5 ${lightBackground ? '' : 'text-white'}`}>
        <h3 className="text-lg font-bold leading-tight mb-0.5 drop-shadow-sm">{template.name}</h3>
        <p className={`text-xs capitalize ${lightBackground ? 'text-slate-600 dark:text-slate-200' : 'text-white/80'}`}>
          {template.category || 'Template'}
        </p>
      </div>
    </Link>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-16 px-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-emerald-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// HOW IT WORKS (detailed)
// ═══════════════════════════════════════════════════
function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Create', desc: 'Add your professional information — name, title, company, contact details and more.', icon: FiLayers },
    { num: '02', title: 'Customize', desc: 'Choose an aesthetic template and make it yours with colors, layout and personal branding.', icon: FaPalette },
    { num: '03', title: 'Share', desc: 'Share your card through a link, QR code, or let contacts save it directly.', icon: FiShare2 },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-slate-50/50 dark:bg-slate-900/30 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3">Get Started</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get started in minutes — no app download required
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <div className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-emerald-300 dark:from-emerald-500/30 to-transparent" />
                )}
                
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-widest">{step.num}</span>
                <h3 className="text-xl font-semibold mt-2 mb-3">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Public Card Experience Flow */}
        <Reveal delay={0.3} className="mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 lg:p-12">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold mb-2">The Cardly Experience</h3>
              <p className="text-slate-500 dark:text-slate-400">What happens when someone receives your Cardly link</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-0">
              {['Share Card', 'Open Profile', 'View Information', 'Save Contact', 'Connect'].map((step, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    {step}
                  </div>
                  {i < 4 && <FiArrowRight className="hidden sm:block text-slate-300 dark:text-slate-600 my-auto" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// DISCOVERY SECTION
// ═══════════════════════════════════════════════════
function DiscoverySection({ popularCards, hasPopular }) {
  return (
    <section id="discover" className="py-24 sm:py-32 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3">Discover</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Explore the community
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find and connect with professionals across industries
          </p>
        </Reveal>

        {/* Popular Cards */}
        {hasPopular ? (
          <Reveal>
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FiTrendingUp className="text-emerald-500" /> Popular Cards
                </h3>
                <Link to="/discover" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1">
                  View All <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <CardGrid
                cards={popularCards.data}
                loading={popularCards.loading}
                emptyMessage="No popular cards yet"
              />
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <EmptyState
              icon={FiTrendingUp}
              title="Discover Cards"
              description="Be the first to create a card and appear here!"
            />
          </Reveal>
        )}

        {/* CTA */}
        <Reveal delay={0.2}>
          <div className="text-center mt-10">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Explore Cards <FiArrowRight />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// QR SECTION
// ═══════════════════════════════════════════════════
function QRSection() {
  return (
    <section id="qr" className="py-24 sm:py-32 bg-slate-50/50 dark:bg-slate-900/30 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <Reveal direction="left" className="flex-1 max-w-lg">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3">QR Code</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              One scan.
              <br />
              Your complete identity.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              Share your professional identity instantly. Your contacts scan, view your profile and save your details — all in one elegant motion.
            </p>
            <div className="space-y-3">
              {['Instant profile access', 'No app download required', 'Works on any phone camera', 'Save contact with one tap'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal direction="right" className="flex-1 flex justify-center">
            <div className="relative">
              {/* Real QR Code */}
              <div className="w-72 h-80 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="w-full aspect-square rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
                  <QRCodeSVG
                    value={`${window.location.origin}/discover`}
                    size={168}
                    level="M"
                    fgColor="#0f172a"
                    bgColor="transparent"
                    imageSettings={{
                      src: 'data:image/svg+xml;utf8,' + encodeURIComponent(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#10B981"/><text x="14" y="19" font-size="14" font-weight="700" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif">C</text></svg>'
                      ),
                      height: 28,
                      width: 28,
                      excavate: true
                    }}
                  />
                </div>
                <p className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Scan Me</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Save Contact Instantly</p>
              </div>
              {/* Decorative accents */}
              <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full border-2 border-emerald-400" />
              <div className="absolute -bottom-3 -left-3 w-4 h-4 rounded-full bg-emerald-400/20" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// ANALYTICS PREVIEW
// ═══════════════════════════════════════════════════
function AnalyticsPreviewSection() {
  const metrics = [
    { label: 'Card Views', value: '—', icon: FiEye, desc: 'Track who views your profile', color: 'from-blue-500 to-cyan-500' },
    { label: 'Link Clicks', value: '—', icon: FiShare2, desc: 'Monitor link engagement', color: 'from-purple-500 to-violet-500' },
    { label: 'Contact Saves', value: '—', icon: FiDownload, desc: 'See who saves your details', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <Reveal direction="left" className="flex-1 flex justify-center">
            <div className="w-full max-w-sm">
              {/* Analytics Dashboard Preview */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Card Analytics</h4>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10">Live</span>
                  </div>
                </div>
                {/* Metrics */}
                <div className="p-6 space-y-4">
                  {metrics.map((m, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0`}>
                        <m.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
                        <p className="text-lg font-bold">{m.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Chart placeholder */}
                <div className="px-6 pb-6">
                  <div className="h-24 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-end justify-between gap-1 px-4 pb-3">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-teal-400 opacity-60" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">Product UI illustration — real data available after creating a card</p>
            </div>
          </Reveal>

          <Reveal direction="right" className="flex-1 max-w-lg">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3">Analytics</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Understand your impact
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              Real-time analytics show you how your card performs. Track views, clicks, saves and engagement — all from your dashboard.
            </p>
            <div className="space-y-3">
              {['Real-time view tracking', 'Engagement insights', 'Contact save rates', 'Geographic demographics'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// FINAL CTA
// ═══════════════════════════════════════════════════
function FinalCTASection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            
            <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                Make your next introduction unforgettable.
              </h2>
              <p className="text-lg text-emerald-100 max-w-xl mx-auto mb-8">
                Create a professional digital card and share your identity anywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-white text-emerald-700 text-base font-semibold transition-all duration-300 hover:bg-emerald-50 shadow-xl shadow-black/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
                >
                  Create Your Card
                </Link>
                <Link
                  to="/cards/add"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl border border-white/40 text-white text-base font-semibold transition-all duration-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
                >
                  Explore Templates
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// LANDING FOOTER
// ═══════════════════════════════════════════════════
function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="scroll-mt-16 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <Logo className="h-8 w-8" color="#10B981" />
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cardly</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Digital visiting cards for modern professionals. Create, share, and manage your networking presence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/register">Create Card</FooterLink>
              <FooterLink to="/discover">Explore Cards</FooterLink>
              <FooterLink to="/cards/add">Templates</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {year} Cardly. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors">Login</Link>
            <Link to="/register" className="text-xs text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors">Sign Up</Link>
            <a href="https://github.com/suzzaanDEV" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
        {children}
      </Link>
    </li>
  );
}

export default LandingPage;
