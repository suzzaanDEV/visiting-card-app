import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiShield, FiCheckCircle, FiExternalLink } from 'react-icons/fi';

const POLICY_ROUTE = {
  'privacy-policy': '/privacy',
  'terms-of-service': '/terms',
  'cookie-policy': '/cookie-policy',
};

const fetchWithTimeout = (url, options = {}, ms = 10000) =>
  fetch(url, { ...options, signal: AbortSignal.timeout(ms) });

// Refetch requirement — if a required policy version bumps, we re-ask.
const acceptsPolicy = (policy, checked) => {
  const c = checked[policy.slug];
  if (!c || c.accepted !== true) return false;
  if (c.version != null && policy.version != null) return String(c.version) === String(policy.version);
  return true;
};

const PolicyAgreement = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [required, setRequired] = useState([]);
  const [checked, setChecked] = useState({});
  const [open, setOpen] = useState(false);
  const [accepting, setAccepting] = useState({});

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    const token = localStorage.getItem('token');

    (async () => {
      try {
        const res = await fetchWithTimeout('/api/policies', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const list = await res.json();
        const reqPolicies = (Array.isArray(list) ? list : []).filter((p) => p.isRequired && p.isPublished);

        const status = {};
        await Promise.all(
          reqPolicies.map(async (p) => {
            try {
              const r = await fetchWithTimeout(`/api/policies/${p.slug}/check`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              if (r.ok) status[p.slug] = await r.json();
            } catch { /* ignore */ }
          })
        );
        if (!active) return;
        setChecked(status);
        setRequired(reqPolicies);
        const pending = reqPolicies.filter((p) => !acceptsPolicy(p, status));
        setOpen(pending.length > 0);
      } catch { /* ignore */ }
    })();

    return () => { active = false; };
  }, [isAuthenticated, user?.id, user?._id]);

  const handleAccept = async (slug) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setAccepting((prev) => ({ ...prev, [slug]: true }));
    try {
      const res = await fetchWithTimeout(`/api/policies/${slug}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to record acceptance');
      const body = await res.json().catch(() => ({}));
      const version = body?.policy?.version || required.find((x) => x.slug === slug)?.version;
      const nextChecked = { ...checked, [slug]: { accepted: true, version } };
      setChecked(nextChecked);
      const stillPending = required.some((p) => !acceptsPolicy(p, nextChecked));
      if (!stillPending) {
        setOpen(false);
        toast.success('Thank you for accepting the terms');
      }
    } catch (err) {
      toast.error(err.message || 'Could not record acceptance');
    } finally {
      setAccepting((prev) => ({ ...prev, [slug]: false }));
    }
  };

  if (!open || required.length === 0) return null;

  const pending = required.filter((p) => !acceptsPolicy(p, checked));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md z-[200]"
          role="dialog"
          aria-label="Accept required policies"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <FiShield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Accept the terms</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  To keep using Cardly, please review and accept the following{' '}
                  {pending.length > 1 ? 'documents' : 'document'}.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {pending.map((p) => (
                <div
                  key={p.slug}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {p.title}
                      <span className="font-normal text-slate-500 dark:text-slate-400"> · v{p.version}</span>
                    </p>
                    <a
                      href={POLICY_ROUTE[p.slug] || `/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      <FiExternalLink className="w-3 h-3" /> Read full
                    </a>
                  </div>
                  <button
                    onClick={() => handleAccept(p.slug)}
                    disabled={accepting[p.slug]}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                  >
                    {accepting[p.slug] ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <FiCheckCircle className="w-4 h-4" />
                    )}
                    {accepting[p.slug] ? 'Saving...' : 'Accept'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PolicyAgreement;