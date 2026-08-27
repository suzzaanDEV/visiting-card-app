import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  className = '',
}) => {
  // Lock scroll on background when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`
              relative w-full ${maxWidth} bg-brand-surface dark:bg-slate-900 border border-brand-border dark:border-slate-800/80
              rounded-2xl p-6 shadow-2xl z-10 overflow-hidden flex flex-col gap-4 ${className}
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-border/60 dark:border-slate-800/80 pb-3">
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-bold text-brand-text dark:text-brand-text/90"
                >
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-brand-textMuted hover:bg-brand-border dark:hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="text-sm text-brand-text dark:text-brand-textMuted/95 leading-relaxed overflow-y-auto max-h-[70vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
export { Modal };
