import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCreditCard, FiZap, FiShield, FiUsers, FiGlobe,
  FiGithub, FiLinkedin, FiMail, FiArrowRight
} from 'react-icons/fi';

const AboutPage = () => {
  const features = [
    {
      icon: FiZap,
      title: 'Fast & Easy',
      description: 'Create professional digital business cards in minutes, not hours.'
    },
    {
      icon: FiShield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security measures.'
    },
    {
      icon: FiUsers,
      title: 'Network Growth',
      description: 'Connect with professionals worldwide and expand your network.'
    },
    {
      icon: FiGlobe,
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
      bio: 'Passionate about creating innovative digital solutions that connect people and businesses.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Cards Created' },
    { number: '5K+', label: 'Happy Users' },
    { number: '50+', label: 'Countries' },
    { number: '99%', label: 'Uptime' }
  ];

  const cardClass = 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-400/10 dark:bg-teal-500/10 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 mb-6">
              <FiCreditCard className="w-8 h-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
              About Cardly
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              We're revolutionizing the way professionals connect and share their information.
              Cardly makes networking effortless, secure, and impactful.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            To empower professionals with modern digital tools that enhance networking,
            foster meaningful connections, and drive business growth in the digital age.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className={cardClass}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
                <feature.icon className="text-white text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cardly by the Numbers
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="text-center"
            >
              <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">{stat.number}</div>
              <div className="text-slate-500 dark:text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Meet the Team
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            The passionate minds behind Cardly, dedicated to creating the best digital networking experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className={cardClass}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
                <FiUsers className="text-white text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{member.name}</h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-3">{member.role}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{member.bio}</p>
              <div className="flex justify-center space-x-3">
                <a
                  href={`mailto:${member.email}`}
                  className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-white hover:bg-emerald-600 transition-colors"
                  title="Email"
                >
                  <FiMail className="text-lg" />
                </a>
                <a
                  href={`https://github.com/${member.github.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-white hover:bg-emerald-600 transition-colors"
                  title="GitHub"
                >
                  <FiGithub className="text-lg" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-white hover:bg-emerald-600 transition-colors"
                  title="LinkedIn"
                >
                  <FiLinkedin className="text-lg" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 sm:p-14 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Ready to Transform Your Networking?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Join thousands of professionals who have already upgraded to digital business cards
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 text-white text-lg font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all duration-300"
            >
              Get Started Today <FiArrowRight />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;