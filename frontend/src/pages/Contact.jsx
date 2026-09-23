import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCreditCard, FiMail, FiGithub, FiLinkedin, FiGlobe,
  FiSend, FiClock, FiArrowRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          category: formData.category
        })
      });
      if (res.ok) {
        toast.success('Message sent! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '', category: 'general' });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send message');
      }
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email',
      value: 'sznghimire61@gmail.com',
      link: 'mailto:sznghimire61@gmail.com'
    },
    {
      icon: FiGithub,
      title: 'GitHub',
      value: '@suzzaanDEV',
      link: 'https://github.com/suzzaanDEV'
    },
    {
      icon: FiLinkedin,
      title: 'LinkedIn',
      value: 'Suzan Ghimire',
      link: 'https://linkedin.com'
    },
    {
      icon: FiGlobe,
      title: 'Website',
      value: 'Cardly.app',
      link: 'https://cardly.app'
    }
  ];

  const faqs = [
    {
      question: 'How do I create my first digital business card?',
      answer: 'Simply sign up for a free account, choose a template, and customize it with your information. You can then share it instantly via QR code or link.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! We use enterprise-grade security measures to protect your information. Your data is encrypted and stored securely.'
    },
    {
      question: 'Can I update my card after publishing?',
      answer: 'Absolutely! You can edit and update your card anytime. Changes are reflected instantly for everyone who views your card.'
    },
    {
      question: 'Do you offer custom templates?',
      answer: 'We\'re constantly adding new templates. If you need something specific, feel free to reach out and we\'ll work with you.'
    }
  ];

  const inputClass = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all';
  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2';
  const cardClass = 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8';

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
              Get in Touch
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Have questions, feedback, or want to collaborate? We'd love to hear from you!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className={cardClass}
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className={labelClass}>
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="What's this about?"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className={labelClass}>
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="general" className="bg-white dark:bg-slate-800">General Inquiry</option>
                  <option value="support" className="bg-white dark:bg-slate-800">Support</option>
                  <option value="feedback" className="bg-white dark:bg-slate-800">Feedback</option>
                  <option value="bug" className="bg-white dark:bg-slate-800">Bug Report</option>
                  <option value="partnership" className="bg-white dark:bg-slate-800">Partnership</option>
                  <option value="other" className="bg-white dark:bg-slate-800">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={`${inputClass} resize-none`}
                  placeholder="Tell us more about your inquiry..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-emerald-600/20"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending Message...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                Let's Connect
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Whether you have a question about Cardly, need help with your account,
                or want to explore partnership opportunities, we're here to help.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={index}
                  href={info.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
                  className="flex items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-emerald-500/25">
                    <info.icon className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{info.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{info.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
            >
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Response Time</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We typically respond to all inquiries within 24 hours during business days.
              </p>
              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-sm">Online now</span>
                <FiClock className="w-4 h-4 ml-3 text-emerald-500" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
              <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
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
              to="/about"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              About Cardly
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;