import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { FiDownload, FiX, FiShare2, FiUser, FiMail, FiPhone, FiGlobe, FiMapPin } from 'react-icons/fi';
import { FaQrcode, FaMobile, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import PremiumQRCard, { renderPremiumCardToCanvas } from './PremiumQRCard';

const PREVIEW_W = 480;
const PREVIEW_H = 780;

const QRCodeDisplay = ({ card, isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [cardScale, setCardScale] = useState(0.5);
  const premiumCardRef = useRef(null);
  const previewWrapRef = useRef(null);

  // Keep the premium preview correctly proportioned to whichever space is available.
  const updatePreviewScale = useCallback(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const { clientWidth, clientHeight } = el;
    if (!clientWidth || !clientHeight) return;
    setCardScale(Math.min(1, clientWidth / PREVIEW_W, clientHeight / PREVIEW_H));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePreviewScale();
    const el = previewWrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updatePreviewScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen, updatePreviewScale]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !card) return null;

  const cardUrl = `${window.location.origin}/c/${card.shortLink}`;

  const handleDownloadPremiumPNG = async () => {
    setIsDownloading(true);
    try {
      const qrCanvas = document.querySelector('#qr-code-canvas');
      const qrDataURL = qrCanvas ? qrCanvas.toDataURL('image/png') : null;
      const canvas = await renderPremiumCardToCanvas(card, qrDataURL, 3);
      const link = document.createElement('a');
      link.download = `${(card.fullName || 'card').replace(/\s+/g, '_')}_QR_Premium.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Premium QR downloaded!');
    } catch (error) {
      console.error('Premium PNG download error:', error);
      toast.error('Failed to download');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPremiumSVG = async () => {
    setIsDownloading(true);
    try {
      const container = premiumCardRef.current;
      if (!container) {
        toast.error('Preview not ready');
        return;
      }

      const svgEl = container.querySelector('svg');
      if (!svgEl) {
        toast.error('QR code not ready');
        return;
      }

      const serializer = new XMLSerializer();
      let svgStr = serializer.serializeToString(svgEl);

      if (!svgStr.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgStr = svgStr.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      svgStr = svgStr.replace(/^<svg/, '<?xml version="1.0" encoding="UTF-8"?>\n<svg');

      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${(card.fullName || 'card').replace(/\s+/g, '_')}_QR.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('SVG downloaded!');
    } catch (error) {
      console.error('SVG download error:', error);
      toast.error('Failed to download SVG');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadBasicQR = () => {
    try {
      const canvas = document.querySelector('#qr-code-canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${(card.fullName || 'card').replace(/\s+/g, '_')}_QR.png`;
        link.href = canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR code downloaded!');
      }
    } catch (error) {
      console.error('QR download error:', error);
      toast.error('Failed to download QR');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${card.fullName} - Digital Business Card`,
          text: `Check out ${card.fullName}'s digital business card`,
          url: cardUrl
        });
      } else {
        await navigator.clipboard.writeText(cardUrl);
        toast.success('Link copied!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleSaveToContacts = async () => {
    setIsSavingContact(true);
    try {
      const vCard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${card.fullName}`,
        ...(card.ownerUserId?.avatar || card.avatar ? [`PHOTO;VALUE=URI:${card.ownerUserId?.avatar || card.avatar}`] : []),
        `ORG:${card.company || ''}`,
        `TITLE:${card.jobTitle || ''}`,
        `EMAIL:${card.email || ''}`,
        `TEL:${card.phone || ''}`,
        `URL:${card.website || ''}`,
        `ADR:;;${card.address || ''}`,
        `NOTE:${card.bio || ''}`,
        'END:VCARD'
      ].join('\n');

      const blob = new Blob([vCard], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(card.fullName || 'contact').replace(/\s+/g, '_')}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Contact saved!');
    } catch (error) {
      console.error('Failed to save contact:', error);
      toast.error('Failed to save contact');
    } finally {
      setIsSavingContact(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[140] bg-brand-background/60 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full h-full sm:max-w-6xl sm:h-[calc(100dvh-2rem)] sm:rounded-3xl bg-brand-surface dark:bg-slate-900 shadow-2xl border border-brand-border/40 dark:border-slate-800 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-5 sm:px-8 py-4 sm:py-5 border-b border-brand-border/30 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-xl shrink-0">
                  <FaQrcode className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-brand-text dark:text-white truncate">QR Code</h3>
                  <p className="text-xs text-brand-textMuted dark:text-slate-400 truncate">Preview &amp; download your premium QR card</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close QR preview"
                className="text-brand-textMuted hover:text-brand-text dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-2 rounded-xl hover:bg-brand-border/60 dark:hover:bg-slate-800 shrink-0"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left — Premium QR Preview */}
                <div className="flex flex-col items-center px-5 sm:px-8 py-6 sm:py-8 bg-gradient-to-b from-brand-background/60 to-brand-surface dark:from-slate-900/60 dark:to-slate-900 lg:border-r border-brand-border/30 dark:border-slate-800">
                  <p className="text-xs font-bold text-brand-textMuted dark:text-slate-500 uppercase tracking-widest mb-4 self-start">Preview</p>

                  <div
                    ref={previewWrapRef}
                    className="relative w-full min-h-[300px] sm:min-h-[360px] lg:min-h-[440px] flex-1 flex items-center justify-center"
                  >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div
                        ref={premiumCardRef}
                        style={{ width: PREVIEW_W, height: PREVIEW_H, transform: `scale(${cardScale})`, transformOrigin: 'center center' }}
                      >
                        <PremiumQRCard card={card} qrUrl={cardUrl} />
                      </div>
                    </div>
                  </div>

                  {/* Hidden canvas QR for basic download */}
                  <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <QRCodeCanvas
                      id="qr-code-canvas"
                      value={cardUrl}
                      size={300}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  {/* Download buttons */}
                  <div className="w-full max-w-xs space-y-2.5 mt-5">
                    <button
                      onClick={handleDownloadPremiumPNG}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-5 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all disabled:opacity-50 font-semibold text-sm shadow-lg shadow-amber-600/20"
                    >
                      <FaImage className="w-4 h-4" />
                      {isDownloading ? 'Downloading...' : 'Download Premium QR (PNG)'}
                    </button>

                    <button
                      onClick={handleDownloadPremiumSVG}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center gap-2.5 bg-white dark:bg-slate-700 text-brand-text dark:text-slate-200 border border-brand-border/60 dark:border-slate-600 py-3 px-5 rounded-xl hover:bg-brand-border/40 dark:hover:bg-slate-600 transition-all disabled:opacity-50 font-semibold text-sm"
                    >
                      <FiDownload className="w-4 h-4" />
                      {isDownloading ? 'Downloading...' : 'Download QR (SVG)'}
                    </button>

                    <button
                      onClick={handleDownloadBasicQR}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center gap-2.5 text-brand-textMuted dark:text-slate-500 hover:text-brand-text dark:hover:text-slate-300 py-2 px-4 rounded-xl hover:bg-brand-border/40 dark:hover:bg-slate-800 transition-all text-xs font-medium"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                      Basic QR only
                    </button>
                  </div>
                </div>

                {/* Right — Contact Info & Actions */}
                <div className="p-5 sm:p-8">
                  <h4 className="text-sm font-bold text-brand-textMuted dark:text-slate-500 uppercase tracking-widest mb-5">Contact Information</h4>

                  <div className="space-y-3 mb-6">
                    {card.fullName && (
                      <div className="flex items-center p-3.5 bg-brand-surface dark:bg-slate-800/60 border border-brand-border/30 dark:border-slate-800 rounded-xl">
                        <FiUser className="h-5 w-5 mr-3 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-brand-textMuted dark:text-slate-500 font-semibold uppercase tracking-wide">Name</p>
                          <p className="text-sm font-bold text-brand-text dark:text-white break-words">{card.fullName}</p>
                        </div>
                      </div>
                    )}
                    {card.email && (
                      <div className="flex items-center p-3.5 bg-brand-surface dark:bg-slate-800/60 border border-brand-border/30 dark:border-slate-800 rounded-xl">
                        <FiMail className="h-5 w-5 mr-3 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-brand-textMuted dark:text-slate-500 font-semibold uppercase tracking-wide">Email</p>
                          <a href={`mailto:${card.email}`} className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors break-all">{card.email}</a>
                        </div>
                      </div>
                    )}
                    {card.phone && (
                      <div className="flex items-center p-3.5 bg-brand-surface dark:bg-slate-800/60 border border-brand-border/30 dark:border-slate-800 rounded-xl">
                        <FiPhone className="h-5 w-5 mr-3 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-brand-textMuted dark:text-slate-500 font-semibold uppercase tracking-wide">Phone</p>
                          <a href={`tel:${card.phone}`} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors break-all">{card.phone}</a>
                        </div>
                      </div>
                    )}
                    {card.website && (
                      <div className="flex items-center p-3.5 bg-brand-surface dark:bg-slate-800/60 border border-brand-border/30 dark:border-slate-800 rounded-xl">
                        <FiGlobe className="h-5 w-5 mr-3 text-violet-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-brand-textMuted dark:text-slate-500 font-semibold uppercase tracking-wide">Website</p>
                          <a
                            href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors break-all"
                          >
                            {card.website}
                          </a>
                        </div>
                      </div>
                    )}
                    {card.address && (
                      <div className="flex items-center p-3.5 bg-brand-surface dark:bg-slate-800/60 border border-brand-border/30 dark:border-slate-800 rounded-xl">
                        <FiMapPin className="h-5 w-5 mr-3 text-rose-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-brand-textMuted dark:text-slate-500 font-semibold uppercase tracking-wide">Address</p>
                          <p className="text-sm font-bold text-brand-text dark:text-white break-words">{card.address}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5">
                    <button
                      onClick={handleShare}
                      className="w-full flex items-center justify-center gap-2 bg-brand-border/50 dark:bg-slate-800 text-brand-text dark:text-slate-200 py-3 px-4 rounded-xl hover:bg-brand-border/80 dark:hover:bg-slate-700 transition-colors font-semibold text-sm"
                    >
                      <FiShare2 className="w-4 h-4" />
                      Share Card
                    </button>
                    <button
                      onClick={handleSaveToContacts}
                      disabled={isSavingContact}
                      className="w-full flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 py-3 px-4 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors font-semibold text-sm disabled:opacity-50"
                    >
                      {isSavingContact ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 dark:border-amber-300 border-t-transparent" />
                      ) : (
                        <FaMobile className="w-4 h-4" />
                      )}
                      {isSavingContact ? 'Saving...' : 'Save to Contacts'}
                    </button>
                  </div>

                  {/* Card URL */}
                  <div className="mt-5 p-3 bg-brand-background dark:bg-slate-950 rounded-xl border border-brand-border/30 dark:border-slate-800">
                    <p className="text-[10px] text-brand-textMuted dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Card URL</p>
                    <p className="text-xs text-brand-textMuted dark:text-slate-400 break-all leading-relaxed">{cardUrl}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default QRCodeDisplay;