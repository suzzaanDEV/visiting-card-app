import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiCheck, FiX } from 'react-icons/fi';

const STORAGE_KEY = 'cardly-cookie-consent';

const getStored = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch {
    return null;
  }
};

const CookieConsent = () => {
  const [consent, setConsent] = useState(getStored);

  const choose = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch { /* ignore */ }
    setConsent(value);
  };

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setConsent(getStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AnimatePresence>
      {!consent && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-lg z-[100]"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FiSettings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">We use cookies</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  We use essential cookies and local storage to keep you signed in and remember your
                  preferences. See our{' '}
                  <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Policy</Link>{' '}
                  and{' '}
                  <Link to="/cookie-policy" className="text-emerald-600 dark:text-emerald-400 hover:underline">Cookie Policy</Link>{' '}
                  for details.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                onClick={() => choose('declined')}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <FiX className="inline w-4 h-4 mr-1" /> Decline
              </button>
              <button
                onClick={() => choose('accepted')}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                <FiCheck className="inline w-4 h-4 mr-1" /> Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;