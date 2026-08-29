import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  FiX, FiMail, FiPhone, FiGlobe, FiMapPin, FiBriefcase,
  FiEye, FiHeart, FiShare2, FiDownload, FiCopy,
  FiCheck, FiExternalLink, FiTrash2
} from 'react-icons/fi';
import CardRenderer from '../Cards/CardRenderer';
import { API_BASE_URL } from '../../services/apiService';

const QuickViewModal = ({ card, isOpen, onClose, onViewFull, onRemove }) => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const [fullCard, setFullCard] = useState(card);
  const [copied, setCopied] = useState(null);
  const closeButtonRef = useRef(null);

  // Fetch the full card so the preview renders with its real design
  useEffect(() => {
    let cancelled = false;
    if (card?._id && isOpen) {
      fetch(`${API_BASE_URL}/cards/public/view/${card._id}`)
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (!cancelled && data) setFullCard(data.card || data);
        })
        .catch(() => {});
    } else {
      setFullCard(card);
    }
    return () => { cancelled = true; };
  }, [card, isOpen]);

  // Focus + scroll lock + escape for accessibility
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => closeButtonRef.current?.focus(), 80);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const name = fullCard?.fullName || card?.fullName || 'Unknown Person';
  const title = fullCard?.jobTitle || card?.jobTitle || 'Professional';
  const company = fullCard?.company || card?.company;
  const email = fullCard?.email || card?.email;
  const phone = fullCard?.phone || card?.phone;
  const website = fullCard?.website || card?.website;
  const address = fullCard?.address || card?.address;

  const cardUrl = card?.shortLink
    ? `${window.location.origin}/c/${card.shortLink}`
    : card?._id
      ? `${window.location.origin}/view/${card._id}`
      : '#';

  const contactRows = [
    { key: 'email', icon: FiMail, label: 'Email', value: email },
    { key: 'phone', icon: FiPhone, label: 'Phone', value: phone },
    { key: 'website', icon: FiGlobe, label: 'Website', value: website },
    { key: 'address', icon: FiMapPin, label: 'Address', value: address },
  ].filter(r => r.value);

  const getInitials = (n) => (n || '?')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const copyToClipboard = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  const handleShare = async () => {
    const text = `Check out ${name}'s digital business card on Cardly`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} — Digital Business Card`, text, url: cardUrl });
      } else {
        await navigator.clipboard.writeText(cardUrl);
        setCopied('link');
        toast.success('Link copied to clipboard!');
      }
    } catch {
      // user cancelled share
    }
  };

  const handleSaveToContacts = () => {
    const avatar = fullCard?.ownerUserId?.avatar || card?.ownerUserId?.avatar;
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      ...(avatar ? [`PHOTO;VALUE=URI:${avatar}`] : []),
      `ORG:${company || ''}`,
      `TITLE:${title || ''}`,
      `EMAIL:${email || ''}`,
      `TEL:${phone || ''}`,
      `URL:${website || ''}`,
      `ADR:;;${address || ''}`,
      'END:VCARD'
    ].join('\n');

    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Contact saved to device!');
  };

  const handleViewFull = () => {
    if (onViewFull) {
      onViewFull();
      return;
    }
    if (card?.shortLink) {
      navigate(`/c/${card.shortLink}`);
      onClose();
    } else if (cardUrl !== '#') {
      window.open(cardUrl, '_blank');
    }
  };

  const renderCard = fullCard || card;
  const theme = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.96, y: 16 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 16 },
      };

  return (
    <AnimatePresence>
      {isOpen && card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            {...theme}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quickview-title"
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200/70 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <FiEye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 id="quickview-title" className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Quick View</h2>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Saved card preview</p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close quick view"
              >
                <FiX className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-6 p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {/* Card preview */}
              <div className="md:col-span-2">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40">
                    <CardRenderer card={renderCard} className="w-full h-full" />
                  </div>
                </div>
              </div>

              {/* Info + actions */}
              <div className="md:col-span-3 flex flex-col mt-5 md:mt-0">
                {/* Identity */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-md shadow-emerald-500/20 overflow-hidden">
                    {fullCard?.ownerUserId?.avatar ? (
                      <img src={fullCard.ownerUserId.avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate leading-tight">{name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {title}
                      {company && (
                        <>
                          <FiBriefcase className="inline w-3 h-3 mx-1 -mt-0.5 opacity-50" />
                          {company}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Contact rows */}
                <div className="mt-5 space-y-1">
                  {contactRows.map(({ key, icon: Icon, label, value }) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">{label}</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200 truncate">{value}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(key, value)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
                        aria-label={`Copy ${label}`}
                      >
                        {copied === key ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiCopy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Stats + QR row */}
                <div className="mt-5 flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex gap-5">
                    <Stat icon={FiEye} value={renderCard?.views || 0} label="Views" />
                    <Stat icon={FiHeart} value={renderCard?.loveCount || 0} label="Loves" />
                    <Stat icon={FiShare2} value={renderCard?.shares || 0} label="Shares" />
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center">
                      <QRCodeSVG
                        value={cardUrl}
                        size={48}
                        level="M"
                        fgColor="#0f172a"
                        bgColor="transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={handleViewFull}
                    className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  >
                    <FiExternalLink className="w-4 h-4" /> View Full Details
                  </button>
                  <button
                    onClick={handleSaveToContacts}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <FiDownload className="w-3.5 h-3.5" /> Save Contact
                  </button>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {copied === 'link' ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiShare2 className="w-3.5 h-3.5" />} Copy Link
                  </button>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(card._id)}
                      className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" /> Remove from Library
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Stat = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-1.5">
    <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
    <div>
      <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">{value}</p>
      <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{label}</p>
    </div>
  </div>
);

export default QuickViewModal;