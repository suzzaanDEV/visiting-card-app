import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShield, FiFileText, FiLock, FiCheckCircle, FiClock } from 'react-icons/fi';
import Markdown from '../components/ui/Markdown';

const ICONS = {
  'privacy-policy': FiShield,
  'terms-of-service': FiFileText,
  'cookie-policy': FiLock,
};

const PolicyPage = ({ slug }) => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const Icon = ICONS[slug] || FiFileText;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/policies/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Policy not found');
        const data = await res.json();
        if (active) setPolicy(data);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug]);

  const effectiveDate = policy?.effectiveDate
    ? new Date(policy.effectiveDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

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
              <Icon className="w-8 h-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
              {policy?.title || (loading ? 'Loading...' : 'Policy')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {policy?.summary || 'Cardly legal and policy information.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              {(effectiveDate || policy?.version) && (
                <span className="inline-flex items-center gap-1.5">
                  <FiClock className="w-4 h-4 text-emerald-500" />
                  Effective {effectiveDate || 'today'} · Version {policy?.version || '1.0'}
                </span>
              )}
              {policy?.isRequired && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                  <FiCheckCircle className="w-3.5 h-3.5" /> Requires acceptance
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-8"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Cardly
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10">
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📄</div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {error.startsWith('Policy not found') ? 'This policy has not been published yet' : 'Something went wrong'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {error.startsWith('Policy not found')
                  ? 'The administrator has not published this document yet. Please check back soon.'
                  : 'We could not load this document. Please try again later.'}
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" /> Back Home
              </Link>
            </div>
          )}

          {policy && !loading && (
            <Markdown content={policy.content} />
          )}
        </div>

        <p className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
          Questions about this document? Reach out via the{' '}
          <Link to="/contact" className="text-emerald-600 dark:text-emerald-400 hover:underline">Contact page</Link>.
        </p>
      </div>
    </div>
  );
};

export default PolicyPage;