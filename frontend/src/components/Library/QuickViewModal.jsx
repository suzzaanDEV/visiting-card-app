import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEye, FiMail, FiPhone, FiGlobe, FiMapPin, FiUser, FiBriefcase } from 'react-icons/fi';
import CardPreview from '../Cards/CardPreview';

const QuickViewModal = ({ card, isOpen, onClose, onViewFull }) => {
  if (!card || !isOpen) return null;

  const getCardData = (c) => {
    if (!c) return null;
    return {
      fullName: c.fullName || c.ownerUserId?.name || 'Your Name',
      jobTitle: c.jobTitle || c.ownerUserId?.jobTitle || 'Job Title',
      company: c.company || c.ownerUserId?.company || 'Company',
      email: c.email || c.ownerUserId?.email || 'email@example.com',
      phone: c.phone || c.ownerUserId?.phone || '+(977) 9xxxxxxxxx',
      website: c.website || c.ownerUserId?.website || 'www.example.com',
      address: c.address || c.ownerUserId?.location || 'Address',
      bio: c.bio || c.ownerUserId?.bio || 'Bio description'
    };
  };

  const cardData = getCardData(card);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-brand-surface dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-brand-border/40 dark:border-slate-800/80"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-brand-border/40 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiEye className="h-5 w-5 text-brand-primary dark:text-emerald-400 mr-2" />
                <h2 className="text-lg font-semibold text-brand-text dark:text-white">Quick View</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-brand-textMuted hover:text-brand-text dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Preview */}
              <div>
                <h3 className="text-sm font-medium text-brand-text dark:text-white mb-3">Card Preview</h3>
                <div className="bg-brand-background dark:bg-slate-950 rounded-lg p-4">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden">
                    <CardPreview
                      card={card}
                      template={{ id: card.templateId }}
                      className="w-full h-full"
                      showActions={false}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div>
                <h3 className="text-sm font-medium text-brand-text dark:text-white mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {[
                    { icon: FiUser, label: 'Full Name', value: cardData.fullName },
                    { icon: FiBriefcase, label: 'Job Title', value: cardData.jobTitle },
                    { icon: FiBriefcase, label: 'Company', value: cardData.company },
                    { icon: FiMail, label: 'Email', value: cardData.email },
                    { icon: FiPhone, label: 'Phone', value: cardData.phone },
                    { icon: FiGlobe, label: 'Website', value: cardData.website },
                    ...(cardData.address ? [{ icon: FiMapPin, label: 'Address', value: cardData.address }] : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center">
                      <Icon className="h-4 w-4 text-brand-textMuted dark:text-slate-500 mr-3" />
                      <div>
                        <p className="text-xs text-brand-textMuted dark:text-slate-400">{label}</p>
                        <p className="text-sm font-medium text-brand-text dark:text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={onViewFull}
                    className="flex-1 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    View Full Details
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-brand-textMuted dark:text-slate-400 border border-brand-border dark:border-slate-700 rounded-lg hover:bg-brand-background dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
