import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaIdCard, FaRocket, FaShieldAlt, FaUsers, FaGlobe, FaHeart,
  FaGithub, FaLinkedin, FaTwitter, FaEnvelope
} from 'react-icons/fa';
import UnifiedNavigation from '../components/Layout/UnifiedNavigation';

const AboutPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: FaRocket,
      title: 'Fast & Easy',
      description: 'Create professional digital business cards in minutes, not hours.'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security measures.'
    },
    {
      icon: FaUsers,
      title: 'Network Growth',
      description: 'Connect with professionals worldwide and expand your network.'
    },
    {
      icon: FaGlobe,
      title: 'Global Reach',
      description: 'Share your card instantly with anyone, anywhere in the world.'
    }
  ];

  const team = [
    {
      name: 'Suzan Ghimire',
      role: 'Founder & Developer',
      email: 'sznghimire61@gmail.com',
      github: '@suzzaanDEV',
      image: null,
      bio: 'Passionate about creating innovative digital solutions that connect people and businesses.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Cards Created' },
    { number: '5K+', label: 'Happy Users' },
    { number: '50+', label: 'Countries' },
    { number: '99%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <UnifiedNavigation />
      
      {/* Hero Section */}
      <section className="relative py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FaIdCard className="text-white text-3xl" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About Cardly
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We're revolutionizing the way professionals connect and share their information. 
                              Cardly makes networking effortless, secure, and impactful.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              To empower professionals with modern digital tools that enhance networking, 
              foster meaningful connections, and drive business growth in the digital age.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
                            <h2 className="text-4xl font-bold text-white mb-6">Cardly by the Numbers</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Meet the Team</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                              The passionate minds behind Cardly, dedicated to creating the best digital networking experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUsers className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-gray-300 mb-4">{member.role}</p>
                <p className="text-gray-400 text-sm mb-6">{member.bio}</p>
                <div className="flex justify-center space-x-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Email"
                  >
                    <FaEnvelope className="text-lg" />
                  </a>
                  <a
                    href={`https://github.com/${member.github.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="GitHub"
                  >
                    <FaGithub className="text-lg" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="LinkedIn"
                  >
                    <FaLinkedin className="text-lg" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Networking?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of professionals who have already upgraded to digital business cards
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 inline-flex items-center justify-center"
              >
                Get Started Today
              </Link>
              <Link
                to="/contact"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaIdCard className="h-8 w-8 text-white mr-3" />
                              <span className="text-2xl font-bold text-white">Cardly</span>
            </div>
            <p className="text-gray-400 mb-4">
              Made with <FaHeart className="inline text-red-500" /> by Suzan Ghimire
            </p>
            <p className="text-sm text-gray-500">
              Contact: sznghimire61@gmail.com | GitHub: @suzzaanDEV
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
